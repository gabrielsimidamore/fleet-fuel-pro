import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  Plus, Trash2, Camera, Calendar, ClipboardList,
  History, CheckSquare, ChevronDown, ChevronUp,
  AlertTriangle, XCircle, CheckCircle2, MessageSquarePlus,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useVeiculosList, usePecas, useManutencoesList } from "@/hooks/use-fleet-data";
import { insertManutencao, insertPedidoSugerido, uploadManutencaoFoto } from "@/lib/queries";
import { useQueryClient } from "@tanstack/react-query";
import { fleetKeys } from "@/hooks/use-fleet-data";
import { supabase } from "@/lib/supabase";
import { checklistTemplate } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/manutencoes")({ component: ManutencoesPage });

const TIPOS = ["Troca de Óleo", "Revisão Preventiva", "Revisão de Freios", "Troca de Correia Dentada", "Troca de Filtros", "Outro"];
const tipoSugestao: Record<string, { km: number; meses: number }> = {
  "Troca de Óleo": { km: 15000, meses: 6 },
  "Revisão Preventiva": { km: 30000, meses: 12 },
  "Revisão de Freios": { km: 50000, meses: 18 },
  "Troca de Correia Dentada": { km: 60000, meses: 24 },
};

type ItemStatus = "pending" | "ok" | "atencao" | "critico";

const STATUS_CONFIG: Record<ItemStatus, { label: string; icon: React.ReactNode; bg: string; text: string; ring: string }> = {
  pending: { label: "Pendente", icon: null, bg: "bg-muted/50", text: "text-muted-foreground", ring: "ring-border" },
  ok:      { label: "OK",       icon: <CheckCircle2 className="h-5 w-5" />,   bg: "bg-green-50",  text: "text-green-700",  ring: "ring-green-400" },
  atencao: { label: "Atenção",  icon: <AlertTriangle className="h-5 w-5" />,  bg: "bg-yellow-50", text: "text-yellow-700", ring: "ring-yellow-400" },
  critico: { label: "Crítico",  icon: <XCircle className="h-5 w-5" />,       bg: "bg-red-50",    text: "text-red-700",    ring: "ring-red-400" },
};

const ICONS: Record<string, string> = {
  Motor: "⚙️", Freios: "🛑", Fluidos: "💧", Pneus: "🔄", Elétrica: "⚡", Carroceria: "🚛",
};

