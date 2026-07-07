import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SentinelShell } from "@/components/sentinel/SentinelShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSentinel, formatDateTime } from "@/lib/sentinel-store";
import { CheckCircle2, XCircle, ShieldOff, MapPin, Inbox } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/sentinel/solicitacoes")({ component: Page });

function Page() {
  const requests = useSentinel((s) => s.accessRequests);
  const users = useSentinel((s) => s.users);
  const resolve = useSentinel((s) => s.resolveAccessRequest);
  const [filter, setFilter] = useState<"pendente" | "todas">("pendente");

  const list = useMemo(
    () => requests.filter((r) => (filter === "todas" ? true : r.status === "pendente")),
    [requests, filter],
  );

  const act = async (id: string, decision: "aprovada" | "negada") => {
    await resolve(id, decision, "Superior de TI");
    toast.success(decision === "aprovada" ? "Solicitação aprovada." : "Solicitação negada.");
  };

  return (
    <SentinelShell title="Solicitações" subtitle="Aprovações de desbloqueio de conta e alteração de localização">
      <div className="flex items-center gap-2 mb-4">
        <Button size="sm" variant={filter === "pendente" ? "default" : "outline"} onClick={() => setFilter("pendente")}>
          Pendentes ({requests.filter((r) => r.status === "pendente").length})
        </Button>
        <Button size="sm" variant={filter === "todas" ? "default" : "outline"} onClick={() => setFilter("todas")}>
          Todas ({requests.length})
        </Button>
      </div>

      {list.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          <Inbox className="w-8 h-8 mx-auto mb-2 opacity-60" />
          Nenhuma solicitação {filter === "pendente" ? "pendente" : ""}.
        </Card>
      ) : (
        <div className="space-y-3">
          {list.map((r) => {
            const u = users.find((x) => x.id === r.userId);
            const Icon = r.kind === "unlock" ? ShieldOff : MapPin;
            const kindLabel = r.kind === "unlock" ? "Desbloqueio de conta" : "Alteração de localização";
            return (
              <Card key={r.id} className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${
                      r.kind === "unlock"
                        ? "bg-destructive/15 text-destructive"
                        : "bg-warning/15 text-warning"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{kindLabel}</span>
                      <Badge
                        variant="outline"
                        className={
                          r.status === "pendente"
                            ? "bg-warning/15 text-warning border-warning/40"
                            : r.status === "aprovada"
                              ? "bg-success/15 text-success border-success/40"
                              : "bg-muted text-muted-foreground"
                        }
                      >
                        {r.status.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto tabular-nums">
                        {formatDateTime(r.createdAt)}
                      </span>
                    </div>
                    <div className="text-sm mt-1">
                      <span className="font-medium">{u?.name ?? r.userId}</span>
                      {u && <span className="text-muted-foreground"> · {u.role} · {u.department}</span>}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">{r.reason}</div>
                    {r.kind === "location_change" && (
                      <div className="mt-2 text-xs bg-muted/40 rounded px-3 py-2 inline-block">
                        <span className="text-muted-foreground">Nova localização proposta: </span>
                        <span className="font-semibold text-foreground">{String(r.payload.city ?? "—")}</span>
                        {r.payload.ip && <span className="text-muted-foreground"> · IP {String(r.payload.ip)}</span>}
                        <span className="text-muted-foreground"> (atual: {u?.usualCity ?? "—"})</span>
                      </div>
                    )}
                    {r.status === "pendente" && (
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" onClick={() => act(r.id, "aprovada")} className="bg-success hover:bg-success/90 text-success-foreground">
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Aprovar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => act(r.id, "negada")}>
                          <XCircle className="w-4 h-4 mr-1" /> Negar
                        </Button>
                      </div>
                    )}
                    {r.status !== "pendente" && r.resolvedBy && (
                      <div className="text-xs text-muted-foreground mt-2">
                        Resolvido por <span className="font-medium text-foreground">{r.resolvedBy}</span>
                        {r.resolvedAt && <> em {formatDateTime(r.resolvedAt)}</>}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </SentinelShell>
  );
}
