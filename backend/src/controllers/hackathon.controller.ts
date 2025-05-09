// import { Request, Response, NextFunction, RequestHandler } from 'express';
// import { Hackathon, IHackathon } from '../models/Hackhaton';

// // Option A : signature explicite NextFunction
// export const getAll = async (
//   _req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const data = await Hackathon.find();
//     res.json(data);
//   } catch (err) {
//     next(err);
//   }
// };

// export const getById = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const hack = await Hackathon.findById(req.params.id);
//     if (!hack) return res.status(404).json({ message: 'Pas trouvé' });
//     res.json(hack);
//   } catch (err) {
//     next(err);
//   }
// };

// export const createHack = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const newHack: IHackathon = new Hackathon(req.body);
//     const saved = await newHack.save();
//     res.status(201).json(saved);
//   } catch (err) {
//     next(err);
//   }
// };

// export const updateHack = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const updated = await Hackathon.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );
//     if (!updated) return res.status(404).json({ message: 'Pas trouvé' });
//     res.json(updated);
//   } catch (err) {
//     next(err);
//   }
// };

// export const deleteHack = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     await Hackathon.findByIdAndDelete(req.params.id);
//     res.status(204).send();
//   } catch (err) {
//     next(err);
//   }
// };
// src/controllers/hackathon.controller.ts
import { RequestHandler } from 'express';
import { Hackathon, IHackathon } from '../models/Hackhaton';

export const getAll: RequestHandler = async (_req, res, next) => {
  try {
    const data = await Hackathon.find();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getById: RequestHandler = async (req, res, next) => {
  try {
    const hack = await Hackathon.findById(req.params.id);
    if (!hack) {
      res.status(404).json({ message: 'Pas trouvé' });
      return;
    }
    res.json(hack);
  } catch (err) {
    next(err);
  }
};

export const createHack: RequestHandler = async (req, res, next) => {
  try {
    // On retire _id, createdAt et updatedAt s’ils étaient passés dans le body
    const { _id, createdAt, updatedAt, ...payload } = req.body as Partial<IHackathon>;
    const newHack = new Hackathon(payload);
    const saved = await newHack.save();
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};

export const updateHack: RequestHandler = async (req, res, next) => {
  try {
    // On retire _id, createdAt et updatedAt pour ne pas les modifier
    const { _id, createdAt, updatedAt, ...payload } = req.body as Partial<IHackathon>;
    const updated = await Hackathon.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ message: 'Pas trouvé' });
      return;
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteHack: RequestHandler = async (req, res, next) => {
  try {
    await Hackathon.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
