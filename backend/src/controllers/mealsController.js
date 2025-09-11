import Meal from "../models/Meal.js";

export async function getMealById(req, res) {
    try {
        const meal = await Meal.findById(req.params.id);
        if (!meal) {
            return res.status(404).json({ message: "Meal not found" });
        }
        res.status(200).json(meal);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching meal" });
    }
}