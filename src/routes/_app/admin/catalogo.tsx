import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { catalogo } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin/catalogo")({
  component: CatalogoPage,
});

const aguardando = [
  { code: "—", nome: "Bomba d'água VW", marca: "Bosch", ref: "BWP-9012", filial: "MG-01" },
  { code: "—", nome: "Sensor de ABS", marca: "Continental", ref: "CTL-AB55", filial: "RJ-01" },
];

function CatalogoPage() {
  const [tab, setTab] = useState("ativo");
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Catálogo de Peças</h1>
          <p className="text-sm text-muted-foreground">Gerencie peças e precificações</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-1" /> Nova Peça</Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="ativo">Catálogo Ativo</TabsTrigger>
          <TabsTrigger value="aguardando">
            Aguardando Precificação <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-warning text-warning-foreground text-[10px] font-bold">{aguardando.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ativo" className="mt-4">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Código</th>
                    <th className="text-left px-4 py-3 font-medium">Nome</th>
                    <th className="text-left px-4 py-3 font-medium">Categoria</th>
                    <th className="text-right px-4 py-3 font-medium">Preço</th>
                    <th className="text-right px-4 py-3 font-medium">Intervalo KM</th>
                    <th className="text-right px-4 py-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {catalogo.map((p) => (
                    <tr key={p.code} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{p.code}</td>
                      <td className="px-4 py-3">{p.nome}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.categoria}</td>
                      <td className="px-4 py-3 text-right">R$ {p.preco.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">{p.intervalo ? `${p.intervalo.toLocaleString("pt-BR")} km` : "—"}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Button variant="ghost" size="sm">Editar</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aguardando" className="mt-4">
          <Card className="bg-warning/5 border-warning/30">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-warning/10 text-xs text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Nome</th>
                    <th className="text-left px-4 py-3 font-medium">Marca</th>
                    <th className="text-left px-4 py-3 font-medium">Ref.</th>
                    <th className="text-left px-4 py-3 font-medium">Filial</th>
                    <th className="text-right px-4 py-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {aguardando.map((p, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{p.nome}</td>
                      <td className="px-4 py-3">{p.marca}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.ref}</td>
                      <td className="px-4 py-3">{p.filial}</td>
                      <td className="px-4 py-3 text-right"><Button size="sm">Adicionar Preço e Ativar</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
