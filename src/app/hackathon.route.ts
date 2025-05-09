import { Router } from "express";
import * as ctrl from "../controllers/hackathon.controller";

const router = Router();

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.post("/", ctrl.createHack);
router.put("/:id", ctrl.updateHack);
router.delete("/:id", ctrl.deleteHack);

export default router;
