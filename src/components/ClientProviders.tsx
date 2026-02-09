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
    if (typeof window !== "undefined") {
      (window as { __iapauLoaderDone?: boolean }).__iapauLoaderDone = false;
    }
    const timeout = window.setTimeout(() => setIsLoading(false), 2500);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const timeout = window.setTimeout(() => {
      if (typeof window !== "undefined") {
        (window as { __iapauLoaderDone?: boolean }).__iapauLoaderDone = true;
      }
      window.dispatchEvent(new Event("iapau-loading-finished"));
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [isLoading]);

  return (
    <AuthProvider>
      <TooltipProvider>
        <IAPAULoading isLoading={isLoading} />
        {children}
        <Toaster position="top-right" richColors />
        <CustomToaster />
        {process.env.NODE_ENV !== "production" && <AuthDebug />}
      </TooltipProvider>
    </AuthProvider>
  );
}
