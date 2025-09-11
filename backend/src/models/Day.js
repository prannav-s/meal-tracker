import mongoose, { Schema } from "mongoose";

const daySchema = new Schema({
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ }, // YYYY-MM-DD
    meals: [{ type: Schema.Types.ObjectId, ref: "Meal" }],
  }, { timestamps: true});

daySchema.index({ date: 1 }, { unique: true });
const Day = mongoose.model("Day", daySchema);
export default Day;