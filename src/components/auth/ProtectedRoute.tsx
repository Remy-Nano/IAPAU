"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

type ProtectedRouteProps = {
  allowedRoles: string[];
  children: React.ReactNode;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { isAuthenticated, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (!allowedRoles.includes(userRole ?? "")) {
      router.push("/unauthorized");
    }
  }, [isAuthenticated, userRole, router, allowedRoles]);

  if (!isAuthenticated || !allowedRoles.includes(userRole ?? "")) {
    return null; // Ou un spinner de chargement si tu veux
  }

  return <>{children}</>;
};
