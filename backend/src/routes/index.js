import { Router } from "express";
import daysRoutes from "./daysRoutes.js";
import foodsRoutes from "./foodsRoutes.js";

const router = Router();

router.use("/days", daysRoutes);
router.use("/foods", foodsRoutes);

export default router;