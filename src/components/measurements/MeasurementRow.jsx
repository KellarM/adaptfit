import { metricUnit } from "@/lib/metrics";

export default function MeasurementRow({ metric, value, unit, highlight, onChange }) {
  return (
    <label
      className={`block rounded-xl border px-3 py-2.5 transition ${
        highlight ? "border-primary/50 bg-primary/[0.06]" : "border-border/60"
      }`}
    >
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-[11.5px]">{metric.label}</span>
        <span className="text-[10px] text-muted-foreground">{metricUnit(metric, unit)}</span>
      </span>
      <input
        type="number"
        inputMode="decimal"
        step={metric.step || "0.1"}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="field tnum mt-1.5"
      />
      <span className="mt-1 block text-[10px] leading-snug text-muted-foreground">{metric.site}</span>
    </label>
  );
}