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
import { Plus, Pencil, Trash2, PlusCircle, Edit, X, Database, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import FileUploader from "@/components/upload/file-uploader";
import { seedService } from "@/features/restaurant/menu/seedService";

export function MenuManagement() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { categories, itemsByCategory, isLoading } = useAppSelector(
    (s) => s.restaurantMenu
  );

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
  const [newAllergyInput, setNewAllergyInput] = useState("");
  const [editAllergyInput, setEditAllergyInput] = useState("");
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
  
  // Seed data state
  const [isSeeding, setIsSeeding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<null | {
    type: "category" | "item";
    categoryId?: number;
    itemId?: number;
    title?: string;
  }>(null);
  const restaurantId = useAppSelector((s) => s.restaurantAccount.data?.id);
  const [uploading, setUploading] = useState(false);
  const [kitchenSections, setKitchenSections] = useState<any[]>([]);

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
  };

  const handleUpdateCategory = async () => {
    if (!editCat.id) return;
    await dispatch(
      updateMenuCategory({
        categoryId: editCat.id,
        title: editCat.title || undefined,
        description: editCat.description || undefined,
        image: editCat.image || undefined,
      })
    );
    setOpenEditCategory(false);
  };

  const handleDeleteCategory = async (id: number) => {
    await dispatch(deleteMenuCategory(id));
    if (activeCategoryId === id) setActiveCategoryId(null);
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

    const res: any = await dispatch(
      createMenuItemThunk({
        categoryId: openAddItem,
        title: newItem.title.trim(),
        description: newItem.description || undefined,
        price: priceNum,
        image: newItem.image || undefined,
        preparationTime: newItem.preparationTime ? Number(newItem.preparationTime) : undefined,
        extras: extrasArray.length > 0 ? extrasArray : undefined,
        discountType: newItem.discountType || undefined,
        discountValue: newItem.discountValue ? Number(newItem.discountValue) : undefined,
        allergies: newItem.allergies.filter((a) => a.trim()),
        calories: newItem.calories ? Number(newItem.calories) : undefined,
        kitchenSectionId: newItem.kitchenSectionId ? Number(newItem.kitchenSectionId) : undefined,
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
  };

  const handleUpdateItem = async () => {
    if (!openEditItem) return;
    const priceNum = openEditItem.price
      ? Number(openEditItem.price)
      : undefined;
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
      setEditAllergyInput("");
    }
  };

  const handleSeedData = async () => {
    const confirmMessage = t("dashboard.menu.seedConfirm") || "This will add 5 sample categories with 10 items each. Continue?";
    if (!confirm(confirmMessage)) {
      return;
    }

    setIsSeeding(true);
    try {
      const result = await seedService.seedMenuData();
      const successMessage = t("dashboard.menu.seedSuccess") || `Successfully added ${result.data.categories} categories and ${result.data.items} items!`;
      alert(successMessage);
      // Refresh menu data
      dispatch(fetchMenuCategories());
    } catch (error: any) {
      console.error("Error seeding data:", error);
      const errorMessage = error?.response?.data?.message || t("dashboard.menu.seedError") || "Failed to seed menu data";
      alert(errorMessage);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
{t("dashboard.menu.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("dashboard.menu.description")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleSeedData}
            disabled={isSeeding}
          >
            {isSeeding ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            {t("dashboard.menu.seedData") || "Add Sample Data"}
          </Button>
          <Button variant="outline" onClick={() => setOpenAddCategory(true)}>
            <Plus className="h-4 w-4 mr-2" /> {t("dashboard.menu.addCategory")}
          </Button>
        </div>
      </div>

      {/* Categories Accordion */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.menu.categories")}</CardTitle>
          <CardDescription>
{t("dashboard.menu.expandToManage")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {categories.map((c) => (
              <AccordionItem key={c.id} value={`cat-${c.id}`}>
                <AccordionTrigger
                  onClick={() => (
                    setActiveCategoryId(c.id),
                    dispatch(fetchItemsByCategory(c.id))
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-3 text-left">
                      {c.image && (
                        <img
                          src={c.image}
                          alt={c.title}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium">{c.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {c.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenAddItem(c.id);
                        }}
                        title="Add item"
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
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
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          setDeleteTarget({
                            type: "category",
                            categoryId: c.id,
                            title: c.title,
                          });
                          setConfirmOpen(true);
                        }}
                        title="Delete category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {(itemsByCategory[c.id] ?? []).map((i) => (
                      <div
                        key={i.id}
                        className="flex items-center justify-between gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {i.image && (
                            <img
                              src={i.image}
                              alt={i.title}
                              className="h-10 w-10 rounded-md object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex items-center gap-4 flex-1 min-w-0 flex-wrap">
                            {/* Title */}
                            <div className="font-medium text-sm min-w-[120px]">
                              {i.title}
                            </div>
                            
                            {/* Price */}
                            <div className="text-sm font-semibold text-primary min-w-[80px]">
                              {i.discountType && i.discountValue ? (
                                <>
                                  <span className="line-through text-muted-foreground text-xs mr-1">
                                    {i.price} EUR
                                  </span>
                                  <span>
                                    {i.discountType === "PERCENTAGE"
                                      ? `${(i.price * (1 - i.discountValue / 100)).toFixed(2)} EUR`
                                      : `${(i.price - i.discountValue).toFixed(2)} EUR`}
                                  </span>
                                </>
                              ) : (
                                <span>{i.price} EUR</span>
                              )}
                            </div>

                            {/* Discount Badge */}
                            {i.discountType && i.discountValue && (
                              <Badge variant="secondary" className="text-xs hover:bg-secondary">
                                {i.discountType === "PERCENTAGE"
                                  ? `-${i.discountValue}%`
                                  : `-${i.discountValue} EUR`}
                              </Badge>
                            )}

                            {/* Preparation Time */}
                            {i.preparationTime && (
                              <div className="text-xs text-muted-foreground min-w-[60px]">
                                ⏱️ {i.preparationTime}min
                              </div>
                            )}

                            {/* Calories */}
                            {i.calories && (
                              <div className="text-xs text-muted-foreground min-w-[50px]">
                                🔥 {i.calories} cal
                              </div>
                            )}

                            {/* Allergies */}
                            {i.allergies && i.allergies.length > 0 && (
                              <div className="flex flex-wrap gap-1 min-w-0">
                                {i.allergies.map((allergy, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-xs hover:!opacity-100"
                                  >
                                    {allergy}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Extras */}
                            {i.extras && Array.isArray(i.extras) && i.extras.length > 0 && (
                              <div className="flex flex-wrap gap-1 min-w-0">
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
                              <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {i.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
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
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
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
                            <Trash2 className="h-4 w-4" />
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
        <DialogContent className="sm:max-w-md">
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
                disabled={isLoading || uploading || !newCat.title.trim()}
              >
{t("dashboard.menu.save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openEditCategory} onOpenChange={setOpenEditCategory}>
        <DialogContent className="sm:max-w-md">
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
                disabled={isLoading || uploading || !editCat.title.trim()}
              >
{t("dashboard.menu.save")}
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
            setNewAllergyInput("");
          }
          setOpenAddItem(v ? openAddItem : null);
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("dashboard.menu.addItem")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("dashboard.menu.title")} *</Label>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("dashboard.menu.price")} *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={t("dashboard.menu.price")}
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem({ ...newItem, price: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t("dashboard.menu.preparationTime")}</Label>
                <Input
                  type="number"
                  placeholder={t("dashboard.menu.preparationTimeMinutes")}
                  value={newItem.preparationTime}
                  onChange={(e) =>
                    setNewItem({ ...newItem, preparationTime: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("dashboard.menu.calories")}</Label>
                <Input
                  type="number"
                  placeholder={t("dashboard.menu.calories")}
                  value={newItem.calories}
                  onChange={(e) =>
                    setNewItem({ ...newItem, calories: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t("dashboard.menu.kitchenSection")}</Label>
                <Select
                  value={newItem.kitchenSectionId || "none"}
                  onValueChange={(value) =>
                    setNewItem({ ...newItem, kitchenSectionId: value === "none" ? "" : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("dashboard.menu.selectKitchenSection")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("dashboard.menu.none")}</SelectItem>
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
              <Label>{t("dashboard.menu.discount")}</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={newItem.discountType || "none"}
                  onValueChange={(value: "PERCENTAGE" | "AMOUNT" | "none") =>
                    setNewItem({ ...newItem, discountType: value === "none" ? "" : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("dashboard.menu.discountType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("dashboard.menu.none")}</SelectItem>
                    <SelectItem value="PERCENTAGE">{t("dashboard.menu.percentage")}</SelectItem>
                    <SelectItem value="AMOUNT">{t("dashboard.menu.amount")}</SelectItem>
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
              <Label>{t("dashboard.menu.allergies")}</Label>
              <div className="flex gap-2">
                <Input
                  placeholder={t("dashboard.menu.allergiesPlaceholder")}
                  value={newAllergyInput}
                  onChange={(e) => setNewAllergyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const trimmed = newAllergyInput.trim();
                      if (trimmed && !newItem.allergies.includes(trimmed)) {
                        setNewItem({
                          ...newItem,
                          allergies: [...newItem.allergies, trimmed],
                        });
                        setNewAllergyInput("");
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const trimmed = newAllergyInput.trim();
                    if (trimmed && !newItem.allergies.includes(trimmed)) {
                      setNewItem({
                        ...newItem,
                        allergies: [...newItem.allergies, trimmed],
                      });
                      setNewAllergyInput("");
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {newItem.allergies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newItem.allergies.map((allergy, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 hover:bg-secondary"
                    >
                      {allergy}
                      <button
                        type="button"
                        onClick={() => {
                          setNewItem({
                            ...newItem,
                            allergies: newItem.allergies.filter((_, i) => i !== index),
                          });
                        }}
                        className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {t("dashboard.menu.allergiesHint")}
              </p>
            </div>
            <div className="space-y-2">
              <Label>{t("dashboard.menu.extras")}</Label>
              <div className="space-y-2">
                {newItem.extras.map((extra, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={t("dashboard.menu.extraName")}
                      value={extra.name}
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
                      extras: [...newItem.extras, { name: "", price: "", calories: "" }],
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
                  setNewAllergyInput("");
                  setOpenAddItem(null);
                }}
              >
                {t("dashboard.menu.cancel")}
              </Button>
              <Button
                onClick={handleCreateItem}
                disabled={isLoading || uploading || !newItem.title.trim()}
              >
                {t("dashboard.menu.save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openEditItem != null}
        onOpenChange={(v) => {
          if (!v) {
            setEditAllergyInput("");
          }
          setOpenEditItem(v ? openEditItem : null);
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("dashboard.menu.editItem")}</DialogTitle>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("dashboard.menu.price")} *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={t("dashboard.menu.price")}
                    value={openEditItem.price}
                    onChange={(e) =>
                      setOpenEditItem({ ...openEditItem, price: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("dashboard.menu.preparationTime")}</Label>
                  <Input
                    type="number"
                    placeholder={t("dashboard.menu.preparationTimeMinutes")}
                    value={openEditItem.preparationTime?.toString() || ""}
                    onChange={(e) =>
                      setOpenEditItem({
                        ...openEditItem,
                        preparationTime: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("dashboard.menu.calories")}</Label>
                  <Input
                    type="number"
                    placeholder={t("dashboard.menu.calories")}
                    value={openEditItem.calories?.toString() || ""}
                    onChange={(e) =>
                      setOpenEditItem({
                        ...openEditItem,
                        calories: e.target.value ? Number(e.target.value) : null,
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
                        kitchenSectionId: value === "none" ? null : Number(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("dashboard.menu.selectKitchenSection")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t("dashboard.menu.none")}</SelectItem>
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
                <Label>{t("dashboard.menu.discount")}</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={openEditItem.discountType || "none"}
                    onValueChange={(value: "PERCENTAGE" | "AMOUNT" | "none") =>
                      setOpenEditItem({ ...openEditItem, discountType: value === "none" ? null : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("dashboard.menu.discountType")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t("dashboard.menu.none")}</SelectItem>
                      <SelectItem value="PERCENTAGE">{t("dashboard.menu.percentage")}</SelectItem>
                      <SelectItem value="AMOUNT">{t("dashboard.menu.amount")}</SelectItem>
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
                          discountValue: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                    />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("dashboard.menu.allergies")}</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder={t("dashboard.menu.allergiesPlaceholder")}
                    value={editAllergyInput}
                    onChange={(e) => setEditAllergyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const trimmed = editAllergyInput.trim();
                        const currentAllergies = openEditItem.allergies || [];
                        if (trimmed && !currentAllergies.includes(trimmed)) {
                          setOpenEditItem({
                            ...openEditItem,
                            allergies: [...currentAllergies, trimmed],
                          });
                          setEditAllergyInput("");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const trimmed = editAllergyInput.trim();
                      const currentAllergies = openEditItem.allergies || [];
                      if (trimmed && !currentAllergies.includes(trimmed)) {
                        setOpenEditItem({
                          ...openEditItem,
                          allergies: [...currentAllergies, trimmed],
                        });
                        setEditAllergyInput("");
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {(openEditItem.allergies || []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(openEditItem.allergies || []).map((allergy, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1 hover:bg-secondary"
                      >
                        {allergy}
                        <button
                          type="button"
                          onClick={() => {
                            const currentAllergies = openEditItem.allergies || [];
                            setOpenEditItem({
                              ...openEditItem,
                              allergies: currentAllergies.filter((_, i) => i !== index),
                            });
                          }}
                          className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {t("dashboard.menu.allergiesHint")}
                </p>
              </div>
              <div className="space-y-2">
                <Label>{t("dashboard.menu.extras")}</Label>
                <div className="space-y-2">
                  {(Array.isArray(openEditItem.extras) ? openEditItem.extras : []).map(
                    (extra: any, index: number) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={t("dashboard.menu.extraName")}
                          value={extra.name || ""}
                          onChange={(e) => {
                            const currentExtras = Array.isArray(openEditItem.extras)
                              ? [...openEditItem.extras]
                              : [];
                            currentExtras[index] = { ...currentExtras[index], name: e.target.value };
                            setOpenEditItem({ ...openEditItem, extras: currentExtras });
                          }}
                        />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={t("dashboard.menu.extraPrice")}
                          value={extra.price?.toString() || ""}
                          onChange={(e) => {
                            const currentExtras = Array.isArray(openEditItem.extras)
                              ? [...openEditItem.extras]
                              : [];
                            currentExtras[index] = {
                              ...currentExtras[index],
                              price: e.target.value ? Number(e.target.value) : 0,
                            };
                            setOpenEditItem({ ...openEditItem, extras: currentExtras });
                          }}
                        />
                        <Input
                          type="number"
                          placeholder={t("dashboard.menu.extraCalories")}
                          value={extra.calories?.toString() || ""}
                          onChange={(e) => {
                            const currentExtras = Array.isArray(openEditItem.extras)
                              ? [...openEditItem.extras]
                              : [];
                            currentExtras[index] = {
                              ...currentExtras[index],
                              calories: e.target.value ? Number(e.target.value) : 0,
                            };
                            setOpenEditItem({ ...openEditItem, extras: currentExtras });
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const currentExtras = Array.isArray(openEditItem.extras)
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
                    )
                  )}
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
                        extras: [...currentExtras, { name: "", price: 0, calories: 0 }],
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
                    setEditAllergyInput("");
                  }}
                >
                  {t("dashboard.menu.cancel")}
                </Button>
                <Button
                  onClick={handleUpdateItem}
                  disabled={
                    isLoading || uploading || !openEditItem.title.trim()
                  }
                >
                  {t("dashboard.menu.save")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirmOpen}
        setOpen={setConfirmOpen}
        title={
deleteTarget?.type === "category" ? t("dashboard.menu.deleteCategory") : t("dashboard.menu.deleteItem")
        }
        message={`Are you sure you want to delete ${deleteTarget?.type} "${
          deleteTarget?.title ?? ""
        }"?`}
confirmText={t("dashboard.menu.delete")}
        cancelText={t("dashboard.menu.cancel")}
        onConfirm={async () => {
          if (!deleteTarget) return;
          if (
            deleteTarget.type === "category" &&
            deleteTarget.categoryId != null
          ) {
            await handleDeleteCategory(deleteTarget.categoryId);
          } else if (
            deleteTarget.type === "item" &&
            deleteTarget.itemId != null &&
            deleteTarget.categoryId != null
          ) {
            await dispatch(
              deleteMenuItemThunk({
                categoryId: deleteTarget.categoryId,
                itemId: deleteTarget.itemId,
              })
            );
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
