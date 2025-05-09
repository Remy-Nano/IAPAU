// import type { Express } from "express";
// import express from "express";

// import cors from "cors";
// import dotenv from "dotenv";
// import mongoose from "mongoose";
// import conversationRoutes from "./routes/conversation.routes";
// import userRoutes from "./routes/user.routes";

// dotenv.config();

// const app: Express = express();

// // Configuration CORS pour autoriser les requêtes du frontend
// app.use(
//   cors({
//     origin: "http://localhost:5173", // URL du frontend
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// app.use(express.json());
// app.use("/users", userRoutes);
// app.use("/api/conversations", conversationRoutes);

// mongoose
//   .connect(process.env.MONGODB_URI!)
//   .then(() => console.log("✅ Connecté à MongoDB"))
//   .catch((err) => console.error("❌ Erreur MongoDB :", err));

// src/server.ts
import type { Express } from "express";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import conversationRoutes from "./routes/conversation.routes";
import userRoutes from "./routes/user.routes";
import hackathonRoutes from "./routes/hackathon.routes";

dotenv.config();

const app: Express = express();

// Configuration CORS pour autoriser les requêtes du frontend
app.use(
  cors({
    origin: "http://localhost:5173",  // URL de ton front Vite
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware pour parser le JSON
app.use(express.json());

// Routes existantes
app.use("/users", userRoutes);
app.use("/api/conversations", conversationRoutes);

// Routes pour la gestion des hackathons
app.use("/api/hackathons", hackathonRoutes);

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => console.log("✅ Connecté à MongoDB"))
  .catch((err) => console.error("❌ Erreur MongoDB :", err));

export default app;
