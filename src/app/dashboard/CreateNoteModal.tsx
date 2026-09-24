"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createNote } from "@/services/api/notes";
import type { Note } from "@/services/types";

interface CreateNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (note: Note) => void;
}

export function CreateNoteModal({ open, onOpenChange, onCreated }: CreateNoteModalProps) {
  const [title, setTitle] = useState("");
  const [notebody, setNotebody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const note = await createNote({ title, notebody });
      onCreated(note);
      setTitle("");
      setNotebody("");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save note.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a note</DialogTitle>
          <DialogDescription>
            Jot something down — KalaRead can summarize and tag it for you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note-title">Title</Label>
            <Input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Lecture recap"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note-body">Note</Label>
            <Textarea
              id="note-body"
              value={notebody}
              onChange={(e) => setNotebody(e.target.value)}
              required
              placeholder="Write your note here..."
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="bg-gold text-ink hover:bg-gold/90">
              {isSubmitting ? "Saving..." : "Save note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}