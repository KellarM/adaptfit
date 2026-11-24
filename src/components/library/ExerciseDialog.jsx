import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ClipPicker from "@/components/library/ClipPicker";
import { DIFFICULTY_OPTIONS, EQUIPMENT_OPTIONS, TYPE_OPTIONS } from "@/lib/library";

const BLANK = {
  name: "",
  type: "push",
  difficulty: "easy",
  equipment: [],
  video_source: "upload",
  video_url: "",
  cue: "",
  muscle: "",
  notes: "",
};

export default function ExerciseDialog({ initial, onOpenChange, onSave, saving }) {
  const [form, setForm] = useState(() => ({ ...BLANK, ...(initial || {}) }));
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const equipment = form.equipment || [];

  const toggleEquipment = (key) =>
    set({
      equipment: equipment.includes(key)
        ? equipment.filter((item) => item !== key)
        : [...equipment, key],
    });

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-normal">
            {initial ? "Edit movement" : "Add a movement"}
          </DialogTitle>
          <DialogDescription className="text-[12px] leading-relaxed">
            The name is enough to save it. Attach a clip whenever you have one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <label className="block">
            <span className="text-[10.5px] text-muted-foreground">Name</span>
            <input
              value={form.name}
              onChange={(e) => set({ name: e.target.value })}
              placeholder="Goblet squat"
              className="field mt-1"
            />
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            <label className="block">
              <span className="text-[10.5px] text-muted-foreground">Type</span>
              <select
                value={form.type}
                onChange={(e) => set({ type: e.target.value })}
                className="field mt-1 text-[12px]"
              >
                {TYPE_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[10.5px] text-muted-foreground">Difficulty</span>
              <select
                value={form.difficulty}
                onChange={(e) => set({ difficulty: e.target.value })}
                className="field mt-1 text-[12px]"
              >
                {DIFFICULTY_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <span className="text-[10.5px] text-muted-foreground">Equipment</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {EQUIPMENT_OPTIONS.map((option) => {
                const on = equipment.includes(option.key);
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => toggleEquipment(option.key)}
                    className={`chip ${on ? "chip-on" : ""}`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <ClipPicker
            video_source={form.video_source}
            video_url={form.video_url}
            onChange={set}
          />

          <label className="block">
            <span className="text-[10.5px] text-muted-foreground">Cue</span>
            <textarea
              value={form.cue || ""}
              onChange={(e) => set({ cue: e.target.value })}
              rows={2}
              placeholder="One thing to remember while doing it"
              className="field mt-1 h-auto resize-none py-2.5 text-[12px]"
            />
          </label>

          <label className="block">
            <span className="text-[10.5px] text-muted-foreground">What it works</span>
            <input
              value={form.muscle || ""}
              onChange={(e) => set({ muscle: e.target.value })}
              placeholder="Quads, glutes, core"
              className="field mt-1 text-[12px]"
            />
          </label>

          <button
            type="button"
            disabled={saving || !form.name.trim()}
            onClick={() => onSave({ ...form, name: form.name.trim() })}
            className="w-full rounded-full bg-primary px-5 py-3.5 text-[13.5px] font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save movement"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}