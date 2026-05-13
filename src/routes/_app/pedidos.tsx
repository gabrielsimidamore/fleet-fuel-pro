import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, ChevronUp, Package, ShoppingBag, Check, X, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { usePedidosDetalhados } from "@/hooks/use-fleet-data";
import { updatePedidoStatus } from "@/lib/queries";

export const Route = createFileRoute("/_app/pedidos")({ component: PedidosPage });

const STATUS_CONFIG: Record<string, { label: string; className: string; icon?: React.ReactNode }> = {
  new:        { label: "Aguardando aprovação", className: "bg-blue-100 text-blue-700 border-blue-200" },
  viewed:     { label: "Visualizado",          className: "bg-gray-100 text-gray-600 border-gray-200" },
  processing: { label: "Em separação",         className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  approved:   { label: "Aprovado por você",    className: "bg-green-100 text-green-700 border-green-200" },
  rejected:   { label: "Rejeitado",            className: "bg-red-100 text-red-700 border-red-200" },
  shipped:    { label: "Enviado",              className: "bg-purple-100 text-purple-700 border-purple-200" },
  delivered:  { label: "Entregue",             className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

function PedidosPage() {
  const { data: pedidos = [], isLoading } = usePedidosDetalhados();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const qc = useQueryClient();

  const pendentes = pedidos.filter(p => p.status === "new").length;

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    setActing(id);
    try {
      await updatePedidoStatus(id, action);
      await qc.invalidateQueries({ queryKey: ["pedidosDetalhados"] });
      toast.success(action === "approved" ? "Pedido aprovado! ✅" : "Pedido rejeitado.");
    } catch { toast.error("Erro ao atualizar pedido."); }
    finally { setActing(null); }
  };

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

      <div className="space-y-3">
        {pedidos.map(p => {
          const isOpen = expanded === p.id;
          const st = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.new;
          const items = (p.items ?? []) as { nome?: string; name?: string; cod?: string; qtd?: number; preco?: number; price?: number; cat?: string }[];
          const pExt = p as typeof p & { manutencoes?: { type: string; date: string } | null; veiculos?: { frota_number: string; plate: string } | null };
          const canAct = p.status === "new" || p.status === "viewed";

          return (
            <Card key={p.id} className={`overflow-hidden transition-all ${canAct ? "border-blue-200 shadow-sm" : ""}`}>
              {/* Header da linha */}
              <div
                className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpanded(isOpen ? null : p.id)}
              >
                <Package className={`h-5 w-5 shrink-0 ${canAct ? "text-blue-500" : "text-muted-foreground"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold">#{p.id.slice(0, 8).toUpperCase()}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${st.className}`}>{st.label}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {pExt.veiculos ? `${pExt.veiculos.frota_number} — ${pExt.veiculos.plate}` : "—"}
                    {pExt.manutencoes ? ` · ${pExt.manutencoes.type}` : ""}
                    {` · ${new Date(p.created_at).toLocaleDateString("pt-BR")}`}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-sm">R$ {(p.total ?? 0).toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{items.length} {items.length === 1 ? "item" : "itens"}</div>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
              </div>

              {/* Expandido */}
              {isOpen && (
                <div className="border-t border-border">
                  {/* Itens */}
                  {items.length > 0 && (
                    <div className="px-4 py-4">
                      <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Itens do pedido</div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[380px]">
                          <thead>
                            <tr className="border-b border-border text-xs text-muted-foreground">
                              <th className="text-left pb-2 font-medium">Peça</th>
                              <th className="text-left pb-2 font-medium">Cat.</th>
                              <th className="text-center pb-2 font-medium">Qtd</th>
                              <th className="text-right pb-2 font-medium">Preço</th>
                              <th className="text-right pb-2 font-medium">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((it, i) => {
                              const preco = it.preco ?? it.price ?? 0;
                              const qtd = it.qtd ?? 1;
                              return (
                                <tr key={i} className="border-b border-border/50 last:border-0">
                                  <td className="py-2 font-medium">{it.nome ?? it.name ?? "—"}</td>
                                  <td className="py-2 text-xs text-muted-foreground">{it.cat ?? "—"}</td>
                                  <td className="py-2 text-center">{qtd}</td>
                                  <td className="py-2 text-right">R$ {preco.toFixed(2)}</td>
                                  <td className="py-2 text-right font-semibold">R$ {(qtd * preco).toFixed(2)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr className="border-t-2 border-border">
                              <td colSpan={4} className="pt-2 text-right font-semibold text-sm">Total do pedido</td>
                              <td className="pt-2 text-right font-bold text-base">R$ {(p.total ?? 0).toFixed(2)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Observações */}
                  {p.notes && (
                    <div className="px-4 pb-3">
                      <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-2.5">{p.notes}</div>
                    </div>
                  )}

                  {/* Ações approve/reject */}
                  {canAct && (
                    <div className="px-4 pb-4 pt-2 flex flex-col sm:flex-row gap-2 border-t border-border bg-blue-50/50">
                      <div className="flex-1 text-xs text-blue-700 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> Aguardando sua aprovação para prosseguir
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="destructive" size="sm" className="gap-1.5 flex-1 sm:flex-none"
                          disabled={acting === p.id}
                          onClick={() => handleAction(p.id, "rejected")}
                        >
                          <X className="h-4 w-4" /> Rejeitar
                        </Button>
                        <Button
                          size="sm" className="gap-1.5 flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
                          disabled={acting === p.id}
                          onClick={() => handleAction(p.id, "approved")}
                        >
                          <Check className="h-4 w-4" /> Aprovar pedido
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Status final */}
                  {!canAct && (
                    <div className={`px-4 py-2.5 text-xs font-medium flex items-center gap-1.5 border-t border-border ${st.className}`}>
                      <span className="font-semibold">{st.label}</span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
