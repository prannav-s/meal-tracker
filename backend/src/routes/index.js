import { Router } from "express";
import daysRoutes from "./daysRoutes.js";
import mealsRoutes from "./mealsRoutes.js";
import foodsRoutes from "./foodsRoutes.js";

const router = Router();

router.use("/days", daysRoutes);
router.use("/meals", mealsRoutes);
router.use("/foods", foodsRoutes);

export default router;