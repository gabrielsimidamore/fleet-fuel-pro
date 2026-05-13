import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X, Plus, Trash2, ShoppingCart, Zap, Package, ChevronDown, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { usePedidosAdmin } from "@/hooks/use-fleet-data";
import { usePecas, useAllPromocoes } from "@/hooks/use-fleet-data";
import { updatePedidoStatus, updatePedidoItems } from "@/lib/queries";
import type { DBPedidoAdmin } from "@/lib/queries";

export const Route = createFileRoute("/_app/admin/pedidos")({ component: AdminPedidos });

type OrderItem = { nome: string; cod: string; qtd: number; preco: number; cat?: string };

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  new:        { label: "Aguardando",   className: "bg-blue-100 text-blue-700 border-blue-200" },
  viewed:     { label: "Visualizado",  className: "bg-gray-100 text-gray-600 border-gray-200" },
  processing: { label: "Em Separação", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  approved:   { label: "Aprovado",     className: "bg-green-100 text-green-700 border-green-200" },
  rejected:   { label: "Rejeitado",    className: "bg-red-100 text-red-700 border-red-200" },
  shipped:    { label: "Enviado",      className: "bg-purple-100 text-purple-700 border-purple-200" },
  delivered:  { label: "Entregue",     className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

// ─── Sheet lateral do cupom ────────────────────────────────────────────────────
function PedidoSheet({
  pedido, open, onClose,
}: { pedido: DBPedidoAdmin | null; open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const { data: catalogo = [] } = usePecas();
  const { data: promocoes = [] } = useAllPromocoes();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [saving, setSaving] = useState(false);

  // Inicializar itens ao abrir
  const initItems = (p: DBPedidoAdmin) => {
    const raw = (p.items ?? []) as OrderItem[];
    setItems(raw.length > 0 ? raw : []);
  };

  if (!pedido) return null;

  const manu = pedido.manutencoes;
  const veiculo = pedido.veiculos;
  const total = items.reduce((s, i) => s + i.qtd * i.preco, 0);

  // ── Sugestões do sistema ────────────────────────────────────────────────────
  // Peças do catálogo que têm intervalo_km e ainda não estão no pedido
  const kmAtual = veiculo?.current_km ?? 0;
  const kmUltima = manu?.km_at_maintenance ?? 0;
  const sugestoes = catalogo
    .filter(p => p.interval_km && p.price)
    .filter(p => {
      const kmDesde = kmAtual - kmUltima;
      return p.interval_km! <= kmDesde + 5000; // próximas nos próximos 5000km
    })
    .filter(p => !items.some(i => i.cod === (p.code ?? p.id)))
    .slice(0, 5);

  // ── Order Bumps (promoções ativas) ──────────────────────────────────────────
  const orderBumps = promocoes
    .filter(p => p.is_active)
    .filter(p => !items.some(i => i.nome === p.title))
    .slice(0, 4);

  const addItem = (item?: Partial<OrderItem>) => {
    setItems(prev => [...prev, { nome: item?.nome ?? "", cod: item?.cod ?? "", qtd: item?.qtd ?? 1, preco: item?.preco ?? 0, cat: item?.cat ?? "" }]);
  };

  const addBump = (bump: typeof orderBumps[0]) => {
    setItems(prev => [...prev, {
      nome: bump.title, cod: bump.peca_id ?? "",
      qtd: 1, preco: bump.promo_price,
      cat: bump.pecas?.category ?? "Promoção",
    }]);
    toast.success(`"${bump.title}" adicionado ao pedido!`);
  };

  const removeItem = (i: number) => setItems(prev => prev.filter((_, j) => j !== i));

  const handleAction = async (action: "approved" | "rejected" | "processing") => {
    setSaving(true);
    try {
      await updatePedidoItems(pedido.id, items, total);
      await updatePedidoStatus(pedido.id, action);
      await qc.invalidateQueries({ queryKey: ["pedidosAdmin"] });
      const msgs = { approved: "Pedido aprovado! ✅", rejected: "Pedido rejeitado.", processing: "Pedido em separação." };
      toast.success(msgs[action]);
      onClose();
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Erro."); }
    finally { setSaving(false); }
  };

  const handleSaveItems = async () => {
    setSaving(true);
    try {
      await updatePedidoItems(pedido.id, items, total);
      await qc.invalidateQueries({ queryKey: ["pedidosAdmin"] });
      toast.success("Itens atualizados!");
    } catch { toast.error("Erro ao salvar."); }
    finally { setSaving(false); }
  };

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <SheetContent
        className="w-full sm:max-w-2xl overflow-y-auto p-0 flex flex-col"
        onOpenAutoFocus={() => initItems(pedido)}
      >
        {/* Header */}
        <SheetHeader className="px-5 py-4 border-b bg-muted/30 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SheetTitle className="text-base">Pedido #{pedido.id.slice(0, 8).toUpperCase()}</SheetTitle>
              <div className="text-xs text-muted-foreground mt-0.5">
                {veiculo ? `${veiculo.frota_number} — ${veiculo.plate} (${veiculo.model})` : "—"}
                {manu ? ` · Última manutenção: ${manu.type} em ${new Date(manu.date).toLocaleDateString("pt-BR")}` : ""}
              </div>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium shrink-0 ${STATUS_MAP[pedido.status]?.className ?? "bg-gray-100 text-gray-600"}`}>
              {STATUS_MAP[pedido.status]?.label ?? pedido.status}
            </span>
          </div>
          {veiculo?.current_km && (
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span>KM atual: <b className="text-foreground">{veiculo.current_km.toLocaleString("pt-BR")}</b></span>
              {manu?.km_at_maintenance && <span>KM última rev.: <b className="text-foreground">{manu.km_at_maintenance.toLocaleString("pt-BR")}</b></span>}
              {manu?.items_replaced?.length ? <span>Peças trocadas: <b className="text-foreground">{manu.items_replaced.length}</b></span> : null}
            </div>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* ── Itens do pedido ── */}
          <Card>
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" /> Itens do pedido
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => addItem()}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
              </Button>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {items.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum item. Adicione abaixo.</p>
              )}
              {items.map((it, i) => (
                <div key={i} className="grid grid-cols-[1fr_60px_80px_32px] gap-2 items-center">
                  <div className="space-y-0.5">
                    <Input
                      value={it.nome}
                      onChange={e => setItems(prev => prev.map((x, j) => j === i ? { ...x, nome: e.target.value } : x))}
                      placeholder="Nome da peça"
                      className="h-8 text-xs"
                      list={`sugg-${i}`}
                    />
                    <datalist id={`sugg-${i}`}>{catalogo.map(p => <option key={p.id} value={p.name} />)}</datalist>
                  </div>
                  <Input type="number" min={1} value={it.qtd}
                    onChange={e => setItems(prev => prev.map((x, j) => j === i ? { ...x, qtd: Number(e.target.value) } : x))}
                    className="h-8 text-xs text-center" placeholder="Qtd"
                  />
                  <Input type="number" step="0.01" value={it.preco}
                    onChange={e => setItems(prev => prev.map((x, j) => j === i ? { ...x, preco: Number(e.target.value) } : x))}
                    className="h-8 text-xs text-right" placeholder="R$"
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(i)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
              {items.length > 0 && (
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">{items.length} {items.length === 1 ? "item" : "itens"}</span>
                  <span className="font-bold">Total: R$ {total.toFixed(2)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Sugestões do sistema ── */}
          {sugestoes.length > 0 && (
            <Card className="border-orange-200 bg-orange-50/30">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
                  <Package className="h-4 w-4" /> Sugestões do sistema
                  <span className="text-xs font-normal text-orange-600">— baseado no km e recomendações do fabricante</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {sugestoes.map(p => (
                  <div key={p.id} className="flex items-center justify-between gap-3 py-2 border-b border-orange-100 last:border-0">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Intervalo: {p.interval_km?.toLocaleString("pt-BR")} km · R$ {(p.price ?? 0).toFixed(2)}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="shrink-0 border-orange-300 text-orange-700 hover:bg-orange-100"
                      onClick={() => { addItem({ nome: p.name, cod: p.code ?? "", preco: p.price ?? 0, cat: p.category ?? "" }); toast.success(`"${p.name}" adicionado!`); }}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Incluir
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* ── Order Bumps (promoções) ── */}
          {orderBumps.length > 0 && (
            <Card className="border-green-200 bg-green-50/30">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                  <Zap className="h-4 w-4" /> Order Bumps — Promoções ativas
                  <span className="text-xs font-normal text-green-600">clique para adicionar</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {orderBumps.map(b => (
                  <button key={b.id} type="button" onClick={() => addBump(b)}
                    className="flex items-center gap-3 p-2.5 border border-green-200 rounded-lg bg-white hover:bg-green-50 hover:border-green-400 transition-colors text-left group">
                    {b.pecas?.image_url ? (
                      <img src={b.pecas.image_url} className="h-10 w-10 rounded object-cover shrink-0 border" alt={b.title} />
                    ) : (
                      <div className="h-10 w-10 rounded bg-green-100 flex items-center justify-center shrink-0"><Tag className="h-4 w-4 text-green-600" /></div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium truncate">{b.title}</div>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        {b.original_price && <span className="text-[10px] line-through text-muted-foreground">R$ {b.original_price.toFixed(2)}</span>}
                        <span className="text-sm font-bold text-green-700">R$ {b.promo_price.toFixed(2)}</span>
                        {b.discount_percent && <span className="text-[10px] bg-green-200 text-green-800 px-1 rounded">-{Number(b.discount_percent)}%</span>}
                      </div>
                    </div>
                    <Plus className="h-4 w-4 text-green-500 shrink-0 group-hover:scale-110 transition-transform" />
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-4 bg-muted/20 shrink-0 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total do pedido</span>
            <span className="text-xl font-bold">R$ {total.toFixed(2)}</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={handleSaveItems} disabled={saving}>
              Salvar alterações
            </Button>
            {pedido.status !== "rejected" && pedido.status !== "delivered" && (
              <>
                <Button variant="destructive" size="sm" className="flex-1 gap-1.5" onClick={() => handleAction("rejected")} disabled={saving}>
                  <X className="h-4 w-4" /> Rejeitar
                </Button>
                {pedido.status === "approved" || pedido.status === "processing" ? (
                  <Button size="sm" className="flex-1 gap-1.5 bg-purple-600 hover:bg-purple-700" onClick={() => handleAction("processing")} disabled={saving}>
                    <Package className="h-4 w-4" /> Em Separação
                  </Button>
                ) : (
                  <Button size="sm" className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700" onClick={() => handleAction("approved")} disabled={saving}>
                    <Check className="h-4 w-4" /> Aprovar
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
function AdminPedidos() {
  const { data: pedidos = [], isLoading } = usePedidosAdmin();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<DBPedidoAdmin | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = filterStatus === "all" ? pedidos : pedidos.filter(p => p.status === filterStatus);
  const pendentes = pedidos.filter(p => p.status === "new").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Pedidos
            {pendentes > 0 && (
              <span className="inline-flex items-center justify-center h-6 min-w-6 px-1.5 rounded-full bg-blue-500 text-white text-xs font-bold">{pendentes}</span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">Clique em um pedido para revisar, editar e aprovar</p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {Object.entries(STATUS_MAP).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Resumo rápido */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { key: "new",      label: "Aguardando",   color: "text-blue-700 bg-blue-50 border-blue-200" },
          { key: "approved", label: "Aprovados",    color: "text-green-700 bg-green-50 border-green-200" },
          { key: "rejected", label: "Rejeitados",   color: "text-red-700 bg-red-50 border-red-200" },
          { key: "shipped",  label: "Enviados",     color: "text-purple-700 bg-purple-50 border-purple-200" },
        ].map(s => (
          <button key={s.key} onClick={() => setFilterStatus(s.key === filterStatus ? "all" : s.key)}
            className={`rounded-lg border p-3 text-left transition-all hover:shadow-sm ${s.color} ${filterStatus === s.key ? "ring-2 ring-offset-1 ring-current" : ""}`}>
            <div className="text-2xl font-bold">{pedidos.filter(p => p.status === s.key).length}</div>
            <div className="text-xs font-medium mt-0.5">{s.label}</div>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <p className="px-4 py-8 text-sm text-muted-foreground text-center">Carregando pedidos...</p>
          ) : filtered.length === 0 ? (
            <p className="px-4 py-8 text-sm text-muted-foreground text-center">Nenhum pedido encontrado.</p>
          ) : (
            <table className="w-full text-sm min-w-[540px]">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Pedido</th>
                  <th className="text-left px-4 py-3 font-medium">Veículo</th>
                  <th className="text-left px-4 py-3 font-medium">Manutenção</th>
                  <th className="text-left px-4 py-3 font-medium">Data</th>
                  <th className="text-right px-4 py-3 font-medium">Total</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                  <th className="text-center px-4 py-3 font-medium">Ação rápida</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const st = STATUS_MAP[p.status] ?? STATUS_MAP.new;
                  return (
                    <tr key={p.id} onClick={() => setSelected(p)}
                      className="border-t border-border hover:bg-muted/30 cursor-pointer transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold">#{p.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-4 py-3">{p.veiculos ? `${p.veiculos.frota_number} — ${p.veiculos.plate}` : "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{p.manutencoes?.type ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(p.created_at).toLocaleDateString("pt-BR")}</td>
                      <td className="px-4 py-3 text-right font-semibold">R$ {(p.total ?? 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${st.className}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                        {p.status === "new" && (
                          <div className="flex justify-center gap-1">
                            <button onClick={async () => { await updatePedidoStatus(p.id, "approved"); await qc.invalidateQueries({ queryKey: ["pedidosAdmin"] }); toast.success("Aprovado!"); }}
                              className="h-7 w-7 rounded-full bg-green-100 text-green-700 hover:bg-green-200 flex items-center justify-center transition-colors">
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={async () => { await updatePedidoStatus(p.id, "rejected"); await qc.invalidateQueries({ queryKey: ["pedidosAdmin"] }); toast.success("Rejeitado."); }}
                              className="h-7 w-7 rounded-full bg-red-100 text-red-700 hover:bg-red-200 flex items-center justify-center transition-colors">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                        {p.status !== "new" && <ChevronDown className="h-4 w-4 text-muted-foreground mx-auto" />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <PedidoSheet pedido={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
}
