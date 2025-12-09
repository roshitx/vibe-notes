"use server";

import { createClient } from "@/lib/supabase/server";
import { ActionResult } from "@/lib/types";

export async function uploadImage(formData: FormData): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient();
  
  const file = formData.get("file") as File;
  if (!file) {
    return { success: false, error: "No file provided" };
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return { success: false, error: "Only image files are allowed" };
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "File size must be less than 5MB" };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error } = await supabase.storage
    .from("note-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    return { success: false, error: "Failed to upload image" };
  }

  const { data: { publicUrl } } = supabase.storage
    .from("note-images")
    .getPublicUrl(fileName);

  return { success: true, data: { url: publicUrl } };
}

export async function uploadCover(formData: FormData): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient();
  
  const file = formData.get("file") as File;
  if (!file) {
    return { success: false, error: "No file provided" };
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return { success: false, error: "Only image files are allowed" };
  }

  // Validate file size (max 10MB for covers)
  if (file.size > 10 * 1024 * 1024) {
    return { success: false, error: "File size must be less than 10MB" };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error } = await supabase.storage
    .from("note-covers")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Cover upload error:", error);
    return { success: false, error: "Failed to upload cover image" };
  }

  const { data: { publicUrl } } = supabase.storage
    .from("note-covers")
    .getPublicUrl(fileName);

  return { success: true, data: { url: publicUrl } };
}
