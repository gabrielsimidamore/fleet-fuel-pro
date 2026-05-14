import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, TrendingUp, Truck, Package, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { fetchRelatorioGastos, fetchRelatorioPecas, fetchRelatorioVeiculos } from "@/lib/queries";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/relatorios")({ component: RelatoriosPage });

const COLORS = ["#3b82f6","#22c55e","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#f97316","#ec4899","#10b981","#6366f1"];

function exportCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const content = [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  toast.success(`${filename} exportado!`);
}

function RelatoriosPage() {
  const { data: gastos = [] }   = useQuery({ queryKey: ["relGastos"],    queryFn: fetchRelatorioGastos });
  const { data: pecas = [] }    = useQuery({ queryKey: ["relPecas"],     queryFn: fetchRelatorioPecas });
  const { data: veiculos = [] } = useQuery({ queryKey: ["relVeiculos"],  queryFn: fetchRelatorioVeiculos });

  const totalGeral = gastos.reduce((s, g) => s + g.total, 0);
  const totalManut = veiculos.reduce((s, v) => s + v.total_manut, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-sm text-muted-foreground">Dados reais do sistema</p>
        </div>
        <Button variant="outline" onClick={() => exportCSV("relatorio-completo.csv",
          ["Frota","Placa","Modelo","KM","Manutenções","Gasto Total"],
          veiculos.map(v => [v.frota, v.plate, v.model, v.km, v.total_manut, v.total_gasto.toFixed(2)])
        )}><Download className="h-4 w-4 mr-2" /> Exportar Tudo</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Gasto Total", value: `R$ ${totalGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-blue-600 bg-blue-50" },
          { label: "Manutenções", value: totalManut,          icon: FileText, color: "text-green-600 bg-green-50" },
          { label: "Veículos",   value: veiculos.length,      icon: Truck,   color: "text-purple-600 bg-purple-50" },
          { label: "Tipos de peça", value: pecas.length,      icon: Package, color: "text-orange-600 bg-orange-50" },
        ].map(k => (
          <Card key={k.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${k.color}`}>
                <k.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold">{k.value}</div>
                <div className="text-xs text-muted-foreground">{k.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gastos por filial */}
      {gastos.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Gastos por Filial</CardTitle>
            <Button variant="outline" size="sm" onClick={() => exportCSV("gastos-por-filial.csv",
              ["Filial","Total R$","Manutenções"], gastos.map(g => [g.filial, g.total.toFixed(2), g.count])
            )}><Download className="h-3.5 w-3.5 mr-1" /> CSV</Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={gastos} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="filial" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [`R$ ${v.toFixed(2)}`, "Gasto"]} />
                <Bar dataKey="total" radius={[4,4,0,0]}>
                  {gastos.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Grid: peças + veículos */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Peças mais trocadas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Peças Mais Trocadas</CardTitle>
            <Button variant="outline" size="sm" onClick={() => exportCSV("pecas-mais-trocadas.csv",
              ["Peça","Quantidade"], pecas.map(p => [p.peca, p.qtd])
            )}><Download className="h-3.5 w-3.5 mr-1" /> CSV</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {pecas.slice(0, 8).map((p, i) => (
              <div key={p.peca} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium truncate">{p.peca}</span>
                    <span className="text-xs font-bold text-primary ml-2">{p.qtd}×</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(p.qtd / (pecas[0]?.qtd ?? 1)) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
            {pecas.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum dado ainda.</p>}
          </CardContent>
        </Card>

        {/* Veículos com mais gastos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Veículos — Custo Total</CardTitle>
            <Button variant="outline" size="sm" onClick={() => exportCSV("custo-por-veiculo.csv",
              ["Frota","Placa","Modelo","KM","Manutenções","Gasto R$"],
              veiculos.map(v => [v.frota, v.plate, v.model, v.km, v.total_manut, v.total_gasto.toFixed(2)])
            )}><Download className="h-3.5 w-3.5 mr-1" /> CSV</Button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-xs min-w-[360px]">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-medium">Frota</th>
                  <th className="text-left py-2 font-medium">Modelo</th>
                  <th className="text-right py-2 font-medium">KM</th>
                  <th className="text-right py-2 font-medium">Manut.</th>
                  <th className="text-right py-2 font-medium">Gasto</th>
                </tr>
              </thead>
              <tbody>
                {veiculos.map(v => (
                  <tr key={v.frota} className="border-b border-border/50 last:border-0">
                    <td className="py-2 font-mono font-semibold">{v.frota}</td>
                    <td className="py-2 text-muted-foreground truncate max-w-[100px]">{v.model}</td>
                    <td className="py-2 text-right">{v.km.toLocaleString("pt-BR")}</td>
                    <td className="py-2 text-right">{v.total_manut}</td>
                    <td className="py-2 text-right font-semibold">R$ {v.total_gasto.toFixed(0)}</td>
                  </tr>
                ))}
                {veiculos.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-muted-foreground">Nenhum dado ainda.</td></tr>}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
