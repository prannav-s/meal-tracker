import Day from "../models/Day.js";

export async function getAllDays(req, res) {
    try {
        const days = await Day.find().populate("meals").sort({ date: -1 });
        res.status(200).json(days);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching days" });
    }
}

export async function createDay(req, res) {
    const { date } = req.body;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ message: "Invalid or missing date. Use YYYY-MM-DD format." });
    }
    try {
        const existingDay = await Day.findOne({ date: req.params.date });
        if (existingDay) {
            return res.status(400).json({ message: "Day already exists" });
        }
        const newDay = new Day({ date, meals: [] });
        await newDay.save();
        res.status(201).json(newDay);
    } catch (error) {
        res.status(500).json({ message: "Error creating day" });
    }
}

export async function getDayByDate(req, res) {
    try {
        const day = await Day.findOne({ date: req.params.date }).populate("meals");
        if (!day) {
            return res.status(404).json({ message: "Day not found" });
        }
        res.status(200).json(day);
    } catch (error) {
        res.status(500).json({ message: "Error fetching day" });
    }
}

export async function updateDay(req, res) {
    const { date } = req.body;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ message: "Invalid or missing date. Use YYYY-MM-DD format." });
    }
    try {
        const day = await Day.findOneAndUpdate({ date: req.params.date }, { date }, { new: true });
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
        const day = await Day.findOneAndDelete({ date: req.params.date });
        if (!day) {
            return res.status(404).json({ message: "Day not found" });
        }
        res.status(200).json({ message: "Day deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting day" });
    }
}
