"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { loginWithCredentials, userRole, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      // 👇 ici on suppose que l'admin et l'examinateur utilisent un mot de passe
      const role = email.includes("admin")
        ? "admin"
        : email.includes("examiner")
        ? "examiner"
        : "student"; // fallback simple

      await loginWithCredentials(email, password, role as "admin" | "examiner");
    } catch {
      setError("Email ou mot de passe incorrect");
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    if (userRole === "admin") router.push("/dashboard/admin");
    else if (userRole === "examiner") router.push("/dashboard/examiner");
    else if (userRole === "student") router.push("/dashboard/student");
  }, [userRole, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <LogIn className="mx-auto h-12 w-12 text-indigo-600" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Connexion</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="ex: nom@domaine.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button type="submit" className="w-full">
              Se connecter
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
