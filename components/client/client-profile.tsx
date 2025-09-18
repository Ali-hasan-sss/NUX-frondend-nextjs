"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchClientProfile } from "@/features/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Mail, Calendar, Settings } from "lucide-react";
import { logout } from "@/features/auth/authSlice";
import { useRouter } from "next/navigation";

export function ClientProfile() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { profile, loading, error } = useAppSelector(
    (state) => state.clientAccount
  );
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user?.role === "USER") {
      dispatch(fetchClientProfile());
    }
  }, [dispatch, user]);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  if (loading.profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  if (error.profile) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive text-center">{error.profile}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            My Profile
          </CardTitle>
          <CardDescription>
            Welcome back! Here's your account information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {profile.fullName?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{profile.fullName}</h2>
              <div className="flex items-center gap-2">
                <Badge variant={profile.isActive ? "default" : "secondary"}>
                  {profile.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline">{profile.role}</Badge>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="grid gap-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Email:</span>
              <span className="font-medium">{profile.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Member since:
              </span>
              <span className="font-medium">
                {formatDate(profile.createdAt)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" className="flex-1">
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
