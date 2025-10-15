"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import GoogleMapPicker from "@/components/common/GoogleMapPicker";
import FileUploader from "@/components/upload/file-uploader";

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
  const [currentStep, setCurrentStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

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
    if (password.length < 8) errors.push("At least 8 characters");
    if (!/\d/.test(password)) errors.push("Contains a number");
    if (!/[A-Z]/.test(password)) errors.push("Contains an uppercase letter");
    return errors;
  };

  const handleAccountTypeSelect = (type: AccountType) => {
    setAccountType(type);
    setCurrentStep(2);
    dispatch(clearError());
  };

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
    setRestaurantFormData({
      ...restaurantFormData,
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
    setShowMapPicker(false);
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
          router.push("/");
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
          router.push("/dashboard");
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
      restaurantFormData.address.trim() &&
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
    const totalSteps = accountType === "user" ? 3 : 4;
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          {currentStep === 1
            ? "Choose your account type to get started"
            : `Step ${currentStep} of ${accountType === "user" ? 3 : 4}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderStepIndicator()}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Account Type Selection */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center mb-6">
              What type of account do you want to create?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                size="lg"
                className="h-24 flex flex-col gap-2 hover:bg-accent"
                onClick={() => handleAccountTypeSelect("user")}
              >
                <User className="h-8 w-8" />
                <span className="font-medium">Personal Account</span>
                <span className="text-xs text-muted-foreground">
                  For customers
                </span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-24 flex flex-col gap-2 hover:bg-accent"
                onClick={() => handleAccountTypeSelect("restaurant")}
              >
                <Store className="h-8 w-8" />
                <span className="font-medium">Restaurant Account</span>
                <span className="text-xs text-muted-foreground">
                  For business owners
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
                <h3 className="text-lg font-semibold mb-4">
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={userFormData.email}
                      onChange={handleUserFormChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name (Optional)</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Your full name"
                      value={userFormData.fullName}
                      onChange={handleUserFormChange}
                    />
                  </div>
                </div>
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    disabled={!canProceedUserStep2()}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: User Password */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Create Password</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={userFormData.password}
                        onChange={handleUserFormChange}
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
                    {userFormData.password && (
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
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={userFormData.confirmPassword}
                        onChange={handleUserFormChange}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
                    {userFormData.confirmPassword &&
                      userFormData.password !==
                        userFormData.confirmPassword && (
                        <div className="text-xs text-destructive">
                          Passwords do not match
                        </div>
                      )}
                  </div>
                </div>
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit() || isLoading}
                  >
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Account
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
                  Restaurant Information
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="restaurant@email.com"
                      value={restaurantFormData.email}
                      onChange={handleRestaurantFormChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Owner Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Restaurant owner name"
                      value={restaurantFormData.fullName}
                      onChange={handleRestaurantFormChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="restaurantName">Restaurant Name *</Label>
                    <Input
                      id="restaurantName"
                      name="restaurantName"
                      type="text"
                      placeholder="Your restaurant name"
                      value={restaurantFormData.restaurantName}
                      onChange={handleRestaurantFormChange}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    disabled={!canProceedRestaurantStep2()}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Restaurant Location */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">
                  Restaurant Location
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <FileUploader
                      label="Restaurant Logo (Optional)"
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
                    <Label htmlFor="address">Restaurant Address *</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="address"
                        name="address"
                        type="text"
                        placeholder="123 Main St, City, State"
                        value={restaurantFormData.address}
                        onChange={handleRestaurantFormChange}
                        required
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowMapPicker(true)}
                        className="bg-transparent"
                        title="Select location on map"
                      >
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                    {restaurantFormData.latitude !== 0 &&
                      restaurantFormData.longitude !== 0 && (
                        <div className="text-xs text-muted-foreground bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-green-600" />
                            <span className="font-medium text-green-700 dark:text-green-400">
                              Location selected:
                            </span>
                          </div>
                          <div className="mt-1">
                            Lat: {restaurantFormData.latitude.toFixed(6)}, Lng:{" "}
                            {restaurantFormData.longitude.toFixed(6)}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(4)}
                    disabled={!canProceedRestaurantStep3()}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Restaurant Password */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Create Password</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={restaurantFormData.password}
                        onChange={handleRestaurantFormChange}
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
                    {restaurantFormData.password && (
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
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={restaurantFormData.confirmPassword}
                        onChange={handleRestaurantFormChange}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
                    {restaurantFormData.confirmPassword &&
                      restaurantFormData.password !==
                        restaurantFormData.confirmPassword && (
                        <div className="text-xs text-destructive">
                          Passwords do not match
                        </div>
                      )}
                  </div>
                </div>
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(3)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit() || isLoading}
                  >
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Restaurant Account
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        <div className="text-center mt-6 pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Google Map Picker Modal */}
        <GoogleMapPicker
          open={showMapPicker}
          onOpenChange={setShowMapPicker}
          initialLat={restaurantFormData.latitude}
          initialLng={restaurantFormData.longitude}
          onSelect={handleLocationConfirm}
        />
      </CardContent>
    </Card>
  );
}
