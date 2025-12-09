# Project Structure

```
src/
├── app/
│   ├── (auth)/              # Public auth routes
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (protected)/         # Authenticated routes
│   │   ├── dashboard/page.tsx
│   │   └── notes/[id]/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                  # shadcn components (auto-generated)
│   ├── auth/                # Auth-related components
│   │   ├── login-form.tsx
│   │   ├── signup-form.tsx
│   │   └── logout-button.tsx
│   └── notes/               # Note-related components
│       ├── note-card.tsx
│       ├── note-editor.tsx
│       ├── note-list.tsx
│       └── delete-dialog.tsx
├── lib/
│   ├── supabase/            # Supabase client setup
│   │   ├── client.ts        # Browser client
│   │   ├── server.ts        # Server client
│   │   └── middleware.ts    # Auth middleware helper
│   ├── actions/             # Server Actions
│   │   ├── auth.ts          # signUp, signIn, signOut
│   │   └── notes.ts         # CRUD operations
│   ├── types.ts             # Shared TypeScript interfaces
│   └── validations.ts       # Input validation
└── middleware.ts            # Next.js route protection
```

## Conventions

- **Route Groups**: Use `(auth)` and `(protected)` for logical grouping
- **Server Actions**: All DB mutations in `lib/actions/`
- **Types**: Shared interfaces in `lib/types.ts`
- **Components**: Keep small and focused; separate business logic from UI
- **Error Handling**: Server Actions return `{ success: boolean, data?, error? }`
