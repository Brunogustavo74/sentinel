import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/integrations/supabase/client";

export type Role = "professor" | "secretaria" | "coordenadora" | "aluno" | "admin";

export interface MonitoredUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  avatarSeed: string;
  usualHourStart: number;
  usualHourEnd: number;
  usualDevice: string;
  usualCity: string;
  usualIp: string;
  avgActionsPerDay: number;
  activeDays: number;
  active: boolean;
  blocked: boolean;
  currentRisk: number;
}

export type EventType =
  | "login"
  | "login_failed"
  | "grade_change"
  | "download"
  | "upload"
  | "user_edit"
  | "user_delete"
  | "area_access"
  | "logout"
  | "note_view"
  | "message_sent"
  | "mfa_challenge"
  | "mfa_success"
  | "mfa_failed"
  | "session_end"
  | "permission_change"
  | "impossible_travel";

export interface SecurityEvent {
  id: string;
  userId: string;
  type: EventType;
  timestamp: number;
  hour: number;
  device: string;
  ip: string;
  city: string;
  area?: string;
  count?: number;
  metadata?: Record<string, string | number>;
}

export interface AlertReason {
  ruleId: string;
  label: string;
  weight: number;
}

export type AlertLevel = "critico" | "medio" | "baixo" | "informativo";
export type AlertStatus = "aberto" | "bloqueado" | "mfa" | "ignorado" | "falso_positivo";

export interface SecurityAlert {
  id: string;
  userId: string;
  createdAt: number;
  level: AlertLevel;
  score: number;
  reasons: AlertReason[];
  status: AlertStatus;
  eventIds: string[];
  summary: string;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  weight: number;
  enabled: boolean;
}

export interface Integration {
  id: string;
  name: string;
  kind: "REST API" | "Webhook" | "SDK" | "Portal";
  status: "conectado" | "erro" | "pendente";
  lastSync: number;
  eventsCount: number;
}

export type AccessRequestKind = "unlock" | "location_change";
export type AccessRequestStatus = "pendente" | "aprovada" | "negada";

export interface AccessRequest {
  id: string;
  userId: string;
  kind: AccessRequestKind;
  payload: Record<string, string | number>;
  reason: string;
  status: AccessRequestStatus;
  createdAt: number;
  resolvedAt?: number;
  resolvedBy?: string;
}

interface Store {
  users: MonitoredUser[];
  events: SecurityEvent[];
  alerts: SecurityAlert[];
  rules: Rule[];
  integrations: Integration[];
  accessRequests: AccessRequest[];
  currentPortalUserId: string | null;
  ready: boolean;

  ingestEvent: (e: Omit<SecurityEvent, "id" | "timestamp" | "hour">) => Promise<void>;
  updateAlertStatus: (id: string, status: AlertStatus) => Promise<void>;
  addRule: (r: Omit<Rule, "id">) => Promise<void>;
  updateRule: (id: string, patch: Partial<Rule>) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  setPortalUser: (id: string | null) => void;

  requestUnlock: (userId: string, reason: string) => Promise<void>;
  requestLocationChange: (userId: string, city: string, ip: string, reason: string) => Promise<void>;
  resolveAccessRequest: (id: string, decision: "aprovada" | "negada", resolvedBy: string) => Promise<void>;

  reset: () => Promise<void>;
}

function levelFromScore(score: number): AlertLevel {
  if (score >= 80) return "critico";
  if (score >= 50) return "medio";
  if (score >= 25) return "baixo";
  return "informativo";
}

