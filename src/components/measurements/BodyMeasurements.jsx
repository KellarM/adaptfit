import { useEffect, useState } from "react";
import { BODY_SITES, METRICS } from "@/lib/metrics";
import { cmToUnit, convertEntered, kgToLb, lbToKg, unitToCm } from "@/lib/units";
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

const GENERAL = { id: "general", label: "Weight & height", keys: ["weight_kg"] };

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

  const site = [...BODY_SITES, GENERAL].find((s) => s.id === active) || null;
  const rows = site ? METRICS.filter((m) => site.keys.includes(m.key)) : [];
  const select = (next) => setActive((current) => (current === next.id ? null : next.id));

  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,360px)_minmax(0,1fr)] sm:gap-6">
      <div className="space-y-2">
        <BodyDiagram active={active} onSelect={select} />
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Pick a body part and only its fields open. Tap it again to hide them.
        </p>
      </div>

      <div className="space-y-3">
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

        {site ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow text-primary">{site.label}</p>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="text-[10.5px] text-muted-foreground transition hover:text-foreground"
              >
                Hide
              </button>
            </div>

            {site.id === "general" ? (
              <MeasurementRow
                metric={HEIGHT}
                value={heightText}
                unit={unit}
                highlight
                onChange={(text) => {
                  setHeightText(text);
                  onHeight(unitToCm(text, unit));
                }}
              />
            ) : null}

            {rows.map((m) => (
              <MeasurementRow
                key={m.key}
                metric={m}
                value={m.length ? value[m.key] ?? "" : kgToLb(value[m.key])}
                unit={unit}
                highlight
                onChange={(next) => set({ [m.key]: m.length ? next : lbToKg(next) })}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              Tap a body part on the figure and its fields open here — one set at a time.
            </p>
            <button
              type="button"
              onClick={() => setActive(GENERAL.id)}
              className="chip mt-3 transition hover:text-foreground"
            >
              Weight &amp; height
            </button>
          </div>
        )}
      </div>
    </div>
  );
}