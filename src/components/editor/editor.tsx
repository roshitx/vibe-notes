"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { SlashCommand } from "./extensions/slash-command";
import { useEffect } from "react";
import { EditorToolbar } from "./editor-toolbar";
import { EditorBubbleMenu } from "./editor-bubble-menu";
import { Note } from "@/lib/types";
import { updateNote } from "@/lib/actions/notes";
import { uploadImage } from "@/lib/actions/upload";

interface EditorProps {
  note: Note;
  onChange?: () => void;
  onSaveStatusChange?: (status: "saved" | "saving" | "error") => void;
}

export function Editor({ note, onChange, onSaveStatusChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing your thoughts... (Type '/' for commands)",
        emptyEditorClass: "is-editor-empty before:text-muted-foreground/50 before:content-[attr(data-placeholder)] before:float-left before:pointer-events-none before:h-0",
      }),
      Image,
      SlashCommand,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      TextStyle,
      Color,
    ],
    content: note.content || "", // Initialize with note content
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base dark:prose-invert focus:outline-none max-w-none min-h-[500px] p-4",
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            event.preventDefault(); // Prevent default behavior
            
            // Upload logic duplication? Ideally refactor to hook but inline is fine for now
            const upload = async () => {
                const formData = new FormData();
                formData.append("file", file);
                const result = await uploadImage(formData);
                
                if (result.success && result.data) {
                    const { schema } = view.state;
                    const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                    if (coordinates) {
                        view.dispatch(view.state.tr.insert(coordinates.pos, schema.nodes.image.create({ src: result.data.url })));
                    }
                }
            };
            upload();
            return true;
          }
        }
        return false;
      }
    },
    onUpdate: ({ editor }) => {
      onChange?.();
      handleSave(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Debounced save function
  const handleSave = (() => {
    let timeoutId: NodeJS.Timeout;
    return (content: string) => {
      onSaveStatusChange?.("saving");
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          const result = await updateNote(note.id, { content });
          if (result.success) {
            onSaveStatusChange?.("saved");
          } else {
            console.error("Save failed:", result.error);
            onSaveStatusChange?.("error");
          }
        } catch (error) {
          console.error("Save error:", error);
          onSaveStatusChange?.("error");
        }
      }, 1000); // Debounce for 1 second
    };
  })();

  // Update editor content if note changes externally (optional, but good practice)
  useEffect(() => {
    if (editor && note.content && editor.getHTML() !== note.content && !editor.isFocused) {
       // Only update if not focused to avoid cursor jumping
       // Check if content is significantly different to avoid loops
       // detailed implementation might need better diffing, but for now strict check
    }
  }, [note.content, editor]);

  return (
    <div className="flex flex-col gap-4">
      <EditorToolbar editor={editor} />
      <div className="rounded-md border bg-background shadow-sm relative">
        <EditorBubbleMenu editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
