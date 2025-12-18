'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatBubbleIcon, Cross2Icon, PaperPlaneIcon, MinusIcon, ReloadIcon } from '@radix-ui/react-icons';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AskDockProps {
  appName?: string;
  enabled?: boolean;
}

export function AskDock({ appName = 'SGM', enabled = true }: AskDockProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        content: '⚠️ Sorry, I encountered an error. Please try again.',
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
          className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl"
          aria-label="Open AskSGM AI Assistant"
          title="AskSGM - Governance AI Assistant"
        >
          <ChatBubbleIcon className="h-6 w-6" />
        </button>
      )}

      {/* Chat Panel - Slides in from right */}
      {isOpen && !isMinimized && (
        <div className="fixed bottom-4 right-4 z-40 flex h-[600px] w-96 flex-col rounded-lg bg-white shadow-2xl border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-500 to-cyan-500 p-4 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <ChatBubbleIcon className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">AskSGM</h3>
                <p className="text-xs text-blue-100">Governance AI Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="rounded p-1 text-xs transition-colors hover:bg-white/20"
                  aria-label="Clear chat"
                  title="Clear conversation"
                >
                  <ReloadIcon className="h-4 w-4" />
                </button>
              )}
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
          <div className="flex-1 space-y-4 overflow-y-auto p-4 bg-gray-50">
            {messages.length === 0 ? (
              <>
                {/* Welcome Message */}
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                    <ChatBubbleIcon className="h-4 w-4" />
                  </div>
                  <div className="rounded-lg bg-blue-50 p-3 border border-blue-200">
                    <p className="text-sm text-gray-700">
                      Hi! I'm AskSGM, your governance intelligence assistant. I can help you with:
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-gray-600">
                      <li>• Compensation policies and approval workflows</li>
                      <li>• SGCC and CRB committee processes</li>
                      <li>• SLA compliance and document governance</li>
                      <li>• Exception requests and dispute resolution</li>
                    </ul>
                  </div>
                </div>

                {/* Quick Questions */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500">Quick questions:</p>
                  {quickQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickQuestion(question)}
                      className="w-full rounded-lg border border-gray-200 bg-white p-2 text-left text-xs text-gray-700 transition-colors hover:bg-blue-50 hover:border-blue-300"
                    >
                      💡 {question}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                        <ChatBubbleIcon className="h-4 w-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-3 text-sm ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-800'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={`mt-1 text-xs ${
                          message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-300 text-gray-600 text-xs font-semibold">
                        You
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                      <ReloadIcon className="h-4 w-4 animate-spin" />
                    </div>
                    <div className="rounded-lg bg-white border border-gray-200 p-3 text-sm text-gray-600">
                      <p>Analyzing governance data...</p>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
            {error && (
              <div className="mb-2 rounded-md bg-red-50 border border-red-200 p-2 text-xs text-red-600">
                ⚠️ {error}
              </div>
            )}
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about governance policies, approvals, SLAs..."
                className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <ReloadIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <PaperPlaneIcon className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Press Enter to send • Shift+Enter for new line
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
          <span className="text-sm font-medium">AskSGM</span>
          {messages.length > 0 && (
            <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
              {messages.length}
            </span>
          )}
        </button>
      )}
    </>
  );
}
