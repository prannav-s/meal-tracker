import mongoose, { Schema } from "mongoose";

const daySchema = new Schema({
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ }, // YYYY-MM-DD
    meals: [{ type: Schema.Types.ObjectId, ref: "Meal" }],
  }, { timestamps: true});

// Ensure one day per user per date
daySchema.index({ userId: 1, date: 1 }, { unique: true });
const Day = mongoose.model("Day", daySchema);
export default Day;
