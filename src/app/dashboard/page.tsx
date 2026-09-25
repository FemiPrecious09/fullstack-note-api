"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Upload, StickyNote as NoteIcon, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAuthStore } from "@/store/authStore";
import { listDocuments, deleteDocument } from "@/services/api/documents";
import { listNotes, deleteNote } from "@/services/api/notes";
import { UploadDocumentModal } from "@/app/dashboard/UploadDocumentModal";
import { CreateNoteModal } from "@/app/dashboard/CreateNoteModal";
import type { DocumentItem, Note } from "@/services/types";

type DeleteTarget = { type: "document" | "note"; id: string; title: string };

export default function DashboardPage() {
  const profile = useAuthStore((state) => state.profile);
  const user = useAuthStore((state) => state.user);

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [docsRes, notesRes] = await Promise.all([listDocuments(), listNotes()]);
        if (!cancelled) {
          setDocuments(docsRes.data);
          setNotes(notesRes);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load your library.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      if (deleteTarget.type === "document") {
        await deleteDocument(deleteTarget.id);
        setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      } else {
        await deleteNote(deleteTarget.id);
        setNotes((prev) => prev.filter((n) => n.id !== deleteTarget.id));
      }
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div>
        <h1 className="font-display text-2xl font-medium text-ink">
          Hello{user?.username ? `, ${user.username}` : ""}
          {profile?.current_learning ? ` — learning ${profile.current_learning} today?` : ""}
        </h1>
        <p className="mt-1 text-sm text-ink/60">Here's everything you're working through.</p>
      </div>

      {error && (
        <p className="mt-6 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <section id="documents" className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-medium text-ink">Library</h2>
          <Button onClick={() => setUploadOpen(true)} className="bg-indigo text-paper hover:bg-indigo-dark">
            <Upload className="mr-2 h-4 w-4" />
            Upload document
          </Button>
        </div>

        {isLoading ? (
          <p className="mt-4 text-sm text-ink/50">Loading...</p>
        ) : documents.length === 0 ? (
          <p className="mt-4 text-sm text-ink/50">No documents yet. Upload your first one to get started.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="group flex items-start gap-3 rounded-lg border border-ink/10 bg-paper-dim p-4 transition-colors hover:border-indigo/40"
              >
                <Link href={`/dashboard/document/${doc.id}`} className="flex min-w-0 flex-1 items-start gap-3">
                  <FileText className="mt-0.5 h-5 w-5 shrink-0 text-indigo" strokeWidth={1.75} />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{doc.title}</p>
                    <p className="mt-1 text-xs text-ink/50">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => setDeleteTarget({ type: "document", id: doc.id, title: doc.title })}
                  className="shrink-0 rounded-md p-1.5 text-ink/30 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                  aria-label="Delete document"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="notes" className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-medium text-ink">Notes</h2>
          <Button onClick={() => setNoteOpen(true)} className="bg-indigo text-paper hover:bg-indigo-dark">
            <NoteIcon className="mr-2 h-4 w-4" />
            Create note
          </Button>
        </div>

        {isLoading ? (
          <p className="mt-4 text-sm text-ink/50">Loading...</p>
        ) : notes.length === 0 ? (
          <p className="mt-4 text-sm text-ink/50">No notes yet. Create one to capture what you're learning.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="group flex flex-col gap-2 rounded-lg border border-ink/10 bg-paper-dim p-4 transition-colors hover:border-indigo/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/dashboard/note/${note.id}`} className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{note.title}</p>
                  </Link>
                  <button
                    onClick={() => setDeleteTarget({ type: "note", id: note.id, title: note.title })}
                    className="shrink-0 rounded-md p-1.5 text-ink/30 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                    aria-label="Delete note"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <Link href={`/dashboard/note/${note.id}`}>
                  <p className="line-clamp-2 text-sm text-ink/60">{note.notebody}</p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <UploadDocumentModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={(doc) => setDocuments((prev) => [doc, ...prev])}
      />
      <CreateNoteModal
        open={noteOpen}
        onOpenChange={setNoteOpen}
        onCreated={(note) => setNotes((prev) => [note, ...prev])}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.title ?? ""}"?`}
        description="This can't be undone."
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}