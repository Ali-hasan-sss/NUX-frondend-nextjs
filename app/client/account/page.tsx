"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchClientProfile,
  updateClientProfile,
  changeClientPassword,
  deleteClientAccount,
} from "@/features/client";
import { logout } from "@/features/auth/authSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  User,
  Phone,
  Mail,
  Lock,
  Save,
  Trash2,
  Loader2,
  Share2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useClientTheme } from "@/hooks/useClientTheme";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import html2canvas from "html2canvas";

export default function AccountPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDark, mounted } = useClientTheme();
  const { user } = useAppSelector((state) => state.auth);
  const { profile, loading, error } = useAppSelector(
    (state) => state.clientAccount
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [shareLoading, setShareLoading] = useState(false);
  const qrShareRef = useRef<HTMLDivElement>(null);

  // Load profile on mount
  useEffect(() => {
    if (user?.role === "USER") {
      dispatch(fetchClientProfile());
    }
  }, [dispatch, user]);

  // Update form fields when profile is loaded
  useEffect(() => {
    if (profile) {
      setName(profile.fullName || "");
      setEmail(profile.email || "");
    }
  }, [profile]);

  // Show toast when profile load fails
  useEffect(() => {
    if (error.profile) {
      toast.error(error.profile);
    }
  }, [error.profile]);

  const handleShareMyCode = useCallback(async () => {
    if (!profile?.qrCode || profile.qrCode.trim() === "" || !qrShareRef.current) return;
    setShareLoading(true);
    try {
      const canvas = await html2canvas(qrShareRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      });
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            toast.error(t("account.shareFailed"));
            setShareLoading(false);
            return;
          }
          const file = new File([blob], "my-qr-code.png", { type: "image/png" });
          const canShare =
            "share" in navigator &&
            (navigator.canShare?.({ files: [file] }) ?? true);
          if (canShare) {
            try {
              await navigator.share({
                files: [file],
                title: t("account.myQRCode"),
              });
              toast.success(t("account.shareSuccess") || "QR code shared");
            } catch (shareErr: any) {
              if (shareErr?.name !== "AbortError") {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "my-qr-code.png";
                a.click();
                URL.revokeObjectURL(url);
                toast.success(t("account.shareDownload") || "QR code saved");
              }
            }
          } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "my-qr-code.png";
            a.click();
            URL.revokeObjectURL(url);
            toast.success(t("account.shareDownload") || "QR code saved");
          }
          setShareLoading(false);
        },
        "image/png",
        1
      );
    } catch (err) {
      toast.error(t("account.shareFailed"));
      setShareLoading(false);
    }
  }, [profile?.qrCode, t]);

  if (!mounted) {
    return null;
  }

  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error(t("account.fillAllFields"));
      return;
    }

    try {
      const result = await dispatch(
        updateClientProfile({
          fullName: name.trim(),
          email: email.trim(),
        })
      );

      if (updateClientProfile.fulfilled.match(result)) {
        toast.success(t("account.profileUpdated"));
      } else {
        toast.error((result.payload as string) || t("account.failedToUpdateProfile"));
      }
    } catch (error: any) {
      toast.error(error.message || t("account.failedToUpdateProfile"));
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error(t("account.fillAllPasswordFields"));
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error(t("account.passwordsDoNotMatch"));
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t("account.passwordMinLength"));
      return;
    }

    try {
      const result = await dispatch(
        changeClientPassword({
          currentPassword,
          newPassword,
        })
      );

      if (changeClientPassword.fulfilled.match(result)) {
        toast.success(t("account.passwordUpdated"));
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        toast.error(
          (result.payload as string) || t("account.failedToUpdatePassword")
        );
      }
    } catch (error: any) {
      toast.error(error.message || t("account.failedToUpdatePassword"));
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error(t("account.enterPasswordToDelete"));
      return;
    }

    if (
      !confirm(
        t("account.deleteAccountConfirm") ||
          "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const result = await dispatch(
        deleteClientAccount({
          password: deletePassword,
        })
      );

      if (deleteClientAccount.fulfilled.match(result)) {
        toast.success(t("account.accountDeleted"));
        dispatch(logout());
        router.push("/");
      } else {
        toast.error((result.payload as string) || t("account.failedToDeleteAccount"));
      }
    } catch (error: any) {
      toast.error(error.message || t("account.failedToDeleteAccount"));
    }
  };

  if (loading.profile) {
    return (
      <div className="min-h-screen bg-transparent pb-20 px-5 py-5 flex items-center justify-center">
        <Loader2
          className="h-8 w-8 animate-spin"
          style={{ color: colors.primary }}
        />
      </div>
    );
  }

  if (error.profile) {
    return (
      <div className="min-h-screen bg-transparent pb-20 px-5 py-5 flex flex-col items-center justify-center gap-4">
        <p className="text-center" style={{ color: colors.textSecondary }}>
          {error.profile}
        </p>
        <Button
          onClick={() => dispatch(fetchClientProfile())}
          style={{ backgroundColor: colors.primary }}
        >
          {t("home.retry")}
        </Button>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-transparent pb-20 px-5 py-5">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
          {t("account.title")}
        </h1>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div
          className={cn(
            "rounded-2xl p-5 shadow-lg",
            isDark ? "bg-white/10" : "bg-white"
          )}
          style={{ backgroundColor: colors.surface }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: colors.text }}>
            {t("account.profile")}
          </h2>

          {/* Name Input */}
          <div
            className="flex items-center gap-3 mb-4 pb-3 border-b"
            style={{ borderColor: colors.border }}
          >
            <User className="h-5 w-5" style={{ color: colors.textSecondary }} />
            <Input
              type="text"
              placeholder={t("account.name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(
                "flex-1 border-0 bg-transparent",
                isDark ? "text-white" : "text-gray-900"
              )}
              style={{ color: colors.text }}
            />
          </div>

          {/* Email Input */}
          <div
            className="flex items-center gap-3 mb-4 pb-3 border-b"
            style={{ borderColor: colors.border }}
          >
            <Mail className="h-5 w-5" style={{ color: colors.textSecondary }} />
            <Input
              type="email"
              placeholder={t("account.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                "flex-1 border-0 bg-transparent",
                isDark ? "text-white" : "text-gray-900"
              )}
              style={{ color: colors.text }}
            />
          </div>

          {/* Phone Input */}
          <div
            className="flex items-center gap-3 mb-4 pb-3 border-b"
            style={{ borderColor: colors.border }}
          >
            <Phone
              className="h-5 w-5"
              style={{ color: colors.textSecondary }}
            />
            <Input
              type="tel"
              placeholder={t("account.phone")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={cn(
                "flex-1 border-0 bg-transparent",
                isDark ? "text-white" : "text-gray-900"
              )}
              style={{ color: colors.text }}
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSaveProfile}
            disabled={loading.updateProfile}
            className="w-full"
            style={{
              backgroundColor: colors.primary,
              color: "white",
            }}
          >
            {loading.updateProfile ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("account.saving")}...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t("account.save")}
              </>
            )}
          </Button>
        </div>

        {/* Change Password Section */}
        <div
          className={cn(
            "rounded-2xl p-5 shadow-lg",
            isDark ? "bg-white/10" : "bg-white"
          )}
          style={{ backgroundColor: colors.surface }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: colors.text }}>
            {t("account.updatePassword")}
          </h2>

          {/* Current Password */}
          <div
            className="flex items-center gap-3 mb-4 pb-3 border-b"
            style={{ borderColor: colors.border }}
          >
            <Lock className="h-5 w-5" style={{ color: colors.textSecondary }} />
            <Input
              type="password"
              placeholder={t("account.currentPassword")}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={cn(
                "flex-1 border-0 bg-transparent",
                isDark ? "text-white" : "text-gray-900"
              )}
              style={{ color: colors.text }}
            />
          </div>

          {/* New Password */}
          <div
            className="flex items-center gap-3 mb-4 pb-3 border-b"
            style={{ borderColor: colors.border }}
          >
            <Lock className="h-5 w-5" style={{ color: colors.textSecondary }} />
            <Input
              type="password"
              placeholder={t("account.newPassword")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={cn(
                "flex-1 border-0 bg-transparent",
                isDark ? "text-white" : "text-gray-900"
              )}
              style={{ color: colors.text }}
            />
          </div>

          {/* Confirm New Password */}
          <div
            className="flex items-center gap-3 mb-4 pb-3 border-b"
            style={{ borderColor: colors.border }}
          >
            <Lock className="h-5 w-5" style={{ color: colors.textSecondary }} />
            <Input
              type="password"
              placeholder={t("account.confirmNewPassword")}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className={cn(
                "flex-1 border-0 bg-transparent",
                isDark ? "text-white" : "text-gray-900"
              )}
              style={{ color: colors.text }}
            />
          </div>

          {/* Update Password Button */}
          <Button
            onClick={handleUpdatePassword}
            disabled={loading.changePassword}
            className="w-full"
            style={{
              backgroundColor: colors.secondary,
              color: "white",
            }}
          >
            {loading.changePassword ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("account.updating")}...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                {t("account.updatePassword")}
              </>
            )}
          </Button>
        </div>

        {/* QR Code Section */}
        <div
          className={cn(
            "rounded-2xl p-5 shadow-lg",
            isDark ? "bg-white/10" : "bg-white"
          )}
          style={{ backgroundColor: colors.surface }}
        >
          <h2 className="text-lg font-bold mb-2" style={{ color: colors.text }}>
            {t("account.myQRCode")}
          </h2>
          <p className="text-sm mb-5" style={{ color: colors.textSecondary }}>
            {t("account.qrCodeDesc")}
          </p>

          {profile.qrCode && profile.qrCode.trim() !== "" ? (
            <div className="flex flex-col items-center">
              <div
                ref={qrShareRef}
                className="inline-flex flex-col items-center p-5 rounded-xl bg-white shadow-md"
              >
                <QRCodeSVG
                  value={profile.qrCode}
                  size={200}
                  fgColor="#000000"
                  bgColor="#ffffff"
                  level="M"
                  includeMargin={true}
                />
                {profile.fullName && (
                  <p className="mt-3 font-semibold text-gray-900 text-base">
                    {profile.fullName}
                  </p>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  {user?.email || profile.email}
                </p>
              </div>
              <Button
                onClick={handleShareMyCode}
                disabled={shareLoading}
                variant="outline"
                className="w-full mt-4 gap-2 transition-colors hover:!bg-primary hover:!text-white hover:!border-primary max-w-[320px]"
                style={{
                  borderColor: colors.primary,
                  color: colors.primary,
                }}
              >
                {shareLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Share2 className="h-5 w-5" />
                )}
                {shareLoading
                  ? t("common.loading")
                  : t("account.shareCode")}
              </Button>
            </div>
          ) : (
            <div className="flex justify-center items-center p-5 rounded-xl bg-white w-[200px] h-[200px] mx-auto">
              <p className="text-sm text-gray-500">
                {loading.profile
                  ? t("common.loading")
                  : t("account.noQRCode")}
              </p>
            </div>
          )}
        </div>

        {/* Delete Account Section */}
        <div
          className={cn(
            "rounded-2xl p-5 shadow-lg",
            isDark ? "bg-white/10" : "bg-white"
          )}
          style={{ backgroundColor: colors.surface }}
        >
          <h2 className="text-lg font-bold mb-2" style={{ color: colors.text }}>
            {t("account.dangerZone")}
          </h2>
          <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
            {t("account.deleteAccountWarning")}
          </p>

          {/* Delete Password */}
          <div
            className="flex items-center gap-3 mb-4 pb-3 border-b"
            style={{ borderColor: colors.border }}
          >
            <Lock className="h-5 w-5" style={{ color: colors.textSecondary }} />
            <Input
              type="password"
              placeholder={t("account.enterPasswordToDelete")}
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className={cn(
                "flex-1 border-0 bg-transparent",
                isDark ? "text-white" : "text-gray-900"
              )}
              style={{ color: colors.text }}
            />
          </div>

          {/* Delete Button */}
          <Button
            onClick={handleDeleteAccount}
            disabled={loading.deleteAccount}
            className="w-full"
            style={{
              backgroundColor: colors.error,
              color: "white",
            }}
          >
            {loading.deleteAccount ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("account.deleting")}...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                {t("account.deleteAccount")}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
