import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSentinel } from "@/lib/sentinel-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap } from "lucide-react";

export const Route = createFileRoute("/portal/login")({
  component: PortalLogin,
});

function PortalLogin() {
  const users = useSentinel((s) => s.users);
  const setPortalUser = useSentinel((s) => s.setPortalUser);
  const ingest = useSentinel((s) => s.ingestEvent);
  const navigate = useNavigate();
  const [email, setEmail] = useState("joao.silva@escola.edu.br");
  const [password, setPassword] = useState("••••••••");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) ?? users[0];
    setPortalUser(user.id);
    ingest({
      userId: user.id,
      type: "login",
      device: user.usualDevice,
      ip: user.usualIp,
      city: user.usualCity,
    });
    navigate({ to: "/portal" });
  };

  return (
    <div className="theme-portal min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Colégio</div>
              <div className="text-xl font-bold">São Miguel</div>
            </div>
          </div>
          <h1 className="text-2xl font-semibold">Portal Acadêmico</h1>
          <p className="text-sm text-muted-foreground mt-1">Acesse sua conta institucional</p>
        </div>

        <form onSubmit={submit} className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <button type="button" className="text-xs text-primary hover:underline">
                Esqueci minha senha
              </button>
            </div>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full">Entrar</Button>
          <div className="text-xs text-muted-foreground text-center pt-2">
            Demonstração: use qualquer e-mail da lista de usuários ou clique em Entrar.
          </div>
        </form>

        <div className="text-center text-xs text-muted-foreground mt-6">
          © 2026 Colégio São Miguel • Sistema Acadêmico Institucional
        </div>
      </div>
    </div>
  );
}
