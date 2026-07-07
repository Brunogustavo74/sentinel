import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SentinelShell } from "@/components/sentinel/SentinelShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSentinel, formatDateTime } from "@/lib/sentinel-store";
import { Search } from "lucide-react";

export const Route = createFileRoute("/sentinel/alertas")({
  component: AlertsList,
});

function AlertsList() {
  const alerts = useSentinel((s) => s.alerts);
  const users = useSentinel((s) => s.users);
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("todos");
  const [status, setStatus] = useState("todos");

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      const u = users.find((x) => x.id === a.userId);
      const matchQ = q === "" || (u?.name.toLowerCase().includes(q.toLowerCase()) ?? false) || a.summary.toLowerCase().includes(q.toLowerCase());
      const matchL = level === "todos" || a.level === level;
      const matchS = status === "todos" || a.status === status;
      return matchQ && matchL && matchS;
    });
  }, [alerts, users, q, level, status]);

  return (
    <SentinelShell title="Alertas" subtitle="Todos os alertas gerados pelo motor de regras">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-64 max-w-md">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar usuário ou motivo…" className="pl-8" />
        </div>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os níveis</SelectItem>
            <SelectItem value="critico">Crítico</SelectItem>
            <SelectItem value="medio">Médio</SelectItem>
            <SelectItem value="baixo">Baixo</SelectItem>
            <SelectItem value="informativo">Informativo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="aberto">Aberto</SelectItem>
            <SelectItem value="bloqueado">Sessão bloqueada</SelectItem>
            <SelectItem value="mfa">MFA solicitado</SelectItem>
            <SelectItem value="ignorado">Ignorado</SelectItem>
            <SelectItem value="falso_positivo">Falso positivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Usuário</th>
              <th className="px-4 py-3 font-medium">Motivo</th>
              <th className="px-4 py-3 font-medium">Data/Hora</th>
              <th className="px-4 py-3 font-medium">Nível</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => {
              const u = users.find((x) => x.id === a.userId);
              return (
                <tr key={a.id} className="border-t border-border hover:bg-muted/30 cursor-pointer">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    <Link to="/sentinel/alertas/$id" params={{ id: a.id }}>#{a.id.slice(-6).toUpperCase()}</Link>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    <Link to="/sentinel/alertas/$id" params={{ id: a.id }}>{u?.name ?? "—"}</Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-md truncate">{a.summary}</td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">{formatDateTime(a.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={
                        a.level === "critico"
                          ? "bg-destructive/20 text-destructive border-destructive/40"
                          : a.level === "medio"
                            ? "bg-warning/20 text-warning border-warning/40"
                            : "bg-info/20 text-info border-info/40"
                      }
                    >
                      {a.level.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-semibold tabular-nums">{a.score}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{a.status.replace("_", " ")}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                  Nenhum alerta encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </SentinelShell>
  );
}
