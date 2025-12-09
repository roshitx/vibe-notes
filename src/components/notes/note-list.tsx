"use client";

import { Note } from "@/lib/types";
import { NoteCard } from "./note-card";
import { FileText } from "lucide-react";

interface NoteListProps {
  notes: Note[];
}

export function NoteList({ notes }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
        <div className="mb-4 rounded-full bg-muted/30 p-4">
            <FileText className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">No notes created</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          You don't have any notes yet. Create your first note to start documenting your ideas.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-700 slide-in-from-bottom-4">
      {notes.map((note) => (
        <div key={note.id} className="h-[280px]">
            <NoteCard note={note} />
        </div>
      ))}
    </div>
  );
}
