// src/app/dashboard/document/[id]/DocumentViewer.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Volume2, Play, Pause, Trash2, RefreshCw } from "lucide-react";
import {
  getDocument,
  getDocumentSummary,
  getDocumentTags,
  askDocument,
  deleteDocument,
  getDocumentChatHistory,
  reprocessDocument,
} from "@/services/api/documents";
import { ChatPanel } from "@/components/viewer/ChatPanel";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Markdown } from "@/components/viewer/Markdown";
import { useSpeech } from "@/hooks/useSpeech";
import { cn } from "@/lib/util";
import type { DocumentItem } from "@/services/types";

interface DocumentViewerProps {
  id: string;
}

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function DocumentViewer({ id }: DocumentViewerProps) {
  const router = useRouter();
  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [initialMessages, setInitialMessages] = useState<ChatMsg[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isRegeneratingSummary, setIsRegeneratingSummary] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const { isPlaying, toggle, isSupported } = useSpeech(summary);

  async function loadAiExtras() {
    const [summaryRes, tagsRes] = await Promise.allSettled([getDocumentSummary(id), getDocumentTags(id)]);
    if (summaryRes.status === "fulfilled") setSummary(summaryRes.value.summary);
    else setSummary(null);
    if (tagsRes.status === "fulfilled") setTags(tagsRes.value.tags);
    else setTags([]);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const doc = await getDocument(id);
        if (cancelled) return;
        setDocument(doc);
        await loadAiExtras();

        try {
          const historyRes = await getDocumentChatHistory(id);
          if (!cancelled) {
            setInitialMessages(
              historyRes.messages.map((m) => ({
                id: crypto.randomUUID(),
                role: m.role,
                content: m.content,
              }))
            );
          }
        } catch {
          // No history yet, or fetch failed — start with an empty chat.
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load this document.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleAsk(message: string): Promise<string> {
    const response = await askDocument(id, message);
    return response.answer;
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteDocument(id);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete this document.");
      setIsDeleting(false);
    }
  }

  async function handleRegenerateSummary() {
    setIsRegeneratingSummary(true);
    setError(null);
    try {
      const res = await getDocumentSummary(id, true);
      setSummary(res.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not regenerate summary.");
    } finally {
      setIsRegeneratingSummary(false);
    }
  }

  async function handleRetryExtraction() {
    setIsRetrying(true);
    setRetryError(null);
    try {
      await reprocessDocument(id);
      await loadAiExtras();
    } catch (err) {
      setRetryError(err instanceof Error ? err.message : "Retry failed. Try re-uploading the file instead.");
    } finally {
      setIsRetrying(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="text-sm text-ink/50">Loading document...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper">
        <p className="text-sm text-red-600">{error ?? "Document not found."}</p>
        <Link href="/dashboard" className="text-sm font-medium text-indigo hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-paper">
      <div className="flex items-center gap-3 border-b border-ink/10 px-6 py-4">
        <Link href="/dashboard" className="text-ink/50 transition-colors hover:text-ink">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="flex-1 truncate font-display text-lg font-medium text-ink">{document.title}</h1>
        <button
          onClick={() => setDeleteOpen(true)}
          className="rounded-md p-1.5 text-ink/40 transition-colors hover:bg-red-50 hover:text-red-600"
          aria-label="Delete document"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-2">
        <div className="overflow-y-auto border-b border-ink/10 p-6 lg:border-b-0 lg:border-r">
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
            {document.file_url ? (
              <iframe src={document.file_url} className="h-full min-h-[50vh] w-full rounded-md border border-ink/10" />
            ) : (
              <p className="text-sm text-ink/40">No preview available for this file.</p>
            )}
          </div>

          <div className="mt-8 border-t border-ink/10 pt-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-medium uppercase tracking-wide text-ink/50">
                Summary
              </h2>
              <button
                onClick={handleRegenerateSummary}
                disabled={isRegeneratingSummary}
                className="flex items-center gap-1 text-xs font-medium text-indigo hover:underline disabled:opacity-50"
              >
                <RefreshCw className={cn("h-3 w-3", isRegeneratingSummary && "animate-spin")} />
                {isRegeneratingSummary ? "Regenerating..." : "Regenerate"}
              </button>
            </div>

            <div className="mt-2 text-sm leading-relaxed text-ink/80">
              {summary ? <Markdown content={summary} /> : "Summary unavailable right now."}
            </div>

            {!summary && (
              <div className="mt-2">
                <button
                  onClick={handleRetryExtraction}
                  disabled={isRetrying}
                  className="text-xs font-medium text-indigo hover:underline disabled:opacity-50"
                >
                  {isRetrying ? "Retrying..." : "Retry reading this file"}
                </button>
                {retryError && <p className="mt-1 text-xs text-red-600">{retryError}</p>}
              </div>
            )}

            {tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-gold/20 px-2.5 py-1 text-xs font-medium text-ink/70">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={toggle}
              disabled={!summary || !isSupported}
              className="mt-4 flex items-center gap-2 rounded-md bg-gold/20 px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-gold/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Volume2 className="h-4 w-4" />
              {isPlaying ? "Stop" : "Listen in Pidgin"}
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <div className="min-h-0">
          <ChatPanel onSend={handleAsk} placeholder="Ask about this document..." initialMessages={initialMessages} />
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this document?"
        description="This can't be undone."
        isConfirming={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}