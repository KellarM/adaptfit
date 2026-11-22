import { base44 } from "@/api/base44Client";
import { dateOnly } from "@/lib/format";

export async function getProfile() {
  const { items } = await base44.entities.HealthProfile.filter({}, { sort: "-created_date", limit: 1 });
  return items[0] || null;
}

export async function getInjuries() {
  const { items } = await base44.entities.Injury.filter({}, { sort: "-created_date", limit: 20 });
  return items;
}

export async function getEquipment() {
  const { items } = await base44.entities.Equipment.filter({}, { sort: "-created_date", limit: 200 });
  return items;
}

export async function getMeasurements() {
  const { items } = await base44.entities.Measurement.filter({}, { sort: "-date", limit: 200 });
  return items.map((m) => ({ ...m, date: dateOnly(m.date) }));
}

export async function getSessions(query = {}) {
  const { items } = await base44.entities.WorkoutSession.filter(query, { sort: "date", limit: 200 });
  return items.map((s) => ({
    ...s,
    date: dateOnly(s.date),
    week_start: dateOnly(s.week_start),
  }));
}

export function sessionVolume(session) {
  const exercises = session?.exercises || [];
  return exercises.reduce((total, ex) => {
    const sets = ex.sets_log || [];
    return (
      total +
      sets.reduce((sum, s) => {
        if (!s?.done) return sum;
        return sum + Number(s.reps || 0) * Number(s.weight || ex.load_kg || 0);
      }, 0)
    );
  }, 0);
}