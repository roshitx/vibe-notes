"use server";

import { createClient } from "@/lib/supabase/server";
import { ActionResult, Tag } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getTags(): Promise<Tag[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching tags:", error);
    return [];
  }

  return data as Tag[];
}

export async function getTag(id: string): Promise<Tag | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return null;
  }

  return data as Tag;
}

const PRESET_COLORS = [
  "#64748b", // Slate
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#22c55e", // Green
  "#10b981", // Emerald
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#a855f7", // Purple
  "#d946ef", // Fuchsia
  "#ec4899", // Pink
  "#f43f5e", // Rose
];

export async function createTag(name: string, color?: string): Promise<ActionResult<Tag>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "You must be logged in to create a tag" };
  }

  // Use provided color or pick a random one
  const finalColor = color || PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];

  const { data, error } = await supabase
    .from("tags")
    .insert({
        user_id: user.id,
        name,
        color: finalColor
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Tag already exists" };
    }
    console.error("Create tag error:", error);
    return { success: false, error: "Failed to create tag" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/notes/[id]", "page"); 
  return { success: true, data };
}

export async function deleteTag(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("tags")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting tag:", error);
    return { success: false, error: "Failed to delete tag" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/notes");
  return { success: true };
}

export async function addTagToNote(noteId: string, tagId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Ensure user owns both the note and the tag (implicitly by RLS, but explicit check is good)
  // Actually RLS handles it, we just insert.

  const { error } = await supabase
    .from("note_tags")
    .insert({
      note_id: noteId,
      tag_id: tagId
    });

  if (error) {
    if (error.code === "23505") { // Unique violation, already tagged
       return { success: true }; // Treat as success
    }
    console.error("Error adding tag to note:", error);
    return { success: false, error: "Failed to add tag to note" };
  }

  revalidatePath(`/notes/${noteId}`);
  revalidatePath("/dashboard");
  revalidatePath("/notes");
  return { success: true };
}

export async function updateTag(id: string, name: string, color?: string): Promise<ActionResult<Tag>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("tags")
    .update({
      name,
      color
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Tag name already exists" };
    }
    console.error("Error updating tag:", error);
    return { success: false, error: "Failed to update tag" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/notes/[id]", "page");
  return { success: true, data };
}

export async function removeTagFromNote(noteId: string, tagId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("note_tags")
    .delete()
    .eq("note_id", noteId)
    .eq("tag_id", tagId);

  if (error) {
    console.error("Error removing tag from note:", error);
    return { success: false, error: "Failed to remove tag from note" };
  }

  revalidatePath(`/notes/${noteId}`);
  revalidatePath("/dashboard");
  revalidatePath("/notes");
  return { success: true };
}
