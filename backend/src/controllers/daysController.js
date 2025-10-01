import Day from "../models/Day.js";
import Meal from "../models/Meal.js";
import Food from "../models/Food.js";
import { getMealRecs } from "../ai/foodRecs.js";


export async function getAllDays(req, res) {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const days = await Day.find({ userId }).populate("meals").sort({ date: -1 });
        res.status(200).json(days);
    } catch (error) {
        console.log("Error getting all days", error);
        res.status(500).json({ message: "Error fetching days" });
    }
}

export async function getFoodRecs(req, res) {
  try {
    const userId = req.auth?.userId;
    const { date, mealName } = req.params
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    
    const day = await Day.findOne({ userId, date });

    if (!day) return res.status(404).json({ message: "Day not found" });

    const meal = await Meal.findOne({ day: day._id, name: mealName }).populate('foods.food');

    if (!meal) {
        return res.status(404).json({ message: "Meal not found" });
    }
    const foods = await Food.find({ userId }).lean();
    const mealFoods = (meal.foods || [])
      .map(entry => {
        const foodDoc = entry.food;
        if (!foodDoc) return null;
        return {
          _id: foodDoc._id,
          name: foodDoc.name,
          brand: foodDoc.brand,
          calories: foodDoc.calories,
          protein: foodDoc.protein,
          carbs: foodDoc.carbs,
          fat: foodDoc.fat,
          tags: foodDoc.tags || [],
          quantity: entry.quantity ?? 1
        };
      })
      .filter(Boolean);

    const suggestions = await getMealRecs({ mealFoods, mealName, foods });
    if (!suggestions.length) return res.status(422).json({ error: "No foods detected" });

    return res.json({ suggestions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Extraction failed" });
  }
}

export async function createDay(req, res) {
    const { date } = req.body;
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ message: "Invalid or missing date. Use YYYY-MM-DD format." });
    }
    try {
        const existingDay = await Day.findOne({ userId, date });
        if (existingDay) {
            return res.status(400).json({ message: "Day already exists" });
        }
        const newDay = new Day({ userId, date, meals: [] });
        await newDay.save();
        res.status(201).json(newDay);
    } catch (error) {
        res.status(500).json({ message: "Error creating day" });
        console.log("Error creating day", error)
    }
}

export async function getDayByDate(req, res) {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const day = await Day.findOne({ userId, date: req.params.date }).populate("meals");
        if (!day) {
            return res.status(404).json({ message: "Day not found" });
        }
        res.status(200).json(day);
    } catch (error) {
        res.status(500).json({ message: "Error fetching day" });
        console.log("Error getting day", error)
    }
}

export async function updateDay(req, res) {
    const { date } = req.body;
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ message: "Invalid or missing date. Use YYYY-MM-DD format." });
    }
    try {
        const day = await Day.findOneAndUpdate({ userId, date: req.params.date }, { date }, { new: true });
        if (!day) {
            return res.status(404).json({ message: "Day not found" });
        }
        res.status(200).json(day);
    } catch (error) {
        res.status(500).json({ message: "Error updating day" });
    }
}
export async function deleteDay(req, res) {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const day = await Day.findOneAndDelete({ userId, date: req.params.date });
        if (!day) {
            return res.status(404).json({ message: "Day not found" });
        }
        res.status(200).json({ message: "Day deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting day" });
    }
}

export async function createMealForDay(req, res) {
    try {
    const { date } = req.params;
    const { name, foods } = req.body;
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });


    if (!name || !['Breakfast', 'Lunch', 'Dinner', 'Snack'].includes(name)) {
        return res.status(400).json({ message: "Invalid or missing meal name" });
    }
    const day = await Day.findOne({ userId, date });
    if (await Meal.findOne({ day: day?._id, name })) {
        return res.status(409).json({ message: `Meal '${name}' already exists for ${date}` });
    }

    if (!day) {
        return res.status(404).json({ message: "Day not found" });
    }
    const newMeal = new Meal({ day: day._id, name, foods: foods || [] });
    await newMeal.save();
    day.meals.push(newMeal._id);
    await day.save();
    res.status(201).json(newMeal);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating meal for day" });
    }
}

export async function getMealsForDay(req, res) {
    try {
    const { date } = req.params;
    const userId = req.auth?.userId;
    console.log(userId);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const day = await Day.findOne({ userId, date }).populate({
        path: 'meals',
        populate: { path: 'foods.food', model: 'Food' }
    });
    if (!day) {
        return res.status(404).json({ message: "Day not found" });
    }
    res.status(200).json(day.meals);
    } catch (error) {
        console.log("Error getting meals for day", error);
        res.status(500).json({ message: "Error fetching meals for day" });
    }
}

