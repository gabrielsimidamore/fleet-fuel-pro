import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { promocoes } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin/promocoes")({
  component: AdminPromocoes,
});

function AdminPromocoes() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Promoções</h1>
          <p className="text-sm text-muted-foreground">Gerencie campanhas ativas</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-1" /> Nova Promoção</Button>
      </div>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Peça</th>
                <th className="text-right px-4 py-3 font-medium">Original</th>
                <th className="text-right px-4 py-3 font-medium">Promo</th>
                <th className="text-right px-4 py-3 font-medium">Desc.</th>
                <th className="text-left px-4 py-3 font-medium">Validade</th>
                <th className="text-center px-4 py-3 font-medium">Ativa</th>
              </tr>
            </thead>
            <tbody>
              {promocoes.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{p.nome}</td>
                  <td className="px-4 py-3 text-right line-through text-muted-foreground">R$ {p.original.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-success font-semibold">R$ {p.promo.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">-{p.desconto}%</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(p.validade).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3 text-center"><Switch defaultChecked /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
