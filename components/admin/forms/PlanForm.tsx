"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Plus, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import {
  PERMISSION_TYPES,
  PERMISSION_LABELS,
  PERMISSION_CATEGORIES,
} from "@/features/admin/plans/permissionsConstants";
import { PlanPermission } from "@/features/admin/plans/adminPlansTypes";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export interface PlanFormInput {
  id?: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  duration: number;
  isActive: boolean;
  permissions: PlanPermission[];
}

interface PlanFormProps {
  initialData?: PlanFormInput;
  onSubmit: (data: PlanFormInput) => Promise<void>;
  onClose: () => void;
  submitLabel?: string;
}

export function PlanForm({
  initialData,
  onSubmit,
  onClose,
  submitLabel = "Save",
}: PlanFormProps) {
  const [formData, setFormData] = useState<PlanFormInput>(
    initialData || {
      title: "",
      description: "",
      price: 0,
      currency: "USD",
      duration: 30,
      isActive: true,
      permissions: [],
    }
  );
  const [loading, setLoading] = useState(false);

  const handleChange = (key: keyof PlanFormInput, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleFocusSelectAll = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const addPermission = (type: string) => {
    const newPermission: PlanPermission = {
      id: Date.now(), // Temporary ID for new permissions
      type,
      value: null,
      isUnlimited: true, // Default to unlimited
    };
    setFormData((prev) => ({
      ...prev,
      permissions: [...prev.permissions, newPermission],
    }));
  };

  const addAllPermissions = () => {
    const availablePermissions = getAvailablePermissions();
    const newPermissions: PlanPermission[] = availablePermissions.map(
      (type) => ({
        id: Date.now() + Math.random(), // Unique ID for each permission
        type,
        value: null,
        isUnlimited: true, // Default to unlimited
      })
    );
    setFormData((prev) => ({
      ...prev,
      permissions: [...prev.permissions, ...newPermissions],
    }));
  };

  const updatePermission = (
    index: number,
    updates: Partial<PlanPermission>
  ) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.map((perm, i) =>
        i === index ? { ...perm, ...updates } : perm
      ),
    }));
  };

  const removePermission = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.filter((_, i) => i !== index),
    }));
  };

  const getAvailablePermissions = () => {
    const usedTypes = formData.permissions.map((p) => p.type);
    return Object.values(PERMISSION_TYPES).filter(
      (type) => !usedTypes.includes(type)
    );
  };

  const togglePermission = (type: string) => {
    const existingIndex = formData.permissions.findIndex(
      (p) => p.type === type
    );
    if (existingIndex >= 0) {
      removePermission(existingIndex);
    } else {
      addPermission(type);
    }
  };

  const isPermissionSelected = (type: string) => {
    return formData.permissions.some((p) => p.type === type);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          required
        />
      </div>

      {/* Description with Quill */}
      <div className="space-y-2">
        <Label>Description</Label>
        <ReactQuill
          value={formData.description}
          onChange={(val) => handleChange("description", val)}
          theme="snow"
        />
      </div>

      {/* Price & Currency */}
      <div className="flex space-x-2">
        <div className="flex-1">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => handleChange("price", parseFloat(e.target.value))}
            onFocus={handleFocusSelectAll}
            required
          />
        </div>

        <div className="w-32">
          <Label htmlFor="currency">Currency</Label>
          <Select
            value={formData.currency}
            onValueChange={(val: string) => handleChange("currency", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="JPY">JPY</SelectItem>
              <SelectItem value="AUD">AUD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Duration & Active */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Label htmlFor="duration">Duration (days)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) => handleChange("duration", parseInt(e.target.value))}
            onFocus={handleFocusSelectAll}
            required
          />
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="isActive">Active</Label>
          <Switch
            checked={formData.isActive}
            onCheckedChange={(val) => handleChange("isActive", val)}
          />
        </div>
      </div>

      <Separator />

      {/* Permissions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permissions
          </Label>
          {getAvailablePermissions().length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAllPermissions}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Select All
            </Button>
          )}
        </div>

        {/* Permission Categories with Checkboxes */}
        <div className="space-y-4">
          {Object.entries(PERMISSION_CATEGORIES).map(([category, types]) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  {category}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {types.map((type) => (
                  <div
                    key={type}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={`permission-${type}`}
                      checked={isPermissionSelected(type)}
                      onCheckedChange={() => togglePermission(type)}
                    />
                    <Label
                      htmlFor={`permission-${type}`}
                      className="flex-1 cursor-pointer font-medium"
                    >
                      {PERMISSION_LABELS[
                        type as keyof typeof PERMISSION_LABELS
                      ] || type}
                    </Label>
                    {isPermissionSelected(type) && (
                      <Badge variant="secondary" className="text-xs">
                        Selected
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Permissions Configuration */}
        {formData.permissions.length > 0 && (
          <div className="space-y-4">
            <div className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Configure Selected Permissions ({formData.permissions.length})
            </div>
            <div className="space-y-3">
              {formData.permissions.map((permission, index) => (
                <Card key={permission.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <div className="font-medium">
                          {PERMISSION_LABELS[
                            permission.type as keyof typeof PERMISSION_LABELS
                          ] || permission.type}
                        </div>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`unlimited-${index}`}
                              checked={permission.isUnlimited}
                              onCheckedChange={(checked) =>
                                updatePermission(index, {
                                  isUnlimited: Boolean(checked),
                                })
                              }
                            />
                            <Label
                              htmlFor={`unlimited-${index}`}
                              className="text-sm"
                            >
                              Unlimited
                            </Label>
                          </div>
                          {!permission.isUnlimited && (
                            <div className="flex items-center space-x-2">
                              <Label
                                htmlFor={`value-${index}`}
                                className="text-sm"
                              >
                                Limit:
                              </Label>
                              <Input
                                id={`value-${index}`}
                                type="number"
                                value={permission.value || ""}
                                onChange={(e) =>
                                  updatePermission(index, {
                                    value: e.target.value
                                      ? parseInt(e.target.value)
                                      : null,
                                  })
                                }
                                className="w-20"
                                min="1"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePermission(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
