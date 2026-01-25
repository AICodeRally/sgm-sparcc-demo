'use client';

import { useState, useEffect, useCallback } from 'react';

// =============================================================================
// TYPES
// =============================================================================

export type OrbId = 'ask' | 'ops' | 'pulse' | 'task' | 'kb';

export interface OrbNode {
  id: OrbId;
  label: string;
  icon: string;
  description: string;
  status: 'connected' | 'disconnected' | 'checking' | 'degraded';
  metrics?: {
    latencyMs?: number;
    requestsPerMin?: number;
    errorRate?: number;
  };
}

export interface TelemetrySignal {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'alert' | 'critical';
  source: OrbId | 'external';
  target: OrbId | 'external';
  message: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface OrbConnection {
  id: string;
  from: OrbId | 'external';
  to: OrbId | 'external';
  status: 'active' | 'degraded' | 'inactive';
  volume: 'low' | 'medium' | 'high';
}

interface TelemetryVisualizerProps {
  className?: string;
  showSignalFeed?: boolean;
  compact?: boolean;
}

// =============================================================================
// DEFAULT DATA
// =============================================================================

const DEFAULT_ORBS: OrbNode[] = [
  {
    id: 'ask',
    label: 'AskSGM',
    icon: '💬',
    description: 'Conversational Q&A',
    status: 'checking',
  },
  {
    id: 'ops',
    label: 'OpsChief',
    icon: '👁️',
    description: 'Deep pattern detection',
    status: 'checking',
  },
  {
    id: 'pulse',
    label: 'Pulse',
    icon: '💡',
    description: 'Proactive coaching',
    status: 'checking',
  },
  {
    id: 'task',
    label: 'Tasks',
    icon: '✅',
    description: 'Work orchestration',
    status: 'checking',
  },
  {
    id: 'kb',
    label: 'KB',
    icon: '📚',
    description: 'Knowledge engine',
    status: 'checking',
  },
];

const DEFAULT_CONNECTIONS: OrbConnection[] = [
  { id: 'c1', from: 'external', to: 'ask', status: 'active', volume: 'high' },
  { id: 'c2', from: 'ask', to: 'kb', status: 'active', volume: 'medium' },
  { id: 'c3', from: 'ask', to: 'ops', status: 'active', volume: 'low' },
  { id: 'c4', from: 'ops', to: 'pulse', status: 'active', volume: 'low' },
  { id: 'c5', from: 'pulse', to: 'task', status: 'active', volume: 'low' },
  { id: 'c6', from: 'kb', to: 'ops', status: 'active', volume: 'low' },
];

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function OrbIcon({ orb, size = 48 }: { orb: OrbNode; size?: number }) {
  const statusColors = {
    connected: {
      bg: 'rgba(16, 185, 129, 0.2)',
      border: '#10b981',
      glow: 'rgba(16, 185, 129, 0.5)',
    },
    disconnected: {
      bg: 'rgba(100, 116, 139, 0.2)',
      border: '#64748b',
      glow: 'transparent',
    },
    checking: {
      bg: 'rgba(245, 158, 11, 0.2)',
      border: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.3)',
    },
    degraded: {
      bg: 'rgba(239, 68, 68, 0.2)',
      border: '#ef4444',
      glow: 'rgba(239, 68, 68, 0.4)',
    },
  };

  const colors = statusColors[orb.status];

