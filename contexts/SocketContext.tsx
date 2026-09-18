"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { toast } from "sonner";
import { prependNotificationFromSocket } from "@/features/notifications/notificationsSlice";
import { getSocketUrl } from "@/lib/apiBaseUrl";

/** Play a short beep (for new order alert) using Web Audio API */
function playNewOrderSound() {
  if (
    typeof window === "undefined" ||
    (!window.AudioContext && !(window as any).webkitAudioContext)
  )
    return;
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch (_) {}
}

/** Play a distinct double beep (for waiter request) using Web Audio API */
function playWaiterRequestSound() {
  if (
    typeof window === "undefined" ||
    (!window.AudioContext && !(window as any).webkitAudioContext)
  )
    return;
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    const playBeep = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
      osc.start(start);
      osc.stop(start + duration);
    };
    const t = ctx.currentTime;
    playBeep(600, t, 0.12);
    playBeep(900, t + 0.15, 0.12);
  } catch (_) {}
}

/** Play a distinctive payment alert sound (money / loyalty payment). */
function playPaymentNotificationSound() {
  if (
    typeof window === "undefined" ||
    (!window.AudioContext && !(window as any).webkitAudioContext)
  )
    return;
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    const playBeep = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "triangle";
      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
      osc.start(start);
      osc.stop(start + duration);
    };
    const t = ctx.currentTime;
    playBeep(700, t, 0.09);
    playBeep(980, t + 0.12, 0.09);
    playBeep(1260, t + 0.24, 0.12);
  } catch (_) {}
}

/** Play a distinct triple beep for loyalty scan approval. */
function playLoyaltyScanSound() {
  if (
    typeof window === "undefined" ||
    (!window.AudioContext && !(window as any).webkitAudioContext)
  )
    return;
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    const playBeep = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "square";
      gain.gain.setValueAtTime(0.16, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
      osc.start(start);
      osc.stop(start + duration);
    };
    const t = ctx.currentTime;
    playBeep(520, t, 0.1);
    playBeep(780, t + 0.14, 0.1);
    playBeep(1040, t + 0.28, 0.16);
  } catch (_) {}
}

function isRestaurantDashboard(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/dashboard");
}

function isPaymentNotification(payload: {
  title?: string;
  body?: string;
  type?: string;
}): boolean {
  const title = (payload.title ?? "").toLowerCase();
  const body = (payload.body ?? "").toLowerCase();
  const type = (payload.type ?? "").toLowerCase();

  if (type === "payment") return true;
  if (title.includes("payment") || title.includes("wallet")) return true;
  if (body.includes("eur") && (body.includes("received") || body.includes("paid")))
    return true;
  if (body.includes("stars_meal") || body.includes("stars_drink")) return true;
  return false;
}

export interface WaiterRequestItem {
  tableNumber: number;
  tableId: number;
  tableName: string;
  timestamp: string;
  id: string;
}

