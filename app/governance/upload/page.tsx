'use client';

import { useState } from 'react';
import { DocumentUploader, AnalysisResult } from '@/components/governance/DocumentUploader';
import { AnalysisResults } from '@/components/governance/AnalysisResults';
import { PatchViewer } from '@/components/governance/PatchViewer';
import { FileText, BarChart3, Wrench } from 'lucide-react';

// Default organization context - can be made dynamic later
const DEFAULT_ORG_CONTEXT = {
  name: 'Demo Organization',
  state: 'CA',
  industry: 'Healthcare',
};

export default function GovernanceUploadPage() {
  const [currentAnalysis, setCurrentAnalysis] = useState<{
    result: AnalysisResult;
    fileName: string;
    documentId: string;
    planText?: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'analysis' | 'patches'>('upload');

  const handleAnalysisComplete = (result: AnalysisResult, file: File, planText?: string) => {
    // Extract document ID from filename (remove extension)
    const documentId = file.name.replace(/\.(pdf|docx|doc|txt)$/i, '');

    setCurrentAnalysis({
      result,
      fileName: file.name,
      documentId,
      planText,
    });

    // Auto-switch to analysis tab
    setActiveTab('analysis');
  };

  const handleViewPatches = () => {
    setActiveTab('patches');
  };

  const handleViewChecklist = async () => {
    if (!currentAnalysis) return;

    // Download checklist
    const response = await fetch(`/api/governance/checklist/${currentAnalysis.documentId}`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentAnalysis.documentId}_REMEDIATION_CHECKLIST.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-surface-alt)]">
      {/* Header */}
      <div className="bg-[color:var(--color-surface)] border-b border-[color:var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-[color:var(--color-foreground)]">
              Governance Gap Analysis
            </h1>
            <p className="mt-2 text-sm text-[color:var(--color-muted)]">
              Upload compensation plan documents to analyze policy coverage, detect gaps, and generate remediation patches
            </p>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-4 border-b border-[color:var(--color-border)]">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'upload'
                  ? 'border-[color:var(--color-info)] text-[color:var(--color-info)] font-medium'
                  : 'border-transparent text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]'
              }`}
            >
              <FileText className="w-4 h-4" />
              Upload
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              disabled={!currentAnalysis}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'analysis'
                  ? 'border-[color:var(--color-info)] text-[color:var(--color-info)] font-medium'
                  : currentAnalysis
                  ? 'border-transparent text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]'
                  : 'border-transparent text-[color:var(--color-muted)] cursor-not-allowed'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analysis
              {currentAnalysis && (
                <span className="px-2 py-0.5 bg-[color:var(--color-info-bg)] text-[color:var(--color-info)] text-xs rounded-full">
                  {currentAnalysis.result.total_gaps}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('patches')}
              disabled={!currentAnalysis}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'patches'
                  ? 'border-[color:var(--color-info)] text-[color:var(--color-info)] font-medium'
                  : currentAnalysis
                  ? 'border-transparent text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]'
                  : 'border-transparent text-[color:var(--color-muted)] cursor-not-allowed'
              }`}
            >
              <Wrench className="w-4 h-4" />
              Patches
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InfoCard
                title="55 Requirements"
                description="Comprehensive policy coverage across federal and state compliance requirements"
                color="blue"
              />
              <InfoCard
                title="Instant Analysis"
                description="AI-powered gap detection with coverage grading and liability scoring"
                color="green"
              />
              <InfoCard
                title="Ready-to-Use Patches"
                description="Pre-written remediation language with state-specific compliance notes"
                color="purple"
              />
            </div>

            {/* Uploader */}
            <DocumentUploader
              jurisdiction="CA"
              onAnalysisComplete={handleAnalysisComplete}
              maxFiles={5}
              allowBatch={true}
            />

            {/* How It Works */}
            <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[color:var(--color-foreground)] mb-4">
                How It Works
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Step
                  number={1}
                  title="Upload Documents"
                  description="Drop PDF, DOCX, or TXT compensation plans (up to 5 at once)"
                />
                <Step
                  number={2}
                  title="Instant Analysis"
                  description="AI analyzes against 55 requirements in 6-9 seconds"
                />
                <Step
                  number={3}
                  title="Review Gaps"
                  description="See coverage score, liability rating, and gap breakdown"
                />
                <Step
                  number={4}
                  title="Apply Patches"
                  description="Copy/paste ready-to-use remediation language"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && currentAnalysis && (
          <AnalysisResults
            result={currentAnalysis.result}
            fileName={currentAnalysis.fileName}
            documentId={currentAnalysis.documentId}
            planText={currentAnalysis.planText}
            organizationContext={DEFAULT_ORG_CONTEXT}
            onViewPatches={handleViewPatches}
            onViewChecklist={handleViewChecklist}
          />
        )}

        {activeTab === 'patches' && currentAnalysis && (
          <PatchViewer
            documentId={currentAnalysis.documentId}
            fileName={currentAnalysis.fileName}
          />
        )}
      </div>
    </div>
  );
}

interface InfoCardProps {
  title: string;
  description: string;
  color: 'blue' | 'green' | 'purple';
}

function InfoCard({ title, description, color }: InfoCardProps) {
  const colors = {
    blue: 'bg-[color:var(--color-surface-alt)] border-[color:var(--color-info-border)]',
    green: 'bg-[color:var(--color-success-bg)] border-[color:var(--color-success-border)]',
    purple: 'bg-[color:var(--color-surface-alt)] border-[color:var(--color-border)]',
  };

  return (
    <div className={`border rounded-lg p-4 ${colors[color]}`}>
      <h3 className="font-semibold text-[color:var(--color-foreground)] mb-1">{title}</h3>
      <p className="text-sm text-[color:var(--color-foreground)]">{description}</p>
    </div>
  );
}

interface StepProps {
  number: number;
  title: string;
  description: string;
}

function Step({ number, title, description }: StepProps) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-[color:var(--color-primary)] text-white font-bold text-xl flex items-center justify-center mx-auto mb-3">
        {number}
      </div>
      <h4 className="font-semibold text-[color:var(--color-foreground)] mb-1">{title}</h4>
      <p className="text-sm text-[color:var(--color-muted)]">{description}</p>
    </div>
  );
}
