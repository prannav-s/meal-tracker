import { Router } from "express";

import {
    getAllFoods,
    createFood,
    deleteFood,
    updateFood
} 
from "../controllers/foodsController.js";

const router = Router();

router.get("/", getAllFoods);
router.post("/", createFood);
router.delete("/:foodId", deleteFood)
router.put("/:foodId", updateFood)
export default router;