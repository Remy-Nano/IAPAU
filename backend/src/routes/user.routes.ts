import { Router } from 'express';
import User from '../models/User';

const router = Router();

// Créer un nouvel utilisateur
router.post('/', async (req, res) => {
  try {
    const user = new User({
      ...req.body,
      dateNaissance: new Date(req.body.dateNaissance),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await user.save();
    res.status(201).json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
