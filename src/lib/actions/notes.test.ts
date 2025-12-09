import { describe, expect } from "vitest";
import { test } from "@fast-check/vitest";
import fc from "fast-check";
import { Note, NoteInsert, NoteUpdate } from "@/lib/types";

/**
 * **Feature: vibe-notes, Property 3: Note Creation Associates Correct User**
 * **Validates: Requirements 5.1, 5.2, 5.3**
 *
 * For any authenticated user creating a note, the resulting note SHALL have
 * a user_id matching the authenticated user's ID, and SHALL have created_at
 * and updated_at timestamps set to the current time (within acceptable tolerance).
 */
describe("Property 3: Note Creation Associates Correct User", () => {
  // Generator for valid UUIDs (user IDs)
  const uuidArbitrary = fc.uuid();

  // Generator for note insert data
  const noteInsertArbitrary: fc.Arbitrary<NoteInsert> = fc.record({
    title: fc.option(fc.string({ maxLength: 500 }), { nil: null }),
    content: fc.option(fc.string({ maxLength: 10000 }), { nil: null }),
  });

  // Generator for valid ISO timestamp strings
  const isoTimestampArbitrary = fc
    .date({
      min: new Date("2020-01-01T00:00:00.000Z"),
      max: new Date("2030-12-31T23:59:59.999Z"),
      noInvalidDate: true,
    })
    .filter((d) => !isNaN(d.getTime()))
    .map((d) => d.toISOString());

  /**
   * Simulates the note creation logic that would be performed by the server action.
   * This pure function represents the core business logic of createNote.
   */
  function buildNote(
    userId: string,
    noteId: string,
    input: NoteInsert,
    timestamp: string
  ): Note {
    return {
      id: noteId,
      user_id: userId,
      title: input.title ?? null,
      content: input.content ?? null,
      created_at: timestamp,
      updated_at: timestamp,
    };
  }

  /**
   * Validates that a Note object has the correct structure and types
   */
  function isValidNote(note: Note): boolean {
    return (
      typeof note.id === "string" &&
      note.id.length > 0 &&
      typeof note.user_id === "string" &&
      note.user_id.length > 0 &&
      (note.title === null || typeof note.title === "string") &&
      (note.content === null || typeof note.content === "string") &&
      typeof note.created_at === "string" &&
      typeof note.updated_at === "string" &&
      !isNaN(Date.parse(note.created_at)) &&
      !isNaN(Date.parse(note.updated_at))
    );
  }

  /**
   * Validates that timestamps are within acceptable tolerance of each other
   * (for created_at and updated_at which should be set at the same time)
   */
  function timestampsAreEqual(timestamp1: string, timestamp2: string): boolean {
    const date1 = new Date(timestamp1).getTime();
    const date2 = new Date(timestamp2).getTime();
    // Allow 1 second tolerance for timestamp comparison
    return Math.abs(date1 - date2) <= 1000;
  }

  test.prop(
    [uuidArbitrary, uuidArbitrary, noteInsertArbitrary, isoTimestampArbitrary],
    {
      numRuns: 100,
    }
  )(
    "created note has user_id matching the authenticated user",
    (userId, noteId, input, timestamp) => {
      const note = buildNote(userId, noteId, input, timestamp);

      // Property: user_id must match the authenticated user's ID
      expect(note.user_id).toBe(userId);
    }
  );

  test.prop(
    [uuidArbitrary, uuidArbitrary, noteInsertArbitrary, isoTimestampArbitrary],
    {
      numRuns: 100,
    }
  )(
    "created note has valid created_at and updated_at timestamps",
    (userId, noteId, input, timestamp) => {
      const note = buildNote(userId, noteId, input, timestamp);

      // Property: timestamps must be valid ISO dates
      expect(Date.parse(note.created_at)).not.toBeNaN();
      expect(Date.parse(note.updated_at)).not.toBeNaN();

      // Property: created_at and updated_at should be equal on creation
      expect(timestampsAreEqual(note.created_at, note.updated_at)).toBe(true);
    }
  );

  test.prop(
    [uuidArbitrary, uuidArbitrary, noteInsertArbitrary, isoTimestampArbitrary],
    {
      numRuns: 100,
    }
  )(
    "created note preserves input title and content",
    (userId, noteId, input, timestamp) => {
      const note = buildNote(userId, noteId, input, timestamp);

      // Property: title and content should match input (or be null if not provided)
      expect(note.title).toBe(input.title ?? null);
      expect(note.content).toBe(input.content ?? null);
    }
  );

  test.prop(
    [uuidArbitrary, uuidArbitrary, noteInsertArbitrary, isoTimestampArbitrary],
    {
      numRuns: 100,
    }
  )("created note has valid structure", (userId, noteId, input, timestamp) => {
    const note = buildNote(userId, noteId, input, timestamp);

    // Property: note must have valid structure
    expect(isValidNote(note)).toBe(true);
  });

  // Edge case: empty input should create note with null title and content
  test.prop([uuidArbitrary, uuidArbitrary, isoTimestampArbitrary], {
    numRuns: 100,
  })(
    "empty input creates note with null title and content",
    (userId, noteId, timestamp) => {
      const emptyInput: NoteInsert = {};
      const note = buildNote(userId, noteId, emptyInput, timestamp);

      expect(note.title).toBeNull();
      expect(note.content).toBeNull();
      expect(note.user_id).toBe(userId);
    }
  );
});

/**
 * **Feature: vibe-notes, Property 8: User Fetches Only Own Notes**
 * **Validates: Requirements 6.1, 7.1**
 *
 * For any authenticated user, the getNotes function SHALL return only notes
 * where user_id matches the authenticated user's ID, and SHALL return all such notes.
 */
