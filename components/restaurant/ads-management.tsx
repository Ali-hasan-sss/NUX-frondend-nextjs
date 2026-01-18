"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useTranslation } from "react-i18next";
import {
  createAdThunk,
  deleteAdThunk,
  fetchMyAds,
  updateAdThunk,
} from "@/features/restaurant/ads/adsThunks";
import type { RestaurantAd } from "@/features/restaurant/ads/adsTypes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, Plus, Pencil, Trash2, Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConfirmDialog from "@/components/confirmMessage";
import FileUploader from "@/components/upload/file-uploader";
import { useAppSelector as useSelector } from "@/app/hooks";

type FormState = {
  title: string;
  description: string;
  image: string;
  category: string;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  image: "",
  category: "",
};

export default function AdsManagement() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { items, isLoading } = useAppSelector((s) => s.restaurantAds);
  const restaurant = useSelector((s) => s.restaurantAccount.data);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState<RestaurantAd | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [openView, setOpenView] = useState<RestaurantAd | null>(null);

  useEffect(() => {
    dispatch(fetchMyAds());
  }, [dispatch]);

  useEffect(() => {
    if (openEdit) {
      setForm({
        title: openEdit.title,
        description: openEdit.description ?? "",
        image: openEdit.image,
        category: openEdit.category ?? "",
      });
    } else if (!openCreate) {
      setForm(emptyForm);
    }
  }, [openEdit, openCreate]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.image.trim()) return;
    await dispatch(
      createAdThunk({
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        image: form.image.trim(),
        category: form.category?.trim() || undefined,
      })
    )
      .unwrap()
      .then(() => setOpenCreate(false));
  };

  const handleUpdate = async () => {
    if (!openEdit) return;
    if (!form.title.trim() || !form.image.trim()) return;
    await dispatch(
      updateAdThunk({
        id: openEdit.id,
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        image: form.image.trim(),
        category: form.category?.trim() || undefined,
      })
    )
      .unwrap()
      .then(() => setOpenEdit(null));
  };

  const handleDelete = async (id: number) => {
    await dispatch(deleteAdThunk(id)).unwrap();
  };

  const restaurantId = restaurant?.id ?? "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-3 py-2">
        <div>
          <h2 className="text-2xl font-semibold">{t("dashboard.ads.title")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.ads.description")}
          </p>
        </div>
        <Button onClick={() => setOpenCreate(true)} className="px-4 py-2">
          <Plus className="h-4 w-4 mr-2" /> {t("dashboard.ads.newAd")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2 md:p-3">
        {items.map((ad) => (
          <Card key={ad.id} className="overflow-hidden flex flex-col h-[460px]">
            <div className="w-full h-56 md:h-64 lg:h-72 overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ad.image}
                alt={ad.title}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span className="truncate pr-2">{ad.title}</span>
                <Badge variant="outline">{ad.category || t("dashboard.ads.general")}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 flex-1">
              {ad.description && (
                <>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {ad.description}
                  </p>
                  {ad.description.length > 140 && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto"
                      onClick={() => setOpenView(ad)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" /> Read more
                    </Button>
                  )}
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2 mt-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpenEdit(ad)}
              >
                <Pencil className="h-4 w-4 mr-1" /> {t("dashboard.ads.edit")}
              </Button>
              <ConfirmDialog
                open={confirmDeleteId === ad.id}
                setOpen={(v) => setConfirmDeleteId(v ? ad.id : null)}
                title={t("dashboard.ads.deleteAd")}
                message={t("dashboard.ads.deleteAdConfirm")}
                confirmText={t("dashboard.ads.delete")}
                cancelText={t("dashboard.ads.cancel")}
                onConfirm={() => handleDelete(ad.id)}
                trigger={
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                }
              />
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("dashboard.ads.createAd")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>{t("dashboard.ads.titleLabel")}</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder={t("dashboard.ads.titlePlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label>Image</Label>
              <FileUploader
                value={form.image || null}
                onChange={(url) => setForm((f) => ({ ...f, image: url || "" }))}
                onUploadingChange={setUploading}
                meta={{ restaurantId, entityType: "ad" }}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("dashboard.ads.descriptionLabel")}</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>{t("dashboard.ads.categoryLabel")}</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("dashboard.ads.selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Desserts">{t("dashboard.ads.desserts")}</SelectItem>
                  <SelectItem value="Fast Food">{t("dashboard.ads.fastFood")}</SelectItem>
                  <SelectItem value="Drinks">{t("dashboard.ads.drinks")}</SelectItem>
                  <SelectItem value="Other">{t("dashboard.ads.other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenCreate(false)}>
              {t("dashboard.ads.cancel")}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                isLoading ||
                uploading ||
                !form.title.trim() ||
                !form.image.trim()
              }
            >
              {t("dashboard.ads.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!openEdit}
        onOpenChange={(v) => setOpenEdit(v ? openEdit : null)}
      >
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("dashboard.ads.editAd")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>{t("dashboard.ads.titleLabel")}</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t("dashboard.ads.imageLabel")}</Label>
              <FileUploader
                value={form.image || null}
                onChange={(url) => setForm((f) => ({ ...f, image: url || "" }))}
                onUploadingChange={setUploading}
                meta={{
                  restaurantId,
                  entityType: "ad",
                  entityId: String(openEdit?.id ?? ""),
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("dashboard.ads.descriptionLabel")}</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t("dashboard.ads.categoryLabel")}</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("dashboard.ads.selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Desserts">{t("dashboard.ads.desserts")}</SelectItem>
                  <SelectItem value="Fast Food">{t("dashboard.ads.fastFood")}</SelectItem>
                  <SelectItem value="Drinks">{t("dashboard.ads.drinks")}</SelectItem>
                  <SelectItem value="Other">{t("dashboard.ads.other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenEdit(null)}>
              {t("dashboard.ads.cancel")}
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={
                isLoading ||
                uploading ||
                !form.title.trim() ||
                !form.image.trim()
              }
            >
              {t("dashboard.ads.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog
        open={!!openView}
        onOpenChange={(v) => setOpenView(v ? openView : null)}
      >
        <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{openView?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {openView?.image ? (
              <div className="w-full h-56 rounded-md overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={openView.image}
                  alt={openView.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}
            {openView?.category ? (
              <Badge variant="outline" className="w-fit">
                {openView.category}
              </Badge>
            ) : null}
            {openView?.description ? (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {openView.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">{t("dashboard.ads.noDescription")}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
