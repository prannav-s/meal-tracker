import { Router } from "express";
import { upload } from "../middleware/upload.js";

import {
    getAllFoods,
    getFoodById,
    createFood,
    deleteFood,
    updateFood,
    imageUpload
} from "../controllers/foodsController.js";

const router = Router();

router.get("/", getAllFoods);
router.get("/:foodId", getFoodById);
router.post("/", createFood);
router.delete("/:foodId", deleteFood)
router.put("/:foodId", updateFood)
router.post("/upload", upload.single("image"), imageUpload);

export default router;
