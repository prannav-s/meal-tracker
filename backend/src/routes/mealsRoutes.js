import { Router } from "express";
import {
    getMealById
} from "../controllers/mealsController.js";

const router = Router();

router.get("/:id", getMealById);

export default router;