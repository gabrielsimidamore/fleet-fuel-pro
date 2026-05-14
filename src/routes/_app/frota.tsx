import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, History, Wrench, Package, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useVeiculos } from "@/hooks/use-fleet-data";
import { insertVeiculo, fetchHistoricoVeiculo, fetchPedidosVeiculo } from "@/lib/queries";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { fleetKeys } from "@/hooks/use-fleet-data";
import type { VeiculoStatus, VeiculoComStatus } from "@/lib/queries";

export const Route = createFileRoute("/_app/frota")({ component: FrotaPage });

// ─── Sheet de histórico do veículo ────────────────────────────────────────────
function VeiculoHistoricoSheet({ veiculo, open, onClose }: { veiculo: VeiculoComStatus | null; open: boolean; onClose: () => void }) {
  const { data: manutencoes = [] } = useQuery({ queryKey: ["hist", veiculo?.id], queryFn: () => fetchHistoricoVeiculo(veiculo!.id), enabled: !!veiculo?.id });
  const { data: pedidos = [] } = useQuery({ queryKey: ["pedVeic", veiculo?.id], queryFn: () => fetchPedidosVeiculo(veiculo!.id), enabled: !!veiculo?.id });
  const [tab, setTab] = useState<"manut" | "pedidos">("manut");
  if (!veiculo) return null;
  const totalGasto = manutencoes.reduce((s, m) => s + ((m as { cost?: number }).cost ?? 0), 0);

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0 flex flex-col">
        <SheetHeader className="px-5 py-4 border-b bg-muted/20 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SheetTitle className="text-base">{veiculo.frota_number} — {veiculo.plate}</SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{veiculo.model} · {veiculo.year} · {veiculo.current_km.toLocaleString("pt-BR")} km</p>
            </div>
            <StatusBadge status={veiculo.statusDisplay as VeiculoStatus} />
          </div>
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { label: "Manutenções", value: manutencoes.length },
              { label: "Pedidos", value: pedidos.length },
              { label: "Gasto total", value: `R$ ${totalGasto.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}` },
            ].map(k => (
              <div key={k.label} className="bg-card border border-border rounded-lg p-2 text-center">
                <div className="font-bold text-sm">{k.value}</div>
                <div className="text-[10px] text-muted-foreground">{k.label}</div>
              </div>
            ))}
          </div>
          {/* Tab buttons */}
          <div className="flex gap-2 mt-3">
            <button onClick={() => setTab("manut")} className={`flex-1 text-sm py-1.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${tab === "manut" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
              <Wrench className="h-3.5 w-3.5" /> Manutenções
            </button>
            <button onClick={() => setTab("pedidos")} className={`flex-1 text-sm py-1.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${tab === "pedidos" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
              <Package className="h-3.5 w-3.5" /> Pedidos
            </button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tab === "manut" && (
            <>
              {manutencoes.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Nenhuma manutenção registrada.</p>}
              {manutencoes.map(m => {
                const mExt = m as typeof m & { cost?: number; mechanic?: string; notes?: string; items_replaced?: string[] };
                return (
                  <div key={m.id} className="border border-border rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm">{m.type}</span>
                      <span className="text-xs text-muted-foreground">{new Date(m.date).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">
                      {m.km_at_maintenance && <span>📍 {m.km_at_maintenance.toLocaleString("pt-BR")} km</span>}
                      {mExt.cost ? <span>💰 R$ {mExt.cost.toFixed(2)}</span> : null}
                      {mExt.mechanic && <span>👨‍🔧 {mExt.mechanic}</span>}
                    </div>
                    {mExt.items_replaced && mExt.items_replaced.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {mExt.items_replaced.map((it: string, i: number) => <Badge key={i} variant="secondary" className="text-[10px]">{it}</Badge>)}
                      </div>
                    )}
                    {mExt.notes && <p className="text-xs text-muted-foreground italic">{mExt.notes}</p>}
                  </div>
                );
              })}
            </>
          )}
          {tab === "pedidos" && (
            <>
              {pedidos.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Nenhum pedido encontrado.</p>}
              {pedidos.map(p => {
                const statusMap: Record<string, string> = { new: "Aguardando", approved: "Aprovado", rejected: "Rejeitado", processing: "Em Separação", shipped: "Enviado", delivered: "Entregue" };
                const colorMap: Record<string, string> = { new: "bg-blue-100 text-blue-700", approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700", processing: "bg-yellow-100 text-yellow-800", shipped: "bg-purple-100 text-purple-700", delivered: "bg-emerald-100 text-emerald-700" };
                const items = (p.items ?? []) as { nome?: string; qtd?: number; preco?: number }[];
                return (
                  <div key={p.id} className="border border-border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold">#{p.id.slice(0,8).toUpperCase()}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colorMap[p.status] ?? "bg-gray-100 text-gray-600"}`}>{statusMap[p.status] ?? p.status}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString("pt-BR")} · R$ {(p.total ?? 0).toFixed(2)}</div>
                    <div className="flex flex-wrap gap-1">
                      {items.slice(0, 4).map((it: { nome?: string }, i: number) => <Badge key={i} variant="outline" className="text-[10px]">{it.nome ?? "—"}</Badge>)}
                      {items.length > 4 && <Badge variant="outline" className="text-[10px]">+{items.length - 4}</Badge>}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function FrotaPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedVeiculo, setSelectedVeiculo] = useState<VeiculoComStatus | null>(null);
  const queryClient = useQueryClient();

  const { data: veiculos = [], isLoading } = useVeiculos();

  const list = veiculos.filter((v) => {
    if (filter !== "all" && v.statusDisplay !== filter) return false;
    if (!q) return true;
    return (
      v.plate.toLowerCase().includes(q.toLowerCase()) ||
      v.frota_number.toLowerCase().includes(q.toLowerCase())
    );
  });

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setSaving(true);
    try {
      await insertVeiculo({
        frota_number: fd.get("frota") as string,
        plate: fd.get("plate") as string,
        brand: fd.get("brand") as string,
        model: fd.get("model") as string,
        year: Number(fd.get("year")),
        current_km: Number(fd.get("km")),
      });
      await queryClient.invalidateQueries({ queryKey: fleetKeys.veiculos });
      toast.success("Veículo cadastrado com sucesso!");
      setOpen(false);
      form.reset();
    } catch (err) {
      toast.error("Erro ao cadastrar veículo.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Frota</h1>
          <p className="text-sm text-muted-foreground">Gerencie os veículos da sua filial</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Novo Veículo</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cadastrar veículo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Frota</Label>
                <Input name="frota" placeholder="FR-1007" required />
              </div>
              <div className="space-y-1.5">
                <Label>Placa</Label>
                <Input name="plate" placeholder="ABC-1D23" required />
              </div>
              <div className="space-y-1.5">
                <Label>Marca</Label>
                <Input name="brand" placeholder="VW" />
              </div>
              <div className="space-y-1.5">
                <Label>Modelo</Label>
                <Input name="model" placeholder="VW 17.230" required />
              </div>
              <div className="space-y-1.5">
                <Label>Ano</Label>
                <Input name="year" type="number" placeholder="2024" />
              </div>
              <div className="space-y-1.5">
                <Label>KM Atual</Label>
                <Input name="km" type="number" placeholder="0" />
              </div>
              <div className="col-span-2 flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por placa ou frota..." className="pl-9" />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="em_dia">Em Dia</SelectItem>
              <SelectItem value="atencao">Atenção</SelectItem>
              <SelectItem value="vencido">Vencido</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">Carregando frota...</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Frota</th>
                  <th className="text-left px-4 py-3 font-medium">Placa</th>
                  <th className="text-left px-4 py-3 font-medium">Modelo</th>
                  <th className="text-left px-4 py-3 font-medium">Ano</th>
                  <th className="text-right px-4 py-3 font-medium">KM</th>
                  <th className="text-left px-4 py-3 font-medium">Próxima Manutenção</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-sm text-muted-foreground">
                      Nenhum veículo encontrado.
                    </td>
                  </tr>
                ) : (
                  list.map((v) => (
                    <tr key={v.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{v.frota_number}</td>
                      <td className="px-4 py-3">{v.plate}</td>
                      <td className="px-4 py-3">{v.model}</td>
                      <td className="px-4 py-3">{v.year}</td>
                      <td className="px-4 py-3 text-right">{v.current_km.toLocaleString("pt-BR")}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {v.nextDate
                          ? `${new Date(v.nextDate).toLocaleDateString("pt-BR")} — ${v.nextType ?? ""}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={v.statusDisplay as VeiculoStatus} /></td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedVeiculo(v)}><History className="h-3.5 w-3.5 mr-1" />Ver</Button>
                        <Button variant="outline" size="sm">Manutenção</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      <VeiculoHistoricoSheet veiculo={selectedVeiculo} open={!!selectedVeiculo} onClose={() => setSelectedVeiculo(null)} />
    </div>
  );
}
