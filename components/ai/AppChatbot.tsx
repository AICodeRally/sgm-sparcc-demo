'use client';

import { useState } from 'react';
import { ChatBubbleIcon, Cross2Icon, PaperPlaneIcon } from '@radix-ui/react-icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { usePageKb } from '@/components/kb/PageKbProvider';

interface AppChatbotProps {
  appName?: string;
  enabled?: boolean;
}

export function AppChatbot({ appName = 'Demo', enabled = true }: AppChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPageGuide, setShowPageGuide] = useState(false);
  const { data: pageKb } = usePageKb();

  if (!enabled) return null;

  return (
    <>
      {/* Launcher Button (in top nav) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-muted)] transition-all hover:bg-[color:var(--color-surface-alt)] hover:text-[color:var(--color-foreground)]"
        aria-label="Toggle App Assistant"
      >
        <ChatBubbleIcon className="h-5 w-5" />
        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-transparent"></span>
      </button>

      {/* Side Panel */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed right-0 top-0 z-50 h-full w-96 bg-[color:var(--color-surface)] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[color:var(--color-border)] p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white">
                  <ChatBubbleIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-[color:var(--color-foreground)]">App Assistant</h3>
                  <p className="text-xs text-[color:var(--color-muted)]">{appName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-[color:var(--color-muted)] transition-colors hover:bg-[color:var(--color-surface-alt)] hover:text-[color:var(--color-muted)]"
                aria-label="Close"
              >
                <Cross2Icon className="h-5 w-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex h-[calc(100%-8rem)] flex-col space-y-4 overflow-y-auto p-4">
              {/* Welcome Message */}
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white">
                  <ChatBubbleIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 rounded-lg bg-[color:var(--color-accent-bg)] p-3">
                  <p className="text-sm text-[color:var(--color-foreground)]">
                    Hello! I'm your app assistant. I can help you navigate and use {appName} effectively.
                  </p>
                </div>
              </div>

              {/* Context-Aware Suggestions */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-[color:var(--color-muted)]">I can help you with:</p>
                <div className="grid gap-2">
                  <button className="rounded-lg border border-[color:var(--color-border)] p-3 text-left transition-colors hover:bg-[color:var(--color-surface-alt)]">
                    <p className="flex items-center gap-2 text-sm font-medium text-[color:var(--color-foreground)]">
                      <RocketIcon className="h-4 w-4" />
                      Get started guide
                    </p>
                    <p className="text-xs text-[color:var(--color-muted)]">Learn the basics in 5 minutes</p>
                  </button>
                  <button className="rounded-lg border border-[color:var(--color-border)] p-3 text-left transition-colors hover:bg-[color:var(--color-surface-alt)]">
                    <p className="flex items-center gap-2 text-sm font-medium text-[color:var(--color-foreground)]">
                      <FileTextIcon className="h-4 w-4" />
                      Current page help
                    </p>
                    <p className="text-xs text-[color:var(--color-muted)]">Context-specific guidance</p>
                  </button>
                  <button className="rounded-lg border border-[color:var(--color-border)] p-3 text-left transition-colors hover:bg-[color:var(--color-surface-alt)]">
                    <p className="flex items-center gap-2 text-sm font-medium text-[color:var(--color-foreground)]">
                      <LightningBoltIcon className="h-4 w-4" />
                      Keyboard shortcuts
                    </p>
                    <p className="text-xs text-[color:var(--color-muted)]">Work faster with hotkeys</p>
                  </button>
                  <button className="rounded-lg border border-[color:var(--color-border)] p-3 text-left transition-colors hover:bg-[color:var(--color-surface-alt)]">
                    <p className="flex items-center gap-2 text-sm font-medium text-[color:var(--color-foreground)]">
                      <GearIcon className="h-4 w-4" />
                      Advanced features
                    </p>
                    <p className="text-xs text-[color:var(--color-muted)]">Unlock more capabilities</p>
                  </button>
                </div>
              </div>

              {pageKb?.meta?.title && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-[color:var(--color-muted)]">Current page guide</p>
                    <button
                      onClick={() => setShowPageGuide(!showPageGuide)}
                      className="text-xs text-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
                    >
                      {showPageGuide ? 'Hide' : 'View'}
                    </button>
                  </div>
                  <div className="rounded-lg border border-[color:var(--color-accent-border)] bg-[color:var(--color-surface)] p-3 text-xs text-[color:var(--color-foreground)]">
                    <p className="font-semibold text-[color:var(--color-foreground)]">{pageKb.meta.title}</p>
                    {pageKb.meta.description && (
                      <p className="mt-1 text-[color:var(--color-muted)]">{pageKb.meta.description}</p>
                    )}
                    {showPageGuide && (
                      <div className="mt-3 max-h-56 overflow-y-auto rounded border border-[color:var(--color-accent-border)] bg-[color:var(--color-accent-bg)] p-3">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-sm max-w-none text-[color:var(--color-foreground)]">
                          {pageKb.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask about this app..."
                  className="flex-1 rounded-lg border border-[color:var(--color-border)] px-3 py-2 text-sm placeholder-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-info-border)]"
                />
                <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white transition-opacity hover:opacity-90">
                  <PaperPlaneIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
