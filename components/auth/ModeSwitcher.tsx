'use client';

import React, { useState } from 'react';
import {
  Pencil2Icon,
  GearIcon,
  ExclamationTriangleIcon,
  EyeOpenIcon,
  ChevronDownIcon,
  CheckIcon,
} from '@radix-ui/react-icons';
import { OperationalMode } from '@/types/operational-mode';
import { useMode } from '@/lib/auth/mode-context';
import { getModeConfig } from '@/lib/auth/mode-permissions';

/**
 * Mode Switcher Dropdown
 * Allows users to switch between operational modes
 */
export function ModeSwitcher() {
  const { currentMode, availableModes, switchMode } = useMode();
  const [isOpen, setIsOpen] = useState(false);

  // Map icon names to actual icon components
  const iconMap = {
    Pencil2Icon: Pencil2Icon,
    GearIcon: GearIcon,
    ExclamationTriangleIcon: ExclamationTriangleIcon,
    EyeOpenIcon: EyeOpenIcon,
  };

  const handleModeSwitch = async (mode: OperationalMode) => {
    try {
      await switchMode(mode);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch mode:', error);
    }
  };

  if (!currentMode || availableModes.length <= 1) {
    return null; // Don't show if no mode or only one mode available
  }

  const currentConfig = getModeConfig(currentMode);
  const CurrentIcon = iconMap[currentConfig.icon as keyof typeof iconMap] || GearIcon;

  const modeColor = currentConfig.color.hex;

  return (
    <div className="relative">
      {/* Current Mode Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 hover:shadow-md transition-all"
        style={{
          borderColor: `${modeColor}70`,
          background: `${modeColor}14`,
          color: modeColor,
        }}
      >
        <div className="w-2 h-2 rounded-full" style={{ background: modeColor }} />
        <CurrentIcon className="w-4 h-4" />
        <span className="font-semibold text-sm">{currentConfig.label}</span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-[color:var(--color-surface)] rounded-lg shadow-xl border-2 border-[color:var(--color-border)] z-50 overflow-hidden">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wide">
                Switch Mode
              </div>

              {availableModes.map((mode) => {
                const config = getModeConfig(mode);
                const Icon = iconMap[config.icon as keyof typeof iconMap] || GearIcon;
                const isActive = mode === currentMode;

                // Get color for this mode
                const optionColor = config.color.hex;
                const activeStyle = {
                  background: `${optionColor}14`,
                  borderColor: `${optionColor}70`,
                };

                return (
                  <button
                    key={mode}
                    onClick={() => handleModeSwitch(mode)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all border-2 ${
                      isActive
                        ? 'border-transparent'
                        : 'hover:bg-[color:var(--color-surface-alt)] border-transparent'
                    }`}
                    style={isActive ? activeStyle : undefined}
                  >
                    <Icon className="w-5 h-5" style={{ color: optionColor }} />
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-sm text-[color:var(--color-foreground)]">
                        {config.label}
                      </div>
                      <div className="text-xs text-[color:var(--color-muted)] line-clamp-1">
                        {config.tagline}
                      </div>
                    </div>
                    {isActive && (
                      <CheckIcon className="w-5 h-5" style={{ color: optionColor }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
