import { METRICS, metricUnit } from "@/lib/metrics";
import { cmToUnit } from "@/lib/units";
import { fmtDelta, fmtNum } from "@/lib/format";

export default function MetricTable({ baseline, latest, unit = "cm" }) {
  const rows = METRICS.map((m) => {
    const toUnit = (value) => (m.length ? cmToUnit(value, unit) : value);
    const start = toUnit(baseline?.[m.key]);
    const now = toUnit(latest?.[m.key]);
    const hasStart = start !== null && start !== undefined && start !== "";
    const hasNow = now !== null && now !== undefined && now !== "";
    const delta = hasStart && hasNow ? Number(now) - Number(start) : null;
    return { ...m, start, now, delta, hasStart, hasNow };
  }).filter((r) => r.hasStart || r.hasNow);

  if (!rows.length) {
    return (
      <p className="text-[12px] leading-relaxed text-muted-foreground">
        No measurements yet. Add a first set to start the before-and-after picture.
      </p>
    );
  }

  return (
    <div className="divide-y divide-border">
      <div className="flex items-center gap-3 pb-2 text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground">
        <span className="flex-1">Measure</span>
        <span className="w-16 text-right">Start</span>
        <span className="w-16 text-right">Now</span>
        <span className="w-16 text-right">Change</span>
      </div>
      {rows.map((r) => (
        <div key={r.key} className="flex items-center gap-3 py-2.5">
          <span className="flex-1 text-[12.5px]">
            {r.label}
            <span className="ml-1 text-[10px] text-muted-foreground">
              {metricUnit(r, unit)}
            </span>
          </span>
          <span className="tnum w-16 text-right text-[12px] text-muted-foreground">
            {r.hasStart ? fmtNum(r.start) : "—"}
          </span>
          <span className="tnum w-16 text-right text-[12.5px]">
            {r.hasNow ? fmtNum(r.now) : "—"}
          </span>
          <span
            className={`tnum w-16 text-right text-[11.5px] ${
              r.delta === null || r.delta === 0 ? "text-muted-foreground" : "text-primary"
            }`}
          >
            {r.delta === null ? "—" : fmtDelta(r.delta)}
          </span>
        </div>
      ))}
    </div>
  );
}