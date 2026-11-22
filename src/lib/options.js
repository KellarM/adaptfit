export const GOALS = [
  { key: "strength", label: "Get stronger" },
  { key: "muscle", label: "Build muscle" },
  { key: "mobility", label: "Move without pain" },
  { key: "fat_loss", label: "Lose weight" },
  { key: "conditioning", label: "More stamina" },
  { key: "pain_free", label: "Protect the elbow" },
];

export const EXPERIENCE = [
  { key: "starting", label: "Just starting out" },
  { key: "returning", label: "Coming back after a break" },
  { key: "intermediate", label: "Comfortable with weights" },
];

export const AREAS = [
  { key: "elbow", label: "Elbow" },
  { key: "shoulder", label: "Shoulder" },
  { key: "wrist", label: "Wrist" },
  { key: "lower_back", label: "Lower back" },
  { key: "knee", label: "Knee" },
  { key: "hip", label: "Hip" },
  { key: "ankle", label: "Ankle" },
  { key: "neck", label: "Neck" },
  { key: "other", label: "Somewhere else" },
];

export const SIDES = [
  { key: "left", label: "Left" },
  { key: "right", label: "Right" },
  { key: "both", label: "Both" },
];

export const STATUSES = [
  { key: "active", label: "Acting up" },
  { key: "recovering", label: "Recovering" },
  { key: "resolved", label: "Resolved" },
];

export const EQUIPMENT_CATEGORIES = [
  { key: "dumbbell", label: "Dumbbells" },
  { key: "barbell", label: "Barbell" },
  { key: "plates", label: "Weight plates" },
  { key: "bench", label: "Bench or sturdy chair" },
  { key: "band", label: "Resistance bands" },
  { key: "kettlebell", label: "Kettlebell" },
  { key: "cable", label: "Cable machine" },
  { key: "pull_up_bar", label: "Pull-up bar" },
  { key: "bike", label: "Stationary bike" },
  { key: "rower", label: "Rowing machine" },
  { key: "treadmill", label: "Treadmill" },
  { key: "medicine_ball", label: "Medicine ball" },
  { key: "other", label: "Something else" },
];

export const labelOf = (list, key) => list.find((x) => x.key === key)?.label || key || "—";