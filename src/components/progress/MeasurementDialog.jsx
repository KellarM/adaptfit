import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { METRICS } from "@/lib/metrics";
import { isoDate } from "@/lib/format";

export default function MeasurementDialog({ onOpenChange, onSave, saving, initial }) {
  const [date, setDate] = useState(initial?.date || isoDate());
  const [values, setValues] = useState(() => {
    const next = {};
    METRICS.forEach((m) => {
      next[m.key] = initial?.[m.key] ?? "";
    });
    return next;
  });
  const [notes, setNotes] = useState(initial?.notes || "");

  const submit = () => {
    const payload = { date, notes };
    METRICS.forEach((m) => {
      const raw = values[m.key];
      payload[m.key] = raw === "" ? undefined : Number(raw);
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
          <div>
            <p className="eyebrow">Date</p>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="field mt-1.5"
            />
          </div>

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
                  value={values[m.key]}
                  onChange={(e) => setValues((v) => ({ ...v, [m.key]: e.target.value }))}
                  className="field tnum mt-1"
                />
              </label>
            ))}
          </div>

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