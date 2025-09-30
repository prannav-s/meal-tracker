import mongoose from "mongoose";
import Food from "../models/Food.js";
import { extractFoodsFromImage } from "../ai/foodExtraction.js";
import { normalizeItems, upsertFoods } from "../services/foodsService.js";

export async function imageUpload(req, res) {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!req.file || !req.file.mimetype?.startsWith("image/"))
      return res.status(400).json({ error: "No image or bad type" });

    const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const raw = await extractFoodsFromImage(dataUrl);
    console.log(raw)
    if (!raw.length) return res.status(422).json({ error: "No foods detected" });

    const cleaned = normalizeItems(raw);
    if (!cleaned.length) return res.status(422).json({ error: "Parsed foods invalid" });

    const docs = await upsertFoods(userId, cleaned);
    return res.json({ count: docs.length, items: docs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Extraction failed" });
  }
}

export const getAllFoods = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const foods = await Food.find({ userId }).sort({ name: 1 });
        res.status(200).json(foods);
    } catch (error) {
        console.error("Error fetching foods:", error);
        res.status(500).json({ message: "Error fetching foods" });
    }
}

export const getFoodById = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const { foodId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(foodId)) {
            return res.status(404).json({ message: "Food not found" });
        }
        const food = await Food.findOne({ _id: foodId, userId });
        if (!food) {
            return res.status(404).json({ message: "Food not found" });
        }
        res.status(200).json(food);
    } catch (error) {
        console.error("Error fetching food:", error);
        res.status(500).json({ message: "Error fetching food" });
    }
}

export const createFood = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const { name, calories, protein, carbs, fat, tags, brand } = req.body;
        const food = new Food({ userId, name, calories, protein, carbs, fat, tags, brand });
        await food.save();
        res.status(201).json(food);
    } catch (error) {
        console.error("Error creating food:", error);
        res.status(500).json({ message: "Error creating food" });
    }
}

export async function deleteFood(req, res) {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const {foodId} = req.params;
        const food = await Food.findOneAndDelete({ _id: foodId, userId });
        if (!food) {
            return res.status(404).json({ message: "Food not found" });
        }

        res.status(200).json({ message: "Food deleted" });

    }
    catch(error) {
        res.status(500).json({message: "Error deleting food"})
    }
}
export async function updateFood(req, res) {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const {foodId} = req.params;
        const { name, calories, protein, carbs, fat, tags, brand } = req.body;
        const food = await Food.findOneAndUpdate(
            { _id: foodId, userId },
            { name, calories, protein, carbs, fat, tags, brand },
            { new: true }
        );
        if (!food) {
            return res.status(404).json({ message: "Food not found" });
        }
        res.status(200).json({food});

    }
    catch(error) {
        res.status(500).json({message: "Error updating food"})
        console.log(error)
    }
}
