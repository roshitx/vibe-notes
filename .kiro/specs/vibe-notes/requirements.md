# Requirements Document

## Introduction

Vibe Notes is a minimalist, high-performance web application for personal note-taking built with Next.js 15 and Supabase. The application follows a "Vibe Coding" philosophy prioritizing development speed, clean architecture, and modern aesthetics. Security is enforced through Supabase Row Level Security (RLS), ensuring users can only access their own data.

## Glossary

- **Vibe Notes System**: The web application providing note-taking functionality
- **User**: An authenticated individual using the application
- **Note**: A text-based record containing a title and content, owned by a single user
- **Dashboard**: The main view displaying all notes belonging to the authenticated user
- **Server Action**: A Next.js server-side function handling database mutations
- **RLS (Row Level Security)**: Supabase security feature restricting data access at the database level
- **Protected Route**: A page requiring authentication to access

## Requirements

### Requirement 1: User Registration

**User Story:** As a new user, I want to create an account with my email and password, so that I can securely store my personal notes.

#### Acceptance Criteria

1. WHEN a user submits valid email and password on the sign-up form THEN the Vibe Notes System SHALL create a new user account and redirect to the dashboard
2. WHEN a user submits an email already registered THEN the Vibe Notes System SHALL display an error message indicating the email is in use
3. WHEN a user submits a password shorter than 6 characters THEN the Vibe Notes System SHALL display a validation error and prevent account creation
4. WHEN a user submits an invalid email format THEN the Vibe Notes System SHALL display a validation error and prevent account creation

### Requirement 2: User Login

**User Story:** As a registered user, I want to log in with my email and password, so that I can access my notes.

#### Acceptance Criteria

1. WHEN a user submits valid credentials on the login form THEN the Vibe Notes System SHALL authenticate the user and redirect to the dashboard
2. WHEN a user submits invalid credentials THEN the Vibe Notes System SHALL display an error message without revealing which field is incorrect
3. WHEN a user is already authenticated and visits the login page THEN the Vibe Notes System SHALL redirect the user to the dashboard

### Requirement 3: User Logout

**User Story:** As an authenticated user, I want to log out of my account, so that I can secure my session on shared devices.

#### Acceptance Criteria

1. WHEN an authenticated user clicks the logout button THEN the Vibe Notes System SHALL terminate the session and redirect to the login page
2. WHEN a user logs out THEN the Vibe Notes System SHALL clear all session cookies from the browser

### Requirement 4: Protected Routes

**User Story:** As a system administrator, I want unauthenticated users redirected away from protected pages, so that user data remains secure.

#### Acceptance Criteria

1. WHEN an unauthenticated user attempts to access the dashboard THEN the Vibe Notes System SHALL redirect the user to the login page
2. WHEN an unauthenticated user attempts to access a note detail page THEN the Vibe Notes System SHALL redirect the user to the login page
3. WHEN an authenticated user accesses a protected route THEN the Vibe Notes System SHALL render the requested page

### Requirement 5: Create Note

**User Story:** As an authenticated user, I want to create new notes, so that I can capture my thoughts and ideas.

#### Acceptance Criteria

1. WHEN an authenticated user clicks the create note button THEN the Vibe Notes System SHALL create a new note with empty title and content and navigate to the note editor
2. WHEN a note is created THEN the Vibe Notes System SHALL associate the note with the authenticated user's ID
3. WHEN a note is created THEN the Vibe Notes System SHALL set the created_at and updated_at timestamps to the current time

### Requirement 6: Read Notes (Dashboard)

**User Story:** As an authenticated user, I want to view all my notes on a dashboard, so that I can quickly find and access my content.

#### Acceptance Criteria

1. WHEN an authenticated user visits the dashboard THEN the Vibe Notes System SHALL display all notes belonging to that user
2. WHEN displaying notes THEN the Vibe Notes System SHALL show the note title and a preview of the content
3. WHEN a user has no notes THEN the Vibe Notes System SHALL display an empty state with a prompt to create a note
4. WHEN a user clicks on a note card THEN the Vibe Notes System SHALL navigate to the note detail view

### Requirement 7: Read Note (Detail View)

**User Story:** As an authenticated user, I want to view and edit a specific note, so that I can read or modify its content.

#### Acceptance Criteria

1. WHEN an authenticated user navigates to a note detail page THEN the Vibe Notes System SHALL display the note title and content in editable fields
2. WHEN a user attempts to access a note belonging to another user THEN the Vibe Notes System SHALL deny access and display an error
3. WHEN a user attempts to access a non-existent note THEN the Vibe Notes System SHALL display a not found message

### Requirement 8: Update Note

**User Story:** As an authenticated user, I want to edit my notes with automatic saving, so that I never lose my changes.

#### Acceptance Criteria

1. WHEN a user modifies the note title and the input loses focus THEN the Vibe Notes System SHALL persist the updated title to the database
2. WHEN a user modifies the note content and the input loses focus THEN the Vibe Notes System SHALL persist the updated content to the database
3. WHEN a note is updated THEN the Vibe Notes System SHALL update the updated_at timestamp to the current time
4. WHEN a note update fails THEN the Vibe Notes System SHALL display an error message to the user

### Requirement 9: Delete Note

**User Story:** As an authenticated user, I want to delete notes I no longer need, so that I can keep my dashboard organized.

#### Acceptance Criteria

1. WHEN a user clicks the delete button on a note THEN the Vibe Notes System SHALL display a confirmation dialog
2. WHEN a user confirms note deletion THEN the Vibe Notes System SHALL remove the note from the database and redirect to the dashboard
3. WHEN a user cancels note deletion THEN the Vibe Notes System SHALL close the dialog and retain the note
4. WHEN a note deletion fails THEN the Vibe Notes System SHALL display an error message to the user

### Requirement 10: Data Security (RLS)

**User Story:** As a user, I want my notes protected at the database level, so that no other user can access my data.

#### Acceptance Criteria

1. WHILE Row Level Security is enabled on the notes table THEN the Vibe Notes System SHALL restrict SELECT operations to rows where auth.uid() matches user_id
2. WHILE Row Level Security is enabled on the notes table THEN the Vibe Notes System SHALL restrict INSERT operations to rows where auth.uid() matches user_id
3. WHILE Row Level Security is enabled on the notes table THEN the Vibe Notes System SHALL restrict UPDATE operations to rows where auth.uid() matches user_id
4. WHILE Row Level Security is enabled on the notes table THEN the Vibe Notes System SHALL restrict DELETE operations to rows where auth.uid() matches user_id

### Requirement 11: Note Data Serialization

**User Story:** As a developer, I want notes to be properly serialized and deserialized between client and server, so that data integrity is maintained.

#### Acceptance Criteria

1. WHEN a note is fetched from the database THEN the Vibe Notes System SHALL deserialize the note into a typed Note object
2. WHEN a note is sent to the database THEN the Vibe Notes System SHALL serialize the Note object into the correct database format
3. WHEN serializing and deserializing a note THEN the Vibe Notes System SHALL preserve all field values without data loss
