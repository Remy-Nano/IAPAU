import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User, UserRole } from '@/models/User';
import { z } from 'zod';

const checkUserSchema = z.object({
  email: z.string().email('Format email invalide').min(1, 'Email requis')
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = checkUserSchema.parse(body);

    await connectToDatabase();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    if (!user.role) {
      return NextResponse.json({ error: 'Rôle utilisateur invalide' }, { status: 400 });
    }

    return NextResponse.json({ role: user.role });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: error.errors[0]?.message || 'Données invalides'
      }, { status: 400 });
    }
    
    console.error('Erreur lors de la vérification de l\'utilisateur:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
