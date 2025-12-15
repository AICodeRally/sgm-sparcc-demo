'use client';

import { useState } from 'react';
import { MagicWandIcon, Cross2Icon } from '@radix-ui/react-icons';

interface OrgChiefOrbProps {
  appName?: string;
  enabled?: boolean;
}

export function OrgChiefOrb({ appName = 'Demo', enabled = true }: OrgChiefOrbProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!enabled) return null;

  return (
    <>
      {/* Floating Orb - Lower Left */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl"
        aria-label="Open OrgChief AI Assistant"
      >
        <MagicWandIcon className="h-6 w-6" />
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                  <MagicWandIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">OrgChief AI</h2>
                  <p className="text-sm text-gray-500">Executive Assistant for {appName}</p>
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

            {/* Content */}
            <div className="p-6">
              <div className="mb-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 p-4">
                <p className="text-sm text-gray-700">
                  👋 Hello! I'm your executive AI assistant. I can help you with:
                </p>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  <li>• Strategic insights across all your projects</li>
                  <li>• Executive summaries and KPI analysis</li>
                  <li>• Resource allocation recommendations</li>
                  <li>• Risk assessment and mitigation strategies</li>
                </ul>
              </div>

              {/* Chat Interface Placeholder */}
              <div className="space-y-3">
                <div className="rounded-lg bg-gray-100 p-3">
                  <p className="text-sm text-gray-600">
                    💡 <strong>Sample Question:</strong> "What projects need my attention this week?"
                  </p>
                </div>
                <div className="rounded-lg bg-gray-100 p-3">
                  <p className="text-sm text-gray-600">
                    📊 <strong>Sample Question:</strong> "Show me my team's capacity utilization"
                  </p>
                </div>
                <div className="rounded-lg bg-gray-100 p-3">
                  <p className="text-sm text-gray-600">
                    ⚠️ <strong>Sample Question:</strong> "Which engagements are at risk?"
                  </p>
                </div>
              </div>

              {/* Input */}
              <div className="mt-6">
                <textarea
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  rows={3}
                  placeholder="Ask OrgChief anything about your organization..."
                />
                <button className="mt-3 w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
