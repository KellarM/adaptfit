import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import {
  DIFFICULTY_OPTIONS,
  EQUIPMENT_OPTIONS,
  SOURCE_OPTIONS,
  TYPE_OPTIONS,
} from "@/lib/library";

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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const equipment = form.equipment || [];

  const toggleEquipment = (key) =>
    set({
      equipment: equipment.includes(key)
        ? equipment.filter((item) => item !== key)
        : [...equipment, key],
    });

  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      set({ video_url: file_uri, video_source: "upload" });
    } catch {
      setError("That clip could not be uploaded.");
    } finally {
      setUploading(false);
    }
  };

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

          <div>
            <span className="text-[10.5px] text-muted-foreground">Clip</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {SOURCE_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => set({ video_source: option.key })}
                  className={`chip ${form.video_source === option.key ? "chip-on" : ""}`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {form.video_source === "upload" ? (
              <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border px-3 py-3 text-[11.5px] text-muted-foreground transition hover:border-primary/60 hover:text-primary">
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                {form.video_url
                  ? "Replace the clip"
                  : uploading
                    ? "Uploading…"
                    : "Choose a video file"}
                <input
                  type="file"
                  accept="video/*"
                  onChange={upload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            ) : (
              <input
                value={form.video_url}
                onChange={(e) => set({ video_url: e.target.value })}
                placeholder="Paste the link to the clip"
                className="field mt-2 text-[12px]"
              />
            )}

            <p className="mt-1.5 text-[10.5px] text-muted-foreground">
              {form.video_source === "upload"
                ? "Uploaded clips are stored privately and play inside the app."
                : "YouTube links play in the app. Other links open in a new tab."}
            </p>
          </div>

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

          {error ? <p className="text-[11.5px] text-destructive">{error}</p> : null}

          <button
            type="button"
            disabled={saving || uploading || !form.name.trim()}
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