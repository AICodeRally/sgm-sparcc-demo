"use client";

import { useState } from "react";
import { Cross2Icon, InfoCircledIcon } from "@radix-ui/react-icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { usePageKb } from "@/components/kb/PageKbProvider";

interface PageKbPanelProps {
  enabled?: boolean;
}

export function PageKbPanel({ enabled = true }: PageKbPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: pageKb, loading, error } = usePageKb();

  if (!enabled) return null;

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white shadow-lg transition-transform hover:scale-105"
          aria-label="Open page knowledge base"
          title="Page knowledge base"
        >
          <InfoCircledIcon className="h-5 w-5" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-4 left-4 z-40 flex h-[600px] w-96 flex-col rounded-lg border border-[color:var(--color-info-border)] bg-[color:var(--color-surface)] shadow-2xl">
          <div className="flex items-center justify-between rounded-t-lg bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] p-4 text-white">
            <div className="flex items-center gap-2">
              <InfoCircledIcon className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Page KB</h3>
                <p className="text-xs text-white/80">Quick usage guide</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded p-1 transition-colors hover:bg-[color:var(--color-surface)]/20"
              aria-label="Close knowledge base"
            >
              <Cross2Icon className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-[color:var(--color-surface-alt)] p-4">
            {loading && (
              <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 text-sm text-[color:var(--color-muted)]">
                Loading KB content...
              </div>
            )}

            {!loading && error && (
              <div className="rounded-lg border border-[color:var(--color-error-border)] bg-[color:var(--color-error-bg)] p-3 text-sm text-[color:var(--color-error)]">
                {error}
              </div>
            )}

            {!loading && !error && pageKb && (
              <div className="space-y-3">
                <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3">
                  <p className="text-sm font-semibold text-[color:var(--color-foreground)]">{pageKb.meta.title}</p>
                  {pageKb.meta.description && (
                    <p className="mt-1 text-xs text-[color:var(--color-muted)]">{pageKb.meta.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-[color:var(--color-muted)]">
                    {pageKb.meta.owner && <span>Owner: {pageKb.meta.owner}</span>}
                    {pageKb.meta.lastUpdated && <span>Updated: {pageKb.meta.lastUpdated}</span>}
                  </div>
                </div>

                <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    className="prose prose-sm max-w-none text-[color:var(--color-foreground)]"
                  >
                    {pageKb.content}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {!loading && !error && !pageKb && (
              <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 text-sm text-[color:var(--color-muted)]">
                No KB content found for this page yet.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
