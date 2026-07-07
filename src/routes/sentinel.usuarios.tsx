import { createFileRoute, Link } from "@tanstack/react-router";
import { SentinelShell } from "@/components/sentinel/SentinelShell";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSentinel, riskLabel } from "@/lib/sentinel-store";

export const Route = createFileRoute("/sentinel/usuarios")({ component: UsersList });

function UsersList() {
  const users = useSentinel((s) => s.users);
  const events = useSentinel((s) => s.events);
  return (
    <SentinelShell title="Usuários" subtitle="Perfis comportamentais monitorados">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => {
          const total = events.filter((e) => e.userId === u.id).length;
          return (
            <Link key={u.id} to="/sentinel/usuarios/$id" params={{ id: u.id }}>
              <Card className={`p-5 hover:border-primary/60 transition-colors ${u.currentRisk >= 70 ? "border-destructive/60 ring-1 ring-destructive/40 bg-destructive/5" : ""}`}>
                <div className="flex items-center gap-3 mb-4">

                  <Avatar className="w-12 h-12"><AvatarFallback className="bg-primary/20 text-primary">{u.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}</AvatarFallback></Avatar>
                  <div>
                    <div className="font-semibold">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.role} • {u.department}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground flex justify-between mb-1"><span>Risco atual</span><span className="font-semibold text-foreground">{u.currentRisk}% — {riskLabel(u.currentRisk)}</span></div>
                <div className="h-1.5 rounded bg-muted overflow-hidden">
                  <div className={`h-full ${u.currentRisk >= 80 ? "bg-destructive" : u.currentRisk >= 50 ? "bg-warning" : "bg-success"}`} style={{ width: `${u.currentRisk}%` }} />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                  <div><div className="text-muted-foreground">Eventos</div><div className="font-semibold">{total}</div></div>
                  <div><div className="text-muted-foreground">Ações/dia</div><div className="font-semibold">{u.avgActionsPerDay}</div></div>
                  <div><div className="text-muted-foreground">Dias ativo</div><div className="font-semibold">{u.activeDays}</div></div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </SentinelShell>
  );
}
