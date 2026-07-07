import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SentinelShell } from "@/components/sentinel/SentinelShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSentinel, formatDateTime, riskLabel } from "@/lib/sentinel-store";
import { ArrowLeft, ShieldOff, ShieldAlert, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/sentinel/alertas/$id")({
  component: AlertDetail,
});

function AlertDetail() {
  const { id } = Route.useParams();
  const alert = useSentinel((s) => s.alerts.find((a) => a.id === id));
  const users = useSentinel((s) => s.users);
  const events = useSentinel((s) => s.events);
  const updateStatus = useSentinel((s) => s.updateAlertStatus);
  const navigate = useNavigate();

  if (!alert) {
    return (
      <SentinelShell title="Alerta não encontrado">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Alerta não localizado.</p>
          <Link to="/sentinel/alertas" className="text-primary hover:underline text-sm mt-2 inline-block">
            ← Voltar para alertas
          </Link>
        </div>
      </SentinelShell>
    );
  }

  const user = users.find((u) => u.id === alert.userId)!;
  const userEvents = events.filter((e) => e.userId === user.id).slice(0, 10);
  const scoreDeg = Math.min(360, (alert.score / 100) * 360);

  const act = (status: any, msg: string) => {
    updateStatus(alert.id, status);
    toast.success(msg);
    setTimeout(() => navigate({ to: "/sentinel/alertas" }), 600);
  };

  const scoreColor =
    alert.level === "critico"
      ? "oklch(0.62 0.22 27)"
      : alert.level === "medio"
        ? "oklch(0.75 0.17 60)"
        : "oklch(0.7 0.14 235)";

  return (
    <SentinelShell title="Detalhes do Alerta" subtitle={`ID #${alert.id.slice(-6).toUpperCase()}`}>
      <Link to="/sentinel/alertas" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar para alertas
      </Link>

      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-2xl font-bold">Alerta {alert.level === "critico" ? "Crítico" : alert.level === "medio" ? "Médio" : "Baixo"}</h2>
        <Badge
          variant="outline"
          className={
            alert.level === "critico"
              ? "bg-destructive/20 text-destructive border-destructive/40"
              : alert.level === "medio"
                ? "bg-warning/20 text-warning border-warning/40"
                : "bg-info/20 text-info border-info/40"
          }
        >
          {alert.level.toUpperCase()}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-primary/20 text-primary text-lg">
                {user.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl font-bold">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
              <div className="text-xs text-muted-foreground mt-1">{user.role} • {user.department}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Field label="Data / Hora" value={formatDateTime(alert.createdAt)} />
            <Field label="IP" value={user.usualIp} />
            <Field label="Localização" value={user.usualCity} />
            <Field label="Dispositivo" value={user.usualDevice} />
            <Field label="Departamento" value={user.department} />
            <Field label="Score total" value={String(alert.score) + "/100"} />
          </div>
        </Card>

        <Card className="p-5 flex flex-col items-center justify-center">
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Pontuação de Risco</div>
          <div
            className="relative w-40 h-40 rounded-full flex items-center justify-center"
            style={{
              background: `conic-gradient(${scoreColor} ${scoreDeg}deg, oklch(0.28 0.02 260) 0deg)`,
            }}
          >
            <div className="w-32 h-32 rounded-full bg-card flex flex-col items-center justify-center">
              <div className="text-4xl font-bold tabular-nums" style={{ color: scoreColor }}>{alert.score}</div>
              <div className="text-xs text-muted-foreground">/100</div>
            </div>
          </div>
          <div className="mt-3 font-semibold" style={{ color: scoreColor }}>
            {riskLabel(alert.score)}
          </div>
        </Card>
      </div>

      <Card className="p-5 mb-4">
        <h3 className="font-semibold mb-3">Motivos do Alerta</h3>
        <ul className="space-y-2">
          {alert.reasons.map((r) => (
            <li key={r.ruleId + r.label} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
              <span className="w-2 h-2 rounded-full bg-destructive" />
              <span className="flex-1 text-sm">{r.label}</span>
              <span className="text-sm font-semibold text-destructive tabular-nums">+{r.weight}</span>
            </li>
          ))}
          <li className="flex items-center gap-3 py-2 pt-3 border-t border-border font-semibold">
            <span className="flex-1 text-sm">Total</span>
            <span className="text-lg tabular-nums" style={{ color: scoreColor }}>{alert.score}</span>
          </li>
        </ul>
      </Card>

      <Card className="p-5 mb-4">
        <h3 className="font-semibold mb-3">Ações Recomendadas</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="destructive" onClick={() => act("bloqueado", "Sessão do usuário bloqueada.")}>
            <ShieldOff className="w-4 h-4 mr-2" /> Bloquear Sessão
          </Button>
          <Button className="bg-warning text-warning-foreground hover:bg-warning/90" onClick={() => act("mfa", "MFA solicitado ao usuário.")}>
            <ShieldAlert className="w-4 h-4 mr-2" /> Solicitar MFA
          </Button>
          <Button variant="secondary" onClick={() => act("ignorado", "Alerta ignorado.")}>
            <EyeOff className="w-4 h-4 mr-2" /> Ignorar
          </Button>
          <Button variant="outline" onClick={() => act("falso_positivo", "Marcado como falso positivo.")}>
            <CheckCircle2 className="w-4 h-4 mr-2" /> Marcar como Falso Positivo
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold mb-3">Linha do Tempo do Usuário</h3>
        {userEvents.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4">Sem eventos anteriores.</div>
        ) : (
          <ol className="relative border-l border-border ml-2 space-y-3">
            {userEvents.map((e) => (
              <li key={e.id} className="ml-4">
                <span className="absolute -left-1.5 w-3 h-3 rounded-full bg-primary" />
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-xs text-muted-foreground tabular-nums w-32">{formatDateTime(e.timestamp)}</span>
                  <span className="font-mono text-xs px-1.5 py-0.5 bg-muted rounded">{e.type}</span>
                  <span className="text-muted-foreground text-xs">{e.city} • {e.device}</span>
                  {e.count && <span className="ml-auto text-xs text-destructive">×{e.count}</span>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </SentinelShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
