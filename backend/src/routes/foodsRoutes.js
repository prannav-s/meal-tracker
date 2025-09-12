import { Router } from "express";

import {
    getAllFoods,
    createFood
} 
from "../controllers/foodsController.js";

const router = Router();

router.get("/", getAllFoods);
router.post("/", createFood);
export default router;