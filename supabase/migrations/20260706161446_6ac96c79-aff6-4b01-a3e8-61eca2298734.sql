
ALTER TABLE public.monitored_users ADD COLUMN IF NOT EXISTS blocked boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('unlock','location_change')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  reason text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','aprovada','negada')),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by text
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.access_requests TO anon, authenticated;
GRANT ALL ON public.access_requests TO service_role;

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read access_requests" ON public.access_requests FOR SELECT USING (true);
CREATE POLICY "public write access_requests" ON public.access_requests FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.access_requests REPLICA IDENTITY FULL;
ALTER TABLE public.monitored_users REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname='public' AND tablename='access_requests'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.access_requests';
  END IF;
END $$;
