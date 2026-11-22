import { LIBRARY } from "./exerciseLibrary";
import { addDays, mondayOf, prettyDate, round } from "./format";

const SPLITS = {
  2: [
    { title: "Full body A", focus: "Whole body, gentle start", patterns: ["squat", "push", "pull", "hinge", "core"] },
    { title: "Full body B", focus: "Whole body, second pass", patterns: ["hinge", "pull", "push", "lunge", "core"] },
  ],
  3: [
    { title: "Full body A", focus: "Whole body, gentle start", patterns: ["squat", "push", "pull", "core", "mobility"] },
    { title: "Full body B", focus: "Hinge, pull and balance", patterns: ["hinge", "pull", "push", "lunge", "core"] },
    { title: "Full body C", focus: "Steady and controlled", patterns: ["squat", "push", "pull", "hinge", "core"] },
  ],
  4: [
    { title: "Upper body", focus: "Push and pull", patterns: ["push", "pull", "push", "pull", "core"] },
    { title: "Lower body", focus: "Legs and hips", patterns: ["squat", "hinge", "lunge", "core", "mobility"] },
    { title: "Upper body", focus: "Pull and push", patterns: ["pull", "push", "pull", "push", "core"] },
    { title: "Legs and easy cardio", focus: "Lower body plus walking", patterns: ["squat", "hinge", "cardio", "core"] },
  ],
  5: [
    { title: "Upper body", focus: "Push and pull", patterns: ["push", "pull", "push", "pull", "core"] },
    { title: "Lower body", focus: "Legs and hips", patterns: ["squat", "hinge", "lunge", "core"] },
    { title: "Upper body", focus: "Pull and push", patterns: ["pull", "push", "pull", "push", "core"] },
    { title: "Conditioning", focus: "Easy cardio and trunk", patterns: ["cardio", "core", "mobility"] },
    { title: "Full body", focus: "Whole body", patterns: ["squat", "push", "pull", "hinge", "core"] },
  ],
  6: [
    { title: "Upper body", focus: "Push and pull", patterns: ["push", "pull", "push", "pull", "core"] },
    { title: "Lower body", focus: "Legs and hips", patterns: ["squat", "hinge", "lunge", "core"] },
    { title: "Conditioning", focus: "Easy cardio", patterns: ["cardio", "core", "mobility"] },
    { title: "Upper body", focus: "Pull and push", patterns: ["pull", "push", "pull", "push", "core"] },
    { title: "Full body", focus: "Whole body", patterns: ["squat", "push", "pull", "hinge", "core"] },
    { title: "Mobility", focus: "Move and recover", patterns: ["mobility", "core", "cardio"] },
  ],
};

const DAY_OFFSETS = {
  2: [1, 4],
  3: [0, 2, 4],
  4: [0, 1, 3, 5],
  5: [0, 1, 2, 4, 5],
  6: [0, 1, 2, 3, 4, 5],
};

export function feedbackAdjustment(sessions = []) {
  const done = sessions
    .filter((s) => s.status === "completed")
    .sort((a, b) => String(b.completed_at || b.date).localeCompare(String(a.completed_at || a.date)));
  const last = done[0];
  if (!last) return { factor: 1, note: "" };

  const elbow = Number(last.elbow_pain ?? 0);
  const feel = Number(last.body_feel ?? 3);

  if (elbow >= 6)
    return {
      factor: 0.8,
      note: `Load eased 20% — your elbow reported ${elbow}/10 after the ${prettyDate(last.date)} session.`,
    };
  if (elbow >= 4)
    return {
      factor: 0.9,
      note: `Load eased 10% — your elbow reported ${elbow}/10 last session.`,
    };
  if (elbow <= 2 && feel >= 4)
    return {
      factor: 1.05,
      note: `Small step up — your elbow sat at ${elbow}/10 and the session felt good.`,
    };
  return { factor: 1, note: "" };
}

