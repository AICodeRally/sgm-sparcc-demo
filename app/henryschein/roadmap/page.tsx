'use client';

import Link from 'next/link';
import { ArrowLeftIcon, CheckCircledIcon, ClockIcon, RocketIcon } from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';

interface RoadmapPhase {
  phase: number;
  name: string;
  weeks: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  milestones: {
    title: string;
    description: string;
    owner: string;
    critical: boolean;
  }[];
}

export default function HenryScheinRoadmap() {
  const roadmapPhases: RoadmapPhase[] = [
    {
      phase: 1,
      name: 'Policy Finalization & Legal Review',
      weeks: 'Weeks 1-3',
      status: 'NOT_STARTED',
      milestones: [
        {
          title: 'Legal Review of 3 MUST HAVE Policies',
          description: 'External counsel reviews Windfall/Large Deal, Section 409A, and State Wage Law policies',
          owner: 'Legal / General Counsel',
          critical: true,
        },
        {
          title: 'Compensation Committee Approval',
          description: 'Present policies to Comp Committee for formal approval and sign-off',
          owner: 'VP Compensation',
          critical: true,
        },
        {
          title: 'Finalize Policy Documentation',
          description: 'Incorporate legal feedback, create final PDFs, version control setup',
          owner: 'BHG Consulting',
          critical: false,
        },
        {
          title: 'Policy Communication Plan',
          description: 'Draft rollout communications for managers, reps, and sales operations',
          owner: 'HR Communications',
          critical: false,
        },
      ],
    },
    {
      phase: 2,
      name: 'CRB Establishment & System Setup',
      weeks: 'Weeks 4-6',
      status: 'NOT_STARTED',
      milestones: [
        {
          title: 'Form Compensation Review Board (CRB)',
          description: 'Select members, define charter, establish meeting cadence for windfall deal approvals',
          owner: 'CFO / VP Compensation',
          critical: true,
        },
        {
          title: 'Configure SGM Workflows',
          description: 'Set up approval workflows, notification triggers, SLA tracking in SGM platform',
          owner: 'IT / Sales Operations',
          critical: true,
        },
        {
          title: 'Build Policy Templates in Systems',
          description: 'Configure Salesforce/comp system with new policy rules and validation checks',
          owner: 'IT / Sales Operations',
          critical: false,
        },
        {
          title: 'Create Exception Request Forms',
          description: 'Build online forms for reps to submit policy exception requests',
          owner: 'IT / Sales Operations',
          critical: false,
        },
      ],
    },
    {
      phase: 3,
      name: 'Training & Documentation',
      weeks: 'Weeks 7-9',
      status: 'NOT_STARTED',
      milestones: [
        {
          title: 'Manager Training Sessions',
          description: 'Train regional sales managers on new policies, approval workflows, and SGM access',
          owner: 'VP Sales / Training',
          critical: true,
        },
        {
          title: 'Rep Communication & FAQs',
          description: 'Publish policy summaries, FAQs, and training videos for all reps',
          owner: 'HR / Training',
          critical: true,
        },
        {
          title: 'CRB Training & Dry Runs',
          description: 'Train CRB members on windfall deal review process, run 3 test cases',
          owner: 'BHG / VP Compensation',
          critical: false,
        },
        {
          title: 'Sales Ops Desk Procedures',
          description: 'Create step-by-step procedures for sales ops team to administer policies',
          owner: 'Sales Operations',
          critical: false,
        },
      ],
    },
    {
      phase: 4,
      name: 'Go-Live & Stabilization',
      weeks: 'Weeks 10-12',
      status: 'NOT_STARTED',
      milestones: [
        {
          title: 'Policy Go-Live (January 6, 2026)',
          description: 'All 3 MUST HAVE policies effective for new deals, CRB operational',
          owner: 'VP Compensation',
          critical: true,
        },
        {
          title: 'Daily Monitoring & Support',
          description: 'Monitor SGM tickets, CRB queue, exception requests; provide rapid support',
          owner: 'Sales Operations / BHG',
          critical: true,
        },
        {
          title: 'First CRB Meeting',
          description: 'Review queued windfall deals, establish precedents, refine process',
          owner: 'CRB Members',
          critical: false,
        },
        {
          title: 'Two-Week Retrospective',
          description: 'Gather feedback from managers and reps, identify process improvements',
          owner: 'VP Compensation',
          critical: false,
        },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    if (status === 'COMPLETED') return 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)] border-[color:var(--color-success-border)]';
    if (status === 'IN_PROGRESS') return 'bg-[color:var(--color-info-bg)] text-[color:var(--color-info)] border-[color:var(--color-info-border)]';
    return 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)] border-[color:var(--color-border)]';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'COMPLETED') return <CheckCircledIcon className="w-5 h-5 text-[color:var(--color-success)]" />;
    if (status === 'IN_PROGRESS') return <ClockIcon className="w-5 h-5 text-[color:var(--color-info)] animate-pulse" />;
    return <ClockIcon className="w-5 h-5 text-[color:var(--color-muted)]" />;
  };

  return (
    <>
      <SetPageTitle
        title="Henry Schein - Implementation Roadmap"
        description="3-year governance improvement plan with prioritized initiatives"
      />
      <div className="min-h-screen bg-[color:var(--color-surface-alt)]">
        {/* Header */}
        <div className="bg-[color:var(--color-surface)] border-b border-[color:var(--color-border)] shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/henryschein"
                  className="flex items-center gap-2 text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)] transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Timeline Overview */}
        <div className="mb-8 bg-[color:var(--color-info-bg)] rounded-lg p-6 border-2 border-[color:var(--color-info-border)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[color:var(--color-foreground)] mb-2">
                January 6, 2026 - Target Go-Live Date
              </h2>
              <p className="text-[color:var(--color-foreground)]">
                3 MUST HAVE policies (Windfall, Section 409A, State Wage Law) effective for all new deals
              </p>
              <p className="text-sm text-[color:var(--color-muted)] mt-2">
                Q2 2026: Add Clawback & Quota policies | Q3 2026: Add SPIF Governance policy
              </p>
            </div>
            <RocketIcon className="w-16 h-16 text-[color:var(--color-info)]" />
          </div>
        </div>

        {/* Progress Summary */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {roadmapPhases.map((phase) => {
            const completedMilestones = phase.milestones.filter((m) => phase.status === 'COMPLETED').length;
            const totalMilestones = phase.milestones.length;
            const progress = phase.status === 'COMPLETED' ? 100 : phase.status === 'IN_PROGRESS' ? 50 : 0;

            return (
              <div key={phase.phase} className="bg-[color:var(--color-surface)] rounded-lg border-2 border-[color:var(--color-border)] p-4">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(phase.status)}
                  <h3 className="font-bold text-[color:var(--color-foreground)]">Phase {phase.phase}</h3>
                </div>
                <p className="text-xs text-[color:var(--color-muted)] mb-2">{phase.weeks}</p>
                <div className="w-full bg-[color:var(--color-border)] rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      phase.status === 'COMPLETED'
                        ? 'bg-[color:var(--color-success)]'
                        : phase.status === 'IN_PROGRESS'
                        ? 'bg-[color:var(--color-primary)]'
                        : 'bg-[color:var(--color-border)]'
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-[color:var(--color-muted)]">
                  {completedMilestones}/{totalMilestones} milestones
                </p>
              </div>
            );
          })}
        </div>

        {/* Phases Detail */}
        <div className="space-y-8">
          {roadmapPhases.map((phase) => (
            <div key={phase.phase} className="bg-[color:var(--color-surface)] rounded-lg border-2 border-[color:var(--color-border)] shadow-md p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[color:var(--color-info-bg)] flex items-center justify-center">
                    <span className="text-xl font-bold text-[color:var(--color-info)]">{phase.phase}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[color:var(--color-foreground)]">{phase.name}</h2>
                    <p className="text-sm text-[color:var(--color-muted)]">{phase.weeks}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-bold rounded-full border ${getStatusColor(
                    phase.status
                  )}`}
                >
                  {phase.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-4">
                {phase.milestones.map((milestone, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 ${
                      milestone.critical
                        ? 'bg-[color:var(--color-error-bg)] border-[color:var(--color-error-border)]'
                        : 'bg-[color:var(--color-surface-alt)] border-[color:var(--color-border)]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <CheckCircledIcon
                          className={`w-5 h-5 ${
                            phase.status === 'COMPLETED'
                              ? 'text-[color:var(--color-success)]'
                              : 'text-[color:var(--color-muted)]'
                          }`}
                        />
                        <h3 className="font-bold text-[color:var(--color-foreground)]">{milestone.title}</h3>
                      </div>
                      {milestone.critical && (
                        <span className="px-2 py-1 bg-[color:var(--color-error-bg)] text-[color:var(--color-error)] text-xs font-bold rounded">
                          CRITICAL
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[color:var(--color-foreground)] ml-8 mb-2">{milestone.description}</p>
                    <p className="text-xs text-[color:var(--color-muted)] ml-8">
                      <span className="font-medium">Owner:</span> {milestone.owner}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Key Dates */}
        <div className="mt-8 bg-[color:var(--color-surface)] rounded-lg border-2 border-[color:var(--color-info-border)] shadow-md p-6">
          <h3 className="text-xl font-bold text-[color:var(--color-foreground)] mb-4">Key Dates & Dependencies</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-[color:var(--color-surface-alt)] rounded-lg">
              <div className="w-2 h-2 bg-[color:var(--color-primary)] rounded-full mt-2"></div>
              <div>
                <p className="font-bold text-[color:var(--color-foreground)]">Week 3 Deadline (Dec 27, 2025)</p>
                <p className="text-sm text-[color:var(--color-foreground)]">
                  Legal review complete and Comp Committee approval secured. Delay here pushes go-live date.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-[color:var(--color-surface-alt)] rounded-lg">
              <div className="w-2 h-2 bg-[color:var(--color-primary)] rounded-full mt-2"></div>
              <div>
                <p className="font-bold text-[color:var(--color-foreground)]">Week 6 Deadline (Jan 17, 2026)</p>
                <p className="text-sm text-[color:var(--color-foreground)]">
                  CRB fully operational and SGM workflows live. Must be ready 2 weeks before go-live.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-[color:var(--color-success-bg)] rounded-lg border border-[color:var(--color-success-border)]">
              <div className="w-2 h-2 bg-[color:var(--color-success)] rounded-full mt-2"></div>
              <div>
                <p className="font-bold text-[color:var(--color-success)]">January 6, 2026 - GO-LIVE</p>
                <p className="text-sm text-[color:var(--color-success)]">
                  All 3 MUST HAVE policies effective. CRB reviews first windfall deals. Daily support active.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-[color:var(--color-warning-bg)] rounded-lg border border-[color:var(--color-warning-border)]">
              <div className="w-2 h-2 bg-[color:var(--color-warning)] rounded-full mt-2"></div>
              <div>
                <p className="font-bold text-[color:var(--color-warning)]">Q2 & Q3 2026 - Phase 2</p>
                <p className="text-sm text-[color:var(--color-warning)]">
                  Add remaining 3 policies (Clawback, Quota, SPIF) using same 12-week playbook.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Success Factors */}
        <div className="mt-8 bg-[color:var(--color-error-bg)] rounded-lg border-2 border-[color:var(--color-error-border)] p-6">
          <h3 className="text-xl font-bold text-[color:var(--color-error)] mb-4">Critical Success Factors</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[color:var(--color-surface)] rounded-lg p-4">
              <h4 className="font-bold text-[color:var(--color-foreground)] mb-2">Executive Sponsorship</h4>
              <p className="text-sm text-[color:var(--color-foreground)]">
                CFO and VP Compensation must champion the changes and hold teams accountable
              </p>
            </div>
            <div className="bg-[color:var(--color-surface)] rounded-lg p-4">
              <h4 className="font-bold text-[color:var(--color-foreground)] mb-2">Legal Sign-Off</h4>
              <p className="text-sm text-[color:var(--color-foreground)]">
                External counsel approval by Week 3 is non-negotiable to avoid compliance risk
              </p>
            </div>
            <div className="bg-[color:var(--color-surface)] rounded-lg p-4">
              <h4 className="font-bold text-[color:var(--color-foreground)] mb-2">IT Resources</h4>
              <p className="text-sm text-[color:var(--color-foreground)]">
                2 FTE dedicated to SGM configuration and system integration (Weeks 4-6)
              </p>
            </div>
            <div className="bg-[color:var(--color-surface)] rounded-lg p-4">
              <h4 className="font-bold text-[color:var(--color-foreground)] mb-2">Change Management</h4>
              <p className="text-sm text-[color:var(--color-foreground)]">
                Proactive communication to managers and reps reduces resistance and confusion
              </p>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="mt-8 bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] shadow-md p-6">
          <h3 className="text-lg font-bold text-[color:var(--color-foreground)] mb-4">Next Steps to Start Phase 1</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-[color:var(--color-error-bg)] rounded-lg border border-[color:var(--color-error-border)]">
              <div className="w-2 h-2 bg-[color:var(--color-error)] rounded-full"></div>
              <p className="text-sm font-medium text-[color:var(--color-foreground)] flex-1">
                Engage external legal counsel for Section 409A and State Wage Law review
              </p>
              <span className="px-2 py-1 bg-[color:var(--color-error-bg)] text-[color:var(--color-error)] text-xs font-medium rounded">
                THIS WEEK
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[color:var(--color-error-bg)] rounded-lg border border-[color:var(--color-error-border)]">
              <div className="w-2 h-2 bg-[color:var(--color-error)] rounded-full"></div>
              <p className="text-sm font-medium text-[color:var(--color-foreground)] flex-1">
                Schedule Compensation Committee meeting for policy approval (targeting Week 3)
              </p>
              <span className="px-2 py-1 bg-[color:var(--color-error-bg)] text-[color:var(--color-error)] text-xs font-medium rounded">
                THIS WEEK
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[color:var(--color-warning-bg)] rounded-lg border border-[color:var(--color-warning-border)]">
              <div className="w-2 h-2 bg-[color:var(--color-warning)] rounded-full"></div>
              <p className="text-sm font-medium text-[color:var(--color-foreground)] flex-1">
                Select CRB members (CFO, VP Sales, General Counsel, VP Comp recommended)
              </p>
              <span className="px-2 py-1 bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] text-xs font-medium rounded">
                NEXT WEEK
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[color:var(--color-surface-alt)] rounded-lg border border-[color:var(--color-info-border)]">
              <div className="w-2 h-2 bg-[color:var(--color-primary)] rounded-full"></div>
              <p className="text-sm font-medium text-[color:var(--color-foreground)] flex-1">
                Assign IT resources for SGM workflow configuration (2 FTE needed Weeks 4-6)
              </p>
              <span className="px-2 py-1 bg-[color:var(--color-info-bg)] text-[color:var(--color-primary)] text-xs font-medium rounded">
                WEEK 2
              </span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
