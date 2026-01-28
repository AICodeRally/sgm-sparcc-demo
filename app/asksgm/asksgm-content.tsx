"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Source {
  chunkId: string;
  keyword: string;
  content: string;
  pillar: string;
  category: string;
  score: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  timing?: {
    embeddingMs?: number;
    searchMs?: number;
    llmMs?: number;
    totalMs?: number;
  };
  queryId?: string;
  feedbackGiven?: "thumbs_up" | "thumbs_down";
}

interface SSEEvent {
  type: "start" | "chunk" | "context" | "done" | "error";
  data: Record<string, unknown>;
}

const sampleQuestions = [
  "What is sales governance?",
  "How do SGCCs work?",
  "Explain windfall policies",
  "What are clawback provisions?",
  "Best practices for plan approval",
];

/**
 * Parse SSE events from raw text
 */
function parseSSEEvents(text: string): SSEEvent[] {
  const events: SSEEvent[] = [];
  const lines = text.split("\n");
  let currentEvent: Partial<SSEEvent> = {};

  for (const line of lines) {
    if (line.startsWith("event: ")) {
      currentEvent.type = line.slice(7).trim() as SSEEvent["type"];
    } else if (line.startsWith("data: ")) {
      try {
        currentEvent.data = JSON.parse(line.slice(6));
      } catch {
        // Skip malformed JSON
      }
    } else if (line === "" && currentEvent.type && currentEvent.data) {
      events.push(currentEvent as SSEEvent);
      currentEvent = {};
    }
  }

  return events;
}

