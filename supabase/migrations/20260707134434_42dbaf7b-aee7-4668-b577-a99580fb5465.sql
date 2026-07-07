
-- Drop all permissive public policies
DROP POLICY IF EXISTS "public read access_requests" ON public.access_requests;
DROP POLICY IF EXISTS "public write access_requests" ON public.access_requests;
DROP POLICY IF EXISTS "public read integrations" ON public.integrations;
DROP POLICY IF EXISTS "public write integrations" ON public.integrations;
DROP POLICY IF EXISTS "public read users" ON public.monitored_users;
DROP POLICY IF EXISTS "public write users" ON public.monitored_users;
DROP POLICY IF EXISTS "public read rules" ON public.rules;
DROP POLICY IF EXISTS "public write rules" ON public.rules;
DROP POLICY IF EXISTS "public read alerts" ON public.security_alerts;
DROP POLICY IF EXISTS "public write alerts" ON public.security_alerts;
DROP POLICY IF EXISTS "public read events" ON public.security_events;
DROP POLICY IF EXISTS "public write events" ON public.security_events;

-- Revoke anon
REVOKE ALL ON public.access_requests, public.integrations, public.monitored_users,
                public.rules, public.security_alerts, public.security_events FROM anon;

-- Grant to authenticated only
GRANT SELECT, INSERT, UPDATE, DELETE ON public.access_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integrations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.monitored_users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rules TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.security_alerts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.security_events TO authenticated;

GRANT ALL ON public.access_requests, public.integrations, public.monitored_users,
              public.rules, public.security_alerts, public.security_events TO service_role;

-- Authenticated-only policies (demo tables shared between authenticated sessions)
CREATE POLICY "auth read access_requests" ON public.access_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth write access_requests" ON public.access_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth read integrations" ON public.integrations FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth write integrations" ON public.integrations FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth read monitored_users" ON public.monitored_users FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth write monitored_users" ON public.monitored_users FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth read rules" ON public.rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth write rules" ON public.rules FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth read security_alerts" ON public.security_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth write security_alerts" ON public.security_alerts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth read security_events" ON public.security_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth write security_events" ON public.security_events FOR ALL TO authenticated USING (true) WITH CHECK (true);
