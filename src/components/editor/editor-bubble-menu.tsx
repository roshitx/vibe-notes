"use client";

import { Editor } from "@tiptap/react";
import { 
    Bold, 
    Italic, 
    Strikethrough, 
    Link as LinkIcon,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface EditorBubbleMenuProps {
  editor: Editor | null;
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  // Helper to set link
  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  // Helper to set color
  const setColor = useCallback((color: string) => {
      editor?.chain().focus().setColor(color).run();
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const updateMenu = () => {
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;
      
      if (!hasSelection || editor.state.selection.empty) {
        setIsVisible(false);
        return;
      }

      // Get selection coordinates
      const view = editor.view;
      const domSelection = window.getSelection();
      if (domSelection && domSelection.rangeCount > 0) {
        const range = domSelection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Position menu above the selection
        setCoords({
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
        });
        setIsVisible(true);
      }
    };

    editor.on('selectionUpdate', updateMenu);
    editor.on('transaction', updateMenu);
    
    // Also listen for mouseup to catch selections made with mouse
    const handleMouseUp = () => {
      setTimeout(updateMenu, 0);
    };
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      editor.off('selectionUpdate', updateMenu);
      editor.off('transaction', updateMenu);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [editor]);

  // Hide on blur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        // Don't hide if clicking editor content
        const editorElement = document.querySelector('.ProseMirror');
        if (editorElement && editorElement.contains(e.target as Node)) {
          return;
        }
        setIsVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  if (!editor || !isVisible) return null;

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: coords.x,
        top: coords.y,
        transform: 'translate(-50%, -100%)',
        zIndex: 50,
      }}
      className={cn(
        "flex h-9 items-center gap-1 rounded-md border bg-popover p-1 shadow-md",
        "animate-in fade-in-0 zoom-in-95 duration-150"
      )}
    >
      <Toggle
        size="sm"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        aria-label="Toggle bold"
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      
      <Toggle
        size="sm"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        aria-label="Toggle italic"
      >
        <Italic className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive("strike")}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        aria-label="Toggle strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Toggle
        size="sm"
        pressed={editor.isActive("link")}
        onPressedChange={setLink}
        aria-label="Toggle link"
      >
        <LinkIcon className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <div className="flex items-center gap-1">
          <button 
            type="button"
            className={cn("h-4 w-4 rounded-full border border-slate-200 bg-red-500 hover:scale-110 transition-transform", editor.isActive('textStyle', { color: '#ef4444' }) && "ring-2 ring-ring ring-offset-1")}
            onClick={() => setColor('#ef4444')} 
            aria-label="Red"
          />
           <button 
            type="button"
            className={cn("h-4 w-4 rounded-full border border-slate-200 bg-blue-500 hover:scale-110 transition-transform", editor.isActive('textStyle', { color: '#3b82f6' }) && "ring-2 ring-ring ring-offset-1")}
            onClick={() => setColor('#3b82f6')} 
            aria-label="Blue"
          />
           <button 
            type="button"
            className={cn("h-4 w-4 rounded-full border border-slate-200 bg-green-500 hover:scale-110 transition-transform", editor.isActive('textStyle', { color: '#22c55e' }) && "ring-2 ring-ring ring-offset-1")}
            onClick={() => setColor('#22c55e')} 
            aria-label="Green"
          />
           <button 
            type="button"
            className={cn("h-4 w-4 rounded-full border border-slate-200 bg-foreground hover:scale-110 transition-transform", !editor.isActive('textStyle') && "ring-2 ring-ring ring-offset-1")}
            onClick={() => editor.chain().focus().unsetColor().run()} 
            aria-label="Default"
          />
      </div>

    </div>
  );
}
