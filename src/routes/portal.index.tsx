import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal/PortalShell";
import { useSentinel } from "@/lib/sentinel-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  BookOpen,
  Users,
  ClipboardList,
  FolderOpen,
  Megaphone,
  ClipboardCheck,
  FileText,
  Calendar as CalIcon,
  ShieldOff,
} from "lucide-react";

export const Route = createFileRoute("/portal/")({
  component: PortalDashboard,
});

const STATS = [
  { label: "Turmas Ativas", value: 28, icon: BookOpen, color: "bg-blue-100 text-blue-600" },
  { label: "Alunos Matriculados", value: 784, icon: Users, color: "bg-emerald-100 text-emerald-600" },
  { label: "Atividades Pendentes", value: 12, icon: ClipboardList, color: "bg-amber-100 text-amber-600" },
  { label: "Avaliações Lançadas", value: 156, icon: ClipboardCheck, color: "bg-violet-100 text-violet-600" },
  { label: "Arquivos", value: 342, icon: FolderOpen, color: "bg-cyan-100 text-cyan-600" },
];

const ATIVIDADES = [
  { desc: "Lançamento de notas — Prova 2º Bimestre", turma: "9º Ano A", data: "05/07/2026", status: "concluido" },
  { desc: "Atividade de Matemática — Equações", turma: "8º Ano B", data: "04/07/2026", status: "concluido" },
  { desc: "Lista de exercícios — Capítulo 4", turma: "7º Ano A", data: "03/07/2026", status: "andamento" },
  { desc: "Trabalho em grupo — Sustentabilidade", turma: "9º Ano B", data: "02/07/2026", status: "andamento" },
  { desc: "Prova de História — Idade Média", turma: "8º Ano A", data: "01/07/2026", status: "pendente" },
];

const TURMAS = [
  { turma: "9º Ano A", alunos: 32, disciplina: "Matemática", aula: "07/07/2026 - 08:00" },
  { turma: "9º Ano B", alunos: 31, disciplina: "Matemática", aula: "07/07/2026 - 09:00" },
  { turma: "8º Ano A", alunos: 30, disciplina: "Matemática", aula: "07/07/2026 - 10:00" },
  { turma: "8º Ano B", alunos: 29, disciplina: "Matemática", aula: "07/07/2026 - 11:00" },
];

const AVISOS = [
  { title: "Reunião pedagógica", date: "10/07/2026 às 14:00" },
  { title: "Entrega de notas do 2º bimestre", date: "15/07/2026" },
  { title: "Festa junina da escola", date: "20/07/2026" },
  { title: "Período de férias escolares", date: "01/08/2026 a 15/08/2026" },
];