type UserRow = {
  id: string; name: string; email: string; role: string; department: string;
  avatar_seed: string; usual_hour_start: number; usual_hour_end: number;
  usual_device: string; usual_city: string; usual_ip: string;
  avg_actions_per_day: number; active_days: number; active: boolean;
  blocked: boolean; current_risk: number;
};
type EventRow = {
  id: string; user_id: string; type: string; ts: string; hour: number;
  device: string; ip: string; city: string; area: string | null; count: number | null;
  metadata: Record<string, string | number> | null;
};
type AlertRow = {
  id: string; user_id: string; created_at: string; level: string; score: number;
  reasons: AlertReason[]; status: string; event_ids: string[]; summary: string;
};
type RuleRow = { id: string; name: string; description: string; weight: number; enabled: boolean };
type IntegrationRow = {
  id: string; name: string; kind: string; status: string; last_sync: string; events_count: number;
};
type AccessRequestRow = {
  id: string; user_id: string; kind: string;
  payload: Record<string, string | number>; reason: string;
  status: string; created_at: string; resolved_at: string | null; resolved_by: string | null;
};

const mapUser = (r: UserRow): MonitoredUser => ({
  id: r.id, name: r.name, email: r.email, role: r.role as Role, department: r.department,
  avatarSeed: r.avatar_seed, usualHourStart: r.usual_hour_start, usualHourEnd: r.usual_hour_end,
  usualDevice: r.usual_device, usualCity: r.usual_city, usualIp: r.usual_ip,
  avgActionsPerDay: r.avg_actions_per_day, activeDays: r.active_days, active: r.active,
  blocked: r.blocked ?? false, currentRisk: r.current_risk,
});
const mapEvent = (r: EventRow): SecurityEvent => ({
  id: r.id, userId: r.user_id, type: r.type as EventType, timestamp: new Date(r.ts).getTime(),
  hour: r.hour, device: r.device, ip: r.ip, city: r.city,
  area: r.area ?? undefined, count: r.count ?? undefined, metadata: r.metadata ?? undefined,
});
const mapAlert = (r: AlertRow): SecurityAlert => ({
  id: r.id, userId: r.user_id, createdAt: new Date(r.created_at).getTime(),
  level: r.level as AlertLevel, score: r.score, reasons: r.reasons,
  status: r.status as AlertStatus, eventIds: r.event_ids, summary: r.summary,
});
const mapIntegration = (r: IntegrationRow): Integration => ({
  id: r.id, name: r.name, kind: r.kind as Integration["kind"],
  status: r.status as Integration["status"], lastSync: new Date(r.last_sync).getTime(),
  eventsCount: r.events_count,
});
const mapAccessRequest = (r: AccessRequestRow): AccessRequest => ({
  id: r.id, userId: r.user_id, kind: r.kind as AccessRequestKind,
  payload: r.payload ?? {}, reason: r.reason, status: r.status as AccessRequestStatus,
  createdAt: new Date(r.created_at).getTime(),
  resolvedAt: r.resolved_at ? new Date(r.resolved_at).getTime() : undefined,
  resolvedBy: r.resolved_by ?? undefined,
});

