import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error, role } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Bem-vindo!");
    navigate({ to: role === "admin" ? "/admin/dashboard" : "/dashboard" });
  };

  return (
    <div className="min-h-screen flex bg-sidebar">
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-info/10" />
        <div className="relative max-w-md text-sidebar-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Truck className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="text-2xl font-bold text-white">FleetControl</div>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Gestão inteligente de frota e peças.
          </h1>
          <p className="mt-4 text-sidebar-foreground/70">
            Plataforma da Morelate para o Grupo Sabedoria. Acompanhe revisões, gere cotações automáticas e aprove pedidos com poucos cliques.
          </p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-background p-6">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-6">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="text-xl font-bold">FleetControl</div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Entrar na sua conta</h2>
            <p className="text-sm text-muted-foreground mt-1">Use suas credenciais corporativas.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com.br" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
          <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
            <div className="font-medium text-foreground">Usuários de teste (crie no Supabase Auth):</div>
            <div>• admin@morelate.com.br / Admin@2026 → painel admin</div>
            <div>• sp@gruposabedoria.com.br / Cliente@2026 → painel cliente</div>
          </div>
        </form>
      </div>
    </div>
  );
}
