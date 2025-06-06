import mongoose from 'mongoose';
import { User, UserRole } from '../src/models/User';
import bcrypt from 'bcryptjs';

async function main() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecté à MongoDB');

    const password = await bcrypt.hash('password123', 10);
    const users = [
      {
        email: 'admin@example.com',
        password,
        role: 'admin' as UserRole,
        name: 'Admin Test'
      },
      {
        email: 'examinateur@example.com',
        password,
        role: 'examinateur' as UserRole,
        name: 'Examinateur Test'
      },
      {
        email: 'student@example.com',
        role: 'student' as UserRole,
        name: 'Student Test'
      }
    ];

    await User.deleteMany({});
    console.log('Utilisateurs existants supprimés');

    const createdUsers = await User.insertMany(users);
    console.log(`Création de ${createdUsers.length} utilisateurs`);
    console.log('Initialisation terminée');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Déconnexion de MongoDB');
  }
}

main().catch(console.error);
