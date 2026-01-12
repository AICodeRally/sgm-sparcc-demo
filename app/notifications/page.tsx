'use client';

import React, { useState, useMemo } from 'react';
import {
  BellIcon,
  CheckCircledIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FileTextIcon,
  DotFilledIcon,
  EnvelopeClosedIcon,
  EnvelopeOpenIcon,
  CalendarIcon,
  ChatBubbleIcon,
  UpdateIcon,
  ReaderIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';
import {
  NOTIFICATIONS,
  NOTIFICATION_TYPE_INFO,
  NOTIFICATION_STATS,
  getUnreadNotifications,
  getActionRequiredNotifications,
  Notification,
  NotificationType,
} from '@/lib/data/synthetic/notifications.data';

export default function NotificationsPage() {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [showOnlyActionRequired, setShowOnlyActionRequired] = useState(false);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = NOTIFICATIONS.filter(n => !n.isArchived);

    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.type === filterType);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(n => n.priority === filterPriority);
    }

    if (showOnlyUnread) {
      filtered = filtered.filter(n => !n.isRead);
    }

    if (showOnlyActionRequired) {
      filtered = filtered.filter(n => n.actionRequired);
    }

    return filtered;
  }, [filterType, filterPriority, showOnlyUnread, showOnlyActionRequired]);

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    const groups: { [key: string]: Notification[] } = {
      Today: [],
      Yesterday: [],
      'This Week': [],
      Older: [],
    };

    filteredNotifications.forEach(notif => {
      const notifDate = new Date(notif.timestamp);
      notifDate.setHours(0, 0, 0, 0);

      if (notifDate.getTime() === today.getTime()) {
        groups.Today.push(notif);
      } else if (notifDate.getTime() === yesterday.getTime()) {
        groups.Yesterday.push(notif);
      } else if (notifDate >= thisWeek) {
        groups['This Week'].push(notif);
      } else {
        groups.Older.push(notif);
      }
    });

    return groups;
  }, [filteredNotifications]);

  // Get icon for notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'APPROVAL_REQUIRED':
        return CheckCircledIcon;
      case 'CASE_ASSIGNED':
        return FileTextIcon;
      case 'SLA_WARNING':
        return ClockIcon;
      case 'MEETING_INVITE':
        return CalendarIcon;
      case 'POLICY_REVIEW':
        return ReaderIcon;
      case 'COMMENT_MENTION':
        return ChatBubbleIcon;
      case 'STATUS_CHANGE':
        return UpdateIcon;
      case 'DOCUMENT_PUBLISHED':
        return FileTextIcon;
      default:
        return BellIcon;
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)] border-[color:var(--color-error-border)]';
      case 'HIGH':
        return 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] border-[color:var(--color-warning-border)]';
      case 'MEDIUM':
        return 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] border-[color:var(--color-warning-border)]';
      case 'LOW':
        return 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)] border-[color:var(--color-border)]';
      default:
        return 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)] border-[color:var(--color-border)]';
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <>
      <SetPageTitle
        title="Notifications Center"
        description="Centralized action items inbox with priority filtering"
      />
      <div className="h-screen sparcc-hero-bg flex flex-col">
        {/* Header */}
        <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <div className="bg-[color:var(--color-surface-alt)] px-3 py-1 rounded-full">
                <span className="font-semibold text-[color:var(--color-primary)]">{NOTIFICATION_STATS.unread}</span>
                <span className="text-[color:var(--color-primary)] ml-1">unread</span>
              </div>
              <div className="bg-[color:var(--color-error-bg)] px-3 py-1 rounded-full">
                <span className="font-semibold text-[color:var(--color-error)]">{NOTIFICATION_STATS.actionRequired}</span>
                <span className="text-[color:var(--color-error)] ml-1">action required</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Notification List */}
        <div className="flex-1 border-r border-[color:var(--color-border)] bg-[color:var(--surface-glass)] backdrop-blur-sm overflow-y-auto">
          <div className="p-4">
            {/* Filters */}
            <div className="mb-4 space-y-3">
              {/* Quick Filters */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowOnlyUnread(!showOnlyUnread);
                    setShowOnlyActionRequired(false);
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    showOnlyUnread
                      ? 'bg-[color:var(--color-primary)] text-white'
                      : 'bg-[color:var(--color-surface)] border border-[color:var(--color-border)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
                  }`}
                >
                  <EnvelopeClosedIcon className="w-4 h-4" />
                  Unread ({NOTIFICATION_STATS.unread})
                </button>
                <button
                  onClick={() => {
                    setShowOnlyActionRequired(!showOnlyActionRequired);
                    setShowOnlyUnread(false);
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    showOnlyActionRequired
                      ? 'bg-[color:var(--color-error)] text-white'
                      : 'bg-[color:var(--color-surface)] border border-[color:var(--color-border)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
                  }`}
                >
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  Action Required ({NOTIFICATION_STATS.actionRequired})
                </button>
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    filterType === 'all'
                      ? 'bg-[color:var(--color-primary)] text-white'
                      : 'bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)] border border-[color:var(--color-border)]'
                  }`}
                >
                  All Types
                </button>
                {Object.entries(NOTIFICATION_TYPE_INFO).map(([key, info]) => {
                  const count = NOTIFICATIONS.filter(n => n.type === key && !n.isArchived).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={key}
                      onClick={() => setFilterType(key)}
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                        filterType === key
                          ? 'text-white border-transparent'
                          : 'bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)] border-[color:var(--color-border)]'
                      }`}
                      style={{
                        backgroundColor: filterType === key ? info.color : undefined,
                      }}
                    >
                      {info.name} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[color:var(--color-muted)]">Priority:</span>
                {['all', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(priority => (
                  <button
                    key={priority}
                    onClick={() => setFilterPriority(priority)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors border ${
                      filterPriority === priority
                        ? 'bg-[color:var(--color-primary)] text-white border-[color:var(--color-primary)]'
                        : getPriorityColor(priority) + ' hover:opacity-80'
                    }`}
                  >
                    {priority === 'all' ? 'All' : priority}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Groups */}
            {Object.entries(groupedNotifications).map(([group, notifications]) => {
              if (notifications.length === 0) return null;

              return (
                <div key={group} className="mb-6">
                  <h3 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-2 px-2">
                    {group}
                  </h3>
                  <div className="space-y-1">
                    {notifications.map(notification => {
                      const Icon = getNotificationIcon(notification.type);
                      const typeInfo = NOTIFICATION_TYPE_INFO[notification.type];
                      const isSelected = selectedNotification?.id === notification.id;

                      return (
                        <button
                          key={notification.id}
                          onClick={() => setSelectedNotification(notification)}
                          className={`w-full text-left p-3 rounded-lg transition-all ${
                            isSelected
                              ? 'bg-[color:var(--color-surface-alt)] border-l-2 border-[color:var(--color-primary)]'
                              : notification.isRead
                              ? 'bg-[color:var(--color-surface)] hover:bg-[color:var(--color-surface-alt)]'
                              : 'bg-[color:var(--color-surface-alt)] hover:bg-[color:var(--color-surface-alt)] border-l-2 border-[color:var(--color-primary)]'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div
                              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white"
                              style={{ backgroundColor: typeInfo.color }}
                            >
                              <Icon className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* Title */}
                              <div className="flex items-center gap-2 mb-1">
                                <p className={`text-sm font-semibold truncate ${
                                  notification.isRead ? 'text-[color:var(--color-foreground)]' : 'text-[color:var(--color-foreground)]'
                                }`}>
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <DotFilledIcon className="w-3 h-3 text-[color:var(--color-primary)] flex-shrink-0" />
                                )}
                              </div>

                              {/* Message */}
                              <p className="text-xs text-[color:var(--color-muted)] truncate mb-2">
                                {notification.message}
                              </p>

                              {/* Meta */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-[color:var(--color-muted)]">
                                  {formatTime(notification.timestamp)}
                                </span>
                                {notification.priority === 'CRITICAL' || notification.priority === 'HIGH' ? (
                                  <>
                                    <span className="text-xs text-[color:var(--color-muted)]">•</span>
                                    <span className={`text-xs font-medium ${
                                      notification.priority === 'CRITICAL' ? 'text-[color:var(--color-error)]' : 'text-[color:var(--color-warning)]'
                                    }`}>
                                      {notification.priority}
                                    </span>
                                  </>
                                ) : null}
                                {notification.actionRequired && (
                                  <>
                                    <span className="text-xs text-[color:var(--color-muted)]">•</span>
                                    <span className="text-xs font-medium text-[color:var(--color-primary)]">
                                      Action Required
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Empty State */}
            {filteredNotifications.length === 0 && (
              <div className="text-center py-12">
                <BellIcon className="w-12 h-12 text-[color:var(--color-muted)] mx-auto mb-3" />
                <p className="text-[color:var(--color-muted)]">No notifications match your filters</p>
                <button
                  onClick={() => {
                    setFilterType('all');
                    setFilterPriority('all');
                    setShowOnlyUnread(false);
                    setShowOnlyActionRequired(false);
                  }}
                  className="mt-3 text-sm text-[color:var(--color-primary)] hover:text-[color:var(--color-primary)] font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Notification Detail */}
        {selectedNotification && (
          <div className="w-96 bg-[color:var(--surface-glass)] backdrop-blur-sm overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {selectedNotification.isRead ? (
                    <EnvelopeOpenIcon className="w-5 h-5 text-[color:var(--color-muted)]" />
                  ) : (
                    <EnvelopeClosedIcon className="w-5 h-5 text-[color:var(--color-primary)]" />
                  )}
                  <span className="text-xs text-[color:var(--color-muted)]">
                    {selectedNotification.isRead ? 'Read' : 'Unread'}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]"
                >
                  x
                </button>
              </div>

              {/* Type & Priority Badges */}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: NOTIFICATION_TYPE_INFO[selectedNotification.type].color }}
                >
                  {NOTIFICATION_TYPE_INFO[selectedNotification.type].name}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(selectedNotification.priority)}`}>
                  {selectedNotification.priority}
                </span>
                {selectedNotification.actionRequired && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-[color:var(--color-error-bg)] text-[color:var(--color-error)] border border-[color:var(--color-error-border)]">
                    <ExclamationTriangleIcon className="w-3 h-3" />
                    Action Required
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-[color:var(--color-foreground)] mb-2">
                {selectedNotification.title}
              </h2>

              {/* Timestamp */}
              <div className="flex items-center gap-2 text-sm text-[color:var(--color-muted)] mb-4">
                <ClockIcon className="w-4 h-4" />
                <span>
                  {new Date(selectedNotification.timestamp).toLocaleString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </span>
              </div>

              {/* Sender */}
              {selectedNotification.sender && (
                <div className="flex items-center gap-2 text-sm text-[color:var(--color-muted)] mb-4 pb-4 border-b border-[color:var(--color-border)]">
                  <span className="text-[color:var(--color-muted)]">From:</span>
                  <span className="font-medium">{selectedNotification.sender}</span>
                </div>
              )}

              {/* Message */}
              <p className="text-sm text-[color:var(--color-foreground)] leading-relaxed mb-6">
                {selectedNotification.message}
              </p>

              {/* Metadata */}
              {selectedNotification.metadata && (
                <div className="bg-[color:var(--color-surface-alt)] rounded-lg p-4 mb-6 space-y-2">
                  {selectedNotification.metadata.dueDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="w-4 h-4 text-[color:var(--color-primary)]" />
                      <span className="text-[color:var(--color-muted)]">Due:</span>
                      <span className="font-medium text-[color:var(--color-foreground)]">
                        {new Date(selectedNotification.metadata.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                  {selectedNotification.metadata.slaRemaining !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <ClockIcon className="w-4 h-4 text-[color:var(--color-error)]" />
                      <span className="text-[color:var(--color-muted)]">SLA Remaining:</span>
                      <span className="font-medium text-[color:var(--color-error)]">
                        {selectedNotification.metadata.slaRemaining} {selectedNotification.metadata.slaRemaining === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                  )}
                  {selectedNotification.relatedDocCode && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileTextIcon className="w-4 h-4 text-[color:var(--color-primary)]" />
                      <span className="text-[color:var(--color-muted)]">Document:</span>
                      <span className="font-medium text-[color:var(--color-primary)]">
                        {selectedNotification.relatedDocCode}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              {selectedNotification.actionRequired && selectedNotification.actionUrl && (
                <button className="w-full px-4 py-3 bg-[color:var(--color-primary)] text-white rounded-lg font-medium hover:bg-[color:var(--color-secondary)] transition-colors flex items-center justify-center gap-2">
                  <CheckCircledIcon className="w-5 h-5" />
                  Take Action
                </button>
              )}

              {/* Secondary Actions */}
              <div className="mt-4 flex items-center gap-2">
                <button className="flex-1 px-3 py-2 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] text-[color:var(--color-foreground)] rounded-md text-sm font-medium hover:bg-[color:var(--color-surface-alt)] transition-colors">
                  {selectedNotification.isRead ? 'Mark as Unread' : 'Mark as Read'}
                </button>
                <button className="flex-1 px-3 py-2 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] text-[color:var(--color-foreground)] rounded-md text-sm font-medium hover:bg-[color:var(--color-surface-alt)] transition-colors">
                  Archive
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
