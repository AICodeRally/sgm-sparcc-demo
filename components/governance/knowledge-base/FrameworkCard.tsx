'use client';

import { useState } from 'react';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  BookmarkIcon,
  PersonIcon,
  LightningBoltIcon,
  GearIcon,
  ReaderIcon,
  ExclamationTriangleIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  InfoCircledIcon,
  LinkBreak2Icon,
  StackIcon,
  TargetIcon,
} from '@radix-ui/react-icons';
import type { FrameworkCard as FrameworkCardType, SPMPillar, CardType, RoleUsage, ProcessFlow } from '@/lib/contracts/spm-knowledge-base.contract';
import { SPMPillarMetadata } from '@/lib/contracts/spm-knowledge-base.contract';

interface FrameworkCardProps {
  card: FrameworkCardType;
  isExpanded?: boolean;
  onTermClick?: (term: string) => void;
  className?: string;
}

// Card type configuration with icons and colors
const CARD_TYPE_CONFIG: Record<CardType, { icon: React.ReactNode; label: string; bgClass: string; textClass: string }> = {
  concept: {
    icon: <BookmarkIcon className="w-3.5 h-3.5" />,
    label: 'Concept',
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-600 dark:text-blue-400',
  },
  mechanic: {
    icon: <GearIcon className="w-3.5 h-3.5" />,
    label: 'Mechanic',
    bgClass: 'bg-green-500/10',
    textClass: 'text-green-600 dark:text-green-400',
  },
  process: {
    icon: <LightningBoltIcon className="w-3.5 h-3.5" />,
    label: 'Process',
    bgClass: 'bg-purple-500/10',
    textClass: 'text-purple-600 dark:text-purple-400',
  },
  role: {
    icon: <PersonIcon className="w-3.5 h-3.5" />,
    label: 'Role',
    bgClass: 'bg-orange-500/10',
    textClass: 'text-orange-600 dark:text-orange-400',
  },
  regulation: {
    icon: <ReaderIcon className="w-3.5 h-3.5" />,
    label: 'Regulation',
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
  },
};