function statusBadge(s: string) {
  const map: Record<string, { label: string; cls: string }> = {
    concluido: { label: "Concluído", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    andamento: { label: "Em andamento", cls: "bg-amber-100 text-amber-700 border-amber-200" },
    pendente: { label: "Pendente", cls: "bg-rose-100 text-rose-700 border-rose-200" },
  };
  const m = map[s];
  return <Badge variant="outline" className={`${m.cls} font-medium`}>{m.label}</Badge>;
}

function PortalDashboard() {
  const users = useSentinel((s) => s.users);
  const currentId = useSentinel((s) => s.currentPortalUserId);
  const user = users.find((u) => u.id === currentId) ?? users[0];
  const requestUnlock = useSentinel((s) => s.requestUnlock);

  const askUnlock = async () => {
    if (!user) return;
    await requestUnlock(user.id, `${user.name} solicita liberação da conta ao superior imediato.`);
    toast.success("Solicitação de desbloqueio enviada ao superior.");
  };

  return (
    <PortalShell title="Dashboard">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Bem-vindo, {user?.name.split(" ")[0] ?? ""}!</h2>
        <p className="text-sm text-muted-foreground">Veja o resumo das atividades escolares.</p>
      </div>

      {user?.blocked && (
        <Card className="p-4 mb-6 border-destructive/50 bg-destructive/10">
          <div className="flex items-start gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-md bg-destructive/20 text-destructive flex items-center justify-center shrink-0">
              <ShieldOff className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-destructive">Sua conta foi bloqueada por comportamento suspeito</div>
              <p className="text-sm text-muted-foreground mt-1">
                O sistema Sentinel detectou risco acumulado de {user.currentRisk}%. As ações estão
                suspensas até que seu superior aprove a liberação. Se você reconhece as atividades
                como legítimas, envie uma solicitação de desbloqueio.
              </p>
            </div>
            <Button variant="destructive" onClick={askUnlock}>
              Solicitar liberação ao superior
            </Button>
          </div>
        </Card>
      )}


      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {STATS.map((s) => (
          <Card key={s.label} className="p-4 flex items-center gap-3">
            <div className={`w-11 h-11 rounded-md flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold leading-none">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Atividades Recentes</h3>
              <button className="text-xs text-primary hover:underline">Ver todas</button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="pb-2 font-medium">Descrição</th>
                  <th className="pb-2 font-medium">Turma</th>
                  <th className="pb-2 font-medium">Data</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {ATIVIDADES.map((a, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-3">{a.desc}</td>
                    <td className="py-3 text-muted-foreground">{a.turma}</td>
                    <td className="py-3 text-muted-foreground">{a.data}</td>
                    <td className="py-3">{statusBadge(a.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Minhas Turmas</h3>
              <button className="text-xs text-primary hover:underline">Ver todas</button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="pb-2 font-medium">Turma</th>
                  <th className="pb-2 font-medium">Alunos</th>
                  <th className="pb-2 font-medium">Disciplina</th>
                  <th className="pb-2 font-medium">Próxima Aula</th>
                </tr>
              </thead>
              <tbody>
                {TURMAS.map((t) => (
                  <tr key={t.turma} className="border-b border-border last:border-0">
                    <td className="py-3 font-medium">{t.turma}</td>
                    <td className="py-3 text-muted-foreground">{t.alunos}</td>
                    <td className="py-3 text-muted-foreground">{t.disciplina}</td>
                    <td className="py-3 text-muted-foreground">{t.aula}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Avisos Importantes</h3>
              <button className="text-xs text-primary hover:underline">Ver todos</button>
            </div>
            <ul className="space-y-3">
              {AVISOS.map((a, i) => (
                <li key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{a.title}</div>
                    <div className="text-xs text-muted-foreground">{a.date}</div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-primary mt-2" />
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Calendário Escolar</h3>
              <CalIcon className="w-4 h-4 text-muted-foreground" />
            </div>
            <MiniCalendar />
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-3">Acesso Rápido</h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: ClipboardList, label: "Notas" },
                { icon: ClipboardCheck, label: "Frequência" },
                { icon: FolderOpen, label: "Arquivos" },
                { icon: FileText, label: "Criar" },
              ].map((q) => (
                <button
                  key={q.label}
                  className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-muted text-xs text-muted-foreground"
                >
                  <q.icon className="w-5 h-5" />
                  {q.label}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PortalShell>
  );
}

function MiniCalendar() {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const today = 6;
  const highlight = 20;
  const dow = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1 text-sm">
        <button className="text-muted-foreground">‹</button>
        <div className="font-medium">Julho 2026</div>
        <button className="text-muted-foreground">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground mb-1">
        {dow.map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {[null, null, null, ...days].map((d, i) => (
          <div
            key={i}
            className={`aspect-square flex items-center justify-center rounded ${
              d === today
                ? "bg-primary text-primary-foreground font-semibold"
                : d === highlight
                  ? "bg-emerald-100 text-emerald-700 font-semibold"
                  : "text-foreground/70 hover:bg-muted"
            }`}
          >
            {d ?? ""}
          </div>
        ))}
      </div>
    </div>
  );
}
