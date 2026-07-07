import { createFileRoute } from "@tanstack/react-router";
import { SentinelShell } from "@/components/sentinel/SentinelShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSentinel, formatDateTime } from "@/lib/sentinel-store";
import { Plug, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/sentinel/integracoes")({ component: Page });

function Page() {
  const integrations = useSentinel((s) => s.integrations);
  return (
    <SentinelShell title="Integrações" subtitle="Fontes de eventos conectadas ao Sentinel">
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Última sincronização</th>
              <th className="px-4 py-3 font-medium text-right">Eventos recebidos</th>
            </tr>
          </thead>
          <tbody>
            {integrations.map((i) => (
              <tr key={i.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3 flex items-center gap-2 font-medium"><Plug className="w-4 h-4 text-primary" /> {i.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{i.kind}</td>
                <td className="px-4 py-3">
                  {i.status === "conectado" ? (
                    <Badge variant="outline" className="bg-success/20 text-success border-success/40"><CheckCircle2 className="w-3 h-3 mr-1" /> Conectado</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/40"><AlertCircle className="w-3 h-3 mr-1" /> Erro</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground tabular-nums">{formatDateTime(i.lastSync)}</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums">{i.eventsCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </SentinelShell>
  );
}
