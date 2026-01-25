'use client';

import { useState, useRef, useEffect } from 'react';
import {
  ChatBubbleIcon,
  Cross2Icon,
  PaperPlaneIcon,
  MinusIcon,
  ReloadIcon,
  InfoCircledIcon,
  ExclamationTriangleIcon,
  CheckCircledIcon,
  ActivityLogIcon,
} from '@radix-ui/react-icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { usePageKb } from '@/components/kb/PageKbProvider';
import { useServiceHealth } from '@/lib/aicr/use-service-health';
import { TelemetryVisualizer } from './TelemetryVisualizer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AskItemProps {
  appName?: string;
  enabled?: boolean;
}

export function AskItem({ appName = 'SGM', enabled = true }: AskItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPageGuide, setShowPageGuide] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: pageKb } = usePageKb();

  // Service health for orb glow indicator
  const { isAskSGMAvailable, isAICRAvailable, isChecking } = useServiceHealth();
  const isConnected = isAskSGMAvailable || isAICRAvailable;

  // Determine orb state class
  const getOrbStateClass = () => {
    if (isChecking) return 'orb-checking';
    if (isConnected) return 'orb-connected';
    return 'orb-disconnected';
  };

  // Determine status dot class
  const getStatusDotClass = () => {
    if (isChecking) return 'checking';
    if (isConnected) return 'connected';
    return 'disconnected';
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/asksgm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          tenantId: 'platform',
          department: 'governance',
          context: {
            currentPage: window.location.pathname,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text || 'Sorry, I received an empty response.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('AskSGM error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    handleSendMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  if (!enabled) return null;

  const quickQuestions = [
    'What is the SGCC approval process?',
    'Explain CRB windfall decision options',
    'What are the current SLA compliance rates?',
    'How do I submit an exception request?',
  ];

  return (
    <>
      {/* Floating Button - Lower Right (when closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl ${getOrbStateClass()}`}
          aria-label="Open AskSGM AI Assistant"
          title={`AskSGM - Governance AI Assistant${isConnected ? ' (Connected)' : isChecking ? ' (Connecting...)' : ' (Offline)'}`}
        >
          <ChatBubbleIcon className="h-6 w-6" />
          {/* Connection status dot */}
          <span className={`orb-status-dot ${getStatusDotClass()}`} />
        </button>
      )}

      {/* Chat Panel - Slides in from right */}
      {isOpen && !isMinimized && (
        <div className="fixed bottom-4 right-4 z-40 flex h-[600px] w-96 flex-col rounded-lg bg-[color:var(--color-surface)] shadow-2xl border border-[color:var(--color-border)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[color:var(--color-border)] bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] p-4 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="relative">
                <ChatBubbleIcon className="h-5 w-5" />
                {/* Mini status dot in header */}
                <span
                  className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border border-white ${
                    isChecking
                      ? 'bg-yellow-400 animate-pulse'
                      : isConnected
                      ? 'bg-green-400'
                      : 'bg-gray-400'
                  }`}
                />
              </div>
              <div>
                <h3 className="font-semibold">AskSGM</h3>
                <p className="text-xs text-white/80">
                  {isChecking ? 'Connecting...' : isConnected ? 'Connected' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTelemetry(!showTelemetry)}
                className={`rounded p-1 text-xs transition-colors hover:bg-[color:var(--color-surface)]/20 ${showTelemetry ? 'bg-[color:var(--color-surface)]/20' : ''}`}
                aria-label="Toggle telemetry view"
                title="AI Telemetry"
              >
                <ActivityLogIcon className="h-4 w-4" />
              </button>
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="rounded p-1 text-xs transition-colors hover:bg-[color:var(--color-surface)]/20"
                  aria-label="Clear chat"
                  title="Clear conversation"
                >
                  <ReloadIcon className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setIsMinimized(true)}
                className="rounded p-1 transition-colors hover:bg-[color:var(--color-surface)]/20"
                aria-label="Minimize"
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-1 transition-colors hover:bg-[color:var(--color-surface)]/20"
                aria-label="Close"
              >
                <Cross2Icon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4 bg-[color:var(--color-surface-alt)]">
            {/* Telemetry View */}
            {showTelemetry && (
              <TelemetryVisualizer
                showSignalFeed={true}
                compact={false}
                className="mb-4"
              />
            )}

            {!showTelemetry && messages.length === 0 ? (
              <>
                {/* Welcome Message */}
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white">
                    <ChatBubbleIcon className="h-4 w-4" />
                  </div>
                  <div className="rounded-lg bg-[color:var(--color-surface-alt)] p-3 border border-[color:var(--color-border)]">
                    <p className="text-sm text-[color:var(--color-foreground)]">
                      Hi! I'm AskSGM, your governance intelligence assistant. I can help you with:
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-[color:var(--color-muted)]">
                      <li className="flex items-center gap-2"><CheckCircledIcon className="h-3 w-3 text-[color:var(--color-primary)]" />Compensation policies and approval workflows</li>
                      <li className="flex items-center gap-2"><CheckCircledIcon className="h-3 w-3 text-[color:var(--color-primary)]" />SGCC and CRB committee processes</li>
                      <li className="flex items-center gap-2"><CheckCircledIcon className="h-3 w-3 text-[color:var(--color-primary)]" />SLA compliance and document governance</li>
                      <li className="flex items-center gap-2"><CheckCircledIcon className="h-3 w-3 text-[color:var(--color-primary)]" />Exception requests and dispute resolution</li>
                    </ul>
                  </div>
                </div>

                {/* Quick Questions */}
                {pageKb?.meta?.title && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-[color:var(--color-muted)]">
                        Current page guide
                      </p>
                      <button
                        onClick={() => setShowPageGuide(!showPageGuide)}
                        className="text-xs text-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                      >
                        {showPageGuide ? 'Hide' : 'View'}
                      </button>
                    </div>
                    <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 text-xs text-[color:var(--color-foreground)]">
                      <p className="font-semibold text-[color:var(--color-foreground)]">{pageKb.meta.title}</p>
                      {pageKb.meta.description && (
                        <p className="mt-1 text-[color:var(--color-muted)]">{pageKb.meta.description}</p>
                      )}
                      {showPageGuide && (
                        <div className="mt-3 max-h-56 overflow-y-auto rounded border border-[color:var(--color-accent-border)] bg-[color:var(--color-surface-alt)] p-3 prose prose-sm max-w-none text-[color:var(--color-foreground)]">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {pageKb.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-xs font-medium text-[color:var(--color-muted)]">Quick questions:</p>
                  {quickQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickQuestion(question)}
                      className="w-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-2 text-left text-xs text-[color:var(--color-foreground)] transition-colors hover:bg-[color:var(--color-surface-alt)] hover:border-[color:var(--color-border)]"
                    >
                      <span className="inline-flex items-center gap-2">
                        <InfoCircledIcon className="w-3 h-3 text-[color:var(--color-accent)]" />
                        {question}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : !showTelemetry ? (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white">
                        <ChatBubbleIcon className="h-4 w-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-3 text-sm ${
                        message.role === 'user'
                          ? 'bg-[color:var(--color-primary)] text-white'
                          : 'bg-[color:var(--color-surface)] border border-[color:var(--color-border)] text-[color:var(--color-foreground)]'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none prose-headings:text-[color:var(--color-foreground)] prose-headings:font-semibold prose-h1:text-base prose-h2:text-sm prose-h3:text-sm prose-p:text-[color:var(--color-foreground)] prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:text-[color:var(--color-foreground)] prose-strong:text-[color:var(--color-foreground)] prose-strong:font-semibold prose-table:text-xs prose-th:bg-[color:var(--color-surface-alt)] prose-th:text-[color:var(--color-accent)] prose-th:font-semibold prose-th:p-2 prose-td:p-2 prose-td:border prose-td:border-[color:var(--color-border)] prose-hr:my-3 prose-hr:border-[color:var(--color-border)]">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                      <p
                        className={`mt-1 text-xs ${
                          message.role === 'user' ? 'text-white/80' : 'text-[color:var(--color-muted)]'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-border)] text-[color:var(--color-muted)] text-xs font-semibold">
                        You
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white">
                      <ReloadIcon className="h-4 w-4 animate-spin" />
                    </div>
                    <div className="rounded-lg bg-[color:var(--color-surface)] border border-[color:var(--color-border)] p-3 text-sm text-[color:var(--color-muted)]">
                      <p>Analyzing governance data...</p>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            ) : null}
          </div>

          {/* Input Area */}
          <div className="border-t border-[color:var(--color-border)] p-4 bg-[color:var(--color-surface)] rounded-b-lg">
            {error && (
              <div className="mb-2 rounded-md bg-[color:var(--color-error-bg)] border border-[color:var(--color-error-border)] p-2 text-xs text-[color:var(--color-error)]">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-3 h-3" />
                  <span>{error}</span>
                </div>
              </div>
            )}
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about governance policies, approvals, SLAs..."
                className="flex-1 resize-none rounded-lg border border-[color:var(--color-border)] px-3 py-2 text-sm placeholder-[color:var(--color-muted)] focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent-border)]"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <ReloadIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <PaperPlaneIcon className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-2 text-xs text-[color:var(--color-muted)]">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      )}

      {/* Minimized State */}
      {isOpen && isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className={`fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-lg bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] px-4 py-2 text-white shadow-lg transition-all hover:shadow-xl ${getOrbStateClass()}`}
        >
          <div className="relative">
            <ChatBubbleIcon className="h-4 w-4" />
            <span
              className={`absolute -top-1 -right-1 h-2 w-2 rounded-full border border-white ${
                isChecking
                  ? 'bg-yellow-400 animate-pulse'
                  : isConnected
                  ? 'bg-green-400'
                  : 'bg-gray-400'
              }`}
            />
          </div>
          <span className="text-sm font-medium">AskSGM</span>
          {messages.length > 0 && (
            <span className="ml-1 rounded-full bg-[color:var(--color-surface)]/20 px-2 py-0.5 text-xs">
              {messages.length}
            </span>
          )}
        </button>
      )}
    </>
  );
}
