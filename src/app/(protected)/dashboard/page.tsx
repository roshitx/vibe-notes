"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { getNotes, createNote } from "@/lib/actions/notes";
import { Note } from "@/lib/types";
import { NoteList } from "@/components/notes/note-list";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

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

  return (
    <div className="flex h-screen min-h-screen flex-col bg-background">
      
      <DashboardHeader />

      <ScrollArea className="flex-1">
        <main className="container mx-auto max-w-7xl px-4 py-8 md:px-6 lg:py-12">
          
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">My Information</h2>
              <p className="text-muted-foreground">
                Manage your notes and thoughts in one place.
              </p>
            </div>
            
            <Button 
                onClick={handleCreateNote} 
                disabled={isPending}
                size="default"
            >
              <Plus className="mr-2 h-4 w-4" />
              {isPending ? "Creating..." : "New Note"}
            </Button>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-600 dark:text-red-400">
             {error}
            </div>
          )}

          {isLoading ? (
             <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-xl bg-muted/50" />
                ))}
            </div>
          ) : (
             <NoteList notes={notes} />
          )}
        </main>
      </ScrollArea>
    </div>
  );
}
