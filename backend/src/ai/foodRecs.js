import { openai } from "../lib/openai.js";

const mealRecsSchema = {
  type: "object",
  properties: {
    suggestions: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["foodId", "name", "portion", "macros", "why"],
        properties: {
          foodId: { type: "string" },
          name:   { type: "string" },
          portion:{ type: "string", description: "e.g., '170 g', '1 cup', '2 tortillas'" },
          macros: {
            type: "object",
            additionalProperties: false,
            required: ["calories","protein","carbs","fat"],
            properties: {
              calories: { type: "number" },
              protein:  { type: "number" },
              carbs:    { type: "number" },
              fat:      { type: "number" }
            }
          },
          why: { type: "string", maxLength: 200 }
        }
      }
    }
  },
  required: ["suggestions"],
  additionalProperties: false
};

const responseFormat = {
  type: "json_schema",
  name: "MealRecommendations",
  schema: mealRecsSchema,
  strict: true
};

export async function getMealRecs({ mealFoods, mealName, foods }) {
  const mealItems = Array.isArray(mealFoods) ? mealFoods : [];
  const currentFoods = mealItems.map(f => {
    const quantity = f.quantity ?? 1;
    return {
      foodId: String(f._id),
      name: f.name,
      brand: f.brand || null,
      quantity,
      per_unit: {
        calories: f.calories,
        protein: f.protein,
        carbs: f.carbs,
        fat: f.fat
      },
      totals: {
        calories: quantity * f.calories,
        protein: quantity * f.protein,
        carbs: quantity * f.carbs,
        fat: quantity * f.fat
      },
      tags: f.tags || []
    };
  });

  const candidates = foods.map(f => ({
    foodId: String(f._id),
    name: f.name,
    brand: f.brand || null,
    per_unit: {
      calories: f.calories,
      protein: f.protein,
      carbs: f.carbs,
      fat: f.fat
    },
    tags: f.tags || []
  }));

  const system = [
    "You are a nutrition assistant.",
    "Pick 3–5 foods from the provided candidates (do not invent new foods).",
    "Ensure foods are tailored to the specific meal you are targeting",
    "Propose practical portion sizes that help close any dietary gaps.",
    "If gaps are nearly closed, favor balance and variety.",
    "Return strictly valid JSON matching the supplied JSON Schema. No extra keys."
  ].join("\n");

  const user = [
    `Meal: ${mealName}`,
    `Foods already in meal (quantity, per-unit macros, totals):`,
    JSON.stringify(currentFoods, null, 2),
    `Candidate foods available to recommend:`,
    JSON.stringify(candidates, null, 2)
  ].join("\n\n");

  const resp = await openai.responses.create({
    model: "gpt-4.1-mini", // fast + good for structured outputs
    input: [
      { role: "system", content: [{ type: "input_text", text: system }] },
      { role: "user",   content: [{ type: "input_text", text: user }] }
    ],
    // IMPORTANT: Responses API uses text.format (not response_format)
    text: { format: responseFormat }
  });

  const first = resp.output?.[0]?.content?.[0];
  const data = first?.type === "output_text" ? JSON.parse(first.text) : null;
  if (!data?.suggestions) throw new Error("Bad LLM response shape");
  return data.suggestions;
}
