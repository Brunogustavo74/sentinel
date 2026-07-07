import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  AlertTriangle,
  Users,
  Activity,
  UserSearch,
  Plug,
  Scale,
  FileBarChart2,
  ScrollText,
  Settings,
  Shield,
  Bell,
  Search,
  Inbox,
  Menu,
} from "lucide-react";
import { useSentinel } from "@/lib/sentinel-store";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { AccessibilityPanel } from "./AccessibilityPanel";

const NAV = [
  { to: "/sentinel", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/sentinel/alertas", label: "Alertas", icon: AlertTriangle },
  { to: "/sentinel/solicitacoes", label: "Solicitações", icon: Inbox },
  { to: "/sentinel/usuarios", label: "Usuários", icon: Users },
  { to: "/sentinel/eventos", label: "Eventos", icon: Activity },
  { to: "/sentinel/perfis", label: "Perfis Comportamentais", icon: UserSearch },
  { to: "/sentinel/integracoes", label: "Integrações", icon: Plug },
  { to: "/sentinel/regras", label: "Regras", icon: Scale },
  { to: "/sentinel/relatorios", label: "Relatórios", icon: FileBarChart2 },
  { to: "/sentinel/logs", label: "Logs", icon: ScrollText },
  { to: "/sentinel/configuracoes", label: "Configurações", icon: Settings },
];

function NavList({ pathname, openAlerts, onNavigate }: { pathname: string; openAlerts: number; onNavigate?: () => void }) {
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");
  return (
    <>
      <div className="px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-primary/15 border border-primary/40 text-primary flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="leading-tight min-w-0">
            <div className="font-bold text-base tracking-wide">SENTINEL</div>
            <div className="text-[10px] text-sidebar-foreground/60 tracking-wide truncate">
              DETECÇÃO DE COMPORTAMENTOS ANÔMALOS
            </div>
          </div>
        </div>
      </div>
      <nav aria-label="Navegação principal" className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to, item.exact);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
              {item.to === "/sentinel/alertas" && openAlerts > 0 && (
                <span
                  aria-label={`${openAlerts} alertas abertos`}
                  className="ml-auto bg-destructive text-destructive-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded"
                >
                  {openAlerts}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-sidebar-border text-[10px] text-sidebar-foreground/50">
        v1.0 • Motor de regras determinístico • Sem IA
      </div>
    </>
  );
}

export function SentinelShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const openAlerts = useSentinel((s) => s.alerts.filter((a) => a.status === "aberto").length);
  const [open, setOpen] = useState(false);

  return (
    <div className="theme-sentinel min-h-dvh bg-background text-foreground flex">
      <a href="#sentinel-main" className="a11y-skip-link">
        Pular para o conteúdo
      </a>
      <aside
        aria-label="Menu lateral"
        className="hidden lg:flex w-60 shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex-col"
      >
        <NavList pathname={pathname} openAlerts={openAlerts} />
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between gap-3 px-4 sm:px-6 sticky top-0 z-10">
          <div className="flex items-center gap-2 min-w-0">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                aria-label="Abrir menu de navegação"
                className="lg:hidden w-11 h-11 rounded-md hover:bg-muted flex items-center justify-center shrink-0"
              >
                <Menu className="w-5 h-5" aria-hidden="true" />
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 bg-sidebar text-sidebar-foreground border-sidebar-border flex flex-col">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <NavList pathname={pathname} openAlerts={openAlerts} onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">{title}</h1>
              {subtitle && <p className="hidden sm:block text-xs text-muted-foreground truncate">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="relative hidden xl:block">
              <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <label htmlFor="sentinel-global-search" className="sr-only">Buscar</label>
              <Input
                id="sentinel-global-search"
                placeholder="Buscar eventos, usuários, alertas…"
                className="pl-8 w-72 bg-muted/40 border-border"
              />
            </div>
            <button
              type="button"
              aria-label={`Notificações${openAlerts > 0 ? ` — ${openAlerts} alertas abertos` : ""}`}
              className="relative w-11 h-11 rounded-md hover:bg-muted flex items-center justify-center"
            >
              <Bell className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
              {openAlerts > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold flex items-center justify-center"
                >
                  {openAlerts}
                </span>
              )}
            </button>
            <Link
              to="/portal"
              className="hidden sm:inline-block text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted text-muted-foreground whitespace-nowrap"
            >
              Portal Acadêmico ↗
            </Link>
          </div>
        </header>
        <main id="sentinel-main" tabIndex={-1} className="flex-1 p-4 sm:p-6 overflow-x-hidden focus:outline-none">
          {children}
        </main>
      </div>

      <AccessibilityPanel />
    </div>
  );
}
