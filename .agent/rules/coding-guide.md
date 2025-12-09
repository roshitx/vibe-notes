---
trigger: always_on
---

# Coding Guidelines & Standards

This document serves as the **SINGLE SOURCE OF TRUTH** for coding standards, workflows, and best practices.

## 1. Core Philosophy & Methodology

### 🛡️ TDD (Test Driven Development)
**You MUST strictly follow the "Red-Green-Refactor" cycle for all logic implementations:**
1.  **Red**: Write a failing test case using `Vitest` (and `fast-check` for logic) *before* writing any implementation code.
2.  **Green**: Write the *minimum* amount of code necessary to pass the test.
3.  **Refactor**: Optimize the code for readability and performance without changing behavior.
- **Rule**: No production code is written without a corresponding test case.

### 🧱 SOLID & DRY Principles
- **S (Single Responsibility)**: Functions and Components should do one thing well. Separation of concerns (UI vs. Logic vs. Data).
- **O (Open/Closed)**: Code should be open for extension but closed for modification. Use TypeScript interfaces effectively.
- **L (Liskov Substitution)**: Derived types must be completely substitutable for their base types.
- **I (Interface Segregation)**: Prefer small, specific interfaces over fat, monolithic ones.
- **D (Dependency Inversion)**: Depend on abstractions/hooks, not concrete implementations.
- **DRY (Don't Repeat Yourself)**: Never duplicate logic. Extract shared logic into [src/lib/utils.ts](cci:7://file:///Volumes/WORKSPACES/02-AREAS/mini-projects/nextjs-notes/vibe-notes/src/lib/utils.ts:0:0-0:0) or custom hooks.

## 2. Agent Workflow & MCP Usage

**You are REQUIRED to use available MCP tools to ensure accuracy and best practices:**

- **🧠 Complex Problem Solving**:
  - Use `sequential-thinking` **IMMEDIATELY** when facing multi-step logic, architectural decisions, or debugging complex issues. Do not guess; plan first.

- **🎨 UI & Components**:
  - Use `shadcn` MCP (or `context7` with `shadcn` topic) to fetch documentation and examples before implementing new UI components. Ensure strict adherence to existing Design System token.

- **🗄️ Database & Backend**:
  - Use `supabase-mcp-server` to inspect the **actual** database schema, verify table structures, and run non-destructive test queries. **NEVER assume table structure.**
  - Use `supabase-mcp-server` to check RLS policies when implementing data access.

- **📚 Best Practices Lookup**:
  - Use `context7` (resolve-library-id -> get-library-docs) to lookup idiomatic usage of libraries (e.g., Next.js 16 features, React 19 hooks, generic TypeScript patterns).

## 3. Tech Stack Standards

- **Next.js (App Router)**:
  - Distinguish clearly between Server Components (default) and Client Components (`"use client"`).
  - Use **Server Actions** (`src/lib/actions/*`) for all data mutations.
  - Use `useTransition` for optimistic UI updates.
- **TypeScript**:
  - **Strict Typing**: No `any`. Use `unknown` if necessary and narrow types.
  - Define types in [src/lib/types.ts](cci:7://file:///Volumes/WORKSPACES/02-AREAS/mini-projects/nextjs-notes/vibe-notes/src/lib/types.ts:0:0-0:0) or collocated with components if highly specific.
- **Styling**:
  - **Tailwind CSS v4**: Use utility classes. Avoid inline styles.
  - Use `clsx` and `tailwind-merge` (via `cn()` utility) for conditional class names.
- **State Management**:
  - Prefer Server State (fetched via Server Components/Actions).
  - Use URL search params for bookmarkable state (sorting, filtering).
  - Use `useState`/`useReducer` only for ephemeral UI state.

## 4. Code Structure

- **File Naming**: `kebab-case` for files and folders (e.g., `user-profile.tsx`).
- **Exports**: Use named exports (`export function Component()`) instead of default exports, except for [page.tsx](cci:7://file:///Volumes/WORKSPACES/02-AREAS/mini-projects/nextjs-notes/vibe-notes/src/app/page.tsx:0:0-0:0) and [layout.tsx](cci:7://file:///Volumes/WORKSPACES/02-AREAS/mini-projects/nextjs-notes/vibe-notes/src/app/layout.tsx:0:0-0:0) (Next.js requirement).
- **Barrel Files**: Avoid circular dependencies. Be careful with index files.

---
**Summary Checklist before confirming task completion:**
1. [ ] Did I write a test first?
2. [ ] Did I verify the DB schema via MCP?
3. [ ] Is the code DRY and SOLID?
4. [ ] Did I use `context7` to verify this is the modern best practice?