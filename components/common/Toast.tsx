'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircledIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  Cross2Icon,
} from '@radix-ui/react-icons';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ type, message, onClose, duration = 5000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircledIcon,
      className: 'bg-[color:var(--color-success-bg)] border-[color:var(--color-success-border)] text-[color:var(--color-success)]',
      iconColor: 'text-[color:var(--color-success)]',
    },
    error: {
      icon: ExclamationTriangleIcon,
      className: 'bg-[color:var(--color-error-bg)] border-[color:var(--color-error-border)] text-[color:var(--color-error)]',
      iconColor: 'text-[color:var(--color-error)]',
    },
    warning: {
      icon: ExclamationTriangleIcon,
      className: 'bg-[color:var(--color-warning-bg)] border-[color:var(--color-warning-border)] text-[color:var(--color-warning)]',
      iconColor: 'text-[color:var(--color-warning)]',
    },
    info: {
      icon: InfoCircledIcon,
      className: 'bg-[color:var(--color-surface-alt)] border-[color:var(--color-primary)] text-[color:var(--color-info)]',
      iconColor: 'text-[color:var(--color-info)]',
    },
  };

  const { icon: Icon, className, iconColor } = config[type];

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div className={`flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-lg max-w-md ${className}`}>
        <Icon className={`h-6 w-6 flex-none ${iconColor}`} />
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="p-1 hover:bg-black/5 rounded transition-colors"
        >
          <Cross2Icon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
