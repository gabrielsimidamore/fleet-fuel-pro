import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { C as Card, a as CardContent } from "./card-DIV666p3.mjs";
import { a as usePedidosDetalhados } from "./use-fleet-data-B-90GR8X.mjs";
import "../_libs/sonner.mjs";
import { k as ShoppingBag, P as Package, l as ChevronUp, e as ChevronDown } from "../_libs/lucide-react.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__query-core.mjs";
import "./router--8MxzGTt.mjs";
import "../_libs/tanstack__react-router.mjs";
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
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
const STATUS_CONFIG = {
  new: {
    label: "Novo",
    className: "bg-blue-100 text-blue-700"
  },
  viewed: {
    label: "Visualizado",
    className: "bg-gray-100 text-gray-700"
  },
  processing: {
    label: "Em separação",
    className: "bg-yellow-100 text-yellow-800"
  },
  shipped: {
    label: "Enviado",
    className: "bg-purple-100 text-purple-700"
  },
  delivered: {
    label: "Entregue",
    className: "bg-green-100 text-green-700"
  }
};
function PedidosPage() {
  const {
    data: pedidos = [],
    isLoading
  } = usePedidosDetalhados();
  const [expanded, setExpanded] = reactExports.useState(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Pedidos" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Pedidos de reposição de peças gerados pelas manutenções" })
    ] }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando pedidos..." }),
    !isLoading && pedidos.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-col items-center gap-3 py-12 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-10 w-10" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: "Nenhum pedido encontrado" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm mt-1", children: "Os pedidos são gerados automaticamente ao registrar uma manutenção com peças." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: pedidos.map((p) => {
      const isOpen = expanded === p.id;
      const st = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.new;
      const items = p.items ?? [];
      const pExt = p;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors", onClick: () => setExpanded(isOpen ? null : p.id), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-5 w-5 text-muted-foreground shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-xs font-semibold", children: [
                "# ",
                p.id.slice(0, 8).toUpperCase()
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${st.className}`, children: st.label })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
              p.veiculos ? `${p.veiculos.frota_number} — ${p.veiculos.plate}` : "—",
              pExt.manutencoes ? ` · ${pExt.manutencoes.type}` : "",
              ` · ${new Date(p.created_at).toLocaleDateString("pt-BR")}`
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-sm", children: [
              "R$ ",
              (p.total ?? 0).toFixed(2)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              items.length,
              " ",
              items.length === 1 ? "item" : "itens"
            ] })
          ] }),
          isOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4 shrink-0 text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 shrink-0 text-muted-foreground" })
        ] }),
        isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border px-4 py-4 space-y-4", children: [
          pExt.manutencoes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground bg-muted/40 rounded p-2", children: [
            "Gerado pela manutenção: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: pExt.manutencoes.type }),
            " em ",
            new Date(pExt.manutencoes.date).toLocaleDateString("pt-BR")
          ] }),
          items.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-muted-foreground mb-2", children: "Peças do pedido" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm min-w-[400px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/40 text-xs text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2", children: "Peça" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2", children: "Código" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center px-3 py-2", children: "Qtd" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-3 py-2", children: "Preço un." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-3 py-2", children: "Total" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: items.map((it, i) => {
                const preco = it.preco ?? it.price ?? 0;
                const qtd = it.qtd ?? 1;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: it.nome ?? it.name ?? "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-mono text-xs text-muted-foreground", children: it.cod ?? "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-center", children: qtd }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-right", children: [
                    "R$ ",
                    preco.toFixed(2)
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-right font-semibold", children: [
                    "R$ ",
                    (qtd * preco).toFixed(2)
                  ] })
                ] }, i);
              }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t-2 border-border", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 4, className: "px-3 py-2 text-right font-semibold", children: "Total" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-right font-bold", children: [
                  "R$ ",
                  (p.total ?? 0).toFixed(2)
                ] })
              ] }) })
            ] }) })
          ] }),
          p.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground bg-muted/40 rounded p-2", children: p.notes })
        ] })
      ] }, p.id);
    }) })
  ] });
}
export {
  PedidosPage as component
};
