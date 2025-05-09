// src/components/ClientProviders.tsx
"use client";

import { AuthDebug } from "@/components/auth/AuthDebug";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <TooltipProvider>
        {children}
        <Toaster position="top-right" richColors />
        <AuthDebug />
      </TooltipProvider>
    </AuthProvider>
  );
}
