import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { veiculos, catalogo } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/manutencoes")({
  component: ManutencoesPage,
});

const tipoSugestao: Record<string, { km: number; meses: number }> = {
  "Troca de Óleo": { km: 15000, meses: 6 },
  "Revisão Preventiva": { km: 30000, meses: 12 },
  "Revisão de Freios": { km: 50000, meses: 18 },
  "Troca de Correia Dentada": { km: 60000, meses: 24 },
};

function ManutencoesPage() {
  const [veiculoId, setVeiculoId] = useState<string>("");
  const v = veiculos.find((x) => x.id === veiculoId);
  const [tipo, setTipo] = useState<string>("Troca de Óleo");
  const [km, setKm] = useState<string>("");
  const [pecas, setPecas] = useState<{ cat: string; nome: string; cod: string; qtd: number; preco: number }[]>([
    { cat: "Lubrificantes", nome: "Óleo Motor 15W40 5L", cod: "OL001", qtd: 1, preco: 35.9 },
  ]);
  const [usarSugestao, setUsarSugestao] = useState(true);

  const sug = tipoSugestao[tipo];
  const kmAtual = Number(km || v?.km || 0);
  const proximoKm = sug ? kmAtual + sug.km : kmAtual;
  const proximaData = sug ? new Date(Date.now() + sug.meses * 30 * 86400000).toISOString().slice(0, 10) : "";

  const total = pecas.reduce((s, p) => s + p.qtd * p.preco, 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Manutenção registrada! Cotação gerada automaticamente.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nova Manutenção</h1>
        <p className="text-sm text-muted-foreground">Registre serviços e peças trocadas</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-base">1. Veículo</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Frota / Placa</Label>
              <Select value={veiculoId} onValueChange={setVeiculoId}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {veiculos.map((x) => <SelectItem key={x.id} value={x.id}>{x.frota} — {x.plate}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Modelo</Label>
              <Input value={v?.model ?? ""} readOnly />
            </div>
            <div className="space-y-1.5">
              <Label>Ano</Label>
              <Input value={v?.year ?? ""} readOnly />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">2. Dados da manutenção</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Data</Label>
              <Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
            <div className="space-y-1.5">
              <Label>KM no momento</Label>
              <Input type="number" value={km} onChange={(e) => setKm(e.target.value)} placeholder={v?.km.toString() ?? "0"} />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de serviço</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(tipoSugestao).concat(["Revisão Geral", "Outro"]).map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Mecânico</Label><Input /></div>
            <div className="space-y-1.5"><Label>Oficina</Label><Input /></div>
            <div className="space-y-1.5"><Label>Custo total (R$)</Label><Input type="number" step="0.01" defaultValue={total.toFixed(2)} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">3. Problema identificado</CardTitle></CardHeader>
          <CardContent><Textarea rows={3} placeholder="Descreva o problema..." /></CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">4. Peças trocadas</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => setPecas([...pecas, { cat: "", nome: "", cod: "", qtd: 1, preco: 0 }])}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar peça
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {pecas.map((p, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-2"><Label className="text-xs">Categoria</Label><Input value={p.cat} onChange={(e) => setPecas(pecas.map((x, j) => j === i ? { ...x, cat: e.target.value } : x))} /></div>
                <div className="col-span-4"><Label className="text-xs">Nome</Label><Input value={p.nome} onChange={(e) => setPecas(pecas.map((x, j) => j === i ? { ...x, nome: e.target.value } : x))} /></div>
                <div className="col-span-2"><Label className="text-xs">Código</Label><Input value={p.cod} onChange={(e) => setPecas(pecas.map((x, j) => j === i ? { ...x, cod: e.target.value } : x))} /></div>
                <div className="col-span-1"><Label className="text-xs">Qtd</Label><Input type="number" value={p.qtd} onChange={(e) => setPecas(pecas.map((x, j) => j === i ? { ...x, qtd: Number(e.target.value) } : x))} /></div>
                <div className="col-span-2"><Label className="text-xs">Preço un.</Label><Input type="number" step="0.01" value={p.preco} onChange={(e) => setPecas(pecas.map((x, j) => j === i ? { ...x, preco: Number(e.target.value) } : x))} /></div>
                <div className="col-span-1">
                  <Button type="button" variant="ghost" size="icon" onClick={() => setPecas(pecas.filter((_, j) => j !== i))}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="text-right text-sm font-semibold pt-2">Total: R$ {total.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">5. Próxima manutenção</CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Usar sugestão</span>
              <Switch checked={usarSugestao} onCheckedChange={setUsarSugestao} />
            </div>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div className="space-y-1.5"><Label>Data sugerida</Label><Input type="date" defaultValue={proximaData} disabled={usarSugestao} /></div>
            <div className="space-y-1.5"><Label>KM sugerido</Label><Input type="number" defaultValue={proximoKm} disabled={usarSugestao} /></div>
            <div className="space-y-1.5"><Label>Tipo</Label><Input defaultValue={tipo} disabled={usarSugestao} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">6. Observações</CardTitle></CardHeader>
          <CardContent><Textarea rows={2} /></CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline">Cancelar</Button>
          <Button type="submit">Salvar Manutenção</Button>
        </div>

        <Card className="bg-muted/40">
          <CardContent className="p-4 text-xs text-muted-foreground">
            Catálogo disponível para autocomplete: {catalogo.length} peças cadastradas.
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
