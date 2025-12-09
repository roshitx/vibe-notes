/**
 * Shared TypeScript types for Vibe Notes
 */

/**
 * Represents a note stored in the database
 */
export interface Note {
  id: string;
  user_id: string;
  title: string | null;
  content: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Data required to insert a new note
 */
export interface NoteInsert {
  title?: string | null;
  content?: string | null;
}

/**
 * Data for updating an existing note
 */
export interface NoteUpdate {
  title?: string | null;
  content?: string | null;
}

/**
 * Generic result type for server actions
 */
export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Authentication credentials for sign up and sign in
 */
/**
 * Authentication credentials for sign up and sign in
 */
export interface AuthCredentials {
  email: string;
  password: string;
}

/**
 * Represents a tag for organizing notes
 */
export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color?: string | null;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string | null;
  content: string | null;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}
