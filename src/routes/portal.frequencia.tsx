import { createFileRoute } from "@tanstack/react-router";
import { PortalListPage } from "@/components/portal/PortalListPage";

export const Route = createFileRoute("/portal/frequencia")({ component: () => <Page /> });

const rows = Array.from({ length: 10 }, (_, i) => ({
  data: `0${(i % 9) + 1}/07/2026`,
  turma: ["9º Ano A", "9º Ano B", "8º Ano A"][i % 3],
  disciplina: ["Matemática", "História", "Português"][i % 3],
  presentes: String(28 - (i % 5)),
  faltas: String(i % 5),
  status: "Registrada",
}));

function Page() {
  return (
    <PortalListPage
      title="Frequência"
      subtitle="Registro diário de presença por turma."
      actionLabel="Registrar chamada"
      columns={[
        { key: "data", label: "Data" },
        { key: "turma", label: "Turma" },
        { key: "disciplina", label: "Disciplina" },
        { key: "presentes", label: "Presentes" },
        { key: "faltas", label: "Faltas" },
        { key: "status", label: "Status" },
      ]}
      rows={rows}
    />
  );
}
