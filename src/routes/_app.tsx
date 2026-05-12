import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/layout/sidebar-nav";

export const Route = createFileRoute("/_app")({
  component: AppGuard,
});

function AppGuard() {
  const { loading, user } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!user) return <Navigate to="/login" />;
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
