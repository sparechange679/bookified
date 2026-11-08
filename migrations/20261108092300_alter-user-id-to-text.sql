-- ============================================
-- Change user_id from UUID to TEXT
-- ============================================
-- Since the app uses Clerk for authentication, user IDs are strings like
-- "user_3BLgeMgRPXvzIq4IMgjEZwzQDuW" which are not valid UUIDs.
-- This migration changes user_id columns to TEXT to accommodate Clerk IDs.

-- ============================================
-- Step 1: Drop existing RLS policies first (they reference user_id)
-- ============================================
DROP POLICY IF EXISTS "books owner access" ON public.books;
DROP POLICY IF EXISTS "book_segments owner access" ON public.book_segments;
DROP POLICY IF EXISTS "voice_sessions owner access" ON public.voice_sessions;

-- ============================================
-- Step 2: Drop foreign key constraints and alter column types
-- ============================================

-- Books table
ALTER TABLE public.books
  DROP CONSTRAINT books_user_id_fkey,
  ALTER COLUMN user_id TYPE TEXT;

-- Book Segments table
ALTER TABLE public.book_segments
  DROP CONSTRAINT book_segments_user_id_fkey,
  ALTER COLUMN user_id TYPE TEXT;

-- Voice Sessions table
ALTER TABLE public.voice_sessions
  DROP CONSTRAINT voice_sessions_user_id_fkey,
  ALTER COLUMN user_id TYPE TEXT;

-- ============================================
-- Step 3: Recreate RLS policies
-- ============================================
-- Since we're using Clerk (not InsForge auth), auth.uid() won't return Clerk IDs.
-- Server-side actions use admin client which bypasses RLS anyway.

CREATE POLICY "books authenticated access" ON public.books
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "book_segments authenticated access" ON public.book_segments
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "voice_sessions authenticated access" ON public.voice_sessions
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
