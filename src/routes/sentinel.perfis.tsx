import { createFileRoute } from "@tanstack/react-router";
import { SentinelShell } from "@/components/sentinel/SentinelShell";
import { Card } from "@/components/ui/card";
import { useSentinel, riskLabel } from "@/lib/sentinel-store";

export const Route = createFileRoute("/sentinel/perfis")({ component: Page });

function Page() {
  const users = useSentinel((s) => s.users);
  return (
    <SentinelShell title="Perfis Comportamentais" subtitle="Baseline calculado por usuário">
      <div className="grid md:grid-cols-2 gap-4">
        {users.map((u) => (
          <Card key={u.id} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold">{u.name}</div>
                <div className="text-xs text-muted-foreground">{u.role} • {u.department}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{u.currentRisk}%</div>
                <div className="text-xs text-muted-foreground">{riskLabel(u.currentRisk)}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted-foreground">Horário: </span>{u.usualHourStart}–{u.usualHourEnd}h</div>
              <div><span className="text-muted-foreground">Cidade: </span>{u.usualCity}</div>
              <div><span className="text-muted-foreground">Dispositivo: </span>{u.usualDevice}</div>
              <div><span className="text-muted-foreground">Ações/dia: </span>{u.avgActionsPerDay}</div>
            </div>
          </Card>
        ))}
      </div>
    </SentinelShell>
  );
}
