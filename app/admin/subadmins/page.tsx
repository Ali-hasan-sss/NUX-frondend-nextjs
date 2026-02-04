"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/app/hooks";
import { SubAdminsManagement } from "@/components/admin/subadmins-management";

export default function SubAdminsPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (user && user.role === "SUBADMIN") {
      router.replace("/admin");
    }
  }, [user, router]);

  if (user?.role === "SUBADMIN") {
    return null;
  }

  return <SubAdminsManagement />;
}
