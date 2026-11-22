import { EQUIPMENT_CATEGORIES } from "@/lib/options";

const WEIGHTED = ["dumbbell", "barbell", "plates", "kettlebell", "medicine_ball"];

export function isWeighted(category) {
  return WEIGHTED.includes(category);
}

export function normalizeItem(item) {
  const known = EQUIPMENT_CATEGORIES.some((c) => c.key === item.category);
  return {
    name: String(item.name || "").trim(),
    category: known ? item.category : "other",
    weight_value: Number(item.weight_value) > 0 ? Number(item.weight_value) : "",
    weight_unit: item.weight_unit === "kg" ? "kg" : "lb",
    increment: Number(item.increment) > 0 ? Number(item.increment) : 2.5,
    quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
    notes: item.notes || "",
  };
}

// Reading the same kit again refreshes matching items instead of duplicating them.
export function mergeItems(existing = [], incoming = []) {
  const byName = new Map(existing.map((item) => [String(item.name).toLowerCase(), item]));
  incoming.forEach((raw) => {
    if (!raw?.name || !String(raw.name).trim()) return;
    const item = normalizeItem(raw);
    const key = item.name.toLowerCase();
    byName.set(key, { ...byName.get(key), ...item });
  });
  return [...byName.values()];
}