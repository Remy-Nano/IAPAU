import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const metrics = {
  promptMetrics: []
};

app.post('/metrics', (req, res) => {
  const metric = req.body;
  // Conversion des dates string en objets Date
  metric.promptStartTime = new Date(metric.promptStartTime);
  metric.promptEndTime = new Date(metric.promptEndTime);
  metric.responseStartTime = new Date(metric.responseStartTime);
  metric.responseEndTime = new Date(metric.responseEndTime);
  
  metrics.promptMetrics.push(metric);
  console.log('Nouvelle métrique reçue:', metric);
  res.json({ success: true });
});

app.get('/metrics', (req, res) => {
  res.json(metrics);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur métriques en écoute sur le port ${PORT}`);
});