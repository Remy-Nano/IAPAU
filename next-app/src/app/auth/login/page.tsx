'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthManager } from '@/components/auth/AuthManager';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { userRole } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  useEffect(() => {
    if (userRole) {
      try {
        const redirectUrl = redirect ? redirect : `/dashboard/${userRole}`;
        router.push(redirectUrl);
      } catch (error) {
        console.error('Erreur de redirection:', error);
      }
    }
  }, [userRole, router, redirect]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-2xl border border-gray-200">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Connexion
        </h2>
        <AuthManager />
      </div>
    </div>
  );
}