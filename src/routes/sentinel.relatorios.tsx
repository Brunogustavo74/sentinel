import { createFileRoute } from "@tanstack/react-router";
import { SentinelShell } from "@/components/sentinel/SentinelShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { useSentinel } from "@/lib/sentinel-store";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/sentinel/relatorios")({ component: Page });

function Page() {
  const users = useSentinel((s) => s.users);
  const data = users.map((u) => ({ nome: u.name.split(" ")[0], risco: u.currentRisk }));
  return (
    <SentinelShell title="Relatórios" subtitle="Exportação e visão consolidada">
      <div className="flex gap-2 mb-4">
        <Button variant="outline" onClick={() => toast.success("PDF gerado (simulação).")}><FileDown className="w-4 h-4 mr-2" /> Exportar PDF</Button>
        <Button variant="outline" onClick={() => toast.success("Excel gerado (simulação).")}><FileSpreadsheet className="w-4 h-4 mr-2" /> Exportar Excel</Button>
      </div>
      <Card className="p-5">
        <h3 className="font-semibold mb-3">Usuários mais suspeitos</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid stroke="oklch(0.3 0.02 260)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="nome" stroke="oklch(0.7 0.02 260)" fontSize={11} />
            <YAxis stroke="oklch(0.7 0.02 260)" fontSize={11} domain={[0, 100]} />
            <Tooltip contentStyle={{ background: "oklch(0.21 0.02 260)", border: "1px solid oklch(0.3 0.02 260)", fontSize: 12 }} />
            <Bar dataKey="risco" fill="oklch(0.68 0.19 28)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </SentinelShell>
  );
}
