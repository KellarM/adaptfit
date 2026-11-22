import { EQUIPMENT_CATEGORIES } from "@/lib/options";

const PRESETS = [
  { category: "dumbbell", weighted: true, hint: "heaviest pair you own" },
  { category: "band", hint: "any resistance band" },
  { category: "bench", hint: "bench or sturdy chair" },
  { category: "kettlebell", weighted: true },
  { category: "barbell", weighted: true },
  { category: "pull_up_bar" },
  { category: "bike" },
  { category: "treadmill" },
  { category: "rower" },
  { category: "medicine_ball", weighted: true },
];

const labelOfCategory = (key) => EQUIPMENT_CATEGORIES.find((c) => c.key === key)?.label || key;

export default function StepEquipment({ equipment, onToggle, onWeight }) {
  return (
    <div className="space-y-4">
      <p className="text-[12px] leading-relaxed text-muted-foreground">
        Tick what you actually have at home. Your plan will only ever use these — bodyweight
        movements are always included.
      </p>

      <div className="space-y-2">
        {PRESETS.map((preset) => {
          const picked = equipment.find((e) => e.category === preset.category);
          return (
            <div
              key={preset.category}
              className={`rounded-2xl border px-4 py-3 transition ${
                picked ? "border-primary/50 bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onToggle(preset)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border text-[10px] ${
                      picked
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px]">{labelOfCategory(preset.category)}</span>
                    {preset.hint ? (
                      <span className="block text-[10.5px] text-muted-foreground">{preset.hint}</span>
                    ) : null}
                  </span>
                </button>

                {picked && preset.weighted ? (
                  <div className="flex shrink-0 items-center gap-1.5">
                    <input
                      type="number"
                      inputMode="decimal"
                      value={picked.weight_value ?? ""}
                      onChange={(e) => onWeight(preset.category, e.target.value)}
                      placeholder="kg"
                      className="tnum h-9 w-16 rounded-lg border border-input bg-background text-center text-[12px] outline-none focus:border-primary/60"
                    />
                    <span className="text-[10px] text-muted-foreground">kg</span>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}