  return (
    <div
      className="relative flex items-center justify-center rounded-full transition-all duration-300"
      style={{
        width: size,
        height: size,
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        boxShadow: orb.status === 'connected'
          ? `0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}`
          : `0 0 10px ${colors.glow}`,
      }}
    >
      <span className="text-lg">{orb.icon}</span>
      {/* Status dot */}
      <span
        className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[color:var(--color-surface)] ${
          orb.status === 'connected' ? 'bg-[color:var(--color-success)] animate-pulse' :
          orb.status === 'checking' ? 'bg-[color:var(--color-warning)] animate-pulse' :
          orb.status === 'degraded' ? 'bg-[color:var(--color-error)]' :
          'bg-[color:var(--color-muted)]'
        }`}
      />
    </div>
  );
}

function AnimatedConnection({
  fromPos,
  toPos,
  connection,
}: {
  fromPos: { x: number; y: number };
  toPos: { x: number; y: number };
  connection: OrbConnection;
}) {
  const particleCount = connection.volume === 'high' ? 4 : connection.volume === 'medium' ? 2 : 1;

  const statusColors = {
    active: '#10b981',
    degraded: '#f59e0b',
    inactive: '#64748b',
  };

  const color = statusColors[connection.status];

  // Calculate curved path
  const midX = (fromPos.x + toPos.x) / 2;
  const midY = (fromPos.y + toPos.y) / 2;
  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;
  const curve = Math.sqrt(dx * dx + dy * dy) * 0.2;

  // Perpendicular offset for curve
  const perpX = -dy / Math.sqrt(dx * dx + dy * dy) * curve;
  const perpY = dx / Math.sqrt(dx * dx + dy * dy) * curve;

  const pathD = `M ${fromPos.x} ${fromPos.y} Q ${midX + perpX} ${midY + perpY} ${toPos.x} ${toPos.y}`;
  const pathId = `path-${connection.id}`;

  return (
    <g>
      {/* Base path */}
      <path
        d={pathD}
        fill="none"
        stroke="rgba(148, 163, 184, 0.2)"
        strokeWidth="2"
      />

      {/* Animated glow path */}
      {connection.status !== 'inactive' && (
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeOpacity="0.6"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      )}

      {/* Animated particles */}
      {connection.status === 'active' && Array.from({ length: particleCount }).map((_, i) => (
        <circle
          key={i}
          r="3"
          fill={color}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        >
          <animateMotion
            dur={`${1.5 + i * 0.5}s`}
            repeatCount="indefinite"
            begin={`${i * 0.4}s`}
          >
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </circle>
      ))}

      {/* Hidden path for animation reference */}
      <path id={pathId} d={pathD} fill="none" stroke="none" />
    </g>
  );
}

function SignalFeed({ signals }: { signals: TelemetrySignal[] }) {
  const severityColors = {
    info: 'text-[color:var(--color-info)] bg-[color:var(--color-info-bg)] border-[color:var(--color-info-border)]',
    warning: 'text-[color:var(--color-warning)] bg-[color:var(--color-warning-bg)] border-[color:var(--color-warning-border)]',
    alert: 'text-[color:var(--color-error)] bg-[color:var(--color-error-bg)] border-[color:var(--color-error-border)]',
    critical: 'text-white bg-red-600 border-red-700',
  };

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto">
      {signals.length === 0 ? (
        <div className="text-center py-4 text-sm text-[color:var(--color-muted)]">
          No recent signals
        </div>
      ) : (
        signals.map((signal) => (
          <div
            key={signal.id}
            className={`px-3 py-2 rounded-lg border text-xs ${severityColors[signal.severity]}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{signal.type}</span>
              <span className="opacity-70">
                {signal.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <div className="mt-1 opacity-90">{signal.message}</div>
            <div className="mt-1 opacity-70 text-[10px]">
              {signal.source} → {signal.target}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TelemetryVisualizer({
  className = '',
  showSignalFeed = true,
  compact = false,
}: TelemetryVisualizerProps) {
  const [orbs, setOrbs] = useState<OrbNode[]>(DEFAULT_ORBS);
  const [connections, setConnections] = useState<OrbConnection[]>(DEFAULT_CONNECTIONS);
  const [signals, setSignals] = useState<TelemetrySignal[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Check health of orbs
  const checkHealth = useCallback(async () => {
    try {
      // Check AskSGM endpoint
      const askRes = await fetch('/api/ai/asksgm', { method: 'HEAD' }).catch(() => null);
      const askConnected = askRes?.ok ?? false;

      // Update orb statuses based on health check
      setOrbs(prev => prev.map(orb => {
        if (orb.id === 'ask') {
          return { ...orb, status: askConnected ? 'connected' : 'disconnected' };
        }
        // For demo, KB is connected if Ask is connected (shared RAG)
        if (orb.id === 'kb') {
          return { ...orb, status: askConnected ? 'connected' : 'disconnected' };
        }
        // Other orbs show as checking for now (future: real health checks)
        return { ...orb, status: 'checking' };
      }));

      // Update connection statuses
      setConnections(prev => prev.map(conn => {
        if (conn.from === 'external' || conn.to === 'ask' || conn.from === 'ask') {
          return { ...conn, status: askConnected ? 'active' : 'inactive' };
        }
        return conn;
      }));

      setIsConnected(askConnected);

      // Generate a sample signal for demo
      if (askConnected && Math.random() > 0.7) {
        const signalTypes = [
          { type: 'AI_TEL_001', severity: 'info' as const, message: 'Expert invocation successful' },
          { type: 'SPINE_SEARCH', severity: 'info' as const, message: 'RAG search completed (245ms)' },
          { type: 'AI_002', severity: 'warning' as const, message: 'Low confidence response (68%)' },
        ];
        const sample = signalTypes[Math.floor(Math.random() * signalTypes.length)];

        setSignals(prev => [{
          id: `sig-${Date.now()}`,
          type: sample.type,
          severity: sample.severity,
          source: 'ask' as OrbId,
          target: 'kb' as OrbId,
          message: sample.message,
          timestamp: new Date(),
        }, ...prev].slice(0, 10));
      }
    } catch (error) {
      console.error('Health check failed:', error);
    }
  }, []);

  // Initial check and polling
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [checkHealth]);

  // Calculate orb positions for SVG
  const getOrbPosition = (orbId: OrbId | 'external', width: number, height: number) => {
    const positions: Record<OrbId | 'external', { x: number; y: number }> = {
      external: { x: 40, y: height / 2 },
      ask: { x: width * 0.25, y: height / 2 },
      kb: { x: width * 0.5, y: height * 0.25 },
      ops: { x: width * 0.5, y: height * 0.75 },
      pulse: { x: width * 0.75, y: height * 0.35 },
      task: { x: width * 0.75, y: height * 0.65 },
    };
    return positions[orbId];
  };

  const svgWidth = compact ? 300 : 500;
  const svgHeight = compact ? 150 : 250;

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[color:var(--color-foreground)]">
            AI Telemetry
          </span>
          <span className={`flex items-center gap-1 text-xs ${
            isConnected
              ? 'text-[color:var(--color-success)]'
              : 'text-[color:var(--color-muted)]'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              isConnected
                ? 'bg-[color:var(--color-success)] animate-pulse'
                : 'bg-[color:var(--color-muted)]'
            }`} />
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Visualization */}
      <div className="relative bg-[color:var(--color-surface-alt)] rounded-xl border border-[color:var(--color-border)] overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full"
          style={{ height: compact ? 150 : 250 }}
        >
          <defs>
            <filter id="orb-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Connections */}
          <g className="connections">
            {connections.map((conn) => {
              const fromPos = getOrbPosition(conn.from, svgWidth, svgHeight);
              const toPos = getOrbPosition(conn.to, svgWidth, svgHeight);
              return (
                <AnimatedConnection
                  key={conn.id}
                  fromPos={fromPos}
                  toPos={toPos}
                  connection={conn}
                />
              );
            })}
          </g>

          {/* External node (SGM) */}
          <g transform={`translate(${40 - 20}, ${svgHeight / 2 - 20})`}>
            <rect
              x="0"
              y="0"
              width="40"
              height="40"
              rx="8"
              fill="rgba(14, 165, 233, 0.2)"
              stroke="#0ea5e9"
              strokeWidth="2"
              style={{ filter: isConnected ? 'drop-shadow(0 0 8px rgba(14, 165, 233, 0.5))' : undefined }}
            />
            <text x="20" y="25" textAnchor="middle" className="text-lg" fill="white">
              🌐
            </text>
          </g>
          <text
            x="40"
            y={svgHeight / 2 + 35}
            textAnchor="middle"
            className="text-[10px] fill-[color:var(--color-muted)]"
          >
            SGM
          </text>

          {/* Orb nodes */}
          {orbs.map((orb) => {
            const pos = getOrbPosition(orb.id, svgWidth, svgHeight);
            const statusColors = {
              connected: '#10b981',
              disconnected: '#64748b',
              checking: '#f59e0b',
              degraded: '#ef4444',
            };
            return (
              <g key={orb.id}>
                <foreignObject
                  x={pos.x - 24}
                  y={pos.y - 24}
                  width={48}
                  height={48}
                >
                  <OrbIcon orb={orb} size={48} />
                </foreignObject>
                <text
                  x={pos.x}
                  y={pos.y + 35}
                  textAnchor="middle"
                  className="text-[10px] fill-[color:var(--color-muted)]"
                >
                  {orb.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Signal Feed */}
      {showSignalFeed && (
        <div className="mt-4">
          <div className="text-xs font-medium text-[color:var(--color-muted)] mb-2 uppercase tracking-wider">
            Recent Signals
          </div>
          <SignalFeed signals={signals} />
        </div>
      )}

      {/* Legend */}
      {!compact && (
        <div className="mt-3 flex items-center gap-4 text-[10px] text-[color:var(--color-muted)]">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[color:var(--color-success)]" />
            Connected
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[color:var(--color-warning)]" />
            Checking
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[color:var(--color-muted)]" />
            Offline
          </div>
        </div>
      )}
    </div>
  );
}

export default TelemetryVisualizer;
