import { createFileRoute } from "@tanstack/react-router";
import { SentinelShell } from "@/components/sentinel/SentinelShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useSentinel } from "@/lib/sentinel-store";
import { Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/sentinel/regras")({ component: Page });

function Page() {
  const rules = useSentinel((s) => s.rules);
  const update = useSentinel((s) => s.updateRule);
  const del = useSentinel((s) => s.deleteRule);
  const add = useSentinel((s) => s.addRule);
  const [nn, setNN] = useState("");
  const [nw, setNW] = useState(20);

  return (
    <SentinelShell title="Regras" subtitle="Motor determinístico — cada peso soma para o score final">
      <Card className="p-5 mb-4">
        <h3 className="font-semibold mb-3">Nova regra</h3>
        <div className="flex flex-wrap gap-2">
          <Input placeholder="Nome da regra" value={nn} onChange={(e) => setNN(e.target.value)} className="flex-1 min-w-64" />
          <Input type="number" min={1} max={100} value={nw} onChange={(e) => setNW(Number(e.target.value))} className="w-24" />
          <Button
            onClick={() => {
              if (!nn.trim()) return;
              add({ name: nn, description: "Regra personalizada", weight: nw, enabled: true });
              setNN("");
              toast.success("Regra criada.");
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Adicionar
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Descrição</th>
              <th className="px-4 py-3 font-medium">Peso</th>
              <th className="px-4 py-3 font-medium">Ativa</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.description}</td>
                <td className="px-4 py-3">
                  <Input type="number" value={r.weight} onChange={(e) => update(r.id, { weight: Number(e.target.value) })} className="w-20 h-8" />
                </td>
                <td className="px-4 py-3">
                  <Switch checked={r.enabled} onCheckedChange={(v) => update(r.id, { enabled: v })} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => del(r.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </SentinelShell>
  );
}
