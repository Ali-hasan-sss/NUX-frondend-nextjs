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
import { Eye, EyeOff } from "lucide-react";

export interface UserFormInput {
  email: string;
  password?: string;
  fullName: string;
  role: "ADMIN" | "RESTAURANT_OWNER" | "USER";
  isActive: boolean;
}

interface UserFormProps {
  initialData?: UserFormInput;
  onSubmit: (data: UserFormInput) => Promise<void>;
  onClose: () => void;
  submitLabel?: string;
}

export function UserForm({
  initialData,
  onSubmit,
  onClose,
  submitLabel = "Save",
}: UserFormProps) {
  const [formData, setFormData] = useState<UserFormInput>(
    initialData || {
      email: "",
      password: "",
      fullName: "",
      role: "USER",
      isActive: true,
    }
  );
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (key: keyof UserFormInput, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      // onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleFocusSelectAll = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* name */}
      <div className="space-y-2">
        <Label htmlFor="fullName">fullName</Label>
        <Input
          id="title"
          value={formData.fullName}
          onChange={(e) => handleChange("fullName", e.target.value)}
          required
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          id="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          required
        />
      </div>
      {/* Password */}
      {!initialData && (
        <div className="space-y-2">
          <Label>Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Role */}
      <div className="flex items-center w-full justify-between">
        <div className="w-32 space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={formData.role}
            onValueChange={(val: string) => handleChange("role", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">user</SelectItem>
              <SelectItem value="RESTAURANT_OWNER">restaurant owner</SelectItem>
              <SelectItem value="ADMIN">admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Active */}
        <div className="flex items-center mt-3 space-x-2">
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
