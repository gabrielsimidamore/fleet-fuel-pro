import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { veiculos } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/calendario")({
  component: CalendarioPage,
});

function CalendarioPage() {
  const [refDate, setRefDate] = useState(new Date(2026, 4, 1));
  const year = refDate.getFullYear();
  const month = refDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsByDay: Record<number, typeof veiculos> = {};
  veiculos.forEach((v) => {
    const d = new Date(v.nextDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      eventsByDay[day] = [...(eventsByDay[day] ?? []), v];
    }
  });

  const upcoming = [...veiculos].sort((a, b) => a.nextDate.localeCompare(b.nextDate)).slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Calendário</h1>
          <p className="text-sm text-muted-foreground">Próximas revisões e manutenções</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setRefDate(new Date(year, month - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
          <div className="text-sm font-medium px-3 capitalize">{refDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</div>
          <Button variant="outline" size="icon" onClick={() => setRefDate(new Date(year, month + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => setRefDate(new Date())}>Hoje</Button>
        </div>
      </div>

      <div className="flex gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" /> Realizada</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warning" /> Próxima</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive" /> Vencida</span>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 text-xs font-medium text-muted-foreground mb-2">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => <div key={d} className="px-2 py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((d, i) => (
                <div key={i} className="aspect-square border border-border rounded-md p-1.5 text-xs">
                  {d && (
                    <>
                      <div className="font-medium">{d}</div>
                      <div className="space-y-0.5 mt-1">
                        {(eventsByDay[d] ?? []).slice(0, 2).map((v) => (
                          <div
                            key={v.id}
                            className={`px-1 py-0.5 rounded text-[10px] truncate flex items-center gap-1 ${
                              v.status === "vencido" ? "bg-destructive/15 text-destructive" : v.status === "atencao" ? "bg-warning/15 text-warning-foreground" : "bg-success/15 text-success"
                            }`}
                          >
                            <Truck className="h-2.5 w-2.5" /> {v.frota}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-semibold mb-3">Próximas (30 dias)</div>
            <div className="space-y-3">
              {upcoming.map((v) => (
                <div key={v.id} className="flex items-start justify-between border-b border-border pb-2 last:border-0">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{v.frota} — {v.model}</div>
                    <div className="text-xs text-muted-foreground">{v.nextType}</div>
                    <div className="text-xs text-muted-foreground">{new Date(v.nextDate).toLocaleDateString("pt-BR")}</div>
                  </div>
                  <StatusBadge status={v.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
