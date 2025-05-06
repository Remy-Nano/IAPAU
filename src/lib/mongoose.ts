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

const uri = process.env.MONGODB_URI!;
if (!uri) {
  throw new Error("🛑 MONGODB_URI non défini dans .env");
}

if (!globalThis.mongooseCache) {
  globalThis.mongooseCache = { conn: null, promise: null };
}
const cache = globalThis.mongooseCache;

export default async function connectDB(): Promise<Mongoose> {
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(uri);
  }
  cache.conn = await cache.promise;
  console.log("✅ MongoDB connecté, état :", mongoose.connection.readyState);
  return cache.conn;
}