function prescription(profile) {
  const goals = profile?.goals || [];
  const experience = profile?.experience || "starting";
  const sets = experience === "starting" ? 2 : 3;
  let reps = 10;
  let rest = 90;

  if (goals.includes("strength")) {
    reps = experience === "starting" ? 8 : 6;
    rest = 120;
  } else if (goals.includes("muscle")) {
    reps = 10;
    rest = 75;
  } else {
    reps = 12;
    rest = 60;
  }
  return { sets, reps, rest };
}

function loadFor(exercise, equipment, factor) {
  if (exercise.load === "body") return { label: "bodyweight", kg: 0 };
  if (exercise.load === "band") return { label: "medium band", kg: 0 };
  if (exercise.load === "time") return { label: "hold", kg: 0 };

  const item = equipment.find(
    (e) => exercise.equipment.includes(e.category) && Number(e.weight_value) > 0
  );
  if (!item) return { label: "light", kg: 0 };

  const step = Number(item.increment) || 1;
  const value = Math.max(step, round(Number(item.weight_value) * factor, step));
  const unit = item.weight_unit || "kg";
  const kg = unit === "lb" ? value * 0.4536 : value;

  return {
    label: `${value} ${unit}${exercise.load === "per_hand" ? " each" : ""}`,
    kg: Math.round(kg * 10) / 10,
  };
}

function pickExercise(pattern, { owned, avoid, maxLevel, used, salt }) {
  const candidates = LIBRARY.filter(
    (ex) =>
      ex.pattern === pattern &&
      ex.level <= maxLevel &&
      ex.equipment.some((e) => owned.has(e)) &&
      !ex.tags.some((t) => avoid.has(t))
  );
  if (!candidates.length) return null;

  const fresh = candidates.filter((ex) => !used.has(ex.id));
  const list = fresh.length ? fresh : candidates;
  const choice = list[salt % list.length];
  used.add(choice.id);
  return choice;
}

export function buildWeek({
  profile,
  injuries = [],
  equipment = [],
  sessions = [],
  weekStart = mondayOf(),
}) {
  const avoid = new Set(
    injuries.filter((i) => i.status !== "resolved").flatMap((i) => i.avoid_tags || [])
  );
  const owned = new Set(["bodyweight", ...equipment.map((e) => e.category)]);
  const maxLevel =
    profile?.experience === "intermediate" ? 3 : profile?.experience === "returning" ? 2 : 1;
  const target = Math.min(Math.max(Number(profile?.weekly_target) || 3, 2), 6);
  const split = SPLITS[target] || SPLITS[3];
  const offsets = DAY_OFFSETS[target] || DAY_OFFSETS[3];
  const { factor, note } = feedbackAdjustment(sessions);
  const base = prescription(profile);
  const used = new Set();

  return split.map((day, dayIdx) => {
    const exercises = [];

    day.patterns.forEach((pattern, slot) => {
      const ex = pickExercise(pattern, {
        owned,
        avoid,
        maxLevel,
        used,
        salt: dayIdx * 3 + slot,
      });
      if (!ex) return;

      const load = loadFor(ex, equipment, factor);
      const isTimed = ex.load === "time" || pattern === "cardio" || pattern === "mobility";

      exercises.push({
        name: ex.name,
        pattern,
        cue: ex.cue,
        muscle: ex.muscle,
        sets: pattern === "mobility" ? 2 : base.sets,
        reps: isTimed ? null : base.reps,
        duration:
          pattern === "cardio" ? "8 min easy" : pattern === "mobility" ? "1 min" : "hold 20–30 sec",
        rest_seconds: pattern === "core" || pattern === "mobility" ? Math.min(base.rest, 60) : base.rest,
        load: load.label,
        load_kg: load.kg,
        swapped: (pattern === "pull" || pattern === "carry") && avoid.has("grip"),
        sets_log: [],
      });
    });

    const minutes = Math.max(
      15,
      Math.round(exercises.reduce((t, e) => t + e.sets * (e.rest_seconds + 40), 0) / 60)
    );

    return {
      date: addDays(weekStart, offsets[dayIdx]),
      week_start: weekStart,
      day_index: dayIdx,
      title: day.title,
      focus: day.focus,
      status: "planned",
      planned_minutes: minutes,
      load_factor: factor,
      adjustment_note: dayIdx === 0 ? note : "",
      exercises,
    };
  });
}