export interface LoyaltyScanRequestItem {
  id: string;
  status?: string;
  type: "drink" | "meal";
  restaurantId: string;
  restaurantName?: string;
  user: {
    id: string;
    fullName: string | null;
    email: string;
  };
  createdAt: string;
  expiresAt: string;
}

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  newOrdersCount: number;
  clearNewOrders: () => void;
  waiterRequests: WaiterRequestItem[];
  clearWaiterRequest: (id: string) => void;
  clearAllWaiterRequests: () => void;
  loyaltyScanRequests: LoyaltyScanRequestItem[];
  removeLoyaltyScanRequest: (id: string) => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  newOrdersCount: 0,
  clearNewOrders: () => {},
  waiterRequests: [],
  clearWaiterRequest: () => {},
  clearAllWaiterRequests: () => {},
  loyaltyScanRequests: [],
  removeLoyaltyScanRequest: () => {},
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const token = useAppSelector((s) => s.auth?.tokens?.accessToken);
  const dispatch = useAppDispatch();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [waiterRequests, setWaiterRequests] = useState<WaiterRequestItem[]>([]);
  const [loyaltyScanRequests, setLoyaltyScanRequests] = useState<
    LoyaltyScanRequestItem[]
  >([]);

  const clearNewOrders = useCallback(() => setNewOrdersCount(0), []);
  const clearWaiterRequest = useCallback((id: string) => {
    setWaiterRequests((prev) => prev.filter((r) => r.id !== id));
  }, []);
  const clearAllWaiterRequests = useCallback(() => setWaiterRequests([]), []);
  const removeLoyaltyScanRequest = useCallback((id: string) => {
    setLoyaltyScanRequests((prev) => prev.filter((r) => r.id !== id));
  }, []);

  useEffect(() => {
    if (!token) {
      setSocket(null);
      setIsConnected(false);
      setNewOrdersCount(0);
      setLoyaltyScanRequests([]);
      return;
    }

    const url = getSocketUrl();
    const newSocket = io(url, {
      path: "/socket.io",
      auth: { token },
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => setIsConnected(true));
    newSocket.on("disconnect", () => setIsConnected(false));

    newSocket.on(
      "notification",
      (payload: { title?: string; body?: string; type?: string }) => {
        const title = payload?.title ?? "Notification";
        const description = payload?.body ?? "";
        const isLoyaltyScan = (payload?.type ?? "").toUpperCase() === "LOYALTY_SCAN";
        if (!(isRestaurantDashboard() && isLoyaltyScan)) {
          toast(title, { description: description || undefined });
        }
        dispatch(prependNotificationFromSocket(payload));
        if (isRestaurantDashboard() && isPaymentNotification(payload)) {
          playPaymentNotificationSound();
        }
      }
    );

    newSocket.on("order:new", () => {
      setNewOrdersCount((c) => c + 1);
      playNewOrderSound();
    });

    newSocket.on(
      "waiter:request",
      (payload: {
        tableNumber: number;
        tableId: number;
        tableName: string;
        timestamp: string;
      }) => {
        const id = `waiter-${payload.tableId}-${payload.timestamp}`;
        setWaiterRequests((prev) => [
          ...prev,
          { ...payload, id } as WaiterRequestItem,
        ]);
        playWaiterRequestSound();
      }
    );

    newSocket.on("loyalty:scan-request", (payload: LoyaltyScanRequestItem) => {
      if (!payload?.id) return;
      setLoyaltyScanRequests((prev) => {
        if (prev.some((item) => item.id === payload.id)) return prev;
        return [...prev, payload];
      });
      if (isRestaurantDashboard()) {
        playLoyaltyScanSound();
      }
    });

    newSocket.on(
      "loyalty:scan-resolved",
      (payload: { id?: string }) => {
        if (!payload?.id) return;
        setLoyaltyScanRequests((prev) => prev.filter((item) => item.id !== payload.id));
      }
    );

    setSocket(newSocket);
    return () => {
      newSocket.off("notification");
      newSocket.off("order:new");
      newSocket.off("waiter:request");
      newSocket.off("loyalty:scan-request");
      newSocket.off("loyalty:scan-resolved");
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [token]);

  useEffect(() => {
    if (!token || !isRestaurantDashboard()) return;
    let cancelled = false;
    void import("@/features/restaurant/qrScans/qrScansService")
      .then(({ qrScansService }) => qrScansService.getPendingApprovals())
      .then((pending) => {
        if (cancelled || !Array.isArray(pending)) return;
        setLoyaltyScanRequests((prev) => {
          const byId = new Map(prev.map((item) => [item.id, item]));
          for (const item of pending) {
            byId.set(item.id, item);
          }
          return Array.from(byId.values()).sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token, isConnected]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        newOrdersCount,
        clearNewOrders,
        waiterRequests,
        clearWaiterRequest,
        clearAllWaiterRequests,
        loyaltyScanRequests,
        removeLoyaltyScanRequest,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
