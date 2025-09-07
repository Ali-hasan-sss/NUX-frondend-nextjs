"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { axiosInstance } from "@/utils/axiosInstance";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UploadCloud, X, ImagePlus } from "lucide-react";

type UploadMeta = {
  folder?: string;
  restaurantId?: string;
  entityType?: string;
  entityId?: string;
};

type Props = {
  value?: string | null;
  onChange: (
    url: string | null,
    payload?: { publicId?: string; width?: number; height?: number }
  ) => void;
  onUploadingChange?: (uploading: boolean) => void;
  disabled?: boolean;
  label?: string;
  accept?: string; // e.g. "image/*"
  maxSizeMb?: number; // default 5MB
  meta?: UploadMeta;
  className?: string;
  rounded?: "full" | "md";
};

export default function FileUploader({
  value,
  onChange,
  onUploadingChange,
  disabled,
  label = "Upload",
  accept = "image/*",
  maxSizeMb = 5,
  meta,
  className,
  rounded = "md",
}: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(value ?? null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setPreviewUrl(value ?? null);
  }, [value]);

  useEffect(() => {
    onUploadingChange?.(isUploading);
  }, [isUploading, onUploadingChange]);

  const doUpload = useCallback(
    async (file: File) => {
      setError(null);
      if (file.size > maxSizeMb * 1024 * 1024) {
        setError(`File exceeds max size ${maxSizeMb}MB`);
        return;
      }
      setIsUploading(true);
      try {
        const form = new FormData();
        form.append("file", file);
        if (meta?.folder) form.append("folder", meta.folder);
        if (meta?.restaurantId) form.append("restaurantId", meta.restaurantId);
        if (meta?.entityType) form.append("entityType", meta.entityType);
        if (meta?.entityId) form.append("entityId", meta.entityId);

        const res = await axiosInstance.post("/uploadFile", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const data = res?.data?.data;
        const url: string | undefined = data?.url;
        if (!url) throw new Error("Upload failed");
        setPreviewUrl(url);
        onChange(url, {
          publicId: data?.public_id,
          width: data?.width,
          height: data?.height,
        });
      } catch (e: any) {
        setError(e?.message || "Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [maxSizeMb, meta, onChange]
  );

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    void doUpload(file);
    // reset input so same file can be selected again if needed
    e.currentTarget.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) void doUpload(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !isUploading) setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const clear = () => {
    setPreviewUrl(null);
    onChange(null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <div className="text-sm font-medium text-foreground">{label}</div>
      ) : null}

      <div
        className={cn(
          "relative border-2 border-dashed rounded-md p-4 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/30",
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() =>
          !disabled && !isUploading && fileInputRef.current?.click()
        }
      >
        {!previewUrl ? (
          <div className="flex flex-col items-center justify-center text-muted-foreground gap-2 py-6">
            <UploadCloud className="h-6 w-6" />
            <div className="text-sm">Drag & drop here or click to select</div>
            <div className="text-[11px]">
              Supported types: images • Max size {maxSizeMb}MB
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "overflow-hidden bg-muted",
                rounded === "full"
                  ? "rounded-full h-16 w-16"
                  : "rounded-md h-20 w-20"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="uploaded"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="h-4 w-4 mr-1" /> Change
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled || isUploading}
                onClick={clear}
              >
                <X className="h-4 w-4 mr-1" /> Remove
              </Button>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center rounded-md">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleSelect}
          disabled={disabled || isUploading}
        />
      </div>

      {error ? <div className="text-xs text-red-600">{error}</div> : null}
    </div>
  );
}
