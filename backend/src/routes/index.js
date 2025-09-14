import { Router } from "express";
import daysRoutes from "./daysRoutes.js";
import foodsRoutes from "./foodsRoutes.js";
import { requireClerkAuth } from '../middleware/auth.js'

const router = Router();

// All app data is user-specific; require auth
router.use("/days", requireClerkAuth, daysRoutes);
router.use("/foods", requireClerkAuth, foodsRoutes);

export default router;
