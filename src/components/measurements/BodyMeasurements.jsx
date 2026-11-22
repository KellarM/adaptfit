import { useEffect, useState } from "react";
import { BODY_SITES, METRICS } from "@/lib/metrics";
import { cmToUnit, convertEntered, unitToCm } from "@/lib/units";
import BodyDiagram from "@/components/measurements/BodyDiagram";
import MeasurementRow from "@/components/measurements/MeasurementRow";
import UnitToggle from "@/components/measurements/UnitToggle";

const HEIGHT = {
  key: "height",
  label: "Height",
  site: "Standing tall, no shoes, heels together.",
  step: "0.1",
  length: true,
};

export default function BodyMeasurements({
  value,
  onChange,
  heightCm,
  onHeight,
  unit = "in",
  onUnitChange,
}) {
  const [active, setActive] = useState(null);
  const [heightText, setHeightText] = useState(() => {
    const shown = cmToUnit(heightCm, unit);
    return shown === "" ? "" : String(shown);
  });

  // Keep the height field in step with the switch, without eating what was typed.
  useEffect(() => {
    const asCm = unitToCm(heightText, unit);
    if (asCm === undefined || Math.abs(asCm - (Number(heightCm) || 0)) > 0.01) {
      const shown = cmToUnit(heightCm, unit);
      setHeightText(shown === "" ? "" : String(shown));
    }
  }, [unit, heightCm, heightText]);

  const set = (patch) => onChange({ ...value, ...patch });

  const changeUnit = (next) => {
    if (next === unit) return;
    onChange(convertEntered(value, METRICS, unit, next));
    if (onUnitChange) onUnitChange(next);
  };

  const activeKeys = BODY_SITES.find((site) => site.id === active)?.keys || [];

  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,225px)_minmax(0,1fr)]">
      <div className="space-y-2">
        <BodyDiagram active={active} onSelect={(site) => setActive(site.id)} />
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Every muscle that grows or shrinks has a tape site. Tap a name on the body to jump to it.
        </p>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-end justify-between gap-3">
          <label className="flex-1">
            <span className="text-[10.5px] text-muted-foreground">Date</span>
            <input
              type="date"
              value={value.date || ""}
              onChange={(e) => set({ date: e.target.value })}
              className="field mt-1"
            />
          </label>
          <div className="pb-1">
            <p className="eyebrow mb-1.5 text-right">Units</p>
            <UnitToggle unit={unit} onChange={changeUnit} />
          </div>
        </div>

        <MeasurementRow
          metric={HEIGHT}
          value={heightText}
          unit={unit}
          highlight={false}
          onChange={(text) => {
            setHeightText(text);
            onHeight(unitToCm(text, unit));
          }}
        />

        {METRICS.map((m) => (
          <MeasurementRow
            key={m.key}
            metric={m}
            value={value[m.key] ?? ""}
            unit={unit}
            highlight={activeKeys.includes(m.key)}
            onChange={(next) => set({ [m.key]: next })}
          />
        ))}
      </div>
    </div>
  );
}