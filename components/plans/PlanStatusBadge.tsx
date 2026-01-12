import {
  FileTextIcon,
  ClockIcon,
  EyeOpenIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  RocketIcon,
  ArchiveIcon,
} from '@radix-ui/react-icons';

interface PlanStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function PlanStatusBadge({
  status,
  size = 'md',
  showIcon = true,
}: PlanStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return {
          label: 'Draft',
          icon: FileTextIcon,
          className: 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)] border-[color:var(--color-border)]',
        };
      case 'IN_PROGRESS':
        return {
          label: 'In Progress',
          icon: ClockIcon,
          className: 'bg-[color:var(--color-info-bg)] text-[color:var(--color-info)] border-[color:var(--color-info-border)]',
        };
      case 'UNDER_REVIEW':
        return {
          label: 'Under Review',
          icon: EyeOpenIcon,
          className: 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] border-[color:var(--color-warning-border)]',
        };
      case 'PENDING_APPROVAL':
        return {
          label: 'Pending Approval',
          icon: ClockIcon,
          className: 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] border-[color:var(--color-warning-border)]',
        };
      case 'APPROVED':
        return {
          label: 'Approved',
          icon: CheckCircledIcon,
          className: 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)] border-[color:var(--color-success-border)]',
        };
      case 'PUBLISHED':
        return {
          label: 'Published',
          icon: RocketIcon,
          className: 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-accent)] border-[color:var(--color-border)]',
        };
      case 'SUPERSEDED':
        return {
          label: 'Superseded',
          icon: CrossCircledIcon,
          className: 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-muted)] border-[color:var(--color-border)]',
        };
      case 'ARCHIVED':
        return {
          label: 'Archived',
          icon: ArchiveIcon,
          className: 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-muted)] border-[color:var(--color-border)]',
        };
      default:
        return {
          label: status,
          icon: FileTextIcon,
          className: 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)] border-[color:var(--color-border)]',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${config.className} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </span>
  );
}
