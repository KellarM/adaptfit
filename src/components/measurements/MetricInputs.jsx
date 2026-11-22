import { METRICS, metricUnit } from "@/lib/metrics";

export default function MetricInputs({ values, unit, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {METRICS.map((m) => (
        <label key={m.key} className="block">
          <span className="text-[10.5px] text-muted-foreground">
            {m.label} <span className="opacity-60">({metricUnit(m, unit)})</span>
          </span>
          <input
            type="number"
            inputMode="decimal"
            step={m.step || "0.1"}
            value={values[m.key] ?? ""}
            onChange={(e) => onChange(m.key, e.target.value)}
            className="field tnum mt-1"
          />
        </label>
      ))}
    </div>
  );
}