import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal/PortalShell";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/portal/relatorios")({ component: Page });

function Page() {
  return (
    <PortalShell title="Relatórios">
      <div className="grid md:grid-cols-3 gap-4">
        {[
          "Boletim consolidado",
          "Frequência mensal",
          "Desempenho por turma",
          "Alunos em recuperação",
          "Uso do sistema",
          "Comunicações enviadas",
        ].map((t) => (
          <Card key={t} className="p-5">
            <div className="text-sm text-muted-foreground mb-2">Relatório</div>
            <div className="font-semibold">{t}</div>
            <button className="mt-4 text-sm text-primary hover:underline">Gerar relatório →</button>
          </Card>
        ))}
      </div>
    </PortalShell>
  );
}
