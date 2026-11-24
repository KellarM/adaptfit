import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { activityEntry, cardioEntry, strengthEntry } from "@/lib/training";

const emptySet = () => ({ reps: "", weight: "" });
const emptySegment = () => ({ minutes: "", mode: "walk", speed_kph: "", incline: "" });

const field =
  "w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[12.5px] outline-none focus:border-primary/60";
const tab = (on) =>
  `rounded-full px-3 py-1.5 text-[11.5px] transition ${
    on ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"
  }`;

// The fast path once you know what you are logging. Three shapes, because that
// is what his training actually looks like: sets, machine time, or an activity
// with a duration and whatever numbers the machine gave.
export default function QuickAdd({ onAdd }) {
  const [mode, setMode] = useState("strength");
  const [name, setName] = useState("");
  const [sets, setSets] = useState([emptySet()]);
  const [segments, setSegments] = useState([emptySegment()]);
  const [minutes, setMinutes] = useState("");
  const [metrics, setMetrics] = useState({ distance_km: "", calories: "", avg_speed_kph: "", rounds: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setName("");
    setSets([emptySet()]);
    setSegments([emptySegment()]);
    setMinutes("");
    setMetrics({ distance_km: "", calories: "", avg_speed_kph: "", rounds: "" });
  };

  const numeric = (v) => v === "" || Number.isFinite(Number(v));
  const notNumeric =
    mode === "strength"
      ? sets.some((s) => !numeric(s.reps) || !numeric(s.weight))
      : mode === "cardio"
        ? segments.some((s) => !numeric(s.minutes) || !numeric(s.speed_kph) || !numeric(s.incline))
        : !numeric(minutes) || !numeric(metrics.calories) || !numeric(metrics.distance_km);

  // Nothing is cleared until the entry is actually stored, so a failed save
  // never costs you the numbers you just typed.
  const submit = async () => {
    if (notNumeric) {
      setError("Numbers only in the number fields — no dashes or units.");
      return;
    }
    let entry = null;
    if (mode === "strength" && name.trim()) entry = strengthEntry(name, sets);
    if (mode === "cardio" && name.trim()) entry = cardioEntry(name, segments);
    if (mode === "activity" && name.trim()) entry = activityEntry(name, minutes, metrics);
    if (!entry) return;
    setBusy(true);
    setError("");
    try {
      await onAdd(entry);
      reset();
    } catch {
      setError("That did not save. Your numbers are still here — press add again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel px-5 py-4">
      <p className="eyebrow">Quick add</p>
      <div className="mt-2 flex gap-2">
        <button type="button" className={tab(mode === "strength")} onClick={() => setMode("strength")}>
          Sets
        </button>
        <button type="button" className={tab(mode === "cardio")} onClick={() => setMode("cardio")}>
          Machine
        </button>
        <button type="button" className={tab(mode === "activity")} onClick={() => setMode("activity")}>
          Activity
        </button>
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={
          mode === "strength" ? "Bicep curls" : mode === "cardio" ? "Treadmill" : "Boxing bag"
        }
        className={`${field} mt-3`}
      />

      {mode === "strength" ? (
        <div className="mt-2 space-y-2">
          {sets.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={s.reps}
                onChange={(e) =>
                  setSets(sets.map((row, ri) => (ri === i ? { ...row, reps: e.target.value } : row)))
                }
                inputMode="numeric"
                placeholder="reps"
                className={field}
              />
              <input
                value={s.weight}
                onChange={(e) =>
                  setSets(sets.map((row, ri) => (ri === i ? { ...row, weight: e.target.value } : row)))
                }
                inputMode="decimal"
                placeholder="lb"
                className={field}
              />
              {sets.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setSets(sets.filter((_, ri) => ri !== i))}
                  aria-label="Remove set"
                  className="shrink-0 rounded-full p-1 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setSets([...sets, emptySet()])}
            className="flex items-center gap-1 text-[11.5px] text-primary"
          >
            <Plus className="h-3 w-3" /> Add a set
          </button>
          <p className="text-[10.5px] text-muted-foreground">
            A drop set is one row per weight, so 20, 15 and 10 lb all get their own line.
          </p>
        </div>
      ) : null}

      {mode === "cardio" ? (
        <div className="mt-2 space-y-2">
          {segments.map((s, i) => (
            <div key={i} className="grid grid-cols-2 gap-2">
              <input
                value={s.minutes}
                onChange={(e) =>
                  setSegments(segments.map((row, ri) => (ri === i ? { ...row, minutes: e.target.value } : row)))
                }
                inputMode="numeric"
                placeholder="minutes"
                className={field}
              />
              <select
                value={s.mode}
                onChange={(e) =>
                  setSegments(segments.map((row, ri) => (ri === i ? { ...row, mode: e.target.value } : row)))
                }
                className={field}
              >
                <option value="walk">walk</option>
                <option value="run">run</option>
                <option value="other">other</option>
              </select>
              <input
                value={s.speed_kph}
                onChange={(e) =>
                  setSegments(segments.map((row, ri) => (ri === i ? { ...row, speed_kph: e.target.value } : row)))
                }
                inputMode="decimal"
                placeholder="km/h"
                className={field}
              />
              <input
                value={s.incline}
                onChange={(e) =>
                  setSegments(segments.map((row, ri) => (ri === i ? { ...row, incline: e.target.value } : row)))
                }
                inputMode="numeric"
                placeholder="incline, as shown"
                className={field}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setSegments([...segments, emptySegment()])}
            className="flex items-center gap-1 text-[11.5px] text-primary"
          >
            <Plus className="h-3 w-3" /> Add a segment
          </button>
          <p className="text-[10.5px] text-muted-foreground">
            One segment per change in pace. Incline is stored exactly as your machine shows it.
          </p>
        </div>
      ) : null}

      {mode === "activity" ? (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            inputMode="numeric"
            placeholder="minutes"
            className={field}
          />
          <input
            value={metrics.rounds}
            onChange={(e) => setMetrics({ ...metrics, rounds: e.target.value })}
            inputMode="numeric"
            placeholder="rounds (optional)"
            className={field}
          />
          <input
            value={metrics.calories}
            onChange={(e) => setMetrics({ ...metrics, calories: e.target.value })}
            inputMode="numeric"
            placeholder="calories (optional)"
            className={field}
          />
          <input
            value={metrics.distance_km}
            onChange={(e) => setMetrics({ ...metrics, distance_km: e.target.value })}
            inputMode="decimal"
            placeholder="distance km (optional)"
            className={field}
          />
        </div>
      ) : null}

      {error ? <p className="mt-2 text-[11px] text-destructive">{error}</p> : null}

      <button
        type="button"
        onClick={submit}
        disabled={!name.trim() || busy}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-[12px] font-medium text-primary-foreground transition disabled:opacity-40"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
        {busy ? "Adding…" : "Add to workout"}
      </button>
    </section>
  );
}