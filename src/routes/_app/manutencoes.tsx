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
import { useVeiculosList, usePecas } from "@/hooks/use-fleet-data";
import { insertManutencao } from "@/lib/queries";
import { useQueryClient } from "@tanstack/react-query";
import { fleetKeys } from "@/hooks/use-fleet-data";

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
  const [tipo, setTipo] = useState<string>("Troca de Óleo");
  const [km, setKm] = useState<string>("");
  const [mecânico, setMecânico] = useState("");
  const [oficina, setOficina] = useState("");
  const [problema, setProblema] = useState("");
  const [obs, setObs] = useState("");
  const [usarSugestao, setUsarSugestao] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pecas, setPecas] = useState<{ cat: string; nome: string; cod: string; qtd: number; preco: number }[]>([
    { cat: "Lubrificantes", nome: "Óleo Motor 15W40 5L", cod: "OL001", qtd: 1, preco: 35.9 },
  ]);

  const { data: veiculos = [], isLoading: loadingV } = useVeiculosList();
  const { data: catalogo = [] } = usePecas();
  const queryClient = useQueryClient();

  const v = veiculos.find((x) => x.id === veiculoId);
  const sug = tipoSugestao[tipo];
  const kmAtual = Number(km || v?.current_km || 0);
  const proximoKm = sug ? kmAtual + sug.km : kmAtual;
  const proximaData = sug
    ? new Date(Date.now() + sug.meses * 30 * 86400000).toISOString().slice(0, 10)
    : "";

  const total = pecas.reduce((s, p) => s + p.qtd * p.preco, 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!veiculoId) { toast.error("Selecione um veículo."); return; }
    setSaving(true);
    try {
      await insertManutencao({
        veiculo_id: veiculoId,
        date: new Date().toISOString().slice(0, 10),
        type: tipo,
        km_at_maintenance: kmAtual,
        mechanic: mecânico || undefined,
        workshop: oficina || undefined,
        cost: total,
        problem_identified: problema || undefined,
        items_replaced: pecas.map((p) => p.nome),
        notes: obs || undefined,
        next_maintenance_date: usarSugestao ? proximaData : undefined,
        next_maintenance_km: usarSugestao ? proximoKm : undefined,
        next_maintenance_type: usarSugestao ? tipo : undefined,
      });
      await queryClient.invalidateQueries({ queryKey: fleetKeys.veiculos });
      await queryClient.invalidateQueries({ queryKey: fleetKeys.manutencoes });
      toast.success("Manutenção registrada com sucesso!");
      // reset
      setVeiculoId("");
      setKm("");
      setPecas([{ cat: "Lubrificantes", nome: "Óleo Motor 15W40 5L", cod: "OL001", qtd: 1, preco: 35.9 }]);
      setProblema("");
      setObs("");
    } catch (err) {
      toast.error("Erro ao registrar manutenção.");
      console.error(err);
    } finally {
      setSaving(false);
    }
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
                <SelectTrigger><SelectValue placeholder={loadingV ? "Carregando..." : "Selecione..."} /></SelectTrigger>
                <SelectContent>
                  {veiculos.map((x) => (
                    <SelectItem key={x.id} value={x.id}>{x.frota_number} — {x.plate}</SelectItem>
                  ))}
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
              <Input type="number" value={km} onChange={(e) => setKm(e.target.value)} placeholder={v?.current_km?.toString() ?? "0"} />
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
            <div className="space-y-1.5">
              <Label>Mecânico</Label>
              <Input value={mecânico} onChange={(e) => setMecânico(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Oficina</Label>
              <Input value={oficina} onChange={(e) => setOficina(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Custo total (R$)</Label>
              <Input type="number" step="0.01" value={total.toFixed(2)} readOnly />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">3. Problema identificado</CardTitle></CardHeader>
          <CardContent>
            <Textarea rows={3} placeholder="Descreva o problema..." value={problema} onChange={(e) => setProblema(e.target.value)} />
          </CardContent>
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
                <div className="col-span-2">
                  <Label className="text-xs">Categoria</Label>
                  <Input value={p.cat} onChange={(e) => setPecas(pecas.map((x, j) => j === i ? { ...x, cat: e.target.value } : x))} />
                </div>
                <div className="col-span-4">
                  <Label className="text-xs">Nome</Label>
                  <Input
                    value={p.nome}
                    onChange={(e) => setPecas(pecas.map((x, j) => j === i ? { ...x, nome: e.target.value } : x))}
                    list={`pecas-list-${i}`}
                  />
                  <datalist id={`pecas-list-${i}`}>
                    {catalogo.map((c) => <option key={c.id} value={c.name} />)}
                  </datalist>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Código</Label>
                  <Input value={p.cod} onChange={(e) => setPecas(pecas.map((x, j) => j === i ? { ...x, cod: e.target.value } : x))} />
                </div>
                <div className="col-span-1">
                  <Label className="text-xs">Qtd</Label>
                  <Input type="number" value={p.qtd} onChange={(e) => setPecas(pecas.map((x, j) => j === i ? { ...x, qtd: Number(e.target.value) } : x))} />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Preço un.</Label>
                  <Input type="number" step="0.01" value={p.preco} onChange={(e) => setPecas(pecas.map((x, j) => j === i ? { ...x, preco: Number(e.target.value) } : x))} />
                </div>
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
          <CardContent>
            <Textarea rows={2} value={obs} onChange={(e) => setObs(e.target.value)} />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline">Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar Manutenção"}</Button>
        </div>

        <Card className="bg-muted/40">
          <CardContent className="p-4 text-xs text-muted-foreground">
            Catálogo disponível: {catalogo.length} peças cadastradas no banco de dados.
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
