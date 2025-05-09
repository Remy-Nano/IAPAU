import React from "react";
import { Toaster } from "sonner";

export default function HackathonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-screen-xl mx-auto">
      <Toaster position="top-right" richColors />
      {children}
    </div>
  );
}
