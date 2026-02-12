"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Plus, Pencil, Trash2, Loader2, Printer } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchRestaurantAccount,
  regenerateRestaurantQr,
} from "@/features/restaurant/restaurantAccount/restaurantAccountThunks";
// Render QR via external image endpoint to avoid extra deps
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  tablesService,
  Table,
} from "@/features/restaurant/tables/tablesService";
import { Badge } from "@/components/ui/badge";
import ConfirmDialog from "@/components/confirmMessage";
import { PlanPermissionErrorCard } from "@/components/restaurant/plan-permission-error-card";
import { toast } from "sonner";

/** Print-only CSS: 5cm×5cm QR + label (title/subtitle) below. Stickers stacked on same page, no blank pages. */
const LABEL_PRINT_STYLES = `
  .print-container {
    display: flex; flex-direction: column; align-items: center; gap: 6mm;
    padding: 0; margin: 0; background: #fff; color: #000;
  }
  .label-sticker {
    width: 5cm; min-height: 6cm; box-sizing: border-box;
    display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
    padding: 5mm; border: 1px solid #ccc; border-radius: 4mm;
    margin: 0; overflow: hidden;
    page-break-inside: avoid; break-inside: avoid;
  }
  .label-sticker .label-qr-box {
    width: 100%; height: 4cm; max-width: 4cm; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .label-sticker .label-qr-box img {
    width: 100%; height: 100%; object-fit: contain;
  }
  .label-sticker .label-caption {
    width: 100%; margin-top: 3mm; padding: 0; box-sizing: border-box;
    font-size: 9pt; line-height: 1.3; text-align: center; font-weight: bold;
    color: #000; min-height: 8mm;
  }
  .label-sticker .label-caption .title { font-size: 8pt; font-weight: bold; }
  .label-sticker .label-caption .subtitle { font-size: 7pt; font-weight: normal; margin-top: 0.5mm; }
  @media print {
    @page { size: auto; margin: 8mm; }
    body { margin: 0; padding: 0; background: #fff; color: #000; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .print-container { padding: 0; gap: 6mm; }
    .label-sticker { border: 1px solid #999; border-radius: 4mm; }
  }
`;

