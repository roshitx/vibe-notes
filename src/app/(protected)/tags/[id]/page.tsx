import { getNotesByTag } from "@/lib/actions/notes";
import { getTag } from "@/lib/actions/tags";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NoteList } from "@/components/notes/note-list";
import { notFound } from "next/navigation";
import { PageTitleSetter } from "@/components/page-title-setter";

interface TagPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TagPage({ params }: TagPageProps) {
  const { id } = await params;
  const tag = await getTag(id);

  if (!tag) {
    notFound();
  }

  const { data: notes, success } = await getNotesByTag(id);

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageTitleSetter title={tag.name} />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             {tag.color && (
                <div 
                  className="h-6 w-6 rounded-full border shadow-sm"
                  style={{ backgroundColor: tag.color }} 
                />
             )}
             <h1 className="text-3xl font-bold tracking-tight">{tag.name}</h1>
          </div>
          <p className="text-muted-foreground">
            Notes tagged with <strong>{tag.name}</strong>
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
