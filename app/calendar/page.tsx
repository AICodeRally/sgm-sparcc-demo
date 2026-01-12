'use client';

import React, { useState, useMemo } from 'react';
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DotFilledIcon,
  ClockIcon,
  PersonIcon,
  CheckCircledIcon,
  FileTextIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';
import {
  CALENDAR_EVENTS,
  EVENT_TYPE_INFO,
  CALENDAR_STATS,
  getEventsForDate,
  getEventsForMonth,
  CalendarEvent,
  EventType,
} from '@/lib/data/synthetic/calendar.data';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 1)); // December 2025
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filterEventType, setFilterEventType] = useState<string>('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get events for current month
  const monthEvents = useMemo(() => getEventsForMonth(year, month + 1), [year, month]);

  // Filter events by type
  const filteredEvents = useMemo(() => {
    if (filterEventType === 'all') return monthEvents;
    return monthEvents.filter(event => event.type === filterEventType);
  }, [monthEvents, filterEventType]);

  // Get events for selected date
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // Calendar helpers
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = [];

    // Empty cells before first day
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = getEventsForDate(dateStr);
      days.push({ day, dateStr, events: dayEvents });
    }

    return days;
  }, [year, month, daysInMonth, firstDayOfMonth]);

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  // Get event type color
  const getEventColor = (type: EventType) => {
    return EVENT_TYPE_INFO[type]?.color || '#6b7280';
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

  return (
    <>
      <SetPageTitle
        title="Governance Calendar"
        description="Month-by-month timeline of governance events and milestones"
      />
      <div className="h-screen sparcc-hero-bg flex flex-col">
        {/* Header */}
        <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <div className="bg-[color:var(--color-surface-alt)] px-3 py-1 rounded-full">
                <span className="font-semibold text-[color:var(--color-primary)]">{CALENDAR_STATS.upcomingEvents}</span>
                <span className="text-[color:var(--color-primary)] ml-1">upcoming</span>
              </div>
              <div className="bg-[color:var(--color-error-bg)] px-3 py-1 rounded-full">
                <span className="font-semibold text-[color:var(--color-error)]">{CALENDAR_STATS.criticalEvents}</span>
                <span className="text-[color:var(--color-error)] ml-1">critical</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Calendar */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Calendar Controls */}
          <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-lg border border-[color:var(--color-border)] p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 hover:bg-[color:var(--color-surface-alt)] rounded transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-[color:var(--color-muted)]" />
                </button>
                <h2 className="text-xl font-bold text-[color:var(--color-foreground)] min-w-[200px] text-center">
                  {monthNames[month]} {year}
                </h2>
                <button
                  onClick={goToNextMonth}
                  className="p-2 hover:bg-[color:var(--color-surface-alt)] rounded transition-colors"
                >
                  <ChevronRightIcon className="w-5 h-5 text-[color:var(--color-muted)]" />
                </button>
              </div>

              <button
                onClick={goToToday}
                className="px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-md text-sm font-medium hover:bg-[color:var(--color-secondary)] transition-colors"
              >
                Today
              </button>
            </div>

            {/* Event Type Filter */}
            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
              <button
                onClick={() => setFilterEventType('all')}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  filterEventType === 'all'
                    ? 'bg-[color:var(--color-primary)] text-white'
                    : 'bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)] border border-[color:var(--color-border)]'
                }`}
              >
                All Events ({monthEvents.length})
              </button>
              {Object.entries(EVENT_TYPE_INFO).map(([key, info]) => {
                const count = monthEvents.filter(e => e.type === key).length;
                if (count === 0) return null;
                return (
                  <button
                    key={key}
                    onClick={() => setFilterEventType(key)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                      filterEventType === key
                        ? 'text-white border-transparent'
                        : 'bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)] border-[color:var(--color-border)]'
                    }`}
                    style={{
                      backgroundColor: filterEventType === key ? info.color : undefined,
                    }}
                  >
                    {info.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-lg border border-[color:var(--color-border)] overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-center text-xs font-semibold text-[color:var(--color-primary)] uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((dayData, index) => {
                if (!dayData) {
                  return <div key={`empty-${index}`} className="min-h-[120px] border-r border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)]"></div>;
                }

                const { day, dateStr, events } = dayData;
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                const displayEvents = filterEventType === 'all'
                  ? events
                  : events.filter(e => e.type === filterEventType);

                return (
                  <div
                    key={dateStr}
                    className={`min-h-[120px] border-r border-b border-[color:var(--color-border)] p-2 cursor-pointer transition-all ${
                      isSelected ? 'bg-[color:var(--color-surface-alt)]' : 'hover:bg-[color:var(--color-surface-alt)]'
                    }`}
                    onClick={() => setSelectedDate(dateStr)}
                  >
                    <div className={`text-sm font-semibold mb-1 ${
                      isToday
                        ? 'w-6 h-6 flex items-center justify-center rounded-full bg-[color:var(--color-primary)] text-white'
                        : 'text-[color:var(--color-foreground)]'
                    }`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {displayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          className="text-xs px-2 py-1 rounded text-white truncate"
                          style={{ backgroundColor: getEventColor(event.type) }}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {displayEvents.length > 3 && (
                        <div className="text-xs text-[color:var(--color-muted)] px-2">
                          +{displayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-lg border border-[color:var(--color-border)] p-4 mt-6">
            <p className="text-xs font-semibold text-[color:var(--color-foreground)] uppercase tracking-wider mb-3">
              Event Types
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(EVENT_TYPE_INFO).map(([key, info]) => (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: info.color }}
                  ></div>
                  <span className="text-xs text-[color:var(--color-foreground)]">{info.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Selected Date Details */}
        {selectedDate && selectedDateEvents.length > 0 && (
          <div className="w-96 border-l border-[color:var(--color-border)] bg-[color:var(--surface-glass)] backdrop-blur-sm overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[color:var(--color-foreground)]">
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]"
                >
                  x
                </button>
              </div>

              <div className="space-y-4">
                {selectedDateEvents.map(event => {
                  const eventInfo = EVENT_TYPE_INFO[event.type];
                  return (
                    <div
                      key={event.id}
                      className="bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-lg p-4 hover:shadow-md transition-all"
                    >
                      {/* Event Type Badge */}
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: eventInfo.color }}
                        >
                          {eventInfo.name}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(event.priority)}`}
                        >
                          {event.priority}
                        </span>
                      </div>

                      {/* Event Title */}
                      <h4 className="font-semibold text-[color:var(--color-foreground)] mb-2">
                        {event.title}
                      </h4>

                      {/* Event Time */}
                      {event.startTime && (
                        <div className="flex items-center gap-2 text-sm text-[color:var(--color-muted)] mb-2">
                          <ClockIcon className="w-4 h-4" />
                          <span>{event.startTime} {event.endTime && `- ${event.endTime}`}</span>
                        </div>
                      )}

                      {/* Event Location */}
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-[color:var(--color-muted)] mb-2">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}

                      {/* Event Description */}
                      {event.description && (
                        <p className="text-sm text-[color:var(--color-muted)] mb-2 leading-relaxed">
                          {event.description}
                        </p>
                      )}

                      {/* Related Document */}
                      {event.relatedDocCode && (
                        <div className="flex items-center gap-2 text-sm text-[color:var(--color-primary)] mb-2">
                          <FileTextIcon className="w-4 h-4" />
                          <span className="font-medium">{event.relatedDocCode}</span>
                        </div>
                      )}

                      {/* Attendees */}
                      {event.attendees && event.attendees.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[color:var(--color-border)]">
                          <div className="flex items-center gap-2 text-xs text-[color:var(--color-muted)] mb-2">
                            <PersonIcon className="w-3 h-3" />
                            <span className="font-medium">Attendees ({event.attendees.length})</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {event.attendees.map((attendee, idx) => (
                              <span
                                key={idx}
                                className="inline-block px-2 py-1 bg-[color:var(--color-surface-alt)] text-[color:var(--color-primary)] rounded text-xs"
                              >
                                {attendee}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Status Indicator */}
                      <div className="mt-3 pt-3 border-t border-[color:var(--color-border)]">
                        <div className="flex items-center gap-2">
                          {event.status === 'COMPLETED' ? (
                            <CheckCircledIcon className="w-4 h-4 text-[color:var(--color-success)]" />
                          ) : (
                            <DotFilledIcon className="w-4 h-4 text-[color:var(--color-muted)]" />
                          )}
                          <span className="text-xs text-[color:var(--color-muted)]">{event.status}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
