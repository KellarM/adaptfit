import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { METRICS } from "@/lib/metrics";
import { cmToUnit, convertEntered, kgToLb, lbToKg, unitToCm } from "@/lib/units";
import { isoDate } from "@/lib/format";
import MetricInputs from "@/components/measurements/MetricInputs";
import UnitToggle from "@/components/measurements/UnitToggle";

export default function MeasurementDialog({
  onOpenChange,
  onSave,
  saving,
  initial,
  unit = "in",
  onUnitChange,
}) {
  const [date, setDate] = useState(initial?.date || isoDate());
  const [displayUnit, setDisplayUnit] = useState(unit);
  const [values, setValues] = useState(() => {
    const next = {};
    METRICS.forEach((m) => {
      const stored = initial?.[m.key];
      next[m.key] = m.length ? cmToUnit(stored, unit) : kgToLb(stored);
    });
    return next;
  });
  const [notes, setNotes] = useState(initial?.notes || "");

  const changeUnit = (next) => {
    if (next === displayUnit) return;
    setValues((v) => convertEntered(v, METRICS, displayUnit, next));
    setDisplayUnit(next);
    if (onUnitChange) onUnitChange(next);
  };

  const submit = () => {
    const payload = { date, notes };
    METRICS.forEach((m) => {
      const raw = values[m.key];
      if (m.length) {
        payload[m.key] = unitToCm(raw, displayUnit);
      } else {
        payload[m.key] = lbToKg(raw);
      }
    });
    onSave(payload);
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-normal">New measurements</DialogTitle>
          <DialogDescription className="text-[12px] leading-relaxed">
            Same tape, same time of day, relaxed muscles. Fill in what you have — the rest can wait.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div className="flex-1">
              <p className="eyebrow">Date</p>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="field mt-1.5"
              />
            </div>
            <div className="pb-1">
              <p className="eyebrow mb-1.5 text-right">Units</p>
              <UnitToggle unit={displayUnit} onChange={changeUnit} />
            </div>
          </div>

          <MetricInputs
            values={values}
            unit={displayUnit}
            onChange={(key, value) => setValues((v) => ({ ...v, [key]: value }))}
          />

          <div>
            <p className="eyebrow">Notes</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="field mt-1.5 h-auto resize-none py-2.5"
            />
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="w-full rounded-full bg-primary px-5 py-3.5 text-[13.5px] font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save measurements"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}