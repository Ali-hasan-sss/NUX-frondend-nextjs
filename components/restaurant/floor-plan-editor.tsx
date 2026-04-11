"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  restaurantAccountService,
  type FloorPlanElement,
  type FloorPlanElementType,
  type FloorPlanWall,
} from "@/features/restaurant/restaurantAccount/restaurantAccountService";
import {
  MousePointer2,
  Pencil,
  Square,
  Circle,
  UtensilsCrossed,
  Type,
  Save,
  Trash2,
  ZoomIn,
  ZoomOut,
  Copy,
  ClipboardPaste,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const CANVAS_W = 1000;
const CANVAS_H = 700;
const HANDLE_SIZE = 10;
const MIN_ELEMENT_SIZE = 12;

const ELEMENT_DEFAULTS: Record<FloorPlanElementType, { width: number; height: number }> = {
  table: { width: 60, height: 60 },
  chair: { width: 32, height: 32 },
  bar: { width: 120, height: 40 },
  barStool: { width: 28, height: 28 },
  refrigerator: { width: 56, height: 72 },
  coffeeMachine: { width: 50, height: 45 },
  juiceMachine: { width: 50, height: 45 },
  iceCreamMachine: { width: 50, height: 45 },
  label: { width: 80, height: 24 },
};

/** Custom SVG assets (public/) for equipment on the canvas */
const ELEMENT_IMAGE_SRC: Partial<Record<FloorPlanElementType, string>> = {
  refrigerator: "/images/floor_plan_tool/noun-refrigerator-7904028.svg",
  coffeeMachine: "/images/floor_plan_tool/noun-coffee-machine-6941969.svg",
  juiceMachine: "/images/floor_plan_tool/noun-baby-smoothie-5910480.svg",
  iceCreamMachine: "/images/floor_plan_tool/noun-ice-cream-machine-6438781.svg",
};

const TOOL_ICONS: Record<FloorPlanElementType, React.ReactNode> = {
  table: <Square className="h-4 w-4" />,
  chair: <Circle className="h-4 w-4" />,
  bar: <UtensilsCrossed className="h-4 w-4" />,
  barStool: <Circle className="h-4 w-4" />,
  refrigerator: null,
  coffeeMachine: null,
  juiceMachine: null,
  iceCreamMachine: null,
  label: <Type className="h-4 w-4" />,
};

function FloorPlanToolbarIcon({ type }: { type: FloorPlanElementType }) {
  const src = ELEMENT_IMAGE_SRC[type];
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="h-5 w-5 shrink-0 object-contain pointer-events-none"
        draggable={false}
      />
    );
  }
  return TOOL_ICONS[type];
}

/** HTML5 DataTransfer type for palette → canvas drops */
const DND_ELEMENT_MIME = "application/x-nux-floor-plan-element";

