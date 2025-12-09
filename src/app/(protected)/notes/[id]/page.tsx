"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { getNote, updateNote } from "@/lib/actions/notes";
import { Note } from "@/lib/types";
import { DeleteDialog } from "@/components/notes/delete-dialog";
import { TagSelector } from "@/components/tags/tag-selector";
import { Button } from "@/components/ui/button";

const Editor = dynamic(() => import("@/components/editor/editor").then((mod) => mod.Editor), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full animate-pulse rounded-md bg-muted/20" />,
});
import { Input } from "@/components/ui/input";

import { usePageTitle } from "@/components/page-title-provider";

export default function NoteDetailPage() {
  const params = useParams();
  const noteId = params.id as string;
  const { setTitle: setPageTitle } = usePageTitle();

  const [note, setNote] = useState<Note | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    async function fetchNote() {
      const result = await getNote(noteId);
      if (result.success && result.data) {
        setNote(result.data);
        setTitle(result.data.title || "");
        setPageTitle(result.data.title || "Untitled");
      } else {
        setError(result.error ?? "Failed to load note");
      }
      setIsLoading(false);
    }
    fetchNote();
  }, [noteId, setPageTitle]);

  // Handle title change with debounce
  const handleTitleChange = useCallback(
    (() => {
        let timeoutId: NodeJS.Timeout;
        return (newTitle: string) => {
            setTitle(newTitle);
            setPageTitle(newTitle || "Untitled");
            setSaveStatus("saving");
            clearTimeout(timeoutId);
            timeoutId = setTimeout(async () => {
                const result = await updateNote(noteId, { title: newTitle });
                if (result.success) {
                    setSaveStatus("saved");
                } else {
                    setSaveStatus("error");
                }
            }, 1000);
        };
    })(),
    [noteId, setPageTitle]
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-center">
            <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Note</h2>
            <p className="text-muted-foreground">{error || "Note not found"}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.href = "/dashboard"}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-4 flex items-start justify-between gap-4">
             <Input 
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Note Title"
                className="flex-1 border-none bg-transparent px-0 text-4xl font-bold focus-visible:ring-0 placeholder:text-muted-foreground/40 md:text-5xl"
             />

             <div className="flex items-center gap-2 pt-2">
                <div className="mr-2 flex items-center text-xs text-muted-foreground">
                    {saveStatus === "saving" && (
                        <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            <span className="hidden sm:inline">Saving...</span>
                        </>
                    )}
                    {saveStatus === "saved" && (
                        <>
                            <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                            <span className="hidden sm:inline">Saved</span>
                        </>
                    )}
                    {saveStatus === "error" && (
                        <>
                            <AlertCircle className="mr-1 h-3 w-3 text-destructive" />
                            <span className="hidden sm:inline">Error</span>
                        </>
                    )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:ml-2">Delete</span>
                </Button>
            </div>
        </div>

        <div className="mb-8">
            <TagSelector noteId={note.id} initialTags={note.tags} />
        </div>
        
        <Editor 
            note={note} 
            onChange={() => {}} // Editor handles internal save
            onSaveStatusChange={setSaveStatus}
        />
      </main>

      <DeleteDialog
        noteId={note.id}
        noteTitle={note.title}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
}
