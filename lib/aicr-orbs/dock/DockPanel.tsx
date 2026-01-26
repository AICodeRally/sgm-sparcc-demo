'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { OrbId } from '../types/orb';
import type { DockPosition } from '../types/manifest';

interface DockPanelProps {
  orbId: OrbId;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  position: DockPosition;
}

export function DockPanel({
  orbId,
  isOpen,
  onClose,
  children,
  title,
  position,
}: DockPanelProps) {
  const getPositionStyles = () => {
    switch (position) {
      case 'left':
        return {
          panel: 'left-20 bottom-4',
          animation: { initial: { x: -20, opacity: 0 }, animate: { x: 0, opacity: 1 } },
        };
      case 'right':
        return {
          panel: 'right-20 bottom-4',
          animation: { initial: { x: 20, opacity: 0 }, animate: { x: 0, opacity: 1 } },
        };
      default: // bottom
        return {
          panel: 'bottom-20 left-1/2 -translate-x-1/2',
          animation: { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 } },
        };
    }
  };

  const posStyles = getPositionStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed ${posStyles.panel} z-40 w-96 max-h-[70vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden`}
          initial={posStyles.animation.initial}
          animate={posStyles.animation.animate}
          exit={{ ...posStyles.animation.initial, transition: { duration: 0.15 } }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
            <div className="flex items-center gap-2">
              <a
                href={`/orbs/${orbId}`}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Open Full Page
              </a>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(70vh-60px)]">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
