import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AuthService } from '@/services/authService';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Vérifier si l'utilisateur est déjà connecté
  const session = AuthService.getSession();
  const isAuthenticated = session !== null;
  
  // Rediriger vers la page de connexion si non connecté et qu'on essaie d'accéder à un dashboard
  if (!isAuthenticated && pathname.startsWith('/dashboard')) {
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Rediriger vers le dashboard approprié si connecté et qu'on essaie d'accéder à la page de connexion
  if (isAuthenticated && pathname === '/auth/login') {
    const role = session?.role;
    if (role) {
      const redirectUrl = new URL(`/dashboard/${role}`, request.url);
      try {
        return NextResponse.redirect(redirectUrl);
      } catch (error) {
        console.error('Erreur de redirection:', error);
        return NextResponse.next();
      }
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/login'],
};
