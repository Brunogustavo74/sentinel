import { createFileRoute } from "@tanstack/react-router";
import { PortalListPage } from "@/components/portal/PortalListPage";

export const Route = createFileRoute("/portal/professores")({ component: () => <Page /> });

const rows = [
  { id: "P-01", nome: "João Silva", disciplina: "Matemática", turmas: "9A, 9B, 8A, 8B", email: "joao.silva@escola.edu.br", status: "Ativo" },
  { id: "P-02", nome: "Carlos Andrade", disciplina: "História", turmas: "7A, 7B, 8A", email: "carlos.andrade@escola.edu.br", status: "Ativo" },
  { id: "P-03", nome: "Ana Beatriz", disciplina: "Coordenação", turmas: "—", email: "ana.beatriz@escola.edu.br", status: "Ativo" },
  { id: "P-04", nome: "Maria Santos", disciplina: "Secretaria", turmas: "—", email: "maria.santos@escola.edu.br", status: "Ativo" },
];

function Page() {
  return (
    <PortalListPage
      title="Professores"
      subtitle="Corpo docente e funcionários."
      actionLabel="Novo professor"
      columns={[
        { key: "id", label: "Cód." },
        { key: "nome", label: "Nome" },
        { key: "disciplina", label: "Disciplina" },
        { key: "turmas", label: "Turmas" },
        { key: "email", label: "E-mail" },
        { key: "status", label: "Status" },
      ]}
      rows={rows}
    />
  );
}
