import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Package, ShoppingBag, Check, X, Clock, Plus, Trash2, Flame, Tag, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { usePedidosDetalhados, useAllPromocoes, usePecas } from "@/hooks/use-fleet-data";
import { updatePedidoStatus, updatePedidoItems, sendPedidoAprovadoEmail } from "@/lib/queries";

export const Route = createFileRoute("/_app/pedidos")({ component: PedidosPage });

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  new:        { label: "Aguardando aprovação", className: "bg-blue-100 text-blue-700 border-blue-200" },
  viewed:     { label: "Visualizado",          className: "bg-gray-100 text-gray-600 border-gray-200" },
  processing: { label: "Em separação",         className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  approved:   { label: "Aprovado por você",    className: "bg-green-100 text-green-700 border-green-200" },
  rejected:   { label: "Rejeitado",            className: "bg-red-100 text-red-700 border-red-200" },
  shipped:    { label: "Enviado",              className: "bg-purple-100 text-purple-700 border-purple-200" },
  delivered:  { label: "Entregue",             className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

type OrderItem = { nome: string; cod: string; qtd: number; preco: number; cat?: string };

// ─── Sheet lateral ────────────────────────────────────────────────────────────
import type { DBPedido } from "@/lib/queries";

type PedidoComManu = DBPedido & { manutencoes?: { type: string; date: string } | null; veiculos?: { frota_number: string; plate: string } | null };

function PedidoSheet({ pedido, open, onClose }: {
  pedido: PedidoComManu | null;
  open: boolean;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { data: catalogo = [] } = usePecas();
  const { data: promocoes = [] } = useAllPromocoes();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [saving, setSaving] = useState(false);

  if (!pedido) return null;

  const pExt = pedido as typeof pedido & {
    veiculos?: { frota_number: string; plate: string; model: string; current_km: number | null } | null;
    manutencoes?: { type: string; date: string; km_at_maintenance: number | null } | null;
  };

  const total = items.reduce((s, i) => s + i.qtd * i.preco, 0);
  const canAct = pedido.status === "new" || pedido.status === "viewed";

  const ofertasDisponiveis = promocoes
    .filter(p => p.is_active)
    .filter(p => !items.some(i => i.nome === p.title));

  const addItem = () => setItems(p => [...p, { nome: "", cod: "", qtd: 1, preco: 0 }]);

  const addOferta = (oferta: typeof promocoes[0]) => {
    setItems(p => [...p, { nome: oferta.title, cod: oferta.peca_id ?? "", qtd: 1, preco: oferta.promo_price, cat: oferta.pecas?.category ?? "Promoção" }]);
    toast.success(`"${oferta.title}" adicionado!`);
  };

  const handleAction = async (action: "approved" | "rejected") => {
    setSaving(true);
    try {
      await updatePedidoItems(pedido.id, items, total);
      await updatePedidoStatus(pedido.id, action);

      // Enviar email ao aprovar
      if (action === "approved") {
        try {
          await sendPedidoAprovadoEmail({
            pedido_id: pedido.id,
            veiculo: pExt.veiculos?.frota_number ?? "—",
            placa: pExt.veiculos?.plate ?? "—",
            modelo: pExt.veiculos?.model ?? "—",
            tipo_manutencao: pExt.manutencoes?.type,
            data_manutencao: pExt.manutencoes?.date ? new Date(pExt.manutencoes.date).toLocaleDateString("pt-BR") : undefined,
            items,
            total,
          });
        } catch (emailErr) {
          console.error("Email error:", emailErr);
          // Não bloqueia o fluxo se o email falhar
        }
      }
      await qc.invalidateQueries({ queryKey: ["pedidosDetalhados"] });
      toast.success(action === "approved" ? "Pedido aprovado! ✅" : "Pedido rejeitado.");
      onClose();
    } catch { toast.error("Erro ao processar pedido."); }
    finally { setSaving(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePedidoItems(pedido.id, items, total);
      await qc.invalidateQueries({ queryKey: ["pedidosDetalhados"] });
      toast.success("Alterações salvas!");
    } catch { toast.error("Erro ao salvar."); }
    finally { setSaving(false); }
  };

  const st = STATUS_CONFIG[pedido.status] ?? STATUS_CONFIG.new;

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <SheetContent
        className="w-full sm:max-w-xl overflow-y-auto p-0 flex flex-col"
        onOpenAutoFocus={() => {
          const raw = (pedido.items ?? []) as OrderItem[];
          setItems(raw);
        }}
      >
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b bg-muted/20 shrink-0 space-y-0">
          <div className="flex items-start justify-between gap-3">
            <SheetTitle className="text-base">Pedido #{pedido.id.slice(0, 8).toUpperCase()}</SheetTitle>
            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium shrink-0 ${st.className}`}>{st.label}</span>
          </div>
          {pExt.veiculos && (
            <p className="text-xs text-muted-foreground">
              {pExt.veiculos.frota_number} — {pExt.veiculos.plate} ({pExt.veiculos.model})
              {pExt.manutencoes && ` · ${pExt.manutencoes.type} em ${new Date(pExt.manutencoes.date).toLocaleDateString("pt-BR")}`}
            </p>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Itens */}
          <Card>
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2"><Package className="h-4 w-4" /> Itens do pedido</CardTitle>
              <Button size="sm" variant="outline" onClick={addItem}><Plus className="h-3.5 w-3.5 mr-1" /> Adicionar</Button>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-3">Nenhum item.</p>}
              {items.map((it, i) => (
                <div key={i} className="grid grid-cols-[1fr_56px_72px_32px] gap-2 items-center">
                  <Input value={it.nome} onChange={e => setItems(p => p.map((x, j) => j === i ? { ...x, nome: e.target.value } : x))}
                    placeholder="Nome da peça" className="h-8 text-xs" list={`s-${i}`} />
                  <datalist id={`s-${i}`}>{catalogo.map(p => <option key={p.id} value={p.name} />)}</datalist>
                  <Input type="number" min={1} value={it.qtd} onChange={e => setItems(p => p.map((x, j) => j === i ? { ...x, qtd: Number(e.target.value) } : x))}
                    className="h-8 text-xs text-center" />
                  <Input type="number" step="0.01" value={it.preco} onChange={e => setItems(p => p.map((x, j) => j === i ? { ...x, preco: Number(e.target.value) } : x))}
                    className="h-8 text-xs text-right" />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setItems(p => p.filter((_, j) => j !== i))}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
              {items.length > 0 && (
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">{items.length} {items.length === 1 ? "item" : "itens"}</span>
                  <span className="font-bold text-base">Total: R$ {total.toFixed(2)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Ofertas especiais — sem mencionar "order bumps" ── */}
          {ofertasDisponiveis.length > 0 && (
            <div className="rounded-xl overflow-hidden border-2 border-orange-400 shadow-md">
              {/* Banner topo */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 flex items-center gap-2">
                <Flame className="h-5 w-5 text-white animate-pulse" />
                <div>
                  <div className="text-white font-bold text-sm">🔥 Aproveite enquanto tem!</div>
                  <div className="text-orange-100 text-xs">Adicione ao pedido com 1 clique e economize agora</div>
                </div>
              </div>

              {/* Cards das ofertas */}
              <div className="bg-orange-50 p-3 grid grid-cols-1 gap-2">
                {ofertasDisponiveis.map(b => (
                  <button key={b.id} type="button" onClick={() => addOferta(b)}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-orange-200 hover:border-orange-400 hover:shadow-md transition-all text-left group active:scale-[0.98]">
                    {b.pecas?.image_url ? (
                      <img src={b.pecas.image_url} className="h-12 w-12 rounded-lg object-cover border shrink-0" alt={b.title} />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                        <Tag className="h-5 w-5 text-orange-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{b.title}</div>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        {b.original_price && <span className="text-xs line-through text-muted-foreground">R$ {b.original_price.toFixed(2)}</span>}
                        <span className="text-base font-bold text-orange-600">R$ {b.promo_price.toFixed(2)}</span>
                        {b.discount_percent && (
                          <span className="text-xs font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                            -{Number(b.discount_percent)}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center shrink-0 group-hover:bg-orange-600 transition-colors">
                      <Plus className="h-4 w-4 text-white" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-4 bg-muted/10 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Total do pedido</span>
            <span className="text-2xl font-bold">R$ {total.toFixed(2)}</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={handleSave} disabled={saving}>Salvar alterações</Button>
            {canAct && (
              <>
                <Button variant="destructive" size="sm" className="flex-1 gap-1.5" onClick={() => handleAction("rejected")} disabled={saving}>
                  <X className="h-4 w-4" /> Rejeitar
                </Button>
                <Button size="sm" className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700" onClick={() => handleAction("approved")} disabled={saving}>
                  <Check className="h-4 w-4" /> Aprovar pedido
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────
function PedidosPage() {
  const { data: pedidos = [], isLoading } = usePedidosDetalhados();
  const [selected, setSelected] = useState<PedidoComManu | null>(null);

  const pendentes = pedidos.filter(p => p.status === "new").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Pedidos
          {pendentes > 0 && (
            <span className="inline-flex items-center justify-center h-6 min-w-6 px-1.5 rounded-full bg-blue-500 text-white text-xs font-bold animate-pulse">{pendentes}</span>
          )}
        </h1>
        <p className="text-sm text-muted-foreground">Revise e aprove os pedidos de reposição de peças</p>
      </div>

      {pendentes > 0 && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <Clock className="h-4 w-4 shrink-0" />
          <span>Você tem <b>{pendentes} {pendentes === 1 ? "pedido" : "pedidos"}</b> aguardando sua aprovação.</span>
        </div>
      )}

      {/* Cards resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { key: "new",       label: "Aguardando", color: "text-blue-700 bg-blue-50 border-blue-200" },
          { key: "approved",  label: "Aprovados",  color: "text-green-700 bg-green-50 border-green-200" },
          { key: "shipped",   label: "Enviados",   color: "text-purple-700 bg-purple-50 border-purple-200" },
          { key: "delivered", label: "Entregues",  color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
        ].map(s => (
          <div key={s.key} className={`rounded-lg border p-3 ${s.color}`}>
            <div className="text-2xl font-bold">{pedidos.filter(p => p.status === s.key).length}</div>
            <div className="text-xs font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando pedidos...</p>}

      {!isLoading && pedidos.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
            <ShoppingBag className="h-10 w-10" />
            <div className="text-center">
              <div className="font-medium">Nenhum pedido encontrado</div>
              <div className="text-sm mt-1">Os pedidos são gerados automaticamente ao registrar uma manutenção com peças.</div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        {pedidos.length > 0 && (
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Pedido</th>
                  <th className="text-left px-4 py-3 font-medium">Veículo</th>
                  <th className="text-left px-4 py-3 font-medium">Data</th>
                  <th className="text-right px-4 py-3 font-medium">Total</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                  <th className="text-center px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map(p => {
                  const st = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.new;
                  const pExt = p as typeof p & { veiculos?: { frota_number: string; plate: string } | null };
                  const canAct = p.status === "new" || p.status === "viewed";
                  return (
                    <tr key={p.id} onClick={() => setSelected(p)}
                      className="border-t border-border hover:bg-muted/30 cursor-pointer transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold">#{p.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-4 py-3 text-sm">{pExt.veiculos ? `${pExt.veiculos.frota_number} — ${pExt.veiculos.plate}` : "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString("pt-BR")}</td>
                      <td className="px-4 py-3 text-right font-semibold">R$ {(p.total ?? 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${st.className}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {canAct ? (
                          <span className="text-xs text-blue-600 font-medium flex items-center justify-center gap-1">
                            Ver <ChevronDown className="h-3 w-3" />
                          </span>
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground mx-auto" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        )}
      </Card>

      <PedidoSheet pedido={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
}
