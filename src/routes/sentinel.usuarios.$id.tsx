import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { SentinelShell } from "@/components/sentinel/SentinelShell";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useSentinel, formatDateTime, riskLabel } from "@/lib/sentinel-store";
import { ArrowLeft } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/sentinel/usuarios/$id")({ component: UserDetail });

function UserDetail() {
  const { id } = Route.useParams();
  const user = useSentinel((s) => s.users.find((u) => u.id === id));
  const events = useSentinel((s) => s.events.filter((e) => e.userId === id));
  const alerts = useSentinel((s) => s.alerts.filter((a) => a.userId === id));

  const scoreHistory = useMemo(() => {
    const buckets = Array.from({ length: 10 }, (_, i) => ({ t: `T-${9 - i}`, score: 0 }));
    alerts.slice(0, 10).reverse().forEach((a, i) => {
      if (i < 10) buckets[i].score = a.score;
    });
    return buckets;
  }, [alerts]);

  if (!user) {
    return <SentinelShell title="Usuário não encontrado"><div className="p-8 text-center text-muted-foreground">Não encontrado.</div></SentinelShell>;
  }

  return (
    <SentinelShell title="Perfil Comportamental" subtitle={user.name}>
      <Link to="/sentinel/usuarios" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar para usuários
      </Link>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card className="p-5 lg:col-span-1 flex flex-col items-center text-center">
          <Avatar className="w-20 h-20 mb-3"><AvatarFallback className="bg-primary/20 text-primary text-xl">{user.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}</AvatarFallback></Avatar>
          <div className="text-lg font-bold">{user.name}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
          <Badge className="mt-2" variant="outline">{user.role} • {user.department}</Badge>
          <div className="w-full mt-4 pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground">Risco atual</div>
            <div className="text-3xl font-bold mt-1" style={{ color: user.currentRisk >= 80 ? "oklch(0.62 0.22 27)" : user.currentRisk >= 50 ? "oklch(0.75 0.17 60)" : "oklch(0.7 0.14 235)" }}>
              {user.currentRisk}%
            </div>
            <div className="text-xs text-muted-foreground">{riskLabel(user.currentRisk)}</div>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold mb-3">Perfil de Comportamento (baseline)</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <F label="Horário comum" value={`${String(user.usualHourStart).padStart(2, "0")}:00 – ${String(user.usualHourEnd).padStart(2, "0")}:00`} />
            <F label="Dispositivo habitual" value={user.usualDevice} />
            <F label="Localização comum" value={user.usualCity} />
            <F label="IP habitual" value={user.usualIp} />
            <F label="Média diária de ações" value={String(user.avgActionsPerDay)} />
            <F label="Dias ativos" value={String(user.activeDays)} />
          </div>
        </Card>
      </div>

      <Card className="p-5 mb-4">
        <h3 className="font-semibold mb-3">Histórico de Score</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={scoreHistory}>
            <CartesianGrid stroke="oklch(0.3 0.02 260)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="t" stroke="oklch(0.7 0.02 260)" fontSize={11} />
            <YAxis stroke="oklch(0.7 0.02 260)" fontSize={11} domain={[0, 100]} />
            <Tooltip contentStyle={{ background: "oklch(0.21 0.02 260)", border: "1px solid oklch(0.3 0.02 260)", fontSize: 12 }} />
            <Line type="monotone" dataKey="score" stroke="oklch(0.62 0.22 27)" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold mb-3">Eventos Recentes</h3>
        {events.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4">Sem eventos.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="py-2 font-medium">Data/Hora</th>
                <th className="py-2 font-medium">Tipo</th>
                <th className="py-2 font-medium">Dispositivo</th>
                <th className="py-2 font-medium">Cidade</th>
                <th className="py-2 font-medium text-right">Qtd</th>
              </tr>
            </thead>
            <tbody>
              {events.slice(0, 20).map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0">
                  <td className="py-2 tabular-nums">{formatDateTime(e.timestamp)}</td>
                  <td className="py-2"><span className="font-mono text-xs px-1.5 py-0.5 bg-muted rounded">{e.type}</span></td>
                  <td className="py-2 text-muted-foreground">{e.device}</td>
                  <td className="py-2 text-muted-foreground">{e.city}</td>
                  <td className="py-2 text-right text-muted-foreground">{e.count ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </SentinelShell>
  );
}

function F({ label, value }: { label: string; value: string }) {
  return <div><div className="text-xs text-muted-foreground">{label}</div><div className="font-medium">{value}</div></div>;
}
