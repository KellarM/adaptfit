import { base44 } from "@/api/base44Client";
import { dateOnly } from "@/lib/format";

// Everything the app knows, in one file.
//
// The training history is the only part here that cannot be rebuilt from code,
// so sessions are pulled page by page instead of being capped at the first
// screenful the way the list views are.

async function everySession() {
  const rows = [];
  let cursor = null;

  for (let guard = 0; guard < 40; guard += 1) {
    const options = { sort: "date", limit: 200 };
    if (cursor) options.cursor = cursor;
    const page = await base44.entities.WorkoutSession.filter({}, options);
    rows.push(...(page.items || []));
    if (!page.has_more || !page.next_cursor) break;
    cursor = page.next_cursor;
  }

  return rows.map((s) => ({
    ...s,
    date: dateOnly(s.date),
    week_start: dateOnly(s.week_start),
  }));
}

export async function buildBackup() {
  const [profile, injuries, equipment, measurements, sessions] = await Promise.all([
    base44.entities.HealthProfile.filter({}, { sort: "-created_date", limit: 1 }),
    base44.entities.Injury.filter({}, { sort: "-created_date", limit: 200 }),
    base44.entities.Equipment.filter({}, { sort: "-created_date", limit: 500 }),
    base44.entities.Measurement.filter({}, { sort: "-date", limit: 500 }),
    everySession(),
  ]);

  const data = {
    app: "Back in Shape",
    format: 1,
    exported_at: new Date().toISOString(),
    profile: profile.items?.[0] || null,
    injuries: injuries.items || [],
    equipment: equipment.items || [],
    measurements: (measurements.items || []).map((m) => ({ ...m, date: dateOnly(m.date) })),
    sessions,
  };

  data.counts = {
    sessions: data.sessions.length,
    measurements: data.measurements.length,
    injuries: data.injuries.length,
    equipment: data.equipment.length,
  };

  return data;
}

export function downloadBackup(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `back-in-shape-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function backupSummary(data) {
  const c = data?.counts || {};
  return `${c.sessions || 0} sessions, ${c.measurements || 0} measurements, ${c.equipment || 0} kit items`;
}
