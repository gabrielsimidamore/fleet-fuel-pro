import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { C as Card, a as CardContent } from "./card-DIV666p3.mjs";
import { B as Button } from "./button-TjZkfKyC.mjs";
import { S as StatusBadge } from "./status-badge-CZ0FBDK6.mjs";
import { v as veiculos } from "./mock-data-CJ0Tj9Am.mjs";
import { v as ChevronLeft, h as ChevronRight, T as Truck } from "../_libs/lucide-react.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
function CalendarioPage() {
  const [refDate, setRefDate] = reactExports.useState(new Date(2026, 4, 1));
  const year = refDate.getFullYear();
  const month = refDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({
    length: daysInMonth
  }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  const eventsByDay = {};
  veiculos.forEach((v) => {
    const d = new Date(v.nextDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      eventsByDay[day] = [...eventsByDay[day] ?? [], v];
    }
  });
  const upcoming = [...veiculos].sort((a, b) => a.nextDate.localeCompare(b.nextDate)).slice(0, 6);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Calendário" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Próximas revisões e manutenções" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", onClick: () => setRefDate(new Date(year, month - 1, 1)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium px-3 capitalize", children: refDate.toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric"
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", onClick: () => setRefDate(new Date(year, month + 1, 1)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setRefDate(/* @__PURE__ */ new Date()), children: "Hoje" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-success" }),
        " Realizada"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-warning" }),
        " Próxima"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-destructive" }),
        " Vencida"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[1fr_320px] gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 text-xs font-medium text-muted-foreground mb-2", children: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 py-1", children: d }, d)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 gap-1", children: cells.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square border border-border rounded-md p-1.5 text-xs", children: d && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: d }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-0.5 mt-1", children: (eventsByDay[d] ?? []).slice(0, 2).map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `px-1 py-0.5 rounded text-[10px] truncate flex items-center gap-1 ${v.status === "vencido" ? "bg-destructive/15 text-destructive" : v.status === "atencao" ? "bg-warning/15 text-warning-foreground" : "bg-success/15 text-success"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-2.5 w-2.5" }),
            " ",
            v.frota
          ] }, v.id)) })
        ] }) }, i)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold mb-3", children: "Próximas (30 dias)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: upcoming.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between border-b border-border pb-2 last:border-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-medium", children: [
              v.frota,
              " — ",
              v.model
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: v.nextType }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: new Date(v.nextDate).toLocaleDateString("pt-BR") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: v.status })
        ] }, v.id)) })
      ] }) })
    ] })
  ] });
}
export {
  CalendarioPage as component
};
