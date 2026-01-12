'use client';

import React, { useState } from 'react';
import {
  DownloadIcon,
  FileTextIcon,
  BarChartIcon,
  ClockIcon,
  CheckCircledIcon,
  LayersIcon,
  ExclamationTriangleIcon,
  LoopIcon,
  ArchiveIcon,
  ReaderIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';
import {
  REPORT_TEMPLATES,
  GENERATED_REPORTS,
  REPORT_STATS,
  getReportsByCategory,
  ReportTemplate,
  GeneratedReport,
  ReportFormat,
  ReportCategory,
} from '@/lib/data/synthetic/reports.data';

export default function ReportsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('PDF');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Filter templates by category
  const filteredTemplates = filterCategory === 'all'
    ? REPORT_TEMPLATES
    : REPORT_TEMPLATES.filter(t => t.category === filterCategory);

  // Get icon for report
  const getReportIcon = (icon: string) => {
    switch (icon) {
      case 'FileCheck':
        return CheckCircledIcon;
      case 'FileText':
        return FileTextIcon;
      case 'Archive':
        return ArchiveIcon;
      case 'BarChart':
        return BarChartIcon;
      case 'TrendingUp':
        return BarChartIcon;
      case 'Users':
        return LayersIcon;
      case 'FileStack':
        return LayersIcon;
      case 'Loop':
        return LoopIcon;
      case 'ExclamationTriangle':
        return ExclamationTriangleIcon;
      default:
        return FileTextIcon;
    }
  };

  // Get category color
  const getCategoryColor = (category: ReportCategory) => {
    switch (category) {
      case 'COMPLIANCE':
        return 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-primary)] border-[color:var(--color-border)]';
      case 'PERFORMANCE':
        return 'bg-[color:var(--color-info-bg)] text-[color:var(--color-primary)] border-[color:var(--color-info-border)]';
      case 'OPERATIONS':
        return 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)] border-[color:var(--color-success-border)]';
      case 'AUDIT':
        return 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] border-[color:var(--color-warning-border)]';
      default:
        return 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)] border-[color:var(--color-border)]';
    }
  };

  // Get format badge color
  const getFormatColor = (format: ReportFormat) => {
    switch (format) {
      case 'PDF':
        return 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]';
      case 'EXCEL':
        return 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]';
      case 'CSV':
        return 'bg-[color:var(--color-info-bg)] text-[color:var(--color-primary)]';
      case 'JSON':
        return 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]';
      default:
        return 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]';
    }
  };

  return (
    <>
      <SetPageTitle
        title="Reports & Export"
        description="9 pre-built report templates with multiple export formats"
      />
      <div className="h-screen sparcc-hero-bg flex flex-col">
        {/* Header */}
        <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <div className="bg-[color:var(--color-surface-alt)] px-3 py-1 rounded-full">
                <span className="font-semibold text-[color:var(--color-primary)]">{REPORT_STATS.totalTemplates}</span>
                <span className="text-[color:var(--color-primary)] ml-1">templates</span>
              </div>
              <div className="bg-[color:var(--color-success-bg)] px-3 py-1 rounded-full">
                <span className="font-semibold text-[color:var(--color-success)]">{REPORT_STATS.recentlyGenerated}</span>
                <span className="text-[color:var(--color-success)] ml-1">this week</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Report Templates */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                filterCategory === 'all'
                  ? 'bg-[color:var(--color-primary)] text-white'
                  : 'bg-[color:var(--color-surface)] border border-[color:var(--color-border)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
              }`}
            >
              All Templates ({REPORT_TEMPLATES.length})
            </button>
            <button
              onClick={() => setFilterCategory('COMPLIANCE')}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                filterCategory === 'COMPLIANCE'
                  ? 'bg-[color:var(--color-primary)] text-white'
                  : 'bg-[color:var(--color-surface)] border border-[color:var(--color-border)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
              }`}
            >
              Compliance ({REPORT_STATS.byCategory.COMPLIANCE})
            </button>
            <button
              onClick={() => setFilterCategory('PERFORMANCE')}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                filterCategory === 'PERFORMANCE'
                  ? 'bg-[color:var(--color-primary)] text-white'
                  : 'bg-[color:var(--color-surface)] border border-[color:var(--color-border)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
              }`}
            >
              Performance ({REPORT_STATS.byCategory.PERFORMANCE})
            </button>
            <button
              onClick={() => setFilterCategory('OPERATIONS')}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                filterCategory === 'OPERATIONS'
                  ? 'bg-[color:var(--color-primary)] text-white'
                  : 'bg-[color:var(--color-surface)] border border-[color:var(--color-border)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
              }`}
            >
              Operations ({REPORT_STATS.byCategory.OPERATIONS})
            </button>
            <button
              onClick={() => setFilterCategory('AUDIT')}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                filterCategory === 'AUDIT'
                  ? 'bg-[color:var(--color-primary)] text-white'
                  : 'bg-[color:var(--color-surface)] border border-[color:var(--color-border)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
              }`}
            >
              Audit ({REPORT_STATS.byCategory.AUDIT})
            </button>
          </div>

          {/* Report Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filteredTemplates.map(template => {
              const Icon = getReportIcon(template.icon);
              const isSelected = selectedTemplate?.id === template.id;

              return (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setSelectedFormat(template.supportedFormats[0]);
                  }}
                  className={`text-left p-5 rounded-lg border-2 transition-all hover:shadow-lg ${
                    isSelected
                      ? 'border-[color:var(--color-primary)] bg-[color:var(--color-surface-alt)]'
                      : 'border-[color:var(--color-border)] bg-[color:var(--surface-glass)] backdrop-blur-sm hover:border-[color:var(--color-border)]'
                  }`}
                >
                  {/* Icon & Category */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[color:var(--color-surface-alt)] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[color:var(--color-primary)]" />
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded border ${getCategoryColor(template.category)}`}>
                      {template.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-[color:var(--color-foreground)] mb-2">
                    {template.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-[color:var(--color-muted)] mb-3 line-clamp-2">
                    {template.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-2 text-xs text-[color:var(--color-muted)]">
                    <ClockIcon className="w-3 h-3" />
                    <span>{template.estimatedTime}</span>
                  </div>

                  {/* Formats */}
                  <div className="flex items-center gap-1 mt-3">
                    {template.supportedFormats.map(format => (
                      <span
                        key={format}
                        className={`text-xs font-medium px-2 py-0.5 rounded ${getFormatColor(format)}`}
                      >
                        {format}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Recent Reports */}
          <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-lg border border-[color:var(--color-border)] p-6">
            <h2 className="text-lg font-bold text-[color:var(--color-foreground)] mb-4 flex items-center gap-2">
              <ArchiveIcon className="w-5 h-5 text-[color:var(--color-primary)]" />
              Recently Generated Reports
            </h2>

            <div className="space-y-2">
              {GENERATED_REPORTS.map(report => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[color:var(--color-surface)] border border-[color:var(--color-border)] hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded bg-[color:var(--color-surface-alt)] flex items-center justify-center flex-shrink-0">
                      <FileTextIcon className="w-5 h-5 text-[color:var(--color-primary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[color:var(--color-foreground)] truncate">
                        {report.templateName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[color:var(--color-muted)]">
                        <span>{report.generatedBy}</span>
                        <span>•</span>
                        <span>{new Date(report.generatedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className={`font-medium ${getFormatColor(report.format)} px-1.5 py-0.5 rounded`}>
                          {report.format}
                        </span>
                        <span>•</span>
                        <span>{report.fileSize}</span>
                      </div>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-3 py-2 bg-[color:var(--color-primary)] text-white rounded-md text-sm font-medium hover:bg-[color:var(--color-secondary)] transition-colors">
                    <DownloadIcon className="w-4 h-4" />
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Report Configuration */}
        {selectedTemplate && (
          <div className="w-96 border-l border-[color:var(--color-border)] bg-[color:var(--surface-glass)] backdrop-blur-sm overflow-y-auto">
            <div className="p-6">
              {/* Template Info */}
              <div className="mb-6">
                <div className="flex items-start gap-3 mb-3">
                  {(() => {
                    const Icon = getReportIcon(selectedTemplate.icon);
                    return (
                      <div className="w-12 h-12 rounded-lg bg-[color:var(--color-surface-alt)] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-[color:var(--color-primary)]" />
                      </div>
                    );
                  })()}
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-[color:var(--color-foreground)]">
                      {selectedTemplate.name}
                    </h2>
                    <span className={`inline-block text-xs font-medium px-2 py-1 rounded border mt-1 ${getCategoryColor(selectedTemplate.category)}`}>
                      {selectedTemplate.category}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-[color:var(--color-muted)] leading-relaxed">
                  {selectedTemplate.description}
                </p>

                <div className="flex items-center gap-2 mt-3 text-sm text-[color:var(--color-muted)]">
                  <ClockIcon className="w-4 h-4" />
                  <span>Estimated generation time: {selectedTemplate.estimatedTime}</span>
                </div>
              </div>

              {/* Format Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[color:var(--color-foreground)] mb-2">
                  Export Format
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.supportedFormats.map(format => (
                    <button
                      key={format}
                      onClick={() => setSelectedFormat(format)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedFormat === format
                          ? 'bg-[color:var(--color-primary)] text-white'
                          : 'bg-[color:var(--color-surface)] border border-[color:var(--color-border)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              {/* Parameters */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[color:var(--color-foreground)] mb-3">Report Parameters</h3>
                <div className="space-y-4">
                  {selectedTemplate.parameters.map(param => (
                    <div key={param.id}>
                      <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-1">
                        {param.label}
                        {param.required && <span className="text-[color:var(--color-error)] ml-1">*</span>}
                      </label>

                      {param.type === 'select' && param.options && (
                        <select className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent-border)]">
                          {param.options.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}

                      {param.type === 'multi_select' && param.options && (
                        <div className="space-y-1 border border-[color:var(--color-border)] rounded-md p-2 max-h-40 overflow-y-auto">
                          {param.options.map(opt => (
                            <label key={opt.value} className="flex items-center gap-2 text-sm p-1 hover:bg-[color:var(--color-surface-alt)] rounded">
                              <input type="checkbox" className="rounded border-[color:var(--color-border)]" />
                              <span>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {param.type === 'date_range' && (
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            className="px-3 py-2 border border-[color:var(--color-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent-border)]"
                            placeholder="Start date"
                          />
                          <input
                            type="date"
                            className="px-3 py-2 border border-[color:var(--color-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent-border)]"
                            placeholder="End date"
                          />
                        </div>
                      )}

                      {param.type === 'boolean' && (
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            defaultChecked={param.defaultValue}
                            className="rounded border-[color:var(--color-border)]"
                          />
                          <span className="text-[color:var(--color-muted)]">Enable this option</span>
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button className="w-full px-4 py-3 bg-[color:var(--color-primary)] text-white rounded-lg font-medium hover:bg-[color:var(--color-secondary)] transition-colors flex items-center justify-center gap-2">
                <DownloadIcon className="w-5 h-5" />
                Generate Report
              </button>

              {/* Help Text */}
              <div className="mt-4 p-3 bg-[color:var(--color-surface-alt)] rounded-md">
                <p className="text-xs text-[color:var(--color-muted)]">
                  <strong>Note:</strong> Report generation may take a few minutes depending on the data range and parameters selected. You'll receive a notification when it's ready for download.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
