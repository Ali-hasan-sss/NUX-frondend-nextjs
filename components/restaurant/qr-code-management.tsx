"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
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
    <div className="border rounded-lg p-4 w-[320px] bg-white text-black">
      <div className="text-center space-y-1 mb-3">
        <div className="text-lg font-bold">{title}</div>
        {subtitle ? (
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        ) : null}
      </div>
      <div className="flex justify-center items-center">{children}</div>
    </div>
  );
}

export function QRCodeManagement() {
  const dispatch = useAppDispatch();
  const { data, isLoading } = useAppSelector((s) => s.restaurantAccount);
  const printRef = useRef<HTMLDivElement>(null);
  const drinkRef = useRef<HTMLDivElement>(null);
  const mealRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);
  const autoRefreshEnabledRef = useRef<boolean>(false);

  useEffect(() => {
    dispatch(fetchRestaurantAccount());
  }, [dispatch]);

  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const menuUrl = useMemo(() => {
    if (!data?.id) return "";
    // Public menu URL generated from restaurant id
    return `${appBaseUrl}/menu/${data.id}`;
  }, [appBaseUrl, data?.id]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const handleRegenerate = async () => {
    await dispatch(regenerateRestaurantQr());
  };

  const printElement = (el: HTMLElement) => {
    const win = window.open("", "_blank", "width=800,height=600");
    if (!win) return;
    win.document.write("<html><head><title>Print QR</title>");
    win.document.write(
      "<style>html,body{height:100%;} body{margin:0;padding:0;background:#fff;color:#000;display:flex;justify-content:center;align-items:center;} .frame{display:flex;justify-content:center;align-items:center;}</style>"
    );
    win.document.write("</head><body>");
    win.document.write(el.outerHTML);
    win.document.write("</body></html>");
    win.document.close();
    win.focus();
    win.print();
    win.close();
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
            QR Codes
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground truncate">
            Print and manage your restaurant QR codes
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground">
              Auto refresh
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
            Regenerate Drink & Meal
          </Button>
          <Button onClick={handlePrint} className="h-9 px-3 sm:h-10 sm:px-4">
            Print All
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4" ref={printRef}>
        <Card>
          <CardHeader>
            <CardTitle>Drink QR</CardTitle>
            <CardDescription>
              Scan to collect drink stars at {data?.name ?? "your restaurant"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div ref={drinkRef} className="frame">
                <PrintableFrame
                  title={data?.name ?? "Restaurant"}
                  subtitle="Drink QR"
                >
                  {data?.qrCode_drink ? (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                        data.qrCode_drink
                      )}`}
                      width={240}
                      height={240}
                      alt="Drink QR"
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No drink QR available
                    </div>
                  )}
                </PrintableFrame>
              </div>
            </div>
            <div className="mt-3 flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  drinkRef.current && printElement(drinkRef.current)
                }
              >
                Print
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Fullscreen</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[640px]">
                  <DialogHeader>
                    <DialogTitle>Drink QR</DialogTitle>
                  </DialogHeader>
                  <div className="flex justify-center">
                    {data?.qrCode_drink ? (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(
                          data.qrCode_drink
                        )}`}
                        width={512}
                        height={512}
                        alt="Drink QR"
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
            <CardTitle>Meal QR</CardTitle>
            <CardDescription>
              Scan to collect meal stars at {data?.name ?? "your restaurant"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div ref={mealRef} className="frame">
                <PrintableFrame
                  title={data?.name ?? "Restaurant"}
                  subtitle="Meal QR"
                >
                  {data?.qrCode_meal ? (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                        data.qrCode_meal
                      )}`}
                      width={240}
                      height={240}
                      alt="Meal QR"
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No meal QR available
                    </div>
                  )}
                </PrintableFrame>
              </div>
            </div>
            <div className="mt-3 flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => mealRef.current && printElement(mealRef.current)}
              >
                Print
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Fullscreen</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[640px]">
                  <DialogHeader>
                    <DialogTitle>Meal QR</DialogTitle>
                  </DialogHeader>
                  <div className="flex justify-center">
                    {data?.qrCode_meal ? (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(
                          data.qrCode_meal
                        )}`}
                        width={512}
                        height={512}
                        alt="Meal QR"
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
            <CardTitle>Menu QR</CardTitle>
            <CardDescription>Scan to open the restaurant menu</CardDescription>
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
                      alt="Menu QR"
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
                onClick={() => menuRef.current && printElement(menuRef.current)}
              >
                Print
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Fullscreen</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[640px]">
                  <DialogHeader>
                    <DialogTitle>Menu QR</DialogTitle>
                  </DialogHeader>
                  <div className="flex justify-center">
                    {menuUrl ? (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(
                          menuUrl
                        )}`}
                        width={512}
                        height={512}
                        alt="Menu QR"
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
    </div>
  );
}
