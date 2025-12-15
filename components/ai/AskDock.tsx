'use client';

import { useState } from 'react';
import { ChatBubbleIcon, Cross2Icon, PaperPlaneIcon, MinusIcon } from '@radix-ui/react-icons';

interface AskDockProps {
  appName?: string;
  enabled?: boolean;
}

export function AskDock({ appName = 'Demo', enabled = true }: AskDockProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount] = useState(0);

  if (!enabled) return null;

  return (
    <>
      {/* Floating Button - Lower Right (when closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl"
          aria-label="Open Ask AI Assistant"
        >
          <ChatBubbleIcon className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Panel - Slides in from right */}
      {isOpen && !isMinimized && (
        <div className="fixed bottom-4 right-4 z-40 flex h-[600px] w-96 flex-col rounded-lg bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-500 to-cyan-500 p-4 text-white">
            <div className="flex items-center gap-2">
              <ChatBubbleIcon className="h-5 w-5" />
              <h3 className="font-semibold">Ask AI</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(true)}
                className="rounded p-1 transition-colors hover:bg-white/20"
                aria-label="Minimize"
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-1 transition-colors hover:bg-white/20"
                aria-label="Close"
              >
                <Cross2Icon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {/* Welcome Message */}
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <ChatBubbleIcon className="h-4 w-4" />
              </div>
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-sm text-gray-700">
                  Hi! I'm your AI assistant for {appName}. Ask me anything about:
                </p>
                <ul className="mt-2 space-y-1 text-xs text-gray-600">
                  <li>• How to use features</li>
                  <li>• Data and metrics</li>
                  <li>• Best practices</li>
                  <li>• Quick help</li>
                </ul>
              </div>
            </div>

            {/* Sample Questions */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500">Quick questions:</p>
              <button className="w-full rounded-lg border border-gray-200 p-2 text-left text-xs text-gray-700 transition-colors hover:bg-gray-50">
                💡 How do I create a new project?
              </button>
              <button className="w-full rounded-lg border border-gray-200 p-2 text-left text-xs text-gray-700 transition-colors hover:bg-gray-50">
                📊 Explain this dashboard metric
              </button>
              <button className="w-full rounded-lg border border-gray-200 p-2 text-left text-xs text-gray-700 transition-colors hover:bg-gray-50">
                🔍 Where can I find my documents?
              </button>
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask a question..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white transition-opacity hover:opacity-90">
                <PaperPlaneIcon className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Press Enter to send
            </p>
          </div>
        </div>
      )}

      {/* Minimized State */}
      {isOpen && isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-white shadow-lg transition-all hover:shadow-xl"
        >
          <ChatBubbleIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Ask AI</span>
        </button>
      )}
    </>
  );
}
