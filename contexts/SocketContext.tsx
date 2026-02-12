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

function getSocketUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const base = apiUrl.replace(/\/api\/?$/, "");
  if (base.startsWith("https")) return base.replace(/^https/, "wss");
  return base.replace(/^http/, "ws");
}

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

export interface WaiterRequestItem {
  tableNumber: number;
  tableId: number;
  tableName: string;
  timestamp: string;
  id: string;
}

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  newOrdersCount: number;
  clearNewOrders: () => void;
  waiterRequests: WaiterRequestItem[];
  clearWaiterRequest: (id: string) => void;
  clearAllWaiterRequests: () => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  newOrdersCount: 0,
  clearNewOrders: () => {},
  waiterRequests: [],
  clearWaiterRequest: () => {},
  clearAllWaiterRequests: () => {},
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const token = useAppSelector((s) => s.auth?.tokens?.accessToken);
  const dispatch = useAppDispatch();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [waiterRequests, setWaiterRequests] = useState<WaiterRequestItem[]>([]);

  const clearNewOrders = useCallback(() => setNewOrdersCount(0), []);
  const clearWaiterRequest = useCallback((id: string) => {
    setWaiterRequests((prev) => prev.filter((r) => r.id !== id));
  }, []);
  const clearAllWaiterRequests = useCallback(() => setWaiterRequests([]), []);

  useEffect(() => {
    if (!token) {
      setSocket(null);
      setIsConnected(false);
      setNewOrdersCount(0);
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
        toast(title, { description: description || undefined });
        dispatch(prependNotificationFromSocket(payload));
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

    setSocket(newSocket);
    return () => {
      newSocket.off("notification");
      newSocket.off("order:new");
      newSocket.off("waiter:request");
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [token]);

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
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
