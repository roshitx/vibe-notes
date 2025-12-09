"use client";

import { useState, useCallback } from "react";
import { Note } from "@/lib/types";
import { updateNote } from "@/lib/actions/notes";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface NoteEditorProps {
  note: Note;
}

/**
 * Editable title and content fields with save-on-blur behavior
 * Requirements: 7.1, 8.1, 8.2
 */
export function NoteEditor({ note }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title ?? "");
  const [content, setContent] = useState(note.content ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleBlur = useCallback(async () => {
    // Only save if title has changed
    if (title === (note.title ?? "")) return;

    setIsSaving(true);
    setError(null);

    const result = await updateNote(note.id, { title: title || null });

    if (!result.success) {
      setError(result.error ?? "Failed to save title");
    }

    setIsSaving(false);
  }, [note.id, note.title, title]);

  const handleContentBlur = useCallback(async () => {
    // Only save if content has changed
    if (content === (note.content ?? "")) return;

    setIsSaving(true);
    setError(null);

    const result = await updateNote(note.id, { content: content || null });

    if (!result.success) {
      setError(result.error ?? "Failed to save content");
    }

    setIsSaving(false);
  }, [note.id, note.content, content]);

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          placeholder="Untitled"
          className="border-none text-2xl font-semibold shadow-none focus-visible:ring-0"
          disabled={isSaving}
        />
        {isSaving && (
          <span className="text-sm text-muted-foreground">Saving...</span>
        )}
      </div>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={handleContentBlur}
        placeholder="Start writing..."
        className="min-h-[400px] resize-none border-none shadow-none focus-visible:ring-0"
        disabled={isSaving}
      />
    </div>
  );
}