// ─── Checklist Tab ────────────────────────────────────────────────────────────
function ChecklistTab() {
  const { data: veiculos = [] } = useVeiculosList();
  const [veiculoId, setVeiculoId] = useState("");
  const [statuses, setStatuses] = useState<Record<string, ItemStatus>>({});
  const [obs, setObs] = useState<Record<string, string>>({});
  const [obsOpen, setObsOpen] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const qc = useQueryClient();

  const allItems = Object.entries(checklistTemplate).flatMap(([cat, items]) =>
    items.map(i => `${cat}::${i}`)
  );
  const done = allItems.filter(id => statuses[id] && statuses[id] !== "pending").length;
  const progress = allItems.length > 0 ? Math.round((done / allItems.length) * 100) : 0;
  const hasIssues = allItems.some(id => statuses[id] === "atencao" || statuses[id] === "critico");

  const cycleStatus = (id: string) => {
    const order: ItemStatus[] = ["pending", "ok", "atencao", "critico"];
    const cur = statuses[id] ?? "pending";
    const next = order[(order.indexOf(cur) + 1) % order.length];
    setStatuses(p => ({ ...p, [id]: next }));
  };

  const handleSave = async () => {
    if (!veiculoId) { toast.error("Selecione um veículo."); return; }
    setSaving(true);
    try {
      const result: Record<string, { status: ItemStatus; obs: string }> = {};
      allItems.forEach(id => {
        result[id] = { status: statuses[id] ?? "pending", obs: obs[id] ?? "" };
      });
      const issues = allItems.filter(id => statuses[id] === "atencao" || statuses[id] === "critico");
      const issueList = issues.map(id => id.split("::")[1]).join(", ");

      const manutencao = await insertManutencao({
        veiculo_id: veiculoId,
        date: new Date().toISOString().slice(0, 10),
        type: "Checklist de Inspeção",
        notes: issues.length > 0 ? `Itens com atenção/crítico: ${issueList}` : "Checklist concluído sem pendências.",
        status: "concluida",
        checklist_result: result as unknown as Parameters<typeof insertManutencao>[0]["checklist_result"],
      } as Parameters<typeof insertManutencao>[0]);

      // Gerar pedido se tem itens críticos
      if (issues.length > 0) {
        const pecasSugeridas = issues.map(id => ({
          nome: id.split("::")[1], cod: "", qtd: 1, preco: 0, cat: id.split("::")[0],
        }));
        await insertPedidoSugerido({
          manutencao_id: manutencao.id, veiculo_id: veiculoId,
          items: pecasSugeridas, total: 0,
          notes: `Itens críticos/atenção do checklist: ${issueList}`,
        });
      }

      await qc.invalidateQueries({ queryKey: fleetKeys.manutencoes });
      toast.success("Checklist salvo!" + (issues.length > 0 ? " Pedido de atenção criado." : ""));
      setStatuses({}); setObs({}); setObsOpen({}); setVeiculoId("");
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Erro ao salvar."); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      {/* Veículo */}
      <div className="space-y-1.5">
        <Label>Veículo *</Label>
        <Select value={veiculoId} onValueChange={setVeiculoId}>
          <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Selecionar veículo..." /></SelectTrigger>
          <SelectContent>{veiculos.map(v => <SelectItem key={v.id} value={v.id}>{v.frota_number} — {v.plate} ({v.model})</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {/* Progress */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">{done}/{allItems.length} itens verificados</span>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-green-600 font-medium">{allItems.filter(id => statuses[id] === "ok").length} OK</span>
            <span className="text-yellow-600 font-medium">{allItems.filter(id => statuses[id] === "atencao").length} Atenção</span>
            <span className="text-red-600 font-medium">{allItems.filter(id => statuses[id] === "critico").length} Crítico</span>
          </div>
        </div>
        <Progress value={progress} className="h-2.5" />
        <div className="text-xs text-muted-foreground text-right">{progress}% concluído</div>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap px-1">
        <span className="font-medium">Toque para mudar:</span>
        {(["ok","atencao","critico"] as ItemStatus[]).map(s => (
          <span key={s} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].text} font-medium`}>
            {STATUS_CONFIG[s].icon}{STATUS_CONFIG[s].label}
          </span>
        ))}
      </div>

      {/* Categorias */}
      {Object.entries(checklistTemplate).map(([cat, items]) => {
        const isCollapsed = collapsed[cat];
        const catDone = items.filter(i => statuses[`${cat}::${i}`] && statuses[`${cat}::${i}`] !== "pending").length;
        const catIssues = items.filter(i => statuses[`${cat}::${i}`] === "atencao" || statuses[`${cat}::${i}`] === "critico").length;

        return (
          <div key={cat} className="rounded-xl border border-border overflow-hidden shadow-sm">
            {/* Cat header */}
            <button type="button"
              onClick={() => setCollapsed(p => ({ ...p, [cat]: !p[cat] }))}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
            >
              <span className="text-xl">{ICONS[cat] ?? "🔧"}</span>
              <div className="flex-1">
                <div className="font-semibold text-sm">{cat}</div>
                <div className="text-xs text-muted-foreground">{catDone}/{items.length} verificados</div>
              </div>
              {catIssues > 0 && (
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{catIssues} ⚠️</span>
              )}
              {catDone === items.length && catDone > 0 && catIssues === 0 && (
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              )}
              {isCollapsed ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />}
            </button>

            {!isCollapsed && (
              <div className="divide-y divide-border bg-card">
                {items.map(item => {
                  const id = `${cat}::${item}`;
                  const st = statuses[id] ?? "pending";
                  const conf = STATUS_CONFIG[st];
                  const isObsOpen = obsOpen[id];

                  return (
                    <div key={id} className={`transition-colors ${conf.bg}`}>
                      {/* Item row */}
                      <div className="flex items-center gap-3 px-4 py-3.5">
                        {/* Status button — main tap target */}
                        <button
                          type="button"
                          onClick={() => cycleStatus(id)}
                          className={`flex items-center justify-center h-10 w-10 rounded-full ring-2 ${conf.ring} ${conf.bg} ${conf.text} shrink-0 transition-all active:scale-95`}
                        >
                          {conf.icon ?? <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/40" />}
                        </button>

                        {/* Label + status */}
                        <div className="flex-1 min-w-0" onClick={() => cycleStatus(id)}>
                          <div className={`text-sm font-medium leading-tight ${st !== "pending" ? conf.text : ""}`}>{item}</div>
                          {st !== "pending" && (
                            <div className={`text-xs font-semibold mt-0.5 ${conf.text}`}>{conf.label}</div>
                          )}
                        </div>

                        {/* Obs toggle */}
                        <button
                          type="button"
                          onClick={() => setObsOpen(p => ({ ...p, [id]: !p[id] }))}
                          className={`h-9 w-9 flex items-center justify-center rounded-full transition-colors shrink-0 ${
                            obs[id] ? "bg-blue-100 text-blue-600" : "bg-muted/60 text-muted-foreground hover:text-foreground"
                          }`}
                          title="Adicionar observação"
                        >
                          {isObsOpen ? <X className="h-4 w-4" /> : <MessageSquarePlus className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Observation field — sempre acessível */}
                      {isObsOpen && (
                        <div className="px-4 pb-3">
                          <Textarea
                            value={obs[id] ?? ""}
                            onChange={e => setObs(p => ({ ...p, [id]: e.target.value }))}
                            placeholder={`Observação sobre "${item}"...`}
                            rows={2}
                            className="text-sm resize-none bg-white"
                            autoFocus
                          />
                          {obs[id] && (
                            <div className="flex justify-end mt-1.5">
                              <button type="button" onClick={() => setObsOpen(p => ({ ...p, [id]: false }))}
                                className="text-xs text-blue-600 font-medium">Fechar ✓</button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Show obs preview if has text but closed */}
                      {!isObsOpen && obs[id] && (
                        <div className="px-4 pb-3 ml-[52px]">
                          <div className="text-xs text-muted-foreground bg-white/80 rounded-lg px-2.5 py-1.5 border border-border italic">
                            💬 {obs[id]}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Resumo de problemas */}
      {hasIssues && (
        <div className="rounded-xl border-2 border-yellow-300 bg-yellow-50 p-4 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-yellow-800 text-sm">
            <AlertTriangle className="h-4 w-4" /> Itens que precisam de atenção
          </div>
          {allItems.filter(id => statuses[id] === "atencao" || statuses[id] === "critico").map(id => {
            const [cat, item] = id.split("::");
            const st = statuses[id];
            return (
              <div key={id} className="flex items-center gap-2 text-sm">
                <span className={st === "critico" ? "text-red-600 font-bold" : "text-yellow-700"}>
                  {st === "critico" ? "🔴" : "🟡"} {item}
                </span>
                <span className="text-xs text-muted-foreground">({cat})</span>
                {obs[id] && <span className="text-xs italic text-muted-foreground">— {obs[id]}</span>}
              </div>
            );
          })}
        </div>
      )}

      <Button onClick={handleSave} disabled={saving || !veiculoId} className="w-full h-12 text-base font-semibold">
        {saving ? "Salvando..." : `Finalizar Checklist${hasIssues ? " (gerar pedido de atenção)" : ""}`}
      </Button>
    </div>
  );
}

// ─── Formulário Registrar / Agendar ──────────────────────────────────────────
function ManutencaoForm({ isSchedule = false }: { isSchedule?: boolean }) {
  const [veiculoId, setVeiculoId] = useState("");
  const [tipo, setTipo] = useState("Troca de Óleo");
  const [km, setKm] = useState("");
  const [mecanico, setMecanico] = useState("");
  const [oficina, setOficina] = useState("");
  const [problema, setProblema] = useState("");
  const [obs, setObs] = useState("");
  const [usarSugestao, setUsarSugestao] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [pecas, setPecas] = useState<{ cat: string; nome: string; cod: string; qtd: number; preco: number }[]>([
    { cat: "Lubrificantes", nome: "Óleo Motor 15W40 5L", cod: "OL001", qtd: 1, preco: 35.9 },
  ]);
  const [scheduledDate, setScheduledDate] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: veiculos = [] } = useVeiculosList();
  const { data: catalogo = [] } = usePecas();
  const qc = useQueryClient();

  const v = veiculos.find(x => x.id === veiculoId);
  const sug = tipoSugestao[tipo];
  const kmAtual = Number(km || v?.current_km || 0);
  const proximoKm = sug ? kmAtual + sug.km : kmAtual;
  const proximaData = sug ? new Date(Date.now() + sug.meses * 30 * 86400000).toISOString().slice(0, 10) : "";
  const total = pecas.reduce((s, p) => s + p.qtd * p.preco, 0);

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPhotoFiles(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = () => setPhotoPreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!veiculoId) { toast.error("Selecione um veículo."); return; }
    if (isSchedule && !scheduledDate) { toast.error("Informe a data do agendamento."); return; }
    setSaving(true);
    try {
      const manutencao = await insertManutencao({
        veiculo_id: veiculoId,
        date: isSchedule ? scheduledDate : new Date().toISOString().slice(0, 10),
        type: tipo,
        km_at_maintenance: kmAtual || undefined,
        mechanic: mecanico || undefined,
        workshop: oficina || undefined,
        cost: isSchedule ? undefined : total,
        problem_identified: problema || undefined,
        items_replaced: isSchedule ? undefined : pecas.map(p => p.nome),
        notes: obs || undefined,
        next_maintenance_date: usarSugestao ? proximaData : undefined,
        next_maintenance_km: usarSugestao ? proximoKm : undefined,
        next_maintenance_type: usarSugestao ? tipo : undefined,
        status: isSchedule ? "agendada" : "concluida",
        scheduled_date: isSchedule ? scheduledDate : undefined,
      } as Parameters<typeof insertManutencao>[0]);

      if (photoFiles.length > 0 && !isSchedule) {
        const urls: string[] = [];
        for (let i = 0; i < photoFiles.length; i++) {
          const url = await uploadManutencaoFoto(photoFiles[i], manutencao.id, i);
          urls.push(url);
        }
        await supabase.from("manutencoes").update({ photos: urls }).eq("id", manutencao.id);
      }

      if (!isSchedule && pecas.length > 0 && total > 0) {
        await insertPedidoSugerido({
          manutencao_id: manutencao.id, veiculo_id: veiculoId,
          items: pecas, total,
          notes: `Peças utilizadas: ${tipo} — ${v?.frota_number ?? ""}`,
        });
      }

      await qc.invalidateQueries({ queryKey: fleetKeys.veiculos });
      await qc.invalidateQueries({ queryKey: fleetKeys.manutencoes });
      await qc.invalidateQueries({ queryKey: ["pedidosDetalhados"] });
      toast.success(isSchedule ? "Manutenção agendada!" : "Manutenção registrada! Pedido criado.");
      setVeiculoId(""); setKm(""); setMecanico(""); setOficina(""); setProblema(""); setObs("");
      setPhotoFiles([]); setPhotoPreviews([]);
      setPecas([{ cat: "Lubrificantes", nome: "Óleo Motor 15W40 5L", cod: "OL001", qtd: 1, preco: 35.9 }]);
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Erro ao salvar."); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Veículo *</Label>
          <Select value={veiculoId} onValueChange={setVeiculoId}>
            <SelectTrigger className="h-11"><SelectValue placeholder="Selecionar veículo..." /></SelectTrigger>
            <SelectContent>{veiculos.map(v => <SelectItem key={v.id} value={v.id}>{v.frota_number} — {v.plate} ({v.model})</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Tipo de Manutenção</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>{TIPOS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {isSchedule ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Data do Agendamento *</Label>
            <Input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label>KM estimado</Label>
            <Input type="number" value={km} onChange={e => setKm(e.target.value)} placeholder={`Atual: ${v?.current_km?.toLocaleString("pt-BR") ?? "—"}`} className="h-11" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5"><Label>KM atual</Label><Input type="number" value={km} onChange={e => setKm(e.target.value)} placeholder={`Atual: ${v?.current_km?.toLocaleString("pt-BR") ?? "—"}`} className="h-11" /></div>
          <div className="space-y-1.5"><Label>Mecânico</Label><Input value={mecanico} onChange={e => setMecanico(e.target.value)} placeholder="Nome do mecânico" className="h-11" /></div>
          <div className="space-y-1.5"><Label>Oficina</Label><Input value={oficina} onChange={e => setOficina(e.target.value)} placeholder="Nome da oficina" className="h-11" /></div>
        </div>
      )}

      {!isSchedule && (
        <div className="space-y-1.5">
          <Label>Problema identificado</Label>
          <Textarea value={problema} onChange={e => setProblema(e.target.value)} rows={2} placeholder="Descreva o problema..." />
        </div>
      )}
      <div className="space-y-1.5">
        <Label>Observações</Label>
        <Textarea value={obs} onChange={e => setObs(e.target.value)} rows={2} placeholder="Observações gerais..." />
      </div>

      {!isSchedule && (
        <Card>
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Peças trocadas</CardTitle>
            <Button type="button" size="sm" variant="outline" onClick={() => setPecas(p => [...p, { cat: "", nome: "", cod: "", qtd: 1, preco: 0 }])}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {pecas.map((p, i) => (
              <div key={i} className="border border-border rounded-lg p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1"><Label className="text-xs">Categoria</Label><Input value={p.cat} onChange={e => setPecas(pecas.map((x, j) => j === i ? { ...x, cat: e.target.value } : x))} /></div>
                  <div className="space-y-1"><Label className="text-xs">Código</Label><Input value={p.cod} onChange={e => setPecas(pecas.map((x, j) => j === i ? { ...x, cod: e.target.value } : x))} /></div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Nome</Label>
                  <Input value={p.nome} onChange={e => setPecas(pecas.map((x, j) => j === i ? { ...x, nome: e.target.value } : x))} list={`pl-${i}`} />
                  <datalist id={`pl-${i}`}>{catalogo.map(c => <option key={c.id} value={c.name} />)}</datalist>
                </div>
                <div className="flex items-end gap-2">
                  <div className="space-y-1 w-20"><Label className="text-xs">Qtd</Label><Input type="number" value={p.qtd} onChange={e => setPecas(pecas.map((x, j) => j === i ? { ...x, qtd: Number(e.target.value) } : x))} /></div>
                  <div className="space-y-1 flex-1"><Label className="text-xs">Preço (R$)</Label><Input type="number" step="0.01" value={p.preco} onChange={e => setPecas(pecas.map((x, j) => j === i ? { ...x, preco: Number(e.target.value) } : x))} /></div>
                  <div className="space-y-1 w-24"><Label className="text-xs">Total</Label><Input readOnly value={(p.qtd * p.preco).toFixed(2)} className="bg-muted/40 text-right" /></div>
                  <Button type="button" variant="ghost" size="icon" className="shrink-0 mb-0.5" onClick={() => setPecas(pecas.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
            <div className="text-right text-sm font-semibold pt-1">Total: R$ {total.toFixed(2)}</div>
          </CardContent>
        </Card>
      )}

      {!isSchedule && (
        <div className="space-y-2">
          <Label>Fotos da manutenção</Label>
          <div className="flex flex-wrap gap-2">
            {photoPreviews.map((src, i) => (
              <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden border">
                <img src={src} className="h-full w-full object-cover" alt={`foto ${i+1}`} />
                <button type="button" onClick={() => { setPhotoPreviews(p => p.filter((_, j) => j !== i)); setPhotoFiles(p => p.filter((_, j) => j !== i)); }}
                  className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center text-xs">×</button>
              </div>
            ))}
            <button type="button" onClick={() => fileRef.current?.click()}
              className="h-20 w-20 rounded-lg border-2 border-dashed border-muted-foreground/40 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 transition-colors">
              <Camera className="h-5 w-5" /><span className="text-xs">Foto</span>
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoAdd} />
        </div>
      )}

      {!isSchedule && (
        <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
          <Switch checked={usarSugestao} onCheckedChange={setUsarSugestao} />
          <div className="text-sm">
            <span className="font-medium">Sugerir próxima: </span>
            <span className="text-muted-foreground">{proximaData ? new Date(proximaData).toLocaleDateString("pt-BR") : "—"} | {proximoKm.toLocaleString("pt-BR")} km</span>
          </div>
        </div>
      )}

      <Button type="submit" disabled={saving} className="w-full h-12 text-base font-semibold">
        {saving ? "Salvando..." : isSchedule ? "Confirmar Agendamento" : "Registrar Manutenção"}
      </Button>
    </form>
  );
}

// ─── Histórico ────────────────────────────────────────────────────────────────
function Historico() {
  const { data: manutencoes = [], isLoading } = useManutencoesList();
  const [expanded, setExpanded] = useState<string | null>(null);

  const statusConf: Record<string, { label: string; className: string }> = {
    concluida: { label: "Concluída",   className: "bg-green-100 text-green-700" },
    agendada:  { label: "Agendada",    className: "bg-blue-100 text-blue-700" },
    cancelada: { label: "Cancelada",   className: "bg-red-100 text-red-700" },
  };

  return (
    <div className="space-y-3">
      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {!isLoading && manutencoes.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhuma manutenção registrada ainda.</p>
      )}
      {manutencoes.map(m => {
        const mExt = m as typeof m & { veiculos?: { frota_number: string; plate: string } | null; photos?: string[]; checklist_result?: Record<string, { status: ItemStatus; obs: string }> };
        const isOpen = expanded === m.id;
        const st = m.status ?? "concluida";
        const conf = statusConf[st] ?? statusConf.concluida;
        const hasChecklist = mExt.checklist_result && Object.keys(mExt.checklist_result).length > 0;

        return (
          <Card key={m.id} className="overflow-hidden">
            <button type="button" className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-muted/30 transition-colors"
              onClick={() => setExpanded(isOpen ? null : m.id)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{m.type}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${conf.className}`}>{conf.label}</span>
                  {hasChecklist && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">✓ Checklist</span>}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {mExt.veiculos ? `${mExt.veiculos.frota_number} — ${mExt.veiculos.plate}` : "—"} · {new Date(m.date).toLocaleDateString("pt-BR")}
                  {m.km_at_maintenance ? ` · ${m.km_at_maintenance.toLocaleString("pt-BR")} km` : ""}
                  {m.cost ? ` · R$ ${m.cost.toFixed(2)}` : ""}
                </div>
              </div>
              {isOpen ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
            </button>

            {isOpen && (
              <div className="border-t border-border px-4 py-4 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  {m.mechanic && <div><div className="text-xs text-muted-foreground">Mecânico</div><div>{m.mechanic}</div></div>}
                  {m.workshop && <div><div className="text-xs text-muted-foreground">Oficina</div><div>{m.workshop}</div></div>}
                  {m.next_maintenance_date && <div><div className="text-xs text-muted-foreground">Próxima revisão</div><div>{new Date(m.next_maintenance_date).toLocaleDateString("pt-BR")}</div></div>}
                </div>
                {m.problem_identified && <div><div className="text-xs font-medium text-muted-foreground mb-1">Problema</div><div className="text-sm bg-muted/40 rounded p-2">{m.problem_identified}</div></div>}
                {m.items_replaced && m.items_replaced.length > 0 && (
                  <div><div className="text-xs font-medium text-muted-foreground mb-1">Peças substituídas</div>
                    <div className="flex flex-wrap gap-1">{m.items_replaced.map((it, i) => <Badge key={i} variant="secondary" className="text-xs">{it}</Badge>)}</div></div>
                )}
                {m.notes && <div><div className="text-xs font-medium text-muted-foreground mb-1">Observações</div><div className="text-sm bg-muted/40 rounded p-2">{m.notes}</div></div>}

                {/* Checklist result */}
                {hasChecklist && mExt.checklist_result && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">Resultado do Checklist</div>
                    <div className="space-y-1">
                      {Object.entries(mExt.checklist_result)
                        .filter(([, v]) => v.status !== "pending")
                        .map(([id, val]) => {
                          const [, item] = id.split("::");
                          const conf2 = STATUS_CONFIG[val.status];
                          return (
                            <div key={id} className={`flex items-start gap-2 rounded-lg px-3 py-2 ${conf2.bg}`}>
                              <span className={conf2.text + " shrink-0 mt-0.5"}>{conf2.icon}</span>
                              <div className="min-w-0">
                                <div className={`text-xs font-medium ${conf2.text}`}>{item}</div>
                                {val.obs && <div className="text-xs text-muted-foreground italic mt-0.5">💬 {val.obs}</div>}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {mExt.photos && mExt.photos.length > 0 && (
                  <div><div className="text-xs font-medium text-muted-foreground mb-2">Fotos</div>
                    <div className="flex flex-wrap gap-2">
                      {mExt.photos.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer">
                          <img src={url} alt={`foto ${i+1}`} className="h-20 w-20 rounded-lg object-cover border hover:opacity-80 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
function ManutencoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manutenções</h1>
        <p className="text-sm text-muted-foreground">Registre, agende, inspecione e acompanhe a frota</p>
      </div>
      <Tabs defaultValue="registrar">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="registrar" className="gap-1.5 text-xs sm:text-sm"><ClipboardList className="h-3.5 w-3.5 shrink-0" /><span className="hidden sm:inline">Registrar</span><span className="sm:hidden">Reg.</span></TabsTrigger>
          <TabsTrigger value="agendar" className="gap-1.5 text-xs sm:text-sm"><Calendar className="h-3.5 w-3.5 shrink-0" /><span className="hidden sm:inline">Agendar</span><span className="sm:hidden">Ag.</span></TabsTrigger>
          <TabsTrigger value="checklist" className="gap-1.5 text-xs sm:text-sm"><CheckSquare className="h-3.5 w-3.5 shrink-0" />Checklist</TabsTrigger>
          <TabsTrigger value="historico" className="gap-1.5 text-xs sm:text-sm"><History className="h-3.5 w-3.5 shrink-0" /><span className="hidden sm:inline">Histórico</span><span className="sm:hidden">Hist.</span></TabsTrigger>
        </TabsList>
        <TabsContent value="registrar" className="mt-5">
          <Card><CardHeader><CardTitle className="text-base">Nova manutenção realizada</CardTitle></CardHeader>
            <CardContent><ManutencaoForm /></CardContent></Card>
        </TabsContent>
        <TabsContent value="agendar" className="mt-5">
          <Card><CardHeader><CardTitle className="text-base">Agendar manutenção futura</CardTitle></CardHeader>
            <CardContent><ManutencaoForm isSchedule /></CardContent></Card>
        </TabsContent>
        <TabsContent value="checklist" className="mt-5">
          <ChecklistTab />
        </TabsContent>
        <TabsContent value="historico" className="mt-5">
          <Historico />
        </TabsContent>
      </Tabs>
    </div>
  );
}
