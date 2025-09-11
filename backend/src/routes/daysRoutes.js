import { Router } from "express";
import {
  getAllDays,
  getDayByDate,
  createDay,
  updateDay,
  deleteDay,
} from "../controllers/daysController.js";

const router = Router();

router.get("/", getAllDays);
router.get("/:date", getDayByDate);
router.post("/", createDay);
router.patch("/:date", updateDay);
router.delete("/:date", deleteDay);

export default router;