import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Fonction utilitaire pour la connexion MongoDB
async function connectToDatabase() {
  await clientPromise;
}
import { User, UserRole } from '@/models/User';
import { v4 as uuidv4 } from 'uuid';
import { sendMagicLink } from '@/lib/sendgrid';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email, role: 'student' });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur étudiant non trouvé' }, { status: 404 });
    }

    // Générer un token unique
    const token = uuidv4();
    
    // Mettre à jour l'utilisateur avec le token
    await User.findByIdAndUpdate(user._id, {
      token,
      tokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // Token expire dans 24h
    });

    // Construire l'URL de connexion
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const magicLink = `${baseUrl}/api/auth/magic-link/verify?token=${token}`;

    // Envoyer l'email avec le lien magique
    await sendMagicLink(email, magicLink);

    return NextResponse.json({ success: true, message: 'Lien magique envoyé' });
  } catch (error) {
    console.error('Erreur lors de la génération du lien magique:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
