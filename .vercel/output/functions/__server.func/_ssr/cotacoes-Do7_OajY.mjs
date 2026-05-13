import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./card-DIV666p3.mjs";
import { B as Button } from "./button-TjZkfKyC.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { T as Textarea } from "./textarea-DSyJ1nlY.mjs";
import { S as StatusBadge } from "./status-badge-CZ0FBDK6.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { n as useCotacoes, c as usePecas, u as usePromocoes } from "./use-fleet-data-B-90GR8X.mjs";
import { o as Trash2, q as Search, n as Plus, u as Lightbulb } from "../_libs/lucide-react.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
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
const statusMap = {
  pending: "pendente",
  approved: "aprovada",
  rejected: "rejeitada",
  sent: "enviado"
};
function CotacoesPage() {
  const [items, setItems] = reactExports.useState([{
    code: "OL001",
    nome: "Óleo Motor 15W40 5L",
    qtd: 1,
    preco: 35.9
  }, {
    code: "FO001",
    nome: "Filtro de Óleo",
    qtd: 1,
    preco: 45
  }, {
    code: "PF001",
    nome: "Pastilhas de Freio Dianteiras",
    qtd: 1,
    preco: 280
  }]);
  const [q, setQ] = reactExports.useState("");
  const [obs, setObs] = reactExports.useState("");
  const {
    data: cotacoes = [],
    isLoading: loadingC
  } = useCotacoes();
  const {
    data: catalogo = []
  } = usePecas();
  const {
    data: promocoes = []
  } = usePromocoes();
  const results = catalogo.filter((p) => q && (p.name.toLowerCase().includes(q.toLowerCase()) || (p.code ?? "").toLowerCase().includes(q.toLowerCase())));
  const total = items.reduce((s, i) => s + i.qtd * i.preco, 0);
  const addPart = (p) => {
    setItems([...items, {
      code: p.code ?? "",
      nome: p.name,
      qtd: 1,
      preco: Number(p.price ?? 0)
    }]);
    setQ("");
  };
  const aprovar = () => {
    if (!confirm(`Confirma o envio do pedido de R$ ${total.toFixed(2)}?`)) return;
    toast.success("Pedido enviado com sucesso! Você receberá a confirmação em breve.");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Cotações" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Aprove ou rejeite cotações geradas automaticamente" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 overflow-x-auto", children: loadingC ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-4 py-6 text-sm text-muted-foreground", children: "Carregando cotações..." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/40 text-xs text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium", children: "Número" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium", children: "Veículo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium", children: "Data" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 font-medium", children: "Total" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium", children: "Status" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: cotacoes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "px-4 py-6 text-center text-sm text-muted-foreground", children: "Nenhuma cotação encontrada." }) }) : cotacoes.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: c.id.slice(0, 8).toUpperCase() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: c.veiculos ? `${c.veiculos.frota_number} — ${c.veiculos.plate}` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: new Date(c.created_at).toLocaleDateString("pt-BR") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right", children: [
          "R$ ",
          (c.total ?? 0).toFixed(2)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: statusMap[c.status] ?? c.status }) })
      ] }, c.id)) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold mb-4", children: "Nova Cotação" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "📋 Itens" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/40 text-xs text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2 font-medium", children: "Peça" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2 font-medium", children: "Código" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center px-4 py-2 font-medium", children: "Qtd" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-2 font-medium", children: "Preço" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-2 font-medium", children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: items.map((it, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: it.nome }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-muted-foreground", children: it.code }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-7 w-16 mx-auto text-center", type: "number", value: it.qtd, onChange: (e) => setItems(items.map((x, j) => j === i ? {
              ...x,
              qtd: Number(e.target.value)
            } : x)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2 text-right", children: [
              "R$ ",
              it.preco.toFixed(2)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2 text-right font-medium", children: [
              "R$ ",
              (it.qtd * it.preco).toFixed(2)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setItems(items.filter((_, j) => j !== i)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) }) })
          ] }, i)) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "🔍 Adicionar peças do catálogo" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Buscar por nome ou código...", className: "pl-9" })
          ] }),
          results.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 gap-2", children: results.slice(0, 6).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border border-border rounded-md p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: p.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                p.code,
                " · ",
                p.category,
                " · R$ ",
                Number(p.price ?? 0).toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => addPart(p), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3 mr-1" }),
              " Adicionar"
            ] })
          ] }, p.id)) })
        ] })
      ] }),
      promocoes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mb-4 border-info/40 bg-info/5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "h-4 w-4 text-info" }),
          " Você pode precisar também..."
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-4 gap-3", children: promocoes.slice(0, 4).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-info/30 bg-card rounded-md p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: p.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-success font-semibold mt-1", children: [
            "R$ ",
            p.promo_price.toFixed(2)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "w-full mt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3 mr-1" }),
            " Adicionar"
          ] })
        ] }, p.id)) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: obs, onChange: (e) => setObs(e.target.value), rows: 2, placeholder: "Observações..." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-t pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
            items.length,
            " itens"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold", children: [
            "R$ ",
            total.toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 justify-end flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", children: "💾 Salvar Rascunho" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "text-destructive border-destructive/40", children: "❌ Rejeitar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: aprovar, className: "bg-success text-success-foreground hover:bg-success/90", children: "✅ Aprovar e Enviar Pedido" })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  CotacoesPage as component
};
