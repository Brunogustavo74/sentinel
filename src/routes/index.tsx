import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, GraduationCap, ArrowRight, Activity, Lock, Eye } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-red-500" />
          <span className="font-bold tracking-wide">SENTINEL</span>
          <span className="text-xs text-neutral-400 ml-2 hidden sm:inline">
            Sistema Inteligente de Detecção de Comportamentos Anômalos
          </span>
        </div>
        <div className="text-xs text-neutral-400">Demonstração institucional</div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-16 pb-10">
        <div className="max-w-3xl">
          <div className="text-xs uppercase tracking-widest text-red-400 mb-3">
            Insider Threat Detection
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Dois sistemas. Uma integração em tempo real.
          </h1>
          <p className="mt-4 text-neutral-300 text-lg max-w-2xl">
            O <span className="text-white font-medium">Portal Acadêmico</span> registra a rotina da
            instituição. O <span className="text-white font-medium">Sentinel</span> observa,
            aplica regras determinísticas sobre metadados e explica cada alerta 
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20 grid md:grid-cols-2 gap-6">
        <Link
          to="/portal/login"
          className="group rounded-xl border border-neutral-800 bg-neutral-900/60 hover:border-blue-500/60 hover:bg-neutral-900 transition p-8 flex flex-col"
        >
          <div className="w-12 h-12 rounded-lg bg-blue-500/15 border border-blue-500/40 text-blue-400 flex items-center justify-center mb-5">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="text-xs uppercase tracking-widest text-blue-400 mb-1">Sistema 1</div>
          <h2 className="text-2xl font-semibold">Portal Acadêmico</h2>
          <p className="text-neutral-400 mt-2 text-sm">
            ERP escolar utilizado por professores e funcionários. Cada ação — login, edição de
            notas, download — gera um evento enviado ao Sentinel.
          </p>
          <div className="mt-auto pt-6 flex items-center gap-2 text-blue-400 group-hover:gap-3 transition-all">
            Entrar no Portal <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          to="/sentinel"
          className="group rounded-xl border border-neutral-800 bg-neutral-900/60 hover:border-red-500/60 hover:bg-neutral-900 transition p-8 flex flex-col"
        >
          <div className="w-12 h-12 rounded-lg bg-red-500/15 border border-red-500/40 text-red-400 flex items-center justify-center mb-5">
            <Shield className="w-6 h-6" />
          </div>
          <div className="text-xs uppercase tracking-widest text-red-400 mb-1">Sistema 2</div>
          <h2 className="text-2xl font-semibold">Console Sentinel</h2>
          <p className="text-neutral-400 mt-2 text-sm">
            Recebe eventos em tempo real, calcula pontuação por regras versionadas e abre alertas
            com o motivo detalhado de cada decisão.
          </p>
          <div className="mt-auto pt-6 flex items-center gap-2 text-red-400 group-hover:gap-3 transition-all">
            Abrir console <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-6">
        {[
          {
            icon: Eye,
            title: "Apenas metadados",
            body: "Horário, dispositivo, cidade e tipo de ação — nunca conteúdo de arquivos ou mensagens.",
          },
          {

            
            icon: Activity,
            title: "Tempo real",
            body: "Eventos aparecem no console em segundos. Dashboard e alertas atualizam sozinhos.",
          },
          {
            icon: Lock,
            title: "Explicável",
            body: "Cada alerta lista as regras violadas e o peso de cada uma. Sem caixa-preta.",
          },
        ].map((f) => (
          <div key={f.title} className="rounded-lg border border-neutral-800 p-5">
            <f.icon className="w-5 h-5 text-neutral-400 mb-3" />
            <div className="font-semibold">{f.title}</div>
            <p className="text-sm text-neutral-400 mt-1">{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
