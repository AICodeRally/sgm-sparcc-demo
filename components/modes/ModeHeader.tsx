'use client';

import React from 'react';
import {
  Pencil2Icon,
  GearIcon,
  ExclamationTriangleIcon,
  EyeOpenIcon,
} from '@radix-ui/react-icons';
import { OperationalMode } from '@/types/operational-mode';
import { getModeConfig } from '@/lib/auth/mode-permissions';

interface ModeHeaderProps {
  mode: OperationalMode;
  description?: string;
}

/**
 * Header section for mode landing pages
 * Displays mode icon, title, and description with gradient background
 */
export function ModeHeader({ mode, description }: ModeHeaderProps) {
  const config = getModeConfig(mode);
  const displayDescription = description || config.description;

  // Map icon names to actual icon components
  const iconMap = {
    Pencil2Icon: Pencil2Icon,
    GearIcon: GearIcon,
    ExclamationTriangleIcon: ExclamationTriangleIcon,
    EyeOpenIcon: EyeOpenIcon,
  };

  const IconComponent = iconMap[config.icon as keyof typeof iconMap] || GearIcon;

  const gradientStyle = {
    backgroundImage: `linear-gradient(90deg, color-mix(in srgb, ${config.color.hex} 78%, var(--color-background)), ${config.color.hex})`,
  };

  return (
    <div className="rounded-xl p-8 mb-8 shadow-xl" style={gradientStyle}>
      <div className="flex items-center gap-6">
        <div className="bg-[color:var(--color-surface)] rounded-xl p-4 shadow-lg">
          <IconComponent className="w-12 h-12 text-[color:var(--color-foreground)]" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{config.label} Mode</h1>
          <p className="text-xl text-white/90">{displayDescription}</p>
        </div>
      </div>
    </div>
  );
}
