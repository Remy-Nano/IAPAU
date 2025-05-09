import { useState } from "react";

type ToastVariant = "default" | "destructive";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({
    title,
    description,
    variant = "default",
  }: {
    title: string;
    description?: string;
    variant?: ToastVariant;
  }) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, title, description, variant }]);

    // Remove toast after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    toasts,
    toast,
    dismiss,
  };
}
