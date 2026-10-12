import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { PublicShell } from "@/components/layout/PublicShell";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { adminExists, claimFirstAdmin } from "@/lib/admin-users.functions";

type AuthSearch = { redirect?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): AuthSearch => ({
    redirect: typeof s["redirect"] === "string" && s["redirect"].startsWith("/") ? s["redirect"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Entrar — Kero Mais" },
      { name: "description", content: "Acesse sua conta Kero Mais ou o painel da equipe." },
      { property: "og:title", content: "Entrar — Kero Mais" },
      { property: "og:description", content: "Acesse sua conta Kero Mais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const checkAdmin = useServerFn(adminExists);
  const claim = useServerFn(claimFirstAdmin);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [noAdmin, setNoAdmin] = React.useState(false);
  const [signedIn, setSignedIn] = React.useState(false);

  React.useEffect(() => {
    void checkAdmin().then((r) => setNoAdmin(!r.exists)).catch(() => undefined);
    void supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
  }, [checkAdmin]);

  async function afterLogin() {
    void navigate({ to: redirect ?? "/admin" });
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message);
    setSignedIn(true);
    if (!noAdmin) await afterLogin();
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return toast.error("A senha deve ter pelo menos 8 caracteres.");
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { emailRedirectTo: `${window.location.origin}/auth`, data: { name } },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (!data.session) toast.success("Enviamos um link de confirmação para o seu e-mail.");
    else setSignedIn(true);
  }

  async function becomeAdmin() {
    setBusy(true);
    try {
      await claim();
      toast.success("Você agora é o administrador da Kero Mais.");
      setNoAdmin(false);
      await afterLogin();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <PublicShell>
      <div className="mx-auto max-w-md space-y-8 px-4 py-16">
        <SectionTitle eyebrow="Conta" title="Entrar" align="center" />

        {signedIn && noAdmin ? (
          <div className="space-y-4 rounded-2xl border bg-card p-6 text-center">
            <p className="font-semibold">Primeiro acesso ao painel</p>
            <p className="text-sm text-muted-foreground">
              Ainda não existe administrador. Assuma esta função com a conta atual.
            </p>
            <Button className="w-full" disabled={busy} onClick={() => void becomeAdmin()}>
              Tornar-me administrador
            </Button>
          </div>
        ) : signedIn ? (
          <div className="space-y-3 rounded-2xl border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">Você já está conectado.</p>
            <Button className="w-full" onClick={() => void afterLogin()}>Ir para o painel</Button>
          </div>
        ) : (
          <Tabs defaultValue="login" className="rounded-2xl border bg-card p-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={signIn} className="mt-4 space-y-4">
                <div className="space-y-1.5"><Label htmlFor="l-email">E-mail</Label><Input id="l-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div className="space-y-1.5"><Label htmlFor="l-pass">Senha</Label><Input id="l-pass" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                <Button type="submit" className="w-full" disabled={busy}>{busy ? "Entrando..." : "Entrar"}</Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={signUp} className="mt-4 space-y-4">
                <div className="space-y-1.5"><Label htmlFor="s-name">Nome</Label><Input id="s-name" required value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div className="space-y-1.5"><Label htmlFor="s-email">E-mail</Label><Input id="s-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div className="space-y-1.5"><Label htmlFor="s-pass">Senha (mín. 8 caracteres)</Label><Input id="s-pass" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                <Button type="submit" className="w-full" disabled={busy}>{busy ? "Criando..." : "Criar conta"}</Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PublicShell>
  );
}