function genId() {
  return `fp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** AABB intersection: element / wall segment bbox vs marquee */
function collectIdsInMarquee(
  elements: FloorPlanElement[],
  walls: FloorPlanWall[],
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string[] {
  const ids: string[] = [];
  for (const el of elements) {
    const ew = el.width ?? 40;
    const eh = el.height ?? 40;
    const ex1 = el.x;
    const ey1 = el.y;
    const ex2 = el.x + ew;
    const ey2 = el.y + eh;
    if (!(ex2 < x1 || ex1 > x2 || ey2 < y1 || ey1 > y2)) ids.push(el.id);
  }
  for (const w of walls) {
    if (w.points.length < 2) continue;
    const a = w.points[0];
    const b = w.points[1];
    const sx1 = Math.min(a.x, b.x);
    const sx2 = Math.max(a.x, b.x);
    const sy1 = Math.min(a.y, b.y);
    const sy2 = Math.max(a.y, b.y);
    if (!(sx2 < x1 || sx1 > x2 || sy2 < y1 || sy1 > y2)) ids.push(w.id);
  }
  return ids;
}

const PASTE_OFFSET = 28;

function floorPlanGroupBBox(els: FloorPlanElement[], ws: FloorPlanWall[]) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const expand = (x: number, y: number) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  };
  for (const e of els) {
    const w = e.width ?? 40;
    const h = e.height ?? 40;
    expand(e.x, e.y);
    expand(e.x + w, e.y + h);
  }
  for (const w of ws) {
    for (const p of w.points) expand(p.x, p.y);
  }
  if (!Number.isFinite(minX)) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  return { minX, minY, maxX, maxY };
}

/** Nudge pasted group so it stays inside the canvas without breaking relative layout */
function shiftGroupIntoCanvas(els: FloorPlanElement[], ws: FloorPlanWall[]): { elements: FloorPlanElement[]; walls: FloorPlanWall[] } {
  let elsOut = els.map((e) => ({ ...e }));
  let wsOut = ws.map((w) => ({ ...w, points: w.points.map((p) => ({ ...p })) }));
  for (let i = 0; i < 4; i++) {
    const b = floorPlanGroupBBox(elsOut, wsOut);
    let sx = 0;
    let sy = 0;
    if (b.minX < 0) sx = -b.minX;
    if (b.minY < 0) sy = -b.minY;
    if (sx !== 0 || sy !== 0) {
      elsOut = elsOut.map((e) => ({ ...e, x: e.x + sx, y: e.y + sy }));
      wsOut = wsOut.map((w) => ({ ...w, points: w.points.map((p) => ({ x: p.x + sx, y: p.y + sy })) }));
    }
    const b2 = floorPlanGroupBBox(elsOut, wsOut);
    let dx = 0;
    let dy = 0;
    if (b2.maxX > CANVAS_W) dx = CANVAS_W - b2.maxX;
    if (b2.maxY > CANVAS_H) dy = CANVAS_H - b2.maxY;
    if (dx !== 0 || dy !== 0) {
      elsOut = elsOut.map((e) => ({ ...e, x: e.x + dx, y: e.y + dy }));
      wsOut = wsOut.map((w) => ({ ...w, points: w.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) }));
    }
    if (sx === 0 && sy === 0 && dx === 0 && dy === 0) break;
  }
  return { elements: elsOut, walls: wsOut };
}

export function FloorPlanEditor() {
  const { t } = useTranslation();
  const svgRef = useRef<SVGSVGElement>(null);
  const [walls, setWalls] = useState<FloorPlanWall[]>([]);
  const [elements, setElements] = useState<FloorPlanElement[]>([]);
  const [tool, setTool] = useState<"select" | "wall">("select");
  const [drawingWall, setDrawingWall] = useState<{ x: number; y: number }[]>([]);
  /** Wall draw: drag from A to B to add segment; preview while dragging */
  const [wallDragStart, setWallDragStart] = useState<{ x: number; y: number } | null>(null);
  const [wallDragCurrent, setWallDragCurrent] = useState<{ x: number; y: number } | null>(null);
  /** Selected element and/or wall ids (walls never move as a group) */
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedIdsRef = useRef<string[]>([]);
  selectedIdsRef.current = selectedIds;

  type ElementDragState = {
    startPointer: { x: number; y: number };
    ids: string[];
    initial: Record<string, { x: number; y: number }>;
  };
  const [elementDrag, setElementDrag] = useState<ElementDragState | null>(null);
  /** After Ctrl/Shift+click to add to selection, start drag only once pointer moves */
  const pendingElementDragRef = useRef<{ start: { x: number; y: number } } | null>(null);
  const DRAG_THRESHOLD = 4;
  /** Rubber-band selection (desktop-style) on empty canvas */
  const [marquee, setMarquee] = useState<{ start: { x: number; y: number }; current: { x: number; y: number } } | null>(
    null,
  );
  const marqueeAdditiveRef = useRef(false);
  const marqueePointerIdRef = useRef<number | null>(null);
  /** Pointerup + mouseup can both fire once; run end-handler once per release */
  const pointerUpLockRef = useRef(false);
  const MARQUEE_MIN = 5;
  /** Drag whole wall when select tool */
  const [dragWall, setDragWall] = useState<{
    id: string;
    startX: number;
    startY: number;
    initialPoints: { x: number; y: number }[];
  } | null>(null);
  const [editLabelId, setEditLabelId] = useState<string | null>(null);
  const [editLabelValue, setEditLabelValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const justDraggedRef = useRef(false);
  const justPlacedRef = useRef(false);
  const justHandledRef = useRef(false); // resize handle interaction
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  type ResizeCorner = "nw" | "ne" | "sw" | "se";
  const [resizeHandle, setResizeHandle] = useState<{
    id: string;
    corner: ResizeCorner;
    startX: number;
    startY: number;
    initialRect: { x: number; y: number; width: number; height: number };
  } | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const ZOOM_MIN = 0.25;
  const ZOOM_MAX = 2;
  const ZOOM_STEP = 0.25;

  const elementTypeLabel = useCallback(
    (type: FloorPlanElementType) =>
      t(`dashboard.floorPlan.elements.${type}`, {
        defaultValue: type.replace(/([A-Z])/g, " $1").trim(),
      }),
    [t],
  );

  const getSvgPointFromClient = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const svgP = pt.matrixTransform(ctm.inverse());
      return { x: svgP.x, y: svgP.y };
    }
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((clientY - rect.top) / rect.height) * CANVAS_H,
    };
  }, []);

  const getSvgPoint = useCallback(
    (e: React.MouseEvent) => getSvgPointFromClient(e.clientX, e.clientY),
    [getSvgPointFromClient],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await restaurantAccountService.getFloorPlan();
      const segments: FloorPlanWall[] = [];
      (data.walls || []).forEach((w: FloorPlanWall) => {
        const pts = w.points || [];
        if (pts.length >= 2) {
          for (let i = 0; i < pts.length - 1; i++) {
            segments.push({ id: pts.length === 2 ? w.id : genId(), points: [pts[i], pts[i + 1]] });
          }
        }
      });
      setWalls(segments);
      setElements(data.elements || []);
    } catch {
      toast.error(t("dashboard.floorPlan.errorLoad") || "Failed to load floor plan");
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const deleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    const setSel = new Set(selectedIds);
    setElements((prev) => prev.filter((e) => !setSel.has(e.id)));
    setWalls((prev) => prev.filter((w) => !setSel.has(w.id)));
    selectedIdsRef.current = [];
    setSelectedIds([]);
  }, [selectedIds]);

  const clipboardRef = useRef<{ elements: FloorPlanElement[]; walls: FloorPlanWall[] } | null>(null);
  const [pasteAvailable, setPasteAvailable] = useState(false);

  const copySelection = useCallback(() => {
    if (selectedIds.length === 0) return;
    const sel = new Set(selectedIds);
    const elCopy = elements.filter((e) => sel.has(e.id)).map((e) => ({ ...e }));
    const wallCopy = walls
      .filter((w) => sel.has(w.id))
      .map((w) => ({ ...w, points: w.points.map((p) => ({ ...p })) }));
    if (elCopy.length === 0 && wallCopy.length === 0) {
      clipboardRef.current = null;
      setPasteAvailable(false);
      return;
    }
    clipboardRef.current = { elements: elCopy, walls: wallCopy };
    setPasteAvailable(true);
  }, [elements, walls, selectedIds]);

  const pasteSelection = useCallback(() => {
    const clip = clipboardRef.current;
    if (!clip || (clip.elements.length === 0 && clip.walls.length === 0)) return;
    let nextEls = clip.elements.map((e) => ({ ...e, x: e.x + PASTE_OFFSET, y: e.y + PASTE_OFFSET }));
    let nextWalls = clip.walls.map((w) => ({
      ...w,
      points: w.points.map((p) => ({ x: p.x + PASTE_OFFSET, y: p.y + PASTE_OFFSET })),
    }));
    const shifted = shiftGroupIntoCanvas(nextEls, nextWalls);
    const newEls = shifted.elements.map((e) => ({ ...e, id: genId() }));
    const newWalls = shifted.walls.map((w) => ({ ...w, id: genId() }));
    const newIds = [...newEls.map((e) => e.id), ...newWalls.map((w) => w.id)];
    setElements((prev) => [...prev, ...newEls]);
    setWalls((prev) => [...prev, ...newWalls]);
    selectedIdsRef.current = newIds;
    setSelectedIds(newIds);
    setTool("select");
    justPlacedRef.current = true;
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (editLabelId) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;

      const mod = e.ctrlKey || e.metaKey;
      if (mod && (e.key === "c" || e.key === "C")) {
        if (selectedIds.length > 0) {
          e.preventDefault();
          copySelection();
        }
        return;
      }
      if (mod && (e.key === "v" || e.key === "V")) {
        const clip = clipboardRef.current;
        if (clip && (clip.elements.length > 0 || clip.walls.length > 0)) {
          e.preventDefault();
          pasteSelection();
        }
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedIds.length > 0) {
        e.preventDefault();
        deleteSelected();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIds, editLabelId, deleteSelected, copySelection, pasteSelection]);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      await restaurantAccountService.updateFloorPlan({ walls, elements });
      toast.success(t("dashboard.floorPlan.saved") || "Floor plan saved");
    } catch {
      toast.error(t("dashboard.floorPlan.errorSave") || "Failed to save");
    } finally {
      setSaving(false);
    }
  }, [walls, elements, t]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.currentTarget !== svgRef.current) return;
      if (justHandledRef.current) {
        justHandledRef.current = false;
        return;
      }
      if (justDraggedRef.current) {
        justDraggedRef.current = false;
        return;
      }
      if (justPlacedRef.current) {
        justPlacedRef.current = false;
        return;
      }
      if (tool === "wall") return;
      /* Elements are added only via drag-and-drop from the toolbar */
    },
    [tool],
  );

  const handleSvgDragOver = useCallback((e: React.DragEvent<SVGSVGElement>) => {
    const types = Array.from(e.dataTransfer.types);
    if (!types.includes(DND_ELEMENT_MIME)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleSvgDrop = useCallback(
    (e: React.DragEvent<SVGSVGElement>) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData(DND_ELEMENT_MIME);
      if (!raw || !(raw in ELEMENT_DEFAULTS)) return;
      const elType = raw as FloorPlanElementType;
      const pt = getSvgPointFromClient(e.clientX, e.clientY);
      const def = ELEMENT_DEFAULTS[elType];
      const newId = genId();
      let x = pt.x - def.width / 2;
      let y = pt.y - def.height / 2;
      x = Math.max(0, Math.min(CANVAS_W - def.width, x));
      y = Math.max(0, Math.min(CANVAS_H - def.height, y));
      setElements((prev) => [
        ...prev,
        {
          id: newId,
          type: elType,
          x,
          y,
          width: def.width,
          height: def.height,
          label: elType === "label" ? (t("dashboard.floorPlan.newLabel") || "Label") : undefined,
        },
      ]);
      selectedIdsRef.current = [newId];
      setSelectedIds([newId]);
      setTool("select");
      justPlacedRef.current = true;
    },
    [getSvgPointFromClient, t],
  );

  const dist = useCallback((a: { x: number; y: number }, b: { x: number; y: number }) => {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }, []);

  const finishWall = useCallback(() => {
    if (drawingWall.length >= 2) {
      const newWalls: FloorPlanWall[] = [];
      for (let i = 0; i < drawingWall.length - 1; i++) {
        newWalls.push({ id: genId(), points: [drawingWall[i], drawingWall[i + 1]] });
      }
      setWalls((prev) => [...prev, ...newWalls]);
      setDrawingWall([]);
    }
  }, [drawingWall]);

  const cancelWall = useCallback(() => setDrawingWall([]), []);

  const distToSegment = useCallback(
    (p: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1e-6;
      const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (len * len)));
      const proj = { x: a.x + t * dx, y: a.y + t * dy };
      return dist(p, proj);
    },
    [dist]
  );

  const WALL_HIT_THRESHOLD = 18;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const pt = getSvgPoint(e);
      if (e.currentTarget !== svgRef.current) return;

      if (tool === "wall") {
        setWallDragStart(pt);
        setWallDragCurrent(pt);
        return;
      }

      justPlacedRef.current = false;

      // Resize handle hit (single selected element only)
      if (selectedIds.length === 1) {
        const selEl = elements.find((el) => el.id === selectedIds[0]);
        if (selEl) {
          const rx = selEl.x;
          const ry = selEl.y;
          const rw = selEl.width ?? 40;
          const rh = selEl.height ?? 40;
          const inHandle = (cx: number, cy: number) =>
            pt.x >= cx && pt.x <= cx + HANDLE_SIZE && pt.y >= cy && pt.y <= cy + HANDLE_SIZE;
          if (inHandle(rx, ry)) {
            setResizeHandle({
              id: selEl.id,
              corner: "nw",
              startX: pt.x,
              startY: pt.y,
              initialRect: { x: rx, y: ry, width: rw, height: rh },
            });
            justHandledRef.current = true;
            return;
          }
          if (inHandle(rx + rw - HANDLE_SIZE, ry)) {
            setResizeHandle({
              id: selEl.id,
              corner: "ne",
              startX: pt.x,
              startY: pt.y,
              initialRect: { x: rx, y: ry, width: rw, height: rh },
            });
            justHandledRef.current = true;
            return;
          }
          if (inHandle(rx, ry + rh - HANDLE_SIZE)) {
            setResizeHandle({
              id: selEl.id,
              corner: "sw",
              startX: pt.x,
              startY: pt.y,
              initialRect: { x: rx, y: ry, width: rw, height: rh },
            });
            justHandledRef.current = true;
            return;
          }
          if (inHandle(rx + rw - HANDLE_SIZE, ry + rh - HANDLE_SIZE)) {
            setResizeHandle({
              id: selEl.id,
              corner: "se",
              startX: pt.x,
              startY: pt.y,
              initialRect: { x: rx, y: ry, width: rw, height: rh },
            });
            justHandledRef.current = true;
            return;
          }
        }
      }

      // Select / drag elements or walls
      {
        const hitEl = [...elements].reverse().find((el) => {
          const w = el.width ?? 40;
          const h = el.height ?? 40;
          return pt.x >= el.x && pt.x <= el.x + w && pt.y >= el.y && pt.y <= el.y + h;
        });
        if (hitEl) {
          const additive = e.shiftKey || e.ctrlKey || e.metaKey;
          if (additive) {
            const wasIn = selectedIdsRef.current.includes(hitEl.id);
            const nextSet = new Set(selectedIdsRef.current);
            if (wasIn) nextSet.delete(hitEl.id);
            else nextSet.add(hitEl.id);
            const nextArr = [...nextSet];
            selectedIdsRef.current = nextArr;
            setSelectedIds(nextArr);
            pendingElementDragRef.current = wasIn ? null : { start: pt };
            return;
          }
          pendingElementDragRef.current = null;
          let idsToDrag: string[];
          if (!selectedIdsRef.current.includes(hitEl.id)) {
            selectedIdsRef.current = [hitEl.id];
            setSelectedIds([hitEl.id]);
            idsToDrag = [hitEl.id];
          } else {
            idsToDrag = selectedIdsRef.current.filter((id) => elements.some((el) => el.id === id));
          }
          if (idsToDrag.length === 0) idsToDrag = [hitEl.id];
          const initial: Record<string, { x: number; y: number }> = {};
          for (const id of idsToDrag) {
            const el = elements.find((e) => e.id === id);
            if (el) initial[id] = { x: el.x, y: el.y };
          }
          setElementDrag({
            startPointer: pt,
            ids: idsToDrag.filter((id) => initial[id] != null),
            initial,
          });
          return;
        }
        const hitWall = walls.find(
          (w) => w.points.length >= 2 && distToSegment(pt, w.points[0], w.points[1]) < WALL_HIT_THRESHOLD
        );
        if (hitWall) {
          pendingElementDragRef.current = null;
          const additive = e.shiftKey || e.ctrlKey || e.metaKey;
          if (additive) {
            const nextSet = new Set(selectedIdsRef.current);
            if (nextSet.has(hitWall.id)) nextSet.delete(hitWall.id);
            else nextSet.add(hitWall.id);
            const nextArr = [...nextSet];
            selectedIdsRef.current = nextArr;
            setSelectedIds(nextArr);
            return;
          }
          selectedIdsRef.current = [hitWall.id];
          setSelectedIds([hitWall.id]);
          setDragWall({
            id: hitWall.id,
            startX: pt.x,
            startY: pt.y,
            initialPoints: hitWall.points.map((p) => ({ x: p.x, y: p.y })),
          });
          setDragPosition(pt);
        } else {
          pendingElementDragRef.current = null;
          if (tool === "select") {
            setMarquee({ start: pt, current: pt });
            marqueeAdditiveRef.current = e.shiftKey || e.ctrlKey || e.metaKey;
            const ne = e.nativeEvent;
            if (typeof PointerEvent !== "undefined" && ne instanceof PointerEvent) {
              marqueePointerIdRef.current = ne.pointerId;
              try {
                svgRef.current?.setPointerCapture(ne.pointerId);
              } catch {
                /* ignore */
              }
            } else {
              marqueePointerIdRef.current = null;
            }
          } else {
            selectedIdsRef.current = [];
            setSelectedIds([]);
          }
        }
      }
    },
    [tool, elements, walls, getSvgPoint, distToSegment, selectedIds]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const pt = getSvgPoint(e);

      if (marquee) {
        setMarquee((m) => (m ? { ...m, current: pt } : null));
        return;
      }

      if (pendingElementDragRef.current && !elementDrag) {
        const pend = pendingElementDragRef.current;
        if (dist(pt, pend.start) > DRAG_THRESHOLD) {
          const ids = selectedIdsRef.current.filter((id) => elements.some((el) => el.id === id));
          if (ids.length > 0) {
            const initial: Record<string, { x: number; y: number }> = {};
            for (const id of ids) {
              const el = elements.find((x) => x.id === id);
              if (el) initial[id] = { x: el.x, y: el.y };
            }
            const ready = ids.filter((id) => initial[id] != null);
            if (ready.length > 0) {
              setElementDrag({ startPointer: pend.start, ids: ready, initial });
            }
          }
          pendingElementDragRef.current = null;
        }
      }

      if (resizeHandle) {
        const { id, corner, startX, startY, initialRect: R } = resizeHandle;
        const dx = pt.x - startX;
        const dy = pt.y - startY;
        let x = R.x;
        let y = R.y;
        let w = R.width;
        let h = R.height;
        if (corner === "se") {
          w = Math.max(MIN_ELEMENT_SIZE, R.width + dx);
          h = Math.max(MIN_ELEMENT_SIZE, R.height + dy);
        } else if (corner === "sw") {
          w = Math.max(MIN_ELEMENT_SIZE, R.width - dx);
          h = Math.max(MIN_ELEMENT_SIZE, R.height + dy);
          x = R.x + R.width - w;
        } else if (corner === "ne") {
          w = Math.max(MIN_ELEMENT_SIZE, R.width + dx);
          h = Math.max(MIN_ELEMENT_SIZE, R.height - dy);
          y = R.y + R.height - h;
        } else {
          w = Math.max(MIN_ELEMENT_SIZE, R.width - dx);
          h = Math.max(MIN_ELEMENT_SIZE, R.height - dy);
          x = R.x + R.width - w;
          y = R.y + R.height - h;
        }
        setElements((prev) =>
          prev.map((el) => (el.id === id ? { ...el, x, y, width: w, height: h } : el))
        );
        return;
      }
      if (wallDragStart !== null) {
        setWallDragCurrent(pt);
        return;
      }
      if (dragWall) {
        setDragPosition(pt);
        const dx = pt.x - dragWall.startX;
        const dy = pt.y - dragWall.startY;
        setWalls((prev) =>
          prev.map((w) =>
            w.id === dragWall.id
              ? { ...w, points: dragWall.initialPoints.map((p) => ({ x: p.x + dx, y: p.y + dy })) }
              : w
          )
        );
        return;
      }
      if (elementDrag) {
        const dx = pt.x - elementDrag.startPointer.x;
        const dy = pt.y - elementDrag.startPointer.y;
        setElements((prev) =>
          prev.map((el) => {
            if (!elementDrag.ids.includes(el.id)) return el;
            const init = elementDrag.initial[el.id];
            if (!init) return el;
            const w = el.width ?? 40;
            const h = el.height ?? 40;
            return {
              ...el,
              x: Math.max(0, Math.min(CANVAS_W - w, init.x + dx)),
              y: Math.max(0, Math.min(CANVAS_H - h, init.y + dy)),
            };
          })
        );
      }
    },
    [marquee, resizeHandle, wallDragStart, dragWall, elementDrag, getSvgPoint, dist, elements]
  );

  const releaseMarqueePointerCapture = useCallback(() => {
    const pid = marqueePointerIdRef.current;
    if (pid != null && svgRef.current) {
      try {
        svgRef.current.releasePointerCapture(pid);
      } catch {
        /* ignore */
      }
      marqueePointerIdRef.current = null;
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    if (pointerUpLockRef.current) return;
    pointerUpLockRef.current = true;
    try {
    if (wallDragStart !== null && wallDragCurrent !== null) {
      const start = wallDragStart;
      const end = wallDragCurrent;
      if (dist(start, end) > 5) {
        setDrawingWall((prev) => {
          const last = prev[prev.length - 1];
          const snap = last && dist(last, start) < 20 ? last : null;
          if (prev.length === 0) return [start, end];
          if (snap) return [...prev, end];
          return [...prev, start, end];
        });
      }
      setWallDragStart(null);
      setWallDragCurrent(null);
      return;
    }
    if (marquee) {
      releaseMarqueePointerCapture();
      const { start, current } = marquee;
      const bw = Math.abs(current.x - start.x);
      const bh = Math.abs(current.y - start.y);
      if (bw >= MARQUEE_MIN || bh >= MARQUEE_MIN) {
        const x1 = Math.min(start.x, current.x);
        const y1 = Math.min(start.y, current.y);
        const x2 = Math.max(start.x, current.x);
        const y2 = Math.max(start.y, current.y);
        const picked = collectIdsInMarquee(elements, walls, x1, y1, x2, y2);
        if (marqueeAdditiveRef.current) {
          const next = [...new Set([...selectedIdsRef.current, ...picked])];
          selectedIdsRef.current = next;
          setSelectedIds(next);
        } else {
          selectedIdsRef.current = picked;
          setSelectedIds(picked);
        }
        justDraggedRef.current = true;
      } else if (!marqueeAdditiveRef.current) {
        selectedIdsRef.current = [];
        setSelectedIds([]);
      }
      setMarquee(null);
      marqueeAdditiveRef.current = false;
    }
    if (resizeHandle) {
      justHandledRef.current = true;
      setResizeHandle(null);
    }
    pendingElementDragRef.current = null;
    if (elementDrag || dragWall) justDraggedRef.current = true;
    setElementDrag(null);
    setDragWall(null);
    setDragPosition(null);
    } finally {
      queueMicrotask(() => {
        pointerUpLockRef.current = false;
      });
    }
  }, [
    wallDragStart,
    wallDragCurrent,
    dist,
    resizeHandle,
    elementDrag,
    dragWall,
    marquee,
    elements,
    walls,
    releaseMarqueePointerCapture,
  ]);

  const handleDoubleClick = useCallback((el: FloorPlanElement) => {
    setEditLabelId(el.id);
    setEditLabelValue(el.label ?? "");
  }, []);

  const applyLabelEdit = useCallback(() => {
    if (!editLabelId) return;
    setElements((prev) =>
      prev.map((e) => (e.id === editLabelId ? { ...e, label: editLabelValue || undefined } : e))
    );
    setEditLabelId(null);
    setEditLabelValue("");
  }, [editLabelId, editLabelValue]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">{t("dashboard.floorPlan.loading") || "Loading..."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 p-2 border rounded-lg bg-muted/30">
        <Button variant={tool === "select" ? "default" : "outline"} size="sm" onClick={() => setTool("select")}>
          <MousePointer2 className="h-4 w-4 mr-1" />
          {t("dashboard.floorPlan.select") || "Select"}
        </Button>
        <Button variant={tool === "wall" ? "default" : "outline"} size="sm" onClick={() => setTool("wall")}>
          <Pencil className="h-4 w-4 mr-1" />
          {t("dashboard.floorPlan.wall") || "Wall"}
        </Button>
        <span className="text-xs text-muted-foreground whitespace-nowrap max-sm:hidden">
          {t("dashboard.floorPlan.dragFromToolbar") || "Drag onto workspace:"}
        </span>
        {(Object.keys(ELEMENT_DEFAULTS) as FloorPlanElementType[]).map((type) => (
          <div
            key={type}
            draggable
            onDragStart={(ev) => {
              ev.dataTransfer.setData(DND_ELEMENT_MIME, type);
              ev.dataTransfer.effectAllowed = "copy";
            }}
            className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2 py-1.5 text-sm shadow-sm cursor-grab active:cursor-grabbing hover:bg-accent select-none touch-none"
            title={t("dashboard.floorPlan.dragFromToolbar") || "Drag onto workspace"}
          >
            <FloorPlanToolbarIcon type={type} />
            <span className="ml-1">{elementTypeLabel(type)}</span>
          </div>
        ))}
        <div className="flex-1" />
        <div className="flex items-center gap-1 border rounded-md px-1 py-0.5 bg-background">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoomScale((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
            disabled={zoomScale <= ZOOM_MIN}
            title={t("dashboard.floorPlan.zoomOut") || "Zoom out"}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="min-w-[3rem] text-center text-sm tabular-nums">
            {Math.round(zoomScale * 100)}%
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoomScale((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
            disabled={zoomScale >= ZOOM_MAX}
            title={t("dashboard.floorPlan.zoomIn") || "Zoom in"}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        {drawingWall.length >= 2 && (
          <>
            <Button size="sm" variant="secondary" onClick={finishWall}>
              {t("dashboard.floorPlan.finishWall") || "Finish wall"}
            </Button>
            <Button size="sm" variant="ghost" onClick={cancelWall}>
              {t("dashboard.floorPlan.cancel") || "Cancel"}
            </Button>
          </>
        )}
        {selectedIds.length > 0 && (
          <>
            <Button size="sm" variant="outline" onClick={copySelection} title={t("dashboard.floorPlan.copyShortcut")}>
              <Copy className="h-4 w-4 mr-1" />
              {t("dashboard.floorPlan.copy") || "Copy"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={pasteSelection}
              disabled={!pasteAvailable}
              title={t("dashboard.floorPlan.pasteShortcut")}
            >
              <ClipboardPaste className="h-4 w-4 mr-1" />
              {t("dashboard.floorPlan.paste") || "Paste"}
            </Button>
            <Button size="sm" variant="destructive" onClick={deleteSelected}>
              <Trash2 className="h-4 w-4 mr-1" />
              {t("dashboard.floorPlan.delete") || "Delete"}
            </Button>
          </>
        )}
        {selectedIds.length === 0 && pasteAvailable && (
          <Button size="sm" variant="outline" onClick={pasteSelection} title={t("dashboard.floorPlan.pasteShortcut")}>
            <ClipboardPaste className="h-4 w-4 mr-1" />
            {t("dashboard.floorPlan.paste") || "Paste"}
          </Button>
        )}
        <Button size="sm" onClick={save} disabled={saving}>
          <Save className="h-4 w-4 mr-1" />
          {saving ? (t("dashboard.floorPlan.saving") || "Saving...") : (t("dashboard.floorPlan.save") || "Save")}
        </Button>
      </div>

      <div className="border rounded-xl overflow-hidden bg-background">
        <div
          className="overflow-auto max-h-[70vh] min-h-[320px]"
          style={{ maxHeight: "70vh" }}
        >
          <div
            style={{
              width: CANVAS_W * zoomScale,
              height: CANVAS_H * zoomScale,
              minWidth: CANVAS_W * zoomScale,
              minHeight: CANVAS_H * zoomScale,
            }}
            className={
              tool === "wall" ? "cursor-crosshair" : marquee ? "cursor-crosshair" : "cursor-default"
            }
          >
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
              preserveAspectRatio="xMidYMid meet"
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onPointerUp={handleMouseUp}
              onMouseUp={handleMouseUp}
              onLostPointerCapture={handleMouseUp}
              onDragOver={handleSvgDragOver}
              onDrop={handleSvgDrop}
              onMouseLeave={() => {
                handleMouseUp();
                setWallDragStart(null);
                setWallDragCurrent(null);
              }}
            >
          <rect width={CANVAS_W} height={CANVAS_H} fill="#f8fafc" />
          {Array.from({ length: Math.ceil(CANVAS_W / 50) }).map((_, i) => (
            <line key={`v-${i}`} x1={i * 50} y1={0} x2={i * 50} y2={CANVAS_H} stroke="#e2e8f0" strokeWidth={0.5} />
          ))}
          {Array.from({ length: Math.ceil(CANVAS_H / 50) }).map((_, i) => (
            <line key={`h-${i}`} x1={0} y1={i * 50} x2={CANVAS_W} y2={i * 50} stroke="#e2e8f0" strokeWidth={0.5} />
          ))}
          {walls.map((wall) => {
            const selected = selectedIds.includes(wall.id);
            const isDragging = dragWall?.id === wall.id;
            const pts =
              isDragging && dragWall && dragPosition
                ? dragWall.initialPoints.map((p) => ({
                    x: p.x + (dragPosition.x - dragWall.startX),
                    y: p.y + (dragPosition.y - dragWall.startY),
                  }))
                : wall.points;
            if (pts.length < 2) return null;
            return (
              <line
                key={wall.id}
                x1={pts[0].x}
                y1={pts[0].y}
                x2={pts[1].x}
                y2={pts[1].y}
                stroke={selected ? "#2563eb" : "#334155"}
                strokeWidth={selected ? 10 : 8}
                strokeLinecap="round"
              />
            );
          })}
          {drawingWall.length > 0 && (
            <polyline
              points={drawingWall.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="#64748b"
              strokeWidth={6}
              strokeDasharray="8 4"
            />
          )}
          {wallDragStart && wallDragCurrent && dist(wallDragStart, wallDragCurrent) > 2 && (
            <line
              x1={wallDragStart.x}
              y1={wallDragStart.y}
              x2={wallDragCurrent.x}
              y2={wallDragCurrent.y}
              stroke="#2563eb"
              strokeWidth={6}
              strokeLinecap="round"
            />
          )}
          {elements.map((el) => {
            const w = el.width ?? 40;
            const h = el.height ?? 40;
            const selected = selectedIds.includes(el.id);
            const x = el.x;
            const y = el.y;
            if (el.type === "label") {
              const lw = el.width ?? 80;
              const lh = el.height ?? 24;
              return (
                <g key={el.id} onDoubleClick={() => handleDoubleClick(el)} style={{ cursor: tool !== "wall" ? "move" : "default" }}>
                  <text
                    x={x + lw / 2}
                    y={y + lh / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={14}
                    fontWeight={600}
                    fill={selected ? "#2563eb" : "#1e293b"}
                  >
                    {el.label || "Label"}
                  </text>
                  {selected && (
                    <rect x={x - 2} y={y - 2} width={lw + 4} height={lh + 4} fill="none" stroke="#2563eb" strokeWidth={2} />
                  )}
                </g>
              );
            }
            const equipSrc = ELEMENT_IMAGE_SRC[el.type];
            if (equipSrc) {
              return (
                <g key={el.id} onDoubleClick={() => handleDoubleClick(el)} style={{ cursor: tool !== "wall" ? "move" : "default" }}>
                  <image
                    href={equipSrc}
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    preserveAspectRatio="xMidYMid meet"
                  />
                  {el.label && (
                    <text x={x + w / 2} y={y + h + 14} textAnchor="middle" fontSize={11} fill="#475569">
                      {el.label}
                    </text>
                  )}
                  {selected && (
                    <rect x={x - 2} y={y - 2} width={w + 4} height={h + 4} fill="none" stroke="#2563eb" strokeWidth={2} />
                  )}
                </g>
              );
            }
            return (
              <g key={el.id} onDoubleClick={() => handleDoubleClick(el)} style={{ cursor: tool !== "wall" ? "move" : "default" }}>
                {el.type === "table" || el.type === "bar" ? (
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill={el.type === "bar" ? "#78716c" : "#a8a29e"}
                    stroke={selected ? "#2563eb" : "#57534e"}
                    strokeWidth={selected ? 3 : 1}
                  />
                ) : (
                  <ellipse
                    cx={x + w / 2}
                    cy={y + h / 2}
                    rx={w / 2}
                    ry={h / 2}
                    fill="#d6d3d1"
                    stroke={selected ? "#2563eb" : "#57534e"}
                    strokeWidth={selected ? 3 : 1}
                  />
                )}
                {el.label && (
                  <text x={x + w / 2} y={y + h + 14} textAnchor="middle" fontSize={11} fill="#475569">
                    {el.label}
                  </text>
                )}
                {selected && (
                  <rect x={x - 2} y={y - 2} width={w + 4} height={h + 4} fill="none" stroke="#2563eb" strokeWidth={2} />
                )}
              </g>
            );
          })}
          {elements.map(
            (el) =>
              selectedIds.length === 1 &&
              selectedIds[0] === el.id &&
              !dragWall &&
              !elementDrag && (
                <g key={`handles-${el.id}`}>
                  {(["nw", "ne", "sw", "se"] as const).map((corner) => {
                    const ew = el.width ?? 40;
                    const eh = el.height ?? 40;
                    const baseX = el.x;
                    const baseY = el.y;
                    const hx = corner === "nw" || corner === "sw" ? baseX : baseX + ew - HANDLE_SIZE;
                    const hy = corner === "nw" || corner === "ne" ? baseY : baseY + eh - HANDLE_SIZE;
                    return (
                      <rect
                        key={corner}
                        x={hx}
                        y={hy}
                        width={HANDLE_SIZE}
                        height={HANDLE_SIZE}
                        fill="#2563eb"
                        stroke="#fff"
                        strokeWidth={1.5}
                        style={{ cursor: `${corner === "nw" || corner === "se" ? "nwse" : "nesw"}-resize` }}
                      />
                    );
                  })}
                </g>
              )
          )}
          {marquee && (() => {
            const mx = Math.min(marquee.start.x, marquee.current.x);
            const my = Math.min(marquee.start.y, marquee.current.y);
            const mw = Math.abs(marquee.current.x - marquee.start.x);
            const mh = Math.abs(marquee.current.y - marquee.start.y);
            return (
              <rect
                x={mx}
                y={my}
                width={mw}
                height={mh}
                fill="rgb(37 99 235 / 0.12)"
                stroke="#2563eb"
                strokeWidth={1}
                strokeDasharray="5 4"
                pointerEvents="none"
              />
            );
          })()}
            </svg>
          </div>
        </div>
      </div>

      {editLabelId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-lg p-4 shadow-xl max-w-sm w-full">
            <label className="text-sm font-medium">{t("dashboard.floorPlan.label") || "Label"}</label>
            <input
              type="text"
              value={editLabelValue}
              onChange={(e) => setEditLabelValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyLabelEdit()}
              className="mt-2 w-full border rounded px-3 py-2"
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={applyLabelEdit}>{t("dashboard.floorPlan.apply") || "Apply"}</Button>
              <Button variant="outline" onClick={() => setEditLabelId(null)}>
                {t("dashboard.floorPlan.cancel") || "Cancel"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        {t("dashboard.floorPlan.hint")}
      </p>
    </div>
  );
}
