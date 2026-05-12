import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { checklistTemplate } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/checklist")({
  component: ChecklistPage,
});

function ChecklistPage() {
  const allItems = Object.entries(checklistTemplate).flatMap(([cat, items]) => items.map((i) => `${cat}::${i}`));
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const completedCount = Object.values(checked).filter(Boolean).length;
  const progress = (completedCount / allItems.length) * 100;

  const icons: Record<string, string> = {
    Motor: "⚙️",
    Freios: "🛑",
    Fluidos: "💧",
    Pneus: "🔄",
    Elétrica: "⚡",
    Carroceria: "🚐",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Checklist de Inspeção</h1>
        <p className="text-sm text-muted-foreground">FR-1001 — VW 11.180 — 12/05/2026</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-medium">{completedCount}/{allItems.length} itens concluídos</span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </CardContent>
      </Card>

      {Object.entries(checklistTemplate).map(([cat, items]) => (
        <Card key={cat}>
          <CardHeader>
            <CardTitle className="text-base">{icons[cat]} {cat}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {items.map((item) => {
              const id = `${cat}::${item}`;
              const isChecked = !!checked[id];
              return (
                <div key={id} className="space-y-1.5">
                  <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-muted/40 rounded px-2 py-1.5">
                    <Checkbox checked={isChecked} onCheckedChange={(v) => setChecked({ ...checked, [id]: !!v })} />
                    <span>{item}</span>
                  </label>
                  {isChecked && (
                    <Textarea
                      value={notes[id] ?? ""}
                      onChange={(e) => setNotes({ ...notes, [id]: e.target.value })}
                      placeholder="Observação (opcional)"
                      rows={1}
                      className="ml-9 text-xs"
                    />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button onClick={() => toast.success("Checklist salvo!")}>Salvar Checklist</Button>
      </div>
    </div>
  );
}
