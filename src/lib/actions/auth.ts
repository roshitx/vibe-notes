"use server";

import { createClient } from "@/lib/supabase/server";
import { ActionResult, AuthCredentials } from "@/lib/types";
import { validateCredentials } from "@/lib/validations";
import { redirect } from "next/navigation";

/**
 * Signs up a new user with email and password
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */
export async function signUp(
  credentials: AuthCredentials
): Promise<ActionResult> {
  // Validate credentials
  const validation = validateCredentials(
    credentials.email,
    credentials.password
  );
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: credentials.email.trim(),
    password: credentials.password,
  });

  if (error) {
    // Handle specific error cases
    if (error.message.includes("already registered")) {
      return { success: false, error: "This email is already registered" };
    }
    console.error("Sign up error:", error);
    return { success: false, error: error.message };
  }

  redirect("/dashboard");
}

/**
 * Signs in an existing user with email and password
 * Requirements: 2.1, 2.2
 */
export async function signIn(
  credentials: AuthCredentials
): Promise<ActionResult> {
  // Validate credentials
  const validation = validateCredentials(
    credentials.email,
    credentials.password
  );
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: credentials.email.trim(),
    password: credentials.password,
  });

  if (error) {
    // Don't reveal which field is incorrect for security
    console.error("Sign in error:", error);
    return { success: false, error: "Invalid email or password" };
  }

  redirect("/dashboard");
}

/**
 * Signs out the current user and redirects to login
 * Requirements: 3.1, 3.2
 */
export async function signOut(): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Sign out error:", error);
    return { success: false, error: "Failed to sign out" };
  }

  redirect("/login");
}
