'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/useToast';

export function Toast() {
  const { toasts } = useToast();

  useEffect(() => {
    // Update position of toasts when new ones are added
    const updatePositions = () => {
      const toastElements = document.querySelectorAll('.toast') as NodeListOf<HTMLElement>;
      toastElements.forEach((element, index) => {
        element.style.top = `${index * 80}px`;
      });
    };

    updatePositions();
  }, [toasts]);

  return (
    <div className="fixed top-4 right-4 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast fixed right-4 rounded-lg p-4 shadow-lg transition-all duration-300 ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
