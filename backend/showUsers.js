import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function showUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const users = await mongoose.connection.db.collection('users').find().toArray();

    console.log('📦 Utilisateurs :');
    console.table(users);
    users.forEach(user => {
        console.log(`👤 ${user.prenom} ${user.nom} | Email : ${user.email}`);
      });
      

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des utilisateurs :', error);
  }
}

showUsers();
