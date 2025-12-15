'use client';

import { useState } from 'react';
import { ChatBubbleIcon, Cross2Icon, PaperPlaneIcon } from '@radix-ui/react-icons';

interface AppChatbotProps {
  appName?: string;
  enabled?: boolean;
}

export function AppChatbot({ appName = 'Demo', enabled = true }: AppChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!enabled) return null;

  return (
    <>
      {/* Launcher Button (in top nav) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900"
        aria-label="Toggle App Assistant"
      >
        <ChatBubbleIcon className="h-5 w-5" />
        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-green-500"></span>
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
          <div className="fixed right-0 top-0 z-50 h-full w-96 bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                  <ChatBubbleIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">App Assistant</h3>
                  <p className="text-xs text-gray-500">{appName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                <Cross2Icon className="h-5 w-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex h-[calc(100%-8rem)] flex-col space-y-4 overflow-y-auto p-4">
              {/* Welcome Message */}
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                  <ChatBubbleIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 rounded-lg bg-indigo-50 p-3">
                  <p className="text-sm text-gray-700">
                    Hello! I'm your app assistant. I can help you navigate and use {appName} effectively.
                  </p>
                </div>
              </div>

              {/* Context-Aware Suggestions */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500">I can help you with:</p>
                <div className="grid gap-2">
                  <button className="rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">🚀 Get started guide</p>
                    <p className="text-xs text-gray-500">Learn the basics in 5 minutes</p>
                  </button>
                  <button className="rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">📝 Current page help</p>
                    <p className="text-xs text-gray-500">Context-specific guidance</p>
                  </button>
                  <button className="rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">⚡ Keyboard shortcuts</p>
                    <p className="text-xs text-gray-500">Work faster with hotkeys</p>
                  </button>
                  <button className="rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">🔧 Advanced features</p>
                    <p className="text-xs text-gray-500">Unlock more capabilities</p>
                  </button>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask about this app..."
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white transition-opacity hover:opacity-90">
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
