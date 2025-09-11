import mongoose, { Schema } from "mongoose";

const mealSchema = new Schema({ 
    name: { type: String, 
        required: true,
        enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack']
     },
     time: { type: Date, required: true },
     foods: [{type: Schema.Types.ObjectId, ref: 'Food'}],
    }, { timestamps: true}
);

mealSchema.index({ name: 1});
const Meal = mongoose.model("Meal", mealSchema);
export default Meal;
