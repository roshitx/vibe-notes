"use client";

import Link from "next/link";
import { Note } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NoteCardProps {
  note: Note;
}

/**
 * Displays a note as a card with title and content preview
 * Links to the note detail view
 * Requirements: 6.2, 6.4
 */
export function NoteCard({ note }: NoteCardProps) {
  // Truncate content for preview (first 100 characters)
  const contentPreview = note.content
    ? note.content.length > 100
      ? `${note.content.slice(0, 100)}...`
      : note.content
    : "No content";

  return (
    <Link href={`/notes/${note.id}`}>
      <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-1 text-lg">
            {note.title || "Untitled"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {contentPreview}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
