"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchClientProfile,
  updateClientProfile,
  changeClientPassword,
} from "@/features/client";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Mail,
  Lock,
  Save,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export function AdminSettingsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { profile, loading, error } = useAppSelector(
    (state) => state.clientAccount
  );

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const isAdminOrSubAdmin = user?.role === "ADMIN" || user?.role === "SUBADMIN";

  useEffect(() => {
    if (isAdminOrSubAdmin) {
      dispatch(fetchClientProfile());
    }
  }, [dispatch, isAdminOrSubAdmin]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setEmail(profile.email || "");
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast({
        title: t("error"),
        description: t("adminSettingsFillAllFields"),
        variant: "destructive",
      });
      return;
    }
    try {
      await dispatch(
        updateClientProfile({
          fullName: fullName.trim(),
          email: email.trim(),
        })
      ).unwrap();
      toast({
        title: t("success"),
        description: t("adminSettingsProfileUpdated"),
      });
    } catch (err: any) {
      toast({
        title: t("error"),
        description: err || t("adminSettingsFailedToUpdateProfile"),
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: t("error"),
        description: t("adminSettingsFillAllPasswordFields"),
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: t("error"),
        description: t("adminSettingsPasswordsDoNotMatch"),
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 8) {
      toast({
        title: t("error"),
        description: t("adminSettingsPasswordMinLength"),
        variant: "destructive",
      });
      return;
    }
    try {
      await dispatch(
        changeClientPassword({
          currentPassword,
          newPassword,
        })
      ).unwrap();
      toast({
        title: t("success"),
        description: t("adminSettingsPasswordUpdated"),
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({
        title: t("error"),
        description: err || t("adminSettingsFailedToUpdatePassword"),
        variant: "destructive",
      });
    }
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  if (!isAdminOrSubAdmin) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{t("adminSettingsAccessDenied")}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading.profile) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error.profile) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.profile}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t("adminSettingsTitle")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("adminSettingsDescription")}
        </p>
      </div>

      {/* Personal data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t("adminSettingsProfile")}
          </CardTitle>
          <CardDescription>{t("adminSettingsProfileDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t("adminSettingsFullName")}</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("adminSettingsFullNamePlaceholder")}
                className="max-w-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("adminSettingsEmailPlaceholder")}
                className="max-w-md"
              />
            </div>
            <Button type="submit" disabled={loading.updateProfile}>
              {loading.updateProfile ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("adminSettingsSaving")}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t("adminSettingsSaveProfile")}
                </>
              )}
            </Button>
            {error.updateProfile && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error.updateProfile}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {t("adminSettingsChangePassword")}
          </CardTitle>
          <CardDescription>
            {t("adminSettingsChangePasswordDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2 max-w-md">
              <Label htmlFor="currentPassword">
                {t("adminSettingsCurrentPassword")}
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={t("adminSettingsCurrentPasswordPlaceholder")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => togglePasswordVisibility("current")}
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2 max-w-md">
              <Label htmlFor="newPassword">
                {t("adminSettingsNewPassword")}
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t("adminSettingsNewPasswordPlaceholder")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => togglePasswordVisibility("new")}
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2 max-w-md">
              <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("adminSettingsConfirmPasswordPlaceholder")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => togglePasswordVisibility("confirm")}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" disabled={loading.changePassword}>
              {loading.changePassword ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("adminSettingsUpdating")}
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  {t("adminSettingsUpdatePassword")}
                </>
              )}
            </Button>
            {error.changePassword && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error.changePassword}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
