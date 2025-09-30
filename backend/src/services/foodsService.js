import Food from "../models/Food.js";

export function normalizeItems(items) {
  const toNum = v => (typeof v === "number" ? v : Number(v ?? 0)) || 0;
  return items.map(it => ({
    name: String(it.name ?? "").trim(),
    brand: it.brand ? String(it.brand).trim() : undefined,
    tags: Array.isArray(it.tags) ? it.tags.map(s => String(s).trim()).filter(Boolean) : [],
    calories: toNum(it.calories),
    protein: toNum(it.protein),
    carbs: toNum(it.carbs),
    fat: toNum(it.fat)
  })).filter(f => f.name && Number.isFinite(f.calories));
}

export async function upsertFoods(userId, cleaned) {
  const ops = cleaned.map(f => {
    const filter = { userId, name: f.name };
    if (f.brand) filter.brand = f.brand;
    return {
      updateOne: {
        filter,
        update: {
          $setOnInsert: { userId, name: f.name, ...(f.brand ? { brand: f.brand } : {}) },
          $set: { calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat, tags: f.tags }
        },
        upsert: true
      }
    };
  });
  await Food.bulkWrite(ops);
  const orFilters = cleaned.map(f => ({ userId, name: f.name, ...(f.brand ? { brand: f.brand } : {}) }));
  return Food.find({ $or: orFilters }).lean();
}