export default function AskSGMContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingStatus, setStreamingStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize session on mount
  useEffect(() => {
    const stored = localStorage.getItem("asksgm_session");
    if (stored) {
      setSessionId(stored);
    } else {
      // Create new session
      fetch("/api/ai/asksgm/session", { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          if (data.sessionId) {
            localStorage.setItem("asksgm_session", data.sessionId);
            setSessionId(data.sessionId);
          }
        })
        .catch(console.error);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /**
   * Handle streaming submission
   */
  const handleStreamingSubmit = async (query: string) => {
    if (!query.trim() || isStreaming) return;

    // Add user message immediately
    const userMessage: Message = { role: "user", content: query };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);
    setStreamingStatus("Connecting...");
    setError(null);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/ai/asksgm/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          sessionId,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      const assistantMessage: Message = {
        role: "assistant",
        content: "",
      };

      // Add placeholder for streaming message
      setMessages((prev) => [...prev, { ...assistantMessage }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = parseSSEEvents(buffer);

        // Keep any incomplete event data in buffer
        const lastNewline = buffer.lastIndexOf("\n\n");
        if (lastNewline !== -1) {
          buffer = buffer.slice(lastNewline + 2);
        }

        for (const event of events) {
          if (event.type === "start") {
            setStreamingStatus("Processing query...");
          } else if (event.type === "context") {
            setStreamingStatus("Generating response...");
          } else if (event.type === "chunk") {
            assistantMessage.content += (event.data.content as string) || "";
            // Update UI with partial content
            setMessages((prev) => [
              ...prev.slice(0, -1),
              { ...assistantMessage },
            ]);
          } else if (event.type === "done") {
            const data = event.data;
            if (data.totalTokens) {
              assistantMessage.timing = {
                ...assistantMessage.timing,
                totalMs: data.totalTokens as number,
              };
            }
          } else if (event.type === "error") {
            throw new Error((event.data.message as string) || "Stream error");
          }
        }
      }

      // Final update
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { ...assistantMessage },
      ]);
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        // User cancelled - remove the empty assistant message
        setMessages((prev) => prev.slice(0, -1));
      } else {
        setError(err instanceof Error ? err.message : "Failed to get response");
        // Remove the placeholder message on error
        setMessages((prev) => prev.slice(0, -1));
      }
    } finally {
      setIsStreaming(false);
      setStreamingStatus("");
      abortControllerRef.current = null;
    }
  };

  /**
   * Handle feedback submission
   */
  const handleFeedback = async (
    messageIndex: number,
    feedbackType: "thumbs_up" | "thumbs_down"
  ) => {
    const message = messages[messageIndex];
    if (message.feedbackGiven || !sessionId) return;

    try {
      const response = await fetch("/api/ai/asksgm/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: sessionId,
          feedbackType,
          messageIndex,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      // Update local state to show feedback given
      setMessages((prev) =>
        prev.map((m, i) =>
          i === messageIndex ? { ...m, feedbackGiven: feedbackType } : m
        )
      );
    } catch (err) {
      console.error("Feedback error:", err);
    }
  };

  /**
   * Handle new chat - clears conversation and session
   */
  const handleNewChat = async () => {
    // Cancel any ongoing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setMessages([]);
    setError(null);

    // End old session and create new one
    if (sessionId) {
      await fetch(`/api/ai/asksgm/session?sessionId=${sessionId}`, { method: "DELETE" }).catch(() => {});
    }

    localStorage.removeItem("asksgm_session");

    // Create new session
    try {
      const res = await fetch("/api/ai/asksgm/session", { method: "POST" });
      const data = await res.json();
      if (data.sessionId) {
        localStorage.setItem("asksgm_session", data.sessionId);
        setSessionId(data.sessionId);
      }
    } catch (err) {
      console.error("Failed to create new session:", err);
    }
  };

  /**
   * Cancel ongoing stream
   */
  const handleCancelStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const toggleSources = (index: number) => {
    setExpandedSources((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-emerald-600 flex items-center justify-center text-xl font-bold text-white mx-auto mb-4">
              SGM
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-2">
              Ask<span className="text-emerald-500">SGM</span>
            </h1>
            <p className="text-sm text-slate-400">
              AI-powered Sales Governance Assistant
            </p>
          </div>

          {/* Chat Container */}
          <div className="bg-slate-800 rounded-xl overflow-hidden border border-emerald-500/20">
            {/* Header Bar with New Chat */}
            {messages.length > 0 && (
              <div className="flex items-center justify-between px-4 py-2 border-b border-emerald-500/10 bg-slate-800/50">
                <span className="text-xs text-slate-500">
                  {messages.filter((m) => m.role === "user").length} question
                  {messages.filter((m) => m.role === "user").length !== 1 ? "s" : ""} in conversation
                </span>
                <button
                  onClick={handleNewChat}
                  className="text-xs text-slate-400 hover:text-emerald-500 transition-colors flex items-center gap-1"
                >
                  <span>✨</span>
                  <span>New Chat</span>
                </button>
              </div>
            )}

            {/* Messages Area */}
            <div className="h-[500px] overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 mb-6">Ask anything about Sales Governance</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {sampleQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleStreamingSubmit(q)}
                        disabled={isStreaming}
                        className="px-4 py-2 text-sm rounded-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] ${
                        message.role === "user"
                          ? "bg-emerald-600 text-white rounded-2xl rounded-tr-sm"
                          : "bg-slate-700 text-slate-100 rounded-2xl rounded-tl-sm"
                      } px-4 py-3`}
                    >
                      <p className="whitespace-pre-wrap">
                        {message.content || (
                          <span className="text-slate-400 italic">
                            {streamingStatus || "Loading..."}
                          </span>
                        )}
                      </p>

                      {/* Sources for assistant messages */}
                      {message.role === "assistant" &&
                        message.sources &&
                        message.sources.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-white/10">
                            <button
                              onClick={() => toggleSources(index)}
                              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                            >
                              <span>{expandedSources.has(index) ? "▼" : "▶"}</span>
                              <span>{message.sources.length} sources</span>
                            </button>

                            {expandedSources.has(index) && (
                              <div className="mt-3 space-y-2">
                                {message.sources.map((source, sIndex) => (
                                  <div
                                    key={sIndex}
                                    className="text-xs bg-slate-800 rounded-lg p-3"
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-emerald-500">
                                        {source.keyword}
                                      </span>
                                      <span className="text-slate-500">
                                        {source.pillar} / {source.category}
                                      </span>
                                      <span className="ml-auto text-slate-500">
                                        {(source.score * 100).toFixed(0)}% match
                                      </span>
                                    </div>
                                    <p className="text-slate-400 line-clamp-2">
                                      {source.content}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                      {/* Feedback buttons */}
                      {message.role === "assistant" && message.content && (
                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/5">
                          <span className="text-xs text-slate-500">Was this helpful?</span>
                          <button
                            onClick={() => handleFeedback(index, "thumbs_up")}
                            disabled={!!message.feedbackGiven}
                            className={`p-1.5 rounded-md transition-colors ${
                              message.feedbackGiven === "thumbs_up"
                                ? "bg-green-500/20 text-green-400"
                                : message.feedbackGiven
                                  ? "text-slate-600 cursor-not-allowed"
                                  : "text-slate-500 hover:text-green-400 hover:bg-green-500/10"
                            }`}
                            title="Helpful"
                          >
                            👍
                          </button>
                          <button
                            onClick={() => handleFeedback(index, "thumbs_down")}
                            disabled={!!message.feedbackGiven}
                            className={`p-1.5 rounded-md transition-colors ${
                              message.feedbackGiven === "thumbs_down"
                                ? "bg-red-500/20 text-red-400"
                                : message.feedbackGiven
                                  ? "text-slate-600 cursor-not-allowed"
                                  : "text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                            }`}
                            title="Not helpful"
                          >
                            👎
                          </button>
                          {message.feedbackGiven && (
                            <span className="text-xs text-slate-500 ml-1">Thanks!</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {isStreaming && !messages[messages.length - 1]?.content && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 text-slate-400 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <div
                        className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"
                        style={{ animationDelay: "75ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span className="ml-2 text-sm">{streamingStatus || "Connecting..."}</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex justify-center">
                  <div className="bg-red-500/10 text-red-400 rounded-lg px-4 py-2 text-sm">
                    {error}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-emerald-500/10 p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleStreamingSubmit(input);
                }}
                className="flex gap-3"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about governance, policies, approvals..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  disabled={isStreaming}
                />
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={handleCancelStream}
                    className="px-6 py-3 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500 transition-colors"
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Ask
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
