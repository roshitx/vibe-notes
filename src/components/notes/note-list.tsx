"use client";

import { Note } from "@/lib/types";
import { NoteCard } from "./note-card";

interface NoteListProps {
  notes: Note[];
}

/**
 * Renders a grid of NoteCard components
 * Handles empty state with a prompt to create a note
 * Requirements: 6.1, 6.3
 */
export function NoteList({ notes }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg text-muted-foreground">No notes yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Create your first note to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}
