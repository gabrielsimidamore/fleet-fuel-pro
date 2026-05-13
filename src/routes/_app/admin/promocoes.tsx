import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAllPromocoes } from "@/hooks/use-fleet-data";
import { usePecas } from "@/hooks/use-fleet-data";
import { insertPromocao, updatePromocaoActive } from "@/lib/queries";

export const Route = createFileRoute("/_app/admin/promocoes")({ component: AdminPromocoes });

function AdminPromocoes() {
  const { data: promocoes = [], isLoading } = useAllPromocoes();
  const { data: pecas = [] } = usePecas();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    peca_id: "", title: "", description: "", original_price: "", promo_price: "", valid_until: "",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.promo_price) { toast.error("Título e preço promocional são obrigatórios."); return; }
    setSaving(true);
    try {
      await insertPromocao({
        peca_id: form.peca_id || undefined,
        title: form.title,
        description: form.description || undefined,
        original_price: form.original_price ? Number(form.original_price) : undefined,
        promo_price: Number(form.promo_price),
        valid_until: form.valid_until || undefined,
      });
      await qc.invalidateQueries({ queryKey: ["allPromocoes"] });
      toast.success("Promoção criada!");
      setOpen(false);
      setForm({ peca_id: "", title: "", description: "", original_price: "", promo_price: "", valid_until: "" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar promoção.");
    } finally { setSaving(false); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await updatePromocaoActive(id, !current);
      await qc.invalidateQueries({ queryKey: ["allPromocoes"] });
    } catch { toast.error("Erro ao atualizar promoção."); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Promoções</h1>
          <p className="text-sm text-muted-foreground">Gerencie campanhas ativas</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Nova Promoção</Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">Carregando...</p>
          ) : (
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Título / Peça</th>
                  <th className="text-right px-4 py-3 font-medium">Original</th>
                  <th className="text-right px-4 py-3 font-medium">Promo</th>
                  <th className="text-right px-4 py-3 font-medium">Desc.</th>
                  <th className="text-left px-4 py-3 font-medium">Validade</th>
                  <th className="text-center px-4 py-3 font-medium">Ativa</th>
                </tr>
              </thead>
              <tbody>
                {promocoes.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Nenhuma promoção cadastrada.</td></tr>
                ) : promocoes.map((p) => (
                  <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{p.title}</div>
                      {p.pecas?.name && <div className="text-xs text-muted-foreground">{p.pecas.name}</div>}
                    </td>
                    <td className="px-4 py-3 text-right line-through text-muted-foreground">
                      {p.original_price != null ? `R$ ${p.original_price.toFixed(2)}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-green-600 font-semibold">R$ {p.promo_price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      {p.discount_percent != null ? `-${Number(p.discount_percent)}%` : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.valid_until ? new Date(p.valid_until).toLocaleDateString("pt-BR") : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Switch checked={p.is_active} onCheckedChange={() => toggleActive(p.id, p.is_active)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Nova Promoção */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Pencil className="h-4 w-4" /> Nova Promoção</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Peça do catálogo (opcional)</Label>
              <Select value={form.peca_id} onValueChange={v => { set("peca_id", v); const p = pecas.find(x => x.id === v); if (p) { set("title", p.name); set("original_price", String(p.price ?? "")); } }}>
                <SelectTrigger><SelectValue placeholder="Selecionar peça..." /></SelectTrigger>
                <SelectContent>
                  {pecas.map(p => <SelectItem key={p.id} value={p.id}>{p.name} — R$ {(p.price ?? 0).toFixed(2)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Título da promoção *</Label>
              <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Ex: Promoção Troca de Óleo" />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Input value={form.description} onChange={e => set("description", e.target.value)} placeholder="Descrição opcional" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Preço original (R$)</Label>
                <Input type="number" step="0.01" value={form.original_price} onChange={e => set("original_price", e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-1.5">
                <Label>Preço promocional (R$) *</Label>
                <Input type="number" step="0.01" value={form.promo_price} onChange={e => set("promo_price", e.target.value)} placeholder="0.00" />
              </div>
            </div>
            {form.original_price && form.promo_price && (
              <p className="text-xs text-green-600 font-medium">
                Desconto: -{Math.round((1 - Number(form.promo_price) / Number(form.original_price)) * 100)}%
              </p>
            )}
            <div className="space-y-1.5">
              <Label>Válida até</Label>
              <Input type="date" value={form.valid_until} onChange={e => set("valid_until", e.target.value)} />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Criar Promoção"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
