import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { pedidosMock, filiaisAdmin } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/pedidos")({
  component: AdminPedidos,
});

const STATUSES = ["novo", "visualizado", "em_separacao", "enviado", "entregue"];
const STATUS_LABEL: Record<string, string> = {
  novo: "Novo",
  visualizado: "Visualizado",
  em_separacao: "Em Separação",
  enviado: "Enviado",
  entregue: "Entregue",
};

function AdminPedidos() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pedidos — Todos os clientes</h1>
        <p className="text-sm text-muted-foreground">Atualize o status de cada pedido</p>
      </div>

      <Card>
        <CardContent className="p-4 flex gap-3 flex-wrap">
          <Select defaultValue="all"><SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as filiais</SelectItem>
              {filiaisAdmin.map((f) => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select defaultValue="all"><SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Pedido</th>
                <th className="text-left px-4 py-3 font-medium">Filial</th>
                <th className="text-left px-4 py-3 font-medium">Veículo</th>
                <th className="text-left px-4 py-3 font-medium">Data</th>
                <th className="text-right px-4 py-3 font-medium">Total</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Atualizar</th>
              </tr>
            </thead>
            <tbody>
              {pedidosMock.map((p, i) => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{p.id}</td>
                  <td className="px-4 py-3">{filiaisAdmin[i % filiaisAdmin.length].nome}</td>
                  <td className="px-4 py-3">{p.veiculo}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(p.data).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3 text-right">R$ {p.total.toFixed(2)}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3">
                    <Select defaultValue={p.status} onValueChange={(v) => toast.success(`Status atualizado para ${STATUS_LABEL[v]}`)}>
                      <SelectTrigger className="w-[150px] h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
