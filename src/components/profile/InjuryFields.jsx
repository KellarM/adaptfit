import { STRESS_TAGS } from "@/lib/exerciseLibrary";
import { AREAS, SIDES, STATUSES } from "@/lib/options";

export default function InjuryFields({ value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch });
  const tags = value.avoid_tags || [];

  const toggleTag = (tag) =>
    set({ avoid_tags: tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag] });

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-[10.5px] text-muted-foreground">What is it called</span>
        <input
          value={value.name || ""}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="Medial epicondylitis"
          className="field mt-1"
        />
      </label>

      <div className="grid grid-cols-2 gap-2.5">
        <label className="block">
          <span className="text-[10.5px] text-muted-foreground">Where</span>
          <select
            value={value.area || "elbow"}
            onChange={(e) => set({ area: e.target.value })}
            className="field mt-1"
          >
            {AREAS.map((a) => (
              <option key={a.key} value={a.key}>
                {a.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[10.5px] text-muted-foreground">Side</span>
          <select
            value={value.side || "right"}
            onChange={(e) => set({ side: e.target.value })}
            className="field mt-1"
          >
            {SIDES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <label className="block">
          <span className="text-[10.5px] text-muted-foreground">Status</span>
          <select
            value={value.status || "recovering"}
            onChange={(e) => set({ status: e.target.value })}
            className="field mt-1"
          >
            {STATUSES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[10.5px] text-muted-foreground">Pain right now (0–10)</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            max="10"
            value={value.pain_level ?? ""}
            onChange={(e) => set({ pain_level: e.target.value })}
            className="field tnum mt-1"
          />
        </label>
      </div>

      <div>
        <p className="text-[10.5px] text-muted-foreground">Keep these out of my plan</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {STRESS_TAGS.map((tag) => (
            <button
              key={tag.key}
              type="button"
              onClick={() => toggleTag(tag.key)}
              className={`chip ${tags.includes(tag.key) ? "chip-on" : ""}`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}