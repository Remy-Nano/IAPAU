"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ReactNode } from "react";

type UserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
};

export function UserModal({
  isOpen,
  onClose,
  title,
  children,
  className = "",
}: UserModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className={`bg-white/95 p-6 rounded-2xl w-full max-w-xl shadow-[0_24px_70px_-45px_rgba(15,23,42,0.45)] border border-slate-200/80 ${className}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#0F172A]">{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full hover:bg-slate-100 text-slate-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
