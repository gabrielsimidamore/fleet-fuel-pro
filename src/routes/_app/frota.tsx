import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useVeiculos } from "@/hooks/use-fleet-data";
import { insertVeiculo } from "@/lib/queries";
import { useQueryClient } from "@tanstack/react-query";
import { fleetKeys } from "@/hooks/use-fleet-data";
import type { VeiculoStatus } from "@/lib/queries";

export const Route = createFileRoute("/_app/frota")({
  component: FrotaPage,
});

function FrotaPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const { data: veiculos = [], isLoading } = useVeiculos();

  const list = veiculos.filter((v) => {
    if (filter !== "all" && v.statusDisplay !== filter) return false;
    if (!q) return true;
    return (
      v.plate.toLowerCase().includes(q.toLowerCase()) ||
      v.frota_number.toLowerCase().includes(q.toLowerCase())
    );
  });

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setSaving(true);
    try {
      await insertVeiculo({
        frota_number: fd.get("frota") as string,
        plate: fd.get("plate") as string,
        brand: fd.get("brand") as string,
        model: fd.get("model") as string,
        year: Number(fd.get("year")),
        current_km: Number(fd.get("km")),
      });
      await queryClient.invalidateQueries({ queryKey: fleetKeys.veiculos });
      toast.success("Veículo cadastrado com sucesso!");
      setOpen(false);
      form.reset();
    } catch (err) {
      toast.error("Erro ao cadastrar veículo.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Frota</h1>
          <p className="text-sm text-muted-foreground">Gerencie os veículos da sua filial</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Novo Veículo</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cadastrar veículo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Frota</Label>
                <Input name="frota" placeholder="FR-1007" required />
              </div>
              <div className="space-y-1.5">
                <Label>Placa</Label>
                <Input name="plate" placeholder="ABC-1D23" required />
              </div>
              <div className="space-y-1.5">
                <Label>Marca</Label>
                <Input name="brand" placeholder="VW" />
              </div>
              <div className="space-y-1.5">
                <Label>Modelo</Label>
                <Input name="model" placeholder="VW 17.230" required />
              </div>
              <div className="space-y-1.5">
                <Label>Ano</Label>
                <Input name="year" type="number" placeholder="2024" />
              </div>
              <div className="space-y-1.5">
                <Label>KM Atual</Label>
                <Input name="km" type="number" placeholder="0" />
              </div>
              <div className="col-span-2 flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por placa ou frota..." className="pl-9" />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="em_dia">Em Dia</SelectItem>
              <SelectItem value="atencao">Atenção</SelectItem>
              <SelectItem value="vencido">Vencido</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">Carregando frota...</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Frota</th>
                  <th className="text-left px-4 py-3 font-medium">Placa</th>
                  <th className="text-left px-4 py-3 font-medium">Modelo</th>
                  <th className="text-left px-4 py-3 font-medium">Ano</th>
                  <th className="text-right px-4 py-3 font-medium">KM</th>
                  <th className="text-left px-4 py-3 font-medium">Próxima Manutenção</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-sm text-muted-foreground">
                      Nenhum veículo encontrado.
                    </td>
                  </tr>
                ) : (
                  list.map((v) => (
                    <tr key={v.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{v.frota_number}</td>
                      <td className="px-4 py-3">{v.plate}</td>
                      <td className="px-4 py-3">{v.model}</td>
                      <td className="px-4 py-3">{v.year}</td>
                      <td className="px-4 py-3 text-right">{v.current_km.toLocaleString("pt-BR")}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {v.nextDate
                          ? `${new Date(v.nextDate).toLocaleDateString("pt-BR")} — ${v.nextType ?? ""}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={v.statusDisplay as VeiculoStatus} /></td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Button variant="ghost" size="sm">Ver</Button>
                        <Button variant="outline" size="sm">Manutenção</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
