import { DefaultSession } from 'next-auth';
import { UserRole } from '@/models/User';

interface CustomUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  image: string | null;
}

declare module 'next-auth' {
  interface Session {
    user: CustomUser & DefaultSession['user'];
  }

  interface User extends CustomUser {}

  interface AdapterUser extends CustomUser {}

  interface Adapter {
    getUser: (id: string) => Promise<AdapterUser | null>;
    getUserByEmail: (email: string) => Promise<AdapterUser | null>;
    createUser: (data: Partial<AdapterUser>) => Promise<AdapterUser>;
    updateUser: (id: string, data: Partial<AdapterUser>) => Promise<AdapterUser>;
    deleteUser: (id: string) => Promise<void>;
  }

  interface DefaultSession {
    user: {
      id: string;
      email: string;
      role: UserRole;
      name: string;
      image: string | null;
    }
  }

  interface DefaultSessionUser {
    id: string;
    email: string;
    role: UserRole;
    name: string;
    image: string | null;
  }
}

export {}; // Permet d'exporter les types
