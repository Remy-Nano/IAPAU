// src/lib/mongoose.ts

import mongoose, { Mongoose } from "mongoose";

/* eslint-disable no-var */
declare global {
  var mongooseCache: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}
/* eslint-enable no-var */

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error("🛑 MONGODB_URI non défini dans .env.local");
}

if (!globalThis.mongooseCache) {
  globalThis.mongooseCache = { conn: null, promise: null };
}
const cache = globalThis.mongooseCache;

export default async function connectDB(): Promise<Mongoose> {
  try {
    if (cache.conn) {
      console.log("✅ Réutilisation de la connexion MongoDB existante");
      return cache.conn;
    }

    if (!cache.promise) {
      const opts = {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      console.log("🔌 Tentative de connexion à MongoDB...");
      cache.promise = mongoose.connect(uri, opts);
    }

    cache.conn = await cache.promise;
    const readyState = mongoose.connection.readyState;

    console.log(`✅ MongoDB connecté, état : ${readyState}`);

    return cache.conn;
  } catch (err) {
    console.error("❌ Erreur de connexion à MongoDB:", err);
    if (err instanceof Error) {
      console.error("Message d'erreur:", err.message);
      console.error("Stack trace:", err.stack);
    }
    throw new Error(
      `Erreur de connexion à MongoDB: ${
        err instanceof Error ? err.message : "Erreur inconnue"
      }`
    );
  }
}
