import { createFileRoute } from "@tanstack/react-router";
import { Building2, Truck, AlertCircle, DollarSign, TrendingUp, Receipt } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { faturamentoAnual, topPecas, filiaisAdmin, cotacoesMock } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin/dashboard")({
  component: AdminDashboard,
});

const KPI = ({ icon: Icon, label, value, tone }: any) => (
  <Card>
    <CardContent className="p-5 flex items-center gap-4">
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold mt-0.5">{value}</div>
      </div>
    </CardContent>
  </Card>
);

const pedidosFilial = filiaisAdmin.map((f, i) => ({ name: f.nome.split(" ").pop(), value: 12 + i * 5, fill: ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"][i] }));

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Administrativo</h1>
        <p className="text-sm text-muted-foreground">Visão consolidada Morelate</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPI icon={Building2} label="Filiais" value="3" tone="bg-info/15 text-info" />
        <KPI icon={Truck} label="Veículos" value="15" tone="bg-primary/15 text-primary" />
        <KPI icon={AlertCircle} label="Aguardando" value="7" tone="bg-destructive/15 text-destructive" />
        <KPI icon={Receipt} label="Ticket Médio" value="R$ 890" tone="bg-purple-500/15 text-purple-600" />
        <KPI icon={TrendingUp} label="Vencidas" value="4" tone="bg-warning/15 text-warning-foreground" />
        <KPI icon={DollarSign} label="Faturamento" value="R$ 48.7k" tone="bg-success/15 text-success" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Faturamento mensal (12m)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={faturamentoAnual}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="valor" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Top 5 peças mais vendidas</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topPecas} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis dataKey="nome" type="category" width={140} stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="qtd" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Pedidos por filial</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pedidosFilial} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {pedidosFilial.map((p, i) => <Cell key={i} fill={p.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Cotações aguardando aprovação</CardTitle></CardHeader>
          <CardContent className="px-0">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-2 font-medium">Cotação</th>
                  <th className="text-left px-2 py-2 font-medium">Veículo</th>
                  <th className="text-left px-2 py-2 font-medium">Data</th>
                  <th className="text-right px-6 py-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {cotacoesMock.filter((c) => c.status === "pendente").map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="px-6 py-2.5 font-medium">{c.id}</td>
                    <td className="px-2 py-2.5">{c.veiculo}</td>
                    <td className="px-2 py-2.5 text-muted-foreground">{new Date(c.data).toLocaleDateString("pt-BR")}</td>
                    <td className="px-6 py-2.5 text-right">R$ {c.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
