# Implementation Plan

- [-] 1. Initialize Next.js 15 project with TypeScript and dependencies

  - Initialize Next.js 15 project with App Router using `bunx create-next-app@latest`
  - Configure TypeScript strict mode in `tsconfig.json`
  - Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `lucide-react`
  - Initialize Tailwind CSS and shadcn/ui with `bunx shadcn@latest init`
  - Add shadcn components: Button, Card, Input, Textarea, Dialog
  - _Requirements: Tech Stack from spec.md_

- [ ] 1.5. Set up Supabase database schema

  - [ ] 1.5.1 Create notes table
    - Run migration `supabase/migrations/001_create_notes_table.sql` in Supabase SQL Editor
    - Table: `notes` with columns: id (uuid), user_id (uuid FK), title, content, created_at, updated_at
    - _Requirements: 5.2, 5.3, 8.3, 11.1, 11.2_
  - [ ] 1.5.2 Enable Row Level Security
    - Enable RLS on notes table
    - Create policies for SELECT, INSERT, UPDATE, DELETE
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  - [ ] 1.5.3 Create updated_at trigger
    - Create function `handle_updated_at()` to auto-update timestamp
    - Attach trigger to notes table
    - _Requirements: 8.3_

- [x] 2. Set up Supabase client configuration

  - [x] 2.1 Create Supabase browser client
    - Create `src/lib/supabase/client.ts` with browser client factory
    - Use `@supabase/ssr` createBrowserClient
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 2.2 Create Supabase server client
    - Create `src/lib/supabase/server.ts` with server client factory
    - Use `@supabase/ssr` createServerClient with cookie handling
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 2.3 Create middleware helper
    - Create `src/lib/supabase/middleware.ts` for session refresh
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 3. Define TypeScript types and validation

  - [x] 3.1 Create shared type definitions
    - Create `src/lib/types.ts` with Note, NoteInsert, NoteUpdate, ActionResult, AuthCredentials interfaces
    - _Requirements: 11.1, 11.2_
  - [x] 3.2 Create validation schemas
    - Create `src/lib/validations.ts` with email and password validation functions
    - Email must be valid format, password must be >= 6 characters
    - _Requirements: 1.3, 1.4_
  - [x] 3.3 Write property test for input validation
    - **Property 1: Input Validation Rejects Invalid Credentials**
    - Test that invalid emails and short passwords are rejected
    - **Validates: Requirements 1.3, 1.4**

- [x] 4. Implement authentication Server Actions

  - [x] 4.1 Create signUp action
    - Create `src/lib/actions/auth.ts` with signUp function
    - Validate credentials, call Supabase auth.signUp, handle errors
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 4.2 Create signIn action
    - Add signIn function to auth.ts
    - Validate credentials, call Supabase auth.signInWithPassword
    - _Requirements: 2.1, 2.2_
  - [x] 4.3 Create signOut action
    - Add signOut function to auth.ts
    - Call Supabase auth.signOut, redirect to login
    - _Requirements: 3.1, 3.2_

- [x] 5. Implement middleware for protected routes

  - [x] 5.1 Create Next.js middleware
    - Create `src/middleware.ts` with route protection logic
    - Refresh session, redirect unauthenticated users from protected routes
    - Define protected route matcher for /dashboard and /notes/\*
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 5.2 Write property test for protected routes
    - **Property 2: Protected Routes Redirect Unauthenticated Users**
    - Test that unauthenticated requests to protected routes return redirects
    - **Validates: Requirements 4.1, 4.2, 4.3**

