import { supabase } from "./supabase";

// ─── DB Types ────────────────────────────────────────────────────────────────

export interface DBVeiculo {
  id: string;
  filial_id: string;
  frota_number: string;
  plate: string;
  model: string;
  brand: string;
  year: number;
  current_km: number;
  driver_name: string | null;
  usage_type: "urbano" | "rodoviario" | "misto" | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface DBManutencao {
  id: string;
  veiculo_id: string;
  filial_id: string;
  date: string;
  type: string;
  km_at_maintenance: number | null;
  mechanic: string | null;
  workshop: string | null;
  cost: number | null;
  problem_identified: string | null;
  items_replaced: string[] | null;
  notes: string | null;
  next_maintenance_date: string | null;
  next_maintenance_km: number | null;
  next_maintenance_type: string | null;
  created_at: string;
}

export interface DBPeca {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  category: string | null;
  unit: string | null;
  price: number | null;
  interval_km: number | null;
  interval_months: number | null;
  min_quantity: number;
  is_active: boolean;
  created_at: string;
}

export interface DBPromocao {
  id: string;
  peca_id: string | null;
  title: string;
  description: string | null;
  original_price: number | null;
  promo_price: number;
  discount_percent: number | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
  pecas?: { name: string; category: string | null } | null;
}

export interface DBCotacao {
  id: string;
  filial_id: string | null;
  veiculo_id: string | null;
  manutencao_id: string | null;
  status: "pending" | "approved" | "rejected" | "sent";
  items: unknown[];
  total: number | null;
  notes: string | null;
  created_at: string;
  veiculos?: { frota_number: string; plate: string } | null;
}

export interface DBPedido {
  id: string;
  cotacao_id: string | null;
  filial_id: string | null;
  veiculo_id: string | null;
  status: "new" | "viewed" | "processing" | "shipped" | "delivered";
  total: number | null;
  items: unknown[];
  notes: string | null;
  created_at: string;
  veiculos?: { frota_number: string; plate: string } | null;
}

export interface DBFilial {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  cnpj: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  created_at: string;
}

// ─── Derived / UI Types ───────────────────────────────────────────────────────

export type VeiculoStatus = "em_dia" | "atencao" | "vencido";

export interface VeiculoComStatus extends DBVeiculo {
  nextDate: string | null;
  nextType: string | null;
  statusDisplay: VeiculoStatus;
}

/** Derives display status from the next maintenance date */
export function deriveStatus(nextDate: string | null): VeiculoStatus {
  if (!nextDate) return "em_dia";
  const diff = new Date(nextDate).getTime() - Date.now();
  const days = diff / 86_400_000;
  if (days < 0) return "vencido";
  if (days <= 30) return "atencao";
  return "em_dia";
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Fetch vehicles with their latest maintenance info */
export async function fetchVeiculos(): Promise<VeiculoComStatus[]> {
  const { data, error } = await supabase
    .from("veiculos")
    .select(`
      *,
      manutencoes (
        next_maintenance_date,
        next_maintenance_type,
        date
      )
    `)
    .order("frota_number");

  if (error) throw error;

  return (data ?? []).map((v: DBVeiculo & { manutencoes: DBManutencao[] }) => {
    // get the most recent maintenance record (latest date)
    const latest = (v.manutencoes ?? []).sort((a, b) =>
      b.date.localeCompare(a.date)
    )[0];
    const nextDate = latest?.next_maintenance_date ?? null;
    const nextType = latest?.next_maintenance_type ?? null;
    return {
      ...v,
      nextDate,
      nextType,
      statusDisplay: deriveStatus(nextDate),
    };
  });
}

/** Fetch vehicles as a simple list for selects */
export async function fetchVeiculosList(): Promise<
  Pick<DBVeiculo, "id" | "frota_number" | "plate" | "model" | "year" | "current_km">[]
> {
  const { data, error } = await supabase
    .from("veiculos")
    .select("id, frota_number, plate, model, year, current_km")
    .order("frota_number");
  if (error) throw error;
  return data ?? [];
}

/** Fetch parts catalog */
export async function fetchPecas(): Promise<DBPeca[]> {
  const { data, error } = await supabase
    .from("pecas")
    .select("*")
    .eq("is_active", true)
    .order("category")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

/** Fetch active promotions with related part info */
export async function fetchPromocoes(): Promise<DBPromocao[]> {
  const { data, error } = await supabase
    .from("promocoes")
    .select("*, pecas(name, category)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Fetch cotacoes with vehicle info */
export async function fetchCotacoes(): Promise<DBCotacao[]> {
  const { data, error } = await supabase
    .from("cotacoes")
    .select("*, veiculos(frota_number, plate)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Fetch pedidos with vehicle info */
export async function fetchPedidos(): Promise<DBPedido[]> {
  const { data, error } = await supabase
    .from("pedidos")
    .select("*, veiculos(frota_number, plate)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Fetch manutencoes for a filial */
export async function fetchManutencoes(): Promise<DBManutencao[]> {
  const { data, error } = await supabase
    .from("manutencoes")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Insert a new veiculo */
export async function insertVeiculo(payload: {
  filial_id?: string;
  frota_number: string;
  plate: string;
  brand?: string;
  model: string;
  year?: number;
  current_km?: number;
}) {
  const { data, error } = await supabase.from("veiculos").insert(payload).select().single();
  if (error) throw error;
  return data;
}

/** Insert a new manutenção and optionally a cotação */
export async function insertManutencao(payload: {
  veiculo_id: string;
  filial_id?: string;
  date: string;
  type: string;
  km_at_maintenance?: number;
  mechanic?: string;
  workshop?: string;
  cost?: number;
  problem_identified?: string;
  items_replaced?: string[];
  notes?: string;
  next_maintenance_date?: string;
  next_maintenance_km?: number;
  next_maintenance_type?: string;
}) {
  const { data, error } = await supabase
    .from("manutencoes")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Insert a new cotação */
export async function insertCotacao(payload: {
  filial_id?: string;
  veiculo_id?: string;
  manutencao_id?: string;
  items: unknown[];
  total?: number;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from("cotacoes")
    .insert({ ...payload, status: "pending" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Update cotação status */
export async function updateCotacaoStatus(
  id: string,
  status: "pending" | "approved" | "rejected" | "sent"
) {
  const { error } = await supabase.from("cotacoes").update({ status }).eq("id", id);
  if (error) throw error;
}

/** Fetch gastos mensais (aggregated from manutencoes) */
export async function fetchGastosMensais(): Promise<{ mes: string; valor: number }[]> {
  const { data, error } = await supabase
    .from("manutencoes")
    .select("date, cost")
    .not("cost", "is", null)
    .order("date");
  if (error) throw error;

  const map: Record<string, number> = {};
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  (data ?? []).forEach((m: { date: string; cost: number }) => {
    const d = new Date(m.date);
    const key = monthNames[d.getMonth()];
    map[key] = (map[key] ?? 0) + (m.cost ?? 0);
  });

  return Object.entries(map).map(([mes, valor]) => ({ mes, valor }));
}

/** Fetch km médio (aggregated from veiculos avg_km_month) */
export async function fetchKmMedio(): Promise<{ mes: string; km: number }[]> {
  const { data, error } = await supabase
    .from("manutencoes")
    .select("date, km_at_maintenance")
    .not("km_at_maintenance", "is", null)
    .order("date");
  if (error) throw error;

  const map: Record<string, number[]> = {};
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  (data ?? []).forEach((m: { date: string; km_at_maintenance: number }) => {
    const d = new Date(m.date);
    const key = monthNames[d.getMonth()];
    if (!map[key]) map[key] = [];
    map[key].push(m.km_at_maintenance ?? 0);
  });

  return Object.entries(map).map(([mes, kms]) => ({
    mes,
    km: Math.round(kms.reduce((a, b) => a + b, 0) / kms.length),
  }));
}

/** Fetch pecas por categoria (count per category from manutencoes items_replaced) */
export async function fetchPecasCategoria(): Promise<{ name: string; value: number; fill: string }[]> {
  const { data, error } = await supabase
    .from("pecas")
    .select("category")
    .eq("is_active", true);
  if (error) throw error;

  const fills = [
    "var(--chart-1)", "var(--chart-2)", "var(--chart-3)",
    "var(--chart-4)", "var(--chart-5)", "var(--muted-foreground)",
  ];
  const map: Record<string, number> = {};
  (data ?? []).forEach((p: { category: string | null }) => {
    const cat = p.category ?? "Outros";
    map[cat] = (map[cat] ?? 0) + 1;
  });

  return Object.entries(map).map(([name, value], i) => ({
    name,
    value,
    fill: fills[i % fills.length],
  }));
}
