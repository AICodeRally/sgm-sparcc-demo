'use client';

import { useState, useEffect } from 'react';
import { SetPageTitle } from '@/components/SetPageTitle';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  EyeOpenIcon,
  EyeClosedIcon,
  ResetIcon,
  CheckIcon,
} from '@radix-ui/react-icons';
import { METRIC_GROUPS, getMetricGroupsByMode } from '@/lib/data/metric-registry';
import { OperationalMode } from '@/types/operational-mode';
import { getModeConfig } from '@/lib/auth/mode-permissions';

interface StackConfig {
  metricIds: string[];
  visible: boolean;
}

interface ModeStackConfig {
  [stackIndex: number]: StackConfig;
}

interface AllStacksConfig {
  [mode: string]: ModeStackConfig;
}

const STORAGE_KEY = 'metric-stacks-config';

export default function MetricsSettingsPage() {
  const [config, setConfig] = useState<AllStacksConfig>({});
  const [activeMode, setActiveMode] = useState<OperationalMode>(OperationalMode.DESIGN);
  const [saved, setSaved] = useState(false);

  const modes = Object.values(OperationalMode);

  // Load config from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setConfig(JSON.parse(stored));
      } catch {
        // Invalid config, will use defaults
      }
    }
  }, []);

  // Get metrics for active mode
  const modeMetricGroups = getMetricGroupsByMode(activeMode);
  const allModeMetrics = modeMetricGroups.flatMap(g => g.metrics);
  const modeConfig = getModeConfig(activeMode);
  const modeColor = modeConfig.color.hex;

  // Get current stack config for active mode (or defaults)
  const getModeStackConfig = (mode: OperationalMode): ModeStackConfig => {
    if (config[mode]) return config[mode];

    // Default: distribute metrics across 4 stacks
    const metrics = getMetricGroupsByMode(mode).flatMap(g => g.metrics);
    const defaultConfig: ModeStackConfig = {};

    for (let i = 0; i < 4; i++) {
      const stackMetrics = metrics.filter((_, idx) => idx % 4 === i);
      defaultConfig[i] = {
        metricIds: stackMetrics.map(m => m.id),
        visible: true,
      };
    }

    return defaultConfig;
  };

  const currentModeConfig = getModeStackConfig(activeMode);

  // Move metric up in stack
  const moveUp = (stackIndex: number, metricIndex: number) => {
    if (metricIndex === 0) return;

    const newConfig = { ...config };
    if (!newConfig[activeMode]) {
      newConfig[activeMode] = getModeStackConfig(activeMode);
    }

    const stack = [...newConfig[activeMode][stackIndex].metricIds];
    [stack[metricIndex - 1], stack[metricIndex]] = [stack[metricIndex], stack[metricIndex - 1]];
    newConfig[activeMode][stackIndex].metricIds = stack;

    setConfig(newConfig);
    setSaved(false);
  };

  // Move metric down in stack
  const moveDown = (stackIndex: number, metricIndex: number) => {
    const stack = currentModeConfig[stackIndex]?.metricIds || [];
    if (metricIndex >= stack.length - 1) return;

    const newConfig = { ...config };
    if (!newConfig[activeMode]) {
      newConfig[activeMode] = getModeStackConfig(activeMode);
    }

    const newStack = [...newConfig[activeMode][stackIndex].metricIds];
    [newStack[metricIndex], newStack[metricIndex + 1]] = [newStack[metricIndex + 1], newStack[metricIndex]];
    newConfig[activeMode][stackIndex].metricIds = newStack;

    setConfig(newConfig);
    setSaved(false);
  };

  // Toggle stack visibility
  const toggleVisibility = (stackIndex: number) => {
    const newConfig = { ...config };
    if (!newConfig[activeMode]) {
      newConfig[activeMode] = getModeStackConfig(activeMode);
    }

    newConfig[activeMode][stackIndex].visible = !newConfig[activeMode][stackIndex].visible;
    setConfig(newConfig);
    setSaved(false);
  };

  // Save config
  const saveConfig = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Reset to defaults
  const resetDefaults = () => {
    const newConfig = { ...config };
    delete newConfig[activeMode];
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    setSaved(false);
  };

  // Get metric by ID
  const getMetricById = (id: string) => {
    return allModeMetrics.find(m => m.id === id);
  };

  return (
    <>
      <SetPageTitle
        title="Metric Stacks Settings"
        description="Configure which metrics appear in each stack on the dashboard"
      />
      <div className="min-h-screen bg-[color:var(--color-background)]">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[color:var(--color-foreground)]">
              Metric Stacks Configuration
            </h1>
            <p className="text-[color:var(--color-muted)] mt-2">
              Configure which metrics appear in each stack on the dashboard. Each stack can rotate through multiple metrics.
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {modes.map(mode => {
              const cfg = getModeConfig(mode);
              return (
                <button
                  key={mode}
                  onClick={() => setActiveMode(mode)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                    activeMode === mode
                      ? 'text-white shadow-lg'
                      : 'text-[color:var(--color-muted)] bg-[color:var(--color-surface)] hover:bg-[color:var(--color-surface-alt)]'
                  }`}
                  style={activeMode === mode ? { backgroundColor: cfg.color.hex } : {}}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>

          {/* Stack Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[0, 1, 2, 3].map(stackIndex => {
              const stack = currentModeConfig[stackIndex];
              if (!stack) return null;

              return (
                <div
                  key={stackIndex}
                  className={`rounded-xl border p-4 transition-all ${
                    stack.visible ? '' : 'opacity-50'
                  }`}
                  style={{
                    borderColor: `${modeColor}30`,
                    backgroundColor: `${modeColor}05`,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-[color:var(--color-foreground)]">
                      Stack {stackIndex + 1}
                    </h3>
                    <button
                      onClick={() => toggleVisibility(stackIndex)}
                      className="p-1.5 rounded-lg hover:bg-[color:var(--color-surface-alt)] transition-colors"
                      title={stack.visible ? 'Hide stack' : 'Show stack'}
                    >
                      {stack.visible ? (
                        <EyeOpenIcon className="w-4 h-4 text-[color:var(--color-foreground)]" />
                      ) : (
                        <EyeClosedIcon className="w-4 h-4 text-[color:var(--color-muted)]" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {stack.metricIds.map((metricId, metricIndex) => {
                      const metric = getMetricById(metricId);
                      if (!metric) return null;

                      return (
                        <div
                          key={metricId}
                          className="flex items-center gap-2 p-2 rounded-lg bg-[color:var(--color-surface)] border border-[color:var(--color-border)]"
                        >
                          <div className="flex flex-col">
                            <button
                              onClick={() => moveUp(stackIndex, metricIndex)}
                              disabled={metricIndex === 0}
                              className="p-0.5 hover:bg-[color:var(--color-surface-alt)] rounded disabled:opacity-30"
                            >
                              <ChevronUpIcon className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => moveDown(stackIndex, metricIndex)}
                              disabled={metricIndex === stack.metricIds.length - 1}
                              className="p-0.5 hover:bg-[color:var(--color-surface-alt)] rounded disabled:opacity-30"
                            >
                              <ChevronDownIcon className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[color:var(--color-foreground)] truncate">
                              {metric.label}
                            </p>
                            <p className="text-xs text-[color:var(--color-muted)] truncate">
                              {metric.description}
                            </p>
                          </div>
                          <span
                            className="text-xs font-mono px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: `${modeColor}20`, color: modeColor }}
                          >
                            #{metricIndex + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {stack.metricIds.length === 0 && (
                    <p className="text-sm text-[color:var(--color-muted)] text-center py-4">
                      No metrics in this stack
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={saveConfig}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: modeColor }}
            >
              {saved ? <CheckIcon className="w-4 h-4" /> : null}
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
            <button
              onClick={resetDefaults}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[color:var(--color-surface)] border border-[color:var(--color-border)] text-[color:var(--color-foreground)] font-medium hover:bg-[color:var(--color-surface-alt)] transition-all"
            >
              <ResetIcon className="w-4 h-4" />
              Reset to Defaults
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 p-4 rounded-lg bg-[color:var(--color-surface-alt)] border border-[color:var(--color-border)]">
            <h4 className="font-semibold text-[color:var(--color-foreground)] mb-2">
              How Stacks Work
            </h4>
            <ul className="text-sm text-[color:var(--color-muted)] space-y-1">
              <li>• Each mode card on the dashboard shows 4 metric stacks in a 2×2 grid</li>
              <li>• Click any metric to rotate through the stack and see other metrics</li>
              <li>• Use the arrows to reorder metrics within a stack (first = default shown)</li>
              <li>• Toggle the eye icon to hide/show entire stacks</li>
              <li>• Changes are saved per-browser and persist across sessions</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
