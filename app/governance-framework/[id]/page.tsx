'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  LockClosedIcon,
  FileTextIcon,
  ExclamationTriangleIcon,
  CheckCircledIcon,
  ReaderIcon,
} from '@radix-ui/react-icons';
import Link from 'next/link';
import type { GovernanceFramework } from '@/lib/contracts/governance-framework.contract';

interface FrameworkViewerPageProps {
  params: Promise<{ id: string }>;
}

export default function FrameworkViewerPage({ params }: FrameworkViewerPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [framework, setFramework] = useState<GovernanceFramework | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFramework();
  }, [id]);

  const fetchFramework = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/governance-framework/${id}`);
      if (!response.ok) throw new Error('Failed to fetch framework');

      const data = await response.json();
      setFramework(data.framework);
    } catch (error) {
      console.error('Error fetching framework:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'METHODOLOGY':
        return <ReaderIcon className="h-6 w-6" />;
      case 'STANDARDS':
        return <CheckCircledIcon className="h-6 w-6" />;
      case 'COMPLIANCE':
        return <LockClosedIcon className="h-6 w-6" />;
      case 'REGULATORY':
        return <ExclamationTriangleIcon className="h-6 w-6" />;
      default:
        return <FileTextIcon className="h-6 w-6" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'METHODOLOGY':
        return 'text-[color:var(--color-info)] bg-[color:var(--color-surface-alt)] border-[color:var(--color-info-border)]';
      case 'STANDARDS':
        return 'text-[color:var(--color-success)] bg-[color:var(--color-success-bg)] border-[color:var(--color-success-border)]';
      case 'COMPLIANCE':
        return 'text-[color:var(--color-error)] bg-[color:var(--color-error-bg)] border-[color:var(--color-error-border)]';
      case 'REGULATORY':
        return 'text-[color:var(--color-warning)] bg-[color:var(--color-warning-bg)] border-[color:var(--color-warning-border)]';
      case 'BEST_PRACTICES':
        return 'text-[color:var(--color-primary)] bg-[color:var(--color-surface-alt)] border-[color:var(--color-border)]';
      default:
        return 'text-[color:var(--color-muted)] bg-[color:var(--color-surface-alt)] border-[color:var(--color-border)]';
    }
  };

  // Simple markdown rendering (headers, bold, italic, lists)
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Headers
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-3xl font-bold text-[color:var(--color-foreground)] mt-6 mb-4">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-2xl font-bold text-[color:var(--color-foreground)] mt-5 mb-3">{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-xl font-semibold text-[color:var(--color-foreground)] mt-4 mb-2">{line.slice(4)}</h3>;
      }

      // Lists
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-6 text-[color:var(--color-foreground)]">{line.slice(2)}</li>;
      }

      // Bold and italic
      let formatted = line;
      formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');

      if (line.trim() === '') {
        return <br key={i} />;
      }

      return <p key={i} className="text-[color:var(--color-foreground)] mb-2" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center sparcc-hero-bg">
        <div className="text-[color:var(--color-muted)]">Loading framework...</div>
      </div>
    );
  }

  if (!framework) {
    return (
      <div className="h-screen flex items-center justify-center sparcc-hero-bg">
        <div className="text-center">
          <FileTextIcon className="h-16 w-16 text-[color:var(--color-muted)] mx-auto mb-4" />
          <p className="text-[color:var(--color-error)]">Framework not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col sparcc-hero-bg">
      {/* Header */}
      <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] px-8 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <Link
                href="/governance-framework"
                className="p-2 hover:bg-[color:var(--color-surface-alt)] rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-[color:var(--color-muted)]" />
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg border-2 ${getCategoryColor(framework.category)}`}>
                    {getCategoryIcon(framework.category)}
                  </div>
                  <div>
                    <div className="text-sm font-mono text-[color:var(--color-primary)]">{framework.code}</div>
                    <h1 className="text-2xl font-bold bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] bg-clip-text text-transparent">
                      {framework.title}
                    </h1>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[color:var(--color-muted)]">
                    {framework.category.replace('_', ' ')}
                  </span>
                  <span className="text-[color:var(--color-muted)]">•</span>
                  <span className="text-sm text-[color:var(--color-muted)]">
                    Version {framework.version}
                  </span>
                  <span className="text-[color:var(--color-muted)]">•</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    framework.status === 'ACTIVE'
                      ? 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]'
                      : framework.status === 'DRAFT'
                      ? 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]'
                      : 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]'
                  }`}>
                    {framework.status}
                  </span>
                  {framework.isMandatory && (
                    <>
                      <span className="text-[color:var(--color-muted)]">•</span>
                      <span className="px-2 py-1 text-xs font-semibold bg-[color:var(--color-error-bg)] text-[color:var(--color-error)] rounded border border-[color:var(--color-error-border)]">
                        MANDATORY
                      </span>
                    </>
                  )}
                  {framework.isGlobal && (
                    <>
                      <span className="text-[color:var(--color-muted)]">•</span>
                      <span className="px-2 py-1 text-xs font-semibold bg-[color:var(--color-info-bg)] text-[color:var(--color-info)] rounded border border-[color:var(--color-info-border)]">
                        GLOBAL
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-lg border-2 border-[color:var(--color-border)] p-8">
            {/* Applicable To */}
            {framework.applicableTo && framework.applicableTo.length > 0 && (
              <div className="mb-6 pb-6 border-b border-[color:var(--color-border)]">
                <h3 className="text-sm font-semibold text-[color:var(--color-foreground)] mb-2">Applicable To:</h3>
                <div className="flex flex-wrap gap-2">
                  {framework.applicableTo.map((planType: string) => (
                    <span
                      key={planType}
                      className="px-3 py-1 bg-[color:var(--color-surface-alt)] text-[color:var(--color-primary)] rounded-full text-sm font-medium"
                    >
                      {planType.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Framework Content */}
            <div className="prose prose-sm max-w-none">
              {renderMarkdown(framework.content)}
            </div>

            {/* Metadata */}
            <div className="mt-8 pt-6 border-t border-[color:var(--color-border)]">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-[color:var(--color-foreground)]">Created By:</span>
                  <span className="ml-2 text-[color:var(--color-muted)]">{framework.createdBy}</span>
                </div>
                <div>
                  <span className="font-semibold text-[color:var(--color-foreground)]">Created:</span>
                  <span className="ml-2 text-[color:var(--color-muted)]">
                    {new Date(framework.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-[color:var(--color-foreground)]">Last Updated:</span>
                  <span className="ml-2 text-[color:var(--color-muted)]">
                    {new Date(framework.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-[color:var(--color-foreground)]">Version:</span>
                  <span className="ml-2 text-[color:var(--color-muted)]">{framework.version}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
