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

export const getFoodById = async (req, res) => {
    try {
        const { foodId } = req.params;
        const food = await Food.findById(foodId);
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
        const { name, calories, protein, carbs, fat, tags, brand } = req.body;
        const food = new Food({ name, calories, protein, carbs, fat, tags, brand });
        await food.save();
        res.status(201).json(food);
    } catch (error) {
        console.error("Error creating food:", error);
        res.status(500).json({ message: "Error creating food" });
    }
}

export async function deleteFood(req, res) {
    try {
        const {foodId} = req.params;
        const food = await Food.findByIdAndDelete(foodId);
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
        const {foodId} = req.params;
        const { name, calories, protein, carbs, fat, tags, brand } = req.body;
        const food = await Food.findByIdAndUpdate(
            foodId,
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
