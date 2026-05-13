import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, ChevronUp, Package, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePedidosDetalhados } from "@/hooks/use-fleet-data";

export const Route = createFileRoute("/_app/pedidos")({ component: PedidosPage });

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  new:        { label: "Novo",         className: "bg-blue-100 text-blue-700" },
  viewed:     { label: "Visualizado",  className: "bg-gray-100 text-gray-700" },
  processing: { label: "Em separação", className: "bg-yellow-100 text-yellow-800" },
  shipped:    { label: "Enviado",      className: "bg-purple-100 text-purple-700" },
  delivered:  { label: "Entregue",     className: "bg-green-100 text-green-700" },
};

function PedidosPage() {
  const { data: pedidos = [], isLoading } = usePedidosDetalhados();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <p className="text-sm text-muted-foreground">Pedidos de reposição de peças gerados pelas manutenções</p>
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

      <div className="space-y-3">
        {pedidos.map(p => {
          const isOpen = expanded === p.id;
          const st = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.new;
          const items = (p.items ?? []) as { nome?: string; name?: string; cod?: string; qtd?: number; preco?: number; price?: number }[];
          const pExt = p as typeof p & { manutencoes?: { type: string; date: string } | null };

          return (
            <Card key={p.id} className="overflow-hidden">
              <button type="button" className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                onClick={() => setExpanded(isOpen ? null : p.id)}>
                <Package className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold"># {p.id.slice(0, 8).toUpperCase()}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.className}`}>{st.label}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {p.veiculos ? `${p.veiculos.frota_number} — ${p.veiculos.plate}` : "—"}
                    {pExt.manutencoes ? ` · ${pExt.manutencoes.type}` : ""}
                    {` · ${new Date(p.created_at).toLocaleDateString("pt-BR")}`}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-sm">R$ {(p.total ?? 0).toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{items.length} {items.length === 1 ? "item" : "itens"}</div>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
              </button>

              {isOpen && (
                <div className="border-t border-border px-4 py-4 space-y-4">
                  {pExt.manutencoes && (
                    <div className="text-xs text-muted-foreground bg-muted/40 rounded p-2">
                      Gerado pela manutenção: <span className="font-medium">{pExt.manutencoes.type}</span> em {new Date(pExt.manutencoes.date).toLocaleDateString("pt-BR")}
                    </div>
                  )}

                  {items.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-2">Peças do pedido</div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[400px]">
                          <thead className="bg-muted/40 text-xs text-muted-foreground">
                            <tr>
                              <th className="text-left px-3 py-2">Peça</th>
                              <th className="text-left px-3 py-2">Código</th>
                              <th className="text-center px-3 py-2">Qtd</th>
                              <th className="text-right px-3 py-2">Preço un.</th>
                              <th className="text-right px-3 py-2">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((it, i) => {
                              const preco = it.preco ?? it.price ?? 0;
                              const qtd = it.qtd ?? 1;
                              return (
                                <tr key={i} className="border-t border-border">
                                  <td className="px-3 py-2 font-medium">{it.nome ?? it.name ?? "—"}</td>
                                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{it.cod ?? "—"}</td>
                                  <td className="px-3 py-2 text-center">{qtd}</td>
                                  <td className="px-3 py-2 text-right">R$ {preco.toFixed(2)}</td>
                                  <td className="px-3 py-2 text-right font-semibold">R$ {(qtd * preco).toFixed(2)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr className="border-t-2 border-border">
                              <td colSpan={4} className="px-3 py-2 text-right font-semibold">Total</td>
                              <td className="px-3 py-2 text-right font-bold">R$ {(p.total ?? 0).toFixed(2)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}

                  {p.notes && (
                    <div className="text-xs text-muted-foreground bg-muted/40 rounded p-2">{p.notes}</div>
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
