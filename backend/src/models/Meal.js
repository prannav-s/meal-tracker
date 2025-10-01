import mongoose, { Schema } from "mongoose";

const mealSchema = new Schema({
    day: { type: Schema.Types.ObjectId, ref: 'Day', required: true },
    name: {
        type: String,
        required: true,
        enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
    },
    foods: [{
        food: { type: Schema.Types.ObjectId, ref: 'Food', required: true },
        quantity: { type: Number, min: 0, default: 1, require: true },
    }],
}, { timestamps: true });

mealSchema.index({ day: 1, name: 1 }, { unique: true });
const Meal = mongoose.model("Meal", mealSchema);
export default Meal;
