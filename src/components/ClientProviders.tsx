// src/components/ClientProviders.tsx
"use client";

import { AuthDebug } from "@/components/auth/AuthDebug";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="top-right" />
      <AuthDebug />
    </AuthProvider>
  );
}
