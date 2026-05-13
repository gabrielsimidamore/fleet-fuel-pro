import { useQuery } from "@tanstack/react-query";
import {
  fetchVeiculos,
  fetchVeiculosList,
  fetchPecas,
  fetchPromocoes,
  fetchCotacoes,
  fetchPedidos,
  fetchGastosMensais,
  fetchKmMedio,
  fetchPecasCategoria,
  fetchManutencoes,
} from "@/lib/queries";

export const fleetKeys = {
  veiculos: ["veiculos"] as const,
  veiculosList: ["veiculosList"] as const,
  pecas: ["pecas"] as const,
  promocoes: ["promocoes"] as const,
  cotacoes: ["cotacoes"] as const,
  pedidos: ["pedidos"] as const,
  gastosMensais: ["gastosMensais"] as const,
  kmMedio: ["kmMedio"] as const,
  pecasCategoria: ["pecasCategoria"] as const,
  manutencoes: ["manutencoes"] as const,
};

export function useVeiculos() {
  return useQuery({
    queryKey: fleetKeys.veiculos,
    queryFn: fetchVeiculos,
    staleTime: 60_000,
  });
}

export function useVeiculosList() {
  return useQuery({
    queryKey: fleetKeys.veiculosList,
    queryFn: fetchVeiculosList,
    staleTime: 60_000,
  });
}

export function usePecas() {
  return useQuery({
    queryKey: fleetKeys.pecas,
    queryFn: fetchPecas,
    staleTime: 120_000,
  });
}

export function usePromocoes() {
  return useQuery({
    queryKey: fleetKeys.promocoes,
    queryFn: fetchPromocoes,
    staleTime: 60_000,
  });
}

export function useCotacoes() {
  return useQuery({
    queryKey: fleetKeys.cotacoes,
    queryFn: fetchCotacoes,
    staleTime: 30_000,
  });
}

export function usePedidos() {
  return useQuery({
    queryKey: fleetKeys.pedidos,
    queryFn: fetchPedidos,
    staleTime: 30_000,
  });
}

export function useGastosMensais() {
  return useQuery({
    queryKey: fleetKeys.gastosMensais,
    queryFn: fetchGastosMensais,
    staleTime: 120_000,
  });
}

export function useKmMedio() {
  return useQuery({
    queryKey: fleetKeys.kmMedio,
    queryFn: fetchKmMedio,
    staleTime: 120_000,
  });
}

export function usePecasCategoria() {
  return useQuery({
    queryKey: fleetKeys.pecasCategoria,
    queryFn: fetchPecasCategoria,
    staleTime: 120_000,
  });
}

export function useManutencoes() {
  return useQuery({
    queryKey: fleetKeys.manutencoes,
    queryFn: fetchManutencoes,
    staleTime: 30_000,
  });
}

export function useManutencoesList() {
  return useQuery({
    queryKey: fleetKeys.manutencoes,
    queryFn: () => import("@/lib/queries").then(m => m.fetchManutencoesDetalhadas()),
    staleTime: 30_000,
  });
}

export function useAllPromocoes() {
  return useQuery({
    queryKey: ["allPromocoes"],
    queryFn: () => import("@/lib/queries").then(m => m.fetchAllPromocoes()),
    staleTime: 30_000,
  });
}

export function usePedidosDetalhados() {
  return useQuery({
    queryKey: ["pedidosDetalhados"],
    queryFn: () => import("@/lib/queries").then(m => m.fetchPedidosDetalhados()),
    staleTime: 30_000,
  });
}

export function usePedidosAdmin() {
  return useQuery({
    queryKey: ["pedidosAdmin"],
    queryFn: () => import("@/lib/queries").then(m => m.fetchPedidosAdmin()),
    staleTime: 20_000,
  });
}
