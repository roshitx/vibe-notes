import { getNotes } from "@/lib/actions/notes";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NoteList } from "@/components/notes/note-list";

export default async function AllNotesPage() {
  const { data: notes, success } = await getNotes();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Notes</h1>
          <p className="text-muted-foreground">
            Manage your thoughts and ideas.
          </p>
        </div>
        <Link href="/notes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Note
          </Button>
        </Link>
      </div>

      <NoteList notes={success ? notes || [] : []} />
    </div>
  );
}
