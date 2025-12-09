"use client";

import Link from "next/link";
import { Note } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Ensure Badge exists or use a div
import { Calendar, Clock, ArrowRight } from "lucide-react";

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
  // Truncate content for preview
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>?/gm, '');
  };

  const plainText = note.content ? stripHtml(note.content) : "No content available";

  // Truncate content for preview
  const contentPreview = plainText.length > 120
      ? `${plainText.slice(0, 120)}...`
      : plainText;

  const formattedDate = new Date(note.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link href={`/notes/${note.id}`} className="group block h-full">
      <Card className="flex h-full flex-col transition-colors hover:bg-muted/50">
        <CardHeader className="pb-3 pt-6">
          <CardTitle className="line-clamp-1 text-lg font-semibold tracking-tight">
            {note.title || "Untitled Note"}
          </CardTitle>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
             <span className="font-medium text-foreground/80">{formattedDate}</span>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1">
          <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
            {contentPreview}
          </p>
        </CardContent>
        
        <CardFooter className="px-6 py-4">
            <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                   Created {new Date(note.created_at).toLocaleDateString()}
                </span>
            </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
