export const METRICS = [
  {
    key: "weight_kg",
    label: "Body weight",
    unit: "kg",
    step: "0.1",
    site: "Same scale, same time of day, before you eat.",
  },
  {
    key: "neck_cm",
    label: "Neck",
    unit: "cm",
    length: true,
    site: "Just below the voice box, tape level, don't flare the neck.",
  },
  {
    key: "shoulders_cm",
    label: "Shoulders",
    unit: "cm",
    length: true,
    site: "Widest point across both shoulders, arms hanging relaxed.",
  },
  {
    key: "chest_cm",
    label: "Chest",
    unit: "cm",
    length: true,
    site: "Widest part of the chest, tape under the armpits.",
  },
  {
    key: "waist_cm",
    label: "Waist",
    unit: "cm",
    length: true,
    site: "Narrowest point, level with the belly button, breathe out normally.",
  },
  {
    key: "hips_cm",
    label: "Hips",
    unit: "cm",
    length: true,
    site: "Widest point across the seat, feet together.",
  },
  {
    key: "biceps_left_cm",
    label: "Left biceps",
    unit: "cm",
    length: true,
    site: "Widest part of the upper arm, arm relaxed at your side.",
  },
  {
    key: "biceps_right_cm",
    label: "Right biceps",
    unit: "cm",
    length: true,
    site: "Widest part of the upper arm, arm relaxed at your side.",
  },
  {
    key: "forearm_left_cm",
    label: "Left forearm",
    unit: "cm",
    length: true,
    site: "Widest point just below the elbow crease, arm relaxed.",
  },
  {
    key: "forearm_right_cm",
    label: "Right forearm",
    unit: "cm",
    length: true,
    site: "Widest point just below the elbow crease, arm relaxed.",
  },
  {
    key: "thigh_left_cm",
    label: "Left thigh",
    unit: "cm",
    length: true,
    site: "Widest point just below the glute fold, standing tall.",
  },
  {
    key: "thigh_right_cm",
    label: "Right thigh",
    unit: "cm",
    length: true,
    site: "Widest point just below the glute fold, standing tall.",
  },
  {
    key: "calf_left_cm",
    label: "Left calf",
    unit: "cm",
    length: true,
    site: "Widest point of the lower leg, weight even on both feet.",
  },
  {
    key: "calf_right_cm",
    label: "Right calf",
    unit: "cm",
    length: true,
    site: "Widest point of the lower leg, weight even on both feet.",
  },
];

// Tape sites drawn on the body diagram, as percentages of the picture.
export const BODY_SITES = [
  { id: "neck", label: "Neck", x: 50, y: 14, keys: ["neck_cm"] },
  { id: "shoulders", label: "Shoulders", x: 50, y: 22, keys: ["shoulders_cm"] },
  { id: "chest", label: "Chest", x: 50, y: 29, keys: ["chest_cm"] },
  { id: "waist", label: "Waist", x: 50, y: 37, keys: ["waist_cm"] },
  { id: "hips", label: "Hips", x: 50, y: 43, keys: ["hips_cm"] },
  { id: "biceps", label: "Biceps", x: 24, y: 28, keys: ["biceps_left_cm", "biceps_right_cm"] },
  {
    id: "forearms",
    label: "Forearms",
    x: 20,
    y: 38,
    keys: ["forearm_left_cm", "forearm_right_cm"],
  },
  { id: "thighs", label: "Thighs", x: 40, y: 58, keys: ["thigh_left_cm", "thigh_right_cm"] },
  { id: "calves", label: "Calves", x: 41, y: 79, keys: ["calf_left_cm", "calf_right_cm"] },
];

// Body weight keeps its own unit; every tape measure follows the chosen one.
export function metricUnit(metric, lengthUnit = "cm") {
  return metric.length ? lengthUnit : metric.unit;
}