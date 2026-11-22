export const CM_PER_INCH = 2.54;

export const LENGTH_UNITS = ["in", "cm"];

function isBlank(value) {
  return value === "" || value === null || value === undefined;
}

// Stored values are always centimetres; this is only for what the person sees.
export function cmToUnit(cm, unit = "cm") {
  if (isBlank(cm)) return "";
  const n = Number(cm);
  if (Number.isNaN(n)) return "";
  const value = unit === "in" ? n / CM_PER_INCH : n;
  return Math.round(value * 10) / 10;
}

export function unitToCm(value, unit = "cm") {
  if (isBlank(value)) return undefined;
  const n = Number(value);
  if (Number.isNaN(n)) return undefined;
  const cm = unit === "in" ? n * CM_PER_INCH : n;
  return Math.round(cm * 10) / 10;
}

// Flip the switch without changing what the numbers mean.
export function convertEntered(values, metrics, fromUnit, toUnit) {
  if (fromUnit === toUnit) return values;
  const next = { ...values };
  metrics.forEach((m) => {
    if (!m.length || isBlank(values[m.key])) return;
    const cm = unitToCm(values[m.key], fromUnit);
    next[m.key] = cm === undefined ? "" : String(cmToUnit(cm, toUnit));
  });
  return next;
}

export const KG_PER_LB = 0.4536;

// Body weight is stored in kilograms but always entered and shown in pounds.
export function kgToLb(kg) {
  if (isBlank(kg)) return "";
  const n = Number(kg);
  if (Number.isNaN(n)) return "";
  return Math.round((n / KG_PER_LB) * 10) / 10;
}

export function lbToKg(lb) {
  if (isBlank(lb)) return undefined;
  const n = Number(lb);
  if (Number.isNaN(n)) return undefined;
  return Math.round(n * KG_PER_LB * 10) / 10;
}