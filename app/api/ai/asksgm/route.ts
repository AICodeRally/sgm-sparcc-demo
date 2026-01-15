import { NextRequest, NextResponse } from 'next/server';
import { getRallyLLMClient, isRallyLLMConfigured } from '@/lib/ai/rally-llm-client';
// AICR Platform client for expert hierarchy (SGM → SPARCC → Summit → Platform)
import { getAICRClient, isAICRConfigured, type AskSGMResponse } from '@/lib/aicr';
// Real governance knowledge base (replaces synthetic mock data)
import {
  GOVERNANCE_POLICIES,
  RISK_TRIGGERS,
  JURISDICTIONS,
  PATCH_TEMPLATES,
  buildGovernanceRAGContext,
  GOVERNANCE_KNOWLEDGE_SUMMARY,
  getPolicyByCode,
  getRequirementById,
  getCriticalRequirements,
  getPatchTemplate,
} from '@/lib/governance/knowledge-base';
// Document library with policies, templates, and analysis
import {
  ALL_GOVERNANCE_DOCUMENTS,
  POLICY_DOCUMENTS,
  TEMPLATE_DOCUMENTS,
  PATCH_TEMPLATE_DOCUMENTS,
  ANALYSIS_STATISTICS,
  buildDocumentLibrarySummary,
  searchDocuments,
  getDocumentByCode,
} from '@/lib/governance/document-library';
// Complete 21-policy library v2 with Gold Standard Language
import {
  ALL_POLICIES_V2,
  POLICY_LIBRARY_V2_SUMMARY,
  buildPolicyLibraryRAGContext,
  getPolicyByCodeV2,
  getCriticalPoliciesV2,
  getHighPoliciesV2,
} from '@/lib/governance/policy-library-v2';
// Bounded operator flavor config for AskSGM
import {
  buildAskSGMSystemPrompt,
  ALLOWED_DELIVERABLES,
  type DeliverableType,
  type CycleState,
  type RequesterRole,
} from '@/lib/governance/asksgm-flavor-config';
// Unified RAG knowledge base with citations
import {
  loadRAGKnowledgeBase,
  buildFullRAGContext,
  getCriticalPolicies as getRAGCriticalPolicies,
  searchPolicies,
  getPolicyByCode as getRAGPolicyByCode,
} from '@/lib/governance/rag-knowledge-loader';
import { loadPageKbByPath } from '@/lib/ui-kb/loader';
import { requireActor } from '@/lib/security/actor';
import { requireTenantContext } from '@/lib/security/require-tenant';
import { rateLimitOrThrow } from '@/lib/security/rate-limit';
import {
  AI_GUARDRAILS,
  createAbortController,
  enforceMessageLimits,
  parseJsonWithLimit,
} from '@/lib/security/guardrails';
import { isSecurityError } from '@/lib/security/errors';

