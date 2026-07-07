import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SentinelShell } from "@/components/sentinel/SentinelShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSentinel, formatDateTime } from "@/lib/sentinel-store";
import { Search } from "lucide-react";

export const Route = createFileRoute("/sentinel/eventos")({ component: EventsList });

function EventsList() {
  const events = useSentinel((s) => s.events);
  const users = useSentinel((s) => s.users);
  const [q, setQ] = useState("");
  const [type, setType] = useState("todos");
  const [userId, setUserId] = useState("todos");

  const filtered = useMemo(() => events.filter((e) => {
    const u = users.find((x) => x.id === e.userId);
    return (
      (type === "todos" || e.type === type) &&
      (userId === "todos" || e.userId === userId) &&
      (q === "" || u?.name.toLowerCase().includes(q.toLowerCase()) || e.city.toLowerCase().includes(q.toLowerCase()) || e.device.toLowerCase().includes(q.toLowerCase()))
    );
  }), [events, users, q, type, userId]);

  return (
    <SentinelShell title="Eventos" subtitle="Fluxo completo recebido via API">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-64 max-w-md">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" className="pl-8" />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            {["login","login_failed","logout","grade_change","download","upload","user_edit","user_delete","area_access","note_view","message_sent","mfa_challenge","mfa_success","mfa_failed","session_end","permission_change","impossible_travel"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os usuários</SelectItem>
            {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Data/Hora</th>
              <th className="px-4 py-3 font-medium">Usuário</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Dispositivo</th>
              <th className="px-4 py-3 font-medium">IP</th>
              <th className="px-4 py-3 font-medium">Cidade</th>
              <th className="px-4 py-3 font-medium text-right">Qtd</th>
              <th className="px-4 py-3 font-medium">Metadados</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 200).map((e) => {
              const u = users.find((x) => x.id === e.userId);
              const meta = e.metadata ? Object.entries(e.metadata).map(([k, v]) => `${k}: ${v}`).join(" · ") : "";
              return (
                <tr key={e.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2.5 text-muted-foreground tabular-nums text-xs">{formatDateTime(e.timestamp)}</td>
                  <td className="px-4 py-2.5 font-medium">{u?.name ?? "—"}</td>
                  <td className="px-4 py-2.5"><span className="font-mono text-xs px-1.5 py-0.5 bg-muted rounded">{e.type}</span></td>
                  <td className="px-4 py-2.5 text-muted-foreground">{e.device}</td>
                  <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">{e.ip}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{e.city}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">{e.count ?? "—"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs max-w-xs truncate" title={meta}>{meta || "—"}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center py-10 text-muted-foreground text-sm">Nenhum evento.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </SentinelShell>
  );
}
