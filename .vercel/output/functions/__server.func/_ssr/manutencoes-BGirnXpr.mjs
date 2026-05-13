import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-DIV666p3.mjs";
import { B as Button } from "./button-TjZkfKyC.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { T as Textarea } from "./textarea-DSyJ1nlY.mjs";
import { S as Switch } from "./switch-CQ4rbtn8.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-B91GfZkm.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent, B as Badge } from "./badge-B5YwArNR.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { b as useVeiculosList, c as usePecas, d as useManutencoesList, i as insertManutencao, e as uploadManutencaoFoto, f as insertPedidoSugerido, g as fleetKeys } from "./use-fleet-data-B-90GR8X.mjs";
import { u as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { m as ClipboardList, b as Calendar, H as History, n as Plus, o as Trash2, p as Camera, l as ChevronUp, e as ChevronDown } from "../_libs/lucide-react.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "./router--8MxzGTt.mjs";
import "../_libs/tanstack__query-core.mjs";
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
const TIPOS = ["Troca de Óleo", "Revisão Preventiva", "Revisão de Freios", "Troca de Correia Dentada", "Troca de Filtros", "Outro"];
const tipoSugestao = {
  "Troca de Óleo": {
    km: 15e3,
    meses: 6
  },
  "Revisão Preventiva": {
    km: 3e4,
    meses: 12
  },
  "Revisão de Freios": {
    km: 5e4,
    meses: 18
  },
  "Troca de Correia Dentada": {
    km: 6e4,
    meses: 24
  }
};
function ManutencaoForm({
  isSchedule = false
}) {
  const [veiculoId, setVeiculoId] = reactExports.useState("");
  const [tipo, setTipo] = reactExports.useState("Troca de Óleo");
  const [km, setKm] = reactExports.useState("");
  const [mecanico, setMecanico] = reactExports.useState("");
  const [oficina, setOficina] = reactExports.useState("");
  const [problema, setProblema] = reactExports.useState("");
  const [obs, setObs] = reactExports.useState("");
  const [usarSugestao, setUsarSugestao] = reactExports.useState(true);
  const [saving, setSaving] = reactExports.useState(false);
  const [photoFiles, setPhotoFiles] = reactExports.useState([]);
  const [photoPreviews, setPhotoPreviews] = reactExports.useState([]);
  const [pecas, setPecas] = reactExports.useState([{
    cat: "Lubrificantes",
    nome: "Óleo Motor 15W40 5L",
    cod: "OL001",
    qtd: 1,
    preco: 35.9
  }]);
  const [scheduledDate, setScheduledDate] = reactExports.useState("");
  const fileRef = reactExports.useRef(null);
  const {
    data: veiculos = []
  } = useVeiculosList();
  const {
    data: catalogo = []
  } = usePecas();
  const qc = useQueryClient();
  const v = veiculos.find((x) => x.id === veiculoId);
  const sug = tipoSugestao[tipo];
  const kmAtual = Number(km || v?.current_km || 0);
  const proximoKm = sug ? kmAtual + sug.km : kmAtual;
  const proximaData = sug ? new Date(Date.now() + sug.meses * 30 * 864e5).toISOString().slice(0, 10) : "";
  const total = pecas.reduce((s, p) => s + p.qtd * p.preco, 0);
  const handlePhotoAdd = (e) => {
    const files = Array.from(e.target.files ?? []);
    setPhotoFiles((prev) => [...prev, ...files]);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => setPhotoPreviews((prev) => [...prev, reader.result]);
      reader.readAsDataURL(f);
    });
  };
  const submit = async (e) => {
    e.preventDefault();
    if (!veiculoId) {
      toast.error("Selecione um veículo.");
      return;
    }
    if (isSchedule && !scheduledDate) {
      toast.error("Informe a data do agendamento.");
      return;
    }
    setSaving(true);
    try {
      const manutencao = await insertManutencao({
        veiculo_id: veiculoId,
        date: isSchedule ? scheduledDate : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        type: tipo,
        km_at_maintenance: kmAtual || void 0,
        mechanic: mecanico || void 0,
        workshop: oficina || void 0,
        cost: isSchedule ? void 0 : total,
        problem_identified: problema || void 0,
        items_replaced: isSchedule ? void 0 : pecas.map((p) => p.nome),
        notes: obs || void 0,
        next_maintenance_date: usarSugestao ? proximaData : void 0,
        next_maintenance_km: usarSugestao ? proximoKm : void 0,
        next_maintenance_type: usarSugestao ? tipo : void 0,
        status: isSchedule ? "agendada" : "concluida",
        scheduled_date: isSchedule ? scheduledDate : void 0
      });
      if (photoFiles.length > 0 && !isSchedule) {
        const urls = [];
        for (let i = 0; i < photoFiles.length; i++) {
          const url = await uploadManutencaoFoto(photoFiles[i], manutencao.id, i);
          urls.push(url);
        }
        const {
          supabase
        } = await import("./router--8MxzGTt.mjs").then((n) => n.a);
        await supabase.from("manutencoes").update({
          photos: urls
        }).eq("id", manutencao.id);
      }
      if (!isSchedule && pecas.length > 0 && total > 0) {
        await insertPedidoSugerido({
          manutencao_id: manutencao.id,
          veiculo_id: veiculoId,
          items: pecas,
          total,
          notes: `Peças utilizadas na manutenção: ${tipo} — ${v?.frota_number ?? ""}`
        });
      }
      await qc.invalidateQueries({
        queryKey: fleetKeys.veiculos
      });
      await qc.invalidateQueries({
        queryKey: fleetKeys.manutencoes
      });
      await qc.invalidateQueries({
        queryKey: ["pedidosDetalhados"]
      });
      toast.success(isSchedule ? "Manutenção agendada!" : "Manutenção registrada! Pedido de reposição criado.");
      setVeiculoId("");
      setKm("");
      setMecanico("");
      setOficina("");
      setProblema("");
      setObs("");
      setPhotoFiles([]);
      setPhotoPreviews([]);
      setPecas([{
        cat: "Lubrificantes",
        nome: "Óleo Motor 15W40 5L",
        cod: "OL001",
        qtd: 1,
        preco: 35.9
      }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Veículo *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: veiculoId, onValueChange: setVeiculoId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Selecionar veículo..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: veiculos.map((v2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: v2.id, children: [
            v2.frota_number,
            " — ",
            v2.plate,
            " (",
            v2.model,
            ")"
          ] }, v2.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tipo de Manutenção" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: tipo, onValueChange: setTipo, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TIPOS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
        ] })
      ] })
    ] }),
    isSchedule ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Data do Agendamento *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: scheduledDate, onChange: (e) => setScheduledDate(e.target.value), min: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "KM estimado" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: km, onChange: (e) => setKm(e.target.value), placeholder: `Atual: ${v?.current_km?.toLocaleString("pt-BR") ?? "—"}` })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "KM atual" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: km, onChange: (e) => setKm(e.target.value), placeholder: `Atual: ${v?.current_km?.toLocaleString("pt-BR") ?? "—"}` })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mecânico" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: mecanico, onChange: (e) => setMecanico(e.target.value), placeholder: "Nome do mecânico" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Oficina" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: oficina, onChange: (e) => setOficina(e.target.value), placeholder: "Nome da oficina" })
      ] })
    ] }),
    !isSchedule && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Problema identificado" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: problema, onChange: (e) => setProblema(e.target.value), rows: 2, placeholder: "Descreva o problema..." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Observações" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: obs, onChange: (e) => setObs(e.target.value), rows: 2, placeholder: "Observações gerais..." })
    ] }),
    !isSchedule && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "py-3 px-4 flex flex-row items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "Peças trocadas" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", variant: "outline", onClick: () => setPecas((p) => [...p, {
          cat: "",
          nome: "",
          cod: "",
          qtd: 1,
          preco: 0
        }]), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
          " Adicionar"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
        pecas.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-lg p-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Categoria" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: p.cat, onChange: (e) => setPecas(pecas.map((x, j) => j === i ? {
                ...x,
                cat: e.target.value
              } : x)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Código" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: p.cod, onChange: (e) => setPecas(pecas.map((x, j) => j === i ? {
                ...x,
                cod: e.target.value
              } : x)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Nome" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: p.nome, onChange: (e) => setPecas(pecas.map((x, j) => j === i ? {
              ...x,
              nome: e.target.value
            } : x)), list: `pecas-list-${i}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: `pecas-list-${i}`, children: catalogo.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c.name }, c.id)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 w-20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Qtd" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: p.qtd, onChange: (e) => setPecas(pecas.map((x, j) => j === i ? {
                ...x,
                qtd: Number(e.target.value)
              } : x)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Preço unitário (R$)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: p.preco, onChange: (e) => setPecas(pecas.map((x, j) => j === i ? {
                ...x,
                preco: Number(e.target.value)
              } : x)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 w-24", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { readOnly: true, value: (p.qtd * p.preco).toFixed(2), className: "bg-muted/40 text-right" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", className: "shrink-0 mb-0.5", onClick: () => setPecas(pecas.filter((_, j) => j !== i)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
          ] })
        ] }, i)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-sm font-semibold pt-1", children: [
          "Total: R$ ",
          total.toFixed(2)
        ] })
      ] })
    ] }),
    !isSchedule && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fotos da manutenção" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        photoPreviews.map((src, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-20 w-20 rounded-lg overflow-hidden border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src, className: "h-full w-full object-cover", alt: `foto ${i + 1}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
            setPhotoPreviews((p) => p.filter((_, j) => j !== i));
            setPhotoFiles((p) => p.filter((_, j) => j !== i));
          }, className: "absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center text-xs", children: "×" })
        ] }, i)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => fileRef.current?.click(), className: "h-20 w-20 rounded-lg border-2 border-dashed border-muted-foreground/40 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-5 w-5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "Foto" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileRef, type: "file", accept: "image/*", multiple: true, className: "hidden", onChange: handlePhotoAdd })
    ] }),
    !isSchedule && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 bg-muted/40 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: usarSugestao, onCheckedChange: setUsarSugestao }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Sugerir próxima: " }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          proximaData ? new Date(proximaData).toLocaleDateString("pt-BR") : "—",
          " | ",
          proximoKm.toLocaleString("pt-BR"),
          " km"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: saving, className: "w-full md:w-auto", children: saving ? "Salvando..." : isSchedule ? "Confirmar Agendamento" : "Registrar Manutenção" })
  ] });
}
function Historico() {
  const {
    data: manutencoes = [],
    isLoading
  } = useManutencoesList();
  const [expanded, setExpanded] = reactExports.useState(null);
  const statusConfig = {
    concluida: {
      label: "Concluída",
      className: "bg-green-100 text-green-700"
    },
    agendada: {
      label: "Agendada",
      className: "bg-blue-100 text-blue-700"
    },
    cancelada: {
      label: "Cancelada",
      className: "bg-red-100 text-red-700"
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando..." }),
    !isLoading && manutencoes.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-8", children: "Nenhuma manutenção registrada ainda." }),
    manutencoes.map((m) => {
      const mExt = m;
      const isOpen = expanded === m.id;
      const st = mExt.status ?? "concluida";
      const stConf = statusConfig[st] ?? statusConfig.concluida;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors", onClick: () => setExpanded(isOpen ? null : m.id), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: m.type }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${stConf.className}`, children: stConf.label })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
              mExt.veiculos ? `${mExt.veiculos.frota_number} — ${mExt.veiculos.plate}` : "—",
              " · ",
              new Date(m.date).toLocaleDateString("pt-BR"),
              m.km_at_maintenance ? ` · ${m.km_at_maintenance.toLocaleString("pt-BR")} km` : "",
              m.cost ? ` · R$ ${m.cost.toFixed(2)}` : ""
            ] })
          ] }),
          isOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4 shrink-0 text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 shrink-0 text-muted-foreground" })
        ] }),
        isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border px-4 py-4 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3 text-sm", children: [
            m.mechanic && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Mecânico" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: m.mechanic })
            ] }),
            m.workshop && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Oficina" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: m.workshop })
            ] }),
            m.next_maintenance_date && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Próxima revisão" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: new Date(m.next_maintenance_date).toLocaleDateString("pt-BR") })
            ] }),
            m.next_maintenance_km && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Próximo KM" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                m.next_maintenance_km.toLocaleString("pt-BR"),
                " km"
              ] })
            ] })
          ] }),
          m.problem_identified && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-muted-foreground mb-1", children: "Problema identificado" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm bg-muted/40 rounded p-2", children: m.problem_identified })
          ] }),
          m.items_replaced && m.items_replaced.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-muted-foreground mb-1", children: "Peças substituídas" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: m.items_replaced.map((it, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: it }, i)) })
          ] }),
          m.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-muted-foreground mb-1", children: "Observações" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm bg-muted/40 rounded p-2", children: m.notes })
          ] }),
          mExt.photos && mExt.photos.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-muted-foreground mb-2", children: "Fotos" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: mExt.photos.map((url, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: url, target: "_blank", rel: "noreferrer", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: url, alt: `foto ${i + 1}`, className: "h-20 w-20 rounded-lg object-cover border hover:opacity-80 transition-opacity" }) }, i)) })
          ] })
        ] })
      ] }, m.id);
    })
  ] });
}
function ManutencoesPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Manutenções" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Registre, agende e acompanhe as manutenções da frota" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "registrar", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid grid-cols-3 w-full max-w-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "registrar", className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-3.5 w-3.5" }),
          "Registrar"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "agendar", className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3.5 w-3.5" }),
          "Agendar"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "historico", className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-3.5 w-3.5" }),
          "Histórico"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "registrar", className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Nova manutenção realizada" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ManutencaoForm, {}) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "agendar", className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Agendar manutenção futura" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ManutencaoForm, { isSchedule: true }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "historico", className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Historico, {}) })
    ] })
  ] });
}
export {
  ManutencoesPage as component
};
