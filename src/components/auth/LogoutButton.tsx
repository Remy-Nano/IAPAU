"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { cn } from "@/lib/utils";

type LogoutButtonProps = {
  className?: string;
  variant?: "default" | "ghost";
};

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  className,
  variant = "default",
}) => {
  const { logout } = useAuth();
  const router = useRouter(); //

  const handleLogout = () => {
    logout();
    router.push("/login"); // ✅ redirection vers la page de login
  };

  return (
    <button
      onClick={handleLogout}
      className={cn(
        "flex items-center rounded-lg transition-colors",
        variant === "default" &&
          "px-3 py-1.5 text-sm bg-slate-100 text-slate-700 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200",
        variant === "ghost" && "bg-transparent text-red-200 hover:bg-red-500/10",
        className
      )}
    >
      <LogOut className="h-4 w-4 mr-2" />
      <span>Déconnexion</span>
    </button>
  );
};
