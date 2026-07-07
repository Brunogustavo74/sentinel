import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useSentinel } from "@/lib/sentinel-store";
import { Search, Save } from "lucide-react";

export const Route = createFileRoute("/portal/notas")({
  component: NotasPage,
});

interface Row {
  id: string;
  aluno: string;
  turma: string;
  disciplina: string;
  bimestre: string;
  nota: number;
}

const ALUNOS = [
  "Ana Beatriz", "Bruno Costa", "Camila Dias", "Diego Farias", "Eduarda Gomes",
  "Felipe Henrique", "Gabriela Ítalo", "Heitor Júlio", "Isabela Karen", "João Lucas",
  "Karina Melo", "Lucas Nunes", "Marina Oliveira", "Nathan Pereira", "Olivia Queiroz",
  "Pedro Rocha", "Quiteria Souza", "Rafael Teixeira", "Sofia Urias", "Thiago Vieira",
];

function makeRows(): Row[] {
  const turmas = ["9º Ano A", "9º Ano B", "8º Ano A", "8º Ano B"];
  const disciplinas = ["Matemática", "Português", "História"];
  const bims = ["1º Bim", "2º Bim"];
  return ALUNOS.flatMap((a, i) =>
    turmas.slice(0, 2).map((t, j) => ({
      id: `n-${i}-${j}`,
      aluno: a,
      turma: t,
      disciplina: disciplinas[(i + j) % disciplinas.length],
      bimestre: bims[j % bims.length],
      nota: Math.round((5 + ((i * 7 + j * 13) % 50) / 10) * 10) / 10,
    })),
  );
}

function NotasPage() {
  const [rows, setRows] = useState<Row[]>(() => makeRows());
  const [dirty, setDirty] = useState<Record<string, number>>({});
  const [q, setQ] = useState("");
  const [turma, setTurma] = useState("todas");

  const ingest = useSentinel((s) => s.ingestEvent);
  const currentId = useSentinel((s) => s.currentPortalUserId);
  const users = useSentinel((s) => s.users);
  const user = users.find((u) => u.id === currentId) ?? users[0];

  const filtered = useMemo(() => {
    return rows.filter(
      (r) =>
        (turma === "todas" || r.turma === turma) &&
        (q === "" ||
          r.aluno.toLowerCase().includes(q.toLowerCase()) ||
          r.disciplina.toLowerCase().includes(q.toLowerCase())),
    );
  }, [rows, q, turma]);

  const editNota = (id: string, v: string) => {
    const n = Number(v);
    if (isNaN(n)) return;
    setDirty((d) => ({ ...d, [id]: n }));
  };

  const salvar = () => {
    const count = Object.keys(dirty).length;
    if (count === 0) {
      toast.info("Nenhuma alteração pendente.");
      return;
    }
    setRows((rs) => rs.map((r) => (dirty[r.id] !== undefined ? { ...r, nota: dirty[r.id] } : r)));
    setDirty({});
    ingest({
      userId: user.id,
      type: "grade_change",
      device: user.usualDevice,
      ip: user.usualIp,
      city: user.usualCity,
      count,
    });
    toast.success(`${count} nota(s) salva(s). Evento enviado ao Sentinel.`);
  };

  return (
    <PortalShell title="Notas">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-64 max-w-md">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar aluno ou disciplina…" className="pl-8" />
        </div>
        <Select value={turma} onValueChange={setTurma}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as turmas</SelectItem>
            <SelectItem value="9º Ano A">9º Ano A</SelectItem>
            <SelectItem value="9º Ano B">9º Ano B</SelectItem>
            <SelectItem value="8º Ano A">8º Ano A</SelectItem>
            <SelectItem value="8º Ano B">8º Ano B</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-3">
          {Object.keys(dirty).length > 0 && (
            <span className="text-xs text-amber-600 font-medium">
              {Object.keys(dirty).length} alteração(ões) pendente(s)
            </span>
          )}
          <Button onClick={salvar}><Save className="w-4 h-4 mr-2" /> Salvar alterações</Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Aluno</th>
              <th className="px-4 py-3 font-medium">Turma</th>
              <th className="px-4 py-3 font-medium">Disciplina</th>
              <th className="px-4 py-3 font-medium">Bimestre</th>
              <th className="px-4 py-3 font-medium w-28">Nota</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const value = dirty[r.id] ?? r.nota;
              const edited = dirty[r.id] !== undefined;
              return (
                <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium">{r.aluno}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.turma}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.disciplina}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.bimestre}</td>
                  <td className="px-4 py-2">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={value}
                      onChange={(e) => editNota(r.id, e.target.value)}
                      className={`h-8 w-20 ${edited ? "border-amber-400 bg-amber-50" : ""}`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <div className="mt-3 text-xs text-muted-foreground">
        Mostrando {filtered.length} de {rows.length} registros
      </div>
    </PortalShell>
  );
}
