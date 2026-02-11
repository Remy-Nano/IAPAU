"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

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
  const [redirected, setRedirected] = useState(false);
  const shouldLog = process.env.NODE_ENV !== "production";

  if (shouldLog) {
    console.log(
      "ProtectedRoute - isAuthenticated:",
      isAuthenticated,
      "userRole:",
      userRole,
      "allowedRoles:",
      allowedRoles
    );
  }

  useEffect(() => {
    // Éviter la boucle infinie en utilisant un état pour suivre si une redirection a déjà eu lieu
    if (redirected) return;

    const timeoutId = setTimeout(() => {
      if (!isAuthenticated) {
        if (shouldLog) {
          console.log("Redirection vers /login - Non authentifié");
        }
        setRedirected(true);
        router.push("/login");
      } else if (!allowedRoles.includes(userRole ?? "")) {
        if (shouldLog) {
          console.log(
            `Redirection vers /unauthorized - Rôle non autorisé: ${userRole}`
          );
        }
        setRedirected(true);
        router.push("/unauthorized");
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, userRole, router, allowedRoles, redirected, shouldLog]);

  if (!isAuthenticated || !allowedRoles.includes(userRole ?? "")) {
    if (shouldLog) {
      console.log("Rendu null - Conditions non remplies");
    }
    return null; // Ou un spinner de chargement si tu veux
  }

  if (shouldLog) {
    console.log("Rendu des enfants - Tout est OK");
  }
  return <>{children}</>;
};
