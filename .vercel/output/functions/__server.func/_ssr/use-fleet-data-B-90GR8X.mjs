import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./router--8MxzGTt.mjs";
function deriveStatus(nextDate) {
  if (!nextDate) return "em_dia";
  const diff = new Date(nextDate).getTime() - Date.now();
  const days = diff / 864e5;
  if (days < 0) return "vencido";
  if (days <= 30) return "atencao";
  return "em_dia";
}
async function fetchVeiculos() {
  const { data, error } = await supabase.from("veiculos").select(`
      *,
      manutencoes (
        next_maintenance_date,
        next_maintenance_type,
        date
      )
    `).order("frota_number");
  if (error) throw error;
  return (data ?? []).map((v) => {
    const latest = (v.manutencoes ?? []).sort(
      (a, b) => b.date.localeCompare(a.date)
    )[0];
    const nextDate = latest?.next_maintenance_date ?? null;
    const nextType = latest?.next_maintenance_type ?? null;
    return {
      ...v,
      nextDate,
      nextType,
      statusDisplay: deriveStatus(nextDate)
    };
  });
}
async function fetchVeiculosList() {
  const { data, error } = await supabase.from("veiculos").select("id, frota_number, plate, model, year, current_km").order("frota_number");
  if (error) throw error;
  return data ?? [];
}
async function fetchPecas() {
  const { data, error } = await supabase.from("pecas").select("*").eq("is_active", true).order("category").order("name");
  if (error) throw error;
  return data ?? [];
}
async function fetchPromocoes() {
  const { data, error } = await supabase.from("promocoes").select("*, pecas(name, category)").eq("is_active", true).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
async function fetchCotacoes() {
  const { data, error } = await supabase.from("cotacoes").select("*, veiculos(frota_number, plate)").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
async function fetchPedidos() {
  const { data, error } = await supabase.from("pedidos").select("*, veiculos(frota_number, plate)").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
async function fetchManutencoes() {
  const { data, error } = await supabase.from("manutencoes").select("*").order("date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
async function insertVeiculo(payload) {
  const { data, error } = await supabase.from("veiculos").insert(payload).select().single();
  if (error) throw error;
  return data;
}
async function insertManutencao(payload) {
  const { data, error } = await supabase.from("manutencoes").insert(payload).select().single();
  if (error) throw error;
  return data;
}
async function insertCotacao(payload) {
  const { data, error } = await supabase.from("cotacoes").insert({ ...payload, status: "pending" }).select().single();
  if (error) throw error;
  return data;
}
async function updateCotacaoStatus(id, status) {
  const { error } = await supabase.from("cotacoes").update({ status }).eq("id", id);
  if (error) throw error;
}
async function fetchGastosMensais() {
  const { data, error } = await supabase.from("manutencoes").select("date, cost").not("cost", "is", null).order("date");
  if (error) throw error;
  const map = {};
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  (data ?? []).forEach((m) => {
    const d = new Date(m.date);
    const key = monthNames[d.getMonth()];
    map[key] = (map[key] ?? 0) + (m.cost ?? 0);
  });
  return Object.entries(map).map(([mes, valor]) => ({ mes, valor }));
}
async function fetchKmMedio() {
  const { data, error } = await supabase.from("manutencoes").select("date, km_at_maintenance").not("km_at_maintenance", "is", null).order("date");
  if (error) throw error;
  const map = {};
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  (data ?? []).forEach((m) => {
    const d = new Date(m.date);
    const key = monthNames[d.getMonth()];
    if (!map[key]) map[key] = [];
    map[key].push(m.km_at_maintenance ?? 0);
  });
  return Object.entries(map).map(([mes, kms]) => ({
    mes,
    km: Math.round(kms.reduce((a, b) => a + b, 0) / kms.length)
  }));
}
async function fetchPecasCategoria() {
  const { data, error } = await supabase.from("pecas").select("category").eq("is_active", true);
  if (error) throw error;
  const fills = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--muted-foreground)"
  ];
  const map = {};
  (data ?? []).forEach((p) => {
    const cat = p.category ?? "Outros";
    map[cat] = (map[cat] ?? 0) + 1;
  });
  return Object.entries(map).map(([name, value], i) => ({
    name,
    value,
    fill: fills[i % fills.length]
  }));
}
async function insertPromocao(payload) {
  const disc = payload.original_price && payload.promo_price ? Math.round((1 - payload.promo_price / payload.original_price) * 100) : payload.discount_percent;
  const { data, error } = await supabase.from("promocoes").insert({ ...payload, discount_percent: disc, is_active: true }).select().single();
  if (error) throw error;
  return data;
}
async function updatePromocaoActive(id, is_active) {
  const { error } = await supabase.from("promocoes").update({ is_active }).eq("id", id);
  if (error) throw error;
}
async function fetchAllPromocoes() {
  const { data, error } = await supabase.from("promocoes").select("*, pecas(name, category)").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
async function uploadPecaFoto(file, pecaId) {
  const ext = file.name.split(".").pop();
  const path = `${pecaId}.${ext}`;
  const { error } = await supabase.storage.from("pecas-fotos").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("pecas-fotos").getPublicUrl(path);
  return data.publicUrl;
}
async function updatePeca(id, payload) {
  const { error } = await supabase.from("pecas").update(payload).eq("id", id);
  if (error) throw error;
}
async function insertPeca(payload) {
  const { data, error } = await supabase.from("pecas").insert({ ...payload, is_active: true }).select().single();
  if (error) throw error;
  return data;
}
async function fetchManutencoesDetalhadas() {
  const { data, error } = await supabase.from("manutencoes").select("*, veiculos(frota_number, plate, model)").order("date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
async function uploadManutencaoFoto(file, manutencaoId, index) {
  const ext = file.name.split(".").pop();
  const path = `${manutencaoId}-${index}.${ext}`;
  const { error } = await supabase.storage.from("manutencao-fotos").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("manutencao-fotos").getPublicUrl(path);
  return data.publicUrl;
}
async function insertPedidoSugerido(payload) {
  const { data, error } = await supabase.from("pedidos").insert({
    manutencao_id: payload.manutencao_id,
    veiculo_id: payload.veiculo_id,
    filial_id: payload.filial_id,
    status: "new",
    items: payload.items,
    total: payload.total,
    notes: payload.notes ?? "Pedido gerado automaticamente pela manutenção"
  }).select().single();
  if (error) throw error;
  return data;
}
async function fetchPedidosDetalhados() {
  const { data, error } = await supabase.from("pedidos").select("*, veiculos(frota_number, plate), manutencoes(type, date)").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
const queries = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  deriveStatus,
  fetchAllPromocoes,
  fetchCotacoes,
  fetchGastosMensais,
  fetchKmMedio,
  fetchManutencoes,
  fetchManutencoesDetalhadas,
  fetchPecas,
  fetchPecasCategoria,
  fetchPedidos,
  fetchPedidosDetalhados,
  fetchPromocoes,
  fetchVeiculos,
  fetchVeiculosList,
  insertCotacao,
  insertManutencao,
  insertPeca,
  insertPedidoSugerido,
  insertPromocao,
  insertVeiculo,
  updateCotacaoStatus,
  updatePeca,
  updatePromocaoActive,
  uploadManutencaoFoto,
  uploadPecaFoto
}, Symbol.toStringTag, { value: "Module" }));
const fleetKeys = {
  veiculos: ["veiculos"],
  veiculosList: ["veiculosList"],
  pecas: ["pecas"],
  promocoes: ["promocoes"],
  cotacoes: ["cotacoes"],
  pedidos: ["pedidos"],
  gastosMensais: ["gastosMensais"],
  kmMedio: ["kmMedio"],
  pecasCategoria: ["pecasCategoria"],
  manutencoes: ["manutencoes"]
};
function useVeiculos() {
  return useQuery({
    queryKey: fleetKeys.veiculos,
    queryFn: fetchVeiculos,
    staleTime: 6e4
  });
}
function useVeiculosList() {
  return useQuery({
    queryKey: fleetKeys.veiculosList,
    queryFn: fetchVeiculosList,
    staleTime: 6e4
  });
}
function usePecas() {
  return useQuery({
    queryKey: fleetKeys.pecas,
    queryFn: fetchPecas,
    staleTime: 12e4
  });
}
function usePromocoes() {
  return useQuery({
    queryKey: fleetKeys.promocoes,
    queryFn: fetchPromocoes,
    staleTime: 6e4
  });
}
function useCotacoes() {
  return useQuery({
    queryKey: fleetKeys.cotacoes,
    queryFn: fetchCotacoes,
    staleTime: 3e4
  });
}
function useGastosMensais() {
  return useQuery({
    queryKey: fleetKeys.gastosMensais,
    queryFn: fetchGastosMensais,
    staleTime: 12e4
  });
}
function useKmMedio() {
  return useQuery({
    queryKey: fleetKeys.kmMedio,
    queryFn: fetchKmMedio,
    staleTime: 12e4
  });
}
function usePecasCategoria() {
  return useQuery({
    queryKey: fleetKeys.pecasCategoria,
    queryFn: fetchPecasCategoria,
    staleTime: 12e4
  });
}
function useManutencoesList() {
  return useQuery({
    queryKey: fleetKeys.manutencoes,
    queryFn: () => Promise.resolve().then(() => queries).then((m) => m.fetchManutencoesDetalhadas()),
    staleTime: 3e4
  });
}
function useAllPromocoes() {
  return useQuery({
    queryKey: ["allPromocoes"],
    queryFn: () => Promise.resolve().then(() => queries).then((m) => m.fetchAllPromocoes()),
    staleTime: 3e4
  });
}
function usePedidosDetalhados() {
  return useQuery({
    queryKey: ["pedidosDetalhados"],
    queryFn: () => Promise.resolve().then(() => queries).then((m) => m.fetchPedidosDetalhados()),
    staleTime: 3e4
  });
}
export {
  usePedidosDetalhados as a,
  useVeiculosList as b,
  usePecas as c,
  useManutencoesList as d,
  uploadManutencaoFoto as e,
  insertPedidoSugerido as f,
  fleetKeys as g,
  useVeiculos as h,
  insertManutencao as i,
  insertVeiculo as j,
  useGastosMensais as k,
  usePecasCategoria as l,
  useKmMedio as m,
  useCotacoes as n,
  useAllPromocoes as o,
  updatePromocaoActive as p,
  insertPromocao as q,
  uploadPecaFoto as r,
  updatePeca as s,
  insertPeca as t,
  usePromocoes as u
};
