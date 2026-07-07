import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal/PortalShell";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/portal/configuracoes")({ component: Page });

function Page() {
  return (
    <PortalShell title="Configurações">
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Instituição</h3>
          <div className="space-y-2"><Label>Nome</Label><Input defaultValue="Colégio São Miguel" /></div>
          <div className="space-y-2"><Label>Ano letivo</Label><Input defaultValue="2026" /></div>
          <div className="space-y-2"><Label>Período</Label><Input defaultValue="2º Semestre" /></div>
        </Card>
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Preferências</h3>
          <div className="flex items-center justify-between"><Label>Notificações por e-mail</Label><Switch defaultChecked /></div>
          <div className="flex items-center justify-between"><Label>Alertas de sistema</Label><Switch defaultChecked /></div>
          <div className="flex items-center justify-between"><Label>Enviar telemetria</Label><Switch defaultChecked /></div>
        </Card>
      </div>
    </PortalShell>
  );
}
