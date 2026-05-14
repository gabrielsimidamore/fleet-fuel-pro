import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface AppNotification {
  id: string;
  type: "pedido_novo" | "pedido_aprovado" | "pedido_rejeitado" | "manutencao_agendada";
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  payload?: Record<string, unknown>;
}

const LOCAL_KEY = "fleetcontrol_notifications";

function load(): AppNotification[] {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]"); } catch { return []; }
}
function save(ns: AppNotification[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(ns.slice(0, 50)));
}

let globalListeners: Array<() => void> = [];
function notifyAll() { globalListeners.forEach(fn => fn()); }

export function useNotifications(role: string | null) {
  const [notifications, setNotifications] = useState<AppNotification[]>(load);

  const refresh = useCallback(() => setNotifications(load()), []);

  useEffect(() => {
    globalListeners.push(refresh);
    return () => { globalListeners = globalListeners.filter(fn => fn !== refresh); };
  }, [refresh]);

  const push = useCallback((n: Omit<AppNotification, "id" | "read" | "created_at">) => {
    const item: AppNotification = { ...n, id: crypto.randomUUID(), read: false, created_at: new Date().toISOString() };
    const updated = [item, ...load()];
    save(updated);
    setNotifications(updated);
    notifyAll();
  }, []);

  const markAllRead = useCallback(() => {
    const updated = load().map(n => ({ ...n, read: true }));
    save(updated); setNotifications(updated); notifyAll();
  }, []);

  const markRead = useCallback((id: string) => {
    const updated = load().map(n => n.id === id ? { ...n, read: true } : n);
    save(updated); setNotifications(updated); notifyAll();
  }, []);

  const clear = useCallback(() => {
    save([]); setNotifications([]); notifyAll();
  }, []);

  // Supabase Realtime — pedidos
  useEffect(() => {
    const channel = supabase
      .channel("pedidos-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "pedidos" }, payload => {
        if (role === "admin" || role === "client") {
          push({ type: "pedido_novo", title: "Novo pedido gerado", body: `Pedido #${String(payload.new.id).slice(0,8).toUpperCase()} aguarda aprovação`, payload: payload.new as Record<string, unknown> });
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "pedidos" }, payload => {
        const st = (payload.new as { status: string }).status;
        if (st === "approved") push({ type: "pedido_aprovado", title: "✅ Pedido aprovado", body: `Pedido #${String(payload.new.id).slice(0,8).toUpperCase()} foi aprovado pelo cliente`, payload: payload.new as Record<string, unknown> });
        if (st === "rejected") push({ type: "pedido_rejeitado", title: "❌ Pedido rejeitado", body: `Pedido #${String(payload.new.id).slice(0,8).toUpperCase()} foi rejeitado`, payload: payload.new as Record<string, unknown> });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [role, push]);

  const unread = notifications.filter(n => !n.read).length;
  return { notifications, unread, push, markAllRead, markRead, clear };
}
