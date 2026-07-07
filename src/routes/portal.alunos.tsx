import { createFileRoute } from "@tanstack/react-router";
import { PortalListPage } from "@/components/portal/PortalListPage";

export const Route = createFileRoute("/portal/alunos")({ component: () => <Page /> });

const rows = Array.from({ length: 12 }, (_, i) => ({
  id: String(1000 + i),
  nome: ["Ana Beatriz","Bruno Costa","Camila Dias","Diego Farias","Eduarda Gomes","Felipe Henrique","Gabriela Ítalo","Heitor Júlio","Isabela Karen","João Lucas","Karina Melo","Lucas Nunes"][i],
  turma: ["9º Ano A","9º Ano B","8º Ano A","8º Ano B"][i % 4],
  responsavel: "Responsável " + (i + 1),
  matricula: "2026-" + (100 + i),
  status: i % 7 === 0 ? "Trancada" : "Ativa",
}));

function Page() {
  return (
    <PortalListPage
      title="Alunos"
      subtitle="Cadastro completo dos alunos matriculados."
      actionLabel="Novo aluno"
      columns={[
        { key: "id", label: "Cód." },
        { key: "nome", label: "Nome" },
        { key: "turma", label: "Turma" },
        { key: "responsavel", label: "Responsável" },
        { key: "matricula", label: "Matrícula" },
        { key: "status", label: "Status" },
      ]}
      rows={rows}
    />
  );
}
