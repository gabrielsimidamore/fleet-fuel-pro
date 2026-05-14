import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Clock, Gauge, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { usePecas } from "@/hooks/use-fleet-data";
import { useVeiculosList } from "@/hooks/use-fleet-data";
import { fetchIntervalos, upsertIntervalo, deleteIntervalo } from "@/lib/queries";
import type { DBIntervalo } from "@/lib/queries";

export const Route = createFileRoute("/_app/admin/intervalos")({ component: IntervalosPage });

const TIPO_CONFIG = {
  revisao_geral:       { label: "Revisão Geral",        color: "bg-blue-100 text-blue-700",   desc: "Aplica a todos os veículos da frota" },
  peca:                { label: "Peça Específica",       color: "bg-green-100 text-green-700", desc: "Vinculado a uma peça do catálogo" },
  veiculo_especifico:  { label: "Veículo Específico",   color: "bg-purple-100 text-purple-700", desc: "Aplica apenas a um veículo" },
};

function IntervalosPage() {
  const qc = useQueryClient();
  const { data: intervalos = [], isLoading } = useQuery({ queryKey: ["intervalos"], queryFn: fetchIntervalos });
  const { data: pecas = [] } = usePecas();
  const { data: veiculos = [] } = useVeiculosList();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DBIntervalo | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nome: "", descricao: "", tipo: "revisao_geral" as DBIntervalo["tipo"],
    peca_id: "", veiculo_id: "", intervalo_km: "", intervalo_meses: "",
    dias_antecedencia: "7", ativo: true,
  });

  const setF = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const openNew = () => {
    setEditing(null);
    setForm({ nome: "", descricao: "", tipo: "revisao_geral", peca_id: "", veiculo_id: "", intervalo_km: "", intervalo_meses: "", dias_antecedencia: "7", ativo: true });
    setOpen(true);
  };

  const openEdit = (i: DBIntervalo) => {
    setEditing(i);
    setForm({
      nome: i.nome, descricao: i.descricao ?? "", tipo: i.tipo,
      peca_id: i.peca_id ?? "", veiculo_id: i.veiculo_id ?? "",
      intervalo_km: i.intervalo_km ? String(i.intervalo_km) : "",
      intervalo_meses: i.intervalo_meses ? String(i.intervalo_meses) : "",
      dias_antecedencia: String(i.dias_antecedencia), ativo: i.ativo,
    });
    setOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome) { toast.error("Nome é obrigatório."); return; }
    if (!form.intervalo_km && !form.intervalo_meses) { toast.error("Informe ao menos um intervalo (km ou meses)."); return; }
    setSaving(true);
    try {
      await upsertIntervalo({
        id: editing?.id,
        nome: form.nome,
        descricao: form.descricao || undefined,
        tipo: form.tipo,
        peca_id: form.peca_id || undefined,
        veiculo_id: form.veiculo_id || undefined,
        intervalo_km: form.intervalo_km ? Number(form.intervalo_km) : undefined,
        intervalo_meses: form.intervalo_meses ? Number(form.intervalo_meses) : undefined,
        dias_antecedencia: Number(form.dias_antecedencia) || 7,
        ativo: form.ativo,
      } as Partial<DBIntervalo> & { nome: string; tipo: string });
      await qc.invalidateQueries({ queryKey: ["intervalos"] });
      toast.success(editing ? "Intervalo atualizado!" : "Intervalo criado!");
      setOpen(false);
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Erro ao salvar."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Excluir o intervalo "${nome}"?`)) return;
    try {
      await deleteIntervalo(id);
      await qc.invalidateQueries({ queryKey: ["intervalos"] });
      toast.success("Intervalo removido.");
    } catch { toast.error("Erro ao excluir."); }
  };

  const handleToggle = async (i: DBIntervalo) => {
    try {
      await upsertIntervalo({ ...i, ativo: !i.ativo });
      await qc.invalidateQueries({ queryKey: ["intervalos"] });
    } catch { toast.error("Erro ao atualizar."); }
  };

  // Agrupar por tipo
  const grupos = ["revisao_geral", "peca", "veiculo_especifico"] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Intervalos de Manutenção</h1>
          <p className="text-sm text-muted-foreground">Configure os prazos — pedidos são gerados automaticamente 7 dias antes</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Novo Intervalo</Button>
      </div>

      {/* Explicação da lógica */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4 text-sm space-y-1.5">
          <div className="font-semibold text-blue-800 flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Como funciona a geração automática</div>
          <div className="text-blue-700 space-y-1 text-xs">
            <div className="flex items-center gap-2"><Gauge className="h-3.5 w-3.5" /> <b>Por KM:</b> se o veículo está a ≤ 500km de atingir o intervalo, cria o pedido</div>
            <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> <b>Por tempo:</b> se faltam ≤ 7 dias para completar o intervalo em meses, cria o pedido</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5" /> <b>Sem duplicata:</b> um mesmo par veículo+intervalo só gera 1 pedido por dia</div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3">
        {grupos.map(tipo => {
          const conf = TIPO_CONFIG[tipo];
          const count = intervalos.filter(i => i.tipo === tipo).length;
          const ativos = intervalos.filter(i => i.tipo === tipo && i.ativo).length;
          return (
            <div key={tipo} className={`rounded-lg border p-3 ${conf.color.replace("text-","border-").replace("700","200")} bg-white`}>
              <div className="text-lg font-bold">{ativos}<span className="text-sm font-normal text-muted-foreground">/{count}</span></div>
              <div className="text-xs font-medium">{conf.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{conf.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Lista por grupo */}
      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {grupos.map(tipo => {
        const items = intervalos.filter(i => i.tipo === tipo);
        if (!items.length) return null;
        const conf = TIPO_CONFIG[tipo];
        return (
          <div key={tipo}>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">{conf.label}</h2>
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm min-w-[540px]">
                  <thead className="bg-muted/40 text-xs text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Nome</th>
                      <th className="text-left px-4 py-3 font-medium">Intervalo</th>
                      <th className="text-left px-4 py-3 font-medium">Antecedência</th>
                      {tipo === "veiculo_especifico" && <th className="text-left px-4 py-3 font-medium">Veículo</th>}
                      {tipo === "peca" && <th className="text-left px-4 py-3 font-medium">Peça</th>}
                      <th className="text-center px-4 py-3 font-medium">Ativo</th>
                      <th className="text-right px-4 py-3 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(i => (
                      <tr key={i.id} className={`border-t border-border hover:bg-muted/20 ${!i.ativo ? "opacity-50" : ""}`}>
                        <td className="px-4 py-3">
                          <div className="font-medium">{i.nome}</div>
                          {i.descricao && <div className="text-xs text-muted-foreground">{i.descricao}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            {i.intervalo_km && (
                              <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full">
                                <Gauge className="h-3 w-3" /> {i.intervalo_km.toLocaleString("pt-BR")} km
                              </span>
                            )}
                            {i.intervalo_meses && (
                              <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full">
                                <Clock className="h-3 w-3" /> {i.intervalo_meses} {i.intervalo_meses === 1 ? "mês" : "meses"}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{i.dias_antecedencia} dias antes</td>
                        {tipo === "veiculo_especifico" && (
                          <td className="px-4 py-3 text-xs">{i.veiculos ? `${i.veiculos.frota_number} — ${i.veiculos.plate}` : "—"}</td>
                        )}
                        {tipo === "peca" && (
                          <td className="px-4 py-3 text-xs">{i.pecas?.name ?? "—"}</td>
                        )}
                        <td className="px-4 py-3 text-center">
                          <Switch checked={i.ativo} onCheckedChange={() => handleToggle(i)} />
                        </td>
                        <td className="px-4 py-3 text-right space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(i)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(i.id, i.nome)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        );
      })}

      {/* Dialog criar/editar */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar Intervalo" : "Novo Intervalo"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Tipo *</Label>
              <Select value={form.tipo} onValueChange={v => setF("tipo", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {grupos.map(t => <SelectItem key={t} value={t}>{TIPO_CONFIG[t].label} — {TIPO_CONFIG[t].desc}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Nome do intervalo *</Label>
              <Input value={form.nome} onChange={e => setF("nome", e.target.value)} placeholder="Ex: Troca de Óleo Motor" />
            </div>

            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea value={form.descricao} onChange={e => setF("descricao", e.target.value)} rows={2} placeholder="Detalhes do serviço..." />
            </div>

            {form.tipo === "peca" && (
              <div className="space-y-1.5">
                <Label>Peça do catálogo</Label>
                <Select value={form.peca_id} onValueChange={v => setF("peca_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecionar peça..." /></SelectTrigger>
                  <SelectContent>{pecas.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}

            {form.tipo === "veiculo_especifico" && (
              <div className="space-y-1.5">
                <Label>Veículo</Label>
                <Select value={form.veiculo_id} onValueChange={v => setF("veiculo_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecionar veículo..." /></SelectTrigger>
                  <SelectContent>{veiculos.map(v => <SelectItem key={v.id} value={v.id}>{v.frota_number} — {v.plate} ({v.model})</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" /> Intervalo KM</Label>
                <Input type="number" value={form.intervalo_km} onChange={e => setF("intervalo_km", e.target.value)} placeholder="Ex: 15000" />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Intervalo Meses</Label>
                <Input type="number" value={form.intervalo_meses} onChange={e => setF("intervalo_meses", e.target.value)} placeholder="Ex: 6" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">Pode usar KM e/ou meses. O sistema verifica o que vier primeiro.</p>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-orange-500" /> Dias de antecedência para gerar pedido</Label>
              <Input type="number" value={form.dias_antecedencia} onChange={e => setF("dias_antecedencia", e.target.value)} min={1} max={30} />
              <p className="text-xs text-muted-foreground">Padrão: 7 dias antes do prazo</p>
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={form.ativo} onCheckedChange={v => setF("ativo", v)} />
              <Label>Ativo</Label>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? "Salvando..." : editing ? "Salvar" : "Criar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
