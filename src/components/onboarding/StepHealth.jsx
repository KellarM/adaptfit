import { EXPERIENCE, GOALS } from "@/lib/options";
import InjuryFields from "@/components/profile/InjuryFields";

export default function StepHealth({ form, set, setInjury }) {
  const toggleGoal = (key) =>
    set({
      goals: form.goals.includes(key) ? form.goals.filter((g) => g !== key) : [...form.goals, key],
    });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5">
        <label className="col-span-2 block">
          <span className="text-[10.5px] text-muted-foreground">First name</span>
          <input
            value={form.display_name}
            onChange={(e) => set({ display_name: e.target.value })}
            placeholder="What should the app call you"
            className="field mt-1"
          />
        </label>
        <label className="block">
          <span className="text-[10.5px] text-muted-foreground">Age</span>
          <input
            type="number"
            inputMode="numeric"
            value={form.age}
            onChange={(e) => set({ age: e.target.value })}
            className="field tnum mt-1"
          />
        </label>
        <label className="block">
          <span className="text-[10.5px] text-muted-foreground">Height (cm)</span>
          <input
            type="number"
            inputMode="numeric"
            value={form.height_cm}
            onChange={(e) => set({ height_cm: e.target.value })}
            className="field tnum mt-1"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-[10.5px] text-muted-foreground">Experience with weights</span>
        <select
          value={form.experience}
          onChange={(e) => set({ experience: e.target.value })}
          className="field mt-1"
        >
          {EXPERIENCE.map((e) => (
            <option key={e.key} value={e.key}>
              {e.label}
            </option>
          ))}
        </select>
      </label>

      <div>
        <p className="text-[10.5px] text-muted-foreground">What are you working toward</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {GOALS.map((goal) => (
            <button
              key={goal.key}
              type="button"
              onClick={() => toggleGoal(goal.key)}
              className={`chip ${form.goals.includes(goal.key) ? "chip-on" : ""}`}
            >
              {goal.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <label className="block">
          <span className="text-[10.5px] text-muted-foreground">Sessions per week</span>
          <input
            type="number"
            inputMode="numeric"
            min="2"
            max="6"
            value={form.weekly_target}
            onChange={(e) => set({ weekly_target: e.target.value })}
            className="field tnum mt-1"
          />
        </label>
        <label className="block">
          <span className="text-[10.5px] text-muted-foreground">Minutes each</span>
          <input
            type="number"
            inputMode="numeric"
            value={form.session_minutes}
            onChange={(e) => set({ session_minutes: e.target.value })}
            className="field tnum mt-1"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-[10.5px] text-muted-foreground">Health factors worth knowing</span>
        <textarea
          value={form.conditions}
          onChange={(e) => set({ conditions: e.target.value })}
          rows={2}
          placeholder="Blood pressure, cholesterol, anything your doctor mentioned…"
          className="field mt-1 h-auto resize-none py-2.5"
        />
      </label>

      <div className="rounded-2xl border border-border bg-background/40 px-4 py-4">
        <p className="eyebrow">What needs protecting</p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          Already filled in with your right elbow. Edit anything that is different.
        </p>
        <div className="mt-3">
          <InjuryFields value={form.injury} onChange={setInjury} />
        </div>
      </div>
    </div>
  );
}