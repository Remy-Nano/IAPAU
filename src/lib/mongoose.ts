import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: "hackathon", // adapte si nécessaire
    });
    isConnected = true;
    console.log("✅ Connexion Mongoose établie");
  } catch (err) {
    console.error("❌ Erreur de connexion Mongoose :", err);
    throw err;
  }
}
