import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Camera, Calendar, ClipboardList, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useVeiculosList, usePecas, useManutencoesList } from "@/hooks/use-fleet-data";
import { insertManutencao, insertPedidoSugerido, uploadManutencaoFoto } from "@/lib/queries";
import { useQueryClient } from "@tanstack/react-query";
import { fleetKeys } from "@/hooks/use-fleet-data";

export const Route = createFileRoute("/_app/manutencoes")({ component: ManutencoesPage });

const TIPOS = ["Troca de Óleo", "Revisão Preventiva", "Revisão de Freios", "Troca de Correia Dentada", "Troca de Filtros", "Outro"];
const tipoSugestao: Record<string, { km: number; meses: number }> = {
  "Troca de Óleo": { km: 15000, meses: 6 },
  "Revisão Preventiva": { km: 30000, meses: 12 },
  "Revisão de Freios": { km: 50000, meses: 18 },
  "Troca de Correia Dentada": { km: 60000, meses: 24 },
};

// ─── Form compartilhado Registrar / Agendar ───────────────────────────────────
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

      // Upload fotos
      if (photoFiles.length > 0 && !isSchedule) {
        const urls: string[] = [];
        for (let i = 0; i < photoFiles.length; i++) {
          const url = await uploadManutencaoFoto(photoFiles[i], manutencao.id, i);
          urls.push(url);
        }
        // update photos field
        const { supabase } = await import("@/lib/supabase");
        await supabase.from("manutencoes").update({ photos: urls }).eq("id", manutencao.id);
      }

      // Auto-criar pedido sugerido se tem peças
      if (!isSchedule && pecas.length > 0 && total > 0) {
        await insertPedidoSugerido({
          manutencao_id: manutencao.id,
          veiculo_id: veiculoId,
          items: pecas,
          total,
          notes: `Peças utilizadas na manutenção: ${tipo} — ${v?.frota_number ?? ""}`,
        });
      }

      await qc.invalidateQueries({ queryKey: fleetKeys.veiculos });
      await qc.invalidateQueries({ queryKey: fleetKeys.manutencoes });
      await qc.invalidateQueries({ queryKey: ["pedidosDetalhados"] });
      toast.success(isSchedule ? "Manutenção agendada!" : "Manutenção registrada! Pedido de reposição criado.");
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
            <SelectTrigger><SelectValue placeholder="Selecionar veículo..." /></SelectTrigger>
            <SelectContent>{veiculos.map(v => <SelectItem key={v.id} value={v.id}>{v.frota_number} — {v.plate} ({v.model})</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Tipo de Manutenção</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{TIPOS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {isSchedule ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Data do Agendamento *</Label>
            <Input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} />
          </div>
          <div className="space-y-1.5">
            <Label>KM estimado</Label>
            <Input type="number" value={km} onChange={e => setKm(e.target.value)} placeholder={`Atual: ${v?.current_km?.toLocaleString("pt-BR") ?? "—"}`} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5"><Label>KM atual</Label><Input type="number" value={km} onChange={e => setKm(e.target.value)} placeholder={`Atual: ${v?.current_km?.toLocaleString("pt-BR") ?? "—"}`} /></div>
          <div className="space-y-1.5"><Label>Mecânico</Label><Input value={mecanico} onChange={e => setMecanico(e.target.value)} placeholder="Nome do mecânico" /></div>
          <div className="space-y-1.5"><Label>Oficina</Label><Input value={oficina} onChange={e => setOficina(e.target.value)} placeholder="Nome da oficina" /></div>
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

      {/* Peças */}
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
                  <Input value={p.nome} onChange={e => setPecas(pecas.map((x, j) => j === i ? { ...x, nome: e.target.value } : x))} list={`pecas-list-${i}`} />
                  <datalist id={`pecas-list-${i}`}>{catalogo.map(c => <option key={c.id} value={c.name} />)}</datalist>
                </div>
                <div className="flex items-end gap-2">
                  <div className="space-y-1 w-20"><Label className="text-xs">Qtd</Label><Input type="number" value={p.qtd} onChange={e => setPecas(pecas.map((x, j) => j === i ? { ...x, qtd: Number(e.target.value) } : x))} /></div>
                  <div className="space-y-1 flex-1"><Label className="text-xs">Preço unitário (R$)</Label><Input type="number" step="0.01" value={p.preco} onChange={e => setPecas(pecas.map((x, j) => j === i ? { ...x, preco: Number(e.target.value) } : x))} /></div>
                  <div className="space-y-1 w-24"><Label className="text-xs">Total</Label><Input readOnly value={(p.qtd * p.preco).toFixed(2)} className="bg-muted/40 text-right" /></div>
                  <Button type="button" variant="ghost" size="icon" className="shrink-0 mb-0.5" onClick={() => setPecas(pecas.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
            <div className="text-right text-sm font-semibold pt-1">Total: R$ {total.toFixed(2)}</div>
          </CardContent>
        </Card>
      )}

      {/* Fotos */}
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

      {/* Próxima manutenção */}
      {!isSchedule && (
        <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
          <Switch checked={usarSugestao} onCheckedChange={setUsarSugestao} />
          <div className="text-sm">
            <span className="font-medium">Sugerir próxima: </span>
            <span className="text-muted-foreground">{proximaData ? new Date(proximaData).toLocaleDateString("pt-BR") : "—"} | {proximoKm.toLocaleString("pt-BR")} km</span>
          </div>
        </div>
      )}

      <Button type="submit" disabled={saving} className="w-full md:w-auto">
        {saving ? "Salvando..." : isSchedule ? "Confirmar Agendamento" : "Registrar Manutenção"}
      </Button>
    </form>
  );
}

// ─── Histórico ────────────────────────────────────────────────────────────────
function Historico() {
  const { data: manutencoes = [], isLoading } = useManutencoesList();
  const [expanded, setExpanded] = useState<string | null>(null);

  const statusConfig: Record<string, { label: string; className: string }> = {
    concluida: { label: "Concluída", className: "bg-green-100 text-green-700" },
    agendada: { label: "Agendada", className: "bg-blue-100 text-blue-700" },
    cancelada: { label: "Cancelada", className: "bg-red-100 text-red-700" },
  };

  return (
    <div className="space-y-3">
      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {!isLoading && manutencoes.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhuma manutenção registrada ainda.</p>
      )}
      {manutencoes.map(m => {
        const mExt = m as typeof m & { veiculos?: { frota_number: string; plate: string; model: string } | null; photos?: string[]; status?: string };
        const isOpen = expanded === m.id;
        const st = mExt.status ?? "concluida";
        const stConf = statusConfig[st] ?? statusConfig.concluida;
        return (
          <Card key={m.id} className="overflow-hidden">
            <button type="button" className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors"
              onClick={() => setExpanded(isOpen ? null : m.id)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{m.type}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stConf.className}`}>{stConf.label}</span>
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
                  {m.next_maintenance_km && <div><div className="text-xs text-muted-foreground">Próximo KM</div><div>{m.next_maintenance_km.toLocaleString("pt-BR")} km</div></div>}
                </div>

                {m.problem_identified && (
                  <div><div className="text-xs font-medium text-muted-foreground mb-1">Problema identificado</div>
                    <div className="text-sm bg-muted/40 rounded p-2">{m.problem_identified}</div></div>
                )}

                {m.items_replaced && m.items_replaced.length > 0 && (
                  <div><div className="text-xs font-medium text-muted-foreground mb-1">Peças substituídas</div>
                    <div className="flex flex-wrap gap-1">{m.items_replaced.map((it, i) => <Badge key={i} variant="secondary" className="text-xs">{it}</Badge>)}</div></div>
                )}

                {m.notes && (
                  <div><div className="text-xs font-medium text-muted-foreground mb-1">Observações</div>
                    <div className="text-sm bg-muted/40 rounded p-2">{m.notes}</div></div>
                )}

                {/* Fotos */}
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
        <p className="text-sm text-muted-foreground">Registre, agende e acompanhe as manutenções da frota</p>
      </div>
      <Tabs defaultValue="registrar">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="registrar" className="gap-1.5"><ClipboardList className="h-3.5 w-3.5" />Registrar</TabsTrigger>
          <TabsTrigger value="agendar" className="gap-1.5"><Calendar className="h-3.5 w-3.5" />Agendar</TabsTrigger>
          <TabsTrigger value="historico" className="gap-1.5"><History className="h-3.5 w-3.5" />Histórico</TabsTrigger>
        </TabsList>
        <TabsContent value="registrar" className="mt-6">
          <Card><CardHeader><CardTitle className="text-base">Nova manutenção realizada</CardTitle></CardHeader>
            <CardContent><ManutencaoForm /></CardContent></Card>
        </TabsContent>
        <TabsContent value="agendar" className="mt-6">
          <Card><CardHeader><CardTitle className="text-base">Agendar manutenção futura</CardTitle></CardHeader>
            <CardContent><ManutencaoForm isSchedule /></CardContent></Card>
        </TabsContent>
        <TabsContent value="historico" className="mt-6"><Historico /></TabsContent>
      </Tabs>
    </div>
  );
}
