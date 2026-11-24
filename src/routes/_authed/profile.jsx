import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Download, Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getInjuries, getProfile } from "@/lib/api";
import { backupSummary, buildBackup, downloadBackup } from "@/lib/backup";
import { EXPERIENCE, GOALS, labelOf, SIDES } from "@/lib/options";
import InjuryDialog from "@/components/profile/InjuryDialog";

export const Route = createFileRoute("/_authed/profile")({
  head: () => ({ meta: [{ title: "You · Back in Shape" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [injuries, setInjuries] = useState([]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [injuryOpen, setInjuryOpen] = useState(null);
  const [backingUp, setBackingUp] = useState(false);

  const load = async () => {
    const [p, i] = await Promise.all([getProfile(), getInjuries()]);
    setProfile(p);
    setInjuries(i);
    setForm({
      display_name: p?.display_name || "",
      age: p?.age ?? "",
      height_cm: p?.height_cm ?? "",
      experience: p?.experience || "starting",
      goals: p?.goals || [],
      weekly_target: p?.weekly_target ?? 3,
      session_minutes: p?.session_minutes ?? 35,
      conditions: p?.conditions || "",
      medications: p?.medications || "",
      clinician_notes: p?.clinician_notes || "",
    });
  };

  useEffect(() => {
    load();
  }, []);

  if (!form) {
    return <p className="py-24 text-center text-[13px] text-muted-foreground">Loading profile…</p>;
  }

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const num = (v) => (v === "" || v === null || v === undefined ? undefined : Number(v));

  const toggleGoal = (key) =>
    set({
      goals: form.goals.includes(key)
        ? form.goals.filter((g) => g !== key)
        : [...form.goals, key],
    });

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        age: num(form.age),
        height_cm: num(form.height_cm),
        weekly_target: num(form.weekly_target) ?? 3,
        session_minutes: num(form.session_minutes) ?? 35,
        onboarding_complete: true,
      };
      if (profile?.id) await base44.entities.HealthProfile.update(profile.id, payload);
      else await base44.entities.HealthProfile.create(payload);
      await load();
      toast.success("Saved");
    } finally {
      setSaving(false);
    }
  };

  const saveInjury = async (payload) => {
    setSaving(true);
    try {
      if (injuryOpen?.id) await base44.entities.Injury.update(injuryOpen.id, payload);
      else await base44.entities.Injury.create(payload);
      await load();
      setInjuryOpen(null);
      toast.success("Saved");
    } finally {
      setSaving(false);
    }
  };

  const removeInjury = async (item) => {
    await base44.entities.Injury.delete(item.id);
    await load();
    toast.success("Removed");
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="eyebrow">You</p>
        <h1 className="font-display text-[2rem] leading-[1.08] tracking-[-0.02em] sm:text-[2.5rem]">
          Your baseline.
        </h1>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          Everything here feeds the plan: your experience, your goals and anything that needs
          protecting.
        </p>
      </header>

      <section className="panel space-y-3 px-5 py-4">
        <p className="eyebrow">About you</p>

        <div className="grid grid-cols-2 gap-2.5">
          <label className="col-span-2 block">
            <span className="text-[10.5px] text-muted-foreground">First name</span>
            <input
              value={form.display_name}
              onChange={(e) => set({ display_name: e.target.value })}
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
          <label className="col-span-2 block">
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

        <div>
          <p className="text-[10.5px] text-muted-foreground">What you are working toward</p>
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

        <label className="block">
          <span className="text-[10.5px] text-muted-foreground">Health factors worth knowing</span>
          <textarea
            value={form.conditions}
            onChange={(e) => set({ conditions: e.target.value })}
            rows={3}
            placeholder="Blood pressure, cholesterol, old injuries, anything your doctor mentioned…"
            className="field mt-1 h-auto resize-none py-2.5"
          />
        </label>

        <label className="block">
          <span className="text-[10.5px] text-muted-foreground">Medications</span>
          <textarea
            value={form.medications}
            onChange={(e) => set({ medications: e.target.value })}
            rows={2}
            className="field mt-1 h-auto resize-none py-2.5"
          />
        </label>

        <label className="block">
          <span className="text-[10.5px] text-muted-foreground">
            What your doctor or physio said
          </span>
          <textarea
            value={form.clinician_notes}
            onChange={(e) => set({ clinician_notes: e.target.value })}
            rows={2}
            className="field mt-1 h-auto resize-none py-2.5"
          />
        </label>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="w-full rounded-full bg-primary px-5 py-3.5 text-[13.5px] font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </section>

      <section className="panel px-5 py-4">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Niggles and injuries</p>
          <button
            type="button"
            onClick={() => setInjuryOpen({})}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground transition hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>

        {injuries.length ? (
          <ul className="mt-3 divide-y divide-border">
            {injuries.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <button
                  type="button"
                  onClick={() => setInjuryOpen(item)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="block truncate text-[13px]">{item.name}</span>
                  <span className="block text-[10.5px] text-muted-foreground">
                    {labelOf(SIDES, item.side)} · {item.status} · pain {item.pain_level ?? 0}/10
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => removeInjury(item)}
                  aria-label={`Remove ${item.name}`}
                  className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:border-destructive/60 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[12px] text-muted-foreground">
            Nothing flagged. Add anything that needs protecting and it stays out of your plan.
          </p>
        )}
      </section>

      <section className="panel px-5 py-4">
        <p className="eyebrow">Your data</p>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Download everything as one file. The sessions cannot be rebuilt from the app if they are
          lost, so keep a copy somewhere that is not this device.
        </p>
        <button
          type="button"
          disabled={backingUp}
          onClick={async () => {
            setBackingUp(true);
            try {
              const data = await buildBackup();
              downloadBackup(data);
              toast.success(`Saved ${backupSummary(data)}`);
            } catch (error) {
              toast.error("Could not build the backup. Nothing was saved.");
            } finally {
              setBackingUp(false);
            }
          }}
          className="mt-3 flex items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 text-[12.5px] text-muted-foreground transition hover:text-foreground disabled:opacity-60"
        >
          <Download className="h-3.5 w-3.5" />
          {backingUp ? "Gathering…" : "Download backup"}
        </button>
      </section>

      <div className="flex flex-col gap-2 pb-2 sm:flex-row">
        <button
          type="button"
          onClick={() => navigate({ to: "/onboarding" })}
          className="rounded-full border border-border px-5 py-3 text-[12.5px] text-muted-foreground transition hover:text-foreground"
        >
          Re-run setup
        </button>
      </div>

      {injuryOpen ? (
        <InjuryDialog
          initial={injuryOpen.id ? injuryOpen : null}
          onOpenChange={(v) => !v && setInjuryOpen(null)}
          onSave={saveInjury}
          saving={saving}
        />
      ) : null}
    </div>
  );
}