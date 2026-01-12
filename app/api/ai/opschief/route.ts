import { NextRequest, NextResponse } from 'next/server';
import { emitSignalsFromInsights } from '@/lib/ai/signals';
import { getRallyLLMClient, isRallyLLMConfigured } from '@/lib/ai/rally-llm-client';
import { APPROVAL_ITEMS } from '@/lib/data/synthetic/governance-approvals.data';
import { ALL_GOVERNANCE_DOCUMENTS } from '@/lib/data/synthetic/governance-documents.data';
import { CASE_ITEMS } from '@/lib/data/synthetic/cases.data';
import { AUDIT_EVENTS } from '@/lib/data/synthetic/audit.data';
import { requireActor } from '@/lib/security/actor';
import { requireTenantContext } from '@/lib/security/require-tenant';
import { rateLimitOrThrow } from '@/lib/security/rate-limit';
import { AI_GUARDRAILS, createAbortController } from '@/lib/security/guardrails';
import { isSecurityError } from '@/lib/security/errors';

// Telemetry logging helper
function logTelemetry(event: Record<string, any>) {
  console.log('[SGM Telemetry]', JSON.stringify(event, null, 2));
  // TODO: Store in database or send to central telemetry service
}

interface OpsChiefInsight {
  id: string;
  type: 'alert' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  severity: 'critical' | 'high' | 'medium' | 'low';
  actionable: boolean;
  suggestedAction?: string;
}

interface OpsChiefRequest {
  tenantId?: string;
  department?: string;
  forceRefresh?: boolean;
}

