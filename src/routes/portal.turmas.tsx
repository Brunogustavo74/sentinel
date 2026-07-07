import { createFileRoute } from "@tanstack/react-router";
import { PortalListPage } from "@/components/portal/PortalListPage";

export const Route = createFileRoute("/portal/turmas")({ component: () => <Page /> });

const rows = [
  { id: "T-9A", nome: "9º Ano A", alunos: "32", turno: "Manhã", coordenacao: "Ana Beatriz", status: "Ativa" },
  { id: "T-9B", nome: "9º Ano B", alunos: "31", turno: "Manhã", coordenacao: "Ana Beatriz", status: "Ativa" },
  { id: "T-8A", nome: "8º Ano A", alunos: "30", turno: "Tarde", coordenacao: "Ana Beatriz", status: "Ativa" },
  { id: "T-8B", nome: "8º Ano B", alunos: "29", turno: "Tarde", coordenacao: "Ana Beatriz", status: "Ativa" },
  { id: "T-7A", nome: "7º Ano A", alunos: "28", turno: "Manhã", coordenacao: "Ana Beatriz", status: "Ativa" },
];

function Page() {
  return (
    <PortalListPage
      title="Turmas"
      subtitle="Gerencie as turmas do ano letivo."
      actionLabel="Nova turma"
      columns={[
        { key: "id", label: "Código" },
        { key: "nome", label: "Turma" },
        { key: "alunos", label: "Alunos" },
        { key: "turno", label: "Turno" },
        { key: "coordenacao", label: "Coordenação" },
        { key: "status", label: "Status" },
      ]}
      rows={rows}
    />
  );
}
