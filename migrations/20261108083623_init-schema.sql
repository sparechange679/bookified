
-- ============================================
-- Books table
-- ============================================
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  author TEXT NOT NULL,
  persona TEXT,
  file_url TEXT NOT NULL,
  file_key TEXT NOT NULL,
  cover_url TEXT,
  cover_key TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  total_segments INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_books_slug ON public.books(slug);
CREATE INDEX idx_books_user_id ON public.books(user_id);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "books owner access" ON public.books
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.books TO authenticated;

CREATE OR REPLACE FUNCTION public.prevent_book_owner_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'user_id cannot be changed';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_book_owner_change
  BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.prevent_book_owner_change();

CREATE TRIGGER books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();

-- ============================================
-- Book Segments table
-- ============================================
CREATE TABLE public.book_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  segment_index INTEGER NOT NULL,
  page_number INTEGER,
  word_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_book_segments_book_index ON public.book_segments(book_id, segment_index);
CREATE INDEX idx_book_segments_book_page ON public.book_segments(book_id, page_number);
CREATE INDEX idx_book_segments_user_id ON public.book_segments(user_id);

ALTER TABLE public.book_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "book_segments owner access" ON public.book_segments
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.book_segments TO authenticated;

CREATE OR REPLACE FUNCTION public.prevent_book_segment_owner_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'user_id cannot be changed';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_book_segment_owner_change
  BEFORE UPDATE ON public.book_segments
  FOR EACH ROW EXECUTE FUNCTION public.prevent_book_segment_owner_change();

CREATE TRIGGER book_segments_updated_at
  BEFORE UPDATE ON public.book_segments
  FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();

-- ============================================
-- Voice Sessions table
-- ============================================
CREATE TABLE public.voice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  billing_period_start TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_voice_sessions_user_id ON public.voice_sessions(user_id);
CREATE INDEX idx_voice_sessions_user_billing ON public.voice_sessions(user_id, billing_period_start);

ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "voice_sessions owner access" ON public.voice_sessions
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.voice_sessions TO authenticated;

CREATE OR REPLACE FUNCTION public.prevent_voice_session_owner_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'user_id cannot be changed';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_voice_session_owner_change
  BEFORE UPDATE ON public.voice_sessions
  FOR EACH ROW EXECUTE FUNCTION public.prevent_voice_session_owner_change();

CREATE TRIGGER voice_sessions_updated_at
  BEFORE UPDATE ON public.voice_sessions
  FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();
