import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { veiculos } from "@/lib/mock-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/frota")({
  component: FrotaPage,
});

function FrotaPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const list = veiculos.filter((v) => {
    if (filter !== "all" && v.status !== filter) return false;
    if (!q) return true;
    return v.plate.toLowerCase().includes(q.toLowerCase()) || v.frota.toLowerCase().includes(q.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Frota</h1>
          <p className="text-sm text-muted-foreground">Gerencie os veículos da sua filial</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Novo Veículo</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cadastrar veículo</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Veículo cadastrado (mock).");
              }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="space-y-1.5">
                <Label>Frota</Label>
                <Input placeholder="FR-1007" />
              </div>
              <div className="space-y-1.5">
                <Label>Placa</Label>
                <Input placeholder="ABC-1D23" />
              </div>
              <div className="space-y-1.5">
                <Label>Marca</Label>
                <Input placeholder="VW" />
              </div>
              <div className="space-y-1.5">
                <Label>Modelo</Label>
                <Input placeholder="VW 17.230" />
              </div>
              <div className="space-y-1.5">
                <Label>Ano</Label>
                <Input type="number" placeholder="2024" />
              </div>
              <div className="space-y-1.5">
                <Label>KM Atual</Label>
                <Input type="number" placeholder="0" />
              </div>
              <div className="col-span-2 flex justify-end gap-2 pt-2">
                <Button type="submit">Salvar</Button>
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
              {list.map((v) => (
                <tr key={v.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{v.frota}</td>
                  <td className="px-4 py-3">{v.plate}</td>
                  <td className="px-4 py-3">{v.model}</td>
                  <td className="px-4 py-3">{v.year}</td>
                  <td className="px-4 py-3 text-right">{v.km.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(v.nextDate).toLocaleDateString("pt-BR")} — {v.nextType}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button variant="ghost" size="sm">Ver</Button>
                    <Button variant="outline" size="sm">Manutenção</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
