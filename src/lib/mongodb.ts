import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 30000, // 30 secondes
  socketTimeoutMS: 30000, // 30 secondes
  connectTimeoutMS: 30000, // 30 secondes
  maxPoolSize: 100,
  minPoolSize: 10,
  waitQueueTimeoutMS: 30000, // 30 secondes
  heartbeatFrequencyMS: 10000, // 10 secondes
  keepAliveInitialDelay: 300000 // 5 minutes
});

const clientPromise = client.connect();

// Fonction utilitaire pour la connexion MongoDB
export async function connectToDatabase() {
  await clientPromise;
  return client.db();
}

export default clientPromise;
