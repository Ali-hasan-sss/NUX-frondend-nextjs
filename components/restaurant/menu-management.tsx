"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchMenuCategories,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
  fetchItemsByCategory,
  createMenuItemThunk,
  updateMenuItemThunk,
  deleteMenuItemThunk,
  fetchKitchenSections,
  applyDiscountToAllMenuThunk,
  applyDiscountToCategoryThunk,
} from "@/features/restaurant/menu/menuThunks";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ConfirmDialog from "@/components/confirmMessage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  PlusCircle,
  Edit,
  X,
  Database,
  Loader2,
  Percent,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import FileUploader from "@/components/upload/file-uploader";
import { AllergenSelect } from "@/components/restaurant/allergen-select";
import { getTranslatedAllergen } from "@/data/allergens";
import { seedService } from "@/features/restaurant/menu/seedService";
import { PlanPermissionErrorCard } from "@/components/restaurant/plan-permission-error-card";
import { toast } from "sonner";
import { getImageUrl } from "@/lib/utils";

export function MenuManagement() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { categories, itemsByCategory, isLoading, error, errorCode } =
    useAppSelector((s) => s.restaurantMenu);

  const [newCat, setNewCat] = useState({
    title: "",
    description: "",
    image: "",
  });
  const [editCat, setEditCat] = useState<{
    id: number | null;
    title: string;
    description: string;
    image: string;
  }>({ id: null, title: "", description: "", image: "" });

  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [newItem, setNewItem] = useState<{
    title: string;
    description: string;
    price: string;
    image: string;
    preparationTime: string;
    extras: Array<{ name: string; price: string; calories: string }>;
    discountType: "PERCENTAGE" | "AMOUNT" | "";
    discountValue: string;
    allergies: string[];
    calories: string;
    kitchenSectionId: string;
  }>({
    title: "",
    description: "",
    price: "",
    image: "",
    preparationTime: "",
    extras: [],
    discountType: "",
    discountValue: "",
    allergies: [],
    calories: "",
    kitchenSectionId: "",
  });

  // Dialog states
  const [openAddCategory, setOpenAddCategory] = useState(false);
  const [openEditCategory, setOpenEditCategory] = useState(false);
  const [openAddItem, setOpenAddItem] = useState<null | number>(null); // holds categoryId
  const [openEditItem, setOpenEditItem] = useState<null | {
    id: number;
    categoryId: number;
    title: string;
    description: string;
    price: string;
    image: string;
    preparationTime?: number | null;
    extras?: any;
    discountType?: "PERCENTAGE" | "AMOUNT" | null;
    discountValue?: number | null;
    allergies?: string[];
    calories?: number | null;
    kitchenSectionId?: number | null;
  }>(null);

  // Confirm delete
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Loading states for category/item add, edit, delete
  const [categoryCreateLoading, setCategoryCreateLoading] = useState(false);
  const [categoryUpdateLoading, setCategoryUpdateLoading] = useState(false);
  const [categoryDeleteLoading, setCategoryDeleteLoading] = useState(false);
  const [itemCreateLoading, setItemCreateLoading] = useState(false);
  const [itemUpdateLoading, setItemUpdateLoading] = useState(false);
  const [itemDeleteLoading, setItemDeleteLoading] = useState(false);

  // Seed data state + confirm modal
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedConfirmOpen, setSeedConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<null | {
    type: "category" | "item";
    categoryId?: number;
    itemId?: number;
    title?: string;
  }>(null);
  const restaurantId = useAppSelector((s) => s.restaurantAccount.data?.id);
  const [uploading, setUploading] = useState(false);
  const [kitchenSections, setKitchenSections] = useState<any[]>([]);

  // Discount dialog: 'all' = whole menu, number = categoryId
  const [openDiscountDialog, setOpenDiscountDialog] = useState(false);
  const [discountTarget, setDiscountTarget] = useState<"all" | number | null>(
    null
  );
  const [discountForm, setDiscountForm] = useState({
    discountType: "PERCENTAGE" as "PERCENTAGE" | "AMOUNT",
    discountValue: "",
  });
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  useEffect(() => {
    dispatch(fetchMenuCategories());
    // Fetch kitchen sections
    dispatch(fetchKitchenSections())
      .unwrap()
      .then((sections) => {
        setKitchenSections(sections);
      })
      .catch((err) => {
        console.error("Failed to load kitchen sections:", err);
      });
  }, [dispatch]);

  useEffect(() => {
    if (activeCategoryId != null)
      dispatch(fetchItemsByCategory(activeCategoryId));
  }, [dispatch, activeCategoryId]);

  const items = useMemo(
    () =>
      activeCategoryId != null ? itemsByCategory[activeCategoryId] ?? [] : [],
    [itemsByCategory, activeCategoryId]
  );

  const handleCreateCategory = async () => {
    if (!newCat.title.trim()) return;
    setCategoryCreateLoading(true);
    try {
      const res: any = await dispatch(
        createMenuCategory({
          title: newCat.title.trim(),
          description: newCat.description || undefined,
          image: newCat.image || undefined,
        })
      );
      if (res.type.endsWith("fulfilled")) {
        setNewCat({ title: "", description: "", image: "" });
        setOpenAddCategory(false);
      }
    } finally {
      setCategoryCreateLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editCat.id) return;
    setCategoryUpdateLoading(true);
    try {
      await dispatch(
        updateMenuCategory({
          categoryId: editCat.id,
          title: editCat.title || undefined,
          description: editCat.description || undefined,
          image: editCat.image || undefined,
        })
      );
      setOpenEditCategory(false);
    } finally {
      setCategoryUpdateLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    setCategoryDeleteLoading(true);
    try {
      await dispatch(deleteMenuCategory(id));
      if (activeCategoryId === id) setActiveCategoryId(null);
    } finally {
      setCategoryDeleteLoading(false);
    }
  };

  const handleCreateItem = async () => {
    if (openAddItem == null || !newItem.title.trim()) return;
    const priceNum = Number(newItem.price);
    if (Number.isNaN(priceNum)) return;

    const extrasArray = newItem.extras
      .filter((e) => e.name.trim())
      .map((e) => ({
        name: e.name.trim(),
        price: Number(e.price) || 0,
        calories: Number(e.calories) || 0,
      }));

    setItemCreateLoading(true);
    try {
      const res: any = await dispatch(
        createMenuItemThunk({
          categoryId: openAddItem,
          title: newItem.title.trim(),
          description: newItem.description || undefined,
          price: priceNum,
          image: newItem.image || undefined,
          preparationTime: newItem.preparationTime
            ? Number(newItem.preparationTime)
            : undefined,
          extras: extrasArray.length > 0 ? extrasArray : undefined,
          discountType: newItem.discountType || undefined,
          discountValue: newItem.discountValue
            ? Number(newItem.discountValue)
            : undefined,
          allergies: newItem.allergies.filter((a) => a.trim()),
          calories: newItem.calories ? Number(newItem.calories) : undefined,
          kitchenSectionId: newItem.kitchenSectionId
            ? Number(newItem.kitchenSectionId)
            : undefined,
        })
      );
      if (res.type.endsWith("fulfilled")) {
        setNewItem({
          title: "",
          description: "",
          price: "",
          image: "",
          preparationTime: "",
          extras: [],
          discountType: "",
          discountValue: "",
          allergies: [],
          calories: "",
          kitchenSectionId: "",
        });
        setOpenAddItem(null);
        dispatch(fetchItemsByCategory(openAddItem));
      }
    } finally {
      setItemCreateLoading(false);
    }
  };

  const handleUpdateItem = async () => {
    if (!openEditItem) return;
    const priceNum = openEditItem.price
      ? Number(openEditItem.price)
      : undefined;
    setItemUpdateLoading(true);
    try {
      const res: any = await dispatch(
        updateMenuItemThunk({
          itemId: openEditItem.id,
          title: openEditItem.title || undefined,
          description: openEditItem.description || undefined,
          price: priceNum,
          image: openEditItem.image || undefined,
          preparationTime: openEditItem.preparationTime,
          extras: openEditItem.extras,
          discountType: openEditItem.discountType || undefined,
          discountValue: openEditItem.discountValue,
          allergies: openEditItem.allergies,
          calories: openEditItem.calories,
          kitchenSectionId: openEditItem.kitchenSectionId || undefined,
        })
      );
      if (res.type.endsWith("fulfilled")) {
        dispatch(fetchItemsByCategory(openEditItem.categoryId));
        setOpenEditItem(null);
      }
    } finally {
      setItemUpdateLoading(false);
    }
  };

  const handleSeedDataConfirm = async () => {
    setSeedConfirmOpen(false);
    setIsSeeding(true);
    try {
      const result = await seedService.seedMenuData();
      const successMessage =
        t("dashboard.menu.seedSuccess") ||
        `Successfully added ${result.data.categories} categories and ${result.data.items} items!`;
      toast.success(successMessage);
      dispatch(fetchMenuCategories());
    } catch (error: any) {
      console.error("Error seeding data:", error);
      const errorMessage =
        error?.response?.data?.message ||
        t("dashboard.menu.seedError") ||
        "Failed to seed menu data";
      toast.error(errorMessage);
    } finally {
      setIsSeeding(false);
    }
  };

  const openDiscountForAll = () => {
    setDiscountTarget("all");
    setDiscountForm({ discountType: "PERCENTAGE", discountValue: "" });
    setOpenDiscountDialog(true);
  };

  const openDiscountForCategory = (categoryId: number) => {
    setDiscountTarget(categoryId);
    setDiscountForm({ discountType: "PERCENTAGE", discountValue: "" });
    setOpenDiscountDialog(true);
  };

  const handleApplyDiscount = async () => {
    const value = parseFloat(discountForm.discountValue);
    if (isNaN(value) || value < 0) {
      toast.error(
        t("dashboard.menu.discountValueRequired") ||
          "Please enter a valid discount value."
      );
      return;
    }
    if (discountForm.discountType === "PERCENTAGE" && value > 100) {
      toast.error(
        t("dashboard.menu.discountPercentageMax") ||
          "Percentage cannot exceed 100."
      );
      return;
    }
    setIsApplyingDiscount(true);
    try {
      const isRemoving = value === 0;
      if (discountTarget === "all") {
        const res = await dispatch(
          applyDiscountToAllMenuThunk({
            discountType: discountForm.discountType,
            discountValue: value,
          })
        ).unwrap();
        dispatch(fetchMenuCategories());
        toast.success(
          isRemoving
            ? t("dashboard.menu.discountRemovedAll", { count: res.count }) ||
                `Discount removed from ${res.count} item(s).`
            : t("dashboard.menu.discountAppliedAll", { count: res.count }) ||
                `Discount applied to ${res.count} item(s).`
        );
      } else if (typeof discountTarget === "number") {
        const res = await dispatch(
          applyDiscountToCategoryThunk({
            categoryId: discountTarget,
            discountType: discountForm.discountType,
            discountValue: value,
          })
        ).unwrap();
        dispatch(fetchItemsByCategory(discountTarget));
        dispatch(fetchMenuCategories());
        toast.success(
          isRemoving
            ? t("dashboard.menu.discountRemovedCategory", {
                count: res.count,
              }) || `Discount removed from ${res.count} item(s).`
            : t("dashboard.menu.discountAppliedCategory", {
                count: res.count,
              }) || `Discount applied to ${res.count} item(s).`
        );
      }
      setOpenDiscountDialog(false);
      setDiscountTarget(null);
      setDiscountForm({ discountType: "PERCENTAGE", discountValue: "" });
    } catch (e: any) {
      const errMsg =
        (e?.response?.data?.message ?? e?.message ?? e) ||
        t("dashboard.menu.discountApplyError") ||
        "Failed to apply discount.";
      toast.error(
        typeof errMsg === "string" ? errMsg : "Failed to apply discount."
      );
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  if (isLoading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <PlanPermissionErrorCard
        error={error}
        errorCode={errorCode}
        upgradePlanHintKey="dashboard.menu.upgradePlanHint"
        upgradePlanHintFallback="Your current plan does not include Menu management. Upgrade your subscription to manage the menu from the dashboard."
      />
    );
  }

  return (
    <div className="w-full min-w-0 p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {t("dashboard.menu.title")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t("dashboard.menu.description")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="sm:h-10 sm:px-4 text-xs sm:text-sm"
            onClick={openDiscountForAll}
            title={
              t("dashboard.menu.discountWholeMenu") ||
              "Apply discount to all menu items"
            }
          >
            <Percent className="h-4 w-4 mr-1.5 sm:mr-2 shrink-0" />
            <span className="whitespace-nowrap">
              {t("dashboard.menu.discountWholeMenu") || "Discount whole menu"}
            </span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="sm:h-10 sm:px-4 text-xs sm:text-sm"
            onClick={() => setSeedConfirmOpen(true)}
            disabled={isSeeding}
          >
            {isSeeding ? (
              <Loader2 className="h-4 w-4 mr-1.5 sm:mr-2 animate-spin shrink-0" />
            ) : (
              <Database className="h-4 w-4 mr-1.5 sm:mr-2 shrink-0" />
            )}
            <span className="whitespace-nowrap">
              {t("dashboard.menu.seedData") || "Add Sample Data"}
            </span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="sm:h-10 sm:px-4 text-xs sm:text-sm"
            onClick={() => setOpenAddCategory(true)}
          >
            <Plus className="h-4 w-4 mr-1.5 sm:mr-2 shrink-0" />
            <span className="whitespace-nowrap">
              {t("dashboard.menu.addCategory")}
            </span>
          </Button>
        </div>
      </div>

      {/* Categories Accordion */}
      <Card className="w-full min-w-0 overflow-hidden">
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="text-base sm:text-lg">{t("dashboard.menu.categories")}</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {t("dashboard.menu.expandToManage")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
          <Accordion type="single" collapsible>
            {categories.map((c) => (
              <AccordionItem key={c.id} value={`cat-${c.id}`}>
                <AccordionTrigger
                  className="px-3 sm:px-4 py-3 hover:no-underline [&[data-state=open]>svg]:rotate-180"
                  onClick={() => (
                    setActiveCategoryId(c.id),
                    dispatch(fetchItemsByCategory(c.id))
                  )}
                >
                  <div className="flex w-full items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 text-left min-w-0 flex-1">
                      {c.image && (
                        <img
                          src={getImageUrl(c.image)}
                          alt={c.title}
                          className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-sm sm:text-base truncate">{c.title}</div>
                        <div className="text-xs text-muted-foreground truncate hidden sm:block">
                          {c.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 sm:gap-2 ml-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 sm:h-9 sm:w-9"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openDiscountForCategory(c.id);
                        }}
                        title={
                          t("dashboard.menu.discountByCategory") ||
                          "Apply discount to this category"
                        }
                      >
                        <Percent className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 sm:h-9 sm:w-9"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenAddItem(c.id);
                        }}
                        title="Add item"
                      >
                        <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 sm:h-9 sm:w-9"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditCat({
                            id: c.id,
                            title: c.title,
                            description: c.description || "",
                            image: c.image || "",
                          });
                          setOpenEditCategory(true);
                        }}
                        title="Edit category"
                      >
                        <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 sm:h-9 sm:w-9"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteTarget({
                            type: "category",
                            categoryId: c.id,
                            title: c.title,
                          });
                          setConfirmOpen(true);
                        }}
                        title="Delete category"
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {(itemsByCategory[c.id] ?? []).map((i) => (
                      <div
                        key={i.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-2 sm:p-3 border rounded-lg hover:bg-muted/50 transition-colors min-w-0"
                      >
                        <div className="flex items-start sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
                          {i.image && (
                            <img
                              src={getImageUrl(i.image)}
                              alt={i.title}
                              className="h-9 w-9 sm:h-10 sm:w-10 rounded-md object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 flex-1 min-w-0">
                            {/* Title */}
                            <div className="font-medium text-sm break-words min-w-0">
                              {i.title}
                            </div>

                            {/* Price */}
                            <div className="text-xs sm:text-sm font-semibold text-primary shrink-0">
                              {i.discountType && i.discountValue ? (
                                <>
                                  <span className="line-through text-muted-foreground text-xs mr-1">
                                    {i.price} EUR
                                  </span>
                                  <span>
                                    {i.discountType === "PERCENTAGE"
                                      ? `${(
                                          i.price *
                                          (1 - i.discountValue / 100)
                                        ).toFixed(2)} EUR`
                                      : `${(i.price - i.discountValue).toFixed(
                                          2
                                        )} EUR`}
                                  </span>
                                </>
                              ) : (
                                <span>{i.price} EUR</span>
                              )}
                            </div>

                            {/* Discount Badge */}
                            {i.discountType && i.discountValue && (
                              <Badge
                                variant="secondary"
                                className="text-xs hover:bg-secondary shrink-0"
                              >
                                {i.discountType === "PERCENTAGE"
                                  ? `-${i.discountValue}%`
                                  : `-${i.discountValue} EUR`}
                              </Badge>
                            )}

                            {/* Preparation Time */}
                            {i.preparationTime && (
                              <div className="text-xs text-muted-foreground shrink-0">
                                ⏱️ {i.preparationTime}min
                              </div>
                            )}

                            {/* Calories */}
                            {i.calories && (
                              <div className="text-xs text-muted-foreground shrink-0">
                                🔥 {i.calories} cal
                              </div>
                            )}

                            {/* Allergies */}
                            {i.allergies && i.allergies.length > 0 && (
                              <div className="flex flex-wrap gap-1 min-w-0 w-full sm:w-auto">
                                {i.allergies.map((allergy, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-xs hover:!opacity-100"
                                  >
                                    {getTranslatedAllergen(allergy, t)}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Extras */}
                            {i.extras &&
                              Array.isArray(i.extras) &&
                              i.extras.length > 0 && (
                                <div className="flex flex-wrap gap-1 min-w-0 w-full sm:w-auto">
                                  {i.extras.map((extra: any, idx: number) => (
                                    <Badge
                                      key={idx}
                                      variant="secondary"
                                      className="text-xs hover:bg-secondary"
                                    >
                                      +{extra.name} ({extra.price}€)
                                    </Badge>
                                  ))}
                                </div>
                              )}

                            {/* Description (truncated) */}
                            {i.description && (
                              <div className="text-xs text-muted-foreground truncate max-w-full sm:max-w-[200px]">
                                {i.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 sm:gap-2 flex-shrink-0 self-end sm:self-center">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 sm:h-9 sm:w-9"
                            onClick={() =>
                              setOpenEditItem({
                                id: i.id,
                                categoryId: i.categoryId,
                                title: i.title,
                                description: i.description || "",
                                price: String(i.price ?? ""),
                                image: i.image || "",
                                preparationTime: i.preparationTime ?? null,
                                extras: i.extras ?? null,
                                discountType: i.discountType ?? null,
                                discountValue: i.discountValue ?? null,
                                allergies: i.allergies ?? [],
                                calories: i.calories ?? null,
                                kitchenSectionId: i.kitchenSectionId ?? null,
                              })
                            }
                            title="Edit item"
                          >
                            <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 sm:h-9 sm:w-9"
                            onClick={() => {
                              setDeleteTarget({
                                type: "item",
                                categoryId: i.categoryId,
                                itemId: i.id,
                                title: i.title,
                              });
                              setConfirmOpen(true);
                            }}
                            title="Delete item"
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Add/Edit Category Dialogs */}
      <Dialog open={openAddCategory} onOpenChange={setOpenAddCategory}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
          <DialogHeader>
            <DialogTitle>{t("dashboard.menu.addCategory")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder={t("dashboard.menu.title")}
              value={newCat.title}
              onChange={(e) => setNewCat({ ...newCat, title: e.target.value })}
            />
            <Input
              placeholder={t("dashboard.menu.descriptionOptional")}
              value={newCat.description}
              onChange={(e) =>
                setNewCat({ ...newCat, description: e.target.value })
              }
            />
            <FileUploader
              label={t("dashboard.menu.image")}
              value={newCat.image}
              onChange={(url) => setNewCat({ ...newCat, image: url || "" })}
              onUploadingChange={setUploading}
              meta={{ restaurantId: restaurantId, entityType: "category" }}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOpenAddCategory(false)}
              >
                {t("dashboard.menu.cancel")}
              </Button>
              <Button
                onClick={handleCreateCategory}
                disabled={
                  isLoading ||
                  uploading ||
                  categoryCreateLoading ||
                  !newCat.title.trim()
                }
              >
                {categoryCreateLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t("dashboard.menu.save")}
                  </>
                ) : (
                  t("dashboard.menu.save")
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openEditCategory} onOpenChange={setOpenEditCategory}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
          <DialogHeader>
            <DialogTitle>{t("dashboard.menu.editCategory")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder={t("dashboard.menu.title")}
              value={editCat.title}
              onChange={(e) =>
                setEditCat({ ...editCat, title: e.target.value })
              }
            />
            <Input
              placeholder={t("dashboard.menu.descriptionOptional")}
              value={editCat.description}
              onChange={(e) =>
                setEditCat({ ...editCat, description: e.target.value })
              }
            />
            <FileUploader
              label={t("dashboard.menu.image")}
              value={editCat.image}
              onChange={(url) => setEditCat({ ...editCat, image: url || "" })}
              onUploadingChange={setUploading}
              meta={{ restaurantId: restaurantId, entityType: "category" }}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOpenEditCategory(false)}
              >
                {t("dashboard.menu.cancel")}
              </Button>
              <Button
                onClick={handleUpdateCategory}
                disabled={
                  isLoading ||
                  uploading ||
                  categoryUpdateLoading ||
                  !editCat.title.trim()
                }
              >
                {categoryUpdateLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t("dashboard.menu.save")}
                  </>
                ) : (
                  t("dashboard.menu.save")
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Discount Dialog */}
      <Dialog
        open={openDiscountDialog}
        onOpenChange={(v) => {
          if (!v) {
            setDiscountTarget(null);
            setDiscountForm({ discountType: "PERCENTAGE", discountValue: "" });
          }
          setOpenDiscountDialog(v);
        }}
      >
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
          <DialogHeader>
            <DialogTitle>
              {discountTarget === "all"
                ? t("dashboard.menu.discountWholeMenu") || "Discount whole menu"
                : t("dashboard.menu.discountByCategory") ||
                  "Discount by category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                {t("dashboard.menu.discountType") || "Discount type"}
              </Label>
              <Select
                value={discountForm.discountType}
                onValueChange={(v: "PERCENTAGE" | "AMOUNT") =>
                  setDiscountForm((f) => ({ ...f, discountType: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">
                    {t("dashboard.menu.discountPercentage") || "Percentage (%)"}
                  </SelectItem>
                  <SelectItem value="AMOUNT">
                    {t("dashboard.menu.discountAmount") || "Fixed amount"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                {t("dashboard.menu.discountValue") || "Discount value"}
              </Label>
              <Input
                type="number"
                min={0}
                step={discountForm.discountType === "PERCENTAGE" ? 1 : 0.01}
                max={
                  discountForm.discountType === "PERCENTAGE" ? 100 : undefined
                }
                placeholder={
                  discountForm.discountType === "PERCENTAGE"
                    ? "e.g. 10"
                    : "e.g. 2.50"
                }
                value={discountForm.discountValue}
                onChange={(e) =>
                  setDiscountForm((f) => ({
                    ...f,
                    discountValue: e.target.value,
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                {t("dashboard.menu.discountZeroRemoves") ||
                  "Use 0 to remove discount from all selected items."}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOpenDiscountDialog(false)}
              >
                {t("dashboard.menu.cancel")}
              </Button>
              <Button
                onClick={handleApplyDiscount}
                disabled={
                  isApplyingDiscount ||
                  discountForm.discountValue.trim() === "" ||
                  (discountForm.discountValue.trim() !== "" &&
                    isNaN(parseFloat(discountForm.discountValue)))
                }
              >
                {isApplyingDiscount ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                {t("dashboard.menu.applyDiscount") || "Apply discount"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Item Dialogs */}
      <Dialog
        open={openAddItem != null}
        onOpenChange={(v) => {
          if (!v) {
            setNewItem({
              title: "",
              description: "",
              price: "",
              image: "",
              preparationTime: "",
              extras: [],
              discountType: "",
              discountValue: "",
              allergies: [],
              calories: "",
              kitchenSectionId: "",
            });
          }
          setOpenAddItem(v ? openAddItem : null);
        }}
      >
        <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">{t("dashboard.menu.addItem")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">{t("dashboard.menu.title")} *</Label>
              <Input
                placeholder={t("dashboard.menu.title")}
                value={newItem.title}
                onChange={(e) =>
                  setNewItem({ ...newItem, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t("dashboard.menu.description")}</Label>
              <Textarea
                placeholder={t("dashboard.menu.description")}
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">{t("dashboard.menu.price")} *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={t("dashboard.menu.price")}
                  value={newItem.price}
                  className="text-sm sm:text-base"
                  onChange={(e) =>
                    setNewItem({ ...newItem, price: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">{t("dashboard.menu.preparationTime")}</Label>
                <Input
                  type="number"
                  placeholder={t("dashboard.menu.preparationTimeMinutes")}
                  value={newItem.preparationTime}
                  onChange={(e) =>
                    setNewItem({ ...newItem, preparationTime: e.target.value })
                  }
                  className="text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">{t("dashboard.menu.calories")}</Label>
                <Input
                  type="number"
                  placeholder={t("dashboard.menu.calories")}
                  value={newItem.calories}
                  onChange={(e) =>
                    setNewItem({ ...newItem, calories: e.target.value })
                  }
                  className="text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">{t("dashboard.menu.kitchenSection")}</Label>
                <Select
                  value={newItem.kitchenSectionId || "none"}
                  onValueChange={(value) =>
                    setNewItem({
                      ...newItem,
                      kitchenSectionId: value === "none" ? "" : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("dashboard.menu.selectKitchenSection")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {t("dashboard.menu.none")}
                    </SelectItem>
                    {kitchenSections.map((section) => (
                      <SelectItem key={section.id} value={String(section.id)}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">{t("dashboard.menu.discount")}</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Select
                  value={newItem.discountType || "none"}
                  onValueChange={(value: "PERCENTAGE" | "AMOUNT" | "none") =>
                    setNewItem({
                      ...newItem,
                      discountType: value === "none" ? "" : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("dashboard.menu.discountType")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {t("dashboard.menu.none")}
                    </SelectItem>
                    <SelectItem value="PERCENTAGE">
                      {t("dashboard.menu.percentage")}
                    </SelectItem>
                    <SelectItem value="AMOUNT">
                      {t("dashboard.menu.amount")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                {newItem.discountType && (
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={t("dashboard.menu.discountValue")}
                    value={newItem.discountValue}
                    onChange={(e) =>
                      setNewItem({ ...newItem, discountValue: e.target.value })
                    }
                  />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">{t("dashboard.menu.allergies")}</Label>
              <AllergenSelect
                value={newItem.allergies}
                onChange={(allergies) =>
                  setNewItem({ ...newItem, allergies })
                }
                placeholder={t("dashboard.menu.allergiesPlaceholder")}
              />
              <p className="text-xs text-muted-foreground">
                {t("dashboard.menu.allergiesHint")}
              </p>
            </div>
            <div className="space-y-2">
              <Label>{t("dashboard.menu.extras")}</Label>
              <div className="space-y-2">
                {newItem.extras.map((extra, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder={t("dashboard.menu.extraName")}
                      value={extra.name}
                      className="text-sm sm:text-base"
                      onChange={(e) => {
                        const newExtras = [...newItem.extras];
                        newExtras[index].name = e.target.value;
                        setNewItem({ ...newItem, extras: newExtras });
                      }}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={t("dashboard.menu.extraPrice")}
                      value={extra.price}
                      onChange={(e) => {
                        const newExtras = [...newItem.extras];
                        newExtras[index].price = e.target.value;
                        setNewItem({ ...newItem, extras: newExtras });
                      }}
                    />
                    <Input
                      type="number"
                      placeholder={t("dashboard.menu.extraCalories")}
                      value={extra.calories}
                      onChange={(e) => {
                        const newExtras = [...newItem.extras];
                        newExtras[index].calories = e.target.value;
                        setNewItem({ ...newItem, extras: newExtras });
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setNewItem({
                          ...newItem,
                          extras: newItem.extras.filter((_, i) => i !== index),
                        });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setNewItem({
                      ...newItem,
                      extras: [
                        ...newItem.extras,
                        { name: "", price: "", calories: "" },
                      ],
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("dashboard.menu.addExtra")}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("dashboard.menu.image")}</Label>
              <FileUploader
                value={newItem.image}
                onChange={(url) => setNewItem({ ...newItem, image: url || "" })}
                onUploadingChange={setUploading}
                meta={{
                  restaurantId: restaurantId,
                  entityType: "menuItem",
                  entityId: openAddItem ? String(openAddItem) : undefined,
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setNewItem({
                    title: "",
                    description: "",
                    price: "",
                    image: "",
                    preparationTime: "",
                    extras: [],
                    discountType: "",
                    discountValue: "",
                    allergies: [],
                    calories: "",
                    kitchenSectionId: "",
                  });
                  setOpenAddItem(null);
                }}
              >
                {t("dashboard.menu.cancel")}
              </Button>
              <Button
                onClick={handleCreateItem}
                disabled={
                  isLoading ||
                  uploading ||
                  itemCreateLoading ||
                  !newItem.title.trim()
                }
              >
                {itemCreateLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t("dashboard.menu.save")}
                  </>
                ) : (
                  t("dashboard.menu.save")
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openEditItem != null}
        onOpenChange={(v) => {
          setOpenEditItem(v ? openEditItem : null);
        }}
      >
        <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">{t("dashboard.menu.editItem")}</DialogTitle>
          </DialogHeader>
          {openEditItem && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("dashboard.menu.title")} *</Label>
                <Input
                  placeholder={t("dashboard.menu.title")}
                  value={openEditItem.title}
                  onChange={(e) =>
                    setOpenEditItem({ ...openEditItem, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t("dashboard.menu.description")}</Label>
                <Textarea
                  placeholder={t("dashboard.menu.description")}
                  value={openEditItem.description || ""}
                  onChange={(e) =>
                    setOpenEditItem({
                      ...openEditItem,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">{t("dashboard.menu.price")} *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={t("dashboard.menu.price")}
                    value={openEditItem.price}
                    onChange={(e) =>
                      setOpenEditItem({
                        ...openEditItem,
                        price: e.target.value,
                      })
                    }
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">{t("dashboard.menu.preparationTime")}</Label>
                  <Input
                    type="number"
                    placeholder={t("dashboard.menu.preparationTimeMinutes")}
                    value={openEditItem.preparationTime?.toString() || ""}
                    onChange={(e) =>
                      setOpenEditItem({
                        ...openEditItem,
                        preparationTime: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">{t("dashboard.menu.calories")}</Label>
                  <Input
                    type="number"
                    placeholder={t("dashboard.menu.calories")}
                    value={openEditItem.calories?.toString() || ""}
                    className="text-sm sm:text-base"
                    onChange={(e) =>
                      setOpenEditItem({
                        ...openEditItem,
                        calories: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("dashboard.menu.kitchenSection")}</Label>
                  <Select
                    value={openEditItem.kitchenSectionId?.toString() || "none"}
                    onValueChange={(value) =>
                      setOpenEditItem({
                        ...openEditItem,
                        kitchenSectionId:
                          value === "none" ? null : Number(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("dashboard.menu.selectKitchenSection")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        {t("dashboard.menu.none")}
                      </SelectItem>
                      {kitchenSections.map((section) => (
                        <SelectItem key={section.id} value={String(section.id)}>
                          {section.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">{t("dashboard.menu.discount")}</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Select
                    value={openEditItem.discountType || "none"}
                    onValueChange={(value: "PERCENTAGE" | "AMOUNT" | "none") =>
                      setOpenEditItem({
                        ...openEditItem,
                        discountType: value === "none" ? null : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("dashboard.menu.discountType")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        {t("dashboard.menu.none")}
                      </SelectItem>
                      <SelectItem value="PERCENTAGE">
                        {t("dashboard.menu.percentage")}
                      </SelectItem>
                      <SelectItem value="AMOUNT">
                        {t("dashboard.menu.amount")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {openEditItem.discountType && (
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={t("dashboard.menu.discountValue")}
                      value={openEditItem.discountValue?.toString() || ""}
                      onChange={(e) =>
                        setOpenEditItem({
                          ...openEditItem,
                          discountValue: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                    />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("dashboard.menu.allergies")}</Label>
                <AllergenSelect
                  value={openEditItem.allergies || []}
                  onChange={(allergies) =>
                    setOpenEditItem({ ...openEditItem, allergies })
                  }
                  placeholder={t("dashboard.menu.allergiesPlaceholder")}
                />
                <p className="text-xs text-muted-foreground">
                  {t("dashboard.menu.allergiesHint")}
                </p>
              </div>
              <div className="space-y-2">
                <Label>{t("dashboard.menu.extras")}</Label>
                <div className="space-y-2">
                  {(Array.isArray(openEditItem.extras)
                    ? openEditItem.extras
                    : []
                  ).map((extra: any, index: number) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2">
                      <Input
                        placeholder={t("dashboard.menu.extraName")}
                        value={extra.name || ""}
                        className="text-sm sm:text-base"
                        onChange={(e) => {
                          const currentExtras = Array.isArray(
                            openEditItem.extras
                          )
                            ? [...openEditItem.extras]
                            : [];
                          currentExtras[index] = {
                            ...currentExtras[index],
                            name: e.target.value,
                          };
                          setOpenEditItem({
                            ...openEditItem,
                            extras: currentExtras,
                          });
                        }}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={t("dashboard.menu.extraPrice")}
                        value={extra.price?.toString() || ""}
                        onChange={(e) => {
                          const currentExtras = Array.isArray(
                            openEditItem.extras
                          )
                            ? [...openEditItem.extras]
                            : [];
                          currentExtras[index] = {
                            ...currentExtras[index],
                            price: e.target.value ? Number(e.target.value) : 0,
                          };
                          setOpenEditItem({
                            ...openEditItem,
                            extras: currentExtras,
                          });
                        }}
                      />
                      <Input
                        type="number"
                        placeholder={t("dashboard.menu.extraCalories")}
                        value={extra.calories?.toString() || ""}
                        onChange={(e) => {
                          const currentExtras = Array.isArray(
                            openEditItem.extras
                          )
                            ? [...openEditItem.extras]
                            : [];
                          currentExtras[index] = {
                            ...currentExtras[index],
                            calories: e.target.value
                              ? Number(e.target.value)
                              : 0,
                          };
                          setOpenEditItem({
                            ...openEditItem,
                            extras: currentExtras,
                          });
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const currentExtras = Array.isArray(
                            openEditItem.extras
                          )
                            ? [...openEditItem.extras]
                            : [];
                          setOpenEditItem({
                            ...openEditItem,
                            extras: currentExtras.filter((_, i) => i !== index),
                          });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentExtras = Array.isArray(openEditItem.extras)
                        ? [...openEditItem.extras]
                        : [];
                      setOpenEditItem({
                        ...openEditItem,
                        extras: [
                          ...currentExtras,
                          { name: "", price: 0, calories: 0 },
                        ],
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("dashboard.menu.addExtra")}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("dashboard.menu.image")}</Label>
                <FileUploader
                  value={openEditItem.image}
                  onChange={(url) =>
                    setOpenEditItem({ ...openEditItem, image: url || "" })
                  }
                  onUploadingChange={setUploading}
                  meta={{
                    restaurantId: restaurantId,
                    entityType: "menuItem",
                    entityId: String(openEditItem.id),
                  }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpenEditItem(null);
                  }}
                >
                  {t("dashboard.menu.cancel")}
                </Button>
                <Button
                  onClick={handleUpdateItem}
                  disabled={
                    isLoading ||
                    uploading ||
                    itemUpdateLoading ||
                    !openEditItem.title.trim()
                  }
                >
                  {itemUpdateLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {t("dashboard.menu.save")}
                    </>
                  ) : (
                    t("dashboard.menu.save")
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Seed Data */}
      <ConfirmDialog
        open={seedConfirmOpen}
        setOpen={setSeedConfirmOpen}
        title={t("dashboard.menu.seedData") || "Add Sample Data"}
        message={
          t("dashboard.menu.seedConfirm") ||
          "This will add 5 sample categories with 10 items each. Continue?"
        }
        confirmText={t("common.confirm")}
        cancelText={t("common.cancel")}
        confirmVariant="default"
        onConfirm={handleSeedDataConfirm}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirmOpen}
        setOpen={setConfirmOpen}
        title={
          deleteTarget?.type === "category"
            ? t("dashboard.menu.deleteCategory")
            : t("dashboard.menu.deleteItem")
        }
        message={
          deleteTarget?.type === "category"
            ? t("dashboard.menu.confirmDeleteCategory")
            : t("dashboard.menu.confirmDeleteItem")
        }
        confirmText={t("dashboard.menu.delete")}
        cancelText={t("dashboard.menu.cancel")}
        loading={categoryDeleteLoading || itemDeleteLoading}
        onConfirm={async () => {
          if (!deleteTarget) return;
          if (
            deleteTarget.type === "category" &&
            deleteTarget.categoryId != null
          ) {
            await handleDeleteCategory(deleteTarget.categoryId);
            setDeleteTarget(null);
          } else if (
            deleteTarget.type === "item" &&
            deleteTarget.itemId != null &&
            deleteTarget.categoryId != null
          ) {
            setItemDeleteLoading(true);
            try {
              await dispatch(
                deleteMenuItemThunk({
                  categoryId: deleteTarget.categoryId,
                  itemId: deleteTarget.itemId,
                })
              );
              setDeleteTarget(null);
            } finally {
              setItemDeleteLoading(false);
            }
          }
        }}
      />
    </div>
  );
}
