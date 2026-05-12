import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { filiaisAdmin } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin/clientes")({
  component: ClientesPage,
});

function ClientesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Clientes</h1>
        <p className="text-sm text-muted-foreground">Filiais ativas no FleetControl</p>
      </div>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Filial</th>
                <th className="text-left px-4 py-3 font-medium">Cidade/UF</th>
                <th className="text-right px-4 py-3 font-medium">Veículos</th>
                <th className="text-right px-4 py-3 font-medium">Gasto Mês</th>
                <th className="text-left px-4 py-3 font-medium">Última atividade</th>
                <th className="text-right px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filiaisAdmin.map((f) => (
                <tr key={f.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{f.nome}</td>
                  <td className="px-4 py-3 text-muted-foreground">{f.cidade}/{f.uf}</td>
                  <td className="px-4 py-3 text-right">{f.veiculos}</td>
                  <td className="px-4 py-3 text-right">R$ {f.gastoMes.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3 text-muted-foreground">{f.ultimaAtividade}</td>
                  <td className="px-4 py-3 text-right"><Button variant="outline" size="sm">Ver perfil</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
