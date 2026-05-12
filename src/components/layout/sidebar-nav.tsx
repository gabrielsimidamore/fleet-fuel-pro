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
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

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

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const items = role === "admin" ? adminItems : clientItems;

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary">
            <Truck className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <div className="font-semibold text-white leading-none">FleetControl</div>
            <div className="text-[10px] text-sidebar-foreground/60 mt-1">{role === "admin" ? "Morelate Admin" : "Cliente"}</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map((it) => {
            const active = location.pathname === it.to || location.pathname.startsWith(it.to + "/");
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                }`}
              >
                <it.icon className="h-4 w-4" />
                <span>{it.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
              {user?.email?.slice(0, 2).toUpperCase() ?? "??"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-white truncate">{user?.email}</div>
              <div className="text-[10px] text-sidebar-foreground/60">{role === "admin" ? "Administrador" : "Filial SP-01"}</div>
            </div>
            <button
              onClick={handleSignOut}
              className="text-sidebar-foreground/60 hover:text-white"
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6">
          <div className="text-sm text-muted-foreground">
            {role === "admin" ? "Painel administrativo" : "Painel do cliente"}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
