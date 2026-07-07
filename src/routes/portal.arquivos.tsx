import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSentinel } from "@/lib/sentinel-store";
import { FileText, Eye, Download, Trash2, Upload, FileImage, FileSpreadsheet } from "lucide-react";

export const Route = createFileRoute("/portal/arquivos")({
  component: ArquivosPage,
});

interface Arquivo {
  id: string;
  nome: string;
  tipo: "PDF" | "XLSX" | "PNG" | "DOCX";
  tamanho: string;
  data: string;
  autor: string;
}

const INITIAL: Arquivo[] = [
  { id: "a1", nome: "Prova_9AnoA_Matematica_2Bim.pdf", tipo: "PDF", tamanho: "1.4 MB", data: "05/07/2026", autor: "João Silva" },
  { id: "a2", nome: "Notas_Consolidadas_2Bim.xlsx", tipo: "XLSX", tamanho: "342 KB", data: "05/07/2026", autor: "Maria Santos" },
  { id: "a3", nome: "Lista_Exercicios_Cap4.pdf", tipo: "PDF", tamanho: "820 KB", data: "03/07/2026", autor: "Carlos Andrade" },
  { id: "a4", nome: "Cronograma_Julho.docx", tipo: "DOCX", tamanho: "112 KB", data: "01/07/2026", autor: "Ana Beatriz" },
  { id: "a5", nome: "Turma_9A_Foto.png", tipo: "PNG", tamanho: "2.8 MB", data: "28/06/2026", autor: "João Silva" },
];

function iconFor(t: Arquivo["tipo"]) {
  if (t === "XLSX") return FileSpreadsheet;
  if (t === "PNG") return FileImage;
  return FileText;
}

function ArquivosPage() {
  const [files, setFiles] = useState<Arquivo[]>(INITIAL);
  const ingest = useSentinel((s) => s.ingestEvent);
  const users = useSentinel((s) => s.users);
  const currentId = useSentinel((s) => s.currentPortalUserId);
  const user = users.find((u) => u.id === currentId) ?? users[0];

  const doDownload = (a: Arquivo) => {
    ingest({
      userId: user.id,
      type: "download",
      device: user.usualDevice,
      ip: user.usualIp,
      city: user.usualCity,
      count: 1,
      metadata: { filename: a.nome },
    });
    toast.success(`Download iniciado: ${a.nome}`);
  };

  const doUpload = () => {
    const id = `a${Date.now()}`;
    const nome = `Novo_Arquivo_${Math.floor(Math.random() * 1000)}.pdf`;
    setFiles((f) => [{ id, nome, tipo: "PDF", tamanho: "512 KB", data: new Date().toLocaleDateString("pt-BR"), autor: user.name }, ...f]);
    ingest({ userId: user.id, type: "upload", device: user.usualDevice, ip: user.usualIp, city: user.usualCity, metadata: { filename: nome } });
    toast.success("Arquivo enviado.");
  };

  const doDelete = (a: Arquivo) => {
    setFiles((f) => f.filter((x) => x.id !== a.id));
    toast.info(`Arquivo removido: ${a.nome}`);
  };

  return (
    <PortalShell title="Arquivos">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">Gerencie os arquivos compartilhados do seu departamento.</p>
        <Button onClick={doUpload}><Upload className="w-4 h-4 mr-2" /> Upload</Button>
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Tamanho</th>
              <th className="px-4 py-3 font-medium">Enviado por</th>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {files.map((a) => {
              const Icon = iconFor(a.tipo);
              return (
                <tr key={a.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 flex items-center gap-2 font-medium">
                    <Icon className="w-4 h-4 text-primary" /> {a.nome}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{a.tipo}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.tamanho}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.autor}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.data}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => toast.info(`Abrindo ${a.nome}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => doDownload(a)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => doDelete(a)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </PortalShell>
  );
}
