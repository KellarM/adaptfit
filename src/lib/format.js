export const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function isoDate(value = new Date()) {
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

// Stored dates can come back as a plain day or a full timestamp — keep the day only.
export function dateOnly(value) {
  return value ? String(value).slice(0, 10) : value;
}

export function fromIso(iso) {
  return new Date(`${dateOnly(iso)}T00:00:00`);
}

export function addDays(iso, days) {
  const d = fromIso(iso);
  d.setDate(d.getDate() + days);
  return isoDate(d);
}

export function mondayOf(value = new Date()) {
  const d = new Date(value);
  const shift = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - shift);
  return isoDate(d);
}

export function prettyDate(iso, opts = { weekday: "short", day: "numeric", month: "short" }) {
  if (!iso) return "";
  return fromIso(iso).toLocaleDateString("en-GB", { ...opts, timeZone: "UTC" });
}

export function dayIndex(iso) {
  return (fromIso(iso).getDay() + 6) % 7;
}

export function round(value, step = 1) {
  if (!step) return Math.round(value);
  return Math.round(value / step) * step;
}

export function fmtNum(value, digits = 1) {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return Number.isInteger(n) ? String(n) : n.toFixed(digits);
}

export function fmtDelta(value, unit = "") {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  const n = Number(value);
  if (n === 0) return `no change`;
  const sign = n > 0 ? "+" : "−";
  return `${sign}${Math.abs(n) % 1 === 0 ? Math.abs(n) : Math.abs(n).toFixed(1)}${unit}`;
}