export function FrameworkCard({ card, isExpanded: initialExpanded = false, onTermClick, className = '' }: FrameworkCardProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [isCardExpanded, setIsCardExpanded] = useState(initialExpanded);

  const pillarMeta = SPMPillarMetadata[card.pillar];
  const cardTypeConfig = CARD_TYPE_CONFIG[card.cardType];

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleTermClick = (term: string) => {
    if (onTermClick) {
      onTermClick(term);
    }
  };

  return (
    <div
      className={`bg-[color:var(--color-surface)] rounded-xl border border-[color:var(--color-border)] overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}
      style={{ borderLeftWidth: '4px', borderLeftColor: pillarMeta.color }}
    >
      {/* Card Header - Always Visible */}
      <div className="p-4">
        {/* Top Row: Pillar badge, Card type badge, Category/Component */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {/* Pillar Badge */}
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: pillarMeta.color }}
          >
            {pillarMeta.name}
          </span>

          {/* Card Type Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cardTypeConfig.bgClass} ${cardTypeConfig.textClass}`}
          >
            {cardTypeConfig.icon}
            {cardTypeConfig.label}
          </span>

          {/* Category / Component */}
          <span className="text-xs text-[color:var(--color-muted)]">
            {card.category} / {card.component}
          </span>
        </div>

        {/* Keyword Title */}
        <h3 className="text-xl font-bold text-[color:var(--color-foreground)] mb-2">{card.keyword}</h3>

        {/* Aliases */}
        {card.aliases && card.aliases.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-[color:var(--color-muted)]">Also known as:</span>
            <div className="flex flex-wrap gap-1">
              {card.aliases.map((alias, idx) => (
                <span
                  key={idx}
                  className="inline-block px-2 py-0.5 bg-[color:var(--color-surface-alt)] text-xs text-[color:var(--color-muted)] rounded-md"
                >
                  {alias}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Definition - Always Visible */}
        <p className="text-[color:var(--color-foreground)] leading-relaxed">{card.definition}</p>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsCardExpanded(!isCardExpanded)}
          className="mt-3 flex items-center gap-1 text-sm font-medium text-[color:var(--color-primary)] hover:text-[color:var(--color-secondary)] transition-colors"
        >
          {isCardExpanded ? (
            <>
              <ChevronDownIcon className="w-4 h-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronRightIcon className="w-4 h-4" />
              Show more details
            </>
          )}
        </button>
      </div>

      {/* Expandable Content */}
      {isCardExpanded && (
        <div className="border-t border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)]">
          {/* Why It Matters */}
          {card.whyItMatters && (
            <CollapsibleSection
              id="whyItMatters"
              title="Why It Matters"
              icon={<TargetIcon className="w-4 h-4" />}
              isExpanded={expandedSections.has('whyItMatters')}
              onToggle={() => toggleSection('whyItMatters')}
              defaultExpanded
            >
              <p className="text-sm text-[color:var(--color-foreground)] leading-relaxed">{card.whyItMatters}</p>
            </CollapsibleSection>
          )}

          {/* Extended Definition */}
          {card.extendedDefinition && (
            <CollapsibleSection
              id="extendedDefinition"
              title="Extended Definition"
              icon={<InfoCircledIcon className="w-4 h-4" />}
              isExpanded={expandedSections.has('extendedDefinition')}
              onToggle={() => toggleSection('extendedDefinition')}
            >
              <p className="text-sm text-[color:var(--color-foreground)] leading-relaxed">{card.extendedDefinition}</p>
            </CollapsibleSection>
          )}

          {/* How It Works */}
          {card.howItWorks && (
            <CollapsibleSection
              id="howItWorks"
              title="How It Works"
              icon={<GearIcon className="w-4 h-4" />}
              isExpanded={expandedSections.has('howItWorks')}
              onToggle={() => toggleSection('howItWorks')}
            >
              <p className="text-sm text-[color:var(--color-foreground)] leading-relaxed whitespace-pre-line">
                {card.howItWorks}
              </p>
            </CollapsibleSection>
          )}

          {/* Example */}
          {card.example && (
            <CollapsibleSection
              id="example"
              title="Example"
              icon={<ReaderIcon className="w-4 h-4" />}
              isExpanded={expandedSections.has('example')}
              onToggle={() => toggleSection('example')}
            >
              <div className="bg-[color:var(--color-surface)] rounded-lg p-3 border border-[color:var(--color-border)]">
                <p className="text-sm text-[color:var(--color-foreground)] leading-relaxed">{card.example}</p>
              </div>
            </CollapsibleSection>
          )}

          {/* Who Uses It */}
          {card.whoUsesIt && card.whoUsesIt.length > 0 && (
            <CollapsibleSection
              id="whoUsesIt"
              title="Who Uses It"
              icon={<PersonIcon className="w-4 h-4" />}
              isExpanded={expandedSections.has('whoUsesIt')}
              onToggle={() => toggleSection('whoUsesIt')}
            >
              <div className="space-y-2">
                {card.whoUsesIt.map((usage, idx) => (
                  <RoleUsageItem key={idx} usage={usage} />
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Best Practices */}
          {card.bestPractices && card.bestPractices.length > 0 && (
            <CollapsibleSection
              id="bestPractices"
              title="Best Practices"
              icon={<CheckCircledIcon className="w-4 h-4 text-green-500" />}
              isExpanded={expandedSections.has('bestPractices')}
              onToggle={() => toggleSection('bestPractices')}
            >
              <ul className="space-y-1.5">
                {card.bestPractices.map((practice, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-[color:var(--color-foreground)]">
                    <CheckCircledIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{practice}</span>
                  </li>
                ))}
              </ul>
            </CollapsibleSection>
          )}

          {/* Watch Out For */}
          {card.watchOutFor && card.watchOutFor.length > 0 && (
            <CollapsibleSection
              id="watchOutFor"
              title="Watch Out For"
              icon={<ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />}
              isExpanded={expandedSections.has('watchOutFor')}
              onToggle={() => toggleSection('watchOutFor')}
            >
              <ul className="space-y-1.5">
                {card.watchOutFor.map((warning, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-[color:var(--color-foreground)]">
                    <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </CollapsibleSection>
          )}

          {/* Common Mistakes */}
          {card.commonMistakes && card.commonMistakes.length > 0 && (
            <CollapsibleSection
              id="commonMistakes"
              title="Common Mistakes"
              icon={<CrossCircledIcon className="w-4 h-4 text-red-500" />}
              isExpanded={expandedSections.has('commonMistakes')}
              onToggle={() => toggleSection('commonMistakes')}
            >
              <ul className="space-y-1.5">
                {card.commonMistakes.map((mistake, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-[color:var(--color-foreground)]">
                    <CrossCircledIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </CollapsibleSection>
          )}

          {/* Process Flow */}
          {card.processFlow && (
            <CollapsibleSection
              id="processFlow"
              title="Process Flow"
              icon={<LightningBoltIcon className="w-4 h-4" />}
              isExpanded={expandedSections.has('processFlow')}
              onToggle={() => toggleSection('processFlow')}
            >
              <ProcessFlowSection processFlow={card.processFlow} onTermClick={handleTermClick} />
            </CollapsibleSection>
          )}

          {/* Inputs/Outputs (for process cards) */}
          {(card.inputs || card.outputs) && (
            <CollapsibleSection
              id="inputsOutputs"
              title="Inputs & Outputs"
              icon={<StackIcon className="w-4 h-4" />}
              isExpanded={expandedSections.has('inputsOutputs')}
              onToggle={() => toggleSection('inputsOutputs')}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {card.inputs && card.inputs.length > 0 && (
                  <div>
                    <h5 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wide mb-2 flex items-center gap-1">
                      <ArrowRightIcon className="w-3 h-3" />
                      Inputs
                    </h5>
                    <ul className="space-y-1">
                      {card.inputs.map((input, idx) => (
                        <li key={idx} className="text-sm text-[color:var(--color-foreground)]">
                          {input}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {card.outputs && card.outputs.length > 0 && (
                  <div>
                    <h5 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wide mb-2 flex items-center gap-1">
                      <ArrowLeftIcon className="w-3 h-3" />
                      Outputs
                    </h5>
                    <ul className="space-y-1">
                      {card.outputs.map((output, idx) => (
                        <li key={idx} className="text-sm text-[color:var(--color-foreground)]">
                          {output}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}

          {/* Systems & Timing */}
          {(card.systemsInvolved || card.timing) && (
            <CollapsibleSection
              id="systemsTiming"
              title="Systems & Timing"
              icon={<GearIcon className="w-4 h-4" />}
              isExpanded={expandedSections.has('systemsTiming')}
              onToggle={() => toggleSection('systemsTiming')}
            >
              <div className="space-y-3">
                {card.systemsInvolved && card.systemsInvolved.length > 0 && (
                  <div>
                    <h5 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wide mb-2">
                      Systems Involved
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {card.systemsInvolved.map((system, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-2 py-1 bg-[color:var(--color-surface)] text-xs text-[color:var(--color-foreground)] rounded-md border border-[color:var(--color-border)]"
                        >
                          {system}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {card.timing && (
                  <div>
                    <h5 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wide mb-2">
                      Timing
                    </h5>
                    <p className="text-sm text-[color:var(--color-foreground)]">{card.timing}</p>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}

          {/* Regulatory (for regulation cards) */}
          {(card.legalBasis || card.requirements || card.penalties) && (
            <CollapsibleSection
              id="regulatory"
              title="Regulatory Requirements"
              icon={<ReaderIcon className="w-4 h-4 text-red-500" />}
              isExpanded={expandedSections.has('regulatory')}
              onToggle={() => toggleSection('regulatory')}
            >
              <div className="space-y-3">
                {card.legalBasis && (
                  <div>
                    <h5 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wide mb-1">
                      Legal Basis
                    </h5>
                    <p className="text-sm text-[color:var(--color-foreground)]">{card.legalBasis}</p>
                  </div>
                )}
                {card.requirements && card.requirements.length > 0 && (
                  <div>
                    <h5 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wide mb-2">
                      Requirements
                    </h5>
                    <ul className="space-y-1.5">
                      {card.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-[color:var(--color-foreground)]">
                          <CheckCircledIcon className="w-4 h-4 text-[color:var(--color-primary)] flex-shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {card.penalties && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <h5 className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-1">
                      Penalties
                    </h5>
                    <p className="text-sm text-red-700 dark:text-red-300">{card.penalties}</p>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}

          {/* Vendor Terminology */}
          {card.vendorTerminology && Object.keys(card.vendorTerminology).length > 0 && (
            <CollapsibleSection
              id="vendorTerminology"
              title="Vendor Terminology"
              icon={<LinkBreak2Icon className="w-4 h-4" />}
              isExpanded={expandedSections.has('vendorTerminology')}
              onToggle={() => toggleSection('vendorTerminology')}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(card.vendorTerminology).map(([vendor, term]) => (
                  <div
                    key={vendor}
                    className="bg-[color:var(--color-surface)] rounded-lg p-2 border border-[color:var(--color-border)]"
                  >
                    <div className="text-xs font-medium text-[color:var(--color-muted)]">{vendor}</div>
                    <div className="text-sm text-[color:var(--color-foreground)]">{term}</div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Related Terms */}
          {card.relatedTerms && card.relatedTerms.length > 0 && (
            <div className="p-4 border-t border-[color:var(--color-border)]">
              <h4 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wide mb-2">
                Related Terms
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {card.relatedTerms.map((term, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTermClick(term)}
                    className="inline-flex items-center px-2.5 py-1 bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] text-sm rounded-md hover:bg-[color:var(--color-primary)]/20 transition-colors cursor-pointer"
                  >
                    {term}
                    <ArrowRightIcon className="w-3 h-3 ml-1" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags & Source */}
          <div className="p-4 border-t border-[color:var(--color-border)] flex flex-wrap items-center justify-between gap-2">
            {/* Tags */}
            {card.tags && card.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {card.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-2 py-0.5 bg-[color:var(--color-border)]/50 text-xs text-[color:var(--color-muted)] rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Source Authority */}
            {card.sourceAuthority && card.sourceAuthority.length > 0 && (
              <div className="text-xs text-[color:var(--color-muted)]">
                Sources: {card.sourceAuthority.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Collapsible Section Component
interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({
  id,
  title,
  icon,
  isExpanded,
  onToggle,
  defaultExpanded = false,
  children,
}: CollapsibleSectionProps) {
  // Auto-expand on first render if defaultExpanded
  const [hasAutoExpanded, setHasAutoExpanded] = useState(false);

  if (defaultExpanded && !hasAutoExpanded && !isExpanded) {
    // Trigger expansion on mount
    setTimeout(() => onToggle(), 0);
    setHasAutoExpanded(true);
  }

  return (
    <div className="border-t border-[color:var(--color-border)]">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-2 text-left hover:bg-[color:var(--color-surface)] transition-colors"
      >
        {isExpanded ? (
          <ChevronDownIcon className="w-4 h-4 text-[color:var(--color-muted)]" />
        ) : (
          <ChevronRightIcon className="w-4 h-4 text-[color:var(--color-muted)]" />
        )}
        <span className="text-[color:var(--color-primary)]">{icon}</span>
        <span className="text-sm font-medium text-[color:var(--color-foreground)]">{title}</span>
      </button>
      {isExpanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

// Role Usage Item Component
function RoleUsageItem({ usage }: { usage: RoleUsage }) {
  return (
    <div className="flex items-start gap-3 bg-[color:var(--color-surface)] rounded-lg p-3 border border-[color:var(--color-border)]">
      <div className="w-8 h-8 rounded-full bg-[color:var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
        <PersonIcon className="w-4 h-4 text-[color:var(--color-primary)]" />
      </div>
      <div>
        <div className="font-medium text-sm text-[color:var(--color-foreground)]">{usage.role}</div>
        <div className="text-sm text-[color:var(--color-muted)]">{usage.howTheyUseIt}</div>
      </div>
    </div>
  );
}

// Process Flow Section Component
interface ProcessFlowSectionProps {
  processFlow: ProcessFlow;
  onTermClick: (term: string) => void;
}

function ProcessFlowSection({ processFlow, onTermClick }: ProcessFlowSectionProps) {
  return (
    <div className="space-y-4">
      {/* Upstream/Downstream */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {processFlow.upstream && processFlow.upstream.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wide mb-2 flex items-center gap-1">
              <ArrowLeftIcon className="w-3 h-3" />
              Upstream (Depends On)
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {processFlow.upstream.map((term, idx) => (
                <button
                  key={idx}
                  onClick={() => onTermClick(term)}
                  className="inline-flex items-center px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs rounded-md hover:bg-blue-500/20 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
        {processFlow.downstream && processFlow.downstream.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wide mb-2 flex items-center gap-1">
              <ArrowRightIcon className="w-3 h-3" />
              Downstream (Feeds Into)
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {processFlow.downstream.map((term, idx) => (
                <button
                  key={idx}
                  onClick={() => onTermClick(term)}
                  className="inline-flex items-center px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs rounded-md hover:bg-green-500/20 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Diagram */}
      {processFlow.diagram && (
        <div className="bg-[color:var(--color-surface)] rounded-lg p-3 border border-[color:var(--color-border)]">
          <h5 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wide mb-2">
            Flow Diagram
          </h5>
          <pre className="text-sm text-[color:var(--color-foreground)] font-mono whitespace-pre-wrap">
            {processFlow.diagram}
          </pre>
        </div>
      )}
    </div>
  );
}

export default FrameworkCard;
