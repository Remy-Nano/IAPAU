"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";

export function ToastTest() {
  const { toast } = useToast();

  const testCustomToast = () => {
    toast({
      title: "Test Custom Toast",
      description: "Ceci est un test du système de toast personnalisé",
      variant: "default",
    });
  };

  const testSonnerToast = () => {
    sonnerToast.success("Test Sonner Toast", {
      description: "Ceci est un test du système Sonner",
    });
  };

  return (
    <div className="flex gap-4 my-4">
      <Button onClick={testCustomToast}>Tester Toast Personnalisé</Button>
      <Button onClick={testSonnerToast}>Tester Sonner Toast</Button>
    </div>
  );
}
