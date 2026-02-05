// src/components/ClientProviders.tsx
"use client";

import { useEffect, useState } from "react";
import IAPAULoading from "@/components/IAPAULoading";
import { AuthDebug } from "@/components/auth/AuthDebug";
import { Toaster as CustomToaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoading(false), 4200);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <AuthProvider>
      <TooltipProvider>
        <IAPAULoading isLoading={isLoading} />
        {children}
        <Toaster position="top-right" richColors />
        <CustomToaster />
        <AuthDebug />
      </TooltipProvider>
    </AuthProvider>
  );
}
