// Estimated one-rep max, Epley. It is an estimate, so it is shown as a trend
// rather than a number to chase: what matters is whether the line climbs.
export function e1rm(weight, reps) {
  return Number(weight) * (1 + Number(reps) / 30);
}

// One row per movement, with the first and latest estimate taken from real
// logged sets. Warm-up style sets (very high reps, tiny weight) are ignored
// because they distort the estimate without meaning anything.
export function strengthTrend(sessions = [], { minSessions = 2, limit = 8 } = {}) {
  const ordered = [...sessions].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const byName = new Map();

  ordered.forEach((session) => {
    (session.exercises || []).forEach((exercise) => {
      (exercise.sets_log || []).forEach((set) => {
        const weight = Number(set.weight || 0);
        const reps = Number(set.reps || 0);
        if (!set.done || weight <= 0 || reps <= 0 || reps > 15) return;

        const value = e1rm(weight, reps);
        const row = byName.get(exercise.name) || {
          name: exercise.name,
          first: value,
          firstDate: session.date,
          best: value,
          latest: value,
          latestDate: session.date,
          sessions: new Set(),
        };

        row.latest = value;
        row.latestDate = session.date;
        row.best = Math.max(row.best, value);
        row.sessions.add(session.date);
        byName.set(exercise.name, row);
      });
    });
  });

  return [...byName.values()]
    .map((row) => ({
      ...row,
      sessionCount: row.sessions.size,
      change: row.first > 0 ? (row.latest - row.first) / row.first : 0,
    }))
    .filter((row) => row.sessionCount >= minSessions)
    .sort((a, b) => b.latest - a.latest)
    .slice(0, limit);
}
