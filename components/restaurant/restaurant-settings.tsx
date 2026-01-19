"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useTranslation } from "react-i18next";
import {
  fetchRestaurantAccount,
  updateRestaurantAccount,
  updateRestaurantStatus,
} from "@/features/restaurant/restaurantAccount/restaurantAccountThunks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Building2,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import GoogleMapPicker from "@/components/common/GoogleMapPicker";
import FileUploader from "@/components/upload/file-uploader";
import { cn } from "@/lib/utils";

type RestaurantFormData = {
  name: string;
  address: string;
  latitude: number | string;
  longitude: number | string;
  logo: string;
  isActive: boolean;
};

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const initialRestaurantForm: RestaurantFormData = {
  name: "",
  address: "",
  latitude: "",
  longitude: "",
  logo: "",
  isActive: true,
};

const initialPasswordForm: PasswordFormData = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function RestaurantSettings() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const isRTL = i18n.language === "ar";
  const {
    data: restaurant,
    isLoading,
    error,
  } = useAppSelector((state) => state.restaurantAccount);

  const [restaurantForm, setRestaurantForm] = useState<RestaurantFormData>(
    initialRestaurantForm
  );
  const [passwordForm, setPasswordForm] =
    useState<PasswordFormData>(initialPasswordForm);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isLocationFormOpen, setIsLocationFormOpen] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Load restaurant data on component mount
  useEffect(() => {
    dispatch(fetchRestaurantAccount());
  }, [dispatch]);

  // Update form when restaurant data loads
  useEffect(() => {
    if (restaurant) {
      setRestaurantForm({
        name: restaurant.name || "",
        address: restaurant.address || "",
        latitude: restaurant.latitude || "",
        longitude: restaurant.longitude || "",
        logo: restaurant.logo || "",
        isActive: restaurant.isActive ?? true,
      });
    }
  }, [restaurant]);

  const handleRestaurantFormChange = (
    field: keyof RestaurantFormData,
    value: any
  ) => {
    setRestaurantForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordFormChange = (
    field: keyof PasswordFormData,
    value: string
  ) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRestaurantUpdate = async () => {
    if (!restaurant) return;

    setIsUpdating(true);
    try {
      await dispatch(
        updateRestaurantAccount({
          name: restaurantForm.name,
          address: restaurantForm.address,
          latitude: Number(restaurantForm.latitude),
          longitude: Number(restaurantForm.longitude),
          logo: restaurantForm.logo,
        })
      ).unwrap();

      toast.success(t("dashboard.settings.restaurantSettingsUpdated"));
    } catch (error: any) {
      toast.error(error.message || t("dashboard.settings.failedToUpdateSettings"));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!restaurant) return;

    setIsUpdatingStatus(true);
    try {
      await dispatch(
        updateRestaurantStatus({ isActive: !restaurantForm.isActive })
      ).unwrap();

      setRestaurantForm((prev) => ({
        ...prev,
        isActive: !prev.isActive,
      }));

      toast.success(
        restaurantForm.isActive
          ? "Restaurant closed successfully"
          : "Restaurant opened successfully"
      );
    } catch (error: any) {
      toast.error(error.message || t("dashboard.settings.failedToUpdateStatus"));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCopyQRCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("QR code copied to clipboard");
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t("dashboard.settings.passwordsDoNotMatch"));
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error(t("dashboard.settings.passwordMinLength"));
      return;
    }

    // TODO: Implement password change API call
    toast.info("Password change functionality will be implemented soon");
    setIsPasswordDialogOpen(false);
    setPasswordForm(initialPasswordForm);
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleEditRestaurantInfo = () => {
    setIsEditFormOpen(true);
  };

  const handleEditLocation = () => {
    setIsLocationFormOpen(true);
  };

  const handleLocationConfirm = (coords: {
    latitude: number;
    longitude: number;
  }) => {
    setRestaurantForm((prev) => ({
      ...prev,
      latitude: coords.latitude,
      longitude: coords.longitude,
    }));
    setIsMapPickerOpen(false);
    // Reopen the location form to show the updated coordinates
    setTimeout(() => {
      setIsLocationFormOpen(true);
    }, 100);
  };

  const handleSaveRestaurantInfo = async () => {
    if (!restaurant) return;

    setIsUpdating(true);
    try {
      await dispatch(
        updateRestaurantAccount({
          name: restaurantForm.name,
          address: restaurantForm.address,
          logo: restaurantForm.logo,
        })
      ).unwrap();

      toast.success("Restaurant information updated successfully");
      setIsEditFormOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update restaurant information");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!restaurant) return;

    setIsUpdating(true);
    try {
      await dispatch(
        updateRestaurantAccount({
          latitude: Number(restaurantForm.latitude),
          longitude: Number(restaurantForm.longitude),
        })
      ).unwrap();

      // Update the restaurant data in Redux store
      dispatch(fetchRestaurantAccount());

      toast.success("Restaurant location updated successfully");
      setIsLocationFormOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update restaurant location");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading && !restaurant) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <p>Loading restaurant settings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Error loading settings: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          {t("dashboard.settings.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("dashboard.settings.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Restaurant Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>{t("dashboard.settings.restaurantInformation")}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditRestaurantInfo}
              >
                <Settings className="h-4 w-4 mr-2" />
                {t("dashboard.settings.edit")}
              </Button>
            </CardTitle>
            <CardDescription>
              {t("dashboard.settings.viewRestaurantInfo")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Restaurant Logo Display */}
            <div className="space-y-2">
              <Label>{t("dashboard.settings.logo")}</Label>
              {restaurantForm.logo ? (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="overflow-hidden bg-muted rounded-md h-16 w-16">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={restaurantForm.logo}
                      alt="Restaurant logo"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t("dashboard.settings.logoUploaded")}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t("dashboard.settings.noLogoUploaded")}
                  </div>
                </div>
              )}
            </div>

            {/* Restaurant Name Display */}
            <div className="space-y-2">
              <Label>{t("dashboard.settings.restaurantName")}</Label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">
                  {restaurantForm.name || t("dashboard.settings.notSet")}
                </p>
              </div>
            </div>

            {/* Address Display */}
            <div className="space-y-2">
              <Label>{t("dashboard.settings.address")}</Label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">{restaurantForm.address || t("dashboard.settings.notSet")}</p>
              </div>
            </div>

            {/* Location Display */}
            <div className="space-y-2">
              <Label>{t("dashboard.settings.location")}</Label>
              <div className="p-3 bg-muted rounded-lg">
                {restaurantForm.latitude !== 0 &&
                restaurantForm.longitude !== 0 ? (
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <p className="font-medium">{t("dashboard.settings.coordinates")}:</p>
                      <p className="text-muted-foreground">
                        Lat: {Number(restaurantForm.latitude).toFixed(6)}, Lng:{" "}
                        {Number(restaurantForm.longitude).toFixed(6)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditLocation}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      {t("dashboard.settings.editLocation")}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {t("dashboard.settings.noLocationSet")}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditLocation}
                    >
                      <MapPin className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                      {t("dashboard.settings.setLocation")}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Restaurant Status */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="isActive" className="text-base font-medium">
                  {t("dashboard.settings.restaurantStatus")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {restaurantForm.isActive
                    ? t("dashboard.settings.restaurantStatusActive")
                    : t("dashboard.settings.restaurantStatusClosed")}
                </p>
              </div>
              <Switch
                id="isActive"
                checked={restaurantForm.isActive}
                onCheckedChange={handleStatusToggle}
                disabled={isUpdatingStatus}
              />
            </div>
          </CardContent>
        </Card>

        {/* QR Codes & Security */}
        <div className="space-y-6">
          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>{t("dashboard.settings.security")}</span>
              </CardTitle>
              <CardDescription>{t("dashboard.settings.securityDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsPasswordDialogOpen(true)}
              >
                <Lock className="h-4 w-4 mr-2" />
                {t("dashboard.settings.changePasswordButton")}
              </Button>
            </CardContent>
          </Card>

          {/* Status Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>{t("dashboard.settings.statusInformation")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("dashboard.settings.restaurantStatus")}</span>
                <Badge
                  variant={restaurantForm.isActive ? "default" : "secondary"}
                >
                  {restaurantForm.isActive ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {t("dashboard.settings.active")}
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {t("dashboard.settings.closed")}
                    </>
                  )}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("dashboard.settings.subscription")}</span>
                <Badge
                  variant={
                    restaurant?.isSubscriptionActive ? "default" : "secondary"
                  }
                >
                  {restaurant?.isSubscriptionActive ? t("dashboard.settings.subscriptionActive") : t("dashboard.settings.subscriptionInactive")}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("dashboard.settings.groupMembership")}</span>
                <Badge
                  variant={restaurant?.isGroupMember ? "default" : "secondary"}
                >
                  {restaurant?.isGroupMember ? t("dashboard.settings.member") : t("dashboard.settings.notAMember")}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("dashboard.settings.created")}</span>
                <span className="text-sm text-muted-foreground">
                  {restaurant?.createdAt
                    ? new Date(restaurant.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Password Change Dialog */}
      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("dashboard.settings.changePasswordTitle")}</DialogTitle>
            <DialogDescription>
              {t("dashboard.settings.changePasswordDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">{t("dashboard.settings.currentPassword")}</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    handlePasswordFormChange("currentPassword", e.target.value)
                  }
                  placeholder={t("dashboard.settings.currentPasswordPlaceholder")}
                  className={isRTL ? "pl-10" : "pr-10"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "absolute top-0 h-full px-3 py-2 hover:bg-transparent",
                    isRTL ? "left-0" : "right-0"
                  )}
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

            <div className="space-y-2">
              <Label htmlFor="newPassword">{t("dashboard.settings.newPassword")}</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    handlePasswordFormChange("newPassword", e.target.value)
                  }
                  placeholder={t("dashboard.settings.newPasswordPlaceholder")}
                  className={isRTL ? "pl-10" : "pr-10"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "absolute top-0 h-full px-3 py-2 hover:bg-transparent",
                    isRTL ? "left-0" : "right-0"
                  )}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("dashboard.settings.confirmPassword")}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    handlePasswordFormChange("confirmPassword", e.target.value)
                  }
                  placeholder={t("dashboard.settings.confirmPasswordPlaceholder")}
                  className={isRTL ? "pl-10" : "pr-10"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "absolute top-0 h-full px-3 py-2 hover:bg-transparent",
                    isRTL ? "left-0" : "right-0"
                  )}
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
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsPasswordDialogOpen(false);
                setPasswordForm(initialPasswordForm);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handlePasswordChange}>Change Password</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Restaurant Information Dialog */}
      <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Restaurant Information</DialogTitle>
            <DialogDescription>
              Update your restaurant's basic information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Restaurant Name</Label>
              <Input
                id="editName"
                value={restaurantForm.name}
                onChange={(e) =>
                  handleRestaurantFormChange("name", e.target.value)
                }
                placeholder="Enter restaurant name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editAddress">Address</Label>
              <Textarea
                id="editAddress"
                value={restaurantForm.address}
                onChange={(e) =>
                  handleRestaurantFormChange("address", e.target.value)
                }
                placeholder="Enter restaurant address"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <FileUploader
                label="Restaurant Logo"
                value={restaurantForm.logo}
                onChange={(url) =>
                  handleRestaurantFormChange("logo", url || "")
                }
                onUploadingChange={setIsUploadingLogo}
                accept="image/*"
                maxSizeMb={5}
                meta={{
                  folder: "restaurant-logos",
                  entityType: "restaurant",
                  entityId: restaurant?.id,
                }}
                rounded="md"
              />
            </div>
          </div>
          <div className={cn("flex justify-end gap-2", isRTL ? "flex-row-reverse" : "")}>
            <Button variant="outline" onClick={() => setIsEditFormOpen(false)}>
              {t("dashboard.settings.cancel")}
            </Button>
            <Button
              onClick={handleSaveRestaurantInfo}
              disabled={isUpdating || isUploadingLogo}
            >
              {isUpdating ? (
                <>
                  <div className={cn("animate-spin rounded-full h-4 w-4 border-b-2 border-white", isRTL ? "ml-2" : "mr-2")}></div>
                  {t("dashboard.settings.saving")}
                </>
              ) : isUploadingLogo ? (
                <>
                  <div className={cn("animate-spin rounded-full h-4 w-4 border-b-2 border-white", isRTL ? "ml-2" : "mr-2")}></div>
                  {t("dashboard.settings.uploading")}
                </>
              ) : (
                <>
                  <Save className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  {t("dashboard.settings.saveChanges")}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Location Dialog */}
      <Dialog open={isLocationFormOpen} onOpenChange={setIsLocationFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("dashboard.settings.editLocationTitle")}</DialogTitle>
            <DialogDescription>
              {t("dashboard.settings.editLocationDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("dashboard.settings.currentLocation")}</Label>
              <div className="p-3 bg-muted rounded-lg">
                {restaurantForm.latitude !== 0 &&
                restaurantForm.longitude !== 0 ? (
                  <div className="text-sm">
                    <p className="font-medium">{t("dashboard.settings.currentCoordinates")}:</p>
                    <p className="text-muted-foreground">
                      Lat: {Number(restaurantForm.latitude).toFixed(6)}, Lng:{" "}
                      {Number(restaurantForm.longitude).toFixed(6)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("dashboard.settings.noLocationSet")}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("dashboard.settings.selectNewLocation")}</Label>
              <div className="w-full h-[400px] overflow-hidden rounded-md border relative">
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <div className="text-center space-y-4">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-sm font-medium">{t("dashboard.settings.mapWillLoadHere")}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("dashboard.settings.clickOpenMapToSelect")}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsLocationFormOpen(false);
                        // Open the map picker in a new dialog
                        setTimeout(() => {
                          setIsMapPickerOpen(true);
                        }, 100);
                      }}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      {t("dashboard.settings.openMap")}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  💡 <strong>{t("dashboard.settings.howToUse")}</strong> {t("dashboard.settings.howToUseDesc")}
                </p>
                <p>
                  📍 <strong>{t("dashboard.settings.selected")}</strong>{" "}
                  {restaurantForm.latitude !== 0 &&
                  restaurantForm.longitude !== 0
                    ? `${Number(restaurantForm.latitude).toFixed(6)}, ${Number(
                        restaurantForm.longitude
                      ).toFixed(6)}`
                    : t("dashboard.settings.noLocationSelected")}
                </p>
              </div>
            </div>
          </div>
          <div className={cn("flex justify-end gap-2", isRTL ? "flex-row-reverse" : "")}>
            <Button
              variant="outline"
              onClick={() => setIsLocationFormOpen(false)}
            >
              {t("dashboard.settings.cancel")}
            </Button>
            <Button
              onClick={handleSaveLocation}
              disabled={
                isUpdating ||
                !restaurantForm.latitude ||
                !restaurantForm.longitude
              }
            >
              {isUpdating ? (
                <>
                  <div className={cn("animate-spin rounded-full h-4 w-4 border-b-2 border-white", isRTL ? "ml-2" : "mr-2")}></div>
                  {t("dashboard.settings.saving")}
                </>
              ) : (
                <>
                  <MapPin className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  {t("dashboard.settings.saveLocation")}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Google Map Picker Modal */}
      <GoogleMapPicker
        open={isMapPickerOpen}
        onOpenChange={setIsMapPickerOpen}
        initialLat={Number(restaurantForm.latitude) || 0}
        initialLng={Number(restaurantForm.longitude) || 0}
        onSelect={handleLocationConfirm}
      />
    </div>
  );
}
