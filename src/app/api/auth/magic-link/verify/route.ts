import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import jwt from 'jsonwebtoken';

import { User, UserRole, UserDocument } from '@/models/User';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';

interface TokenPayload {
  email: string;
  // Ajoutez d'autres champs si nécessaires
}

const verifyTokenSchema = z.object({
  token: z.string().min(1, 'Token requis')
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token requis' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ token }) as UserDocument | null;

    if (!user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 404 });
    }

    if (user.tokenExpires && user.tokenExpires < new Date()) {
      return NextResponse.json({ error: 'Token expiré' }, { status: 400 });
    }

    // Réinitialiser le token après utilisation
    if (user._id) {
      await User.findByIdAndUpdate(user._id, {
        token: '',
        tokenExpires: null
      });
    }

    // Décoder le token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

    // Créer une nouvelle session NextAuth
    const sessionData = {
      user: {
        id: user._id ? user._id.toString() : '',
        email: user.email,
        role: user.role as UserRole,
        name: user.name || '',
        image: typeof user.image === 'string' ? user.image : null
      }
    };

    // Récupérer le port actuel
    const port = process.env.NEXTAUTH_URL ? new URL(process.env.NEXTAUTH_URL).port : '3001';
    const baseUrl = `http://localhost:${port}`;
    const redirectUrl = `${baseUrl}/dashboard/student`;

    // Rediriger vers la page de redirection avec le token
    return NextResponse.redirect(new URL(`/auth/redirect?token=${token}`, request.url));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: error.errors[0]?.message || 'Données invalides'
      }, { status: 400 });
    }
    
    console.error('Erreur lors de la vérification du lien magique:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
