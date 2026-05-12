import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { promocoes } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/promocoes")({
  component: PromocoesPage,
});

function PromocoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Promoções</h1>
        <p className="text-sm text-muted-foreground">Ofertas exclusivas para sua filial</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promocoes.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-4 space-y-3">
              <div className="aspect-video rounded-md bg-gradient-to-br from-muted to-accent flex items-center justify-center text-muted-foreground text-xs relative">
                <span className="absolute top-2 left-2 text-[10px] font-bold bg-destructive text-destructive-foreground px-2 py-0.5 rounded">PROMOÇÃO</span>
                {p.categoria}
              </div>
              <div className="font-medium">{p.nome}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-muted-foreground line-through">R$ {p.original.toFixed(2)}</span>
                <span className="text-xl font-bold text-success">R$ {p.promo.toFixed(2)}</span>
                <span className="ml-auto text-xs font-semibold text-orange-600 bg-orange-500/10 px-1.5 py-0.5 rounded">-{p.desconto}%</span>
              </div>
              <div className="text-xs text-muted-foreground">Válida até {new Date(p.validade).toLocaleDateString("pt-BR")}</div>
              <Button className="w-full" size="sm">Adicionar ao Pedido</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
