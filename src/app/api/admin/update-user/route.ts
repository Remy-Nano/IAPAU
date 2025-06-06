import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User, UserRole } from '@/models/User';
import { z } from 'zod';

const updateUserSchema = z.object({
  email: z.string().email('Format email invalide').min(1, 'Email requis'),
  role: z.enum(['student', 'admin', 'examinateur'])
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, role } = updateUserSchema.parse(body);

    await connectToDatabase();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Mettre à jour le rôle
    await User.findByIdAndUpdate(user._id, { role });

    return NextResponse.json({ message: 'Rôle mis à jour avec succès', role });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: error.errors[0]?.message || 'Données invalides'
      }, { status: 400 });
    }
    
    console.error('Erreur lors de la mise à jour du rôle:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
