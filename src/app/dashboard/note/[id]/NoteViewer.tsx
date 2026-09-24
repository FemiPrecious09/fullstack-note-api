// src/app/dashboard/note/[id]/NoteViewer.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2, X, Check, RefreshCw } from "lucide-react";
import {
  getNote,
  getNoteSummary,
  getNoteTags,
  askNote,
  updateNote,
  deleteNote,
  getNoteChatHistory,
} from "@/services/api/notes";
import { ChatPanel } from "@/components/viewer/ChatPanel";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Markdown } from "@/components/viewer/Markdown";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/util";
import type { Note } from "@/services/types";

interface NoteViewerProps {
  id: string;
}

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function NoteViewer({ id }: NoteViewerProps) {
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [initialMessages, setInitialMessages] = useState<ChatMsg[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isRegeneratingSummary, setIsRegeneratingSummary] = useState(false);

  async function loadAiExtras() {
    const [summaryRes, tagsRes] = await Promise.allSettled([getNoteSummary(id), getNoteTags(id)]);
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
        const noteData = await getNote(id);
        if (cancelled) return;
        setNote(noteData);
        await loadAiExtras();

        try {
          const historyRes = await getNoteChatHistory(id);
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
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load this note.");
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

  function startEditing() {
    if (!note) return;
    setEditTitle(note.title);
    setEditBody(note.notebody);
    setIsEditing(true);
  }

  async function handleSaveEdit() {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await updateNote(id, { title: editTitle, notebody: editBody });
      setNote(updated);
      setIsEditing(false);
      setSummary(null);
      setTags([]);
      await loadAiExtras();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteNote(id);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete this note.");
      setIsDeleting(false);
    }
  }

  async function handleRegenerateSummary() {
    setIsRegeneratingSummary(true);
    setError(null);
    try {
      const res = await getNoteSummary(id, true);
      setSummary(res.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not regenerate summary.");
    } finally {
      setIsRegeneratingSummary(false);
    }
  }

  async function handleAsk(message: string): Promise<string> {
    const response = await askNote(id, message);
    return response.answer;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="text-sm text-ink/50">Loading note...</p>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper">
        <p className="text-sm text-red-600">{error ?? "Note not found."}</p>
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
        <h1 className="flex-1 truncate font-display text-lg font-medium text-ink">{note.title}</h1>

        {isEditing ? (
          <>
            <button
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              className="rounded-md p-1.5 text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink"
              aria-label="Cancel editing"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="rounded-md p-1.5 text-indigo transition-colors hover:bg-indigo/10"
              aria-label="Save changes"
            >
              <Check className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={startEditing}
              className="rounded-md p-1.5 text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink"
              aria-label="Edit note"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDeleteOpen(true)}
              className="rounded-md p-1.5 text-ink/40 transition-colors hover:bg-red-50 hover:text-red-600"
              aria-label="Delete note"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-2">
        <div className="overflow-y-auto border-b border-ink/10 p-6 lg:border-b-0 lg:border-r">
          {isEditing ? (
            <div className="flex flex-col gap-4">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Title"
                disabled={isSaving}
              />
              <Textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                placeholder="Note content"
                disabled={isSaving}
                className="min-h-[300px]"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="bg-indigo text-paper hover:bg-indigo-dark"
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="bg-transparent text-ink/70 hover:bg-ink/5"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/80">{note.notebody}</p>
          )}

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

            {tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-gold/20 px-2.5 py-1 text-xs font-medium text-ink/70">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="min-h-0">
          <ChatPanel onSend={handleAsk} placeholder="Ask about this note..." initialMessages={initialMessages} />
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this note?"
        description="This can't be undone."
        isConfirming={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}