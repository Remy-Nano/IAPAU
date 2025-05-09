import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect } from "react";
import { Toast as ToastType, useToast } from "./use-toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  useEffect(() => {
    // Update position of toasts when new ones are added
    const updatePositions = () => {
      const toastElements = document.querySelectorAll(
        ".toast-item"
      ) as NodeListOf<HTMLElement>;
      toastElements.forEach((element, index) => {
        element.style.bottom = `${index * 80 + 20}px`;
      });
    };

    updatePositions();
  }, [toasts]);

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 flex flex-col-reverse items-end gap-2">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => dismiss(toast.id)}
        />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastType;
  onDismiss: () => void;
}) {
  const variantStyles = {
    default: "bg-white border-gray-200 text-gray-900",
    destructive: "bg-red-600 border-red-700 text-white",
  };

  return (
    <div
      className={cn(
        "toast-item fixed right-4 w-96 max-w-[90vw] rounded-lg border p-4 shadow-lg transition-all duration-300",
        variantStyles[toast.variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="grid gap-1">
          <div className="font-medium">{toast.title}</div>
          {toast.description && (
            <div className="text-sm opacity-90">{toast.description}</div>
          )}
        </div>
        <button
          onClick={onDismiss}
          className={cn(
            "ml-4 mt-1 h-5 w-5 rounded-full flex items-center justify-center",
            toast.variant === "destructive"
              ? "hover:bg-red-700"
              : "hover:bg-gray-200"
          )}
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
