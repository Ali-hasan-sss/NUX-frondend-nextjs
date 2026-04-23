"use client";

declare global {
  interface Window {
    qz?: any;
  }
}

let qzScriptPromise: Promise<void> | null = null;

function injectQzScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("QZ is only available in browser"));
  }
  if (window.qz) return Promise.resolve();
  if (qzScriptPromise) return qzScriptPromise;

  qzScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(
      'script[data-qz-tray="true"]'
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load QZ Tray library")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/qz-tray@2.2.4/qz-tray.js";
    script.async = true;
    script.dataset.qzTray = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load QZ Tray library"));
    document.body.appendChild(script);
  });

  return qzScriptPromise;
}

export async function ensureQzConnected(): Promise<any> {
  await injectQzScript();
  const qz = window.qz;
  if (!qz) throw new Error("QZ library not loaded");

  if (!qz.websocket.isActive()) {
    await qz.websocket.connect();
  }
  return qz;
}

export async function listQzPrinters(): Promise<string[]> {
  const qz = await ensureQzConnected();
  const printers = await qz.printers.find();
  if (Array.isArray(printers)) return printers;
  if (typeof printers === "string") return [printers];
  return [];
}

export async function printRawToQz(params: {
  printerName: string;
  content: string;
}): Promise<void> {
  const qz = await ensureQzConnected();
  const config = qz.configs.create(params.printerName, { encoding: "UTF-8" });
  await qz.print(config, [params.content]);
}

export function buildEscPosTicket(params: {
  orderId: number;
  createdAt: string;
  orderTypeLabel: string;
  tableLabel: string;
  sectionName: string;
  printerName?: string;
  lines: Array<{ title: string; qty: number; notes?: string; extras?: string[] }>;
}): string {
  const ESC = "\x1B";
  const GS = "\x1D";
  const NL = "\n";

  const chunks: string[] = [];
  chunks.push(ESC + "@"); // init
  chunks.push(ESC + "a" + "\x01"); // center
  chunks.push(ESC + "!" + "\x38"); // double size
  chunks.push(`Order #${params.orderId}${NL}`);
  chunks.push(ESC + "!" + "\x00");
  chunks.push(`${params.createdAt}${NL}`);
  chunks.push(`${params.orderTypeLabel}${NL}`);
  chunks.push(`${params.tableLabel}${NL}`);
  if (params.printerName) chunks.push(`Printer: ${params.printerName}${NL}`);
  chunks.push("--------------------------------" + NL);
  chunks.push(ESC + "!" + "\x08");
  chunks.push(`${params.sectionName}${NL}`);
  chunks.push(ESC + "!" + "\x00");
  chunks.push("--------------------------------" + NL);
  chunks.push(ESC + "a" + "\x00"); // left

  for (const line of params.lines) {
    chunks.push(`${line.title}${NL}`);
    chunks.push(`x${line.qty}${NL}`);
    if (line.notes) chunks.push(`Notes: ${line.notes}${NL}`);
    for (const extra of line.extras ?? []) {
      chunks.push(`+ ${extra}${NL}`);
    }
    chunks.push(NL);
  }

  chunks.push("--------------------------------" + NL);
  chunks.push(ESC + "a" + "\x01");
  chunks.push("Thank you" + NL + NL);
  chunks.push(GS + "V" + "\x41" + "\x10"); // partial cut
  return chunks.join("");
}
