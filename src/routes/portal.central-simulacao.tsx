import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSentinel } from "@/lib/sentinel-store";
import {
  Moon, Smartphone, MapPin, Download, ClipboardEdit, UserCog, Zap, ShieldOff, DoorOpen, Activity, PlayCircle, RotateCcw, AlertTriangle, Plane, KeyRound, Crown, CalendarX, Clock,
} from "lucide-react";

export const Route = createFileRoute("/portal/central-simulacao")({
  component: CentralSimulacao,
});


type Level = "informativo" | "baixo" | "medio" | "critico" | "solicitacao";

interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: any;
  level: Level;
  run: (ctx: { ingest: any; requestLocation: any; user: any }) => Promise<void> | void;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const SCENARIOS: Scenario[] = [
  {
    id: "s1",
    title: "Login em horário incomum",
    description: "Login registrado às 03:14 — dispara regra de madrugada (peso 35).",
    icon: Moon,
    level: "baixo",
    run: ({ ingest, user }) =>
      ingest({ userId: user.id, type: "login", device: user.usualDevice, ip: user.usualIp, city: user.usualCity, metadata: { forcedHour: 3 } }),
  },
  {
    id: "s2",
    title: "Login por novo dispositivo",
    description: "Acesso a partir de dispositivo desconhecido — dispara regra de dispositivo (peso 30).",
    icon: Smartphone,
    level: "baixo",
    run: ({ ingest, user }) =>
      ingest({ userId: user.id, type: "login", device: "Android 14 / Chrome Mobile", ip: user.usualIp, city: user.usualCity }),
  },
  {
    id: "s3",
    title: "Mudança de localização (requer aprovação)",
    description: "Usuário solicita atualização da localização habitual para São Paulo — pendente de aprovação do administrador.",
    icon: MapPin,
    level: "solicitacao",
    run: async ({ requestLocation, user }) => {
      await requestLocation(user.id, "São Paulo, SP", "200.148.12.44", `${user.name} solicita atualização da cidade habitual por mudança de campus.`);
    },
  },
  {
    id: "s4",
    title: "Download em massa",
    description: "38 arquivos baixados em sequência — dispara regra de download (peso 55).",
    icon: Download,
    level: "medio",
    run: ({ ingest, user }) =>
      ingest({ userId: user.id, type: "download", device: user.usualDevice, ip: user.usualIp, city: user.usualCity, count: 38 }),
  },
  {
    id: "s5",
    title: "Alteração de 52 notas",
    description: "Modificação em massa de registros acadêmicos — dispara regra de alteração em massa (peso 65).",
    icon: ClipboardEdit,
    level: "medio",
    run: ({ ingest, user }) =>
      ingest({ userId: user.id, type: "grade_change", device: user.usualDevice, ip: user.usualIp, city: user.usualCity, count: 52 }),
  },
  {
    id: "s6",
    title: "Alteração de usuários",
    description: "Edição de contas fora do fluxo administrativo — dispara regra de usuário (peso 40).",
    icon: UserCog,
    level: "baixo",
    run: ({ ingest, user }) =>
      ingest({ userId: user.id, type: "user_edit", device: user.usualDevice, ip: user.usualIp, city: user.usualCity }),
  },
  {
    id: "s7",
    title: "Sequência rápida de ações",
    description: "12 eventos em menos de um minuto — dispara regra de burst (peso 25).",
    icon: Zap,
    level: "baixo",
    run: async ({ ingest, user }) => {
      for (let i = 0; i < 12; i++) {
        ingest({ userId: user.id, type: "note_view", device: user.usualDevice, ip: user.usualIp, city: user.usualCity });
        await wait(30);
      }
    },
  },
  {
    id: "s8",
    title: "Tentativas repetidas de login",
    description: "5 falhas consecutivas — dispara regra de brute-force (peso 30).",
    icon: ShieldOff,
    level: "baixo",
    run: async ({ ingest, user }) => {
      for (let i = 0; i < 5; i++) {
        ingest({ userId: user.id, type: "login_failed", device: user.usualDevice, ip: user.usualIp, city: user.usualCity });
        await wait(80);
      }
    },
  },
  {
    id: "s9",
    title: "Acesso a área nunca utilizada",
    description: "Entrada em módulo sem histórico — dispara regra de nova área (peso 20).",
    icon: DoorOpen,
    level: "informativo",
    run: ({ ingest, user }) =>
      ingest({ userId: user.id, type: "area_access", device: user.usualDevice, ip: user.usualIp, city: user.usualCity, area: "Financeiro" }),
  },
  {
    id: "s10",
    title: "Exfiltração coordenada",
    description: "Acesso a área confidencial + download massivo a partir de nova cidade — soma de várias regras, resultado crítico com bloqueio automático.",
    icon: Activity,
    level: "critico",
    run: async ({ ingest, user }) => {
      ingest({ userId: user.id, type: "area_access", device: "Linux / Firefox", ip: "104.28.1.1", city: "Fortaleza, CE", area: "Relatórios Confidenciais" });
      await wait(150);
      ingest({ userId: user.id, type: "download", device: "Linux / Firefox", ip: "104.28.1.1", city: "Fortaleza, CE", count: 45 });
    },
  },
  {
    id: "s11",
    title: "Impossible Travel (GeoIP)",
    description: "Login em Recife e, 4 min depois, login em Lisboa — deslocamento fisicamente impossível (peso 90).",
    icon: Plane,
    level: "critico",
    run: async ({ ingest, user }) => {
      ingest({ userId: user.id, type: "login", device: user.usualDevice, ip: "177.85.10.2", city: "Recife, PE" });
      await wait(300);
      ingest({ userId: user.id, type: "login", device: "MacBook / Safari", ip: "85.242.100.11", city: "Lisboa, PT" });
    },
  },
  {
    id: "s12",
    title: "Falha na autenticação MFA",
    description: "Usuário informa códigos MFA inválidos durante ação sensível — dispara regra de MFA (peso 60).",
    icon: KeyRound,
    level: "medio",
    run: async ({ ingest, user }) => {
      ingest({ userId: user.id, type: "mfa_challenge", device: user.usualDevice, ip: user.usualIp, city: user.usualCity, metadata: { action: "grade_change" } });
      await wait(120);
      ingest({ userId: user.id, type: "mfa_failed", device: user.usualDevice, ip: user.usualIp, city: user.usualCity, metadata: { reason: "código inválido", attempts: 3 } });
    },
  },
  {
    id: "s13",
    title: "Escalada de privilégios",
    description: "Conta recebe papel administrativo fora do fluxo de RH — dispara regra de escalada (peso 70).",
    icon: Crown,
    level: "medio",
    run: ({ ingest, user }) =>
      ingest({ userId: user.id, type: "permission_change", device: user.usualDevice, ip: user.usualIp, city: user.usualCity, metadata: { role: "admin", grantedBy: "self" } }),
  },
  {
    id: "s14",
    title: "Alteração fora do calendário",
    description: "Notas alteradas em disciplina já encerrada — dispara regra de calendário (peso 45).",
    icon: CalendarX,
    level: "medio",
    run: ({ ingest, user }) =>
      ingest({ userId: user.id, type: "grade_change", device: user.usualDevice, ip: user.usualIp, city: user.usualCity, count: 8, metadata: { offCalendar: 1, subject: "Matemática 2024/1 (encerrada)" } }),
  },
  {
    id: "s15",
    title: "Sessão excessivamente longa",
    description: "Sessão encerrada após 10h sem reautenticação — dispara regra de sessão (peso 25).",
    icon: Clock,
    level: "informativo",
    run: ({ ingest, user }) =>
      ingest({ userId: user.id, type: "session_end", device: user.usualDevice, ip: user.usualIp, city: user.usualCity, metadata: { durationMin: 612, sessionId: `sess_${Math.random().toString(36).slice(2, 10)}` } }),
  },
];

