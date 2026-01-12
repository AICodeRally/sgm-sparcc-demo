'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AvatarIcon,
  PersonIcon,
  CheckCircledIcon,
  CalendarIcon,
  ClockIcon,
  FileTextIcon,
  EnvelopeClosedIcon,
  DotFilledIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';
import { ThreePaneWorkspace } from '@/components/workspace/ThreePaneWorkspace';
import { SGCC_COMMITTEE, CRB_COMMITTEE, CRB_DECISION_OPTIONS, type Committee } from '@/lib/data/synthetic/committees.data';
import { DemoBadge } from '@/components/demo/DemoBadge';
import { DemoWarningBanner } from '@/components/demo/DemoToggle';
import { ModeContextBadge } from '@/components/modes/ModeBadge';

const ALL_COMMITTEES = [SGCC_COMMITTEE, CRB_COMMITTEE];

export default function CommitteesPage() {
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(SGCC_COMMITTEE);
  const [activeTab, setActiveTab] = useState<'members' | 'authority' | 'decisions'>('members');

  // Left Nav - Committee list
  const leftNav = (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider px-3 mb-3">
          Committees
        </h2>
        <div className="space-y-1">
          {ALL_COMMITTEES.map(committee => (
            <button
              key={committee.id}
              onClick={() => setSelectedCommittee(committee)}
              className={`w-full text-left px-3 py-3 rounded-md transition-colors ${
                selectedCommittee?.id === committee.id
                  ? 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-primary)] font-medium'
                  : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
              }`}
            >
              <div className="flex items-start gap-3">
                <AvatarIcon className={`w-5 h-5 flex-none mt-0.5 ${
                  selectedCommittee?.id === committee.id ? 'text-[color:var(--color-primary)]' : 'text-[color:var(--color-muted)]'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{committee.code}</p>
                    <DemoBadge isDemo={committee.isDemo} demoMetadata={committee.demoMetadata} size="sm" />
                  </div>
                  <p className="text-xs text-[color:var(--color-muted)] mt-0.5 line-clamp-2">{committee.name}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-[color:var(--color-muted)]">
                    <PersonIcon className="w-3 h-3" />
                    <span>{committee.members.length} members</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 p-3 bg-[color:var(--color-surface-alt)] rounded-md border border-[color:var(--color-accent-border)]">
        <p className="text-xs font-medium text-[color:var(--color-accent)] mb-1">Committee Charters</p>
        <p className="text-xs text-[color:var(--color-primary)]">
          Review governance committee charters in the document library
        </p>
        <Link
          href="/documents"
          className="inline-block mt-2 text-xs text-[color:var(--color-primary)] hover:text-[color:var(--color-primary)] font-medium"
        >
          View Documents →
        </Link>
      </div>
    </div>
  );

  // Center Content - Committee details
  const centerContent = selectedCommittee ? (
    <div className="flex flex-col h-full">
      {/* Demo Warning Banner */}
      {ALL_COMMITTEES.some(c => c.isDemo) && (
        <div className="px-4 pt-4">
          <DemoWarningBanner
            demoCount={ALL_COMMITTEES.filter(c => c.isDemo).length}
            onViewDemoLibrary={() => window.location.href = '/demo-library'}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex-none bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] px-6 py-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-[color:var(--color-foreground)]">{selectedCommittee.code}</h1>
              <ModeContextBadge size="sm" />
            </div>
            <p className="text-sm text-[color:var(--color-muted)] mt-1">{selectedCommittee.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[color:var(--color-success-bg)] text-[color:var(--color-success)] rounded-full text-xs font-medium">
              <DotFilledIcon className="w-3 h-3" />
              {selectedCommittee.status}
            </span>
          </div>
        </div>

        <p className="text-sm text-[color:var(--color-foreground)] mb-4">{selectedCommittee.purpose}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-[color:var(--color-surface-alt)] rounded-lg">
            <PersonIcon className="w-5 h-5 text-[color:var(--color-primary)]" />
            <div>
              <p className="text-xs text-[color:var(--color-muted)]">Total Members</p>
              <p className="text-lg font-bold text-[color:var(--color-foreground)]">{selectedCommittee.members.length}</p>
              <p className="text-xs text-[color:var(--color-muted)]">
                {selectedCommittee.members.filter(m => m.isVoting).length} voting
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[color:var(--color-surface-alt)] rounded-lg">
            <CalendarIcon className="w-5 h-5 text-[color:var(--color-info)]" />
            <div>
              <p className="text-xs text-[color:var(--color-muted)]">Meeting Cadence</p>
              <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                {selectedCommittee.meetingCadence.split('(')[0]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[color:var(--color-surface-alt)] rounded-lg">
            <CheckCircledIcon className="w-5 h-5 text-[color:var(--color-success)]" />
            <div>
              <p className="text-xs text-[color:var(--color-muted)]">Quorum</p>
              <p className="text-sm font-semibold text-[color:var(--color-foreground)]">{selectedCommittee.quorumRequirement}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 border-b border-[color:var(--color-border)]">
          {[
            { id: 'members', label: 'Members', icon: PersonIcon },
            { id: 'authority', label: 'Authority & Scope', icon: FileTextIcon },
            { id: 'decisions', label: 'Decision Framework', icon: CheckCircledIcon },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[color:var(--color-primary)] text-[color:var(--color-primary)]'
                  : 'border-transparent text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)] hover:border-[color:var(--color-border)]'
              }`}
            >
              {React.createElement(tab.icon, { className: 'w-4 h-4' })}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'members' && (
          <div className="space-y-3">
            {selectedCommittee.members.map(member => (
              <div
                key={member.id}
                className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex-none w-10 h-10 rounded-full bg-[color:var(--color-surface-alt)] flex items-center justify-center">
                      <PersonIcon className="w-5 h-5 text-[color:var(--color-primary)]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[color:var(--color-foreground)]">{member.name}</p>
                        {member.isVoting ? (
                          <span className="px-2 py-0.5 bg-[color:var(--color-success-bg)] text-[color:var(--color-success)] rounded text-xs font-medium">
                            Voting
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-[color:var(--color-surface-alt)] text-[color:var(--color-muted)] rounded text-xs font-medium">
                            Non-Voting
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[color:var(--color-primary)] font-medium mt-0.5">{member.role}</p>
                      <p className="text-sm text-[color:var(--color-muted)] mt-1">{member.title}</p>
                      <p className="text-xs text-[color:var(--color-muted)] mt-1">{member.department}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-[color:var(--color-muted)]">
                          <EnvelopeClosedIcon className="w-3 h-3" />
                          {member.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[color:var(--color-muted)]">
                          <CalendarIcon className="w-3 h-3" />
                          Joined {new Date(member.joinedDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'authority' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-[color:var(--color-foreground)] mb-3">Committee Authority</h3>
              <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-4">
                <ul className="space-y-2">
                  {selectedCommittee.authority.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-[color:var(--color-foreground)]">
                      <CheckCircledIcon className="w-4 h-4 text-[color:var(--color-success)] flex-none mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[color:var(--color-foreground)] mb-3">Charter Document</h3>
              <Link href={`/documents/${selectedCommittee.charterDocument}`}>
                <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-4 hover:border-[color:var(--color-border)] hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <FileTextIcon className="w-10 h-10 text-[color:var(--color-primary)]" />
                    <div>
                      <p className="font-medium text-[color:var(--color-foreground)]">
                        {selectedCommittee.code} Committee Charter
                      </p>
                      <p className="text-xs text-[color:var(--color-muted)] mt-0.5">Document: {selectedCommittee.charterDocument}</p>
                      <p className="text-xs text-[color:var(--color-primary)] mt-1 font-medium">View Document →</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[color:var(--color-foreground)] mb-3">Meeting Requirements</h3>
              <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider">Cadence</p>
                  <p className="text-sm text-[color:var(--color-foreground)] mt-1">{selectedCommittee.meetingCadence}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider">Quorum</p>
                  <p className="text-sm text-[color:var(--color-foreground)] mt-1">{selectedCommittee.quorumRequirement}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'decisions' && (
          <div className="space-y-6">
            {selectedCommittee.code === 'CRB' && (
              <div>
                <h3 className="text-sm font-semibold text-[color:var(--color-foreground)] mb-3">
                  CRB Windfall Deal Decision Options
                </h3>
                <p className="text-sm text-[color:var(--color-muted)] mb-4">
                  6 decision options for deals &gt;$1M ARR, &gt;$100K commission, or &gt;50% quarterly quota
                </p>
                <div className="space-y-3">
                  {CRB_DECISION_OPTIONS.map((option, idx) => (
                    <div
                      key={option.id}
                      className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-none w-8 h-8 rounded-full bg-[color:var(--color-surface-alt)] flex items-center justify-center">
                          <span className="text-sm font-bold text-[color:var(--color-primary)]">{idx + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-[color:var(--color-foreground)]">{option.name}</h4>
                          <p className="text-sm text-[color:var(--color-foreground)] mt-1">{option.description}</p>
                          <div className="mt-3 p-3 bg-[color:var(--color-surface-alt)] rounded">
                            <p className="text-xs font-medium text-[color:var(--color-muted)]">Rationale</p>
                            <p className="text-xs text-[color:var(--color-foreground)] mt-1">{option.rationale}</p>
                          </div>
                          <div className="mt-2 p-3 bg-[color:var(--color-surface-alt)] rounded">
                            <p className="text-xs font-medium text-[color:var(--color-info)]">Example</p>
                            <p className="text-xs text-[color:var(--color-info)] mt-1">{option.example}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedCommittee.code === 'SGCC' && (
              <div>
                <h3 className="text-sm font-semibold text-[color:var(--color-foreground)] mb-3">SPIF Approval Thresholds</h3>
                <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[color:var(--color-surface-alt)] border-b border-[color:var(--color-border)]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[color:var(--color-muted)] uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[color:var(--color-muted)] uppercase">Authority</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[color:var(--color-muted)] uppercase">Timeline</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 text-sm text-[color:var(--color-foreground)]">&lt;$50K</td>
                        <td className="px-4 py-3 text-sm text-[color:var(--color-foreground)]">SGCC</td>
                        <td className="px-4 py-3 text-sm text-[color:var(--color-muted)]">5 business days</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-[color:var(--color-foreground)]">$50K - $250K</td>
                        <td className="px-4 py-3 text-sm text-[color:var(--color-foreground)]">SGCC + CFO</td>
                        <td className="px-4 py-3 text-sm text-[color:var(--color-muted)]">10 business days</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-[color:var(--color-foreground)]">&gt;$250K</td>
                        <td className="px-4 py-3 text-sm text-[color:var(--color-foreground)]">SGCC + CEO</td>
                        <td className="px-4 py-3 text-sm text-[color:var(--color-muted)]">15 business days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-full">
      <p className="text-sm text-[color:var(--color-muted)]">Select a committee to view details</p>
    </div>
  );

  // Right Detail Pane - Quick actions / context
  const rightDetail = selectedCommittee ? (
    <div className="flex flex-col h-full">
      <div className="flex-none p-4 border-b border-[color:var(--color-border)]">
        <h3 className="text-sm font-semibold text-[color:var(--color-foreground)]">Quick Actions</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <Link
          href={`/documents/${selectedCommittee.charterDocument}`}
          className="block p-3 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-lg hover:border-[color:var(--color-border)] hover:shadow-sm transition-all"
        >
          <div className="flex items-start gap-2">
            <FileTextIcon className="w-4 h-4 text-[color:var(--color-primary)] flex-none mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[color:var(--color-foreground)]">View Charter</p>
              <p className="text-xs text-[color:var(--color-muted)] mt-0.5">{selectedCommittee.charterDocument}</p>
            </div>
          </div>
        </Link>

        <button className="w-full p-3 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-lg hover:border-[color:var(--color-border)] hover:shadow-sm transition-all text-left">
          <div className="flex items-start gap-2">
            <CalendarIcon className="w-4 h-4 text-[color:var(--color-info)] flex-none mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[color:var(--color-foreground)]">Schedule Meeting</p>
              <p className="text-xs text-[color:var(--color-muted)] mt-0.5">Create agenda & invite</p>
            </div>
          </div>
        </button>

        <button className="w-full p-3 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-lg hover:border-[color:var(--color-border)] hover:shadow-sm transition-all text-left">
          <div className="flex items-start gap-2">
            <ClockIcon className="w-4 h-4 text-[color:var(--color-warning)] flex-none mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[color:var(--color-foreground)]">View Decisions</p>
              <p className="text-xs text-[color:var(--color-muted)] mt-0.5">Past decisions log</p>
            </div>
          </div>
        </button>
      </div>

      <div className="flex-none p-4 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)]">
        <p className="text-xs text-[color:var(--color-muted)]">
          Created {new Date(selectedCommittee.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  ) : null;

  return (
    <>
      <SetPageTitle
        title="Governance Committees"
        description="SGCC (7 members) and CRB for windfall deals and exception management"
      />
      <div className="h-full">
        <ThreePaneWorkspace
          leftNav={leftNav}
          centerContent={centerContent}
          rightDetail={rightDetail}
          showRightPane={!!selectedCommittee}
        />
      </div>
    </>
  );
}
