import mongoose, { Schema } from "mongoose";

const FoodSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    calories: { type: Number, min: 0, required: true },
    protein: { type: Number, min: 0, default: 0, required: true },
    carbs: { type: Number, min: 0, default: 0, required: true },
    fat: { type: Number, min: 0, default: 0, required: true },
    tags: [{ type: String, trim: true }],
    brand: { type: String, trim: true }
  },
  { timestamps: true }
);

const Food = mongoose.model("Food", FoodSchema);
export default Food;