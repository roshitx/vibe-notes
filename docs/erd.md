erDiagram
    auth_users ||--o{ notes : "owns"
    
    auth_users {
        uuid id PK "Supabase Auth managed"
        text email "User email"
        timestamptz created_at "Account creation"
    }
    
    notes {
        uuid id PK "gen_random_uuid()"
        uuid user_id FK "References auth.users.id"
        text title "Note title (default '')"
        text content "Note content (default '')"
        timestamptz created_at "Auto-set on insert"
        timestamptz updated_at "Auto-updated via trigger"
    }
