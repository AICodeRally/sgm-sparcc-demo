'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle,
  Send,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface Citation {
  label: string;
  score: number;
  excerpt: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  suggestedFollowUps?: string[];
  timestamp: Date;
  isError?: boolean;
}

interface DocumentContext {
  documentId: string;
  planName: string;
  gaps?: string[];
  coverage?: number;
}

interface GovernanceChatProps {
  documentContext?: DocumentContext;
  tenantId?: string;
  defaultExpanded?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'inline';
  className?: string;
}

export function GovernanceChat({
  documentContext,
  tenantId = 'sgm',
  defaultExpanded = false,
  position = 'bottom-right',
  className = '',
}: GovernanceChatProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [showCitations, setShowCitations] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // Add welcome message when first expanded
  useEffect(() => {
    if (isExpanded && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: documentContext
          ? `I'm The Toddfather, your SPM governance expert. I can see you're reviewing "${documentContext.planName}"${documentContext.coverage !== undefined ? ` (${documentContext.coverage}% coverage)` : ''}. Ask me anything about compensation plan governance, compliance, or how to address the gaps I've identified.`
          : "I'm The Toddfather, your SPM governance expert. Ask me anything about compensation plan governance, compliance requirements, or best practices.",
        suggestedFollowUps: documentContext?.gaps?.length
          ? [
              'What are the most critical gaps to address?',
              'Generate remediation language for the highest priority gap',
              'Explain California-specific commission requirements',
            ]
          : [
              'What should every comp plan include?',
              'Explain clawback disclosure requirements',
              'What are common compliance mistakes?',
            ],
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isExpanded, messages.length, documentContext]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/governance/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage.content,
          documentContext,
          conversationId,
          tenantId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get response');
      }

      const data = await response.json();

      // Update conversation ID for continuity
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        citations: data.citations,
        suggestedFollowUps: data.suggestedFollowUps,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: error instanceof Error
          ? `Sorry, I couldn't process that: ${error.message}`
          : 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setConversationId(undefined);
  };

  // Position classes
  const positionClasses = {
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'inline': 'relative',
  };

  if (!isExpanded && position !== 'inline') {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={`${positionClasses[position]} flex items-center gap-2 px-4 py-3 bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 ${className}`}
      >
        <Sparkles className="w-5 h-5" />
        <span className="font-medium">Ask The Toddfather</span>
        <MessageCircle className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div
      className={`${position !== 'inline' ? positionClasses[position] : ''} ${className}`}
    >
      <div className={`bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-lg shadow-xl flex flex-col ${
        position === 'inline' ? 'h-[600px]' : 'w-96 h-[500px]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[color:var(--color-border)] bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] rounded-t-lg">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">The Toddfather</span>
            <span className="text-xs bg-[color:var(--color-surface)]/20 px-2 py-0.5 rounded-full">SPM Expert</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={resetConversation}
              className="p-1.5 hover:bg-[color:var(--color-surface)]/20 rounded-md transition-colors text-white"
              title="New conversation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {position !== 'inline' && (
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 hover:bg-[color:var(--color-surface)]/20 rounded-md transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-[color:var(--color-primary)] text-white'
                    : message.isError
                    ? 'bg-[color:var(--color-error-bg)] border border-[color:var(--color-error-border)] text-[color:var(--color-error)]'
                    : 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]'
                }`}
              >
                {message.isError && (
                  <div className="flex items-center gap-1 mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">Error</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                {/* Citations */}
                {message.citations && message.citations.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-[color:var(--color-border)]">
                    <button
                      onClick={() =>
                        setShowCitations(showCitations === message.id ? null : message.id)
                      }
                      className="flex items-center gap-1 text-xs text-[color:var(--color-info)] hover:text-[color:var(--color-info)]"
                    >
                      <BookOpen className="w-3 h-3" />
                      {message.citations.length} source{message.citations.length > 1 ? 's' : ''}
                      {showCitations === message.id ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                    {showCitations === message.id && (
                      <div className="mt-2 space-y-2">
                        {message.citations.map((citation, i) => (
                          <div
                            key={i}
                            className="text-xs bg-[color:var(--color-surface)] rounded p-2 border border-[color:var(--color-border)]"
                          >
                            <div className="font-medium text-[color:var(--color-foreground)] mb-1">
                              {citation.label}
                              <span className="ml-2 text-[color:var(--color-muted)]">
                                ({Math.round(citation.score * 100)}% match)
                              </span>
                            </div>
                            <p className="text-[color:var(--color-muted)] line-clamp-3">{citation.excerpt}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Suggested Follow-ups */}
                {message.suggestedFollowUps && message.suggestedFollowUps.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {message.suggestedFollowUps.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestedQuestion(suggestion)}
                        className="block w-full text-left text-xs px-2 py-1.5 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded hover:bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)] transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[color:var(--color-surface-alt)] rounded-lg px-4 py-2 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[color:var(--color-info)]" />
                <span className="text-sm text-[color:var(--color-muted)]">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-[color:var(--color-border)]">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about governance, compliance..."
              className="flex-1 px-3 py-2 border border-[color:var(--color-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-info-border)] focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="px-3 py-2 bg-[color:var(--color-primary)] text-white rounded-md hover:bg-[color:var(--color-secondary)] disabled:bg-[color:var(--color-border)] disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-[color:var(--color-muted)] mt-2 text-center">
            Powered by The Toddfather RAG
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline chat component for embedding in pages
 */
export function GovernanceChatInline(props: Omit<GovernanceChatProps, 'position'>) {
  return <GovernanceChat {...props} position="inline" defaultExpanded />;
}
