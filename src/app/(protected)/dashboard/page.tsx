"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { getNotes, createNote } from "@/lib/actions/notes";
import { Note } from "@/lib/types";
import { NoteList } from "@/components/notes/note-list";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";

/**
 * Dashboard page displaying all notes for the authenticated user
 * Requirements: 6.1, 6.2, 6.3
 */
export default function DashboardPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function fetchNotes() {
      const result = await getNotes();
      if (result.success && result.data) {
        setNotes(result.data);
      } else {
        setError(result.error ?? "Failed to load notes");
      }
      setIsLoading(false);
    }
    fetchNotes();
  }, []);

  const handleCreateNote = () => {
    startTransition(async () => {
      const result = await createNote();
      if (result.success && result.data) {
        router.push(`/notes/${result.data.id}`);
      } else {
        setError(result.error ?? "Failed to create note");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-semibold">Vibe Notes</h1>
          <LogoutButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">My Notes</h2>
          <Button onClick={handleCreateNote} disabled={isPending}>
            <Plus className="mr-2 h-4 w-4" />
            {isPending ? "Creating..." : "New Note"}
          </Button>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <NoteList notes={notes} />
      </main>
    </div>
  );
}
