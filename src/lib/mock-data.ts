// Mock data for FleetControl demo
export type VeiculoStatus = "em_dia" | "atencao" | "vencido";

export const FILIAL = {
  id: "fil-sp01",
  name: "Grupo Sabedoria — Filial SP-01",
  city: "São Paulo",
  state: "SP",
};

export const veiculos = [
  { id: "v1", frota: "FR-1001", plate: "ABC-1D23", model: "VW 11.180", brand: "VW", year: 2018, km: 182450, nextDate: "2026-06-15", nextType: "Troca de Óleo", status: "atencao" as VeiculoStatus },
  { id: "v2", frota: "FR-1002", plate: "DEF-2E34", model: "VW 11.180", brand: "VW", year: 2019, km: 145200, nextDate: "2026-07-22", nextType: "Preventiva 30k", status: "em_dia" as VeiculoStatus },
  { id: "v3", frota: "FR-1003", plate: "GHI-3F45", model: "VW 17.230", brand: "VW", year: 2020, km: 210800, nextDate: "2026-05-01", nextType: "Revisão Freios", status: "vencido" as VeiculoStatus },
  { id: "v4", frota: "FR-1004", plate: "JKL-4G56", model: "VW 17.230", brand: "VW", year: 2021, km: 98600, nextDate: "2026-08-10", nextType: "Troca de Óleo", status: "em_dia" as VeiculoStatus },
  { id: "v5", frota: "FR-1005", plate: "MNO-5H67", model: "VW 11.180", brand: "VW", year: 2017, km: 320100, nextDate: "2026-05-28", nextType: "Troca Correia", status: "atencao" as VeiculoStatus },
  { id: "v6", frota: "FR-1006", plate: "PQR-6I78", model: "VW 17.230", brand: "VW", year: 2022, km: 67300, nextDate: "2026-09-15", nextType: "Preventiva 30k", status: "em_dia" as VeiculoStatus },
];

export const gastosMensais = [
  { mes: "Dez", valor: 8400 },
  { mes: "Jan", valor: 12200 },
  { mes: "Fev", valor: 9800 },
  { mes: "Mar", valor: 15600 },
  { mes: "Abr", valor: 11300 },
  { mes: "Mai", valor: 18750 },
];

export const pecasCategoria = [
  { name: "Filtros", value: 28, fill: "var(--chart-1)" },
  { name: "Lubrificantes", value: 22, fill: "var(--chart-2)" },
  { name: "Freios", value: 18, fill: "var(--chart-3)" },
  { name: "Pneus", value: 14, fill: "var(--chart-4)" },
  { name: "Motor", value: 12, fill: "var(--chart-5)" },
  { name: "Outros", value: 6, fill: "var(--muted-foreground)" },
];

export const kmMedio = [
  { mes: "Dez", km: 4200 },
  { mes: "Jan", km: 4500 },
  { mes: "Fev", km: 4100 },
  { mes: "Mar", km: 4800 },
  { mes: "Abr", km: 4600 },
  { mes: "Mai", km: 5100 },
];

export const promocoes = [
  { id: "p1", nome: "Filtro de Óleo", original: 45, promo: 36, desconto: 20, validade: "2026-05-31", categoria: "Filtros" },
  { id: "p2", nome: "Óleo Motor 15W40 5L", original: 35.9, promo: 28.9, desconto: 19, validade: "2026-05-25", categoria: "Lubrificantes" },
  { id: "p3", nome: "Pastilhas de Freio Dianteiras", original: 280, promo: 220, desconto: 21, validade: "2026-05-30", categoria: "Freios" },
];