const levelBadge = (level: Level) => {
  const map: Record<Level, { label: string; cls: string }> = {
    informativo: { label: "INFORMATIVO", cls: "bg-slate-100 text-slate-600 border-slate-200" },
    baixo: { label: "BAIXO", cls: "bg-blue-50 text-blue-700 border-blue-200" },
    medio: { label: "MÉDIO", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    critico: { label: "CRÍTICO", cls: "bg-rose-50 text-rose-700 border-rose-200" },
    solicitacao: { label: "SOLICITAÇÃO", cls: "bg-violet-50 text-violet-700 border-violet-200" },
  };
  const m = map[level];
  return <Badge variant="outline" className={`${m.cls} font-semibold`}>{m.label}</Badge>;
};

function CentralSimulacao() {
  const ingest = useSentinel((s) => s.ingestEvent);
  const requestLocation = useSentinel((s) => s.requestLocationChange);
  const requestUnlock = useSentinel((s) => s.requestUnlock);
  const users = useSentinel((s) => s.users);
  const currentId = useSentinel((s) => s.currentPortalUserId);
  const user = users.find((u) => u.id === currentId) ?? users[0];
  const reset = useSentinel((s) => s.reset);

  const [running, setRunning] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  if (!user) {
    return (
      <PortalShell title="Central de Simulação">
        <div className="text-muted-foreground text-sm">Carregando usuários…</div>
      </PortalShell>
    );
  }

  const trigger = async (s: Scenario) => {
    if (user.blocked && s.level !== "solicitacao") {
      toast.error("Conta bloqueada — solicite a liberação ao superior antes de executar novas ações.");
      return;
    }
    setRunning(s.id);
    try {
      await Promise.resolve(s.run({ ingest, requestLocation, user }));
      if (s.level === "solicitacao") {
        toast.success("Solicitação enviada ao administrador.");
      } else {
        toast.success(`"${s.title}" enviado ao Sentinel.`);
      }
    } finally {
      setRunning(null);
    }
  };

  const runFullScenario = async () => {
    if (user.blocked) {
      toast.error("Conta bloqueada — não é possível executar o cenário completo.");
      return;
    }
    setRunning("full");
    toast.info("Cenário completo iniciado. Acompanhe o console Sentinel.");
    for (const s of SCENARIOS) {
      await Promise.resolve(s.run({ ingest, requestLocation, user }));
      await wait(350);
    }
    setRunning(null);
    toast.success("Cenário completo concluído.");
  };

  const askUnlock = async () => {
    setIsRequesting(true);
    try {
      await requestUnlock(user.id, `${user.name} solicita liberação da conta ao superior imediato.`);
      toast.success("Solicitação de desbloqueio enviada ao superior.");
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <PortalShell title="Central de Simulação">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold">Central de Simulação Institucional</h2>
          <p className="text-sm text-muted-foreground max-w-2xl mt-1">
            Ambiente administrativo para geração controlada de cenários de comportamento. Cada
            ação registra automaticamente um evento auditável no sistema de monitoramento
            institucional. Contas que atingem risco ≥ 90% são bloqueadas automaticamente e exigem
            aprovação do superior para retomar o uso.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Usuário atual: <span className="font-semibold text-foreground">{user.name}</span> — {user.department}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reset}>
            <RotateCcw className="w-4 h-4 mr-2" /> Reiniciar dados
          </Button>
          <Button onClick={runFullScenario} disabled={running !== null || user.blocked} className="bg-primary">
            <PlayCircle className="w-4 h-4 mr-2" />
            {running === "full" ? "Executando cenário…" : "Executar Cenário Completo"}
          </Button>
        </div>
      </div>

      {user.blocked && (
        <Card className="p-4 mb-4 border-destructive/50 bg-destructive/10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-destructive">Conta bloqueada automaticamente</div>
              <p className="text-sm text-muted-foreground mt-1">
                Risco acumulado atingiu {user.currentRisk}% — todas as ações estão suspensas até que
                o superior aprove a liberação no console Sentinel.
              </p>
            </div>
            <Button size="sm" variant="destructive" onClick={askUnlock} disabled={isRequesting}>
              {isRequesting ? "Solicitando..." : "Solicitar liberação ao superior"}
            </Button>
          </div>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SCENARIOS.map((s) => (
          <Card key={s.id} className="p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                <s.icon className="w-5 h-5" />
              </div>
              {levelBadge(s.level)}
            </div>
            <div>
              <div className="font-semibold">{s.title}</div>
              <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
            </div>
            <div className="mt-auto pt-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => trigger(s)}
                disabled={running !== null || (user.blocked && s.level !== "solicitacao")}
              >
                {running === s.id ? "Enviando…" : "Executar ação"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </PortalShell>
  );
}
