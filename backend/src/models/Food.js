import mongoose, { Schema } from "mongoose";

const FoodSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    grams: { type: Number, min: 0, required: true },
    kcal: { type: Number, min: 0, required: true },
    protein_g: { type: Number, min: 0, default: 0 },
    carbs_g: { type: Number, min: 0, default: 0 },
    fat_g: { type: Number, min: 0, default: 0 },
    tags: [{ type: String, trim: true }],
    brand: { type: String, trim: true }
  },
  { timestamps: true }
);

FoodSchema.index({ name: 1 });
const Food = mongoose.model("Food", FoodSchema);
export default Food;