import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SentinelShell } from "@/components/sentinel/SentinelShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSentinel, formatTime, riskLabel } from "@/lib/sentinel-store";
import {
  Users, Activity, AlertTriangle, ShieldCheck, TrendingUp, Plane, KeyRound, Network,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";

export const Route = createFileRoute("/sentinel/")({
  component: SentinelDashboard,
});

function useTick(ms = 3000) {
  const [, set] = useState(0);
  useEffect(() => {
    const id = setInterval(() => set((n) => n + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
}

function SentinelDashboard() {
  useTick();
  const users = useSentinel((s) => s.users);
  const events = useSentinel((s) => s.events);
  const alerts = useSentinel((s) => s.alerts);

  const today = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return events.filter((e) => e.timestamp >= start.getTime()).length;
  }, [events]);

  const avgRisk = users.length ? Math.round(users.reduce((s, u) => s + u.currentRisk, 0) / users.length) : 0;
  const openAlerts = alerts.filter((a) => a.status === "aberto").length;

  const hourly = useMemo(() => {
    const now = new Date();
    const buckets = Array.from({ length: 12 }, (_, i) => {
      const h = (now.getHours() - (11 - i) + 24) % 24;
      return { hour: `${String(h).padStart(2, "0")}h`, eventos: 0, alertas: 0 };
    });
    const cutoff = Date.now() - 12 * 60 * 60 * 1000;
    events.filter((e) => e.timestamp >= cutoff).forEach((e) => {
      const idx = 11 - Math.floor((Date.now() - e.timestamp) / (60 * 60 * 1000));
      if (idx >= 0 && idx < 12) buckets[idx].eventos++;
    });
    alerts.filter((a) => a.createdAt >= cutoff).forEach((a) => {
      const idx = 11 - Math.floor((Date.now() - a.createdAt) / (60 * 60 * 1000));
      if (idx >= 0 && idx < 12) buckets[idx].alertas++;
    });
    return buckets;
  }, [events, alerts]);

  const distribution = useMemo(() => {
    const c = { critico: 0, medio: 0, baixo: 0, informativo: 0 };
    alerts.forEach((a) => c[a.level]++);
    return [
      { name: "Crítico", value: c.critico, color: "oklch(0.62 0.22 27)" },
      { name: "Médio", value: c.medio, color: "oklch(0.75 0.17 60)" },
      { name: "Baixo", value: c.baixo, color: "oklch(0.7 0.14 235)" },
      { name: "Info", value: c.informativo, color: "oklch(0.5 0.02 260)" },
    ];
  }, [alerts]);

  const topUsers = useMemo(() => [...users].sort((a, b) => b.currentRisk - a.currentRisk).slice(0, 5), [users]);
  const recentAlerts = alerts.slice(0, 5);
  const timeline = events.slice(0, 8);

  const highRiskUsers = useMemo(
    () => users.filter((u) => u.currentRisk >= 70).sort((a, b) => b.currentRisk - a.currentRisk),
    [users],
  );

  const insights = useMemo(() => {
    const impossibleTravel = alerts.filter((a) => a.reasons.some((r) => r.ruleId === "r-impossible-travel")).length;
    const mfaFailed = alerts.filter((a) => a.reasons.some((r) => r.ruleId === "r-mfa-failed")).length;
    const correlated = alerts.filter((a) => a.reasons.some((r) => r.ruleId === "r-correlation")).length;
    const privilege = alerts.filter((a) => a.reasons.some((r) => r.ruleId === "r-privilege-escalation")).length;
    return { impossibleTravel, mfaFailed, correlated, privilege };
  }, [alerts]);

  return (
    <SentinelShell title="Dashboard" subtitle="Visão geral da segurança comportamental">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Usuários Monitorados" value={users.length} tone="info" hint="+0 vs ontem" />
        <StatCard icon={Activity} label="Eventos Hoje" value={today} tone="info" hint="Em tempo real" />
        <StatCard icon={AlertTriangle} label="Alertas Abertos" value={openAlerts} tone="critical" hint={`${alerts.length} totais`} />
        <StatCard icon={ShieldCheck} label="Risco Médio" value={`${avgRisk}%`} tone={avgRisk > 50 ? "critical" : avgRisk > 25 ? "warning" : "success"} hint={riskLabel(avgRisk)} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <InsightCard icon={Plane} label="Impossible Travel" value={insights.impossibleTravel} desc="Deslocamentos impossíveis detectados" />
        <InsightCard icon={KeyRound} label="Falhas de MFA" value={insights.mfaFailed} desc="Códigos MFA inválidos em ações sensíveis" />
        <InsightCard icon={Network} label="Correlação SIEM" value={insights.correlated} desc="Alertas com múltiplos eventos correlacionados" />
        <InsightCard icon={ShieldCheck} label="Escalada de Privilégios" value={insights.privilege} desc="Concessão de permissões suspeita" />
      </div>


      {highRiskUsers.length > 0 && (
        <Card className="p-5 mb-6 border-destructive/60 bg-destructive/10 ring-1 ring-destructive/40 shadow-[0_0_0_1px_hsl(var(--destructive)/0.2)] animate-in fade-in">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-md bg-destructive/20 text-destructive flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-destructive">Comportamento anômalo detectado</h3>
                <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/40 uppercase text-[10px]">
                  {highRiskUsers.length} usuário{highRiskUsers.length > 1 ? "s" : ""}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Score acima de 70% — investigação imediata recomendada.
              </p>
            </div>
          </div>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {highRiskUsers.map((u) => (
              <Link
                key={u.id}
                to="/sentinel/usuarios/$id"
                params={{ id: u.id }}
                className="flex items-center gap-3 p-3 rounded-md bg-background/60 border border-destructive/30 hover:border-destructive transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-destructive/20 text-destructive flex items-center justify-center text-xs font-bold">
                  {u.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{u.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{u.department}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-destructive tabular-nums">{u.currentRisk}%</div>
                  <div className="text-[10px] uppercase text-destructive/80">{riskLabel(u.currentRisk)}</div>
                </div>
              </Link>
            ))}
          </ul>
        </Card>
      )}


      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold">Eventos por hora</h3>
              <p className="text-xs text-muted-foreground">Últimas 12 horas</p>
            </div>
            <div className="text-xs text-muted-foreground flex gap-3">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-chart-1" /> Eventos</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-destructive" /> Alertas</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={hourly}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.68 0.19 28)" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="oklch(0.68 0.19 28)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.62 0.22 27)" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="oklch(0.62 0.22 27)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="oklch(0.3 0.02 260)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="hour" stroke="oklch(0.7 0.02 260)" fontSize={11} />
              <YAxis stroke="oklch(0.7 0.02 260)" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "oklch(0.21 0.02 260)", border: "1px solid oklch(0.3 0.02 260)", borderRadius: 6, fontSize: 12 }} />
              <Area type="monotone" dataKey="eventos" stroke="oklch(0.68 0.19 28)" fill="url(#g1)" strokeWidth={2} />
              <Area type="monotone" dataKey="alertas" stroke="oklch(0.62 0.22 27)" fill="url(#g2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-1">Distribuição de Alertas</h3>
          <p className="text-xs text-muted-foreground mb-3">Por nível de severidade</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={2}>
                {distribution.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Top Usuários por Risco</h3>
          <ul className="space-y-3">
            {topUsers.map((u, i) => (
              <li key={u.id} className="flex items-center gap-3">
                <div className="text-xs text-muted-foreground w-5">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{u.name}</div>
                  <div className="h-1.5 mt-1 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full ${u.currentRisk >= 80 ? "bg-destructive" : u.currentRisk >= 50 ? "bg-warning" : "bg-success"}`} style={{ width: `${u.currentRisk}%` }} />
                  </div>
                </div>
                <div className="text-sm font-semibold tabular-nums">{u.currentRisk}%</div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Alertas Recentes</h3>
            <Link to="/sentinel/alertas" className="text-xs text-primary hover:underline">Ver todos →</Link>
          </div>
          {recentAlerts.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              Nenhum alerta ainda. Utilize a Central de Simulação no Portal Acadêmico para gerar eventos.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentAlerts.map((a) => {
                const u = users.find((x) => x.id === a.userId)!;
                return (
                  <li key={a.id}>
                    <Link to="/sentinel/alertas/$id" params={{ id: a.id }} className="flex items-center gap-3 py-3 hover:bg-muted/40 rounded px-2 -mx-2">
                      <div className={`w-2 h-2 rounded-full ${a.level === "critico" ? "bg-destructive" : a.level === "medio" ? "bg-warning" : "bg-info"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{u.name} <span className="text-muted-foreground font-normal">— {a.summary}</span></div>
                        <div className="text-xs text-muted-foreground">{formatTime(a.createdAt)} • Score {a.score}</div>
                      </div>
                      <Badge className={a.level === "critico" ? "bg-destructive/20 text-destructive border-destructive/40" : a.level === "medio" ? "bg-warning/20 text-warning border-warning/40" : "bg-info/20 text-info border-info/40"} variant="outline">
                        {a.level.toUpperCase()}
                      </Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <Card className="p-5 mt-4">
        <h3 className="font-semibold mb-3">Timeline de Eventos</h3>
        {timeline.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4">Nenhum evento recebido ainda.</div>
        ) : (
          <ol className="relative border-l border-border ml-2 space-y-3">
            {timeline.map((e) => {
              const u = users.find((x) => x.id === e.userId);
              return (
                <li key={e.id} className="ml-4">
                  <span className="absolute -left-1.5 w-3 h-3 rounded-full bg-primary" />
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-xs text-muted-foreground tabular-nums">{formatTime(e.timestamp)}</span>
                    <span className="font-medium">{u?.name ?? "—"}</span>
                    <span className="text-muted-foreground">executou</span>
                    <span className="font-mono text-xs px-1.5 py-0.5 bg-muted rounded">{e.type}</span>
                    {e.count && <span className="text-xs text-muted-foreground">({e.count})</span>}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Card>
    </SentinelShell>
  );
}

function StatCard({ icon: Icon, label, value, hint, tone }: { icon: any; label: string; value: any; hint: string; tone: "info" | "critical" | "warning" | "success" }) {
  const toneCls = {
    info: "bg-info/15 text-info border-info/30",
    critical: "bg-destructive/15 text-destructive border-destructive/30",
    warning: "bg-warning/15 text-warning border-warning/30",
    success: "bg-success/15 text-success border-success/30",
  }[tone];
  return (
    <Card className="p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-md border flex items-center justify-center ${toneCls}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
        <div className="text-2xl font-bold leading-tight">{value}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
    </Card>
  );
}

function InsightCard({ icon: Icon, label, value, desc }: { icon: any; label: string; value: number; desc: string }) {
  const highlight = value > 0;
  return (
    <Card className={`p-4 flex items-start gap-3 ${highlight ? "border-destructive/40 bg-destructive/5" : ""}`}>
      <div className={`w-9 h-9 rounded-md flex items-center justify-center ${highlight ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className={`text-xl font-bold leading-tight ${highlight ? "text-destructive" : ""}`}>{value}</div>
        <div className="text-[11px] text-muted-foreground line-clamp-2">{desc}</div>
      </div>
    </Card>
  );
}
