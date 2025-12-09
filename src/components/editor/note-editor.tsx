'use client';

import * as React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import type { Value } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';

import { EditorKit } from '@/components/editor/editor-kit';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { Note } from '@/lib/types';
import { updateNote } from '@/lib/actions/notes';

interface NoteEditorProps {
  note: Note;
  onSaveStatusChange?: (status: 'saved' | 'saving' | 'error') => void;
}

// Convert HTML to Plate JSON (basic conversion for existing notes)
function htmlToPlateValue(html: string | null): Value {
  if (!html || html.trim() === '') {
    return [{ type: 'p', children: [{ text: '' }] }];
  }
  
  // For now, treat existing HTML content as a paragraph
  // This is a simplified approach - a full converter would parse HTML properly
  const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  if (!textContent) {
    return [{ type: 'p', children: [{ text: '' }] }];
  }
  
  return [{ type: 'p', children: [{ text: textContent }] }];
}

// Check if content is already Plate JSON format
function isPlateValue(content: unknown): content is Value {
  return Array.isArray(content) && content.length > 0 && 
    typeof content[0] === 'object' && content[0] !== null && 
    'type' in content[0] && 'children' in content[0];
}

// Parse note content (could be HTML string or Plate JSON)
function parseNoteContent(content: string | null): Value {
  if (!content) {
    return [{ type: 'p', children: [{ text: '' }] }];
  }
  
  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(content);
    if (isPlateValue(parsed)) {
      return parsed;
    }
  } catch {
    // Not valid JSON, treat as HTML
  }
  
  // Convert HTML to basic Plate format
  return htmlToPlateValue(content);
}

export function NoteEditor({ note, onSaveStatusChange }: NoteEditorProps) {
  const initialValue = React.useMemo(() => parseNoteContent(note.content), [note.content]);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContent = useRef<string>(JSON.stringify(initialValue));

  const editor = usePlateEditor({
    plugins: EditorKit,
    value: initialValue,
  });

  // Debounced save function
  const handleSave = useCallback(async (value: Value) => {
    const contentString = JSON.stringify(value);
    
    // Don't save if content hasn't changed
    if (contentString === lastSavedContent.current) {
      return;
    }

    onSaveStatusChange?.('saving');
    
    const result = await updateNote(note.id, { content: contentString });
    
    if (result.success) {
      lastSavedContent.current = contentString;
      onSaveStatusChange?.('saved');
    } else {
      onSaveStatusChange?.('error');
    }
  }, [note.id, onSaveStatusChange]);

  // Setup onChange handler with debounce
  useEffect(() => {
    const handleChange = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        handleSave(editor.children as Value);
      }, 1500);
    };

    // Subscribe to editor changes
    const originalOnChange = editor.onChange;
    editor.onChange = (options) => {
      originalOnChange(options);
      handleChange();
    };

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [editor, handleSave]);

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor 
          variant="default" 
          placeholder="Start writing... (use / for commands)"
        />
      </EditorContainer>
    </Plate>
  );
}