/**
 * GET /api/ai/opschief
 *
 * Endpoint for OpsChief governance insights
 * Analyzes governance data and generates alerts/warnings
 *
 * Query params:
 * - tenantId: Tenant ID (default: "platform")
 * - department: Filter insights by department (optional)
 * - forceRefresh: Force fresh analysis instead of cache (default: false)
 *
 * Response:
 * - insights: Array of { type, title, description, severity, actionable }
 * - generatedAt: ISO timestamp
 * - nextRefresh: ISO timestamp for automatic refresh
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const actor = requireTenantContext(await requireActor());
    rateLimitOrThrow(
      `${actor.tenantId}:${actor.userId}:/api/ai/opschief`,
      {
        perMinute: Number(process.env.AI_RATE_LIMIT_PER_MINUTE || '30'),
        perDay: Number(process.env.AI_RATE_LIMIT_PER_DAY || '1000'),
      }
    );

    const tenantId = actor.tenantId;
    const department = searchParams.get('department');
    const forceRefresh = searchParams.get('forceRefresh') === 'true';

    // Fetch governance data for analysis (using synthetic data)
    const pendingApprovals = APPROVAL_ITEMS.filter(a => a.status === 'PENDING');
    const slaAtRisk = APPROVAL_ITEMS.filter(a => a.slaStatus === 'AT_RISK');
    const activeCases = CASE_ITEMS.filter(c => c.status === 'UNDER_REVIEW' || c.status === 'PENDING_INFO' || c.status === 'ESCALATED');
    const policies = ALL_GOVERNANCE_DOCUMENTS.filter(d => d.documentType === 'POLICY');
    const recentAudit = AUDIT_EVENTS[0];

    // Calculate governance health metrics
    const totalDocuments = ALL_GOVERNANCE_DOCUMENTS.length;
    const approvedDocs = ALL_GOVERNANCE_DOCUMENTS.filter(d => d.status === 'APPROVED').length;
    const draftDocs = ALL_GOVERNANCE_DOCUMENTS.filter(d => d.status === 'DRAFT').length;

    // Build analysis prompt for LLM
    const analysisPrompt = `You are OpsChief, an AI governance assistant for the Sales Governance Manager (SGM) SPARCC platform.

## Current Governance Snapshot
**Total Documents**: ${totalDocuments} (${approvedDocs} approved, ${draftDocs} draft)
**Pending Approvals**: ${pendingApprovals.length}
**SLA At Risk**: ${slaAtRisk.length}
**Active Cases**: ${activeCases.length}
**Active Policies**: ${policies.length}
**Last Governance Activity**: ${recentAudit?.timestamp || 'N/A'}

## Pending Approvals Requiring Attention
${pendingApprovals
  .slice(0, 5)
  .map(
    (a) => `
- **${a.documentCode || a.type}**: ${a.title}
  - Committee: ${a.committee}
  - SLA Status: ${a.slaStatus}
  - Submitted: ${a.requestedAt}
  - Priority: ${a.priority}
`
  )
  .join('')}

## Active Cases
${activeCases
  .slice(0, 3)
  .map(
    (c) => `
- **${c.caseNumber}**: ${c.title}
  - Type: ${c.type}
  - Priority: ${c.priority}
  - Status: ${c.status}
`
  )
  .join('')}

## Your Role
Analyze this governance data and identify:
1. **Alerts** ([ALERT]) - Critical governance issues requiring immediate attention
2. **Warnings** ([WARN]) - At-risk situations that need monitoring
3. **Info** ([INFO]) - Positive updates and governance health indicators

## Analysis Framework
**Approval Velocity**: SLA compliance, bottlenecks in approval workflows
**Compliance Health**: Policy coverage, expiring documents, audit findings
**Case Management**: Dispute resolution time, exception request volume
**Policy Governance**: Version control, effective dating, ownership clarity
**Risk Indicators**: SLA breaches, unapproved policies, compliance gaps

## Output Format
Return valid JSON array with this structure (NO markdown, pure JSON):
[
  {
    "id": "insight_1",
    "type": "alert|warning|info",
    "title": "Brief title",
    "description": "Actionable description with specific metrics",
    "severity": "critical|high|medium|low",
    "actionable": true|false,
    "suggestedAction": "Specific action to take"
  }
]

Generate 3-5 governance insights based on the data above. Be specific with metrics and actionable recommendations.`;

    // Use Rally LLaMA if configured, otherwise fallback to Claude
    const startTime = Date.now();
    let analysisContent: string;
    let modelUsed: string;
    let tokensUsed: { input: number; output: number; total: number };

    if (isRallyLLMConfigured()) {
      // Call Rally LLaMA for governance analysis (SPM-tuned for compensation governance)
      const rallyClient = getRallyLLMClient();
      const clientStatus = rallyClient.getStatus();

      console.log(`[TOOL] [OpsChief/SGM] Using LLM: ${clientStatus.model} (Rally)`);

      const analysisResponse = await rallyClient.chat(
        [
          {
            role: 'user',
            content: analysisPrompt,
          },
        ],
        {
          maxTokens: AI_GUARDRAILS.maxOutputTokens,
          temperature: 0.5,
        }
      );

      analysisContent = analysisResponse.content;
      modelUsed = clientStatus.model;
      tokensUsed = analysisResponse.tokensUsed;
    } else {
      // Fallback to Claude API (if configured) or static insights
      console.log(`[TOOL] [OpsChief/SGM] Checking for Claude API key...`);

      if (!process.env.ANTHROPIC_API_KEY) {
        // No API key - return static insights
        console.log(`[TOOL] [OpsChief/SGM] No API key configured - using static insights`);

        analysisContent = JSON.stringify([
          {
            id: 'insight_1',
            type: 'alert',
            title: `${slaAtRisk.length} Approvals At Risk of SLA Breach`,
            description: `${slaAtRisk.length} approval requests are approaching their SLA deadlines. Immediate review recommended to avoid governance compliance issues.`,
            severity: 'high',
            actionable: true,
            suggestedAction: 'Review pending approvals in SLA dashboard and prioritize at-risk items for committee review.',
          },
          {
            id: 'insight_2',
            type: 'warning',
            title: `${activeCases.length} Active Cases Require Attention`,
            description: `${activeCases.length} compensation cases (disputes and exceptions) are currently under review. Average resolution time is tracking above target SLA.`,
            severity: 'medium',
            actionable: true,
            suggestedAction: 'Escalate high-priority cases to CRB for expedited resolution.',
          },
          {
            id: 'insight_3',
            type: 'info',
            title: 'Governance Health: Strong',
            description: `${approvedDocs} out of ${totalDocuments} documents are approved and current. Policy coverage is comprehensive across all SPARCC framework areas.`,
            severity: 'low',
            actionable: false,
          },
          {
            id: 'insight_4',
            type: 'warning',
            title: `${draftDocs} Draft Documents Pending Approval`,
            description: `${draftDocs} governance documents are in draft status and awaiting approval workflow completion. Consider scheduling next committee review session.`,
            severity: 'medium',
            actionable: true,
            suggestedAction: 'Schedule SGCC meeting to review draft policy documents and move to approval stage.',
          },
        ]);

        modelUsed = 'static-fallback';
        tokensUsed = { input: 0, output: 0, total: 0 };
      } else {
        // Claude API configured - use it
        console.log(`[TOOL] [OpsChief/SGM] Using LLM: Claude Opus 4.5 (Fallback)`);

        const { signal, cleanup } = createAbortController(AI_GUARDRAILS.requestTimeoutMs);
        let claudeResponse: Response;

        try {
          claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.ANTHROPIC_API_KEY,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-opus-4-5-20251101',
              max_tokens: AI_GUARDRAILS.maxOutputTokens,
              temperature: 0.5,
              messages: [
                {
                  role: 'user',
                  content: analysisPrompt,
                },
              ],
            }),
            signal,
          });
        } finally {
          cleanup();
        }

        if (!claudeResponse.ok) {
          const error = await claudeResponse.text();
          throw new Error(`Claude API error: ${claudeResponse.status} - ${error}`);
        }

        const claudeData = (await claudeResponse.json()) as any;
        analysisContent = claudeData.content?.[0]?.text || '';
        modelUsed = 'claude-opus-4-5-20251101';
        tokensUsed = {
          input: claudeData.usage?.input_tokens || 0,
          output: claudeData.usage?.output_tokens || 0,
          total: (claudeData.usage?.input_tokens || 0) + (claudeData.usage?.output_tokens || 0),
        };
      }
    }

    const endTime = Date.now();

    if (!analysisContent) {
      throw new Error('LLM returned empty content');
    }

    // Parse insights from response
    let insights: OpsChiefInsight[] = [];
    try {
      // Extract JSON from response (LLM might include markdown formatting)
      const jsonMatch = analysisContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        insights = parsed.map((insight: any, idx: number) => ({
          id: insight.id || `insight_${idx}`,
          type: insight.type || 'info',
          title: insight.title || 'Update',
          description: insight.description || '',
          timestamp: new Date(),
          severity: insight.severity || 'medium',
          actionable: insight.actionable !== false,
          suggestedAction: insight.suggestedAction,
        }));
      }
    } catch (parseError) {
      console.error('Failed to parse insights JSON:', parseError);
      // Fallback: create generic insight if parsing fails
      insights = [
        {
          id: 'insight_0',
          type: 'info',
          title: 'Governance Analysis Complete',
          description: analysisContent.substring(0, 200),
          timestamp: new Date(),
          severity: 'low',
          actionable: false,
        },
      ];
    }

    // Log telemetry event - OpsChief analysis completed
    logTelemetry({
      name: 'ai.request',
      appId: 'sgm-sparcc',
      tenantId: tenantId,
      ts: new Date().toISOString(),
      metrics: {
        modelId: modelUsed,
        modelType: isRallyLLMConfigured() ? 'rally-llama-spm' : 'claude-sonnet',
        intent: 'sgm_governance_analysis',
        analysisType: 'opschief',
        department: department || 'all',
        inputTokens: tokensUsed.input,
      },
    });

    logTelemetry({
      name: 'ai.response',
      appId: 'sgm-sparcc',
      tenantId: tenantId,
      ts: new Date().toISOString(),
      metrics: {
        insightCount: insights.length,
        documentsAnalyzed: totalDocuments,
        pendingApprovals: pendingApprovals.length,
        activeCases: activeCases.length,
        responseTime: `${endTime - startTime}ms`,
        outputTokens: tokensUsed.output,
        totalTokens: tokensUsed.total,
        success: true,
      },
    });

    // Emit signals from insights
    const emittedSignals = await emitSignalsFromInsights(insights, 'opschief');

    logTelemetry({
      name: 'ai.signal_emitted',
      appId: 'sgm-sparcc',
      tenantId: tenantId,
      ts: new Date().toISOString(),
      metrics: {
        signalCount: emittedSignals.length,
        insightCount: insights.length,
        criticalSignals: emittedSignals.filter((s) => s.severity === 'critical').length,
      },
    });

    // Log additional context
    console.log('OpsChief governance analysis:', {
      department: department || 'all',
      insightCount: insights.length,
      signalsEmitted: emittedSignals.length,
      documentsAnalyzed: totalDocuments,
      pendingApprovals: pendingApprovals.length,
      activeCases: activeCases.length,
    });

    return NextResponse.json({
      insights,
      signals: emittedSignals.map((s) => ({
        id: s.id,
        category: s.category,
        severity: s.severity,
        title: s.title,
      })),
      generatedAt: new Date().toISOString(),
      nextRefresh: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
      metadata: {
        documentsAnalyzed: totalDocuments,
        pendingApprovals: pendingApprovals.length,
        activeCases: activeCases.length,
        department: department || 'all',
        signalsEmitted: emittedSignals.length,
      },
    });
  } catch (error) {
    if (isSecurityError(error)) {
      return NextResponse.json(
        { error: error.code, details: error.message },
        { status: error.status }
      );
    }
    console.error('OpsChief/SGM error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    // Log telemetry event - OpsChief error
    logTelemetry({
      name: 'api.error',
      appId: 'sgm-sparcc',
      tenantId: 'platform',
      ts: new Date().toISOString(),
      metrics: {
        endpoint: '/api/ai/opschief',
        errorClass: error instanceof Error ? error.name : 'UNKNOWN',
        statusCode: 500,
      },
    });

    return NextResponse.json(
      {
        error: 'Failed to generate governance insights',
        details: errorMessage,
        insights: [],
      },
      { status: 500 }
    );
  }
}
