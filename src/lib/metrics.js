export const METRICS = [
  { key: "weight_kg", label: "Body weight", unit: "kg", step: "0.1" },
  { key: "neck_cm", label: "Neck", unit: "cm", length: true },
  { key: "chest_cm", label: "Chest", unit: "cm", length: true },
  { key: "waist_cm", label: "Waist", unit: "cm", length: true },
  { key: "hips_cm", label: "Hips", unit: "cm", length: true },
  { key: "biceps_left_cm", label: "Left biceps", unit: "cm", length: true },
  { key: "biceps_right_cm", label: "Right biceps", unit: "cm", length: true },
  { key: "forearm_left_cm", label: "Left forearm", unit: "cm", length: true },
  { key: "forearm_right_cm", label: "Right forearm", unit: "cm", length: true },
  { key: "thigh_left_cm", label: "Left thigh", unit: "cm", length: true },
  { key: "thigh_right_cm", label: "Right thigh", unit: "cm", length: true },
  { key: "calf_left_cm", label: "Left calf", unit: "cm", length: true },
  { key: "calf_right_cm", label: "Right calf", unit: "cm", length: true },
];

// Body weight keeps its own unit; every tape measure follows the chosen one.
export function metricUnit(metric, lengthUnit = "cm") {
  return metric.length ? lengthUnit : metric.unit;
}