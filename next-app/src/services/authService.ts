import Cookies from 'js-cookie';
import { UserRole } from '@/types';

const SESSION_COOKIE_NAME = 'iapau_session';
const SESSION_EXPIRY_DAYS = 7;

export class AuthService {
  static getSession() {
    const sessionData = Cookies.get(SESSION_COOKIE_NAME);
    if (!sessionData) return null;

    try {
      return JSON.parse(sessionData);
    } catch {
      return null;
    }
  }

  static setSession(role: UserRole) {
    const sessionData = {
      role,
      expires: new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString()
    };

    Cookies.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
      expires: SESSION_EXPIRY_DAYS,
      sameSite: 'lax'
    });
  }

  static clearSession() {
    Cookies.remove(SESSION_COOKIE_NAME);
  }

  static getRedirectUrl(role: UserRole): string {
    return 
      role === 'student' ? '/dashboard/student' :
      role === 'examiner' ? '/dashboard/examiner' :
      role === 'admin' ? '/dashboard/admin' :
      '/login';
  }

  static isAuthenticated() {
    const session = this.getSession();
    if (!session) return false;

    const now = new Date();
    const expiry = new Date(session.expires);
    return now < expiry;
  }

  static getRole() {
    const session = this.getSession();
    return session?.role || null;
  }
}
