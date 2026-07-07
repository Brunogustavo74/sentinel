import { createFileRoute } from "@tanstack/react-router";
import { SentinelShell } from "@/components/sentinel/SentinelShell";
import { Card } from "@/components/ui/card";
import { useSentinel, formatDateTime } from "@/lib/sentinel-store";

export const Route = createFileRoute("/sentinel/logs")({ component: Page });

function Page() {
  const events = useSentinel((s) => s.events);
  return (
    <SentinelShell title="Logs" subtitle="Log bruto de eventos recebidos">
      <Card className="p-4 font-mono text-xs bg-muted/20 max-h-[70vh] overflow-auto">
        {events.length === 0 ? (
          <div className="text-muted-foreground">Sem entradas.</div>
        ) : (
          events.slice(0, 200).map((e) => (
            <div key={e.id} className="border-b border-border/50 py-1">
              <span className="text-muted-foreground">[{formatDateTime(e.timestamp)}]</span>{" "}
              <span className="text-primary">{e.type}</span>{" "}
              user={e.userId} ip={e.ip} city="{e.city}" device="{e.device}"{e.count ? ` count=${e.count}` : ""}{e.area ? ` area="${e.area}"` : ""}
            </div>
          ))
        )}
      </Card>
    </SentinelShell>
  );
}
