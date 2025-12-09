# Tech Stack

## Package Manager

- **bun** - Use `bun` for all package operations, DONT USE NPM or NPX

## Framework & Language

- **Next.js 15** with App Router
- **TypeScript** in strict mode
- **React Server Components (RSC)** for data fetching
- **Server Actions** for all mutations (avoid API routes)

## Styling & UI

- **Tailwind CSS**
- **shadcn/ui** - Add components via `bunx shadcn@latest add [component]`
- **Lucide React** for icons

## Backend & Database

- **Supabase** (PostgreSQL)
- **Supabase Auth** with SSR (`@supabase/ssr`)
- **Row Level Security (RLS)** for data isolation

## Deployment

- **Vercel**

## Common Commands

```bash
# Install dependencies
bun install

# Run development server
bun dev

# Build for production
bun run build

# Add shadcn component
bunx shadcn@latest add [component-name]

# Run tests
bun test
```

## Key Packages

- `@supabase/supabase-js`
- `@supabase/ssr`
- `lucide-react`
- `shadcn` (devDependency)