function scoreEvent(
  event: SecurityEvent,
  user: MonitoredUser | undefined,
  history: SecurityEvent[],
  rules: Rule[],
): { score: number; reasons: AlertReason[] } {
  if (!user) return { score: 0, reasons: [] };
  const enabled = new Map(rules.filter((r) => r.enabled).map((r) => [r.id, r]));
  const reasons: AlertReason[] = [];
  const add = (ruleId: string, label: string) => {
    const rule = enabled.get(ruleId);
    if (!rule) return;
    reasons.push({ ruleId, label, weight: rule.weight });
  };

  if (event.type === "login" || event.type === "area_access") {
    const outside =
      event.hour < user.usualHourStart || event.hour > user.usualHourEnd || event.hour < 6;
    if (outside) add("r-madrugada", `Login em horário incomum (${String(event.hour).padStart(2, "0")}h)`);
  }
  if (event.device && event.device !== user.usualDevice && event.type === "login") {
    add("r-device", `Novo dispositivo detectado (${event.device})`);
  }
  if (event.city && event.city !== user.usualCity) {
    add("r-city", `Nova localização detectada (${event.city})`);
  }
  if (event.type === "download" && (event.count ?? 1) >= 30) {
    add("r-download", `Download em alta quantidade (${event.count} arquivos)`);
  }
  if (event.type === "grade_change" && (event.count ?? 1) >= 20) {
    add("r-grade-mass", `Alteração em massa de registros (${event.count} registros)`);
  }
  if (event.type === "user_edit" || event.type === "user_delete") {
    add("r-user-edit", `${event.type === "user_delete" ? "Remoção" : "Alteração"} de usuário`);
  }
  if (event.type === "login_failed") {
    const recent = history.filter(
      (e) => e.userId === user.id && e.type === "login_failed" && event.timestamp - e.timestamp < 10 * 60_000,
    );
    if (recent.length >= 3) add("r-failed-login", `Tentativas repetidas de login (${recent.length + 1})`);
  }
  if (event.type === "area_access" && event.area) {
    const prior = history.some((e) => e.userId === user.id && e.area === event.area);
    if (!prior) add("r-new-area", `Acesso a área nunca utilizada (${event.area})`);
  }
  const lastMin = history.filter((e) => e.userId === user.id && event.timestamp - e.timestamp < 60_000);
  if (lastMin.length >= 8) add("r-burst", `Sequência rápida de ações (${lastMin.length} em 1 min)`);

  // Impossible travel — login em cidade diferente < 60 min após outro login
  if (event.type === "login" && event.city) {
    const priorLogin = history.find(
      (e) => e.userId === user.id && e.type === "login" && e.city && e.city !== event.city && event.timestamp - e.timestamp < 60 * 60_000,
    );
    if (priorLogin) {
      const mins = Math.max(1, Math.round((event.timestamp - priorLogin.timestamp) / 60_000));
      add("r-impossible-travel", `Impossible Travel: ${priorLogin.city} → ${event.city} em ${mins} min`);
    }
  }

  // MFA falhou
  if (event.type === "mfa_failed") {
    add("r-mfa-failed", `Falha na verificação MFA${event.metadata?.reason ? ` (${event.metadata.reason})` : ""}`);
  }

  // Escalada de privilégios
  if (event.type === "permission_change") {
    add("r-privilege-escalation", `Escalada de privilégios detectada${event.metadata?.role ? ` → ${event.metadata.role}` : ""}`);
  }

  // Alteração fora do calendário
  if (event.type === "grade_change" && event.metadata?.offCalendar) {
    add("r-off-calendar", `Alteração fora do calendário escolar${event.metadata?.subject ? ` — ${event.metadata.subject}` : ""}`);
  }

  // Sessão longa
  if (event.type === "session_end" && Number(event.metadata?.durationMin ?? 0) >= 480) {
    add("r-session-long", `Sessão ativa por ${event.metadata?.durationMin} min sem reautenticação`);
  }

  // Correlação SIEM — vários tipos de regra na mesma janela de 5 min
  const window = history.filter((e) => e.userId === user.id && event.timestamp - e.timestamp < 5 * 60_000);
  const distinctTypes = new Set(window.map((e) => e.type));
  distinctTypes.add(event.type);
  if (distinctTypes.size >= 3 && reasons.length > 0) {
    add("r-correlation", `Correlação SIEM: ${distinctTypes.size} tipos de evento em 5 min`);
  }

  const score = reasons.reduce((s, r) => s + r.weight, 0);
  return { score, reasons };
}

const BLOCK_RISK_THRESHOLD = 90;

const vpnCache = new Map<string, { isVpn: boolean; timestamp: number }>();

