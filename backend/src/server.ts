import express from 'express';
import type { Express } from 'express';

import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';

dotenv.config();

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use('/users', userRoutes);

mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => console.error('❌ Erreur MongoDB :', err));

export default app;
