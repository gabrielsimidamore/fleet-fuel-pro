import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Trash2, Plus, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/status-badge";
import { toast } from "sonner";
import { useCotacoes, usePecas, usePromocoes } from "@/hooks/use-fleet-data";

export const Route = createFileRoute("/_app/cotacoes")({
  component: CotacoesPage,
});

const statusMap: Record<string, string> = {
  pending: "pendente",
  approved: "aprovada",
  rejected: "rejeitada",
  sent: "enviado",
};

function CotacoesPage() {
  const [items, setItems] = useState([
    { code: "OL001", nome: "Óleo Motor 15W40 5L", qtd: 1, preco: 35.9 },
    { code: "FO001", nome: "Filtro de Óleo", qtd: 1, preco: 45.0 },
    { code: "PF001", nome: "Pastilhas de Freio Dianteiras", qtd: 1, preco: 280.0 },
  ]);
  const [q, setQ] = useState("");
  const [obs, setObs] = useState("");

  const { data: cotacoes = [], isLoading: loadingC } = useCotacoes();
  const { data: catalogo = [] } = usePecas();
  const { data: promocoes = [] } = usePromocoes();

  const results = catalogo.filter(
    (p) =>
      q &&
      (p.name.toLowerCase().includes(q.toLowerCase()) ||
        (p.code ?? "").toLowerCase().includes(q.toLowerCase()))
  );

  const total = items.reduce((s, i) => s + i.qtd * i.preco, 0);

  const addPart = (p: typeof catalogo[number]) => {
    setItems([...items, { code: p.code ?? "", nome: p.name, qtd: 1, preco: Number(p.price ?? 0) }]);
    setQ("");
  };

  const aprovar = () => {
    if (!confirm(`Confirma o envio do pedido de R$ ${total.toFixed(2)}?`)) return;
    toast.success("Pedido enviado com sucesso! Você receberá a confirmação em breve.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cotações</h1>
        <p className="text-sm text-muted-foreground">Aprove ou rejeite cotações geradas automaticamente</p>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loadingC ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">Carregando cotações...</p>
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
                {cotacoes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                      Nenhuma cotação encontrada.
                    </td>
                  </tr>
                ) : (
                  cotacoes.map((c) => (
                    <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{c.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-4 py-3">
                        {c.veiculos ? `${c.veiculos.frota_number} — ${c.veiculos.plate}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3 text-right">R$ {(c.total ?? 0).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={statusMap[c.status] ?? c.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold mb-4">Nova Cotação</h2>

        <Card className="mb-4">
          <CardHeader><CardTitle className="text-base">📋 Itens</CardTitle></CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Peça</th>
                  <th className="text-left px-4 py-2 font-medium">Código</th>
                  <th className="text-center px-4 py-2 font-medium">Qtd</th>
                  <th className="text-right px-4 py-2 font-medium">Preço</th>
                  <th className="text-right px-4 py-2 font-medium">Total</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 py-2">{it.nome}</td>
                    <td className="px-4 py-2 text-muted-foreground">{it.code}</td>
                    <td className="px-4 py-2 text-center">
                      <Input
                        className="h-7 w-16 mx-auto text-center"
                        type="number"
                        value={it.qtd}
                        onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, qtd: Number(e.target.value) } : x))}
                      />
                    </td>
                    <td className="px-4 py-2 text-right">R$ {it.preco.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right font-medium">R$ {(it.qtd * it.preco).toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">
                      <Button variant="ghost" size="icon" onClick={() => setItems(items.filter((_, j) => j !== i))}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader><CardTitle className="text-base">🔍 Adicionar peças do catálogo</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome ou código..." className="pl-9" />
            </div>
            {results.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-2">
                {results.slice(0, 6).map((p) => (
                  <div key={p.id} className="flex items-center justify-between border border-border rounded-md p-3">
                    <div>
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.code} · {p.category} · R$ {Number(p.price ?? 0).toFixed(2)}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => addPart(p)}>
                      <Plus className="h-3 w-3 mr-1" /> Adicionar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {promocoes.length > 0 && (
          <Card className="mb-4 border-info/40 bg-info/5">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-info" /> Você pode precisar também...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                {promocoes.slice(0, 4).map((p) => (
                  <div key={p.id} className="border border-info/30 bg-card rounded-md p-3">
                    <div className="text-sm font-medium">{p.title}</div>
                    <div className="text-sm text-success font-semibold mt-1">R$ {p.promo_price.toFixed(2)}</div>
                    <Button size="sm" variant="outline" className="w-full mt-2">
                      <Plus className="h-3 w-3 mr-1" /> Adicionar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-5 space-y-4">
            <Textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2} placeholder="Observações..." />
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground">{items.length} itens</div>
              <div className="text-2xl font-bold">R$ {total.toFixed(2)}</div>
            </div>
            <div className="flex gap-2 justify-end flex-wrap">
              <Button variant="outline">💾 Salvar Rascunho</Button>
              <Button variant="outline" className="text-destructive border-destructive/40">❌ Rejeitar</Button>
              <Button onClick={aprovar} className="bg-success text-success-foreground hover:bg-success/90">
                ✅ Aprovar e Enviar Pedido
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
