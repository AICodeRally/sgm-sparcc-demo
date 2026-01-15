'use client';

import { FileTextIcon, InfoCircledIcon, CheckCircledIcon, PersonIcon } from '@radix-ui/react-icons';
import type { DataType, DemoMetadata } from '@/lib/contracts/data-type.contract';

// =============================================================================
// SHARED TYPES
// =============================================================================

interface BadgeProps {
  /** Size of the badge */
  size?: 'sm' | 'md' | 'lg';
  /** Optional custom className */
  className?: string;
}

interface DemoBadgeProps extends BadgeProps {
  /** @deprecated Use dataType instead. Whether this item is demo data */
  isDemo?: boolean;
  /** Data type classification (preferred over isDemo) */
  dataType?: DataType;
  /** Optional demo metadata (year, BU, division, category) */
  demoMetadata?: DemoMetadata;
}

interface TemplateBadgeProps extends BadgeProps {
  /** Optional label override */
  label?: string;
}

interface DataTypeBadgeProps extends BadgeProps {
  /** The data type to display badge for */
  dataType: DataType;
  /** Optional demo metadata for demo items */
  demoMetadata?: DemoMetadata;
}

// Size classes shared across badges
const sizeClasses = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
  lg: 'px-2.5 py-1 text-sm',
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4',
};

// =============================================================================
// DEMO BADGE (Orange)
// =============================================================================

/**
 * DemoBadge - Visual indicator for demo/sample data
 *
 * Features:
 * - Color-coded badge (orange gradient) to make demo data very apparent
 * - Shows "DEMO" label with optional metadata (year, BU, division)
 * - Multiple sizes (sm, md, lg)
 * - Only renders if isDemo is true OR dataType is 'demo'
 *
 * Usage:
 * <DemoBadge dataType="demo" demoMetadata={document.demoMetadata} />
 * <DemoBadge isDemo={true} /> // Legacy support
 */
export function DemoBadge({
  isDemo,
  dataType,
  demoMetadata,
  size = 'md',
  className = ''
}: DemoBadgeProps) {
  // Determine if should show based on new dataType or legacy isDemo
  const shouldShow = dataType === 'demo' || (dataType === undefined && isDemo === true);

  if (!shouldShow) return null;

  // Build badge text
  let badgeText = 'DEMO';
  if (demoMetadata) {
    const parts: string[] = [];
    if (demoMetadata.year) parts.push(demoMetadata.year.toString());
    if (demoMetadata.bu) parts.push(demoMetadata.bu);
    if (demoMetadata.division) parts.push(demoMetadata.division);
    if (demoMetadata.category) parts.push(demoMetadata.category);

    if (parts.length > 0) {
      badgeText = `DEMO: ${parts.join(' | ')}`;
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-semibold uppercase tracking-wide ${sizeClasses[size]} ${className}`}
      style={{
        background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FDB813 100%)',
        color: 'white',
        boxShadow: '0 2px 4px rgba(255, 107, 53, 0.3)',
      }}
      title="This is sample/demo data for demonstration purposes."
    >
      <InfoCircledIcon className={iconSizes[size]} />
      {badgeText}
    </span>
  );
}

// =============================================================================
// CLIENT BADGE (Green)
// =============================================================================

/**
 * ClientBadge - Visual indicator for client/production data
 *
 * Features:
 * - Color-coded badge (green gradient) to identify client data
 * - Shows "CLIENT" label
 * - Multiple sizes (sm, md, lg)
 * - Used for real client data in the system
 *
 * Usage:
 * <ClientBadge />
 * <ClientBadge size="sm" label="Live" />
 */
export function ClientBadge({
  size = 'md',
  className = '',
  label = 'CLIENT'
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-semibold uppercase tracking-wide ${sizeClasses[size]} ${className}`}
      style={{
        background: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)',
        color: 'white',
        boxShadow: '0 2px 4px rgba(5, 150, 105, 0.3)',
      }}
      title="This is live client data."
    >
      <PersonIcon className={iconSizes[size]} />
      {label}
    </span>
  );
}

// =============================================================================
// TEMPLATE BADGE (Teal/Cyan)
// =============================================================================

/**
 * TemplateBadge - Visual indicator for template/baseline data
 *
 * Features:
 * - Color-coded badge (teal/cyan gradient) for template items
 * - Shows "TEMPLATE" label
 * - Multiple sizes (sm, md, lg)
 * - Used for baseline governance documents consultants deliver to clients
 *
 * Usage:
 * <TemplateBadge />
 * <TemplateBadge size="sm" label="Baseline" />
 */
