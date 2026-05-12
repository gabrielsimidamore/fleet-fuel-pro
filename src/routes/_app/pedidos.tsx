import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { usePedidos } from "@/hooks/use-fleet-data";

export const Route = createFileRoute("/_app/pedidos")({
  component: PedidosPage,
});

const statusMap: Record<string, string> = {
  new: "pendente",
  viewed: "pendente",
  processing: "em_separacao",
  shipped: "enviado",
  delivered: "entregue",
};

function PedidosPage() {
  const { data: pedidos = [], isLoading } = usePedidos();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <p className="text-sm text-muted-foreground">Acompanhe o status de entrega</p>
      </div>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">Carregando pedidos...</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Número</th>
                  <th className="text-left px-4 py-3 font-medium">Veículo</th>
                  <th className="text-left px-4 py-3 font-medium">Data</th>
                  <th className="text-right px-4 py-3 font-medium">Total</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                      Nenhum pedido encontrado.
                    </td>
                  </tr>
                ) : (
                  pedidos.map((p) => (
                    <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{p.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-4 py-3">
                        {p.veiculos ? `${p.veiculos.frota_number} — ${p.veiculos.plate}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        R$ {(p.total ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={statusMap[p.status] ?? p.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
