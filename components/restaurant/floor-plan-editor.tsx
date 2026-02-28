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
  Coffee,
  Wine,
  IceCream,
  Type,
  Save,
  Trash2,
  ZoomIn,
  ZoomOut,
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
  coffeeMachine: { width: 50, height: 45 },
  juiceMachine: { width: 50, height: 45 },
  iceCreamMachine: { width: 50, height: 45 },
  label: { width: 80, height: 24 },
};

const TOOL_ICONS: Record<FloorPlanElementType, React.ReactNode> = {
  table: <Square className="h-4 w-4" />,
  chair: <Circle className="h-4 w-4" />,
  bar: <UtensilsCrossed className="h-4 w-4" />,
  barStool: <Circle className="h-4 w-4" />,
  coffeeMachine: <Coffee className="h-4 w-4" />,
  juiceMachine: <Wine className="h-4 w-4" />,
  iceCreamMachine: <IceCream className="h-4 w-4" />,
  label: <Type className="h-4 w-4" />,
};

function genId() {
  return `fp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function FloorPlanEditor() {
  const { t } = useTranslation();
  const svgRef = useRef<SVGSVGElement>(null);
  const [walls, setWalls] = useState<FloorPlanWall[]>([]);
  const [elements, setElements] = useState<FloorPlanElement[]>([]);
  const [tool, setTool] = useState<"select" | "wall" | FloorPlanElementType>("select");
  const [drawingWall, setDrawingWall] = useState<{ x: number; y: number }[]>([]);
  /** Wall draw: drag from A to B to add segment; preview while dragging */
  const [wallDragStart, setWallDragStart] = useState<{ x: number; y: number } | null>(null);
  const [wallDragCurrent, setWallDragCurrent] = useState<{ x: number; y: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragElement, setDragElement] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
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

  const getSvgPoint = useCallback((e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(ctm.inverse());
      return { x: svgP.x, y: svgP.y };
    }
    const rect = svg.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_H,
    };
  }, []);

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
    if (!selectedId) return;
    setElements((prev) => prev.filter((e) => e.id !== selectedId));
    setWalls((prev) => prev.filter((w) => w.id !== selectedId));
    setSelectedId(null);
  }, [selectedId]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (editLabelId) return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        deleteSelected();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId, editLabelId, deleteSelected]);

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
      const pt = getSvgPoint(e);
      if (tool === "wall") return;
      if (tool !== "select" && tool in ELEMENT_DEFAULTS) {
        const def = ELEMENT_DEFAULTS[tool as FloorPlanElementType];
        const newId = genId();
        setElements((prev) => [
          ...prev,
          {
            id: newId,
            type: tool as FloorPlanElementType,
            x: pt.x - def.width / 2,
            y: pt.y - def.height / 2,
            width: def.width,
            height: def.height,
            label: tool === "label" ? (t("dashboard.floorPlan.newLabel") || "Label") : undefined,
          },
        ]);
        setSelectedId(newId);
        justPlacedRef.current = true;
      }
    },
    [tool, getSvgPoint, t]
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

      // Resize handle hit (selected element corners)
      if (selectedId) {
        const selEl = elements.find((el) => el.id === selectedId);
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

      // Any other tool: allow drag element or wall
      {
        const hitEl = [...elements].reverse().find((el) => {
          const w = el.width ?? 40;
          const h = el.height ?? 40;
          return pt.x >= el.x && pt.x <= el.x + w && pt.y >= el.y && pt.y <= el.y + h;
        });
        if (hitEl) {
          setSelectedId(hitEl.id);
          setDragElement({ id: hitEl.id, offsetX: pt.x - hitEl.x, offsetY: pt.y - hitEl.y });
          setDragPosition(pt);
          return;
        }
        const hitWall = walls.find(
          (w) => w.points.length >= 2 && distToSegment(pt, w.points[0], w.points[1]) < WALL_HIT_THRESHOLD
        );
        if (hitWall) {
          setSelectedId(hitWall.id);
          setDragWall({
            id: hitWall.id,
            startX: pt.x,
            startY: pt.y,
            initialPoints: hitWall.points.map((p) => ({ x: p.x, y: p.y })),
          });
          setDragPosition(pt);
        } else setSelectedId(null);
      }
    },
    [tool, elements, walls, getSvgPoint, distToSegment]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const pt = getSvgPoint(e);

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
      if (dragElement) {
        setDragPosition(pt);
        setElements((prev) =>
          prev.map((el) =>
            el.id === dragElement.id
              ? { ...el, x: Math.max(0, pt.x - dragElement.offsetX), y: Math.max(0, pt.y - dragElement.offsetY) }
              : el
          )
        );
      }
    },
    [resizeHandle, wallDragStart, dragWall, dragElement, getSvgPoint]
  );

  const handleMouseUp = useCallback(() => {
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
    if (resizeHandle) {
      justHandledRef.current = true;
      setResizeHandle(null);
    }
    if (dragElement || dragWall) justDraggedRef.current = true;
    setDragElement(null);
    setDragWall(null);
    setDragPosition(null);
  }, [wallDragStart, wallDragCurrent, dist, resizeHandle]);

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
        {(Object.keys(ELEMENT_DEFAULTS) as FloorPlanElementType[]).map((type) => (
          <Button
            key={type}
            variant={tool === type ? "default" : "outline"}
            size="sm"
            onClick={() => setTool(type)}
          >
            {TOOL_ICONS[type]}
            <span className="ml-1 capitalize">{type.replace(/([A-Z])/g, " $1").trim()}</span>
          </Button>
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
        {selectedId && (
          <Button size="sm" variant="destructive" onClick={deleteSelected}>
            <Trash2 className="h-4 w-4 mr-1" />
            {t("dashboard.floorPlan.delete") || "Delete"}
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
            className="cursor-crosshair"
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
              onMouseUp={handleMouseUp}
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
            const selected = selectedId === wall.id;
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
            const selected = selectedId === el.id;
            const isDragging = dragElement?.id === el.id && dragPosition != null;
            const x = isDragging ? dragPosition!.x - dragElement!.offsetX : el.x;
            const y = isDragging ? dragPosition!.y - dragElement!.offsetY : el.y;
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
              selectedId === el.id && !dragWall && (
                <g key={`handles-${el.id}`}>
                  {(["nw", "ne", "sw", "se"] as const).map((corner) => {
                    const ew = el.width ?? 40;
                    const eh = el.height ?? 40;
                    const isDraggingEl = dragElement?.id === el.id && dragPosition != null;
                    const baseX = isDraggingEl ? dragPosition!.x - dragElement!.offsetX : el.x;
                    const baseY = isDraggingEl ? dragPosition!.y - dragElement!.offsetY : el.y;
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
        {t("dashboard.floorPlan.hint") ||
          "Click on the canvas to add an element (it is selected immediately so you can move or resize it). Select an element to see corner handles; drag a handle to resize. Drag to move; double-click to edit label; Delete to remove."}
      </p>
    </div>
  );
}
