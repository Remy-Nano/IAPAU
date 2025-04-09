import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Charge les variables d'environnement depuis le fichier .env
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connexion à MongoDB Atlas (sans les options dépréciées)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connexion à MongoDB réussie 🚀'))
  .catch(err => console.error('Erreur de connexion à MongoDB :', err));

// Création du schéma Mongoose pour les métriques
const metricSchema = new mongoose.Schema({
  promptStartTime: Date,
  promptEndTime: Date,
  responseStartTime: Date,
  responseEndTime: Date
});

// Modèle pour les métriques
const Metric = mongoose.model('Metric', metricSchema);

// Route POST pour enregistrer une nouvelle métrique
app.post('/metrics', async (req, res) => {
  try {
    const metricData = {
      promptStartTime: new Date(req.body.promptStartTime),
      promptEndTime: new Date(req.body.promptEndTime),
      responseStartTime: new Date(req.body.responseStartTime),
      responseEndTime: new Date(req.body.responseEndTime),
    };

    const metric = new Metric(metricData);
    await metric.save();

    console.log('Nouvelle métrique enregistrée :', metric);
    res.json({ success: true, metric });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la métrique :', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route GET pour récupérer toutes les métriques
app.get('/metrics', async (req, res) => {
  try {
    const metrics = await Metric.find();
    res.json(metrics);
  } catch (error) {
    console.error('Erreur lors de la récupération des métriques :', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Écoute sur le port défini
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur métriques en écoute sur le port ${PORT} 🚀`);
});
