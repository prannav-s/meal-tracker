import { openai } from "../lib/openai.js";

const foodsSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          calories: { type: "number" },
          protein: { type: "number" },
          carbs: { type: "number" },
          fat: { type: "number" },
          tags: { type: "array", items: { type: "string" } },
          brand: { type: "string" }
        },
        required: [
          "name",
          "calories",
          "protein",
          "carbs",
          "fat",
          "tags",
          "brand"
        ]
      }
    }
  },
  required: ["items"]
};

const responseFormat = {
  type: "json_schema",
  name: "create_foods",
  schema: foodsSchema,
  strict: true
};

const instructions = [
  "You are extracting foods/macros for a calorie tracker.",
  "Respond with JSON that matches the provided schema exactly.",
  "Each item maps to one product or dish that appears in the image.",
  "Return numbers only. Missing macros → 0.",
  "Prefer per serving; if only per 100 g is present, use that.",
  "Merge duplicate items and add obvious tags.",
  "Always include 'AI Generated' in the tags array.",
  "Example: {\"items\":[{\"name\":\"Greek Yogurt\",\"calories\":130,\"protein\":11,\"carbs\":9,\"fat\":5,\"tags\":[\"AI Generated\",\"Dairy\"]}]}"
].join("\n");

export async function extractFoodsFromImage(dataUrl) {
  const input = [
    {
      role: "system",
      content: [{ type: "input_text", text: instructions }]
    },
    {
      role: "user",
      content: [{ type: "input_image", image_url: dataUrl }]
    }
  ];

  const resp = await openai.responses.create({
    model: "o4-mini",
    input,
    text: { format: responseFormat }
  });

  const textChunks = [];
  if (Array.isArray(resp.output_text) && resp.output_text.length) {
    textChunks.push(...resp.output_text);
  }

  for (const output of resp.output ?? []) {
    if (output?.type !== "message") continue;
    for (const part of output.content ?? []) {
      if (part?.type === "output_text" && part.text) textChunks.push(part.text);
      if (part?.type === "text" && part.text) textChunks.push(part.text);
    }
  }

  const rawPayload = textChunks.join("").trim();
  if (!rawPayload) {
    console.warn("No text payload returned from OpenAI", JSON.stringify(resp, null, 2));
    return [];
  }

  let parsed;
  try {
    parsed = JSON.parse(rawPayload);
  } catch (err) {
    console.error("Failed to parse OpenAI payload", err, rawPayload);
    return [];
  }

  if (!Array.isArray(parsed.items)) {
    console.warn("OpenAI payload missing items array", parsed);
    return [];
  }

  return parsed.items;
}
