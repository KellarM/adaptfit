import { METRICS } from "@/lib/metrics";
import { convertEntered } from "@/lib/units";
import MetricInputs from "@/components/measurements/MetricInputs";
import UnitToggle from "@/components/measurements/UnitToggle";

export default function StepMeasurements({ value, onChange, unit = "in", onUnitChange }) {
  const set = (patch) => onChange({ ...value, ...patch });

  const changeUnit = (next) => {
    if (next === unit) return;
    onChange(convertEntered(value, METRICS, unit, next));
    if (onUnitChange) onUnitChange(next);
  };

  return (
    <div className="space-y-4">
      <p className="text-[12px] leading-relaxed text-muted-foreground">
        This is your &ldquo;before&rdquo; snapshot. Use a soft tape at the widest point, keep the
        muscles relaxed, and don&rsquo;t worry about empty fields — you can fill them in later.
      </p>

      <div className="flex items-end justify-between gap-3">
        <div className="flex-1">
          <span className="text-[10.5px] text-muted-foreground">Date</span>
          <input
            type="date"
            value={value.date}
            onChange={(e) => set({ date: e.target.value })}
            className="field mt-1"
          />
        </div>
        <div className="pb-1">
          <p className="eyebrow mb-1.5 text-right">Units</p>
          <UnitToggle unit={unit} onChange={changeUnit} />
        </div>
      </div>

      <MetricInputs
        values={value}
        unit={unit}
        onChange={(key, next) => set({ [key]: next })}
      />
    </div>
  );
}