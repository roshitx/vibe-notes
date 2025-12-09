"use server";

import { createClient } from "@/lib/supabase/server";
import { ActionResult, Note, NoteInsert, NoteUpdate } from "@/lib/types";

/**
 * Creates a new note for the authenticated user
 * Requirements: 5.1, 5.2, 5.3
 */
export async function createNote(
  data?: NoteInsert
): Promise<ActionResult<Note>> {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "You must be logged in to create a note" };
  }

  // Insert note with user_id
  // Use empty strings as defaults to satisfy NOT NULL constraints
  const { data: note, error } = await supabase
    .from("notes")
    .insert({
      user_id: user.id,
      title: data?.title ?? "",
      content: data?.content ?? "",
    })
    .select()
    .single();

  if (error) {
    console.error("Create note error:", error);
    return { success: false, error: "Failed to create note" };
  }

  return { success: true, data: note };
}

/**
 * Fetches all notes for the authenticated user, ordered by updated_at desc
 * Requirements: 6.1
 */
export async function getNotes(): Promise<ActionResult<Note[]>> {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "You must be logged in to view notes" };
  }

  // Fetch all notes for user, ordered by updated_at desc
  const { data: notes, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Get notes error:", error);
    return { success: false, error: "Failed to fetch notes" };
  }

  return { success: true, data: notes };
}

/**
 * Fetches a single note by ID for the authenticated user
 * RLS ensures user ownership
 * Requirements: 7.1, 7.2, 7.3
 */
export async function getNote(id: string): Promise<ActionResult<Note>> {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "You must be logged in to view this note" };
  }

  // Fetch note by ID - RLS ensures user can only access their own notes
  const { data: note, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return { success: false, error: "Note not found" };
    }
    console.error("Get note error:", error);
    return { success: false, error: "Failed to fetch note" };
  }

  return { success: true, data: note };
}

/**
 * Updates an existing note's title and/or content
 * Database trigger handles updated_at timestamp
 * Requirements: 8.1, 8.2, 8.3
 */
export async function updateNote(
  id: string,
  data: NoteUpdate
): Promise<ActionResult<Note>> {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be logged in to update this note",
    };
  }

  // Update note - RLS ensures user can only update their own notes
  const { data: note, error } = await supabase
    .from("notes")
    .update({
      title: data.title,
      content: data.content,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return { success: false, error: "Note not found" };
    }
    console.error("Update note error:", error);
    return { success: false, error: "Failed to update note" };
  }

  return { success: true, data: note };
}

/**
 * Deletes a note by ID
 * RLS ensures user ownership
 * Requirements: 9.2
 */
export async function deleteNote(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be logged in to delete this note",
    };
  }

  // Delete note - RLS ensures user can only delete their own notes
  const { error } = await supabase.from("notes").delete().eq("id", id);

  if (error) {
    console.error("Delete note error:", error);
    return { success: false, error: "Failed to delete note" };
  }

  return { success: true };
}
