import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/admin/relatorios")({
  component: RelatoriosPage,
});

const reports = [
  { title: "Histórico de Manutenções", desc: "Por veículo, no período selecionado" },
  { title: "Gastos por Filial", desc: "Total de gastos no período" },
  { title: "Peças Mais Compradas", desc: "Ranking por volume" },
];

function RelatoriosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-sm text-muted-foreground">Exporte dados para análise</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {reports.map((r) => (
          <Card key={r.title}>
            <CardContent className="p-5 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">{r.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{r.desc}</div>
              </div>
              <Button variant="outline" size="sm" className="w-full"><Download className="h-4 w-4 mr-2" /> Exportar CSV</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
