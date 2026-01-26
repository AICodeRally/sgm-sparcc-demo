'use client';

import { motion } from 'framer-motion';
import type { OrbId, OrbStatus } from '../types/orb';
import { useOrbs } from '../providers/OrbProvider';

interface DockItemProps {
  orbId: OrbId;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  status: OrbStatus;
  badgeCount: number;
  magnification: boolean;
}

export function DockItem({
  orbId,
  icon,
  label,
  isActive,
  onClick,
  status,
  badgeCount,
  magnification,
}: DockItemProps) {
  const { dockSettings } = useOrbs();

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'checking':
        return 'bg-yellow-500 animate-pulse';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <motion.button
      onClick={onClick}
      className="relative flex flex-col items-center gap-1 p-2 rounded-xl transition-colors hover:bg-white/10"
      whileHover={magnification ? { scale: 1.3, y: -8 } : {}}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {/* Icon container */}
      <div
        className={`
          w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl
          shadow-lg transition-all
          ${isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : ''}
        `}
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #0891b2 100%)',
        }}
      >
        {icon}
      </div>

      {/* Label */}
      <span className="text-xs text-white/80 font-medium">{label}</span>

      {/* Status dot */}
      <div
        className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full ${getStatusColor()} border border-white/20`}
      />

      {/* Badge */}
      {dockSettings.showBadges && badgeCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center"
        >
          {badgeCount > 99 ? '99+' : badgeCount}
        </motion.div>
      )}

      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="dock-active-indicator"
          className="absolute -bottom-1 w-1 h-1 rounded-full bg-white"
        />
      )}
    </motion.button>
  );
}
