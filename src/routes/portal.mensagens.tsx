import { createFileRoute } from "@tanstack/react-router";
import { PortalListPage } from "@/components/portal/PortalListPage";

export const Route = createFileRoute("/portal/mensagens")({ component: () => <Page /> });

const rows = [
  { de: "Ana Beatriz", assunto: "Reunião pedagógica remarcada", data: "05/07/2026 10:12", status: "Lida" },
  { de: "Maria Santos", assunto: "Fechamento de notas", data: "04/07/2026 15:30", status: "Lida" },
  { de: "Direção", assunto: "Comunicado — Semana Cultural", data: "03/07/2026 09:00", status: "Lida" },
];

function Page() {
  return (
    <PortalListPage
      title="Mensagens"
      subtitle="Comunicações internas da equipe pedagógica."
      actionLabel="Nova mensagem"
      columns={[
        { key: "de", label: "De" },
        { key: "assunto", label: "Assunto" },
        { key: "data", label: "Data" },
        { key: "status", label: "Status" },
      ]}
      rows={rows}
    />
  );
}
