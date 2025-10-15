"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Pencil, Trash2, PlusCircle, Edit, X } from "lucide-react";
import FileUploader from "@/components/upload/file-uploader";

export function MenuManagement() {
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
  const [newItem, setNewItem] = useState<{
    title: string;
    description: string;
    price: string;
    image: string;
  }>({ title: "", description: "", price: "", image: "" });

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
  }>(null);

  // Confirm delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<null | {
    type: "category" | "item";
    categoryId?: number;
    itemId?: number;
    title?: string;
  }>(null);
  const restaurantId = useAppSelector((s) => s.restaurantAccount.data?.id);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    dispatch(fetchMenuCategories());
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
    const res: any = await dispatch(
      createMenuItemThunk({
        categoryId: openAddItem,
        title: newItem.title.trim(),
        description: newItem.description || undefined,
        price: priceNum,
        image: newItem.image || undefined,
      })
    );
    if (res.type.endsWith("fulfilled")) {
      setNewItem({ title: "", description: "", price: "", image: "" });
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
      })
    );
    if (res.type.endsWith("fulfilled")) {
      dispatch(fetchItemsByCategory(openEditItem.categoryId));
      setOpenEditItem(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Menu Management
          </h1>
          <p className="text-muted-foreground">
            Create categories and items for your restaurant menu
          </p>
        </div>
        <div>
          <Button variant="outline" onClick={() => setOpenAddCategory(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Category
          </Button>
        </div>
      </div>

      {/* Categories Accordion */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Expand a category to manage its items
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(itemsByCategory[c.id] ?? []).map((i) => (
                      <div
                        key={i.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {i.image && (
                            <img
                              src={i.image}
                              alt={i.title}
                              className="h-12 w-12 rounded-md object-cover"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium">{i.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {i.description}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {i.price} EUR
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
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
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Title"
              value={newCat.title}
              onChange={(e) => setNewCat({ ...newCat, title: e.target.value })}
            />
            <Input
              placeholder="Description (optional)"
              value={newCat.description}
              onChange={(e) =>
                setNewCat({ ...newCat, description: e.target.value })
              }
            />
            <FileUploader
              label="Image"
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
                Cancel
              </Button>
              <Button
                onClick={handleCreateCategory}
                disabled={isLoading || uploading || !newCat.title.trim()}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openEditCategory} onOpenChange={setOpenEditCategory}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Title"
              value={editCat.title}
              onChange={(e) =>
                setEditCat({ ...editCat, title: e.target.value })
              }
            />
            <Input
              placeholder="Description (optional)"
              value={editCat.description}
              onChange={(e) =>
                setEditCat({ ...editCat, description: e.target.value })
              }
            />
            <FileUploader
              label="Image"
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
                Cancel
              </Button>
              <Button
                onClick={handleUpdateCategory}
                disabled={isLoading || uploading || !editCat.title.trim()}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Item Dialogs */}
      <Dialog
        open={openAddItem != null}
        onOpenChange={(v) => setOpenAddItem(v ? openAddItem : null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Title"
              value={newItem.title}
              onChange={(e) =>
                setNewItem({ ...newItem, title: e.target.value })
              }
            />
            <Input
              placeholder="Description"
              value={newItem.description}
              onChange={(e) =>
                setNewItem({ ...newItem, description: e.target.value })
              }
            />
            <Input
              placeholder="Price"
              value={newItem.price}
              onChange={(e) =>
                setNewItem({ ...newItem, price: e.target.value })
              }
            />
            <FileUploader
              label="Image"
              value={newItem.image}
              onChange={(url) => setNewItem({ ...newItem, image: url || "" })}
              onUploadingChange={setUploading}
              meta={{
                restaurantId: restaurantId,
                entityType: "menuItem",
                entityId: openAddItem ? String(openAddItem) : undefined,
              }}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenAddItem(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateItem}
                disabled={isLoading || uploading || !newItem.title.trim()}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openEditItem != null}
        onOpenChange={(v) => setOpenEditItem(v ? openEditItem : null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          {openEditItem && (
            <div className="space-y-3">
              <Input
                placeholder="Title"
                value={openEditItem.title}
                onChange={(e) =>
                  setOpenEditItem({ ...openEditItem, title: e.target.value })
                }
              />
              <Input
                placeholder="Description"
                value={openEditItem.description}
                onChange={(e) =>
                  setOpenEditItem({
                    ...openEditItem,
                    description: e.target.value,
                  })
                }
              />
              <Input
                placeholder="Price"
                value={openEditItem.price}
                onChange={(e) =>
                  setOpenEditItem({ ...openEditItem, price: e.target.value })
                }
              />
              <FileUploader
                label="Image"
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
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpenEditItem(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateItem}
                  disabled={
                    isLoading || uploading || !openEditItem.title.trim()
                  }
                >
                  Save
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
          deleteTarget?.type === "category" ? "Delete Category" : "Delete Item"
        }
        message={`Are you sure you want to delete ${deleteTarget?.type} "${
          deleteTarget?.title ?? ""
        }"?`}
        confirmText="Delete"
        cancelText="Cancel"
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
