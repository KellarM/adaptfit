import { LIBRARY } from "./exerciseLibrary";
import { addDays, mondayOf, prettyDate, round } from "./format";
import { KG_PER_LB, weightToLb } from "./units";

// Every training day ends with a real conditioning block — intervals on the bike
// or treadmill, prescribed by the movement's own dose.
const SPLITS = {
  2: [
    { title: "Full body A", focus: "Whole body plus intervals", patterns: ["squat", "push", "pull", "hinge", "core", "cardio"] },
    { title: "Full body B", focus: "Whole body plus intervals", patterns: ["hinge", "pull", "push", "lunge", "core", "cardio"] },
  ],
  3: [
    { title: "Full body A", focus: "Squat, push, pull plus intervals", patterns: ["squat", "push", "pull", "core", "mobility", "cardio"] },
    { title: "Full body B", focus: "Hinge, pull and single leg", patterns: ["hinge", "pull", "push", "lunge", "core", "cardio"] },
    { title: "Full body C", focus: "Whole body, hardest day", patterns: ["squat", "push", "pull", "hinge", "core", "cardio"] },
  ],
  4: [
    { title: "Upper body", focus: "Push and pull plus intervals", patterns: ["push", "pull", "push", "pull", "core", "cardio"] },
    { title: "Lower body", focus: "Legs and hips", patterns: ["squat", "hinge", "lunge", "core", "mobility", "cardio"] },
    { title: "Upper body", focus: "Pull and push plus intervals", patterns: ["pull", "push", "pull", "push", "core", "cardio"] },
    { title: "Conditioning", focus: "Two cardio blocks and trunk", patterns: ["cardio", "core", "cardio"] },
  ],
  5: [
    { title: "Upper body", focus: "Push and pull plus intervals", patterns: ["push", "pull", "push", "pull", "core", "cardio"] },
    { title: "Lower body", focus: "Legs and hips", patterns: ["squat", "hinge", "lunge", "core", "cardio"] },
    { title: "Upper body", focus: "Pull and push plus intervals", patterns: ["pull", "push", "pull", "push", "core", "cardio"] },
    { title: "Conditioning", focus: "Two cardio blocks and trunk", patterns: ["cardio", "core", "cardio", "mobility"] },
    { title: "Full body", focus: "Whole body plus intervals", patterns: ["squat", "push", "pull", "hinge", "core", "cardio"] },
  ],
  6: [
    { title: "Upper body", focus: "Push and pull plus intervals", patterns: ["push", "pull", "push", "pull", "core", "cardio"] },
    { title: "Lower body", focus: "Legs and hips", patterns: ["squat", "hinge", "lunge", "core", "cardio"] },
    { title: "Conditioning", focus: "Two cardio blocks", patterns: ["cardio", "core", "cardio"] },
    { title: "Upper body", focus: "Pull and push plus intervals", patterns: ["pull", "push", "pull", "push", "core", "cardio"] },
    { title: "Full body", focus: "Whole body plus intervals", patterns: ["squat", "push", "pull", "hinge", "core", "cardio"] },
    { title: "Mobility and easy cardio", focus: "Move and recover", patterns: ["mobility", "core", "cardio"] },
  ],
};

// Strength work should feel like work: the last set of each movement is close to hard.
const EFFORT_CUE =
  "Last set close to hard — stop with about two good reps left, and add weight once you clear the top of the rep range.";
const EFFORT_PATTERNS = new Set(["push", "pull", "squat", "hinge", "lunge", "carry"]);

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

// Heaviest usable weight in the kit for this movement, so the working weight
// starts from what's actually on the rack rather than the lightest piece.
function heaviestFor(exercise, equipment) {
  return equipment
    .filter((e) => exercise.equipment.includes(e.category) && Number(e.weight_value) > 0)
    .reduce(
      (best, item) => {
        const lb = weightToLb(item.weight_value, item.weight_unit);
        return lb > best.lb
          ? { lb, increment: Number(item.increment) || 5 }
          : best;
      },
      { lb: 0, increment: 5 }
    );
}

// Share of that heaviest weight to start from, by experience and by whether the
// weight is held in each hand or loaded as one piece.
const WORK_SHARE = {
  per_hand: { starting: 0.4, returning: 0.55, intermediate: 0.7 },
  total: { starting: 0.5, returning: 0.65, intermediate: 0.8 },
};

function loadFor(exercise, equipment, factor, experience) {
  if (exercise.load === "body") return { label: "bodyweight", lb: 0, kg: 0 };
  if (exercise.load === "band") return { label: "medium band", lb: 0, kg: 0 };
  if (exercise.load === "time") return { label: "hold", lb: 0, kg: 0 };

  const heaviest = heaviestFor(exercise, equipment);
  if (!heaviest.lb) return { label: "light", lb: 0, kg: 0 };

  const shares = WORK_SHARE[exercise.load] || WORK_SHARE.total;
  const share = shares[experience] || shares.starting;
  const step = heaviest.increment;
  const value = Math.max(step, round(heaviest.lb * share * factor, step));

  return {
    label: `${value} lb${exercise.load === "per_hand" ? " each" : ""}`,
    lb: value,
    kg: Math.round(value * KG_PER_LB * 10) / 10,
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
  const experience = profile?.experience || "starting";
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

      // Conditioning is one continuous block, ticked once when it's done.
      if (pattern === "cardio") {
        exercises.push({
          name: ex.name,
          pattern,
          cue: ex.cue,
          muscle: ex.muscle,
          sets: 1,
          reps: null,
          duration: ex.dose || "20 min steady",
          rest_seconds: 0,
          load: "one block",
          load_lb: 0,
          load_kg: 0,
          swapped: false,
          sets_log: [],
        });
        return;
      }

      const load = loadFor(ex, equipment, factor, experience);
      const isTimed = ex.load === "time" || pattern === "mobility";

      exercises.push({
        name: ex.name,
        pattern,
        cue: EFFORT_PATTERNS.has(pattern) ? `${ex.cue} ${EFFORT_CUE}` : ex.cue,
        muscle: ex.muscle,
        sets: pattern === "mobility" ? 2 : base.sets,
        reps: isTimed ? null : base.reps,
        duration: pattern === "mobility" ? "1 min" : "hold 20–30 sec",
        rest_seconds: pattern === "core" || pattern === "mobility" ? Math.min(base.rest, 60) : base.rest,
        load: load.label,
        load_lb: load.lb,
        load_kg: load.kg,
        swapped: (pattern === "pull" || pattern === "carry") && avoid.has("grip"),
        sets_log: [],
      });
    });

    const minutes = Math.max(
      15,
      Math.round(
        exercises.reduce((t, e) => {
          if (e.pattern === "cardio") {
            const block = Number(String(e.duration).match(/\d+/)?.[0]) || 20;
            return t + block * 60;
          }
          return t + e.sets * (e.rest_seconds + 40);
        }, 0) / 60
      )
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