- [x] 6. Implement notes Server Actions

  - [x] 6.1 Create createNote action
    - Create `src/lib/actions/notes.ts` with createNote function
    - Get authenticated user, insert note with user_id, return created note
    - _Requirements: 5.1, 5.2, 5.3_
  - [x] 6.2 Write property test for note creation
    - **Property 3: Note Creation Associates Correct User**
    - Test that created notes have correct user_id and timestamps
    - **Validates: Requirements 5.1, 5.2, 5.3**
  - [x] 6.3 Create getNotes action
    - Add getNotes function to notes.ts
    - Fetch all notes for authenticated user, ordered by updated_at desc
    - _Requirements: 6.1_
  - [x] 6.4 Create getNote action
    - Add getNote function to notes.ts
    - Fetch single note by ID, RLS ensures user ownership
    - _Requirements: 7.1, 7.2, 7.3_
  - [x] 6.5 Write property test for fetching notes
    - **Property 8: User Fetches Only Own Notes**
    - Test that getNotes returns only notes belonging to authenticated user
    - **Validates: Requirements 6.1, 7.1**
  - [x] 6.6 Create updateNote action
    - Add updateNote function to notes.ts
    - Update note title/content, database trigger handles updated_at
    - _Requirements: 8.1, 8.2, 8.3_
  - [x] 6.7 Write property test for note updates
    - **Property 4: Note Update Persists Changes**
    - Test that updates are persisted and updated_at is modified
    - **Validates: Requirements 8.1, 8.2, 8.3**
  - [x] 6.8 Create deleteNote action
    - Add deleteNote function to notes.ts
    - Delete note by ID, RLS ensures user ownership
    - _Requirements: 9.2_
  - [x] 6.9 Write property test for note deletion
    - **Property 5: Note Deletion Removes From Database**
    - Test that deleted notes are no longer retrievable
    - **Validates: Requirements 9.2**

- [ ] 7. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Create authentication UI components

  - [x] 8.1 Create signup form component
    - Create `src/components/auth/signup-form.tsx`
    - Form with email/password inputs, validation feedback, submit handler
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 8.2 Create login form component
    - Create `src/components/auth/login-form.tsx`
    - Form with email/password inputs, error display, submit handler
    - _Requirements: 2.1, 2.2_
  - [x] 8.3 Create logout button component
    - Create `src/components/auth/logout-button.tsx`
    - Button that calls signOut action
    - _Requirements: 3.1_

- [x] 9. Create authentication pages

  - [x] 9.1 Create signup page
    - Create `src/app/(auth)/signup/page.tsx`
    - Render SignupForm, redirect if already authenticated
    - _Requirements: 1.1_
  - [x] 9.2 Create login page
    - Create `src/app/(auth)/login/page.tsx`
    - Render LoginForm, redirect if already authenticated
    - _Requirements: 2.1, 2.3_

- [x] 10. Create notes UI components

  - [x] 10.1 Create note card component
    - Create `src/components/notes/note-card.tsx`
    - Display note title and content preview, link to detail view
    - _Requirements: 6.2, 6.4_
  - [x] 10.2 Create note list component
    - Create `src/components/notes/note-list.tsx`
    - Render grid of NoteCard components, handle empty state
    - _Requirements: 6.1, 6.3_
  - [x] 10.3 Create note editor component
    - Create `src/components/notes/note-editor.tsx`
    - Editable title and content fields with save-on-blur behavior
    - _Requirements: 7.1, 8.1, 8.2_
  - [x] 10.4 Create delete dialog component
    - Create `src/components/notes/delete-dialog.tsx`
    - Confirmation dialog using shadcn Dialog component
    - _Requirements: 9.1, 9.3_

- [x] 11. Create protected pages

  - [x] 11.1 Create dashboard page
    - Create `src/app/(protected)/dashboard/page.tsx`
    - Fetch notes using RSC, render NoteList, add create note button
    - _Requirements: 6.1, 6.2, 6.3_
  - [x] 11.2 Create note detail page
    - Create `src/app/(protected)/notes/[id]/page.tsx`
    - Fetch note by ID using RSC, render NoteEditor, add delete button
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 12. Create root layout and landing page

  - [x] 12.1 Update root layout
    - Update `src/app/layout.tsx` with Tailwind styles and font configuration
    - _Requirements: Tech Stack_
  - [x] 12.2 Create landing page
    - Update `src/app/page.tsx` with redirect to dashboard or login
    - _Requirements: 4.1_

- [x] 13. Write property test for RLS enforcement

  - [x] 13.1 Write property test for data isolation
    - **Property 6: RLS Enforces User Data Isolation**
    - Test that users cannot access other users' notes
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 7.2**

- [x] 14. Write property test for serialization

  - [x] 14.1 Write property test for note round-trip
    - **Property 7: Note Serialization Round-Trip**
    - Test that serializing and deserializing notes preserves all data
    - **Validates: Requirements 11.1, 11.2, 11.3**

- [ ] 15. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
