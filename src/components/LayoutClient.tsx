'use client';

import { Toast } from './Toast';

export function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toast />
    </>
  );
}