/** Build print window with only label stickers stacked vertically; wait for images then print. */
function printLabelStickers(
  stickers: { imgSrc: string; title: string; subtitle: string }[],
  styles: string
) {
  const stickersHtml = stickers
    .map(
      (s) => `
    <div class="label-sticker">
      <div class="label-qr-box">
        <img src="${s.imgSrc.replace(/"/g, "&quot;")}" width="200" height="200" alt="" />
      </div>
      <div class="label-caption">
        <div class="title">${escapeHtml(s.title)}</div>
        <div class="subtitle">${escapeHtml(s.subtitle)}</div>
      </div>
    </div>`
    )
    .join("");
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Print QR Labels</title><style>${styles}</style></head><body><div class="print-container">${stickersHtml}</div></body></html>`;
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  const doc = win.document;
  const imgs = doc.querySelectorAll(".print-container img");
  const waitAll = Array.from(imgs).map(
    (img) =>
      new Promise<void>((resolve) => {
        const el = img as HTMLImageElement;
        if (el.complete) resolve();
        else el.onload = () => resolve();
        el.onerror = () => resolve();
      })
  );
  Promise.all(waitAll).then(() => {
    win.focus();
    win.print();
    win.close();
  });
}
function escapeHtml(text: string) {
  const el = document.createElement("div");
  el.textContent = text;
  return el.innerHTML;
}

function PrintableFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="label-sticker border rounded-lg p-4 w-[320px] bg-white text-black">
      <div className="label-qr-box flex justify-center items-center min-h-[200px]">
        {children}
      </div>
      <div className="label-caption text-center space-y-0.5 mt-2">
        <div className="text-lg font-bold">{title}</div>
        {subtitle ? (
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        ) : null}
      </div>
    </div>
  );
}

export function QRCodeManagement() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { data, isLoading } = useAppSelector((s) => s.restaurantAccount);
  const printRef = useRef<HTMLDivElement>(null);
  const drinkRef = useRef<HTMLDivElement>(null);
  const mealRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);
  const autoRefreshEnabledRef = useRef<boolean>(false);
  const [drinkImgLoaded, setDrinkImgLoaded] = useState(false);
  const [mealImgLoaded, setMealImgLoaded] = useState(false);
  const [menuImgLoaded, setMenuImgLoaded] = useState(false);

  useEffect(() => {
    dispatch(fetchRestaurantAccount());
  }, [dispatch]);

  useEffect(() => {
    setDrinkImgLoaded(false);
    setMealImgLoaded(false);
    setMenuImgLoaded(false);
  }, [data?.qrCode_drink, data?.qrCode_meal, data?.id]);

  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const menuUrl = useMemo(() => {
    if (!data?.id) return "";
    // Public menu URL generated from restaurant id
    return `${appBaseUrl}/menu/${data.id}`;
  }, [appBaseUrl, data?.id]);

  const handlePrint = () => {
    const stickers: { imgSrc: string; title: string; subtitle: string }[] = [];
    const name = data?.name ?? "Restaurant";
    if (data?.qrCode_drink) {
      stickers.push({
        imgSrc: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data.qrCode_drink)}`,
        title: name,
        subtitle: t("dashboard.qrCodes.drinkQR"),
      });
    }
    if (data?.qrCode_meal) {
      stickers.push({
        imgSrc: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data.qrCode_meal)}`,
        title: name,
        subtitle: t("dashboard.qrCodes.mealQR"),
      });
    }
    if (menuUrl) {
      stickers.push({
        imgSrc: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}`,
        title: name,
        subtitle: t("dashboard.qrCodes.menuQR"),
      });
    }
    if (stickers.length === 0) return;
    printLabelStickers(stickers, LABEL_PRINT_STYLES);
  };

  const needDrink = !!data?.qrCode_drink;
  const needMeal = !!data?.qrCode_meal;
  const needMenu = !!menuUrl;
  const mainPrintReady =
    (!needDrink || drinkImgLoaded) &&
    (!needMeal || mealImgLoaded) &&
    (!needMenu || menuImgLoaded);

  const handleRegenerate = async () => {
    await dispatch(regenerateRestaurantQr());
  };

  const handlePrintSingle = (type: "drink" | "meal" | "menu") => {
    const name = data?.name ?? "Restaurant";
    let imgSrc = "";
    let subtitle = "";
    if (type === "drink" && data?.qrCode_drink) {
      imgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data.qrCode_drink)}`;
      subtitle = t("dashboard.qrCodes.drinkQR");
    } else if (type === "meal" && data?.qrCode_meal) {
      imgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data.qrCode_meal)}`;
      subtitle = t("dashboard.qrCodes.mealQR");
    } else if (type === "menu" && menuUrl) {
      imgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}`;
      subtitle = t("dashboard.qrCodes.menuQR");
    }
    if (!imgSrc) return;
    printLabelStickers([{ imgSrc, title: name, subtitle }], LABEL_PRINT_STYLES);
  };

  // Auto-refresh QR (drink/meal) every 5 minutes when enabled
  const setAutoRefresh = (enabled: boolean) => {
    autoRefreshEnabledRef.current = enabled;
    if (autoRefreshRef.current) {
      clearInterval(autoRefreshRef.current);
      autoRefreshRef.current = null;
    }
    if (enabled) {
      autoRefreshRef.current = setInterval(() => {
        if (autoRefreshEnabledRef.current) {
          dispatch(regenerateRestaurantQr());
        }
      }, 5 * 60 * 1000);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
            {t("dashboard.qrCodes.title")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground truncate">
            {t("dashboard.qrCodes.description")}
          </p>
        </div>
      </div>

      <Tabs defaultValue="main" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="main">
            {t("dashboard.qrCodes.mainCodes") || "Main QR Codes"}
          </TabsTrigger>
          <TabsTrigger value="tables">
            {t("dashboard.qrCodes.tableCodes") || "Table QR Codes"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="main" className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-end">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground">
                {t("dashboard.qrCodes.autoRefresh")}
              </span>
              <Switch
                onCheckedChange={(checked) => setAutoRefresh(!!checked)}
                aria-label="Auto refresh QR every 5 minutes"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={isLoading}
              className="h-9 px-3 sm:h-10 sm:px-4"
            >
              {t("dashboard.qrCodes.regenerateDrinkMeal")}
            </Button>
            <Button
              onClick={handlePrint}
              className="h-9 px-3 sm:h-10 sm:px-4"
              disabled={!mainPrintReady}
              title={!mainPrintReady ? t("dashboard.qrCodes.waitForQrLoad") || "Waiting for QR images to load" : undefined}
            >
              {t("dashboard.qrCodes.printAll")}
            </Button>
          </div>

          <div className="flex flex-col gap-4" ref={printRef}>
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.qrCodes.drinkQR")}</CardTitle>
                <CardDescription>
                  {t("dashboard.qrCodes.scanToCollectDrink")}{" "}
                  {data?.name ?? t("dashboard.qrCodes.drinkQR")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div ref={drinkRef} className="frame">
                    <PrintableFrame
                      title={data?.name ?? "Restaurant"}
                      subtitle={t("dashboard.qrCodes.drinkQR")}
                    >
                      {data?.qrCode_drink ? (
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                            data.qrCode_drink
                          )}`}
                          width={240}
                          height={240}
                          alt={t("dashboard.qrCodes.drinkQR")}
                          onLoad={() => setDrinkImgLoaded(true)}
                        />
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          {t("dashboard.qrCodes.noDrinkQRAvailable")}
                        </div>
                      )}
                    </PrintableFrame>
                  </div>
                </div>
                <div className="mt-3 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePrintSingle("drink")}
                    disabled={!data?.qrCode_drink}
                    title={!data?.qrCode_drink ? t("dashboard.qrCodes.waitForQrLoad") || "Waiting for QR" : undefined}
                  >
                    {t("dashboard.qrCodes.print")}
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>{t("dashboard.qrCodes.fullscreen")}</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[640px]">
                      <DialogHeader>
                        <DialogTitle>
                          {t("dashboard.qrCodes.drinkQR")}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="flex justify-center">
                        {data?.qrCode_drink ? (
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(
                              data.qrCode_drink
                            )}`}
                            width={512}
                            height={512}
                            alt={t("dashboard.qrCodes.drinkQR")}
                          />
                        ) : null}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.qrCodes.mealQR")}</CardTitle>
                <CardDescription>
                  {t("dashboard.qrCodes.scanToCollectMeal")}{" "}
                  {data?.name ?? t("dashboard.qrCodes.mealQR")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div ref={mealRef} className="frame">
                    <PrintableFrame
                      title={data?.name ?? "Restaurant"}
                      subtitle={t("dashboard.qrCodes.mealQR")}
                    >
                      {data?.qrCode_meal ? (
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                            data.qrCode_meal
                          )}`}
                          width={240}
                          height={240}
                          alt={t("dashboard.qrCodes.mealQR")}
                          onLoad={() => setMealImgLoaded(true)}
                        />
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          {t("dashboard.qrCodes.noMealQRAvailable")}
                        </div>
                      )}
                    </PrintableFrame>
                  </div>
                </div>
                <div className="mt-3 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePrintSingle("meal")}
                    disabled={!data?.qrCode_meal}
                    title={!data?.qrCode_meal ? t("dashboard.qrCodes.waitForQrLoad") || "Waiting for QR" : undefined}
                  >
                    {t("dashboard.qrCodes.print")}
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>{t("dashboard.qrCodes.fullscreen")}</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[640px]">
                      <DialogHeader>
                        <DialogTitle>
                          {t("dashboard.qrCodes.mealQR")}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="flex justify-center">
                        {data?.qrCode_meal ? (
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(
                              data.qrCode_meal
                            )}`}
                            width={512}
                            height={512}
                            alt={t("dashboard.qrCodes.mealQR")}
                          />
                        ) : null}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.qrCodes.menuQR")}</CardTitle>
                <CardDescription>
                  {t("dashboard.qrCodes.scanToViewMenu")} {data?.name ?? ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div ref={menuRef} className="frame">
                    <PrintableFrame
                      title={data?.name ?? "Restaurant"}
                      subtitle="Menu QR"
                    >
                      {menuUrl ? (
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                            menuUrl
                          )}`}
                          width={240}
                          height={240}
                          alt={t("dashboard.qrCodes.menuQR")}
                          onLoad={() => setMenuImgLoaded(true)}
                        />
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Menu URL not available
                        </div>
                      )}
                    </PrintableFrame>
                  </div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground break-all text-center">
                  {menuUrl}
                </div>
                <div className="mt-3 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePrintSingle("menu")}
                    disabled={!menuUrl}
                    title={!menuUrl ? t("dashboard.qrCodes.waitForQrLoad") || "Waiting for QR" : undefined}
                  >
                    {t("dashboard.qrCodes.print")}
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>{t("dashboard.qrCodes.fullscreen")}</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[640px]">
                      <DialogHeader>
                        <DialogTitle>
                          {t("dashboard.qrCodes.menuQR")}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="flex justify-center">
                        {menuUrl ? (
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(
                              menuUrl
                            )}`}
                            width={512}
                            height={512}
                            alt={t("dashboard.qrCodes.menuQR")}
                          />
                        ) : null}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <QrCode className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Total Codes</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tables">
          <TablesManagement restaurantId={data?.id || ""} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Table Card Component
function TableCard({
  table,
  onEdit,
  onDelete,
  onSessionToggle,
  onPrintTable,
  printElement,
  t,
}: {
  table: Table;
  onEdit: (table: Table) => void;
  onDelete: (table: Table) => void;
  onSessionToggle: (table: Table, isSessionOpen: boolean) => void;
  onPrintTable: (table: Table) => void;
  printElement?: (el: HTMLElement) => void;
  t: any;
}) {
  const handlePrint = () => {
    if (onPrintTable) onPrintTable(table);
    else if (printElement && tableRef.current) printElement(tableRef.current);
  };
  const tableRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  useEffect(() => setImageLoaded(false), [table.id]);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {table.name}
              {!table.isActive && (
                <Badge variant="secondary" className="text-xs">
                  {t("dashboard.tables.inactive") || "Inactive"}
                </Badge>
              )}
              <Badge
                variant={table.isSessionOpen ? "default" : "secondary"}
                className="text-xs"
              >
                {table.isSessionOpen
                  ? t("dashboard.tables.sessionOpen") || "Session open"
                  : t("dashboard.tables.sessionClosed") || "Session closed"}
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              {t("dashboard.tables.tableNumber") || "Table"} #{table.number}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(table)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(table)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center gap-2 mb-4">
          <Button
            variant={table.isSessionOpen ? "outline" : "default"}
            size="sm"
            onClick={() => onSessionToggle(table, !table.isSessionOpen)}
          >
            {table.isSessionOpen
              ? t("dashboard.tables.closeSession") || "Close session"
              : t("dashboard.tables.openSession") || "Open session"}
          </Button>
        </div>
        <div className="flex justify-center mb-4">
          <div ref={tableRef} className="frame">
            <PrintableFrame
              title={table.name}
              subtitle={`${t("dashboard.tables.tableNumber") || "Table"} #${
                table.number
              }`}
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  table.qrCode
                )}`}
                width={200}
                height={200}
                alt={table.name}
                onLoad={() => setImageLoaded(true)}
              />
            </PrintableFrame>
          </div>
        </div>
        <div className="text-xs text-muted-foreground break-all text-center mb-2">
          {table.qrCode}
        </div>
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            disabled={!imageLoaded}
            title={!imageLoaded ? t("dashboard.qrCodes.waitForQrLoad") || "Waiting for QR to load" : undefined}
          >
            {t("dashboard.qrCodes.print") || "Print"}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                {t("dashboard.qrCodes.fullscreen") || "Fullscreen"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[640px]">
              <DialogHeader>
                <DialogTitle>{table.name}</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(
                    table.qrCode
                  )}`}
                  width={512}
                  height={512}
                  alt={table.name}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

const PLAN_PERMISSION_CODES = [
  "PLAN_PERMISSION_REQUIRED",
  "NO_ACTIVE_SUBSCRIPTION",
];

// Tables Management Component
function TablesManagement({ restaurantId }: { restaurantId: string }) {
  const { t, i18n } = useTranslation();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [tablesError, setTablesError] = useState<string | null>(null);
  const [tablesErrorCode, setTablesErrorCode] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [tableCount, setTableCount] = useState(1);
  const [tableName, setTableName] = useState("Table");
  const [editTableName, setEditTableName] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editIsSessionOpen, setEditIsSessionOpen] = useState(false);

  useEffect(() => {
    if (restaurantId) {
      loadTables();
    }
  }, [restaurantId]);

  const loadTables = async () => {
    setLoading(true);
    setTablesError(null);
    setTablesErrorCode(null);
    try {
      const response = await tablesService.getTables();
      setTables(response.data);
    } catch (error: any) {
      console.error("Error loading tables:", error);
      const data = error?.response?.data;
      const message =
        data?.message || error?.message || "Failed to load tables";
      const code = data?.code;
      setTablesError(message);
      setTablesErrorCode(code ?? null);
      if (!code || !PLAN_PERMISSION_CODES.includes(code)) {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTables = async () => {
    if (!tableCount || tableCount < 1 || tableCount > 1000) {
      toast.error(
        t("dashboard.tables.invalidCount") || "Count must be between 1 and 1000"
      );
      return;
    }

    try {
      await tablesService.createTables({
        count: tableCount,
        name: tableName || undefined,
      });
      await loadTables();
      setIsCreateDialogOpen(false);
      setTableCount(1);
      setTableName("Table");
      toast.success(
        t("dashboard.tables.tablesCreated") || "Tables created successfully!"
      );
    } catch (error: any) {
      console.error("Error creating tables:", error);
      const data = error?.response?.data;
      const code = data?.code;
      const message =
        data?.message || error?.message || "Failed to create tables";
      if (code && PLAN_PERMISSION_CODES.includes(code)) {
        setTablesError(message);
        setTablesErrorCode(code);
      } else {
        toast.error(message);
      }
    }
  };

  const handleEditTable = async () => {
    if (!selectedTable) return;

    try {
      await tablesService.updateTable(selectedTable.id, {
        name: editTableName,
        isActive: editIsActive,
        isSessionOpen: editIsSessionOpen,
      });
      await loadTables();
      setIsEditDialogOpen(false);
      setSelectedTable(null);
      toast.success(
        t("dashboard.tables.tableUpdated") || "Table updated successfully!"
      );
    } catch (error: any) {
      console.error("Error updating table:", error);
      const data = error?.response?.data;
      const message =
        data?.message || error?.message || "Failed to update table";
      if (data?.code && PLAN_PERMISSION_CODES.includes(data.code)) {
        setTablesError(message);
        setTablesErrorCode(data.code);
      } else {
        toast.error(message);
      }
    }
  };

  const handleDeleteTable = async () => {
    if (!selectedTable) return;

    try {
      await tablesService.deleteTable(selectedTable.id);
      await loadTables();
      setIsDeleteDialogOpen(false);
      setSelectedTable(null);
      toast.success(
        t("dashboard.tables.tableDeleted") || "Table deleted successfully!"
      );
    } catch (error: any) {
      console.error("Error deleting table:", error);
      const data = error?.response?.data;
      const message =
        data?.message || error?.message || "Failed to delete table";
      if (data?.code && PLAN_PERMISSION_CODES.includes(data.code)) {
        setTablesError(message);
        setTablesErrorCode(data.code);
      } else {
        toast.error(message);
      }
    }
  };

  const openEditDialog = (table: Table) => {
    setSelectedTable(table);
    setEditTableName(table.name);
    setEditIsActive(table.isActive);
    setEditIsSessionOpen(table.isSessionOpen);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (table: Table) => {
    setSelectedTable(table);
    setIsDeleteDialogOpen(true);
  };

  const handleSessionToggle = async (table: Table, isSessionOpen: boolean) => {
    try {
      await tablesService.updateTable(table.id, { isSessionOpen });
      await loadTables();
      const msg = isSessionOpen
        ? t("dashboard.tables.sessionOpened") ||
          "Session opened for this table."
        : t("dashboard.tables.sessionClosedMsg") ||
          "Session closed for this table.";
      toast.success(msg);
    } catch (error: any) {
      console.error("Error updating table session:", error);
      const data = error?.response?.data;
      const message =
        data?.message || error?.message || "Failed to update session";
      if (data?.code && PLAN_PERMISSION_CODES.includes(data.code)) {
        setTablesError(message);
        setTablesErrorCode(data.code);
      } else {
        toast.error(message);
      }
    }
  };

  const handlePrintSingleTable = (table: Table) => {
    const tableLabel = t("dashboard.tables.tableNumber") || "Table";
    printLabelStickers(
      [
        {
          imgSrc: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(table.qrCode)}`,
          title: table.name,
          subtitle: `${tableLabel} #${table.number}`,
        },
      ],
      LABEL_PRINT_STYLES
    );
  };

  const handlePrintAllTables = () => {
    if (tables.length === 0) return;
    const tableLabel = t("dashboard.tables.tableNumber") || "Table";
    const stickers = tables.map((table) => ({
      imgSrc: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(table.qrCode)}`,
      title: table.name,
      subtitle: `${tableLabel} #${table.number}`,
    }));
    printLabelStickers(stickers, LABEL_PRINT_STYLES);
  };

  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  if (loading && tables.length === 0 && !tablesError) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (tablesError) {
    return (
      <PlanPermissionErrorCard
        error={tablesError}
        errorCode={tablesErrorCode}
        upgradePlanHintKey="dashboard.tables.upgradePlanHint"
        upgradePlanHintFallback="Your current plan does not include Table QR codes. Subscribe or upgrade your plan to create and manage table codes."
        goToSubscriptionKey="dashboard.tables.goToSubscription"
        goToSubscriptionFallback="Go to Subscription"
      />
    );
  }

  return (
    <div className="space-y-6" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {t("dashboard.tables.title") || "Table Management"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.tables.description") ||
              "Create and manage table QR codes"}
          </p>
        </div>
        <div className="flex gap-2">
          {tables.length > 0 && (
            <Button
              variant="outline"
              onClick={handlePrintAllTables}
              disabled={tables.length === 0}
              title={
                tables.length === 0
                  ? t("dashboard.qrCodes.waitForQrLoad") || "Waiting for QR images to load"
                  : undefined
              }
            >
              <Printer className="h-4 w-4 mr-2" />
              {t("dashboard.tables.printAll")}
            </Button>
          )}
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("dashboard.tables.createTables") || "Create Tables"}
          </Button>
        </div>
      </div>

      {tables.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {t("dashboard.tables.noTables") || "No tables found"}
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("dashboard.tables.createFirstTable") ||
                  "Create Your First Table"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
              onSessionToggle={handleSessionToggle}
              onPrintTable={handlePrintSingleTable}
              printElement={(_el: HTMLElement) => handlePrintSingleTable(table)}
              t={t}
            />
          ))}
        </div>
      )}

      {/* Create Tables Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("dashboard.tables.createTables") || "Create Tables"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="count">
                {t("dashboard.tables.numberOfTables") || "Number of Tables"}
              </Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="1000"
                value={tableCount}
                onChange={(e) => setTableCount(parseInt(e.target.value) || 1)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="name">
                {t("dashboard.tables.tableNamePrefix") ||
                  "Table Name Prefix (Optional)"}
              </Label>
              <Input
                id="name"
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="Table"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                {t("common.cancel") || "Cancel"}
              </Button>
              <Button onClick={handleCreateTables}>
                {t("dashboard.tables.create") || "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Table Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("dashboard.tables.editTable") || "Edit Table"}
            </DialogTitle>
          </DialogHeader>
          {selectedTable && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editName">
                  {t("dashboard.tables.tableName") || "Table Name"}
                </Label>
                <Input
                  id="editName"
                  type="text"
                  value={editTableName}
                  onChange={(e) => setEditTableName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="editActive"
                  checked={editIsActive}
                  onCheckedChange={setEditIsActive}
                />
                <Label htmlFor="editActive">
                  {t("dashboard.tables.isActive") || "Active"}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  dir={i18n.language === "ar" ? "rtl" : "ltr"}
                  id="editSessionOpen"
                  checked={editIsSessionOpen}
                  onCheckedChange={setEditIsSessionOpen}
                />
                <Label htmlFor="editSessionOpen">
                  {t("dashboard.tables.sessionOpen") || "Session open"}
                </Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  {t("common.cancel") || "Cancel"}
                </Button>
                <Button onClick={handleEditTable}>
                  {t("common.save") || "Save"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        setOpen={setIsDeleteDialogOpen}
        title={t("dashboard.tables.deleteTable") || "Delete Table"}
        message={
          t("dashboard.tables.deleteTableConfirm") ||
          `Are you sure you want to delete ${selectedTable?.name}? This action cannot be undone.`
        }
        onConfirm={handleDeleteTable}
      />
    </div>
  );
}
