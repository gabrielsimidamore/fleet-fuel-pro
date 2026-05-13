import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { C as Card, a as CardContent } from "./card-DIV666p3.mjs";
import { B as Button } from "./button-TjZkfKyC.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent, B as Badge } from "./badge-B5YwArNR.mjs";
import { S as Sheet, a as SheetContent, b as SheetHeader, c as SheetTitle } from "./sheet-BDNKAvnQ.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-BIFlszXI.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-B91GfZkm.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { c as usePecas, r as uploadPecaFoto, s as updatePeca, g as fleetKeys, t as insertPeca } from "./use-fleet-data-B-90GR8X.mjs";
import { n as Plus, I as Image, E as Eye, G as Upload } from "../_libs/lucide-react.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
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
import "../_libs/supabase__functions-js.mjs";
const CATEGORIAS = ["Lubrificantes", "Filtros", "Freios", "Motor", "Transmissão", "Pneus", "Elétrica", "Outros"];
const aguardando = [{
  code: "—",
  nome: "Bomba d'água VW",
  marca: "Bosch",
  ref: "BWP-9012",
  filial: "MG-01"
}, {
  code: "—",
  nome: "Sensor de ABS",
  marca: "Continental",
  ref: "CTL-AB55",
  filial: "RJ-01"
}];
function CatalogoPage() {
  const [tab, setTab] = reactExports.useState("ativo");
  const {
    data: pecas = []
  } = usePecas();
  const qc = useQueryClient();
  const [detail, setDetail] = reactExports.useState(null);
  const [editOpen, setEditOpen] = reactExports.useState(false);
  const [editTarget, setEditTarget] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({
    code: "",
    name: "",
    description: "",
    category: "",
    price: "",
    interval_km: "",
    interval_months: ""
  });
  const [uploading, setUploading] = reactExports.useState(false);
  const [previewUrl, setPreviewUrl] = reactExports.useState(null);
  const fileRef = reactExports.useRef(null);
  const detailFileRef = reactExports.useRef(null);
  const setF = (k, v) => setForm((f) => ({
    ...f,
    [k]: v
  }));
  const openEdit = (p) => {
    setEditTarget(p ?? null);
    setForm({
      code: p?.code ?? "",
      name: p?.name ?? "",
      description: p?.description ?? "",
      category: p?.category ?? "",
      price: String(p?.price ?? ""),
      interval_km: String(p?.interval_km ?? ""),
      interval_months: String(p?.interval_months ?? "")
    });
    setPreviewUrl(p?.image_url ?? null);
    setEditOpen(true);
  };
  const handleFileSelect = (e, targetId) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      setPreviewUrl(reader.result);
      if (targetId) {
        setUploading(true);
        try {
          const url = await uploadPecaFoto(file, targetId);
          await updatePeca(targetId, {
            image_url: url
          });
          await qc.invalidateQueries({
            queryKey: fleetKeys.pecas
          });
          if (detail?.id === targetId) setDetail((d) => d ? {
            ...d,
            image_url: url
          } : d);
          toast.success("Foto atualizada!");
        } catch {
          toast.error("Erro ao fazer upload.");
        } finally {
          setUploading(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) {
      toast.error("Nome é obrigatório.");
      return;
    }
    setUploading(true);
    try {
      let imageUrl;
      if (fileRef.current?.files?.[0] && !editTarget) {
        const tmpId = crypto.randomUUID();
        imageUrl = await uploadPecaFoto(fileRef.current.files[0], tmpId);
      }
      const payload = {
        code: form.code || void 0,
        name: form.name,
        description: form.description || void 0,
        category: form.category || void 0,
        price: form.price ? Number(form.price) : void 0,
        interval_km: form.interval_km ? Number(form.interval_km) : void 0,
        interval_months: form.interval_months ? Number(form.interval_months) : void 0,
        image_url: imageUrl
      };
      if (editTarget) {
        await updatePeca(editTarget.id, payload);
        if (fileRef.current?.files?.[0]) {
          const url = await uploadPecaFoto(fileRef.current.files[0], editTarget.id);
          await updatePeca(editTarget.id, {
            image_url: url
          });
        }
      } else {
        await insertPeca(payload);
      }
      await qc.invalidateQueries({
        queryKey: fleetKeys.pecas
      });
      toast.success(editTarget ? "Peça atualizada!" : "Peça criada!");
      setEditOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setUploading(false);
    }
  };
  const categoryColor = {
    Lubrificantes: "bg-blue-100 text-blue-700",
    Filtros: "bg-green-100 text-green-700",
    Freios: "bg-red-100 text-red-700",
    Motor: "bg-orange-100 text-orange-700",
    Transmissão: "bg-gray-100 text-gray-700",
    Pneus: "bg-purple-100 text-purple-700",
    Elétrica: "bg-yellow-100 text-yellow-700",
    Outros: "bg-slate-100 text-slate-700"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start flex-wrap gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Catálogo de Peças" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Gerencie peças e precificações" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => openEdit(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
        " Nova Peça"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: tab, onValueChange: setTab, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "ativo", children: "Catálogo Ativo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "aguardando", children: [
          "Aguardando Precificação ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-yellow-400 text-yellow-900 text-[10px] font-bold", children: aguardando.length })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "ativo", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm min-w-[640px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/40 text-xs text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 w-16", children: "Foto" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3", children: "Código" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3", children: "Nome" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3", children: "Categoria" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3", children: "Preço" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3", children: "Ações" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: pecas.map((p) => {
          const pp = p;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border hover:bg-muted/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: pp.image_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: pp.image_url, alt: p.name, className: "h-10 w-10 rounded object-cover border" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-4 w-4 text-muted-foreground" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-xs", children: p.code ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: p.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor[p.category ?? ""] ?? "bg-slate-100 text-slate-700"}`, children: p.category ?? "—" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right", children: [
              "R$ ",
              (p.price ?? 0).toFixed(2)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right space-x-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setDetail(pp), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5 mr-1" }),
                "Ver"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => openEdit(pp), children: "Editar" })
            ] })
          ] }, p.id);
        }) })
      ] }) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "aguardando", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-yellow-300", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm min-w-[500px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-yellow-50 text-xs text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3", children: "Nome" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3", children: "Marca" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3", children: "Ref." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3", children: "Filial" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3", children: "Ações" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: aguardando.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: p.nome }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: p.marca }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: p.ref }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: p.filial }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => {
            setF("name", p.nome);
            openEdit();
          }, children: "Adicionar ao Catálogo" }) })
        ] }, i)) })
      ] }) }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open: !!detail, onOpenChange: () => setDetail(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { className: "w-full sm:max-w-lg overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SheetHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: detail?.name }) }),
      detail && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-lg overflow-hidden bg-muted aspect-video flex items-center justify-center group", children: [
          detail.image_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: detail.image_url, alt: detail.name, className: "w-full h-full object-contain" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2 text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-12 w-12" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Sem foto" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => detailFileRef.current?.click(), className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-5 w-5" }),
            " ",
            uploading ? "Enviando..." : "Trocar foto"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: detailFileRef, type: "file", accept: "image/*", className: "hidden", onChange: (e) => {
            if (e.target.files?.[0]) handleFileSelect(e, detail.id);
          } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded-lg p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Código" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono font-medium mt-0.5", children: detail.code ?? "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded-lg p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Categoria" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "mt-0.5", children: detail.category ?? "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded-lg p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Preço" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-lg mt-0.5", children: [
              "R$ ",
              (detail.price ?? 0).toFixed(2)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded-lg p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Unidade" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium mt-0.5", children: detail.unit ?? "un" })
          ] }),
          detail.interval_km && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded-lg p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Intervalo KM" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium mt-0.5", children: [
              detail.interval_km.toLocaleString("pt-BR"),
              " km"
            ] })
          ] }),
          detail.interval_months && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded-lg p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Intervalo Meses" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium mt-0.5", children: [
              detail.interval_months,
              " meses"
            ] })
          ] })
        ] }),
        detail.description && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded-lg p-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mb-1", children: "Descrição" }),
          detail.description
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "flex-1", onClick: () => {
            setDetail(null);
            openEdit(detail);
          }, children: "Editar Peça" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDetail(null), children: "Fechar" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: editOpen, onOpenChange: setEditOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editTarget ? "Editar Peça" : "Nova Peça" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSave, className: "space-y-4 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => fileRef.current?.click(), className: "relative cursor-pointer border-2 border-dashed border-muted-foreground/30 rounded-lg h-32 flex items-center justify-center overflow-hidden hover:border-primary/50 transition-colors", children: [
          previewUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: previewUrl, className: "h-full w-full object-contain", alt: "preview" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1 text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-6 w-6" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "Clique para adicionar foto" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileRef, type: "file", accept: "image/*", className: "hidden", onChange: (e) => handleFileSelect(e) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Código" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.code, onChange: (e) => setF("code", e.target.value), placeholder: "OL001" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Categoria" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.category, onValueChange: (v) => setF("category", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Categoria" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CATEGORIAS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nome *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.name, onChange: (e) => setF("name", e.target.value), placeholder: "Nome da peça" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Descrição" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.description, onChange: (e) => setF("description", e.target.value), placeholder: "Descrição" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Preço (R$)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.price, onChange: (e) => setF("price", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Intervalo KM" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.interval_km, onChange: (e) => setF("interval_km", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Intervalo Meses" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.interval_months, onChange: (e) => setF("interval_months", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 justify-end pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setEditOpen(false), children: "Cancelar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: uploading, children: uploading ? "Salvando..." : editTarget ? "Salvar" : "Criar Peça" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  CatalogoPage as component
};
