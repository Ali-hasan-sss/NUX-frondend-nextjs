"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { registerRestaurant, registerUser } from "@/features/auth/authThunks";
import { clearError } from "@/features/auth/authSlice";
import {
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  ArrowRight,
  ArrowLeft,
  User,
  Store,
  CheckCircle,
} from "lucide-react";
import { InlineMapPicker } from "@/components/common/InlineMapPicker";
import FileUploader from "@/components/upload/file-uploader";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useTranslation } from "react-i18next";

type AccountType = "user" | "restaurant";

interface UserFormData {
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}

interface RestaurantFormData {
  email: string;
  fullName: string;
  restaurantName: string;
  address: string;
  latitude: number;
  longitude: number;
  logo: string;
  password: string;
  confirmPassword: string;
}

export function MultiStepRegisterForm() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;
  const NextArrow = isRtl ? ArrowLeft : ArrowRight;
  const [currentStep, setCurrentStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [userFormData, setUserFormData] = useState<UserFormData>({
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  });

  const [restaurantFormData, setRestaurantFormData] =
    useState<RestaurantFormData>({
      email: "",
      fullName: "",
      restaurantName: "",
      address: "",
      latitude: 0,
      longitude: 0,
      logo: "",
      password: "",
      confirmPassword: "",
    });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const validatePassword = (password: string) => {
    const hasNumber = /\d/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const isLongEnough = password.length >= 8;
    return hasNumber && hasUpperCase && isLongEnough;
  };

  const getPasswordErrors = (password: string) => {
    const errors = [];
    if (password.length < 8) errors.push(t("landing.auth.atLeast8Chars"));
    if (!/\d/.test(password)) errors.push(t("landing.auth.containsNumber"));
    if (!/[A-Z]/.test(password))
      errors.push(t("landing.auth.containsUppercase"));
    return errors;
  };

  const handleAccountTypeSelect = (type: AccountType) => {
    setAccountType(type);
    setCurrentStep(2);
    setFieldErrors({});
    dispatch(clearError());
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateUserStep2(): boolean {
    const err: Record<string, string> = {};
    if (!userFormData.email?.trim())
      err.email = t("landing.auth.validation.emailRequired");
    else if (!emailRegex.test(userFormData.email))
      err.email = t("landing.auth.validation.emailInvalid");
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  }

  function validateUserStep3(): boolean {
    const err: Record<string, string> = {};
    if (!userFormData.password)
      err.password = t("landing.auth.validation.passwordRequired");
    else if (!validatePassword(userFormData.password))
      err.password = t("landing.auth.atLeast8Chars");
    if (!userFormData.confirmPassword)
      err.confirmPassword = t("landing.auth.validation.confirmPasswordRequired");
    else if (userFormData.password !== userFormData.confirmPassword)
      err.confirmPassword = t("landing.auth.passwordsDoNotMatch");
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  }

  function validateRestaurantStep2(): boolean {
    const err: Record<string, string> = {};
    if (!restaurantFormData.email?.trim())
      err.email = t("landing.auth.validation.emailRequired");
    else if (!emailRegex.test(restaurantFormData.email))
      err.email = t("landing.auth.validation.emailInvalid");
    if (!restaurantFormData.fullName?.trim())
      err.fullName = t("landing.auth.validation.fullNameRequired");
    if (!restaurantFormData.restaurantName?.trim())
      err.restaurantName = t("landing.auth.validation.restaurantNameRequired");
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  }

  function validateRestaurantStep3(): boolean {
    const err: Record<string, string> = {};
    if (!restaurantFormData.address?.trim())
      err.address = t("landing.auth.validation.addressRequired");
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  }

  function validateRestaurantStep4(): boolean {
    const err: Record<string, string> = {};
    if (
      restaurantFormData.latitude === 0 ||
      restaurantFormData.longitude === 0
    )
      err.location = t("landing.auth.validation.locationRequired");
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  }

  function validateRestaurantStep5(): boolean {
    const err: Record<string, string> = {};
    if (!restaurantFormData.password)
      err.password = t("landing.auth.validation.passwordRequired");
    else if (!validatePassword(restaurantFormData.password))
      err.password = t("landing.auth.atLeast8Chars");
    if (!restaurantFormData.confirmPassword)
      err.confirmPassword = t("landing.auth.validation.confirmPasswordRequired");
    else if (
      restaurantFormData.password !== restaurantFormData.confirmPassword
    )
      err.confirmPassword = t("landing.auth.passwordsDoNotMatch");
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  }

  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserFormData({
      ...userFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRestaurantFormChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRestaurantFormData({
      ...restaurantFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLocationConfirm = (coords: {
    latitude: number;
    longitude: number;
  }) => {
    setRestaurantFormData((prev) => ({
      ...prev,
      latitude: coords.latitude,
      longitude: coords.longitude,
    }));
  };

  const handleSubmit = async () => {
    dispatch(clearError());

    try {
      if (accountType === "user") {
        if (userFormData.password !== userFormData.confirmPassword) {
          return;
        }
        if (!validatePassword(userFormData.password)) {
          return;
        }

        const result = await dispatch(
          registerUser({
            email: userFormData.email,
            password: userFormData.password,
            fullName: userFormData.fullName || undefined,
          })
        );

        if (registerUser.fulfilled.match(result)) {
          router.push(
            `/auth/verify-email?email=${encodeURIComponent(userFormData.email)}`
          );
        }
      } else {
        if (
          restaurantFormData.password !== restaurantFormData.confirmPassword
        ) {
          return;
        }
        if (!validatePassword(restaurantFormData.password)) {
          return;
        }

        const result = await dispatch(
          registerRestaurant({
            email: restaurantFormData.email,
            password: restaurantFormData.password,
            fullName: restaurantFormData.fullName,
            restaurantName: restaurantFormData.restaurantName,
            address: restaurantFormData.address,
            latitude: restaurantFormData.latitude,
            longitude: restaurantFormData.longitude,
            logo: restaurantFormData.logo,
          })
        );

        if (registerRestaurant.fulfilled.match(result)) {
          router.push(
            `/auth/verify-email?email=${encodeURIComponent(
              restaurantFormData.email
            )}`
          );
        }
      }
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const canProceedUserStep2 = () => {
    return userFormData.email && userFormData.email.includes("@");
  };

  const canProceedUserStep3 = () => {
    return canProceedUserStep2();
  };

  const canProceedRestaurantStep2 = () => {
    return (
      restaurantFormData.email &&
      restaurantFormData.email.includes("@") &&
      restaurantFormData.restaurantName.trim()
    );
  };

  const canProceedRestaurantStep3 = () => {
    return (
      canProceedRestaurantStep2() &&
      restaurantFormData.address.trim().length > 0
    );
  };

  const canProceedRestaurantStep4 = () => {
    return (
      canProceedRestaurantStep3() &&
      restaurantFormData.latitude !== 0 &&
      restaurantFormData.longitude !== 0
    );
  };

  const canSubmit = () => {
    if (accountType === "user") {
      return (
        userFormData.password &&
        userFormData.confirmPassword &&
        userFormData.password === userFormData.confirmPassword &&
        validatePassword(userFormData.password)
      );
    } else {
      return (
        restaurantFormData.password &&
        restaurantFormData.confirmPassword &&
        restaurantFormData.password === restaurantFormData.confirmPassword &&
        validatePassword(restaurantFormData.password)
      );
    }
  };

  const renderStepIndicator = () => {
    const totalSteps = accountType === "user" ? 3 : 5;
    return (
      <div className="flex items-center justify-center mb-6">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i + 1 <= currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1 < currentStep ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                i + 1
              )}
            </div>
            {i < totalSteps - 1 && (
              <div
                className={`w-12 h-1 mx-2 ${
                  i + 1 < currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      {renderStepIndicator()}

      {error && (
        <Alert variant="destructive" className="mb-4 rounded-xl">
          <AlertDescription>
            {t("landing.auth.registerFailedCheckInfo")}
          </AlertDescription>
        </Alert>
      )}

      {/* Step 1: Account Type Selection */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center mb-6">
            {t("landing.auth.whatAccountType")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              size="lg"
              className="h-24 flex flex-col gap-2 hover:bg-accent"
              onClick={() => handleAccountTypeSelect("user")}
            >
              <User className="h-8 w-8" />
              <span className="font-medium">
                {t("landing.auth.personalAccount")}
              </span>
              <span className="text-xs text-muted-foreground">
                {t("landing.auth.forCustomers")}
              </span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-24 flex flex-col gap-2 hover:bg-accent"
              onClick={() => handleAccountTypeSelect("restaurant")}
            >
              <Store className="h-8 w-8" />
              <span className="font-medium">
                {t("landing.auth.restaurantAccount")}
              </span>
              <span className="text-xs text-muted-foreground">
                {t("landing.auth.forBusinessOwners")}
              </span>
            </Button>
          </div>
        </div>
      )}

      {/* User Registration Steps */}
      {accountType === "user" && (
        <>
          {/* Step 2: User Basic Info */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t("landing.auth.or")}
                  </span>
                </div>
              </div>
              <GoogleSignInButton mode="signup" className="flex justify-center mb-4" />

              <h3 className="text-lg font-semibold mb-4">
                {t("landing.auth.personalInformation")}
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("landing.auth.email")} *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={userFormData.email}
                    onChange={(e) => {
                      handleUserFormChange(e);
                      if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: "" }));
                    }}
                    required
                    className={fieldErrors.email ? "border-destructive" : ""}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-destructive">{fieldErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    {t("landing.auth.fullNameOptional")}
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder={t("landing.auth.yourFullName")}
                    value={userFormData.fullName}
                    onChange={handleUserFormChange}
                  />
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => { setCurrentStep(1); setFieldErrors({}); }}>
                  <BackArrow className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {t("landing.auth.back")}
                </Button>
                <Button
                  onClick={() => {
                    if (validateUserStep2()) setCurrentStep(3);
                  }}
                >
                  {t("landing.auth.next")}
                  <NextArrow className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: User Password */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">{t("landing.auth.createPassword")}</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t("landing.auth.password")}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("landing.auth.createStrongPassword")}
                      value={userFormData.password}
                      onChange={(e) => {
                        handleUserFormChange(e);
                        if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: "" }));
                      }}
                      required
                      dir={i18n.dir()}
                      className={fieldErrors.password ? "border-destructive pr-12 rtl:pl-12 rtl:pr-4" : "pr-12 rtl:pl-12 rtl:pr-4"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute end-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-destructive">{fieldErrors.password}</p>
                  )}
                  {userFormData.password && !fieldErrors.password && (
                    <div className="text-xs space-y-1">
                      {getPasswordErrors(userFormData.password).map(
                        (error, index) => (
                          <div key={index} className="text-destructive">
                            • {error}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    {t("landing.auth.confirmPassword")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("landing.auth.confirmYourPassword")}
                      value={userFormData.confirmPassword}
                      onChange={(e) => {
                        handleUserFormChange(e);
                        if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: "" }));
                      }}
                      required
                      dir={i18n.dir()}
                      className={fieldErrors.confirmPassword ? "border-destructive pr-12 rtl:pl-12 rtl:pr-4" : "pr-12 rtl:pl-12 rtl:pr-4"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute end-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {(fieldErrors.confirmPassword ||
                    (userFormData.confirmPassword &&
                      userFormData.password !== userFormData.confirmPassword)) && (
                    <div className="text-xs text-destructive">
                      {fieldErrors.confirmPassword ||
                        t("landing.auth.passwordsDoNotMatch")}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => { setCurrentStep(2); setFieldErrors({}); }}>
                  <BackArrow className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {t("landing.auth.back")}
                </Button>
                <Button
                  onClick={() => {
                    if (validateUserStep3()) handleSubmit();
                  }}
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("landing.auth.createAccount")}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Restaurant Registration Steps */}
      {accountType === "restaurant" && (
        <>
          {/* Step 2: Restaurant Basic Info */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">
                {t("landing.auth.restaurantInformation")}
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("landing.auth.email")} *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="restaurant@email.com"
                    value={restaurantFormData.email}
                    onChange={(e) => {
                      handleRestaurantFormChange(e);
                      if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: "" }));
                    }}
                    required
                    className={fieldErrors.email ? "border-destructive" : ""}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-destructive">{fieldErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t("landing.auth.ownerFullName")} *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder={t("landing.auth.restaurantOwnerName")}
                    value={restaurantFormData.fullName}
                    onChange={(e) => {
                      handleRestaurantFormChange(e);
                      if (fieldErrors.fullName) setFieldErrors((p) => ({ ...p, fullName: "" }));
                    }}
                    required
                    className={fieldErrors.fullName ? "border-destructive" : ""}
                  />
                  {fieldErrors.fullName && (
                    <p className="text-xs text-destructive">{fieldErrors.fullName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="restaurantName">{t("landing.auth.restaurantName")} *</Label>
                  <Input
                    id="restaurantName"
                    name="restaurantName"
                    type="text"
                    placeholder={t("landing.auth.yourRestaurantName")}
                    value={restaurantFormData.restaurantName}
                    onChange={(e) => {
                      handleRestaurantFormChange(e);
                      if (fieldErrors.restaurantName) setFieldErrors((p) => ({ ...p, restaurantName: "" }));
                    }}
                    required
                    className={fieldErrors.restaurantName ? "border-destructive" : ""}
                  />
                  {fieldErrors.restaurantName && (
                    <p className="text-xs text-destructive">{fieldErrors.restaurantName}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => { setCurrentStep(1); setFieldErrors({}); }}>
                  <BackArrow className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {t("landing.auth.back")}
                </Button>
                <Button
                  onClick={() => {
                    if (validateRestaurantStep2()) setCurrentStep(3);
                  }}
                >
                  {t("landing.auth.next")}
                  <NextArrow className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Logo + Address only */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">
                {t("landing.auth.stepRestaurantLogoAndAddress")}
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <FileUploader
                    label={t("landing.auth.restaurantLogo")}
                    value={restaurantFormData.logo}
                    onChange={(url) =>
                      setRestaurantFormData((prev) => ({
                        ...prev,
                        logo: url || "",
                      }))
                    }
                    accept="image/*"
                    maxSizeMb={5}
                    meta={{
                      folder: "restaurant-logos",
                      entityType: "restaurant",
                    }}
                    rounded="md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">
                    {t("landing.auth.restaurantAddress")} *
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    placeholder={t("landing.auth.addressPlaceholder")}
                    value={restaurantFormData.address}
                    onChange={(e) => {
                      handleRestaurantFormChange(e);
                      if (fieldErrors.address) setFieldErrors((p) => ({ ...p, address: "" }));
                    }}
                    required
                    className={fieldErrors.address ? "border-destructive" : ""}
                  />
                  {fieldErrors.address && (
                    <p className="text-xs text-destructive">{fieldErrors.address}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => { setCurrentStep(2); setFieldErrors({}); }}>
                  <BackArrow className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {t("landing.auth.back")}
                </Button>
                <Button
                  onClick={() => {
                    if (validateRestaurantStep3()) setCurrentStep(4);
                  }}
                >
                  {t("landing.auth.next")}
                  <NextArrow className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Select location on map (inline) */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">
                {t("landing.auth.stepSelectLocationOnMap")}
              </h3>
              {restaurantFormData.address && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">{t("landing.auth.restaurantAddress")}:</span>{" "}
                  {restaurantFormData.address}
                </p>
              )}
              <InlineMapPicker
                initialAddress={restaurantFormData.address}
                initialLat={restaurantFormData.latitude}
                initialLng={restaurantFormData.longitude}
                onSelect={handleLocationConfirm}
              />
              {fieldErrors.location && (
                <p className="text-xs text-destructive">{fieldErrors.location}</p>
              )}
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => { setCurrentStep(3); setFieldErrors({}); }}>
                  <BackArrow className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {t("landing.auth.back")}
                </Button>
                <Button
                  onClick={() => {
                    if (validateRestaurantStep4()) setCurrentStep(5);
                  }}
                  disabled={
                    restaurantFormData.latitude === 0 ||
                    restaurantFormData.longitude === 0
                  }
                >
                  {t("landing.auth.next")}
                  <NextArrow className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Restaurant Password */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">
                {t("landing.auth.createPassword")}
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t("landing.auth.password")}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("landing.auth.createStrongPassword")}
                      value={restaurantFormData.password}
                      onChange={(e) => {
                        handleRestaurantFormChange(e);
                        if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: "" }));
                      }}
                      required
                      dir={i18n.dir()}
                      className={fieldErrors.password ? "border-destructive pr-12 rtl:pl-12 rtl:pr-4" : "pr-12 rtl:pl-12 rtl:pr-4"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute end-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-destructive">{fieldErrors.password}</p>
                  )}
                  {restaurantFormData.password && !fieldErrors.password && (
                    <div className="text-xs space-y-1">
                      {getPasswordErrors(restaurantFormData.password).map(
                        (error, index) => (
                          <div key={index} className="text-destructive">
                            • {error}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t("landing.auth.confirmPassword")}</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("landing.auth.confirmYourPassword")}
                      value={restaurantFormData.confirmPassword}
                      onChange={(e) => {
                        handleRestaurantFormChange(e);
                        if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: "" }));
                      }}
                      required
                      dir={i18n.dir()}
                      className={fieldErrors.confirmPassword ? "border-destructive pr-12 rtl:pl-12 rtl:pr-4" : "pr-12 rtl:pl-12 rtl:pr-4"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute end-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {(fieldErrors.confirmPassword ||
                    (restaurantFormData.confirmPassword &&
                      restaurantFormData.password !== restaurantFormData.confirmPassword)) && (
                    <div className="text-xs text-destructive">
                      {fieldErrors.confirmPassword ||
                        t("landing.auth.passwordsDoNotMatch")}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => { setCurrentStep(4); setFieldErrors({}); }}>
                  <BackArrow className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {t("landing.auth.back")}
                </Button>
                <Button
                  onClick={() => {
                    if (validateRestaurantStep5()) handleSubmit();
                  }}
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("landing.auth.createRestaurantAccount")}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="text-center mt-6 pt-6 border-t">
        <p className="text-sm text-muted-foreground">
          {t("landing.auth.alreadyHaveAccount")}{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            {t("landing.auth.signInLink")}
          </Link>
        </p>
      </div>

    </div>
  );
}
