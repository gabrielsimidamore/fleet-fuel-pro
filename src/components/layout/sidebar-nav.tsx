import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Truck,
  LayoutDashboard,
  Wrench,
  Calendar,
  ClipboardCheck,
  ShoppingCart,
  Package,
  Tag,
  Users,
  BookOpen,
  BarChart3,
  LogOut,
  Bell,
  Menu,
  UserCog,
  ChevronDown,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

const clientItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/frota", label: "Frota", icon: Truck },
  { to: "/manutencoes", label: "Manutenções", icon: Wrench },
  { to: "/calendario", label: "Calendário", icon: Calendar },
  { to: "/checklist", label: "Checklist", icon: ClipboardCheck },
  { to: "/cotacoes", label: "Cotações", icon: ShoppingCart },
  { to: "/pedidos", label: "Pedidos", icon: Package },
  { to: "/promocoes", label: "Promoções", icon: Tag },
];

const adminItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
  { to: "/admin/pedidos", label: "Pedidos", icon: Package },
  { to: "/admin/catalogo", label: "Catálogo", icon: BookOpen },
  { to: "/admin/promocoes", label: "Promoções", icon: Tag },
  { to: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
];

// ─── Account Change Dialog ─────────────────────────────────────────────────

function AccountDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setSaving(true);
    try {
      const updates: { email?: string; password?: string } = {};
      if (email && email !== user?.email) updates.email = email;
      if (password) updates.password = password;

      if (Object.keys(updates).length === 0) {
        toast.info("Nenhuma alteração detectada.");
        onClose();
        return;
      }

      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;

      toast.success(
        updates.email
          ? "E-mail atualizado! Verifique sua caixa de entrada."
          : "Senha alterada com sucesso!"
      );
      setPassword("");
      setConfirm("");
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar conta.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" /> Alterar conta
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Nova senha</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Deixe em branco para não alterar"
              autoComplete="new-password"
            />
          </div>
          {password && (
            <div className="space-y-1.5">
              <Label>Confirmar senha</Label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repita a nova senha"
                autoComplete="new-password"
              />
            </div>
          )}
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── User Menu ─────────────────────────────────────────────────────────────

function UserMenu() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [accountOpen, setAccountOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <>
      <AccountDialog open={accountOpen} onClose={() => setAccountOpen(false)} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 w-full rounded-md px-2 py-2 text-left transition-colors hover:bg-sidebar-accent/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-primary">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-white truncate">{user?.email}</div>
              <div className="text-[10px] text-sidebar-foreground/60">
                {role === "admin" ? "Administrador" : "Filial"}
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-sidebar-foreground/60 shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-xs font-semibold truncate">{user?.email}</p>
            <p className="text-xs text-muted-foreground">
              {role === "admin" ? "Administrador" : "Cliente"}
            </p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setAccountOpen(true)}
            className="cursor-pointer gap-2"
          >
            <UserCog className="h-4 w-4" />
            Alterar conta
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="cursor-pointer gap-2 text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

// ─── Nav Links ─────────────────────────────────────────────────────────────

function NavLinks({
  items,
  onNavigate,
}: {
  items: typeof clientItems;
  onNavigate?: () => void;
}) {
  const location = useLocation();
  return (
    <>
      {items.map((it) => {
        const active =
          location.pathname === it.to || location.pathname.startsWith(it.to + "/");
        return (
          <Link
            key={it.to}
            to={it.to}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            }`}
          >
            <it.icon className="h-4 w-4 shrink-0" />
            <span>{it.label}</span>
          </Link>
        );
      })}
    </>
  );
}

// ─── Main Layout ──────────────────────────────────────────────────────────

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  const items = role === "admin" ? adminItems : clientItems;
  const [mobileOpen, setMobileOpen] = useState(false);

  const logoBlock = (
    <div className="flex items-center gap-2.5 px-4 py-5 border-b border-sidebar-border shrink-0">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary shrink-0">
        <Truck className="h-5 w-5 text-sidebar-primary-foreground" />
      </div>
      <div>
        <div className="font-semibold text-white leading-none">FleetControl</div>
        <div className="text-[10px] text-sidebar-foreground/60 mt-1">
          {role === "admin" ? "Morelate Admin" : "Cliente"}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        {logoBlock}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <NavLinks items={items} />
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <UserMenu />
        </div>
      </aside>

      {/* ── Mobile Drawer ── */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="p-0 w-72 bg-sidebar text-sidebar-foreground border-sidebar-border [&>button]:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Menu de navegação</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-5 border-b border-sidebar-border">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary shrink-0">
                  <Truck className="h-5 w-5 text-sidebar-primary-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-white leading-none">FleetControl</div>
                  <div className="text-[10px] text-sidebar-foreground/60 mt-1">
                    {role === "admin" ? "Morelate Admin" : "Cliente"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-sidebar-foreground/60 hover:text-white p-1.5 rounded-md transition-colors"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              <NavLinks items={items} onNavigate={() => setMobileOpen(false)} />
            </nav>
            <div className="border-t border-sidebar-border p-3">
              <UserMenu />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-md hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm text-muted-foreground hidden sm:block">
              {role === "admin" ? "Painel administrativo" : "Painel do cliente"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
