import { b as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { T as Toaster } from "../_libs/sonner.mjs";
import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
const SUPABASE_URL = "https://tcytmupogtzqhxlydicl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjeXRtdXBvZ3R6cWh4bHlkaWNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MTE5NDMsImV4cCI6MjA5MjI4Nzk0M30.DF3hAN0qKzvbtjODH_M8yrhTZizkTGQyGZU3lqfmtGU";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== "undefined" ? window.localStorage : void 0
  }
});
const supabase$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  supabase
}, Symbol.toStringTag, { value: "Module" }));
const Ctx = reactExports.createContext(null);
function deriveRole(email) {
  if (!email) return "client";
  return email.toLowerCase().endsWith("@morelate.com.br") ? "admin" : "client";
}
function AuthProvider({ children }) {
  const [session, setSession] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message, role: null };
    const role = deriveRole(data.user?.email);
    return { error: null, role };
  };
  const signOut = async () => {
    await supabase.auth.signOut();
  };
  const value = {
    user: session?.user ?? null,
    session,
    role: session?.user ? deriveRole(session.user.email) : null,
    loading,
    signIn,
    signOut
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Ctx.Provider, { value, children });
}
function useAuth() {
  const v = reactExports.useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
const appCss = "/assets/styles-BB2ty0yY.css";
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold", children: "Página não encontrada" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "A página que você procura não existe ou foi movida." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground", children: "Voltar ao início" }) })
  ] }) });
}
function ErrorComponent({ error }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "Algo deu errado" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: error.message })
  ] }) });
}
const Route$h = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FleetControl — Morelate" },
      { name: "description", content: "Gestão de frota e venda consultiva de peças automotivas" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "pt-BR", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$h.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AuthProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { richColors: true, position: "top-right" })
  ] }) });
}
const $$splitComponentImporter$g = () => import("./login-DE9ysMA5.mjs");
const Route$g = createFileRoute("/login")({
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("../_app-Jva3JCe6.mjs");
const Route$f = createFileRoute("/_app")({
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./index-y_S4dEc1.mjs");
const Route$e = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./promocoes-DhSwjAGE.mjs");
const Route$d = createFileRoute("/_app/promocoes")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./pedidos-DSCJ7o9_.mjs");
const Route$c = createFileRoute("/_app/pedidos")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./manutencoes-BGirnXpr.mjs");
const Route$b = createFileRoute("/_app/manutencoes")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./frota-B07D8sBq.mjs");
const Route$a = createFileRoute("/_app/frota")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./dashboard-2URd1GM1.mjs");
const Route$9 = createFileRoute("/_app/dashboard")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./cotacoes-Do7_OajY.mjs");
const Route$8 = createFileRoute("/_app/cotacoes")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./checklist-Jeu3cnkr.mjs");
const Route$7 = createFileRoute("/_app/checklist")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./calendario-CHj5ew7Q.mjs");
const Route$6 = createFileRoute("/_app/calendario")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./relatorios-BYwgInkQ.mjs");
const Route$5 = createFileRoute("/_app/admin/relatorios")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./promocoes-CajOO0Q7.mjs");
const Route$4 = createFileRoute("/_app/admin/promocoes")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./pedidos-dz3nofwD.mjs");
const Route$3 = createFileRoute("/_app/admin/pedidos")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./dashboard-C5y0ehfF.mjs");
const Route$2 = createFileRoute("/_app/admin/dashboard")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./clientes-DlCRJJi4.mjs");
const Route$1 = createFileRoute("/_app/admin/clientes")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./catalogo-CplquplR.mjs");
const Route = createFileRoute("/_app/admin/catalogo")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const LoginRoute = Route$g.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$h
});
const AppRoute = Route$f.update({
  id: "/_app",
  getParentRoute: () => Route$h
});
const IndexRoute = Route$e.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$h
});
const AppPromocoesRoute = Route$d.update({
  id: "/promocoes",
  path: "/promocoes",
  getParentRoute: () => AppRoute
});
const AppPedidosRoute = Route$c.update({
  id: "/pedidos",
  path: "/pedidos",
  getParentRoute: () => AppRoute
});
const AppManutencoesRoute = Route$b.update({
  id: "/manutencoes",
  path: "/manutencoes",
  getParentRoute: () => AppRoute
});
const AppFrotaRoute = Route$a.update({
  id: "/frota",
  path: "/frota",
  getParentRoute: () => AppRoute
});
const AppDashboardRoute = Route$9.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => AppRoute
});
const AppCotacoesRoute = Route$8.update({
  id: "/cotacoes",
  path: "/cotacoes",
  getParentRoute: () => AppRoute
});
const AppChecklistRoute = Route$7.update({
  id: "/checklist",
  path: "/checklist",
  getParentRoute: () => AppRoute
});
const AppCalendarioRoute = Route$6.update({
  id: "/calendario",
  path: "/calendario",
  getParentRoute: () => AppRoute
});
const AppAdminRelatoriosRoute = Route$5.update({
  id: "/admin/relatorios",
  path: "/admin/relatorios",
  getParentRoute: () => AppRoute
});
const AppAdminPromocoesRoute = Route$4.update({
  id: "/admin/promocoes",
  path: "/admin/promocoes",
  getParentRoute: () => AppRoute
});
const AppAdminPedidosRoute = Route$3.update({
  id: "/admin/pedidos",
  path: "/admin/pedidos",
  getParentRoute: () => AppRoute
});
const AppAdminDashboardRoute = Route$2.update({
  id: "/admin/dashboard",
  path: "/admin/dashboard",
  getParentRoute: () => AppRoute
});
const AppAdminClientesRoute = Route$1.update({
  id: "/admin/clientes",
  path: "/admin/clientes",
  getParentRoute: () => AppRoute
});
const AppAdminCatalogoRoute = Route.update({
  id: "/admin/catalogo",
  path: "/admin/catalogo",
  getParentRoute: () => AppRoute
});
const AppRouteChildren = {
  AppCalendarioRoute,
  AppChecklistRoute,
  AppCotacoesRoute,
  AppDashboardRoute,
  AppFrotaRoute,
  AppManutencoesRoute,
  AppPedidosRoute,
  AppPromocoesRoute,
  AppAdminCatalogoRoute,
  AppAdminClientesRoute,
  AppAdminDashboardRoute,
  AppAdminPedidosRoute,
  AppAdminPromocoesRoute,
  AppAdminRelatoriosRoute
};
const AppRouteWithChildren = AppRoute._addFileChildren(AppRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AppRoute: AppRouteWithChildren,
  LoginRoute
};
const routeTree = Route$h._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  supabase$1 as a,
  router as r,
  supabase as s,
  useAuth as u
};
