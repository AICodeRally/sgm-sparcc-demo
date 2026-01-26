'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrbs } from '../providers/OrbProvider';
import { DockItem } from './DockItem';
import { DockPanel } from './DockPanel';
import type { OrbId } from '../types/orb';

// Default icons (can be overridden via manifest)
const DEFAULT_ICONS: Record<OrbId, React.ReactNode> = {
  ask: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  ),
  ops: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  pulse: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  tasks: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  kb: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
};

const DEFAULT_LABELS: Record<OrbId, string> = {
  ask: 'Ask',
  ops: 'Ops',
  pulse: 'Pulse',
  tasks: 'Tasks',
  kb: 'KB',
};

export function AIDock() {
  const {
    manifest,
    orbStates,
    activeOrb,
    setActiveOrb,
    dockSettings,
    getOrbBadgeCount,
  } = useOrbs();

  const [isHidden, setIsHidden] = useState(false);
  const [mouseNearDock, setMouseNearDock] = useState(false);

  // Auto-hide logic
  useEffect(() => {
    if (!dockSettings.autoHide) {
      setIsHidden(false);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const threshold = 100;
      const { innerHeight, innerWidth } = window;

      let isNear = false;
      switch (dockSettings.position) {
        case 'bottom':
          isNear = e.clientY > innerHeight - threshold;
          break;
        case 'left':
          isNear = e.clientX < threshold;
          break;
        case 'right':
          isNear = e.clientX > innerWidth - threshold;
          break;
      }

      setMouseNearDock(isNear);
      if (isNear) setIsHidden(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [dockSettings.autoHide, dockSettings.position]);

  // Hide dock after delay when mouse moves away
  useEffect(() => {
    if (!dockSettings.autoHide || mouseNearDock || activeOrb) return;

    const timer = setTimeout(() => setIsHidden(true), 2000);
    return () => clearTimeout(timer);
  }, [mouseNearDock, dockSettings.autoHide, activeOrb]);

  const getPositionClasses = () => {
    switch (dockSettings.position) {
      case 'left':
        return 'left-4 top-1/2 -translate-y-1/2 flex-col';
      case 'right':
        return 'right-4 top-1/2 -translate-y-1/2 flex-col';
      default: // bottom
        return 'bottom-4 left-1/2 -translate-x-1/2 flex-row';
    }
  };

  // Filter visible orbs based on settings and manifest
  const visibleOrbs = dockSettings.orbOrder.filter((orbId) => {
    const config = manifest.orbs[orbId];
    return config?.enabled && dockSettings.orbVisibility[orbId];
  });

  const handleOrbClick = (orbId: OrbId) => {
    setActiveOrb(activeOrb === orbId ? null : orbId);
  };

  return (
    <>
      {/* Dock */}
      <AnimatePresence>
        {!isHidden && (
          <motion.div
            className={`fixed z-50 ${getPositionClasses()}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div
              className={`
                flex gap-1 p-2 rounded-2xl backdrop-blur-xl
                bg-gray-900/80 border border-white/10 shadow-2xl
                ${dockSettings.position === 'left' || dockSettings.position === 'right' ? 'flex-col' : 'flex-row'}
              `}
            >
              {visibleOrbs.map((orbId) => {
                const config = manifest.orbs[orbId];
                const state = orbStates[orbId];
                const label = config?.overrides?.name ?? DEFAULT_LABELS[orbId];

                return (
                  <DockItem
                    key={orbId}
                    orbId={orbId}
                    icon={DEFAULT_ICONS[orbId]}
                    label={label}
                    isActive={activeOrb === orbId}
                    onClick={() => handleOrbClick(orbId)}
                    status={state?.status ?? 'disconnected'}
                    badgeCount={getOrbBadgeCount(orbId)}
                    magnification={dockSettings.magnification}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panels */}
      {visibleOrbs.map((orbId) => {
        const config = manifest.orbs[orbId];
        const label = config?.overrides?.name ?? DEFAULT_LABELS[orbId];

        return (
          <DockPanel
            key={`panel-${orbId}`}
            orbId={orbId}
            isOpen={activeOrb === orbId}
            onClose={() => setActiveOrb(null)}
            title={label}
            position={dockSettings.position}
          >
            {/* Orb-specific content will be rendered here */}
            <div className="p-4 text-gray-500 dark:text-gray-400 text-sm">
              {orbId} panel content
            </div>
          </DockPanel>
        );
      })}
    </>
  );
}
