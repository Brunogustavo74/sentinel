import { createFileRoute } from "@tanstack/react-router";
import { SentinelShell } from "@/components/sentinel/SentinelShell";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useSentinel } from "@/lib/sentinel-store";
import { toast } from "sonner";

export const Route = createFileRoute("/sentinel/configuracoes")({ component: Page });

function Page() {
  const reset = useSentinel((s) => s.reset);
  return (
    <SentinelShell title="Configurações" subtitle="Preferências do console">
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Retenção</h3>
          <div className="space-y-2"><Label>Eventos (dias)</Label><Input defaultValue="90" /></div>
          <div className="space-y-2"><Label>Alertas (dias)</Label><Input defaultValue="365" /></div>
        </Card>
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Notificações</h3>
          <div className="flex items-center justify-between"><Label>Alertas críticos por e-mail</Label><Switch defaultChecked /></div>
          <div className="flex items-center justify-between"><Label>Webhook Slack</Label><Switch /></div>
          <div className="flex items-center justify-between"><Label>Digest diário</Label><Switch defaultChecked /></div>
        </Card>
        <Card className="p-6 space-y-4 md:col-span-2">
          <h3 className="font-semibold">Manutenção</h3>
          <p className="text-sm text-muted-foreground">Reiniciar dados de demonstração — apaga eventos e alertas coletados.</p>
          <Button variant="destructive" onClick={() => { reset(); toast.success("Dados reiniciados."); }}>Reiniciar dados</Button>
        </Card>
      </div>
    </SentinelShell>
  );
}
