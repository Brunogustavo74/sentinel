
-- Sentinel 
CREATE TABLE public.monitored_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  avatar_seed TEXT NOT NULL,
  usual_hour_start INT NOT NULL,
  usual_hour_end INT NOT NULL,
  usual_device TEXT NOT NULL,
  usual_city TEXT NOT NULL,
  usual_ip TEXT NOT NULL,
  avg_actions_per_day INT NOT NULL DEFAULT 0,
  active_days INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  current_risk INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.monitored_users TO anon, authenticated;
GRANT ALL ON public.monitored_users TO service_role;
ALTER TABLE public.monitored_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read users" ON public.monitored_users FOR SELECT USING (true);
CREATE POLICY "public write users" ON public.monitored_users FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  hour INT NOT NULL,
  device TEXT NOT NULL,
  ip TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT,
  count INT,
  metadata JSONB
);
CREATE INDEX ON public.security_events (ts DESC);
CREATE INDEX ON public.security_events (user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.security_events TO anon, authenticated;
GRANT ALL ON public.security_events TO service_role;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read events" ON public.security_events FOR SELECT USING (true);
CREATE POLICY "public write events" ON public.security_events FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  level TEXT NOT NULL,
  score INT NOT NULL,
  reasons JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'aberto',
  event_ids JSONB NOT NULL,
  summary TEXT NOT NULL
);
CREATE INDEX ON public.security_alerts (created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.security_alerts TO anon, authenticated;
GRANT ALL ON public.security_alerts TO service_role;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read alerts" ON public.security_alerts FOR SELECT USING (true);
CREATE POLICY "public write alerts" ON public.security_alerts FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  weight INT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rules TO anon, authenticated;
GRANT ALL ON public.rules TO service_role;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read rules" ON public.rules FOR SELECT USING (true);
CREATE POLICY "public write rules" ON public.rules FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.integrations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  status TEXT NOT NULL,
  last_sync TIMESTAMPTZ NOT NULL DEFAULT now(),
  events_count INT NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integrations TO anon, authenticated;
GRANT ALL ON public.integrations TO service_role;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read integrations" ON public.integrations FOR SELECT USING (true);
CREATE POLICY "public write integrations" ON public.integrations FOR ALL USING (true) WITH CHECK (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.monitored_users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.integrations;

-- Seed
INSERT INTO public.monitored_users (id,name,email,role,department,avatar_seed,usual_hour_start,usual_hour_end,usual_device,usual_city,usual_ip,avg_actions_per_day,active_days,active,current_risk) VALUES
('u-joao','João Silva','joao.silva@escola.edu.br','professor','Matemática','joao',7,18,'Windows 11 / Chrome','Recife, PE','189.45.67.32',47,128,true,12),
('u-maria','Maria Santos','maria.santos@escola.edu.br','secretaria','Secretaria Acadêmica','maria',8,17,'macOS / Safari','Recife, PE','189.45.67.44',62,210,true,48),
('u-carlos','Carlos Andrade','carlos.andrade@escola.edu.br','professor','História','carlos',7,19,'Windows 10 / Edge','Olinda, PE','177.12.34.55',38,96,true,68),
('u-ana','Ana Beatriz','ana.beatriz@escola.edu.br','coordenadora','Coordenação Pedagógica','ana',7,18,'Windows 11 / Chrome','Recife, PE','189.45.67.51',55,340,true,21),
('u-lucas','Lucas Pereira','lucas.pereira@escola.edu.br','aluno','9º Ano A','lucas',13,22,'Android / Chrome Mobile','Recife, PE','191.30.12.9',22,210,true,8);

INSERT INTO public.rules (id,name,description,weight,enabled) VALUES
('r-madrugada','Login em horário incomum','Login realizado fora da janela habitual do usuário (madrugada).',30,true),
('r-device','Novo dispositivo','Acesso a partir de um dispositivo nunca utilizado.',20,true),
('r-city','Nova localização','Acesso a partir de uma cidade fora do padrão.',25,true),
('r-download','Download em massa','Mais de 30 arquivos baixados em curto intervalo.',35,true),
('r-grade-mass','Alteração em massa de registros','Mais de 20 registros alterados em poucos minutos.',40,true),
('r-user-edit','Alteração de usuários','Edição ou remoção de contas fora do fluxo habitual.',25,true),
('r-failed-login','Tentativas repetidas de login','Sequência de logins malsucedidos.',20,true),
('r-new-area','Acesso a área nunca utilizada','Usuário acessa módulo sem histórico prévio.',15,true),
('r-burst','Sequência rápida de ações','Volume anormal de eventos em curto intervalo.',20,true);

INSERT INTO public.integrations (id,name,kind,status,events_count) VALUES
('i-portal','Portal Acadêmico','Portal','conectado',0),
('i-rest','API REST v1','REST API','conectado',0),
('i-webhook','Webhook /events','Webhook','conectado',0),
('i-sdk','Sentinel SDK JS','SDK','conectado',0);
