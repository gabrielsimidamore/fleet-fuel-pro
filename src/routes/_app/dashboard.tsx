import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Truck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShoppingCart,
  DollarSign,
  Tag,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import {
  veiculos,
  gastosMensais,
  pecasCategoria,
  kmMedio,
  promocoes,
} from "@/lib/mock-data";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});

const KPI = ({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: string;
}) => (
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

function DashboardPage() {
  const total = veiculos.length;
  const emDia = veiculos.filter((v) => v.status === "em_dia").length;
  const atencao = veiculos.filter((v) => v.status === "atencao").length;
  const vencidos = veiculos.filter((v) => v.status === "vencido").length;
  const proximas = [...veiculos]
    .sort((a, b) => a.nextDate.localeCompare(b.nextDate))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral da sua filial</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPI icon={Truck} label="Total Veículos" value={String(total)} tone="bg-info/15 text-info" />
        <KPI icon={CheckCircle2} label="Em Dia" value={String(emDia)} tone="bg-success/15 text-success" />
        <KPI icon={AlertTriangle} label="Atenção" value={String(atencao)} tone="bg-warning/15 text-warning-foreground" />
        <KPI icon={XCircle} label="Vencidos" value={String(vencidos)} tone="bg-destructive/15 text-destructive" />
        <KPI icon={ShoppingCart} label="Cotações" value="3" tone="bg-orange-500/15 text-orange-600" />
        <KPI icon={DollarSign} label="Gasto Mês" value="R$ 18.7k" tone="bg-purple-500/15 text-purple-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gastos mensais em peças (R$)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={gastosMensais}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="valor" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Peças por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pecasCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90}>
                  {pecasCategoria.map((p, i) => (
                    <Cell key={i} fill={p.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
              {pecasCategoria.map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: p.fill }} />
                  <span className="text-muted-foreground">{p.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">KM médio por mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={kmMedio}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="km" stroke="var(--primary)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Próximas manutenções</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-2 font-medium">Veículo</th>
                  <th className="text-left px-2 py-2 font-medium">Tipo</th>
                  <th className="text-left px-2 py-2 font-medium">Data</th>
                  <th className="text-left px-6 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {proximas.map((v) => (
                  <tr key={v.id} className="border-b border-border last:border-0">
                    <td className="px-6 py-2.5 font-medium">{v.frota}</td>
                    <td className="px-2 py-2.5 text-muted-foreground">{v.nextType}</td>
                    <td className="px-2 py-2.5 text-muted-foreground">
                      {new Date(v.nextDate).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-2.5">
                      <StatusBadge status={v.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" /> Promoções da semana
          </CardTitle>
          <Link to="/promocoes" className="text-xs text-primary hover:underline">
            Ver todas
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {promocoes.map((p) => (
              <div key={p.id} className="rounded-lg border border-border bg-card p-4 flex flex-col">
                <div className="aspect-video rounded-md bg-gradient-to-br from-muted to-accent mb-3 flex items-center justify-center text-muted-foreground text-xs">
                  {p.categoria}
                </div>
                <div className="font-medium text-sm">{p.nome}</div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xs text-muted-foreground line-through">R$ {p.original.toFixed(2)}</span>
                  <span className="text-lg font-bold text-success">R$ {p.promo.toFixed(2)}</span>
                  <span className="ml-auto text-xs font-semibold text-orange-600 bg-orange-500/10 px-1.5 py-0.5 rounded">-{p.desconto}%</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Válida até {new Date(p.validade).toLocaleDateString("pt-BR")}</div>
                <Button size="sm" className="mt-3">Adicionar ao Pedido</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
