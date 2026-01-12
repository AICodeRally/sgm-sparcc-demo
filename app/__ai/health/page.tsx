/**
 * AI Health Debug Page
 * Development endpoint for monitoring AI system status
 * URL: /__ai/health
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";

interface HealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'error';
  lastCheck: string;
  details?: string;
}

export default function AIHealthPage() {
  const [health, setHealth] = useState<HealthStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    setIsLoading(true);
    const checks: HealthStatus[] = [];

    // Check OpsChief endpoint
    try {
      const response = await fetch('/api/ai/opschief?tenantId=platform');
      checks.push({
        service: 'OpsChief API',
        status: response.ok ? 'healthy' : 'error',
        lastCheck: new Date().toISOString(),
        details: response.ok ? 'Responding normally' : `HTTP ${response.status}`
      });
    } catch (error) {
      checks.push({
        service: 'OpsChief API',
        status: 'error',
        lastCheck: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Check AskSGM endpoint
    try {
      const response = await fetch('/api/ai/asksgm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'health check' }],
          tenantId: 'platform'
        })
      });
      checks.push({
        service: 'AskSGM API',
        status: response.ok ? 'healthy' : 'error',
        lastCheck: new Date().toISOString(),
        details: response.ok ? 'Responding normally' : `HTTP ${response.status}`
      });
    } catch (error) {
      checks.push({
        service: 'AskSGM API',
        status: 'error',
        lastCheck: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Check environment variables
    const hasAnthropicKey = !!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
    checks.push({
      service: 'Environment Config',
      status: hasAnthropicKey ? 'healthy' : 'degraded',
      lastCheck: new Date().toISOString(),
      details: hasAnthropicKey ? 'API keys configured' : 'Some API keys missing'
    });

    setHealth(checks);
    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)] border-[color:var(--color-success-border)]';
      case 'degraded': return 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] border-[color:var(--color-warning-border)]';
      case 'error': return 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)] border-[color:var(--color-error-border)]';
      default: return 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)] border-[color:var(--color-border)]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircledIcon className="w-5 h-5" style={{ color: 'var(--color-success)' }} />;
      case 'degraded':
        return <ExclamationTriangleIcon className="w-5 h-5" style={{ color: 'var(--color-warning)' }} />;
      case 'error':
        return <CrossCircledIcon className="w-5 h-5" style={{ color: 'var(--color-error)' }} />;
      default:
        return <InfoCircledIcon className="w-5 h-5" style={{ color: 'var(--color-muted)' }} />;
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-surface-alt)] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[color:var(--color-foreground)] mb-2">AI System Health</h1>
          <p className="text-[color:var(--color-muted)]">SGM SPARCC - AI Services Status Monitor</p>
        </div>

        <div className="bg-[color:var(--color-surface)] rounded-lg shadow-sm border border-[color:var(--color-border)] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[color:var(--color-foreground)]">Service Status</h2>
            <button
              onClick={checkHealth}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-[color:var(--color-primary)] rounded-md hover:bg-[color:var(--color-secondary)] disabled:opacity-50"
            >
              {isLoading ? 'Checking...' : 'Refresh'}
            </button>
          </div>

          <div className="space-y-3">
            {health.map((check, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${getStatusColor(check.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl inline-flex items-center justify-center">
                      {getStatusIcon(check.status)}
                    </span>
                    <div>
                      <h3 className="font-semibold">{check.service}</h3>
                      <p className="text-sm">{check.details}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs uppercase font-semibold">{check.status}</span>
                    <p className="text-xs opacity-75">
                      {new Date(check.lastCheck).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[color:var(--color-surface-alt)] border border-[color:var(--color-border)] rounded-lg p-4">
          <h3 className="font-semibold text-[color:var(--color-accent)] mb-2 flex items-center gap-2">
            <InfoCircledIcon className="w-4 h-4" />
            About This Page
          </h3>
          <p className="text-sm text-[color:var(--color-accent)]">
            This development page monitors the health of AI services in SGM SPARCC.
            It checks the availability and responsiveness of OpsChief and AskSGM endpoints.
          </p>
        </div>
      </div>
    </div>
  );
}
