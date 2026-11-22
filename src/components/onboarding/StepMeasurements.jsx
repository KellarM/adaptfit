import { METRICS } from "@/lib/metrics";

export default function StepMeasurements({ value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-4">
      <p className="text-[12px] leading-relaxed text-muted-foreground">
        This is your &ldquo;before&rdquo; snapshot. Use a soft tape at the widest point, keep the
        muscles relaxed, and don&rsquo;t worry about empty fields — you can fill them in later.
      </p>

      <label className="block">
        <span className="text-[10.5px] text-muted-foreground">Date</span>
        <input
          type="date"
          value={value.date}
          onChange={(e) => set({ date: e.target.value })}
          className="field mt-1"
        />
      </label>

      <div className="grid grid-cols-2 gap-2.5">
        {METRICS.map((m) => (
          <label key={m.key} className="block">
            <span className="text-[10.5px] text-muted-foreground">
              {m.label} <span className="opacity-60">({m.unit})</span>
            </span>
            <input
              type="number"
              inputMode="decimal"
              step={m.step || "0.1"}
              value={value[m.key] ?? ""}
              onChange={(e) => set({ [m.key]: e.target.value })}
              className="field tnum mt-1"
            />
          </label>
        ))}
      </div>
    </div>
  );
}