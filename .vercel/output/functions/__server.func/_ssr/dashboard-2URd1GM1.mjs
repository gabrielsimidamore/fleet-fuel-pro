import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-DIV666p3.mjs";
import { B as Button } from "./button-TjZkfKyC.mjs";
import { S as StatusBadge } from "./status-badge-CZ0FBDK6.mjs";
import { h as useVeiculos, k as useGastosMensais, l as usePecasCategoria, m as useKmMedio, u as usePromocoes, n as useCotacoes } from "./use-fleet-data-B-90GR8X.mjs";
import "../_libs/sonner.mjs";
import { T as Truck, r as CircleCheck, s as TriangleAlert, t as CircleX, S as ShoppingCart, D as DollarSign, a as Tag } from "../_libs/lucide-react.mjs";
import { R as ResponsiveContainer, B as BarChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, a as Bar, P as PieChart, b as Pie, c as Cell, L as LineChart, d as Line } from "../_libs/recharts.mjs";
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
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__query-core.mjs";
import "./router--8MxzGTt.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/lodash.mjs";
import "../_libs/react-smooth.mjs";
import "../_libs/prop-types.mjs";
import "../_libs/fast-equals.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/react-is.mjs";
import "../_libs/d3-shape.mjs";
import "../_libs/d3-path.mjs";
import "../_libs/victory-vendor.mjs";
import "../_libs/d3-scale.mjs";
import "../_libs/internmap.mjs";
import "../_libs/d3-array.mjs";
import "../_libs/d3-time-format.mjs";
import "../_libs/d3-time.mjs";
import "../_libs/d3-interpolate.mjs";
import "../_libs/d3-color.mjs";
import "../_libs/d3-format.mjs";
import "../_libs/recharts-scale.mjs";
import "../_libs/decimal.js-light.mjs";
import "../_libs/eventemitter3.mjs";
const KPI = ({
  icon: Icon,
  label,
  value,
  tone
}) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 flex items-center gap-4", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex h-11 w-11 items-center justify-center rounded-lg ${tone}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wide text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold mt-0.5", children: value })
  ] })
] }) });
function DashboardPage() {
  const {
    data: veiculos = [],
    isLoading: loadingV
  } = useVeiculos();
  const {
    data: gastosMensais = []
  } = useGastosMensais();
  const {
    data: pecasCategoria = []
  } = usePecasCategoria();
  const {
    data: kmMedio = []
  } = useKmMedio();
  const {
    data: promocoes = []
  } = usePromocoes();
  const {
    data: cotacoes = []
  } = useCotacoes();
  const total = veiculos.length;
  const emDia = veiculos.filter((v) => v.statusDisplay === "em_dia").length;
  const atencao = veiculos.filter((v) => v.statusDisplay === "atencao").length;
  const vencidos = veiculos.filter((v) => v.statusDisplay === "vencido").length;
  const gastoMes = gastosMensais.at(-1)?.valor ?? 0;
  const gastoMesStr = gastoMes >= 1e3 ? `R$ ${(gastoMes / 1e3).toFixed(1)}k` : `R$ ${gastoMes.toFixed(0)}`;
  const proximas = [...veiculos].filter((v) => v.nextDate).sort((a, b) => (a.nextDate ?? "").localeCompare(b.nextDate ?? "")).slice(0, 5);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Visão geral da sua filial" })
    ] }),
    loadingV ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Carregando dados..." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KPI, { icon: Truck, label: "Total Veículos", value: String(total), tone: "bg-info/15 text-info" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KPI, { icon: CircleCheck, label: "Em Dia", value: String(emDia), tone: "bg-success/15 text-success" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KPI, { icon: TriangleAlert, label: "Atenção", value: String(atencao), tone: "bg-warning/15 text-warning-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KPI, { icon: CircleX, label: "Vencidos", value: String(vencidos), tone: "bg-destructive/15 text-destructive" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KPI, { icon: ShoppingCart, label: "Cotações", value: String(cotacoes.length), tone: "bg-orange-500/15 text-orange-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KPI, { icon: DollarSign, label: "Gasto Mês", value: gastoMesStr, tone: "bg-purple-500/15 text-purple-600" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Gastos mensais em peças (R$)" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 260, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: gastosMensais.length ? gastosMensais : [{
            mes: "—",
            valor: 0
          }], children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "mes", stroke: "var(--muted-foreground)", fontSize: 12 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { stroke: "var(--muted-foreground)", fontSize: 12 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "valor", fill: "var(--primary)", radius: [6, 6, 0, 0] })
          ] }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Peças por categoria" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 260, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: pecasCategoria, dataKey: "value", nameKey: "name", cx: "50%", cy: "50%", innerRadius: 50, outerRadius: 90, children: pecasCategoria.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: p.fill }, i)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8
              } })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2 mt-3 text-xs", children: pecasCategoria.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full", style: {
                background: p.fill
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: p.name })
            ] }, p.name)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "KM médio por mês" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 240, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: kmMedio.length ? kmMedio : [{
            mes: "—",
            km: 0
          }], children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "mes", stroke: "var(--muted-foreground)", fontSize: 12 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { stroke: "var(--muted-foreground)", fontSize: 12 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "km", stroke: "var(--primary)", strokeWidth: 2, dot: {
              r: 4
            } })
          ] }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Próximas manutenções" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "px-0 overflow-x-auto", children: proximas.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-6 py-4 text-sm text-muted-foreground", children: "Nenhuma manutenção agendada." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm min-w-[400px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-6 py-2 font-medium", children: "Veículo" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-2 py-2 font-medium", children: "Tipo" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-2 py-2 font-medium", children: "Data" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-6 py-2 font-medium", children: "Status" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: proximas.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border last:border-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-2.5 font-medium", children: v.frota_number }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2.5 text-muted-foreground", children: v.nextType ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2.5 text-muted-foreground", children: v.nextDate ? new Date(v.nextDate).toLocaleDateString("pt-BR") : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: v.statusDisplay }) })
            ] }, v.id)) })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "h-4 w-4 text-primary" }),
            " Promoções da semana"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/promocoes", className: "text-xs text-primary hover:underline", children: "Ver todas" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: promocoes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhuma promoção ativa no momento." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-3 gap-4", children: promocoes.slice(0, 3).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-card p-4 flex flex-col", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-video rounded-md bg-gradient-to-br from-muted to-accent mb-3 flex items-center justify-center text-muted-foreground text-xs", children: p.pecas?.category ?? "Peça" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: p.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-baseline gap-2", children: [
            p.original_price != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground line-through", children: [
              "R$ ",
              p.original_price.toFixed(2)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-lg font-bold text-success", children: [
              "R$ ",
              p.promo_price.toFixed(2)
            ] }),
            p.discount_percent != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-xs font-semibold text-orange-600 bg-orange-500/10 px-1.5 py-0.5 rounded", children: [
              "-",
              Number(p.discount_percent),
              "%"
            ] })
          ] }),
          p.valid_until && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
            "Válida até ",
            new Date(p.valid_until).toLocaleDateString("pt-BR")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "mt-3", children: "Adicionar ao Pedido" })
        ] }, p.id)) }) })
      ] })
    ] })
  ] });
}
export {
  DashboardPage as component
};