export async function getMealByName(req, res) {
    try {
    const { date, mealName } = req.params;
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const day = await Day.findOne({ userId, date });
    if (!day) {
        return res.status(404).json({ message: "Day not found" });
    }
    if (!mealName || !['Breakfast', 'Lunch', 'Dinner', 'Snack'].includes(mealName)) {
        return res.status(400).json({ message: "Invalid or missing meal name" });
    }
    const meal = await Meal.findOne({ day: day._id, name: mealName }).populate('foods.food');
    if (!meal) {
        return res.status(404).json({ message: "Meal not found" });
    }
    res.status(200).json(meal);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching meal by name" });
    }
}

export async function updateMealForDay(req, res) {
    try {
    const { date, mealName } = req.params;
    const { name } = req.body;
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    if (!name || !['Breakfast', 'Lunch', 'Dinner', 'Snack'].includes(name)) {
        return res.status(400).json({ message: "Invalid or missing meal name" });
    }
    const day = await Day.findOne({ userId, date }).populate("meals");
    if (!day) {
        return res.status(404).json({ message: "Day not found" });
    }

    if (day.meals.some(meal => meal.name === name)) {
        return res.status(409).json({ message: `Meal '${name}' already exists for ${date}` });
    }
    const meal = await Meal.findOneAndUpdate({ name: mealName, day: day._id }, { name }, { new: true });
    res.status(200).json(meal);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating meal for day" });
    }
}
export async function deleteMealFromDay(req, res) {
    try {
    const { date, mealName } = req.params;
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const day = await Day.findOne({ userId, date });
    if (!day) {
        return res.status(404).json({ message: "Day not found" });
    }
    const meal = await Meal.findOneAndDelete({ name: mealName, day: day._id });
    if (!meal) {
        return res.status(404).json({ message: "Meal not found" });
    }
    day.meals.pull(meal._id);
    await day.save();
    res.status(200).json({ message: "Meal deleted from day" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting meal from day" });
    }
}

export async function addFoodToMeal(req, res) {
    try {
        const { date, mealName } = req.params;
        const { foodId, quantity } = req.body;
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const day = await Day.findOne({ userId, date });
        if (!day) {
            return res.status(404).json({ message: "Day not found" });
        }
        const meal = await Meal.findOne({ name: mealName, day: day._id });

        if (!meal) {
            return res.status(404).json({ message: "Meal not found" });
        }
        if (meal.foods.some(f => f.food?.toString() === foodId)) {
            return res.status(409).json({ message: "Food already exists in meal" });
        }
        const foodExists = await Food.findOne({ _id: foodId, userId });
        if (!foodExists) {
            return res.status(404).json({ message: "Food not found" });
        }
        meal.foods.push({ food: foodId, quantity: quantity ?? 1 });
        await meal.save();
        res.status(200).json(meal);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error adding food to meal" });
    }
}

export async function updateFoodInMeal(req, res) {
    try {
        const { date, mealName, entryId } = req.params;
        const { foodId, quantity } = req.body;
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const day = await Day.findOne({ userId, date });
        if (!day) {
            return res.status(404).json({ message: "Day not found" });
        }
        const meal = await Meal.findOne({ name: mealName, day: day._id });
        if (!meal) {
            return res.status(404).json({ message: "Meal not found" });
        }
        if (!foodId) {
            return res.status(404).json({ message: "Food Id is required" });
        }
        if (!quantity) {
            return res.status(400).json({ message: "Quantity is required" });
        }
        const foodExists = await Food.findOne({ _id: foodId, userId });
        if (!foodExists) {
            return res.status(404).json({ message: "Food not found" });
        }
        const foodEntry = meal.foods.id(entryId);
        if (!foodEntry) {
            return res.status(404).json({ message: "Food entry not found in meal" });
        }
        foodEntry.food = foodId;
        foodEntry.quantity = quantity;
        await meal.save();
        res.status(200).json(meal);
    } 
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating food in meal" });
    }
}

export async function deleteFoodFromMeal(req, res) {
    try {
        const { date, mealName, entryId } = req.params;
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const day = await Day.findOne({ userId, date });
        if (!day) {
            return res.status(404).json({ message: "Day not found" });
        }
        const meal = await Meal.findOne({ name: mealName, day: day._id });
        if (!meal) {
            return res.status(404).json({ message: "Meal not found" });
        }
        const foodEntry = meal.foods.id(entryId);
        if (!foodEntry) {
            return res.status(404).json({ message: "Food entry not found in meal" });
        }
        meal.foods.remove(foodEntry);
        await meal.save();
        res.status(200).json(meal);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting food from meal" });
    }
}