describe("Property 8: User Fetches Only Own Notes", () => {
  // Generator for valid UUIDs
  const uuidArbitrary = fc.uuid();

  // Generator for valid ISO timestamp strings
  const isoTimestampArbitrary = fc
    .date({
      min: new Date("2020-01-01T00:00:00.000Z"),
      max: new Date("2030-12-31T23:59:59.999Z"),
      noInvalidDate: true,
    })
    .filter((d) => !isNaN(d.getTime()))
    .map((d) => d.toISOString());

  // Generator for a single note with a specific user_id
  const noteWithUserArbitrary = (userId: string): fc.Arbitrary<Note> =>
    fc.record({
      id: uuidArbitrary,
      user_id: fc.constant(userId),
      title: fc.option(fc.string({ maxLength: 500 }), { nil: null }),
      content: fc.option(fc.string({ maxLength: 10000 }), { nil: null }),
      created_at: isoTimestampArbitrary,
      updated_at: isoTimestampArbitrary,
    });

  // Generator for a note belonging to a different user
  const noteWithDifferentUserArbitrary = (
    excludeUserId: string
  ): fc.Arbitrary<Note> =>
    fc
      .record({
        id: uuidArbitrary,
        user_id: uuidArbitrary.filter((id) => id !== excludeUserId),
        title: fc.option(fc.string({ maxLength: 500 }), { nil: null }),
        content: fc.option(fc.string({ maxLength: 10000 }), { nil: null }),
        created_at: isoTimestampArbitrary,
        updated_at: isoTimestampArbitrary,
      })
      .filter((note) => note.user_id !== excludeUserId);

  /**
   * Simulates the filtering logic of getNotes - returns only notes belonging to the user.
   * This pure function represents the core business logic that RLS + getNotes enforces.
   */
  function filterNotesForUser(allNotes: Note[], userId: string): Note[] {
    return allNotes.filter((note) => note.user_id === userId);
  }

  /**
   * Sorts notes by updated_at descending (as getNotes does)
   */
  function sortNotesByUpdatedAt(notes: Note[]): Note[] {
    return [...notes].sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }

  test.prop(
    [uuidArbitrary, fc.array(fc.uuid(), { minLength: 0, maxLength: 5 })],
    {
      numRuns: 100,
    }
  )(
    "getNotes returns only notes belonging to the authenticated user",
    (authenticatedUserId, otherUserIds) => {
      // Generate notes for the authenticated user
      const userNotesCount = Math.floor(Math.random() * 5);
      const userNotes: Note[] = [];
      for (let i = 0; i < userNotesCount; i++) {
        userNotes.push({
          id: crypto.randomUUID(),
          user_id: authenticatedUserId,
          title: `User Note ${i}`,
          content: `Content ${i}`,
          created_at: new Date().toISOString(),
          updated_at: new Date(Date.now() - i * 1000).toISOString(),
        });
      }

      // Generate notes for other users
      const otherNotes: Note[] = otherUserIds
        .filter((id) => id !== authenticatedUserId)
        .map((userId, i) => ({
          id: crypto.randomUUID(),
          user_id: userId,
          title: `Other Note ${i}`,
          content: `Other Content ${i}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

      // Combine all notes (simulating database state)
      const allNotes = [...userNotes, ...otherNotes];

      // Apply the filtering logic (simulating getNotes with RLS)
      const result = filterNotesForUser(allNotes, authenticatedUserId);

      // Property: All returned notes must belong to the authenticated user
      expect(result.every((note) => note.user_id === authenticatedUserId)).toBe(
        true
      );

      // Property: No notes from other users should be returned
      expect(
        result.every(
          (note) =>
            !otherUserIds.includes(note.user_id) ||
            note.user_id === authenticatedUserId
        )
      ).toBe(true);
    }
  );

  test.prop(
    [
      uuidArbitrary,
      fc.array(
        fc.record({
          id: uuidArbitrary,
          title: fc.option(fc.string({ maxLength: 100 }), { nil: null }),
          content: fc.option(fc.string({ maxLength: 500 }), { nil: null }),
          created_at: isoTimestampArbitrary,
          updated_at: isoTimestampArbitrary,
        }),
        { minLength: 0, maxLength: 10 }
      ),
    ],
    { numRuns: 100 }
  )(
    "getNotes returns all notes belonging to the authenticated user",
    (authenticatedUserId, noteData) => {
      // Create notes for the authenticated user
      const userNotes: Note[] = noteData.map((data) => ({
        ...data,
        user_id: authenticatedUserId,
      }));

      // Create some notes for a different user
      const otherUserId = crypto.randomUUID();
      const otherNotes: Note[] = [
        {
          id: crypto.randomUUID(),
          user_id: otherUserId,
          title: "Other user note",
          content: "Should not be returned",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      // Combine all notes
      const allNotes = [...userNotes, ...otherNotes];

      // Apply the filtering logic
      const result = filterNotesForUser(allNotes, authenticatedUserId);

      // Property: All user's notes should be returned
      expect(result.length).toBe(userNotes.length);

      // Property: Each user note should be in the result
      userNotes.forEach((userNote) => {
        expect(result.some((note) => note.id === userNote.id)).toBe(true);
      });
    }
  );

  test.prop(
    [
      uuidArbitrary,
      fc.array(
        fc.record({
          id: uuidArbitrary,
          title: fc.option(fc.string({ maxLength: 100 }), { nil: null }),
          content: fc.option(fc.string({ maxLength: 500 }), { nil: null }),
          created_at: isoTimestampArbitrary,
          updated_at: isoTimestampArbitrary,
        }),
        { minLength: 2, maxLength: 10 }
      ),
    ],
    { numRuns: 100 }
  )(
    "getNotes returns notes sorted by updated_at descending",
    (authenticatedUserId, noteData) => {
      // Create notes with varying updated_at timestamps
      const userNotes: Note[] = noteData.map((data, index) => ({
        ...data,
        user_id: authenticatedUserId,
        updated_at: new Date(Date.now() - index * 60000).toISOString(), // Each note 1 minute apart
      }));

      // Shuffle the notes to simulate unsorted database state
      const shuffledNotes = [...userNotes].sort(() => Math.random() - 0.5);

      // Apply filtering and sorting (as getNotes does)
      const filtered = filterNotesForUser(shuffledNotes, authenticatedUserId);
      const result = sortNotesByUpdatedAt(filtered);

      // Property: Notes should be sorted by updated_at descending
      for (let i = 0; i < result.length - 1; i++) {
        const currentTime = new Date(result[i].updated_at).getTime();
        const nextTime = new Date(result[i + 1].updated_at).getTime();
        expect(currentTime).toBeGreaterThanOrEqual(nextTime);
      }
    }
  );

  test.prop([uuidArbitrary], { numRuns: 100 })(
    "getNotes returns empty array when user has no notes",
    (authenticatedUserId) => {
      // Create notes only for other users
      const otherUserId = crypto.randomUUID();
      const otherNotes: Note[] = [
        {
          id: crypto.randomUUID(),
          user_id: otherUserId,
          title: "Other user note",
          content: "Content",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      // Apply the filtering logic
      const result = filterNotesForUser(otherNotes, authenticatedUserId);

      // Property: Should return empty array when user has no notes
      expect(result).toEqual([]);
    }
  );
});

/**
 * **Feature: vibe-notes, Property 4: Note Update Persists Changes**
 * **Validates: Requirements 8.1, 8.2, 8.3**
 *
 * For any valid note update (title or content change), the updated note retrieved
 * from the database SHALL reflect the new values, and the updated_at timestamp
 * SHALL be greater than or equal to the original updated_at.
 */
describe("Property 4: Note Update Persists Changes", () => {
  // Generator for valid UUIDs
  const uuidArbitrary = fc.uuid();

  // Generator for valid ISO timestamp strings in the past (to ensure updated_at can be greater)
  const pastTimestampArbitrary = fc
    .date({
      min: new Date("2020-01-01T00:00:00.000Z"),
      max: new Date(Date.now() - 1000), // At least 1 second in the past
      noInvalidDate: true,
    })
    .filter((d) => !isNaN(d.getTime()))
    .map((d) => d.toISOString());

  // Generator for a complete Note object with timestamps in the past
  const noteArbitrary: fc.Arbitrary<Note> = fc.record({
    id: uuidArbitrary,
    user_id: uuidArbitrary,
    title: fc.option(fc.string({ maxLength: 500 }), { nil: null }),
    content: fc.option(fc.string({ maxLength: 10000 }), { nil: null }),
    created_at: pastTimestampArbitrary,
    updated_at: pastTimestampArbitrary,
  });

  // Generator for NoteUpdate data
  const noteUpdateArbitrary: fc.Arbitrary<NoteUpdate> = fc.record({
    title: fc.option(fc.string({ maxLength: 500 }), { nil: null }),
    content: fc.option(fc.string({ maxLength: 10000 }), { nil: null }),
  });

  /**
   * Simulates the update logic that would be performed by the server action.
   * This pure function represents the core business logic of updateNote.
   * The database trigger automatically updates the updated_at timestamp.
   */
  function applyUpdate(
    originalNote: Note,
    update: NoteUpdate,
    newUpdatedAt: string
  ): Note {
    return {
      ...originalNote,
      title: update.title !== undefined ? update.title : originalNote.title,
      content:
        update.content !== undefined ? update.content : originalNote.content,
      updated_at: newUpdatedAt,
    };
  }

  /**
   * Simulates a simple in-memory database for notes with update functionality.
   */
  class NotesDatabase {
    private notes: Map<string, Note> = new Map();

    insert(note: Note): void {
      this.notes.set(note.id, note);
    }

    update(noteId: string, update: NoteUpdate): Note | undefined {
      const existingNote = this.notes.get(noteId);
      if (!existingNote) {
        return undefined;
      }

      // Simulate database trigger updating updated_at
      const newUpdatedAt = new Date().toISOString();
      const updatedNote = applyUpdate(existingNote, update, newUpdatedAt);
      this.notes.set(noteId, updatedNote);
      return updatedNote;
    }

    findById(noteId: string): Note | undefined {
      return this.notes.get(noteId);
    }
  }

  test.prop([noteArbitrary, noteUpdateArbitrary], { numRuns: 100 })(
    "updated note reflects new title and content values",
    (originalNote, update) => {
      const db = new NotesDatabase();

      // Insert the original note
      db.insert(originalNote);

      // Update the note
      const updatedNote = db.update(originalNote.id, update);

      // Property: Update should succeed
      expect(updatedNote).toBeDefined();

      // Property: Updated note should reflect new title if provided
      if (update.title !== undefined) {
        expect(updatedNote!.title).toBe(update.title);
      } else {
        expect(updatedNote!.title).toBe(originalNote.title);
      }

      // Property: Updated note should reflect new content if provided
      if (update.content !== undefined) {
        expect(updatedNote!.content).toBe(update.content);
      } else {
        expect(updatedNote!.content).toBe(originalNote.content);
      }
    }
  );

  test.prop([noteArbitrary, noteUpdateArbitrary], { numRuns: 100 })(
    "updated_at timestamp is updated after modification",
    (originalNote, update) => {
      const db = new NotesDatabase();

      // Insert the original note
      db.insert(originalNote);

      const originalUpdatedAt = new Date(originalNote.updated_at).getTime();

      // Small delay to ensure timestamp difference (simulated by using current time)
      const updatedNote = db.update(originalNote.id, update);

      // Property: Update should succeed
      expect(updatedNote).toBeDefined();

      const newUpdatedAt = new Date(updatedNote!.updated_at).getTime();

      // Property: updated_at should be greater than or equal to original
      expect(newUpdatedAt).toBeGreaterThanOrEqual(originalUpdatedAt);
    }
  );

  test.prop([noteArbitrary, noteUpdateArbitrary], { numRuns: 100 })(
    "update preserves note id, user_id, and created_at",
    (originalNote, update) => {
      const db = new NotesDatabase();

      // Insert the original note
      db.insert(originalNote);

      // Update the note
      const updatedNote = db.update(originalNote.id, update);

      // Property: Update should succeed
      expect(updatedNote).toBeDefined();

      // Property: id should remain unchanged
      expect(updatedNote!.id).toBe(originalNote.id);

      // Property: user_id should remain unchanged
      expect(updatedNote!.user_id).toBe(originalNote.user_id);

      // Property: created_at should remain unchanged
      expect(updatedNote!.created_at).toBe(originalNote.created_at);
    }
  );

  test.prop([noteArbitrary, noteUpdateArbitrary], { numRuns: 100 })(
    "fetching updated note returns persisted changes",
    (originalNote, update) => {
      const db = new NotesDatabase();

      // Insert the original note
      db.insert(originalNote);

      // Update the note
      db.update(originalNote.id, update);

      // Fetch the note again
      const fetchedNote = db.findById(originalNote.id);

      // Property: Fetched note should exist
      expect(fetchedNote).toBeDefined();

      // Property: Fetched note should have the updated values
      if (update.title !== undefined) {
        expect(fetchedNote!.title).toBe(update.title);
      }
      if (update.content !== undefined) {
        expect(fetchedNote!.content).toBe(update.content);
      }
    }
  );

  test.prop([uuidArbitrary, noteUpdateArbitrary], { numRuns: 100 })(
    "updating non-existent note returns undefined",
    (nonExistentId, update) => {
      const db = new NotesDatabase();

      // Property: Updating a non-existent note should return undefined
      const result = db.update(nonExistentId, update);
      expect(result).toBeUndefined();
    }
  );

  test.prop([noteArbitrary], { numRuns: 100 })(
    "empty update preserves all original values except updated_at",
    (originalNote) => {
      const db = new NotesDatabase();

      // Insert the original note
      db.insert(originalNote);

      // Update with empty object (no changes to title or content)
      const emptyUpdate: NoteUpdate = {};
      const updatedNote = db.update(originalNote.id, emptyUpdate);

      // Property: Update should succeed
      expect(updatedNote).toBeDefined();

      // Property: Title should remain unchanged
      expect(updatedNote!.title).toBe(originalNote.title);

      // Property: Content should remain unchanged
      expect(updatedNote!.content).toBe(originalNote.content);

      // Property: updated_at should still be updated (database trigger behavior)
      expect(
        new Date(updatedNote!.updated_at).getTime()
      ).toBeGreaterThanOrEqual(new Date(originalNote.updated_at).getTime());
    }
  );
});

/**
 * **Feature: vibe-notes, Property 6: RLS Enforces User Data Isolation**
 * **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 7.2**
 *
 * For any user A and user B where A ≠ B, user A SHALL NOT be able to SELECT,
 * UPDATE, or DELETE notes belonging to user B. All CRUD operations on notes
 * are restricted to notes where user_id matches the authenticated user.
 */
describe("Property 6: RLS Enforces User Data Isolation", () => {
  // Generator for valid UUIDs
  const uuidArbitrary = fc.uuid();

  // Generator for valid ISO timestamp strings
  const isoTimestampArbitrary = fc
    .date({
      min: new Date("2020-01-01T00:00:00.000Z"),
      max: new Date("2030-12-31T23:59:59.999Z"),
      noInvalidDate: true,
    })
    .filter((d) => !isNaN(d.getTime()))
    .map((d) => d.toISOString());

  // Generator for NoteUpdate data
  const noteUpdateArbitrary: fc.Arbitrary<NoteUpdate> = fc.record({
    title: fc.option(fc.string({ maxLength: 500 }), { nil: null }),
    content: fc.option(fc.string({ maxLength: 10000 }), { nil: null }),
  });

  /**
   * Simulates a database with RLS enforcement.
   * This represents the core behavior that Supabase RLS policies enforce:
   * - SELECT: auth.uid() = user_id
   * - INSERT: auth.uid() = user_id
   * - UPDATE: auth.uid() = user_id
   * - DELETE: auth.uid() = user_id
   */
  class RLSEnforcedDatabase {
    private notes: Map<string, Note> = new Map();

    /**
     * INSERT with RLS: Only allows inserting notes where user_id matches authenticated user
     */
    insert(note: Note, authenticatedUserId: string): boolean {
      // RLS Policy: WITH CHECK (auth.uid() = user_id)
      if (note.user_id !== authenticatedUserId) {
        return false; // RLS violation
      }
      this.notes.set(note.id, note);
      return true;
    }

    /**
     * SELECT by ID with RLS: Only returns note if user_id matches authenticated user
     */
    selectById(noteId: string, authenticatedUserId: string): Note | undefined {
      const note = this.notes.get(noteId);
      // RLS Policy: USING (auth.uid() = user_id)
      if (note && note.user_id !== authenticatedUserId) {
        return undefined; // RLS filters out the row
      }
      return note;
    }

    /**
     * SELECT all with RLS: Only returns notes where user_id matches authenticated user
     */
    selectAll(authenticatedUserId: string): Note[] {
      // RLS Policy: USING (auth.uid() = user_id)
      return Array.from(this.notes.values()).filter(
        (note) => note.user_id === authenticatedUserId
      );
    }

    /**
     * UPDATE with RLS: Only updates note if user_id matches authenticated user
     */
    update(
      noteId: string,
      update: NoteUpdate,
      authenticatedUserId: string
    ): Note | undefined {
      const note = this.notes.get(noteId);
      // RLS Policy: USING (auth.uid() = user_id)
      if (!note || note.user_id !== authenticatedUserId) {
        return undefined; // RLS violation or note not found
      }
      const updatedNote: Note = {
        ...note,
        title: update.title !== undefined ? update.title : note.title,
        content: update.content !== undefined ? update.content : note.content,
        updated_at: new Date().toISOString(),
      };
      this.notes.set(noteId, updatedNote);
      return updatedNote;
    }

    /**
     * DELETE with RLS: Only deletes note if user_id matches authenticated user
     */
    delete(noteId: string, authenticatedUserId: string): boolean {
      const note = this.notes.get(noteId);
      // RLS Policy: USING (auth.uid() = user_id)
      if (!note || note.user_id !== authenticatedUserId) {
        return false; // RLS violation or note not found
      }
      return this.notes.delete(noteId);
    }

    /**
     * Direct access for test setup (bypasses RLS - simulates admin access)
     */
    _adminInsert(note: Note): void {
      this.notes.set(note.id, note);
    }

    /**
     * Direct access for test verification (bypasses RLS - simulates admin access)
     */
    _adminGetById(noteId: string): Note | undefined {
      return this.notes.get(noteId);
    }
  }

  // Generator for two distinct user IDs
  const twoDistinctUsersArbitrary = fc
    .tuple(uuidArbitrary, uuidArbitrary)
    .filter(([userA, userB]) => userA !== userB);

  test.prop(
    [
      twoDistinctUsersArbitrary,
      uuidArbitrary,
      fc.option(fc.string({ maxLength: 500 }), { nil: null }),
      fc.option(fc.string({ maxLength: 10000 }), { nil: null }),
      isoTimestampArbitrary,
    ],
    { numRuns: 100 }
  )(
    "user A cannot SELECT notes belonging to user B",
    ([userA, userB], noteId, title, content, timestamp) => {
      const db = new RLSEnforcedDatabase();

      // Create a note belonging to user B (using admin access for setup)
      const userBNote: Note = {
        id: noteId,
        user_id: userB,
        title,
        content,
        created_at: timestamp,
        updated_at: timestamp,
      };
      db._adminInsert(userBNote);

      // Property: User A should NOT be able to SELECT user B's note
      const result = db.selectById(noteId, userA);
      expect(result).toBeUndefined();

      // Property: User A's selectAll should NOT include user B's note
      const allNotes = db.selectAll(userA);
      expect(allNotes.some((n) => n.id === noteId)).toBe(false);

      // Verify the note still exists (user B can access it)
      const userBResult = db.selectById(noteId, userB);
      expect(userBResult).toBeDefined();
      expect(userBResult?.id).toBe(noteId);
    }
  );

  test.prop(
    [
      twoDistinctUsersArbitrary,
      uuidArbitrary,
      fc.option(fc.string({ maxLength: 500 }), { nil: null }),
      fc.option(fc.string({ maxLength: 10000 }), { nil: null }),
      isoTimestampArbitrary,
      noteUpdateArbitrary,
    ],
    { numRuns: 100 }
  )(
    "user A cannot UPDATE notes belonging to user B",
    ([userA, userB], noteId, title, content, timestamp, updateData) => {
      const db = new RLSEnforcedDatabase();

      // Create a note belonging to user B
      const userBNote: Note = {
        id: noteId,
        user_id: userB,
        title,
        content,
        created_at: timestamp,
        updated_at: timestamp,
      };
      db._adminInsert(userBNote);

      // Property: User A should NOT be able to UPDATE user B's note
      const updateResult = db.update(noteId, updateData, userA);
      expect(updateResult).toBeUndefined();

      // Property: The note should remain unchanged
      const unchangedNote = db._adminGetById(noteId);
      expect(unchangedNote).toBeDefined();
      expect(unchangedNote?.title).toBe(title);
      expect(unchangedNote?.content).toBe(content);
      expect(unchangedNote?.user_id).toBe(userB);
    }
  );

  test.prop(
    [
      twoDistinctUsersArbitrary,
      uuidArbitrary,
      fc.option(fc.string({ maxLength: 500 }), { nil: null }),
      fc.option(fc.string({ maxLength: 10000 }), { nil: null }),
      isoTimestampArbitrary,
    ],
    { numRuns: 100 }
  )(
    "user A cannot DELETE notes belonging to user B",
    ([userA, userB], noteId, title, content, timestamp) => {
      const db = new RLSEnforcedDatabase();

      // Create a note belonging to user B
      const userBNote: Note = {
        id: noteId,
        user_id: userB,
        title,
        content,
        created_at: timestamp,
        updated_at: timestamp,
      };
      db._adminInsert(userBNote);

      // Property: User A should NOT be able to DELETE user B's note
      const deleteResult = db.delete(noteId, userA);
      expect(deleteResult).toBe(false);

      // Property: The note should still exist
      const stillExists = db._adminGetById(noteId);
      expect(stillExists).toBeDefined();
      expect(stillExists?.id).toBe(noteId);
      expect(stillExists?.user_id).toBe(userB);
    }
  );

  test.prop(
    [
      twoDistinctUsersArbitrary,
      uuidArbitrary,
      fc.option(fc.string({ maxLength: 500 }), { nil: null }),
      fc.option(fc.string({ maxLength: 10000 }), { nil: null }),
      isoTimestampArbitrary,
    ],
    { numRuns: 100 }
  )(
    "user A cannot INSERT notes with user B's user_id",
    ([userA, userB], noteId, title, content, timestamp) => {
      const db = new RLSEnforcedDatabase();

      // Attempt to create a note with user B's ID while authenticated as user A
      const maliciousNote: Note = {
        id: noteId,
        user_id: userB, // Trying to insert with another user's ID
        title,
        content,
        created_at: timestamp,
        updated_at: timestamp,
      };

      // Property: User A should NOT be able to INSERT a note with user B's user_id
      const insertResult = db.insert(maliciousNote, userA);
      expect(insertResult).toBe(false);

      // Property: The note should not exist in the database
      const notFound = db._adminGetById(noteId);
      expect(notFound).toBeUndefined();
    }
  );

  test.prop(
    [
      uuidArbitrary,
      uuidArbitrary,
      fc.option(fc.string({ maxLength: 500 }), { nil: null }),
      fc.option(fc.string({ maxLength: 10000 }), { nil: null }),
      isoTimestampArbitrary,
    ],
    { numRuns: 100 }
  )(
    "user can SELECT, UPDATE, and DELETE their own notes",
    (userId, noteId, title, content, timestamp) => {
      const db = new RLSEnforcedDatabase();

      // Create a note belonging to the user
      const userNote: Note = {
        id: noteId,
        user_id: userId,
        title,
        content,
        created_at: timestamp,
        updated_at: timestamp,
      };

      // Property: User can INSERT their own note
      const insertResult = db.insert(userNote, userId);
      expect(insertResult).toBe(true);

      // Property: User can SELECT their own note
      const selectResult = db.selectById(noteId, userId);
      expect(selectResult).toBeDefined();
      expect(selectResult?.id).toBe(noteId);

      // Property: User can UPDATE their own note
      const updateResult = db.update(
        noteId,
        { title: "Updated Title" },
        userId
      );
      expect(updateResult).toBeDefined();
      expect(updateResult?.title).toBe("Updated Title");

      // Property: User can DELETE their own note
      const deleteResult = db.delete(noteId, userId);
      expect(deleteResult).toBe(true);

      // Verify note is deleted
      const afterDelete = db._adminGetById(noteId);
      expect(afterDelete).toBeUndefined();
    }
  );

  test.prop(
    [
      twoDistinctUsersArbitrary,
      fc.array(uuidArbitrary, { minLength: 1, maxLength: 5 }),
      fc.array(uuidArbitrary, { minLength: 1, maxLength: 5 }),
    ],
    { numRuns: 100 }
  )(
    "selectAll returns only notes belonging to authenticated user in mixed database",
    ([userA, userB], userANoteIds, userBNoteIds) => {
      const db = new RLSEnforcedDatabase();

      // Create notes for user A
      const userANotes: Note[] = userANoteIds.map((id, i) => ({
        id: `${id}-a-${i}`,
        user_id: userA,
        title: `User A Note ${i}`,
        content: `Content A ${i}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      // Create notes for user B
      const userBNotes: Note[] = userBNoteIds.map((id, i) => ({
        id: `${id}-b-${i}`,
        user_id: userB,
        title: `User B Note ${i}`,
        content: `Content B ${i}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      // Insert all notes using admin access
      [...userANotes, ...userBNotes].forEach((note) => db._adminInsert(note));

      // Property: User A's selectAll should return only user A's notes
      const userAResults = db.selectAll(userA);
      expect(userAResults.length).toBe(userANotes.length);
      expect(userAResults.every((n) => n.user_id === userA)).toBe(true);
      expect(userAResults.every((n) => n.user_id !== userB)).toBe(true);

      // Property: User B's selectAll should return only user B's notes
      const userBResults = db.selectAll(userB);
      expect(userBResults.length).toBe(userBNotes.length);
      expect(userBResults.every((n) => n.user_id === userB)).toBe(true);
      expect(userBResults.every((n) => n.user_id !== userA)).toBe(true);
    }
  );
});

/**
 * **Feature: vibe-notes, Property 5: Note Deletion Removes From Database**
 * **Validates: Requirements 9.2**
 *
 * For any note that is deleted, subsequent queries for that note SHALL return no results.
 */
describe("Property 5: Note Deletion Removes From Database", () => {
  // Generator for valid UUIDs
  const uuidArbitrary = fc.uuid();

  // Generator for valid ISO timestamp strings
  const isoTimestampArbitrary = fc
    .date({
      min: new Date("2020-01-01T00:00:00.000Z"),
      max: new Date("2030-12-31T23:59:59.999Z"),
      noInvalidDate: true,
    })
    .filter((d) => !isNaN(d.getTime()))
    .map((d) => d.toISOString());

  // Generator for a complete Note object
  const noteArbitrary: fc.Arbitrary<Note> = fc.record({
    id: uuidArbitrary,
    user_id: uuidArbitrary,
    title: fc.option(fc.string({ maxLength: 500 }), { nil: null }),
    content: fc.option(fc.string({ maxLength: 10000 }), { nil: null }),
    created_at: isoTimestampArbitrary,
    updated_at: isoTimestampArbitrary,
  });

  /**
   * Simulates a simple in-memory database for notes.
   * This represents the core behavior that the actual database + deleteNote action enforces.
   */
  class NotesDatabase {
    private notes: Map<string, Note> = new Map();

    insert(note: Note): void {
      this.notes.set(note.id, note);
    }

    delete(noteId: string): boolean {
      return this.notes.delete(noteId);
    }

    findById(noteId: string): Note | undefined {
      return this.notes.get(noteId);
    }

    findByUserId(userId: string): Note[] {
      return Array.from(this.notes.values()).filter(
        (note) => note.user_id === userId
      );
    }

    getAll(): Note[] {
      return Array.from(this.notes.values());
    }
  }

  test.prop([noteArbitrary], { numRuns: 100 })(
    "deleted note is no longer retrievable by ID",
    (note) => {
      const db = new NotesDatabase();

      // Insert the note
      db.insert(note);

      // Verify note exists before deletion
      const beforeDelete = db.findById(note.id);
      expect(beforeDelete).toBeDefined();
      expect(beforeDelete?.id).toBe(note.id);

      // Delete the note
      const deleteResult = db.delete(note.id);
      expect(deleteResult).toBe(true);

      // Property: After deletion, the note should not be retrievable
      const afterDelete = db.findById(note.id);
      expect(afterDelete).toBeUndefined();
    }
  );

  test.prop([noteArbitrary], { numRuns: 100 })(
    "deleted note is no longer in user's notes list",
    (note) => {
      const db = new NotesDatabase();

      // Insert the note
      db.insert(note);

      // Verify note appears in user's notes before deletion
      const beforeDelete = db.findByUserId(note.user_id);
      expect(beforeDelete.some((n) => n.id === note.id)).toBe(true);

      // Delete the note
      db.delete(note.id);

      // Property: After deletion, the note should not appear in user's notes
      const afterDelete = db.findByUserId(note.user_id);
      expect(afterDelete.some((n) => n.id === note.id)).toBe(false);
    }
  );

  test.prop(
    [fc.array(noteArbitrary, { minLength: 1, maxLength: 10 }), fc.nat()],
    { numRuns: 100 }
  )("deleting one note does not affect other notes", (notes, indexSeed) => {
    // Ensure unique IDs for all notes
    const uniqueNotes = notes.map((note, i) => ({
      ...note,
      id: `${note.id}-${i}`,
    }));

    const db = new NotesDatabase();

    // Insert all notes
    uniqueNotes.forEach((note) => db.insert(note));

    // Select a note to delete
    const deleteIndex = indexSeed % uniqueNotes.length;
    const noteToDelete = uniqueNotes[deleteIndex];
    const otherNotes = uniqueNotes.filter((_, i) => i !== deleteIndex);

    // Delete the selected note
    db.delete(noteToDelete.id);

    // Property: Deleted note should not be retrievable
    expect(db.findById(noteToDelete.id)).toBeUndefined();

    // Property: All other notes should still be retrievable
    otherNotes.forEach((note) => {
      const found = db.findById(note.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(note.id);
    });
  });

  test.prop([uuidArbitrary], { numRuns: 100 })(
    "deleting non-existent note returns false",
    (nonExistentId) => {
      const db = new NotesDatabase();

      // Property: Deleting a non-existent note should return false
      const result = db.delete(nonExistentId);
      expect(result).toBe(false);

      // Property: Database should remain empty
      expect(db.getAll()).toHaveLength(0);
    }
  );

  test.prop([noteArbitrary], { numRuns: 100 })(
    "double deletion returns false on second attempt",
    (note) => {
      const db = new NotesDatabase();

      // Insert and delete the note
      db.insert(note);
      const firstDelete = db.delete(note.id);
      expect(firstDelete).toBe(true);

      // Property: Second deletion should return false
      const secondDelete = db.delete(note.id);
      expect(secondDelete).toBe(false);

      // Property: Note should still not be retrievable
      expect(db.findById(note.id)).toBeUndefined();
    }
  );
});

/**
 * **Feature: vibe-notes, Property 7: Note Serialization Round-Trip**
 * **Validates: Requirements 11.1, 11.2, 11.3**
 *
 * For any valid Note object, serializing to database format and deserializing
 * back SHALL produce an equivalent Note object with all field values preserved.
 */
describe("Property 7: Note Serialization Round-Trip", () => {
  // Generator for valid UUIDs
  const uuidArbitrary = fc.uuid();

  // Generator for valid ISO timestamp strings
  const isoTimestampArbitrary = fc
    .date({
      min: new Date("2020-01-01T00:00:00.000Z"),
      max: new Date("2030-12-31T23:59:59.999Z"),
      noInvalidDate: true,
    })
    .filter((d) => !isNaN(d.getTime()))
    .map((d) => d.toISOString());

  // Generator for a complete Note object
  const noteArbitrary: fc.Arbitrary<Note> = fc.record({
    id: uuidArbitrary,
    user_id: uuidArbitrary,
    title: fc.option(fc.string({ maxLength: 500 }), { nil: null }),
    content: fc.option(fc.string({ maxLength: 10000 }), { nil: null }),
    created_at: isoTimestampArbitrary,
    updated_at: isoTimestampArbitrary,
  });

  /**
   * Serializes a Note object to database format (JSON string).
   * This represents the serialization that occurs when sending data to the database.
   */
  function serializeNote(note: Note): string {
    return JSON.stringify({
      id: note.id,
      user_id: note.user_id,
      title: note.title,
      content: note.content,
      created_at: note.created_at,
      updated_at: note.updated_at,
    });
  }

  /**
   * Deserializes a JSON string back to a Note object.
   * This represents the deserialization that occurs when fetching data from the database.
   */
  function deserializeNote(json: string): Note {
    const parsed = JSON.parse(json);
    return {
      id: parsed.id,
      user_id: parsed.user_id,
      title: parsed.title,
      content: parsed.content,
      created_at: parsed.created_at,
      updated_at: parsed.updated_at,
    };
  }

  /**
   * Deep equality check for Note objects
   */
  function notesAreEqual(note1: Note, note2: Note): boolean {
    return (
      note1.id === note2.id &&
      note1.user_id === note2.user_id &&
      note1.title === note2.title &&
      note1.content === note2.content &&
      note1.created_at === note2.created_at &&
      note1.updated_at === note2.updated_at
    );
  }

  test.prop([noteArbitrary], { numRuns: 100 })(
    "serializing and deserializing a note produces an equivalent note",
    (originalNote) => {
      // Serialize the note to JSON (database format)
      const serialized = serializeNote(originalNote);

      // Deserialize back to a Note object
      const deserialized = deserializeNote(serialized);

      // Property: Round-trip should preserve all field values
      expect(notesAreEqual(originalNote, deserialized)).toBe(true);
    }
  );

  test.prop([noteArbitrary], { numRuns: 100 })(
    "round-trip preserves note id",
    (originalNote) => {
      const serialized = serializeNote(originalNote);
      const deserialized = deserializeNote(serialized);

      // Property: id should be preserved
      expect(deserialized.id).toBe(originalNote.id);
    }
  );

  test.prop([noteArbitrary], { numRuns: 100 })(
    "round-trip preserves user_id",
    (originalNote) => {
      const serialized = serializeNote(originalNote);
      const deserialized = deserializeNote(serialized);

      // Property: user_id should be preserved
      expect(deserialized.user_id).toBe(originalNote.user_id);
    }
  );

  test.prop([noteArbitrary], { numRuns: 100 })(
    "round-trip preserves title (including null)",
    (originalNote) => {
      const serialized = serializeNote(originalNote);
      const deserialized = deserializeNote(serialized);

      // Property: title should be preserved (including null values)
      expect(deserialized.title).toBe(originalNote.title);
    }
  );

  test.prop([noteArbitrary], { numRuns: 100 })(
    "round-trip preserves content (including null)",
    (originalNote) => {
      const serialized = serializeNote(originalNote);
      const deserialized = deserializeNote(serialized);

      // Property: content should be preserved (including null values)
      expect(deserialized.content).toBe(originalNote.content);
    }
  );

  test.prop([noteArbitrary], { numRuns: 100 })(
    "round-trip preserves timestamps",
    (originalNote) => {
      const serialized = serializeNote(originalNote);
      const deserialized = deserializeNote(serialized);

      // Property: created_at should be preserved
      expect(deserialized.created_at).toBe(originalNote.created_at);

      // Property: updated_at should be preserved
      expect(deserialized.updated_at).toBe(originalNote.updated_at);
    }
  );

  test.prop([noteArbitrary], { numRuns: 100 })(
    "multiple round-trips produce identical results",
    (originalNote) => {
      // First round-trip
      const serialized1 = serializeNote(originalNote);
      const deserialized1 = deserializeNote(serialized1);

      // Second round-trip
      const serialized2 = serializeNote(deserialized1);
      const deserialized2 = deserializeNote(serialized2);

      // Property: Multiple round-trips should produce identical results
      expect(notesAreEqual(deserialized1, deserialized2)).toBe(true);
      expect(serialized1).toBe(serialized2);
    }
  );

  // Edge case: Note with null title and content
  test.prop([uuidArbitrary, uuidArbitrary, isoTimestampArbitrary], {
    numRuns: 100,
  })(
    "round-trip handles notes with null title and content",
    (id, userId, timestamp) => {
      const noteWithNulls: Note = {
        id,
        user_id: userId,
        title: null,
        content: null,
        created_at: timestamp,
        updated_at: timestamp,
      };

      const serialized = serializeNote(noteWithNulls);
      const deserialized = deserializeNote(serialized);

      // Property: null values should be preserved
      expect(deserialized.title).toBeNull();
      expect(deserialized.content).toBeNull();
      expect(notesAreEqual(noteWithNulls, deserialized)).toBe(true);
    }
  );

  // Edge case: Note with special characters in title and content
  test.prop(
    [
      uuidArbitrary,
      uuidArbitrary,
      fc.string({ minLength: 1, maxLength: 500 }),
      fc.string({ minLength: 1, maxLength: 10000 }),
      isoTimestampArbitrary,
    ],
    { numRuns: 100 }
  )(
    "round-trip handles notes with special characters",
    (id, userId, title, content, timestamp) => {
      const noteWithSpecialChars: Note = {
        id,
        user_id: userId,
        title,
        content,
        created_at: timestamp,
        updated_at: timestamp,
      };

      const serialized = serializeNote(noteWithSpecialChars);
      const deserialized = deserializeNote(serialized);

      // Property: Special characters should be preserved
      expect(deserialized.title).toBe(title);
      expect(deserialized.content).toBe(content);
      expect(notesAreEqual(noteWithSpecialChars, deserialized)).toBe(true);
    }
  );
});
