import Food from "../models/Food.js";


export const getAllFoods = async (req, res) => {
    try {
        const foods = await Food.find().sort({ name: 1 });
        res.status(200).json(foods);
    } catch (error) {
        console.error("Error fetching foods:", error);
        res.status(500).json({ message: "Error fetching foods" });
    }
}

export const createFood = async (req, res) => {
    try {
        const { name, calories, protein, carbs, fats } = req.body;
        const food = new Food({ name, calories, protein, carbs, fats });
        await food.save();
        res.status(201).json(food);
    } catch (error) {
        console.error("Error creating food:", error);
        res.status(500).json({ message: "Error creating food" });
    }
}