const checkVpnIp = async (ip: string): Promise<boolean> => {
  if (!ip || ip.startsWith("127.") || ip.startsWith("192.168.") || ip.startsWith("10.")) return false;
  const cached = vpnCache.get(ip);
  if (cached && Date.now() - cached.timestamp < 3600000) return cached.isVpn;
  try {
    const res = await fetch(`https://blackbox.ipinfo.app/lookup/${ip}`);
    if (!res.ok) return false;
    const isVpn = (await res.text()).trim() === "Y";
    vpnCache.set(ip, { isVpn, timestamp: Date.now() });
    return isVpn;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const useSentinel = create<Store>()(
  persist(
    (set, get) => ({
      users: [],
      events: [],
      alerts: [],
      rules: [],
      integrations: [],
      accessRequests: [],
      currentPortalUserId: null,
      ready: false,

      ingestEvent: async (partial) => {
        const state = get();
        const user = state.users.find((u) => u.id === partial.userId);
        if (user?.blocked) return;
        const now = Date.now();
        const hour = new Date(now).getHours();
        const tentative: SecurityEvent = {
          ...partial,
          id: "tmp",
          timestamp: now,
          hour,
        };
        let { score, reasons } = scoreEvent(tentative, user, state.events, state.rules);

        const isVpn = await checkVpnIp(partial.ip ?? "");

        if (score >= 25 && isVpn) {
          score = Math.max(score, 100);
          reasons = [
            { ruleId: "r-vpn", label: `Uso de VPN detectado durante ação suspeita (${partial.ip})`, weight: 100 },
            ...reasons
          ];
        }

        const { data: eventRow, error: evtErr } = await supabase
          .from("security_events")
          .insert({
            user_id: partial.userId,
            type: partial.type,
            hour,
            device: partial.device,
            ip: partial.ip,
            city: partial.city,
            area: partial.area ?? null,
            count: partial.count ?? null,
            metadata: partial.metadata ?? null,
          })
          .select()
          .single();
        if (evtErr || !eventRow) return;

        if (score >= 25 && user) {
          const newRisk = Math.min(100, Math.max(user.currentRisk, score));
          await supabase.from("security_alerts").insert({
            user_id: user.id,
            level: levelFromScore(score),
            score,
            reasons: reasons as unknown as never,
            status: "aberto",
            event_ids: [(eventRow as EventRow).id] as unknown as never,
            summary: reasons[0]?.label ?? "Comportamento anômalo detectado",
          });

          const shouldBlock = !user.blocked && newRisk >= BLOCK_RISK_THRESHOLD;
          await supabase
            .from("monitored_users")
            .update({
              current_risk: newRisk,
              ...(shouldBlock ? { blocked: true } : {}),
            })
            .eq("id", user.id);

          if (shouldBlock) {
            const existing = get().accessRequests.find(r => r.userId === user.id && r.kind === "unlock" && r.status === "pendente");
            if (!existing) {
              const id = crypto.randomUUID ? crypto.randomUUID() : `req_${Math.random().toString(36).slice(2, 10)}`;
              await supabase.from("access_requests").insert({
                id,
                user_id: user.id,
                kind: "unlock",
                payload: { auto: 1, risk: newRisk },
                reason: `Bloqueio automático — risco ${newRisk}% após alerta ${levelFromScore(score).toUpperCase()}: ${reasons[0]?.label ?? ""}`,
                status: "pendente",
              });
            }
          }
        }

        const portal = state.integrations.find((i) => i.id === "i-portal");
        if (portal) {
          await supabase
            .from("integrations")
            .update({ last_sync: new Date().toISOString(), events_count: portal.eventsCount + 1 })
            .eq("id", "i-portal");
        }
      },

      updateAlertStatus: async (id, status) => {
        set((s) => ({ alerts: s.alerts.map((a) => (a.id === id ? { ...a, status } : a)) }));
        await supabase.from("security_alerts").update({ status }).eq("id", id);
        if (status === "bloqueado") {
          const alert = get().alerts.find((a) => a.id === id);
          if (alert) {
            await supabase.from("monitored_users").update({ blocked: true }).eq("id", alert.userId);
            const existing = get().accessRequests.find(r => r.userId === alert.userId && r.kind === "unlock" && r.status === "pendente");
            if (!existing) {
              const reqId = crypto.randomUUID ? crypto.randomUUID() : `req_${Math.random().toString(36).slice(2, 10)}`;
              await supabase.from("access_requests").insert({
                id: reqId,
                user_id: alert.userId,
                kind: "unlock",
                payload: { manual: 1 },
                reason: `Bloqueio manual pelo analista após alerta: ${alert.summary}`,
                status: "pendente",
              });
            }
          }
        }
      },

      addRule: async (r) => {
        const id = `rule_${Math.random().toString(36).slice(2, 10)}`;
        await supabase.from("rules").insert({ id, ...r });
      },
      updateRule: async (id, patch) => {
        set((s) => ({ rules: s.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
        await supabase.from("rules").update(patch).eq("id", id);
      },
      deleteRule: async (id) => {
        await supabase.from("rules").delete().eq("id", id);
      },

      setPortalUser: (id) => set({ currentPortalUserId: id }),

      requestUnlock: async (userId, reason) => {
        const existing = get().accessRequests.find(
          (r) => r.userId === userId && r.kind === "unlock" && r.status === "pendente"
        );
        if (existing) return;

        const id = crypto.randomUUID ? crypto.randomUUID() : `req_${Math.random().toString(36).slice(2, 10)}`;
        await supabase.from("access_requests").insert({
          id,
          user_id: userId,
          kind: "unlock",
          payload: {},
          reason,
          status: "pendente",
        });
      },

      requestLocationChange: async (userId, city, ip, reason) => {
        const id = crypto.randomUUID ? crypto.randomUUID() : `req_${Math.random().toString(36).slice(2, 10)}`;
        await supabase.from("access_requests").insert({
          id,
          user_id: userId,
          kind: "location_change",
          payload: { city, ip },
          reason,
          status: "pendente",
        });
      },

      resolveAccessRequest: async (id, decision, resolvedBy) => {
        const req = get().accessRequests.find((r) => r.id === id);
        if (!req) return;
        const { error: err1 } = await supabase.from("access_requests").update({
          status: decision,
          resolved_at: new Date().toISOString(),
          resolved_by: resolvedBy,
        }).eq("id", id);
        if (err1) console.error(err1);

        if (decision !== "aprovada") return;

        if (req.kind === "unlock") {
          const { error: err2 } = await supabase.from("monitored_users").update({
            blocked: false,
            current_risk: 0,
          }).eq("id", req.userId);
          if (err2) console.error(err2);
        } else if (req.kind === "location_change") {
          const patch: { usual_city?: string; usual_ip?: string } = {};
          if (req.payload.city) patch.usual_city = String(req.payload.city);
          if (req.payload.ip) patch.usual_ip = String(req.payload.ip);
          if (Object.keys(patch).length) {
            const { error: err3 } = await supabase.from("monitored_users").update(patch).eq("id", req.userId);
            if (err3) console.error(err3);
          }
        }
      },

      reset: async () => {
        await supabase.from("security_events").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await supabase.from("security_alerts").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await supabase.from("access_requests").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await supabase.from("monitored_users").update({ current_risk: 0, blocked: false }).neq("id", "");
        await supabase.from("integrations").update({ events_count: 0 }).neq("id", "");
      },
    }),
    {
      name: "sentinel-store-v2",
      partialize: (s) => ({ currentPortalUserId: s.currentPortalUserId }),
    },
  ),
);

let bootstrapped = false;
export function bootstrapSentinel() {
  if (bootstrapped || typeof window === "undefined") return;
  bootstrapped = true;

  const load = async () => {
    const [users, events, alerts, rules, integrations, requests] = await Promise.all([
      supabase.from("monitored_users").select("*"),
      supabase.from("security_events").select("*").order("ts", { ascending: false }).limit(500),
      supabase.from("security_alerts").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("rules").select("*"),
      supabase.from("integrations").select("*"),
      supabase.from("access_requests").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    useSentinel.setState({
      users: (users.data ?? []).map((r) => mapUser(r as UserRow)),
      events: (events.data ?? []).map((r) => mapEvent(r as EventRow)),
      alerts: (alerts.data ?? []).map((r) => mapAlert(r as unknown as AlertRow)),
      rules: (rules.data ?? []) as Rule[],
      integrations: (integrations.data ?? []).map((r) => mapIntegration(r as IntegrationRow)),
      accessRequests: (requests.data ?? []).map((r) => mapAccessRequest(r as unknown as AccessRequestRow)),
      ready: true,
    });
  };
  void load();

  supabase
    .channel("sentinel-realtime")
    .on("postgres_changes", { event: "*", schema: "public", table: "security_events" }, (payload) => {
      const s = useSentinel.getState();
      if (payload.eventType === "INSERT") {
        const ev = mapEvent(payload.new as EventRow);
        if (s.events.some((e) => e.id === ev.id)) return;
        useSentinel.setState({ events: [ev, ...s.events].slice(0, 500) });
      } else if (payload.eventType === "DELETE") {
        useSentinel.setState({ events: [] });
      }
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "security_alerts" }, (payload) => {
      const s = useSentinel.getState();
      if (payload.eventType === "INSERT") {
        const a = mapAlert(payload.new as unknown as AlertRow);
        if (s.alerts.some((x) => x.id === a.id)) return;
        useSentinel.setState({ alerts: [a, ...s.alerts].slice(0, 200) });
      } else if (payload.eventType === "UPDATE") {
        const a = mapAlert(payload.new as unknown as AlertRow);
        useSentinel.setState({ alerts: s.alerts.map((x) => (x.id === a.id ? a : x)) });
      } else if (payload.eventType === "DELETE") {
        useSentinel.setState({ alerts: [] });
      }
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "monitored_users" }, (payload) => {
      const s = useSentinel.getState();
      if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
        const u = mapUser(payload.new as UserRow);
        useSentinel.setState({
          users: s.users.some((x) => x.id === u.id)
            ? s.users.map((x) => (x.id === u.id ? u : x))
            : [...s.users, u],
        });
      }
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "integrations" }, (payload) => {
      const s = useSentinel.getState();
      if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
        const i = mapIntegration(payload.new as IntegrationRow);
        useSentinel.setState({
          integrations: s.integrations.some((x) => x.id === i.id)
            ? s.integrations.map((x) => (x.id === i.id ? i : x))
            : [...s.integrations, i],
        });
      }
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "access_requests" }, (payload) => {
      const s = useSentinel.getState();
      if (payload.eventType === "INSERT") {
        const r = mapAccessRequest(payload.new as unknown as AccessRequestRow);
        if (s.accessRequests.some((x) => x.id === r.id)) return;
        useSentinel.setState({ accessRequests: [r, ...s.accessRequests].slice(0, 200) });
      } else if (payload.eventType === "UPDATE") {
        const r = mapAccessRequest(payload.new as unknown as AccessRequestRow);
        useSentinel.setState({ accessRequests: s.accessRequests.map((x) => (x.id === r.id ? r : x)) });
      } else if (payload.eventType === "DELETE") {
        useSentinel.setState({ accessRequests: [] });
      }
    })
    .subscribe();
}

if (typeof window !== "undefined") {
  bootstrapSentinel();
}

export function riskLabel(score: number): string {
  if (score >= 80) return "Crítico";
  if (score >= 50) return "Alto";
  if (score >= 25) return "Médio";
  return "Baixo";
}

export function levelColor(level: AlertLevel): string {
  return {
    critico: "text-destructive",
    medio: "text-warning",
    baixo: "text-info",
    informativo: "text-muted-foreground",
  }[level];
}

export function formatDateTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
