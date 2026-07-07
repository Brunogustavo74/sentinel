import { createFileRoute } from "@tanstack/react-router";
import { PortalListPage } from "@/components/portal/PortalListPage";

export const Route = createFileRoute("/portal/avaliacoes")({ component: () => <Page /> });

const rows = [
  { titulo: "Prova 2º Bimestre — Matemática", turma: "9º Ano A", data: "10/07/2026", peso: "6,0", status: "Ativa" },
  { titulo: "Trabalho — Idade Média", turma: "8º Ano A", data: "12/07/2026", peso: "2,0", status: "Ativa" },
  { titulo: "Simulado Geral", turma: "9º Ano B", data: "20/07/2026", peso: "4,0", status: "Programada" },
];

function Page() {
  return (
    <PortalListPage
      title="Avaliações"
      subtitle="Provas e trabalhos lançados no sistema."
      actionLabel="Nova avaliação"
      columns={[
        { key: "titulo", label: "Título" },
        { key: "turma", label: "Turma" },
        { key: "data", label: "Data" },
        { key: "peso", label: "Peso" },
        { key: "status", label: "Status" },
      ]}
      rows={rows}
    />
  );
}
