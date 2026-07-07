import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  ClipboardList,
  CalendarCheck2,
  FolderOpen,
  MessageSquare,
  BarChart3,
  Settings,
  Shield,
  Bell,
  ChevronDown,
  LogOut,
  ClipboardCheck,
  Menu,
} from "lucide-react";
import { useSentinel } from "@/lib/sentinel-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

const NAV = [
  { to: "/portal", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/portal/turmas", label: "Turmas", icon: BookOpen },
  { to: "/portal/alunos", label: "Alunos", icon: GraduationCap },
  { to: "/portal/professores", label: "Professores", icon: Users },
  { to: "/portal/notas", label: "Notas", icon: ClipboardList },
  { to: "/portal/frequencia", label: "Frequência", icon: CalendarCheck2 },
  { to: "/portal/avaliacoes", label: "Avaliações", icon: ClipboardCheck },
  { to: "/portal/arquivos", label: "Arquivos", icon: FolderOpen },
  { to: "/portal/mensagens", label: "Mensagens", icon: MessageSquare },
  { to: "/portal/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/portal/central-simulacao", label: "Central de Simulação", icon: Shield },
  { to: "/portal/configuracoes", label: "Configurações", icon: Settings },
];

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");
  return (
    <>
      <div className="px-5 py-5 border-b border-sidebar-border/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center font-bold shrink-0">
            CSM
          </div>
          <div className="leading-tight min-w-0">
            <div className="text-xs uppercase tracking-widest opacity-70">Colégio</div>
            <div className="font-bold text-base truncate">São Miguel</div>
            <div className="text-[10px] opacity-60 tracking-wide">SISTEMA ACADÊMICO</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to, item.exact);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-sidebar-border/60 text-xs opacity-70">
        <div>Ano Letivo <span className="font-semibold text-sidebar-foreground">2026</span></div>
        <div>Período <span className="font-semibold text-sidebar-foreground">2º Semestre</span></div>
      </div>
    </>
  );
}

export function PortalShell({ children, title }: { children: ReactNode; title: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const users = useSentinel((s) => s.users);
  const currentId = useSentinel((s) => s.currentPortalUserId);
  const setPortalUser = useSentinel((s) => s.setPortalUser);
  const navigate = useNavigate();
  const currentUser = users.find((u) => u.id === currentId) ?? users[0];
  const [open, setOpen] = useState(false);

  return (
    <div className="theme-portal min-h-screen bg-background text-foreground flex">
      <aside className="hidden lg:flex w-64 shrink-0 bg-sidebar text-sidebar-foreground flex-col border-r border-sidebar-border">
        <SidebarContent pathname={pathname} />
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between gap-3 px-4 sm:px-6 sticky top-0 z-10">
          <div className="flex items-center gap-2 min-w-0">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger className="lg:hidden w-9 h-9 rounded-md hover:bg-muted flex items-center justify-center shrink-0">
                <Menu className="w-5 h-5" />
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 bg-sidebar text-sidebar-foreground border-sidebar-border flex flex-col">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <SidebarContent pathname={pathname} onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
            <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button className="relative w-9 h-9 rounded-md hover:bg-muted flex items-center justify-center">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-muted px-2 py-1 rounded-md">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {currentUser.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left leading-tight max-w-[140px]">
                  <div className="text-sm font-medium text-foreground truncate">{currentUser.name}</div>
                  <div className="text-xs text-muted-foreground capitalize truncate">{currentUser.role}</div>
                </div>
                <ChevronDown className="hidden sm:block w-4 h-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Trocar usuário</DropdownMenuLabel>
                {users.map((u) => (
                  <DropdownMenuItem key={u.id} onClick={() => setPortalUser(u.id)}>
                    {u.name} <span className="ml-auto text-xs text-muted-foreground">{u.role}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setPortalUser(null);
                    navigate({ to: "/portal/login" });
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">{children}</main>
        <footer className="border-t border-border py-3 px-4 sm:px-6 text-xs text-muted-foreground bg-card">
          © 2026 Colégio São Miguel. Todos os direitos reservados. — Versão 2.5.0
        </footer>
      </div>
    </div>
  );
}