export function TemplateBadge({
  size = 'md',
  className = '',
  label = 'TEMPLATE'
}: TemplateBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-semibold uppercase tracking-wide ${sizeClasses[size]} ${className}`}
      style={{
        background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 50%, #22D3EE 100%)',
        color: 'white',
        boxShadow: '0 2px 4px rgba(13, 148, 136, 0.3)',
      }}
      title="This is a template/baseline document that can be customized for your organization."
    >
      <FileTextIcon className={iconSizes[size]} />
      {label}
    </span>
  );
}

// =============================================================================
// DATA TYPE BADGE (Smart Wrapper)
// =============================================================================

/**
 * DataTypeBadge - Smart badge that renders appropriate badge based on data type
 *
 * Features:
 * - Renders DemoBadge for 'demo' type (orange)
 * - Renders TemplateBadge for 'template' type (teal)
 * - Renders nothing for 'client' type (no visual indicator)
 *
 * Usage:
 * <DataTypeBadge dataType={document.dataType} demoMetadata={document.demoMetadata} />
 */
export function DataTypeBadge({
  dataType,
  demoMetadata,
  size = 'md',
  className = ''
}: DataTypeBadgeProps) {
  switch (dataType) {
    case 'demo':
      return (
        <DemoBadge
          dataType="demo"
          demoMetadata={demoMetadata}
          size={size}
          className={className}
        />
      );
    case 'template':
      return <TemplateBadge size={size} className={className} />;
    case 'client':
      return <ClientBadge size={size} className={className} />;
    default:
      return null;
  }
}

// =============================================================================
// HIGHLIGHT WRAPPERS
// =============================================================================

/**
 * DemoHighlight - Wrapper component that adds demo-specific styling to children
 *
 * Features:
 * - Adds subtle orange border and background tint to demo items
 * - Makes demo items visually distinct in lists
 * - Can be used to wrap cards, rows, or any container
 *
 * Usage:
 * <DemoHighlight dataType="demo">
 *   <div>Your content here</div>
 * </DemoHighlight>
 */
export function DemoHighlight({
  isDemo,
  dataType,
  children,
  className = ''
}: {
  isDemo?: boolean;
  dataType?: DataType;
  children: React.ReactNode;
  className?: string;
}) {
  const shouldHighlight = dataType === 'demo' || (dataType === undefined && isDemo === true);

  if (!shouldHighlight) {
    return <>{children}</>;
  }

  return (
    <div
      className={`relative ${className}`}
      style={{
        borderLeft: '3px solid #FF6B35',
        backgroundColor: 'rgba(255, 107, 53, 0.04)',
      }}
    >
      {children}
    </div>
  );
}

/**
 * TemplateHighlight - Wrapper component that adds template-specific styling to children
 *
 * Features:
 * - Adds subtle teal border and background tint to template items
 * - Makes template items visually distinct in lists
 * - Can be used to wrap cards, rows, or any container
 *
 * Usage:
 * <TemplateHighlight dataType="template">
 *   <div>Your content here</div>
 * </TemplateHighlight>
 */
export function TemplateHighlight({
  dataType,
  children,
  className = ''
}: {
  dataType?: DataType;
  children: React.ReactNode;
  className?: string;
}) {
  if (dataType !== 'template') {
    return <>{children}</>;
  }

  return (
    <div
      className={`relative ${className}`}
      style={{
        borderLeft: '3px solid #0D9488',
        backgroundColor: 'rgba(13, 148, 136, 0.04)',
      }}
    >
      {children}
    </div>
  );
}

/**
 * ClientHighlight - Wrapper component that adds client-specific styling to children
 *
 * Features:
 * - Adds subtle green border and background tint to client items
 * - Makes client items visually distinct in lists
 * - Can be used to wrap cards, rows, or any container
 *
 * Usage:
 * <ClientHighlight dataType="client">
 *   <div>Your content here</div>
 * </ClientHighlight>
 */
export function ClientHighlight({
  dataType,
  children,
  className = ''
}: {
  dataType?: DataType;
  children: React.ReactNode;
  className?: string;
}) {
  if (dataType !== 'client') {
    return <>{children}</>;
  }

  return (
    <div
      className={`relative ${className}`}
      style={{
        borderLeft: '3px solid #059669',
        backgroundColor: 'rgba(5, 150, 105, 0.04)',
      }}
    >
      {children}
    </div>
  );
}

/**
 * DataTypeHighlight - Smart highlight wrapper based on data type
 *
 * Features:
 * - Applies DemoHighlight styling for 'demo' type
 * - Applies TemplateHighlight styling for 'template' type
 * - Applies ClientHighlight styling for 'client' type
 *
 * Usage:
 * <DataTypeHighlight dataType={item.dataType}>
 *   <Card>...</Card>
 * </DataTypeHighlight>
 */
export function DataTypeHighlight({
  dataType,
  children,
  className = ''
}: {
  dataType: DataType;
  children: React.ReactNode;
  className?: string;
}) {
  switch (dataType) {
    case 'demo':
      return (
        <DemoHighlight dataType="demo" className={className}>
          {children}
        </DemoHighlight>
      );
    case 'template':
      return (
        <TemplateHighlight dataType="template" className={className}>
          {children}
        </TemplateHighlight>
      );
    case 'client':
      return (
        <ClientHighlight dataType="client" className={className}>
          {children}
        </ClientHighlight>
      );
    default:
      return <>{children}</>;
  }
}

// =============================================================================
// LEGACY EXPORTS (Deprecated - for backwards compatibility)
// =============================================================================

/**
 * @deprecated LiveBadge has been removed. Client data no longer shows a badge.
 * This is a no-op component for backwards compatibility.
 */
export function LiveBadge(_props: {
  isDemo?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: 'LIVE' | 'PRODUCTION' | 'REAL';
}) {
  // LiveBadge has been removed - client data shows no badge
  // Keeping for backwards compatibility during migration
  return null;
}

/**
 * @deprecated LiveHighlight has been removed. Client data no longer gets special styling.
 * This is a pass-through component for backwards compatibility.
 */
export function LiveHighlight({
  children,
}: {
  isDemo?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  // LiveHighlight has been removed - client data gets no special styling
  // Just render children for backwards compatibility
  return <>{children}</>;
}
