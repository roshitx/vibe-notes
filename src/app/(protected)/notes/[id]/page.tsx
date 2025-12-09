"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Trash2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { getNote, updateNote } from "@/lib/actions/notes";
import { Note, NoteWithTags } from "@/lib/types";
import { DeleteDialog } from "@/components/notes/delete-dialog";
import { TagSelector } from "@/components/tags/tag-selector";
import { NoteIconPicker } from "@/components/notes/note-icon-picker";
import { NoteCover } from "@/components/notes/note-cover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePageTitle } from "@/components/page-title-provider";

const NoteEditor = dynamic(() => import("@/components/editor/note-editor").then((mod) => mod.NoteEditor), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full animate-pulse rounded-md bg-muted/20" />,
});

export default function NoteDetailPage() {
  const params = useParams();
  const noteId = params.id as string;
  const { setTitle: setPageTitle } = usePageTitle();

  const [note, setNote] = useState<NoteWithTags | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNote() {
      const result = await getNote(noteId);
      if (result.success && result.data) {
        setNote(result.data);
        setTitle(result.data.title || "");
        setIcon(result.data.icon || null);
        setCoverUrl(result.data.cover_url || null);
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

  // Handle icon change
  const handleIconChange = useCallback(async (newIcon: string | null) => {
    setIcon(newIcon);
    setSaveStatus("saving");
    const result = await updateNote(noteId, { icon: newIcon });
    if (result.success) {
      setSaveStatus("saved");
    } else {
      setSaveStatus("error");
    }
  }, [noteId]);

  // Handle cover change
  const handleCoverChange = useCallback(async (newCoverUrl: string | null) => {
    setCoverUrl(newCoverUrl);
    setSaveStatus("saving");
    const result = await updateNote(noteId, { cover_url: newCoverUrl });
    if (result.success) {
      setSaveStatus("saved");
    } else {
      setSaveStatus("error");
    }
  }, [noteId]);

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
        {/* Cover Image */}
        <div className="group relative">
          <NoteCover coverUrl={coverUrl} onCoverChange={handleCoverChange} />
        </div>

        {/* Icon + Title Row (Floating Effect) */}
        <div className="relative z-10 -mt-16 mb-8 px-4 sm:px-0">
          <div className="flex flex-col gap-4">
            {/* Icon Picker - Large Floating Icon */}
            <div className="flex items-start">
               <div className="group relative -ml-1 transition-transform hover:scale-105">
                 <NoteIconPicker 
                    icon={icon} 
                    onIconChange={handleIconChange} 
                    className="text-7xl sm:text-8xl h-20 w-20 sm:h-24 sm:w-24 p-0 flex items-center justify-center"
                 />
               </div>
            </div>

            {/* Title & Actions */}
            <div className="flex items-start justify-between gap-4">
                <Input 
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Untitled"
                  className="flex-1 border-none bg-transparent px-0 text-4xl font-bold focus-visible:ring-0 placeholder:text-muted-foreground/40 md:text-5xl lg:text-6xl"
                />

                <div className="flex items-center gap-2 pt-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
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
          </div>
        </div>

        {/* Tags */}
        <div className="mb-8">
            <TagSelector noteId={note.id} initialTags={note.tags} />
        </div>
        
        {/* Editor */}
        <NoteEditor 
            note={note} 
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
