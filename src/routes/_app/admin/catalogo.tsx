import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Plus, Eye, Upload, X, ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { usePecas } from "@/hooks/use-fleet-data";
import { fleetKeys } from "@/hooks/use-fleet-data";
import { uploadPecaFoto, updatePeca, insertPeca } from "@/lib/queries";
import type { DBPeca } from "@/lib/queries";

export const Route = createFileRoute("/_app/admin/catalogo")({ component: CatalogoPage });

const CATEGORIAS = ["Lubrificantes", "Filtros", "Freios", "Motor", "Transmissão", "Pneus", "Elétrica", "Outros"];

const aguardando = [
  { code: "—", nome: "Bomba d'água VW", marca: "Bosch", ref: "BWP-9012", filial: "MG-01" },
  { code: "—", nome: "Sensor de ABS", marca: "Continental", ref: "CTL-AB55", filial: "RJ-01" },
];

function CatalogoPage() {
  const [tab, setTab] = useState("ativo");
  const { data: pecas = [] } = usePecas();
  const qc = useQueryClient();

  // Detail sheet
  const [detail, setDetail] = useState<(DBPeca & { image_url?: string }) | null>(null);

  // Edit / Create dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<(DBPeca & { image_url?: string }) | null>(null);
  const [form, setForm] = useState({ code: "", name: "", description: "", category: "", price: "", interval_km: "", interval_months: "" });
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const detailFileRef = useRef<HTMLInputElement>(null);

  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const openEdit = (p?: DBPeca & { image_url?: string }) => {
    setEditTarget(p ?? null);
    setForm({
      code: p?.code ?? "", name: p?.name ?? "", description: p?.description ?? "",
      category: p?.category ?? "", price: String(p?.price ?? ""),
      interval_km: String(p?.interval_km ?? ""), interval_months: String(p?.interval_months ?? ""),
    });
    setPreviewUrl(p?.image_url ?? null);
    setEditOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, targetId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      setPreviewUrl(reader.result as string);
      if (targetId) {
        setUploading(true);
        try {
          const url = await uploadPecaFoto(file, targetId);
          await updatePeca(targetId, { image_url: url } as Partial<DBPeca>);
          await qc.invalidateQueries({ queryKey: fleetKeys.pecas });
          if (detail?.id === targetId) setDetail(d => d ? { ...d, image_url: url } : d);
          toast.success("Foto atualizada!");
        } catch { toast.error("Erro ao fazer upload."); }
        finally { setUploading(false); }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error("Nome é obrigatório."); return; }
    setUploading(true);
    try {
      let imageUrl: string | undefined;
      // if file selected for new peca
      if (fileRef.current?.files?.[0] && !editTarget) {
        const tmpId = crypto.randomUUID();
        imageUrl = await uploadPecaFoto(fileRef.current.files[0], tmpId);
      }
      const payload = {
        code: form.code || undefined, name: form.name,
        description: form.description || undefined, category: form.category || undefined,
        price: form.price ? Number(form.price) : undefined,
        interval_km: form.interval_km ? Number(form.interval_km) : undefined,
        interval_months: form.interval_months ? Number(form.interval_months) : undefined,
        image_url: imageUrl,
      };
      if (editTarget) {
        await updatePeca(editTarget.id, payload as Partial<DBPeca>);
        if (fileRef.current?.files?.[0]) {
          const url = await uploadPecaFoto(fileRef.current.files[0], editTarget.id);
          await updatePeca(editTarget.id, { image_url: url } as Partial<DBPeca>);
        }
      } else { await insertPeca(payload); }
      await qc.invalidateQueries({ queryKey: fleetKeys.pecas });
      toast.success(editTarget ? "Peça atualizada!" : "Peça criada!");
      setEditOpen(false);
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Erro ao salvar."); }
    finally { setUploading(false); }
  };

  const categoryColor: Record<string, string> = {
    Lubrificantes: "bg-blue-100 text-blue-700", Filtros: "bg-green-100 text-green-700",
    Freios: "bg-red-100 text-red-700", Motor: "bg-orange-100 text-orange-700",
    Transmissão: "bg-gray-100 text-gray-700", Pneus: "bg-purple-100 text-purple-700",
    Elétrica: "bg-yellow-100 text-yellow-700", Outros: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold">Catálogo de Peças</h1><p className="text-sm text-muted-foreground">Gerencie peças e precificações</p></div>
        <Button onClick={() => openEdit()}><Plus className="h-4 w-4 mr-1" /> Nova Peça</Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="ativo">Catálogo Ativo</TabsTrigger>
          <TabsTrigger value="aguardando">
            Aguardando Precificação <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-yellow-400 text-yellow-900 text-[10px] font-bold">{aguardando.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ativo" className="mt-4">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3 w-16">Foto</th>
                    <th className="text-left px-4 py-3">Código</th>
                    <th className="text-left px-4 py-3">Nome</th>
                    <th className="text-left px-4 py-3">Categoria</th>
                    <th className="text-right px-4 py-3">Preço</th>
                    <th className="text-right px-4 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pecas.map((p) => {
                    const pp = p as DBPeca & { image_url?: string };
                    return (
                      <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                        <td className="px-4 py-2">
                          {pp.image_url ? (
                            <img src={pp.image_url} alt={p.name} className="h-10 w-10 rounded object-cover border" />
                          ) : (
                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center"><ImageIcon className="h-4 w-4 text-muted-foreground" /></div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{p.code ?? "—"}</td>
                        <td className="px-4 py-3 font-medium">{p.name}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor[p.category ?? ""] ?? "bg-slate-100 text-slate-700"}`}>{p.category ?? "—"}</span>
                        </td>
                        <td className="px-4 py-3 text-right">R$ {(p.price ?? 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => setDetail(pp)}><Eye className="h-3.5 w-3.5 mr-1" />Ver</Button>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(pp)}>Editar</Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aguardando" className="mt-4">
          <Card className="border-yellow-300">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead className="bg-yellow-50 text-xs text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3">Nome</th>
                    <th className="text-left px-4 py-3">Marca</th>
                    <th className="text-left px-4 py-3">Ref.</th>
                    <th className="text-left px-4 py-3">Filial</th>
                    <th className="text-right px-4 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {aguardando.map((p, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{p.nome}</td>
                      <td className="px-4 py-3">{p.marca}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.ref}</td>
                      <td className="px-4 py-3">{p.filial}</td>
                      <td className="px-4 py-3 text-right"><Button size="sm" onClick={() => { setF("name", p.nome); openEdit(); }}>Adicionar ao Catálogo</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Detail Sheet ── */}
      <Sheet open={!!detail} onOpenChange={() => setDetail(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader><SheetTitle>{detail?.name}</SheetTitle></SheetHeader>
          {detail && (
            <div className="mt-4 space-y-5">
              {/* Photo */}
              <div className="relative rounded-lg overflow-hidden bg-muted aspect-video flex items-center justify-center group">
                {detail.image_url ? (
                  <img src={detail.image_url} alt={detail.name} className="w-full h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="h-12 w-12" /><span className="text-sm">Sem foto</span>
                  </div>
                )}
                <button
                  onClick={() => detailFileRef.current?.click()}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2"
                >
                  <Upload className="h-5 w-5" /> {uploading ? "Enviando..." : "Trocar foto"}
                </button>
                <input ref={detailFileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { if (e.target.files?.[0]) handleFileSelect(e, detail.id); }} />
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/40 rounded-lg p-3"><div className="text-xs text-muted-foreground">Código</div><div className="font-mono font-medium mt-0.5">{detail.code ?? "—"}</div></div>
                <div className="bg-muted/40 rounded-lg p-3"><div className="text-xs text-muted-foreground">Categoria</div><Badge variant="outline" className="mt-0.5">{detail.category ?? "—"}</Badge></div>
                <div className="bg-muted/40 rounded-lg p-3"><div className="text-xs text-muted-foreground">Preço</div><div className="font-bold text-lg mt-0.5">R$ {(detail.price ?? 0).toFixed(2)}</div></div>
                <div className="bg-muted/40 rounded-lg p-3"><div className="text-xs text-muted-foreground">Unidade</div><div className="font-medium mt-0.5">{detail.unit ?? "un"}</div></div>
                {detail.interval_km && <div className="bg-muted/40 rounded-lg p-3"><div className="text-xs text-muted-foreground">Intervalo KM</div><div className="font-medium mt-0.5">{detail.interval_km.toLocaleString("pt-BR")} km</div></div>}
                {detail.interval_months && <div className="bg-muted/40 rounded-lg p-3"><div className="text-xs text-muted-foreground">Intervalo Meses</div><div className="font-medium mt-0.5">{detail.interval_months} meses</div></div>}
              </div>
              {detail.description && <div className="bg-muted/40 rounded-lg p-3 text-sm"><div className="text-xs text-muted-foreground mb-1">Descrição</div>{detail.description}</div>}

              <div className="flex gap-2 pt-2">
                <Button className="flex-1" onClick={() => { setDetail(null); openEdit(detail); }}>Editar Peça</Button>
                <Button variant="outline" onClick={() => setDetail(null)}>Fechar</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Edit / Create Dialog ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editTarget ? "Editar Peça" : "Nova Peça"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            {/* Photo preview */}
            <div
              onClick={() => fileRef.current?.click()}
              className="relative cursor-pointer border-2 border-dashed border-muted-foreground/30 rounded-lg h-32 flex items-center justify-center overflow-hidden hover:border-primary/50 transition-colors"
            >
              {previewUrl ? <img src={previewUrl} className="h-full w-full object-contain" alt="preview" /> : <div className="flex flex-col items-center gap-1 text-muted-foreground"><Upload className="h-6 w-6" /><span className="text-xs">Clique para adicionar foto</span></div>}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileSelect(e)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Código</Label><Input value={form.code} onChange={e => setF("code", e.target.value)} placeholder="OL001" /></div>
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={v => setF("category", v)}>
                  <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                  <SelectContent>{CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label>Nome *</Label><Input value={form.name} onChange={e => setF("name", e.target.value)} placeholder="Nome da peça" /></div>
            <div className="space-y-1.5"><Label>Descrição</Label><Input value={form.description} onChange={e => setF("description", e.target.value)} placeholder="Descrição" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5"><Label>Preço (R$)</Label><Input type="number" step="0.01" value={form.price} onChange={e => setF("price", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Intervalo KM</Label><Input type="number" value={form.interval_km} onChange={e => setF("interval_km", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Intervalo Meses</Label><Input type="number" value={form.interval_months} onChange={e => setF("interval_months", e.target.value)} /></div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={uploading}>{uploading ? "Salvando..." : editTarget ? "Salvar" : "Criar Peça"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
