// Helpers for the log of what Michael actually did. Deliberately separate from
// lib/plan.js: nothing here reads the generated plan, and the plan never reads
// this. Two systems, one direction of travel only when he switches suggestions on.

export function strengthEntry(name, sets = []) {
  return {
    kind: "strength",
    name: (name || "").trim(),
    sets: sets
      .filter((s) => s.reps !== "" || s.weight !== "")
      .map((s) => ({
        reps: s.reps === "" ? null : Number(s.reps),
        weight: s.weight === "" ? null : Number(s.weight),
      })),
    segments: [],
    minutes: null,
    metrics: { distance_km: null, calories: null, avg_speed_kph: null, rounds: null },
    note: "",
  };
}

export function cardioEntry(name, segments = []) {
  return {
    kind: "cardio",
    name: (name || "").trim(),
    sets: [],
    segments: segments
      .filter((s) => s.minutes !== "")
      .map((s) => ({
        minutes: s.minutes === "" ? null : Number(s.minutes),
        mode: s.mode || "other",
        speed_kph: s.speed_kph === "" || s.speed_kph == null ? null : Number(s.speed_kph),
        incline: s.incline === "" || s.incline == null ? null : Number(s.incline),
      })),
    minutes: segments.reduce((t, s) => t + (Number(s.minutes) || 0), 0) || null,
    metrics: { distance_km: null, calories: null, avg_speed_kph: null, rounds: null },
    note: "",
  };
}

export function activityEntry(name, minutes, metrics = {}) {
  const clean = (v) => (v === "" || v == null ? null : Number(v));
  return {
    kind: "activity",
    name: (name || "").trim(),
    sets: [],
    segments: [],
    minutes: clean(minutes),
    metrics: {
      distance_km: clean(metrics.distance_km),
      calories: clean(metrics.calories),
      avg_speed_kph: clean(metrics.avg_speed_kph),
      rounds: clean(metrics.rounds),
    },
    note: "",
  };
}

// Whatever the model returns, it goes through here before it is stored: missing
// arrays become empty ones, and a missing number stays null rather than becoming
// a zero that would then be counted as real.
export function normaliseParsed(payload) {
  const rows = Array.isArray(payload?.entries) ? payload.entries : [];
  return rows
    .map((row) => {
      const num = (v) => (v === 0 && v !== 0 ? null : v === "" || v == null ? null : Number(v));
      const kind = ["strength", "cardio", "activity"].includes(row?.kind) ? row.kind : "activity";
      return {
        kind,
        name: String(row?.name || "").trim() || "Untitled",
        sets: (row?.sets || []).map((s) => ({ reps: num(s?.reps), weight: num(s?.weight) })),
        segments: (row?.segments || []).map((s) => ({
          minutes: num(s?.minutes),
          mode: ["walk", "run", "other"].includes(s?.mode) ? s.mode : "other",
          speed_kph: num(s?.speed_kph),
          incline: num(s?.incline),
        })),
        minutes: num(row?.minutes),
        metrics: {
          distance_km: num(row?.metrics?.distance_km),
          calories: num(row?.metrics?.calories),
          avg_speed_kph: num(row?.metrics?.avg_speed_kph),
          rounds: num(row?.metrics?.rounds),
        },
        note: String(row?.note || ""),
      };
    })
    .filter((row) => row.name && row.name !== "Untitled");
}

export function entryMinutes(entry) {
  if (Number.isFinite(entry?.minutes)) return Number(entry.minutes);
  const fromSegments = (entry?.segments || []).reduce((t, s) => t + (Number(s.minutes) || 0), 0);
  return fromSegments || 0;
}

export function totals(entries = []) {
  const minutes = entries.reduce((t, e) => t + entryMinutes(e), 0);
  const sets = entries.reduce((t, e) => t + (e.sets?.length || 0), 0);
  const volume = entries.reduce(
    (t, e) =>
      t + (e.sets || []).reduce((sum, s) => sum + (Number(s.reps) || 0) * (Number(s.weight) || 0), 0),
    0
  );
  return { minutes, sets, volume: Math.round(volume), entries: entries.length };
}

// What gets written on the saved record. Built only from numbers that exist.
export function summarise(entries = []) {
  const parts = [];
  const strength = entries.filter((e) => e.kind === "strength");
  const cardio = entries.filter((e) => e.kind === "cardio");
  const activity = entries.filter((e) => e.kind === "activity");
  if (strength.length) {
    const sets = strength.reduce((t, e) => t + (e.sets?.length || 0), 0);
    parts.push(`${strength.length} movement${strength.length === 1 ? "" : "s"}, ${sets} set${sets === 1 ? "" : "s"}`);
  }
  if (cardio.length) parts.push(`${cardio.length} cardio block${cardio.length === 1 ? "" : "s"}`);
  if (activity.length) parts.push(`${activity.length} activit${activity.length === 1 ? "y" : "ies"}`);
  const { minutes } = totals(entries);
  return `${parts.join(" · ") || "Empty workout"}${minutes ? ` · ${minutes} min` : ""}`;
}

export function metricLine(entry) {
  const bits = [];
  const m = entry?.metrics || {};
  if (Number.isFinite(m.distance_km)) bits.push(`${m.distance_km} km`);
  if (Number.isFinite(m.avg_speed_kph)) bits.push(`${m.avg_speed_kph} km/h avg`);
  if (Number.isFinite(m.calories)) bits.push(`${m.calories} cal`);
  if (Number.isFinite(m.rounds)) bits.push(`${m.rounds} rounds`);
  if (entry?.kind === "strength") {
    const sets = entry.sets || [];
    const work = sets.filter((s) => Number(s.reps) && Number(s.weight));
    if (work.length) {
      const top = Math.max(...work.map((s) => Number(s.weight)));
      bits.push(`${sets.length} sets, top ${top} lb`);
    } else if (sets.length) {
      bits.push(`${sets.length} sets`);
    }
  }
  return bits.join(" · ");
}
