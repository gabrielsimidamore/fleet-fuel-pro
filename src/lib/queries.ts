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
  status: string | null;
  photos: string[] | null;
  scheduled_date: string | null;
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
  image_url: string | null;
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
  pecas?: { name: string; category: string | null; image_url: string | null } | null;
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
  manutencao_id: string | null;
  filial_id: string | null;
  veiculo_id: string | null;
  status: "new" | "viewed" | "processing" | "shipped" | "delivered" | "approved" | "rejected";
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
    .select("*, pecas(name, category, image_url)")
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

// ─── Promoções CRUD ───────────────────────────────────────────────────────────

export async function insertPromocao(payload: {
  peca_id?: string;
  title: string;
  description?: string;
  original_price?: number;
  promo_price: number;
  discount_percent?: number;
  valid_until?: string;
}) {
  const disc = payload.original_price && payload.promo_price
    ? Math.round((1 - payload.promo_price / payload.original_price) * 100)
    : payload.discount_percent;
  const { data, error } = await supabase
    .from("promocoes")
    .insert({ ...payload, discount_percent: disc, is_active: true })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePromocaoActive(id: string, is_active: boolean) {
  const { error } = await supabase.from("promocoes").update({ is_active }).eq("id", id);
  if (error) throw error;
}

export async function fetchAllPromocoes(): Promise<DBPromocao[]> {
  const { data, error } = await supabase
    .from("promocoes")
    .select("*, pecas(name, category, image_url)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ─── Catálogo com fotos ───────────────────────────────────────────────────────

export async function uploadPecaFoto(file: File, pecaId: string): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${pecaId}.${ext}`;
  const { error } = await supabase.storage.from("pecas-fotos").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("pecas-fotos").getPublicUrl(path);
  const url = data.publicUrl;
  // Registrar na tabela fotos
  try {
    await supabase.from("fotos").upsert({
      bucket: "pecas-fotos", storage_path: path, public_url: url,
      referencia: "peca", referencia_id: pecaId,
      nome_arquivo: file.name, tamanho_bytes: file.size, mime_type: file.type,
    }, { onConflict: "storage_path" });
  } catch { /* não bloquear upload se registro falhar */ }
  return url;
}

export async function updatePeca(id: string, payload: Partial<DBPeca>) {
  const { error } = await supabase.from("pecas").update(payload).eq("id", id);
  if (error) throw error;
}

export async function insertPeca(payload: {
  code?: string; name: string; description?: string;
  category?: string; price?: number; interval_km?: number;
  interval_months?: number; image_url?: string;
}) {
  const { data, error } = await supabase.from("pecas").insert({ ...payload, is_active: true }).select().single();
  if (error) throw error;
  return data;
}

// ─── Manutenções com fotos e agendamento ─────────────────────────────────────

export async function fetchManutencoesDetalhadas(): Promise<(DBManutencao & { veiculos?: { frota_number: string; plate: string; model: string } | null })[]> {
  const { data, error } = await supabase
    .from("manutencoes")
    .select("*, veiculos(frota_number, plate, model)")
    .order("date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function uploadManutencaoFoto(file: File, manutencaoId: string, index: number): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${manutencaoId}-${index}.${ext}`;
  const { error } = await supabase.storage.from("manutencao-fotos").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("manutencao-fotos").getPublicUrl(path);
  const url = data.publicUrl;
  // Registrar na tabela fotos
  try {
    await supabase.from("fotos").insert({
      bucket: "manutencao-fotos", storage_path: path, public_url: url,
      referencia: "manutencao", referencia_id: manutencaoId,
      nome_arquivo: file.name, tamanho_bytes: file.size, mime_type: file.type,
    });
  } catch { /* não bloquear upload se registro falhar */ }
  return url;
}

// ─── Pedidos sugeridos ────────────────────────────────────────────────────────

export async function insertPedidoSugerido(payload: {
  manutencao_id: string;
  veiculo_id: string;
  filial_id?: string;
  items: { nome: string; cod: string; qtd: number; preco: number }[];
  total: number;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from("pedidos")
    .insert({
      manutencao_id: payload.manutencao_id,
      veiculo_id: payload.veiculo_id,
      filial_id: payload.filial_id,
      status: "new",
      items: payload.items,
      total: payload.total,
      notes: payload.notes ?? "Pedido gerado automaticamente pela manutenção",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchPedidosDetalhados(): Promise<(DBPedido & { manutencoes?: { type: string; date: string } | null })[]> {
  const { data, error } = await supabase
    .from("pedidos")
    .select("*, veiculos(frota_number, plate), manutencoes(type, date)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ─── Tabela fotos (registro de uploads) ──────────────────────────────────────

export interface DBFoto {
  id: string;
  bucket: string;
  storage_path: string;
  public_url: string;
  referencia: string;
  referencia_id: string;
  nome_arquivo: string | null;
  tamanho_bytes: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export async function registrarFoto(payload: {
  bucket: string;
  storage_path: string;
  public_url: string;
  referencia: "peca" | "manutencao";
  referencia_id: string;
  nome_arquivo?: string;
  tamanho_bytes?: number;
  mime_type?: string;
}): Promise<DBFoto> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from("fotos").insert({
    ...payload,
    uploaded_by: user?.id ?? null,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function fetchFotosByReferencia(referencia_id: string): Promise<DBFoto[]> {
  const { data, error } = await supabase
    .from("fotos")
    .select("*")
    .eq("referencia_id", referencia_id)
    .order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function deletarFoto(id: string, storage_path: string, bucket: string) {
  await supabase.storage.from(bucket).remove([storage_path]);
  const { error } = await supabase.from("fotos").delete().eq("id", id);
  if (error) throw error;
}

// ─── Admin Pedidos ────────────────────────────────────────────────────────────

export interface DBPedidoAdmin extends DBPedido {
  veiculos?: {
    frota_number: string; plate: string; model: string;
    current_km: number | null; filial_id: string | null;
  } | null;
  manutencoes?: {
    type: string; date: string;
    km_at_maintenance: number | null;
    items_replaced: string[] | null;
    next_maintenance_km: number | null;
  } | null;
  filiais?: { name: string; city: string | null } | null;
}

export async function fetchPedidosAdmin(): Promise<DBPedidoAdmin[]> {
  const { data, error } = await supabase
    .from("pedidos")
    .select(`
      *,
      veiculos(frota_number, plate, model, current_km, filial_id),
      manutencoes(type, date, km_at_maintenance, items_replaced, next_maintenance_km)
    `)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updatePedidoStatus(
  id: string,
  status: "new" | "viewed" | "processing" | "shipped" | "delivered" | "approved" | "rejected"
) {
  const { error } = await supabase.from("pedidos").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function updatePedidoItems(
  id: string,
  items: unknown[],
  total: number
) {
  const { error } = await supabase.from("pedidos").update({ items, total }).eq("id", id);
  if (error) throw error;
}

// ─── Email ao aprovar pedido ───────────────────────────────────────────────────
export async function sendPedidoAprovadoEmail(payload: {
  pedido_id: string;
  veiculo: string;
  placa: string;
  modelo: string;
  tipo_manutencao?: string;
  data_manutencao?: string;
  items: unknown[];
  total: number;
}) {
  const { error } = await supabase.functions.invoke("send-pedido-email", {
    body: {
      ...payload,
      aprovado_por: (await supabase.auth.getUser()).data.user?.email ?? "cliente",
      data_aprovacao: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    },
  });
  if (error) throw error;
}