// Telemetry logging helper
function logTelemetry(event: Record<string, any>) {
  console.log('[SGM Telemetry]', JSON.stringify(event, null, 2));
  // TODO: Store in database or send to central telemetry service
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AskSGMRequest {
  messages: Message[];
  tenantId?: string;
  department?: string;
  // Bounded operator context fields
  cycleState?: CycleState;
  jurisdiction?: string;
  userRole?: RequesterRole;
  context?: {
    currentPage?: string;
    documentCode?: string;
    approvalId?: string;
    // Evidence context for governance decisions
    transactionId?: string;
    repId?: string;
    planYear?: number;
  };
}

/**
 * POST /api/ai/asksgm
 *
 * Endpoint for AskSGM stateful conversation with memory
 * Maintains conversation history and provides governance intelligence
 *
 * Request body:
 * - messages: Array of { role, content } for conversation history
 * - tenantId: Tenant ID (default: "platform")
 * - department: Current department context (sales, legal, compliance)
 * - context: Page/entity context for relevant responses
 *
 * Response:
 * - text: Assistant's response
 * - tokens: { input, output }
 * - timestamp: ISO timestamp
 */
export async function POST(request: NextRequest) {
  try {
    const actor = requireTenantContext(await requireActor());
    rateLimitOrThrow(
      `${actor.tenantId}:${actor.userId}:/api/ai/asksgm`,
      {
        perMinute: Number(process.env.AI_RATE_LIMIT_PER_MINUTE || '30'),
        perDay: Number(process.env.AI_RATE_LIMIT_PER_DAY || '1000'),
      }
    );

    const body = await parseJsonWithLimit<AskSGMRequest>(request, AI_GUARDRAILS.maxBodyBytes);
    const tenantId = actor.tenantId;
    const messages = body.messages || [];

    enforceMessageLimits(messages, AI_GUARDRAILS);

    // Load unified RAG knowledge base with all policies, procedures, controls, evidence
    const ragKnowledgeBase = loadRAGKnowledgeBase();
    const fullRAGContext = buildFullRAGContext();

    // Build RAG context from REAL governance knowledge base
    const ragContext = buildGovernanceRAGContext();
    const documentLibrarySummary = buildDocumentLibrarySummary();
    const criticalReqs = getCriticalRequirements();

    // Build v2 policy library context (21 policies with Gold Standard Language)
    const policyLibraryContext = buildPolicyLibraryRAGContext();
    const criticalPoliciesV2 = getCriticalPoliciesV2();
    const highPoliciesV2 = getHighPoliciesV2();

    const pageKb = body.context?.currentPage
      ? await loadPageKbByPath(body.context.currentPage)
      : null;

    const pageKbContext = pageKb
      ? `## UI Page Guide
- Route: ${pageKb.route}
- Title: ${pageKb.meta.title || 'Unknown'}
- Description: ${pageKb.meta.description || 'No description'}

${pageKb.content}`
      : `## UI Page Guide
No page guide found for ${body.context?.currentPage || 'current page'}.`;

    // Calculate real statistics from unified RAG
    const totalRequirements = GOVERNANCE_POLICIES.reduce((sum, p) => sum + p.requirements.length, 0);
    const criticalCount = criticalReqs.length;
    const highRiskJurisdictions = JURISDICTIONS.filter(j => j.baseMultiplier >= 1.2);
    const totalDocuments = ALL_GOVERNANCE_DOCUMENTS.length;

    // v2 library statistics
    const totalPoliciesV2 = ALL_POLICIES_V2.length;
    const totalRequiredElements = ALL_POLICIES_V2.reduce((sum, p) => sum + p.requiredElements.length, 0);

    // Unified RAG statistics
    const ragStats = ragKnowledgeBase.counts;

    // Build bounded operator system prompt (The Toddfather pattern)
    // AskSGM must produce policy-and-evidence-backed governance artifacts
    const systemPrompt = buildAskSGMSystemPrompt({
      department: body.department,
      currentPage: body.context?.currentPage,
      cycleState: body.cycleState,
      jurisdiction: body.jurisdiction,
      userRole: body.userRole,
      policyLibrarySummary: `${POLICY_LIBRARY_V2_SUMMARY}

## Unified RAG Knowledge Base (The Toddfather)
- **Total Policies**: ${ragStats.totalPolicies}
  - Template Policies (A-001 to F-003): ${ragStats.templatePolicies} policies with Gold Standard Language
  - SPM Governance (SPM-POL-001 to 015): ${ragStats.spmGovernancePolicies} operational policies
  - SCP Legacy: ${ragStats.scpLegacyPolicies} compliance policies
- **Procedures**: ${ragStats.procedures} state machines
- **Controls**: ${ragStats.controls} preventive/detective controls
- **Evidence Items**: ${ragStats.evidence} citable evidence
- **Cases**: ${ragStats.cases} (exceptions + disputes)
- **Decisions**: ${ragStats.decisions} precedent decisions
- **Precedent Tags**: ${ragStats.precedentTags}
- **Risk Triggers**: ${ragStats.riskTriggers}
- **Jurisdictions**: ${ragStats.jurisdictions}

## Analysis Results (Client Plans 2026)
- Plans Analyzed: ${ANALYSIS_STATISTICS.documentsAnalyzed}
- Overall Coverage: ${ANALYSIS_STATISTICS.overallCoverage}% (Target: >${ANALYSIS_STATISTICS.targetCoverage}%)
- Total Gaps: ${ANALYSIS_STATISTICS.totalGaps} (Critical: ${ANALYSIS_STATISTICS.criticalGaps})
- Risk Level: ${ANALYSIS_STATISTICS.riskLevel}

## Statistics
- Total Policies (v2): ${totalPoliciesV2} (21 policies across 6 sections A-F)
- Required Elements: ${totalRequiredElements}
- Critical Policies: ${criticalPoliciesV2.length} (${criticalPoliciesV2.map(p => p.code).join(', ')})
- High Severity Policies: ${highPoliciesV2.length}
- Risk Triggers: ${RISK_TRIGGERS.length}
- Library Documents: ${totalDocuments}`,
      policyLibraryContext: `${policyLibraryContext}

${pageKbContext}

## Unified RAG Knowledge Base (Citation-Ready)
${fullRAGContext}

## Retrieved Governance Data (Legacy RAG)
${ragContext}

## Document Library
${documentLibrarySummary}

## Current Evidence Context
${body.context?.transactionId ? `- **Transaction ID**: ${body.context.transactionId}` : '- No transaction context'}
${body.context?.repId ? `- **Rep ID**: ${body.context.repId}` : '- No rep context'}
${body.context?.planYear ? `- **Plan Year**: ${body.context.planYear}` : '- No plan year context'}
${body.context?.documentCode ? `- **Document Code**: ${body.context.documentCode}` : ''}
${body.context?.approvalId ? `- **Approval ID**: ${body.context.approvalId}` : ''}

## Citation Format Instructions
When citing policies, use the full PolicyVersionId format:
- Client Custom: **A-001@v1.0**, **B-002@v1.0**, etc.
- SPM Governance: **SPM-POL-001@v1.0**, **SPM-POL-002@v1.0**, etc.
- SCP Legacy: **SCP-001@v0.1.0**, **SCP-002@v0.1.0**, etc.

When citing evidence, use the EvidenceId:
- **SPM-EV-001**: Plan Document
- **SPM-EV-002**: Calculation Run Log
- **SPM-EV-003**: Reconciliation Report

When citing decisions, use the DecisionId:
- **SPM-DEC-001**: Plan publish approval
- **SPM-DEC-004**: Dispute ruling (crediting split)`,
    });

    // LLM Priority Chain (Gateway Pattern):
    // 1. AICR Platform (expert hierarchy with RAG)
    // 2. Rally LLaMA (local, SPM-tuned)
    // 3. Claude API (cloud fallback)
    const startTime = Date.now();
    let responseContent: string = '';
    let modelUsed: string = 'unknown';
    let tokensUsed: { input: number; output: number; total: number } = { input: 0, output: 0, total: 0 };
    let cached: boolean = false;
    let aicrResponse: AskSGMResponse | null = null;

    // Priority 1: Try AICR Platform (expert hierarchy)
    if (isAICRConfigured()) {
      try {
        console.log(`[TOOL] [AskSGM] Trying AICR Platform (expert hierarchy)...`);
        const aicrClient = getAICRClient();

        // Get the last user message for the query
        const lastUserMessage = messages.filter(m => m.role === 'user').pop();
        if (!lastUserMessage) {
          throw new Error('No user message found');
        }

        aicrResponse = await aicrClient.askSGM({
          message: lastUserMessage.content,
          domain: 'sgm',
          context: {
            transactionId: body.context?.transactionId,
            repId: body.context?.repId,
            planYear: body.context?.planYear,
            jurisdiction: body.jurisdiction,
            cycleState: body.cycleState,
            currentPage: body.context?.currentPage,
          },
          tenantId: tenantId,
        });

        responseContent = aicrResponse.answer;
        modelUsed = `aicr:${aicrResponse.expert?.slug || 'sgm-toddfather'}`;
        tokensUsed = aicrResponse.tokensUsed || { input: 0, output: 0, total: 0 };
        cached = aicrResponse.cached || false;

        console.log(`[OK] [AskSGM] AICR Platform responded via ${aicrResponse.expert?.name || 'SGM Expert'}`);
      } catch (aicrError) {
        console.warn(`[WARN] [AskSGM] AICR Platform failed, falling back to local:`, aicrError);
        aicrResponse = null;
      }
    }

    // Priority 2: Try Rally LLaMA (local)
    if (!aicrResponse && isRallyLLMConfigured()) {
      const rallyClient = getRallyLLMClient();
      const clientStatus = rallyClient.getStatus();

      console.log(`[TOOL] [AskSGM] Using LLM: ${clientStatus.model} (Rally Local)`);

      const chatResponse = await rallyClient.chat(
        messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          systemPrompt: systemPrompt,
          maxTokens: AI_GUARDRAILS.maxOutputTokens,
          temperature: 0.6,
        }
      );

      responseContent = chatResponse.content;
      modelUsed = clientStatus.model;
      tokensUsed = chatResponse.tokensUsed;
      cached = chatResponse.cached;
    }

    // Priority 3: Fallback to Claude API (cloud)
    if (!aicrResponse && !isRallyLLMConfigured()) {
      if (!process.env.ANTHROPIC_API_KEY) {
        console.warn(
          JSON.stringify({
            event: 'ai.provider_unavailable',
            provider: 'anthropic',
            route: '/api/ai/asksgm',
            tenantId,
          })
        );
        return NextResponse.json(
          { error: 'provider_unavailable', details: 'No AI provider configured' },
          { status: 503 }
        );
      }

      console.log(`[TOOL] [AskSGM] Using LLM: Claude Sonnet 4 (Cloud Fallback)`);

      const { signal, cleanup } = createAbortController(AI_GUARDRAILS.requestTimeoutMs);
      const maxTokens = AI_GUARDRAILS.maxOutputTokens;

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
            model: 'claude-sonnet-4-20250514',
            max_tokens: maxTokens,
            temperature: 0.6,
            system: systemPrompt,
            messages: messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
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
      responseContent = claudeData.content?.[0]?.text || '';
      modelUsed = 'claude-sonnet-4-20250514';
      tokensUsed = {
        input: claudeData.usage?.input_tokens || 0,
        output: claudeData.usage?.output_tokens || 0,
        total: (claudeData.usage?.input_tokens || 0) + (claudeData.usage?.output_tokens || 0),
      };
    }

    const endTime = Date.now();
    const responseLength = responseContent.length;
    const responseTime = endTime - startTime;

    // Detect deliverable type from response
    const deliverableTypeMatch = responseContent.match(/##\s*(RULING|EXCEPTION_PACKET|DISPUTE_KIT|CHANGE_CONTROL_MEMO|GOVERNANCE_GAP):/i);
    const detectedDeliverableType = deliverableTypeMatch
      ? deliverableTypeMatch[1].toUpperCase() as DeliverableType
      : null;

    // Validate response has required sections (bounded operator compliance)
    const hasAuthorityBasis = /###\s*Authority\s*Basis/i.test(responseContent);
    const hasEvidenceBasis = /###\s*Evidence\s*Basis/i.test(responseContent);
    const hasDecisionLogic = /###\s*Decision\s*Logic/i.test(responseContent);
    const hasApprovalsRouting = /###\s*Approvals\s*(&|and)?\s*Routing/i.test(responseContent);
    const hasNextSteps = /###\s*Next\s*Steps/i.test(responseContent);
    const hasAuditNote = /###\s*Audit\s*Note|`SGM:/i.test(responseContent);

    const boundedOperatorCompliance = {
      hasDeliverableType: !!detectedDeliverableType,
      hasAuthorityBasis,
      hasEvidenceBasis,
      hasDecisionLogic,
      hasApprovalsRouting,
      hasNextSteps,
      hasAuditNote,
      isFullyCompliant: detectedDeliverableType && hasAuthorityBasis && hasEvidenceBasis &&
                        hasDecisionLogic && hasApprovalsRouting && hasNextSteps && hasAuditNote,
    };

    // Determine model type for telemetry
    const modelType = aicrResponse ? 'aicr-platform' :
                      isRallyLLMConfigured() ? 'rally-llama-spm' : 'claude-sonnet';

    logTelemetry({
      name: 'ai.request',
      appId: 'sgm-sparcc',
      tenantId: tenantId,
      ts: new Date().toISOString(),
      metrics: {
        modelId: modelUsed,
        modelType: modelType,
        aicrExpert: aicrResponse?.expert?.slug || null,
        escalatedFrom: aicrResponse?.escalatedFrom || null,
        intent: 'sgm_bounded_operator',
        department: body.department || 'governance',
        inputTokens: tokensUsed.input,
        // Bounded operator context
        cycleState: body.cycleState || 'unknown',
        jurisdiction: body.jurisdiction || 'DEFAULT',
        userRole: body.userRole || 'unknown',
      },
    });

    logTelemetry({
      name: 'ai.response',
      appId: 'sgm-sparcc',
      tenantId: tenantId,
      ts: new Date().toISOString(),
      metrics: {
        responseLength,
        responseTime: `${responseTime}ms`,
        inputTokens: tokensUsed.input,
        outputTokens: tokensUsed.output,
        totalTokens: tokensUsed.total,
        cached: cached,
        success: true,
        // Bounded operator compliance
        deliverableType: detectedDeliverableType || 'NOT_DETECTED',
        boundedOperatorCompliant: boundedOperatorCompliance.isFullyCompliant,
      },
    });

    // Log additional context (bounded operator)
    console.log('[OK] AskSGM bounded operator:', {
      model: modelUsed,
      department: body.department,
      cycleState: body.cycleState || 'unknown',
      jurisdiction: body.jurisdiction || 'DEFAULT',
      userRole: body.userRole || 'unknown',
      messageCount: messages.length,
      cached: cached,
      tokens: tokensUsed,
      responseTime: `${responseTime}ms`,
      responseLength,
      deliverableType: detectedDeliverableType || 'NOT_DETECTED',
      boundedOperatorCompliant: boundedOperatorCompliance.isFullyCompliant,
    });

    return NextResponse.json({
      text: responseContent,
      tokens: {
        input: tokensUsed.input,
        output: tokensUsed.output,
      },
      timestamp: new Date().toISOString(),
      cached: cached,
      // Model/expert info
      model: {
        id: modelUsed,
        type: modelType,
        provider: aicrResponse ? 'aicr' : isRallyLLMConfigured() ? 'rally' : 'anthropic',
      },
      // AICR expert hierarchy info (if used)
      expert: aicrResponse ? {
        slug: aicrResponse.expert?.slug,
        name: aicrResponse.expert?.name,
        domain: aicrResponse.expert?.domain,
        escalatedFrom: aicrResponse.escalatedFrom,
        confidence: aicrResponse.confidence,
        citations: aicrResponse.citations,
      } : null,
      // Bounded operator metadata
      boundedOperator: {
        deliverableType: aicrResponse?.deliverableType || detectedDeliverableType,
        compliance: boundedOperatorCompliance,
        context: {
          cycleState: body.cycleState || 'unknown',
          jurisdiction: body.jurisdiction || 'DEFAULT',
          userRole: body.userRole || 'unknown',
        },
      },
    });
  } catch (error) {
    if (isSecurityError(error)) {
      return NextResponse.json(
        { error: error.code, details: error.message },
        { status: error.status }
      );
    }
    console.error('AskSGM error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    // Log telemetry event - AskSGM error
    logTelemetry({
      name: 'api.error',
      appId: 'sgm-sparcc',
      tenantId: 'platform',
      ts: new Date().toISOString(),
      metrics: {
        endpoint: '/api/ai/asksgm',
        errorClass: error instanceof Error ? error.name : 'UNKNOWN',
        statusCode: 500,
      },
    });

    return NextResponse.json(
      {
        error: 'Failed to process request',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
