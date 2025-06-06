import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import jwt from "jsonwebtoken";
import { User } from "@/models/User";
import { UserRole } from "@/models/User";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "MagicLink",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.token) {
            throw new Error('Token manquant');
          }
          
          const decoded = jwt.verify(credentials.token, process.env.JWT_SECRET!) as { email: string };
          
          await clientPromise;
          const user = await User.findOne({ email: decoded.email });
          
          if (!user) {
            throw new Error('Utilisateur non trouvé pour l\'email: ' + decoded.email);
          }
          
          // Réinitialiser le token après utilisation
          await User.findByIdAndUpdate(user._id, { token: '', tokenExpires: null });
          
          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role as UserRole,
            name: user.name || '',
            image: user.image
          };
        } catch (error) {
          console.error('Erreur de vérification du token:', error);
          throw error instanceof Error ? error : new Error('Erreur inattendue');
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'credentials' && user?.role) {
        return true;
      }
      return false;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role as UserRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          role: token.role as UserRole,
          name: token.name as string,
          image: token.image as string | null
        };
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 jours
  },
  secret: process.env.JWT_SECRET,
  pages: {
    signIn: "/auth/login",
  }
};
