---
trigger: model_decision
description: When confuse about the codebase and losing the memory context of the base codebases
---

# Project Overview: Vibe Notes

## 🧠 Core Identity
- **Stack**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Supabase (Auth + PostgreSQL).
- **UI Architecture**: Shadcn UI (Radix Primitives) + Lucide Icons.
- **Testing**: Vitest + Fast-Check (property-based testing).
- **Package Manager**: Bun (terdeteksi dari [bun.lock](cci:7://file:///Volumes/WORKSPACES/02-AREAS/mini-projects/nextjs-notes/vibe-notes/bun.lock:0:0-0:0)).

## 🗄️ Data Model & Database
- **Provider**: Supabase (PostgreSQL).
- **Table**: [notes](cci:7://file:///Volumes/WORKSPACES/02-AREAS/mini-projects/nextjs-notes/vibe-notes:0:0-0:0)
  - [id](cci:1://file:///Volumes/WORKSPACES/02-AREAS/mini-projects/nextjs-notes/vibe-notes/src/components/auth/login-form.tsx:27:2-42:4) (UUID): Primary Key.
  - `user_id` (UUID): Foreign Key ke `auth.users` (Cascade Delete).
  - `title` (Text): Judul catatan (default kosong).
  - `content` (Text): Isi catatan (default kosong).
  - `created_at` (Timestamp): Waktu pembuatan.
  - `updated_at` (Timestamp): Waktu pembaruan terakhir.
- **Security (RLS)**: Row Level Security diterapkan secara ketat.
  - Policy: `auth.uid() = user_id`. User hanya bisa SELECT, INSERT, UPDATE, DELETE catatan mereka sendiri.

## 🏗️ Application Structure
### Routes
- **Root** ([src/app/page.tsx](cci:7://file:///Volumes/WORKSPACES/02-AREAS/mini-projects/nextjs-notes/vibe-notes/src/app/page.tsx:0:0-0:0)):
  - Entry point server-side.
  - Logic: Redirect user yang login ke `/dashboard`, user tamu ke `/login`.
- **Auth** (`src/app/(auth)/`):
  - `/login`: Komponen `LoginForm`.
  - `/signup`: Komponen `SignupForm`.
  - Menggunakan Server Actions (`src/lib/actions/auth.ts`) untuk flow autentikasi.
- **Protected** (`src/app/(protected)/`):
  - **Dashboard** (`/dashboard`):
    - Menampilkan daftar catatan user.
    - Fetch data via client-side `useEffect` yang memanggil Server Action `getNotes()`.
  - **Note Editor** (`/notes/[id]`):
    - View/Edit catatan spesifik.
    - Logic: Fetch note via `getNote(id)`. Handle updates.

### Key Directories
- `src/lib/actions/`: Server Actions (layer backend API).
  - `notes.ts`: Operasi CRUD (create, read, update, delete). Eksplisit memverifikasi auth.
  - `auth.ts`: Logic autentikasi via Supabase.
- `src/lib/supabase/`: Konfigurasi client Supabase (server vs client).
- `src/components/`:
  - `ui/`: Komponen primitif Shadcn UI.
  - `notes/`: Komponen domain-specific (`NoteCard`, `NoteEditor`, `NoteList`).

## 🔄 Key Patterns & Logic
- **Data Fetching**:
  - Menggunakan **Server Actions** yang dipanggil dari Client Components (`use client`).
  - `useEffect` digunakan untuk loading data awal di halaman client.
- **State Management**:
  - Local state (`useState`) untuk UI.
  - Transitions (`useTransition`) untuk aksi mutasi (create/update/delete) agar UI tetap responsif.
- **Validation**:
  - Logic validasi skema menangani pengecekan input sebelum operasi DB.
- **Testing Strategy**:
  - **Property-based testing** (`fast-check`) digunakan di `notes.test.ts` untuk memastikan ketahanan logika bisnis (misalnya memastikan timestamp update selalu valid).

## ⚡ Development Commands
- `bun run dev`: Menjalankan server development Next.js.
- `bun run build`: Build aplikasi untuk production.
- `bun run start`: Menjalankan server production.
- `bun run lint`: Menjalankan ESLint.
- `bun run test`: Menjalankan test suite dengan Vitest.