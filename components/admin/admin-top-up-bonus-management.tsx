"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, PlusCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/use-language";
import { formatDate } from "@/lib/utils";
import {
  adminWalletService,
  type AdminWalletTopUpBonusCampaign,
} from "@/features/admin/wallet/adminWalletService";

function decStr(v: string | number): string {
  if (typeof v === "number") return String(v);
  return v;
}

export function AdminTopUpBonusManagement() {
  const { t } = useLanguage();
  const [items, setItems] = useState<AdminWalletTopUpBonusCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [minTopUp, setMinTopUp] = useState("20");
  const [bonusType, setBonusType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [bonusValue, setBonusValue] = useState("10");
  const [notifyUsers, setNotifyUsers] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await adminWalletService.listTopUpBonusCampaigns();
      setItems(list);
    } catch {
      toast.error(t("adminWalletError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartsAt("");
    setEndsAt("");
    setMinTopUp("20");
    setBonusType("PERCENTAGE");
    setBonusValue("10");
    setNotifyUsers(true);
  };

  const onCreate = async () => {
    const min = parseFloat(minTopUp.replace(",", "."));
    const val = parseFloat(bonusValue.replace(",", "."));
    if (!title.trim()) {
      toast.error(t("adminTopUpBonusTitleLabel"));
      return;
    }
    if (!startsAt || !endsAt) {
      toast.error(t("adminTopUpBonusStartsAt"));
      return;
    }
    if (!Number.isFinite(min) || min <= 0 || !Number.isFinite(val) || val <= 0) {
      toast.error(t("amount"));
      return;
    }

    setSubmitting(true);
    try {
      await adminWalletService.createTopUpBonusCampaign({
        title: title.trim(),
        ...(description.trim() ? { description: description.trim() } : {}),
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        minTopUpAmount: min,
        bonusType,
        bonusValue: val,
        sendNotification: notifyUsers,
      });
      toast.success(t("adminTopUpBonusCreated"));
      setDialogOpen(false);
      resetForm();
      await load();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t("adminWalletError");
      toast.error(typeof msg === "string" ? msg : String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const onToggleActive = async (row: AdminWalletTopUpBonusCampaign) => {
    setTogglingId(row.id);
    try {
      await adminWalletService.patchTopUpBonusCampaign(row.id, !row.isActive);
      await load();
    } catch {
      toast.error(t("adminWalletError"));
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-5xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("adminTopUpBonusTitle")}</h1>
          <p className="text-muted-foreground text-sm">{t("adminTopUpBonusDescription")}</p>
        </div>
        <Button
          type="button"
          className="gap-2"
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          <PlusCircle className="h-4 w-4" />
          {t("adminTopUpBonusCreate")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("adminTopUpBonusListTitle")}</CardTitle>
          <CardDescription>{t("adminWalletDescriptionShort")}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("adminTopUpBonusLoading")}
            </div>
          ) : items.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center">{t("adminTopUpBonusNoCampaigns")}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("adminTopUpBonusTitleLabel")}</TableHead>
                    <TableHead>{t("adminTopUpBonusStartsAt")}</TableHead>
                    <TableHead>{t("adminTopUpBonusMinTopUp")}</TableHead>
                    <TableHead>{t("adminTopUpBonusType")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead className="w-[120px]">{t("adminWalletActions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium max-w-[200px]">{row.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(row.startsAt)} → {formatDate(row.endsAt)}
                      </TableCell>
                      <TableCell>{decStr(row.minTopUpAmount)} EUR</TableCell>
                      <TableCell>
                        {row.bonusType === "PERCENTAGE"
                          ? `${decStr(row.bonusValue)}%`
                          : `${decStr(row.bonusValue)} EUR`}
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.isActive ? "default" : "secondary"}>
                          {row.isActive ? t("adminTopUpBonusActive") : t("adminTopUpBonusInactive")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={togglingId === row.id}
                          onClick={() => void onToggleActive(row)}
                        >
                          {togglingId === row.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : row.isActive ? (
                            t("adminTopUpBonusDeactivate")
                          ) : (
                            t("adminTopUpBonusActivate")
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("adminTopUpBonusCreate")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="bonus-title">{t("adminTopUpBonusTitleLabel")}</Label>
              <Input
                id="bonus-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bonus-desc">{t("adminTopUpBonusDescriptionLabel")}</Label>
              <Textarea
                id="bonus-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="bonus-start">{t("adminTopUpBonusStartsAt")}</Label>
                <Input
                  id="bonus-start"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bonus-end">{t("adminTopUpBonusEndsAt")}</Label>
                <Input
                  id="bonus-end"
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bonus-min">{t("adminTopUpBonusMinTopUp")}</Label>
              <Input
                id="bonus-min"
                inputMode="decimal"
                value={minTopUp}
                onChange={(e) => setMinTopUp(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("adminTopUpBonusType")}</Label>
              <Select
                value={bonusType}
                onValueChange={(v) => setBonusType(v as "PERCENTAGE" | "FIXED")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">{t("adminTopUpBonusTypePercent")}</SelectItem>
                  <SelectItem value="FIXED">{t("adminTopUpBonusTypeFixed")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bonus-val">{t("adminTopUpBonusValue")}</Label>
              <Input
                id="bonus-val"
                inputMode="decimal"
                value={bonusValue}
                onChange={(e) => setBonusValue(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {bonusType === "PERCENTAGE"
                  ? t("adminTopUpBonusValueHintPercent")
                  : t("adminTopUpBonusValueHintFixed")}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bonus-notify"
                checked={notifyUsers}
                onCheckedChange={(c) => setNotifyUsers(c === true)}
              />
              <Label htmlFor="bonus-notify" className="text-sm font-normal cursor-pointer">
                {t("adminTopUpBonusNotifyUsers")}
              </Label>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="button" onClick={() => void onCreate()} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("adminTopUpBonusSubmit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
