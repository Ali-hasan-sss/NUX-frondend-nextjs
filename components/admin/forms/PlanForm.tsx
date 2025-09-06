"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export interface PlanFormInput {
  id?: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  duration: number;
  isActive: boolean;
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
