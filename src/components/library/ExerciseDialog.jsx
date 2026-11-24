import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ClipPicker from "@/components/library/ClipPicker";
import { EQUIPMENT_OPTIONS } from "@/lib/library";
import { classifyMovement } from "@/lib/library-fns";

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

  const [preparing, setPreparing] = useState(false);
  const [customKit, setCustomKit] = useState("");

  const addCustomKit = () => {
    const key = customKit.trim();
    if (!key) return;
    if (!(form.equipment || []).includes(key)) set({ equipment: [...(form.equipment || []), key] });
    setCustomKit("");
  };

  // Type, difficulty and what it works are read from the name and the kit, so
  // the person never has to answer them. If that call fails the movement still
  // saves with whatever it already had.
  const save = async () => {
    const name = form.name.trim();
    setPreparing(true);
    let payload = { ...form, name };
    try {
      const result = await classifyMovement({ data: { name, equipment: form.equipment || [] } });
      payload = {
        ...payload,
        type: result.type,
        difficulty: result.difficulty,
        muscle: result.muscle,
      };
    } catch {
      // Saved as it stands.
    } finally {
      setPreparing(false);
    }
    onSave(payload);
  };

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
            Type, difficulty and what it works are filled in for you when you save.
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
              {equipment
                .filter((key) => !EQUIPMENT_OPTIONS.some((option) => option.key === key))
                .map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleEquipment(key)}
                    className="chip chip-on"
                  >
                    {key} ×
                  </button>
                ))}
            </div>

            <div className="mt-1.5 flex gap-1.5">
              <input
                value={customKit}
                onChange={(e) => setCustomKit(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomKit();
                  }
                }}
                placeholder="Something else you own"
                className="field h-9 flex-1 text-[12px]"
              />
              <button
                type="button"
                onClick={addCustomKit}
                disabled={!customKit.trim()}
                className="rounded-xl border border-input px-3.5 text-[12px] text-muted-foreground transition hover:text-foreground disabled:opacity-50"
              >
                Add
              </button>
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

          <button
            type="button"
            disabled={saving || preparing || !form.name.trim()}
            onClick={save}
            className="w-full rounded-full bg-primary px-5 py-3.5 text-[13.5px] font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {preparing || saving ? "Working it out…" : "Save movement"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}