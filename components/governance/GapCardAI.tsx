'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight,
  Sparkles,
  CheckCircle,
  XCircle,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import type { GapEntry } from './DocumentUploader';

interface ValidationResult {
  isGap: boolean;
  confidence: number;
  reasoning: string;
  suggestedGrade: 'A' | 'B' | 'C';
  missingElements: string[];
  validatedAt: string;
}

interface RemediationResult {
  patchText: string;
  insertionPoint: string;
  integrationNotes: string;
  conflictWarnings: string[];
  legalDisclaimer: string;
  confidence: number;
  generatedAt: string;
}

interface GapCardAIProps {
  gap: GapEntry;
  documentId: string;
  planText?: string;
  organizationContext?: {
    name: string;
    state: string;
    industry?: string;
  };
  isExpanded: boolean;
  onToggle: () => void;
  onValidationComplete?: (gapId: string, result: ValidationResult) => void;
  onRemediationComplete?: (gapId: string, result: RemediationResult) => void;
}

export function GapCardAI({
  gap,
  documentId,
  planText,
  organizationContext,
  isExpanded,
  onToggle,
  onValidationComplete,
  onRemediationComplete,
}: GapCardAIProps) {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [remediation, setRemediation] = useState<RemediationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isRemediating, setIsRemediating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const getSeverityBadge = (severity: string) => {
    const badges = {
      CRITICAL: 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)] border-[color:var(--color-error-border)]',
      HIGH: 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] border-[color:var(--color-warning-border)]',
      MEDIUM: 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] border-[color:var(--color-warning-border)]',
      LOW: 'bg-[color:var(--color-info-bg)] text-[color:var(--color-info)] border-[color:var(--color-info-border)]',
    };
    return badges[severity as keyof typeof badges] || badges.LOW;
  };

  const getSeverityIcon = (severity: string) => {
    const icons = {
      CRITICAL: <AlertCircle className="w-4 h-4" />,
      HIGH: <AlertTriangle className="w-4 h-4" />,
      MEDIUM: <Info className="w-4 h-4" />,
      LOW: <Info className="w-4 h-4" />,
    };
    return icons[severity as keyof typeof icons] || icons.LOW;
  };

  const handleValidate = async () => {
    if (!planText) {
      setError('Plan text required for AI validation');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const response = await fetch('/api/governance/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          gapId: gap.requirement_id,
          policyCode: gap.policy_code,
          policyName: gap.policy_name,
          requiredElements: gap.evidence || [],
          planTextExcerpt: planText.slice(0, 2000), // First 2000 chars
          detectionReason: `Status: ${gap.status}. ${gap.evidence?.join(', ') || 'No evidence found'}`,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Validation failed');
      }

      const result = await response.json();
      setValidation(result);
      onValidationComplete?.(gap.requirement_id, result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemediate = async () => {
    if (!organizationContext) {
      setError('Organization context required for remediation');
      return;
    }

    setIsRemediating(true);
    setError(null);

    try {
      const response = await fetch('/api/governance/remediate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          gapId: gap.requirement_id,
          policyCode: gap.policy_code,
          policyName: gap.policy_name,
          gapDescription: `${gap.requirement_name}: ${gap.evidence?.join(', ') || 'Not evidenced in plan'}`,
          existingLanguage: gap.evidence?.length ? gap.evidence.join('\n') : undefined,
          organizationContext,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Remediation failed');
      }

      const result = await response.json();
      setRemediation(result);
      onRemediationComplete?.(gap.requirement_id, result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Remediation failed');
    } finally {
      setIsRemediating(false);
    }
  };

  const handleCopyRemediation = () => {
    if (remediation?.patchText) {
      navigator.clipboard.writeText(remediation.patchText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="border border-[color:var(--color-border)] rounded-md overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-[color:var(--color-surface-alt)] transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 text-left">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-[color:var(--color-muted)] flex-shrink-0" />
          ) : (
            <ChevronRight className="w-5 h-5 text-[color:var(--color-muted)] flex-shrink-0" />
          )}
          <div className={`px-2 py-1 rounded-md text-xs font-medium border flex items-center gap-1 ${getSeverityBadge(gap.severity)}`}>
            {getSeverityIcon(gap.severity)}
            {gap.severity}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[color:var(--color-foreground)]">{gap.requirement_name}</p>
            <p className="text-sm text-[color:var(--color-muted)]">
              {gap.policy_code} - {gap.policy_name}
            </p>
          </div>

          {/* AI Validation Badge */}
          {validation && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
              validation.isGap
                ? 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]'
                : 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]'
            }`}>
              {validation.isGap ? (
                <AlertCircle className="w-3 h-3" />
              ) : (
                <CheckCircle className="w-3 h-3" />
              )}
              <span>{validation.isGap ? 'AI Confirmed' : 'False Positive'}</span>
              <span className="opacity-60">({validation.confidence}%)</span>
            </div>
          )}

          <span className={`px-2 py-1 rounded-md text-xs font-medium ${
            gap.status === 'UNMET' ? 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]' :
            gap.status === 'PARTIAL' ? 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]' :
            'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]'
          }`}>
            {gap.status}
          </span>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 py-4 bg-[color:var(--color-surface-alt)] border-t border-[color:var(--color-border)] space-y-4">
          {/* Evidence */}
          {gap.evidence && gap.evidence.length > 0 && (
            <div>
              <p className="text-sm font-medium text-[color:var(--color-foreground)] mb-2">Evidence Found:</p>
              <ul className="list-disc list-inside space-y-1">
                {gap.evidence.map((ev, i) => (
                  <li key={i} className="text-sm text-[color:var(--color-muted)]">{ev}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-[color:var(--color-error-bg)] border border-[color:var(--color-error-border)] rounded-md text-[color:var(--color-error)] text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* AI Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleValidate}
              disabled={isValidating || !planText}
              className="flex items-center gap-2 px-3 py-2 bg-[color:var(--color-primary)] text-white rounded-md hover:bg-[color:var(--color-secondary)] disabled:bg-[color:var(--color-border)] disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {isValidating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {validation ? 'Re-validate' : 'AI Validate'}
            </button>

            <button
              onClick={handleRemediate}
              disabled={isRemediating || !organizationContext}
              className="flex items-center gap-2 px-3 py-2 bg-[color:var(--color-primary)] text-white rounded-md hover:bg-[color:var(--color-secondary)] disabled:bg-[color:var(--color-border)] disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {isRemediating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {remediation ? 'Re-generate' : 'Generate Fix'}
            </button>
          </div>

          {/* Validation Result */}
          {validation && (
            <div className={`p-4 rounded-md border ${
              validation.isGap
                ? 'bg-[color:var(--color-error-bg)] border-[color:var(--color-error-border)]'
                : 'bg-[color:var(--color-success-bg)] border-[color:var(--color-success-border)]'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {validation.isGap ? (
                  <XCircle className="w-5 h-5 text-[color:var(--color-error)]" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-[color:var(--color-success)]" />
                )}
                <span className={`font-semibold ${
                  validation.isGap ? 'text-[color:var(--color-error)]' : 'text-[color:var(--color-success)]'
                }`}>
                  {validation.isGap ? 'Gap Confirmed' : 'False Positive Detected'}
                </span>
                <span className={`text-sm ml-auto ${
                  validation.isGap ? 'text-[color:var(--color-error)]' : 'text-[color:var(--color-success)]'
                }`}>
                  {validation.confidence}% confidence
                </span>
              </div>
              <p className={`text-sm ${
                validation.isGap ? 'text-[color:var(--color-error)]' : 'text-[color:var(--color-success)]'
              }`}>
                {validation.reasoning}
              </p>
              {validation.missingElements.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-[color:var(--color-foreground)]">Missing Elements:</p>
                  <ul className="list-disc list-inside text-sm text-[color:var(--color-muted)]">
                    {validation.missingElements.map((el, i) => (
                      <li key={i}>{el}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-xs text-[color:var(--color-muted)] mt-2">
                Suggested Grade: <span className="font-medium">{validation.suggestedGrade}</span>
              </p>
            </div>
          )}

          {/* Remediation Result */}
          {remediation && (
            <div className="p-4 rounded-md border bg-[color:var(--color-surface-alt)] border-[color:var(--color-info-border)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[color:var(--color-info)]" />
                  <span className="font-semibold text-[color:var(--color-info)]">Generated Remediation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[color:var(--color-info)]">
                    {remediation.confidence}% confidence
                  </span>
                  <button
                    onClick={handleCopyRemediation}
                    className="p-1.5 hover:bg-[color:var(--color-info-bg)] rounded transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-[color:var(--color-success)]" />
                    ) : (
                      <Copy className="w-4 h-4 text-[color:var(--color-info)]" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-[color:var(--color-surface)] rounded-md p-3 border border-[color:var(--color-info-border)] mb-3">
                <pre className="text-sm text-[color:var(--color-foreground)] whitespace-pre-wrap font-sans">
                  {remediation.patchText}
                </pre>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-[color:var(--color-primary)]">
                  <span className="font-medium">Insert at:</span> {remediation.insertionPoint}
                </p>
                <p className="text-[color:var(--color-primary)]">
                  <span className="font-medium">Integration:</span> {remediation.integrationNotes}
                </p>

                {remediation.conflictWarnings.length > 0 && (
                  <div className="p-2 bg-[color:var(--color-warning-bg)] border border-[color:var(--color-warning-border)] rounded">
                    <p className="font-medium text-[color:var(--color-warning)] text-xs mb-1">Potential Conflicts:</p>
                    <ul className="list-disc list-inside text-[color:var(--color-warning)] text-xs">
                      {remediation.conflictWarnings.map((warning, i) => (
                        <li key={i}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-xs text-[color:var(--color-muted)] italic mt-2">
                  {remediation.legalDisclaimer}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
