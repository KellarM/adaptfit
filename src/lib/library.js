import { PATTERN_LABEL } from "@/lib/exerciseLibrary";
import { EQUIPMENT_CATEGORIES } from "@/lib/options";

export const TYPE_OPTIONS = Object.entries(PATTERN_LABEL).map(([key, label]) => ({ key, label }));

export const DIFFICULTY_OPTIONS = [
  { key: "easy", label: "Easy" },
  { key: "moderate", label: "Moderate" },
  { key: "hard", label: "Hard" },
];

export const SOURCE_OPTIONS = [
  { key: "upload", label: "My clip" },
  { key: "youtube", label: "YouTube" },
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "other", label: "Other link" },
];

export const EQUIPMENT_OPTIONS = [
  { key: "bodyweight", label: "Bodyweight" },
  ...EQUIPMENT_CATEGORIES,
];

export const labelOf = (list, key) => list.find((item) => item.key === key)?.label || key || "—";

// Any of the usual YouTube link shapes, so a pasted share link still plays inline.
export function youtubeId(url = "") {
  const match = String(url).match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/);
  return match ? match[1] : null;
}

// Which source a pasted link belongs to, so the right tab lights up.
export function sourceForUrl(url = "") {
  const value = String(url);
  if (/youtu\.?be/.test(value)) return "youtube";
  if (/instagram\.com/.test(value)) return "instagram";
  if (/tiktok\.com/.test(value)) return "tiktok";
  return "other";
}

export const isUpload = (exercise) =>
  exercise?.video_source === "upload" && Boolean(exercise?.video_url);

// Everyday words people use for a muscle, so "abs" also finds the movements
// labelled "abdominals". Everything else is matched as typed.
const MUSCLE_ALIASES = {
  ab: ["abs", "abdomin"],
  abs: ["abs", "abdomin"],
  abdominal: ["abs", "abdomin"],
  abdominals: ["abs", "abdomin"],
};

export function muscleSearchTerms(query = "") {
  const needle = String(query).trim().toLowerCase();
  if (!needle) return [];
  return MUSCLE_ALIASES[needle] || [needle];
}