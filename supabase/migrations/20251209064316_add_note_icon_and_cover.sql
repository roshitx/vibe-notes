-- Add icon and cover_url columns to notes table
ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cover_url TEXT DEFAULT NULL;;
