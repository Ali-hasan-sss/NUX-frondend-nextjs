"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { axiosInstance } from "@/utils/axiosInstance";
import { cn, getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UploadCloud, X, ImagePlus } from "lucide-react";
import { useTranslation } from "react-i18next";

/** Max width/height (match server). Quality 0-1. */
const MAX_IMAGE_DIMENSION = 1920;
const COMPRESS_QUALITY = 0.82;

/**
 * Compress image in the browser before upload. Returns original file if not an image or compression fails.
 */
async function compressImageIfNeeded(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  const accepted = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!accepted.includes(file.type)) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (w <= 0 || h <= 0) {
        resolve(file);
        return;
      }
      let targetW = w;
      let targetH = h;
      if (w > MAX_IMAGE_DIMENSION || h > MAX_IMAGE_DIMENSION) {
        if (w >= h) {
          targetW = MAX_IMAGE_DIMENSION;
          targetH = Math.round((h * MAX_IMAGE_DIMENSION) / w);
        } else {
          targetH = MAX_IMAGE_DIMENSION;
          targetW = Math.round((w * MAX_IMAGE_DIMENSION) / h);
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, targetW, targetH);
      const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const name = file.name.replace(/\.[^.]+$/, "") + (mime === "image/png" ? ".png" : ".jpg");
          resolve(new File([blob], name, { type: mime }));
        },
        mime,
        COMPRESS_QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

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
  label,
  accept = "image/*",
  maxSizeMb = 5,
  meta,
  className,
  rounded = "md",
}: Props) {
  const { t } = useTranslation();
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
        setError(`${t("dashboard.fileUpload.fileExceedsMaxSize")} ${maxSizeMb}MB`);
        return;
      }
      setIsUploading(true);
      try {
        const fileToUpload = await compressImageIfNeeded(file);
        const form = new FormData();
        form.append("file", fileToUpload);
        if (meta?.folder) form.append("folder", meta.folder);
        if (meta?.restaurantId) form.append("restaurantId", meta.restaurantId);
        if (meta?.entityType) form.append("entityType", meta.entityType);
        if (meta?.entityId) form.append("entityId", meta.entityId);

        const res = await axiosInstance.post("/uploadFile", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const data = res?.data?.data;
        const url: string | undefined = data?.url ?? data?.path;
        if (!url) throw new Error(t("dashboard.fileUpload.uploadFailed"));
        setPreviewUrl(url);
        onChange(url, {
          publicId: data?.public_id,
          width: data?.width,
          height: data?.height,
        });
      } catch (e: any) {
        setError(e?.message || t("dashboard.fileUpload.uploadFailed"));
      } finally {
        setIsUploading(false);
      }
    },
    [maxSizeMb, meta, onChange, t]
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
            <div className="text-sm">{t("dashboard.fileUpload.dragDropOrClick")}</div>
            <div className="text-[11px]">
              {t("dashboard.fileUpload.supportedTypes")} {maxSizeMb}MB
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
                src={getImageUrl(previewUrl, axiosInstance.defaults.baseURL)}
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
                <ImagePlus className="h-4 w-4 mr-1" /> {t("dashboard.fileUpload.change")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled || isUploading}
                onClick={clear}
              >
                <X className="h-4 w-4 mr-1" /> {t("dashboard.fileUpload.remove")}
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
