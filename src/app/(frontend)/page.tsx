"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { userRole, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    switch (userRole) {
      case "student":
        router.push("/dashboard/student");
        break;
      case "admin":
        router.push("/dashboard/admin");
        break;
      case "examiner":
        router.push("/dashboard/examiner");
        break;
      default:
        router.push("/unauthorized");
        break;
    }
  }, [isAuthenticated, userRole, router]);

  return null;
}
