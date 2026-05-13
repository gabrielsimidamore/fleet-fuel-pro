import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Truck, Plus, X, Calendar, Wrench, Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useVeiculosList, useManutencoesList } from "@/hooks/use-fleet-data";
import { fleetKeys } from "@/hooks/use-fleet-data";
import { insertManutencao } from "@/lib/queries";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/_app/calendario")({ component: CalendarioPage });

const TIPOS = ["Troca de Óleo", "Revisão Preventiva", "Revisão de Freios", "Troca de Correia Dentada", "Troca de Filtros", "Outro"];

const STATUS_CONFIG = {
  concluida: { label: "Realizada", dot: "bg-green-500", chip: "bg-green-100 text-green-700" },
  agendada:  { label: "Agendada",  dot: "bg-blue-500",  chip: "bg-blue-100 text-blue-700" },
  sistema:   { label: "Sistema",   dot: "bg-orange-400", chip: "bg-orange-100 text-orange-700" },
  vencida:   { label: "Vencida",   dot: "bg-red-500",   chip: "bg-red-100 text-red-700" },
  atencao:   { label: "Atenção",   dot: "bg-yellow-500", chip: "bg-yellow-100 text-yellow-800" },
};

function CalendarioPage() {
  const [refDate, setRefDate] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const year = refDate.getFullYear();
  const month = refDate.getMonth();
  const today = new Date();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const { data: veiculos = [] } = useVeiculosList();
  const { data: manutencoes = [], isLoading } = useManutencoesList();
  const qc = useQueryClient();

  // Dialog de agendamento
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [form, setForm] = useState({ veiculoId: "", tipo: "Troca de Óleo", obs: "" });
  const [saving, setSaving] = useState(false);

  // Dialog de detalhes do dia
  const [dayOpen, setDayOpen] = useState(false);
  const [dayEvents, setDayEvents] = useState<typeof manutencoes>([]);
  const [dayLabel, setDayLabel] = useState("");

  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Classificar manutenções
  const allEvents = manutencoes.map(m => {
    const dateStr = m.status === "agendada" ? (m as typeof m & { scheduled_date?: string }).scheduled_date ?? m.date : m.next_maintenance_date ?? m.date;
    const diff = (new Date(dateStr).getTime() - today.getTime()) / 86400000;
    let category: keyof typeof STATUS_CONFIG = m.status === "concluida" ? "concluida" : m.status === "agendada" ? "agendada" : diff < 0 ? "vencida" : diff <= 30 ? "atencao" : "sistema";
    // Manutenções criadas pelo sistema (next_maintenance) sem agendamento manual
    if (m.status !== "agendada" && m.status !== "concluida" && m.next_maintenance_date) category = diff < 0 ? "vencida" : diff <= 30 ? "atencao" : "sistema";
    return { ...m, eventDate: dateStr, category };
  });

  // Também gerar eventos das "próximas" baseadas nas last manutencoes
  const sistemaEvents = allEvents.filter(e => e.next_maintenance_date && e.status === "concluida");

  const eventsByDay: Record<number, typeof allEvents> = {};
  allEvents.forEach(e => {
    if (!e.eventDate) return;
    const d = new Date(e.eventDate + "T12:00:00");
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      eventsByDay[day] = [...(eventsByDay[day] ?? []), e];
    }
  });
  // Adicionar eventos do sistema (próximas manutenções agendadas pelo sistema)
  sistemaEvents.forEach(e => {
    if (!e.next_maintenance_date) return;
    const d = new Date(e.next_maintenance_date + "T12:00:00");
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      const sistemaEv = { ...e, eventDate: e.next_maintenance_date, category: "sistema" as const, type: e.next_maintenance_type ?? "Revisão" };
      if (!eventsByDay[day]) eventsByDay[day] = [];
      // Don't duplicate if already scheduled manually
      if (!eventsByDay[day].some(x => x.id === e.id && x.category === "agendada")) {
        eventsByDay[day].push(sistemaEv);
      }
    }
  });

  // Clique no dia: abre agendamento se futuro, mostra eventos se tem
  const handleDayClick = (d: number) => {
    const clickedDate = new Date(year, month, d);
    const events = eventsByDay[d] ?? [];
    if (events.length > 0) {
      setDayEvents(events);
      setDayLabel(clickedDate.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" }));
      setDayOpen(true);
    } else if (clickedDate >= new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
      setSelectedDay(d);
      setScheduleOpen(true);
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.veiculoId) { toast.error("Selecione um veículo."); return; }
    setSaving(true);
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    try {
      await insertManutencao({
        veiculo_id: form.veiculoId,
        date: dateStr,
        type: form.tipo,
        notes: form.obs || undefined,
        status: "agendada",
        scheduled_date: dateStr,
      } as Parameters<typeof insertManutencao>[0]);
      await qc.invalidateQueries({ queryKey: fleetKeys.manutencoes });
      toast.success("Manutenção agendada!");
      setScheduleOpen(false);
      setForm({ veiculoId: "", tipo: "Troca de Óleo", obs: "" });
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Erro ao agendar."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este agendamento?")) return;
    try {
      await supabase.from("manutencoes").delete().eq("id", id);
      await qc.invalidateQueries({ queryKey: fleetKeys.manutencoes });
      setDayOpen(false);
      toast.success("Agendamento removido.");
    } catch { toast.error("Erro ao excluir."); }
  };

  type CalEvent = typeof allEvents[0];
  // Lista lateral: próximas (sistema + agendadas) nos próximos 60 dias
  const upcomingRaw: CalEvent[] = [...allEvents, ...sistemaEvents.map(e => ({ ...e, eventDate: e.next_maintenance_date ?? "", category: "sistema" as const, type: e.next_maintenance_type ?? "Revisão" }))];
  const upcoming = upcomingRaw
    .filter(e => e.eventDate)
    .filter(e => {
      const diff = (new Date(e.eventDate + "T12:00:00").getTime() - today.getTime()) / 86400000;
      return diff >= -7 && diff <= 90;
    })
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
    .slice(0, 10);

  const isToday = (d: number) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isPast = (d: number) => new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Calendário</h1>
          <p className="text-sm text-muted-foreground">Clique em um dia para agendar ou ver manutenções</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setRefDate(new Date(year, month - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
          <div className="text-sm font-medium px-3 capitalize">{refDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</div>
          <Button variant="outline" size="icon" onClick={() => setRefDate(new Date(year, month + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => setRefDate(new Date())}>Hoje</Button>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 text-xs">
        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${v.dot}`} /> {v.label}
          </span>
        ))}
        <span className="text-muted-foreground">· Clique em dia livre para agendar</span>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-4">
        {/* Calendário */}
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="grid grid-cols-7 text-xs font-medium text-muted-foreground mb-2">
              {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(d => <div key={d} className="px-1 py-1 text-center">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((d, i) => {
                const events = d ? (eventsByDay[d] ?? []) : [];
                const hasFuture = d && !isPast(d);
                return (
                  <div key={i}
                    onClick={() => d && handleDayClick(d)}
                    className={`min-h-[52px] md:min-h-[72px] border rounded-md p-1 text-xs transition-colors
                      ${d ? "cursor-pointer hover:bg-muted/50" : "opacity-0 pointer-events-none"}
                      ${d && isToday(d) ? "border-primary bg-primary/5" : "border-border"}
                      ${d && hasFuture && events.length === 0 ? "hover:border-primary/40" : ""}
                    `}
                  >
                    {d && (
                      <>
                        <div className={`text-right text-[11px] font-medium mb-0.5 ${isToday(d) ? "text-primary" : isPast(d) ? "text-muted-foreground/50" : ""}`}>{d}</div>
                        <div className="space-y-0.5">
                          {events.slice(0, 2).map((ev, j) => {
                            const conf = STATUS_CONFIG[ev.category] ?? STATUS_CONFIG.sistema;
                            return (
                              <div key={j} className={`px-1 py-0.5 rounded text-[9px] truncate flex items-center gap-0.5 ${conf.chip}`}>
                                {ev.category === "sistema" ? <Bot className="h-2 w-2 shrink-0" /> : <Truck className="h-2 w-2 shrink-0" />}
                                <span className="truncate">{(ev as typeof ev & { veiculos?: { frota_number: string } })?.veiculos?.frota_number ?? ev.type}</span>
                              </div>
                            );
                          })}
                          {events.length > 2 && <div className="text-[9px] text-muted-foreground text-center">+{events.length - 2}</div>}
                          {events.length === 0 && hasFuture && <div className="hidden group-hover:flex items-center justify-center h-4"><Plus className="h-3 w-3 text-muted-foreground/40" /></div>}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Lateral */}
        <div className="space-y-3">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-semibold mb-3">Próximas manutenções</div>
              {isLoading && <p className="text-xs text-muted-foreground">Carregando...</p>}
              {!isLoading && upcoming.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma manutenção próxima.</p>}
              <div className="space-y-2.5">
                {upcoming.map((ev, i) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const evAny = ev as any;
                  const conf = (STATUS_CONFIG[evAny.category as keyof typeof STATUS_CONFIG]) ?? STATUS_CONFIG.sistema;
                  const v = evAny as { veiculos?: { frota_number: string; plate: string; model: string } | null; type: string; eventDate: string; status: string; id: string };
                  return (
                    <div key={i} className="flex items-start justify-between border-b border-border pb-2 last:border-0 gap-2">
                      <div className="min-w-0 flex items-start gap-2">
                        <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${conf.dot}`} />
                        <div>
                          <div className="text-xs font-medium leading-tight">{v.veiculos ? `${v.veiculos.frota_number} — ${v.veiculos.plate}` : "—"}</div>
                          <div className="text-[11px] text-muted-foreground">{ev.type}</div>
                          <div className="text-[11px] text-muted-foreground">{new Date(ev.eventDate + "T12:00:00").toLocaleDateString("pt-BR")}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${conf.chip}`}>{conf.label}</span>
                        {ev.status === "agendada" && (
                          <button onClick={() => handleDelete(ev.id)} className="text-[10px] text-destructive hover:underline">Excluir</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Legenda sistema vs manual */}
          <Card>
            <CardContent className="p-3 text-xs space-y-1.5">
              <div className="font-medium mb-2">Como funciona</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Bot className="h-3.5 w-3.5 text-orange-500" /> <span><b>Laranja</b> = gerado pelo sistema com base no histórico</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-3.5 w-3.5 text-blue-500" /> <span><b>Azul</b> = agendado manualmente por você</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Wrench className="h-3.5 w-3.5 text-green-500" /> <span><b>Verde</b> = manutenção concluída</span></div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog: Agendar no dia clicado */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Agendar — {selectedDay && new Date(year, month, selectedDay).toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSchedule} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Veículo *</Label>
              <Select value={form.veiculoId} onValueChange={v => setF("veiculoId", v)}>
                <SelectTrigger><SelectValue placeholder="Selecionar veículo..." /></SelectTrigger>
                <SelectContent>{veiculos.map(v => <SelectItem key={v.id} value={v.id}>{v.frota_number} — {v.plate} ({v.model})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={v => setF("tipo", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TIPOS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea value={form.obs} onChange={e => setF("obs", e.target.value)} rows={2} placeholder="Observações opcionais..." />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setScheduleOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Confirmar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Detalhes do dia */}
      <Dialog open={dayOpen} onOpenChange={setDayOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> {dayLabel}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            {dayEvents.map((ev, i) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const evAny = ev as any;
              const conf = (STATUS_CONFIG[evAny.category as keyof typeof STATUS_CONFIG]) ?? STATUS_CONFIG.sistema;
              const v = evAny as { veiculos?: { frota_number: string; plate: string; model: string } | null; type: string; notes?: string; status: string; id: string; category: string };
              return (
                <div key={i} className="border border-border rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {v.category === "sistema" ? <Bot className="h-4 w-4 text-orange-500" /> : <Wrench className="h-4 w-4 text-blue-500" />}
                      <span className="font-medium text-sm">{ev.type}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${conf.chip}`}>{conf.label}</span>
                  </div>
                  {v.veiculos && <div className="text-xs text-muted-foreground">{v.veiculos.frota_number} — {v.veiculos.plate} ({v.veiculos.model})</div>}
                  {ev.notes && <div className="text-xs text-muted-foreground italic">"{ev.notes}"</div>}
                  {ev.status === "agendada" && (
                    <Button variant="destructive" size="sm" className="w-full mt-2 gap-1.5" onClick={() => handleDelete(ev.id)}>
                      <X className="h-3.5 w-3.5" /> Excluir agendamento
                    </Button>
                  )}
                </div>
              );
            })}
            {dayEvents.every(e => e.status !== "agendada") && (
              <Button className="w-full gap-2" onClick={() => { setDayOpen(false); const d = new Date(dayLabel); setSelectedDay(d.getDate()); setTimeout(() => setScheduleOpen(true), 100); }}>
                <Plus className="h-4 w-4" /> Adicionar agendamento neste dia
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
