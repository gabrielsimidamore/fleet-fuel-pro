import type { VeiculoStatus } from "@/lib/mock-data";

const map: Record<VeiculoStatus | string, { label: string; cls: string }> = {
  em_dia: { label: "Em Dia", cls: "bg-success/15 text-success border-success/30" },
  atencao: { label: "Atenção", cls: "bg-warning/15 text-warning-foreground border-warning/40" },
  vencido: { label: "Vencido", cls: "bg-destructive/15 text-destructive border-destructive/30" },
  pendente: { label: "Pendente", cls: "bg-warning/15 text-warning-foreground border-warning/40" },
  aprovada: { label: "Aprovada", cls: "bg-success/15 text-success border-success/30" },
  rejeitada: { label: "Rejeitada", cls: "bg-destructive/15 text-destructive border-destructive/30" },
  novo: { label: "Novo", cls: "bg-info/15 text-info border-info/30" },
  visualizado: { label: "Visualizado", cls: "bg-muted text-muted-foreground border-border" },
  em_separacao: { label: "Em Separação", cls: "bg-warning/15 text-warning-foreground border-warning/40" },
  enviado: { label: "Enviado", cls: "bg-info/15 text-info border-info/30" },
  entregue: { label: "Entregue", cls: "bg-success/15 text-success border-success/30" },
};

export function StatusBadge({ status }: { status: string }) {
  const m = map[status] ?? { label: status, cls: "bg-muted text-muted-foreground border-border" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${m.cls}`}>
      {m.label}
    </span>
  );
}
