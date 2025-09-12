import { Router } from "express";
import {
  getAllDays,
  getDayByDate,
  createDay,
  updateDay,
  deleteDay,
  createMealForDay,
  getMealsForDay,
  getMealByName,
  updateMealForDay,
  deleteMealFromDay,
  addFoodToMeal,
  updateFoodInMeal,
  deleteFoodFromMeal
} from "../controllers/daysController.js";

const router = Router();

router.get("/", getAllDays);
router.get("/:date", getDayByDate);
router.post("/", createDay);
router.patch("/:date", updateDay);
router.delete("/:date", deleteDay);

router.post("/:date/meals", createMealForDay);
router.get("/:date/meals", getMealsForDay);
router.get("/:date/meals/:mealName", getMealByName);
router.patch("/:date/meals/:mealName", updateMealForDay);
router.delete("/:date/meals/:mealName", deleteMealFromDay);

router.post("/:date/meals/:mealName/foods", addFoodToMeal);
router.patch("/:date/meals/:mealName/foods/:entryId", updateFoodInMeal);
router.delete("/:date/meals/:mealName/foods/:entryId", deleteFoodFromMeal);


export default router;