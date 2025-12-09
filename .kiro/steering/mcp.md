# MCP Protocols: Vibe Notes (Next.js 15 + Supabase)

## 1. Cognitive & Logic
*   **Zen (`planner`, `thinkdeep`):** **START HERE.** Use to breakdown high-level tasks, plan architecture, and resolve ambiguity.
*   **Sequential Thinking:** **REQUIRED** for tracing complex logic, debugging errors step-by-step, and mapping refactors.

## 2. Knowledge
*   **Context7:** **PRIMARY TRUTH.** MANDATORY for Next.js 15 (App Router/Server Actions), Supabase SSR, and RLS syntax. *Ignore training data if it conflicts.*
*   **Fetch:** Backup for Context7. Use for specific error research or npm version checks.

## 3. Implementation
*   **Filesystem:**
    *   Always `list_directory` before creating files to avoid duplication.
    *   **READ** file content before editing to preserve logic.
*   **Shadcn MCP:** Use for ALL UI component additions. Do not manually create `components/ui`.
*   **Supabase (Pending):** Write SQL schemas/policies into `.sql` files in `supabase/migrations`. Instruct user to execute.

## 4. Execution Loop
**Plan** (Zen) -> **Verify Syntax** (Context7) -> **Install UI** (Shadcn) -> **Write Code** (Filesystem).