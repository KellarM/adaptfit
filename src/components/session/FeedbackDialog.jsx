import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const FEEL = ["Rough", "Flat", "Okay", "Good", "Great"];

export default function FeedbackDialog({ open, onOpenChange, onSubmit, saving, initial }) {
  const [feel, setFeel] = useState(initial?.body_feel ?? 3);
  const [elbow, setElbow] = useState(initial?.elbow_pain ?? 0);
  const [energy, setEnergy] = useState(initial?.energy ?? 3);
  const [notes, setNotes] = useState(initial?.feedback_notes ?? "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-normal">How did that feel?</DialogTitle>
          <DialogDescription className="text-[12px] leading-relaxed">
            This is what shapes next week. Be honest about the elbow — a higher number means a
            lighter week, not a failed one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <p className="eyebrow">Elbow during the session</p>
            <div className="mt-2 grid grid-cols-6 gap-1.5">
              {Array.from({ length: 11 }, (_, n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setElbow(n)}
                  className={`tnum h-9 rounded-lg border text-[12px] transition ${
                    elbow === n
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[10.5px] text-muted-foreground">0 = none · 10 = worst</p>
          </div>

          <div>
            <p className="eyebrow">Body overall</p>
            <div className="mt-2 grid grid-cols-5 gap-1.5">
              {FEEL.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setFeel(i + 1)}
                  className={`h-9 rounded-lg border text-[10.5px] transition ${
                    feel === i + 1
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-input text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow">Energy</p>
            <div className="mt-2 grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setEnergy(n)}
                  className={`tnum h-9 rounded-lg border text-[12px] transition ${
                    energy === n
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-input text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow">Anything to note</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Twinge on the last row, slept badly, grip felt fine…"
              className="field mt-2 h-auto resize-none py-2.5"
            />
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={() => onSubmit({ body_feel: feel, elbow_pain: elbow, energy, feedback_notes: notes })}
            className="w-full rounded-full bg-primary px-5 py-3.5 text-[13.5px] font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save and finish"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}