export const catalogo = [
  { code: "OL001", nome: "Óleo Motor 15W40 5L", categoria: "Lubrificantes", preco: 35.9, intervalo: 15000 },
  { code: "FO001", nome: "Filtro de Óleo", categoria: "Filtros", preco: 45.0, intervalo: 15000 },
  { code: "FA001", nome: "Filtro de Ar", categoria: "Filtros", preco: 85.0, intervalo: 30000 },
  { code: "FC001", nome: "Filtro de Combustível", categoria: "Filtros", preco: 120.0, intervalo: 30000 },
  { code: "PF001", nome: "Pastilhas de Freio Dianteiras", categoria: "Freios", preco: 280.0, intervalo: 50000 },
  { code: "FF001", nome: "Fluido de Freio DOT4", categoria: "Freios", preco: 28.0, intervalo: 0 },
  { code: "CD001", nome: "Correia Dentada", categoria: "Motor", preco: 65.0, intervalo: 60000 },
  { code: "FCA001", nome: "Filtro de Cabine", categoria: "Filtros", preco: 950.0, intervalo: 20000 },
  { code: "PN001", nome: "Pneu 275/80R22.5", categoria: "Pneus", preco: 1250.0, intervalo: 80000 },
  { code: "KE001", nome: "Kit Embreagem", categoria: "Transmissão", preco: 1800.0, intervalo: 120000 },
];

export const cotacoesMock = [
  { id: "C-2026-0001", veiculo: "FR-1001", data: "2026-05-10", total: 481.9, status: "pendente" as const },
  { id: "C-2026-0002", veiculo: "FR-1003", data: "2026-05-08", total: 1320.0, status: "aprovada" as const },
  { id: "C-2026-0003", veiculo: "FR-1005", data: "2026-05-05", total: 65.0, status: "rejeitada" as const },
];

export const pedidosMock = [
  { id: "P-2026-0001", veiculo: "FR-1003", data: "2026-05-08", total: 1320.0, status: "enviado" as const },
  { id: "P-2026-0002", veiculo: "FR-1002", data: "2026-05-02", total: 360.0, status: "entregue" as const },
  { id: "P-2026-0003", veiculo: "FR-1004", data: "2026-05-12", total: 890.5, status: "em_separacao" as const },
];

export const checklistTemplate = {
  Motor: ["Nível de óleo", "Correia dentada", "Filtro de ar", "Filtro de combustível", "Mangueiras e vazamentos"],
  Freios: ["Pastilhas dianteiras", "Pastilhas traseiras", "Fluido de freio", "Discos", "Freio de mão"],
  Fluidos: ["Água do radiador", "Fluido de direção hidráulica", "Fluido de embreagem"],
  Pneus: ["Calibragem dianteiros", "Calibragem traseiros", "Estepe", "Desgaste geral"],
  Elétrica: ["Bateria", "Alternador", "Faróis e lanternas", "Buzina", "Limpadores de para-brisa"],
  Carroceria: ["Retrovisores", "Para-brisa", "Documentação no veículo", "Extintor"],
};

export const filiaisAdmin = [
  { id: "fil-sp01", nome: "Grupo Sabedoria SP-01", cidade: "São Paulo", uf: "SP", veiculos: 6, gastoMes: 18750, ultimaAtividade: "Hoje" },
  { id: "fil-rj01", nome: "Grupo Sabedoria RJ-01", cidade: "Rio de Janeiro", uf: "RJ", veiculos: 4, gastoMes: 9420, ultimaAtividade: "Ontem" },
  { id: "fil-mg01", nome: "Grupo Sabedoria MG-01", cidade: "Belo Horizonte", uf: "MG", veiculos: 5, gastoMes: 12100, ultimaAtividade: "2 dias atrás" },
];

export const faturamentoAnual = [
  { mes: "Jun", valor: 32000 },
  { mes: "Jul", valor: 38500 },
  { mes: "Ago", valor: 41200 },
  { mes: "Set", valor: 35900 },
  { mes: "Out", valor: 44800 },
  { mes: "Nov", valor: 39200 },
  { mes: "Dez", valor: 28400 },
  { mes: "Jan", valor: 42200 },
  { mes: "Fev", valor: 39800 },
  { mes: "Mar", valor: 45600 },
  { mes: "Abr", valor: 41300 },
  { mes: "Mai", valor: 48750 },
];

export const topPecas = [
  { nome: "Óleo Motor 15W40", qtd: 142 },
  { nome: "Filtro de Óleo", qtd: 128 },
  { nome: "Pastilhas Dianteiras", qtd: 89 },
  { nome: "Filtro de Ar", qtd: 76 },
  { nome: "Fluido de Freio", qtd: 64 },
];
