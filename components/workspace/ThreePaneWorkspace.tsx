'use client';

import React, { ReactNode } from 'react';

interface ThreePaneWorkspaceProps {
  leftNav: ReactNode;
  centerContent: ReactNode;
  rightDetail?: ReactNode;
  showRightPane?: boolean;
}

/**
 * Summit-grade 3-pane workspace layout
 * Pattern: Legal policy system / document management
 *
 * Layout:
 * - Left: Section navigation (200px fixed)
 * - Center: List/Grid with filters and bulk actions (flexible)
 * - Right: Detail pane with tabs and context (400px fixed, collapsible)
 */
export function ThreePaneWorkspace({
  leftNav,
  centerContent,
  rightDetail,
  showRightPane = false,
}: ThreePaneWorkspaceProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden sparcc-hero-bg">
      {/* Left Navigation - Fixed width */}
      <div className="flex-none w-56 border-r border-[color:var(--color-border)] bg-[color:var(--surface-glass)] backdrop-blur-sm overflow-y-auto">
        {leftNav}
      </div>

      {/* Center Content - Flexible */}
      <div className="flex-1 overflow-y-auto">
        {centerContent}
      </div>

      {/* Right Detail Pane - Fixed width, collapsible */}
      {showRightPane && rightDetail && (
        <div className="flex-none w-96 border-l border-[color:var(--color-border)] bg-[color:var(--surface-glass)] backdrop-blur-sm overflow-y-auto">
          {rightDetail}
        </div>
      )}
    </div>
  );
}
