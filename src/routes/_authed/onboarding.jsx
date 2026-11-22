import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getEquipment, getInjuries, getProfile } from "@/lib/api";
import { isoDate, mondayOf } from "@/lib/format";
import { METRICS } from "@/lib/metrics";
import { unitToCm } from "@/lib/units";
import { buildWeek } from "@/lib/plan";
import StepHealth from "@/components/onboarding/StepHealth";
import StepMeasurements from "@/components/onboarding/StepMeasurements";
import StepEquipment from "@/components/onboarding/StepEquipment";

export const Route = createFileRoute("/_authed/onboarding")({
  head: () => ({ meta: [{ title: "Set up · Back in Shape" }] }),
  component: OnboardingPage,
});

const STEPS = ["Health", "Baseline", "Kit"];

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    age: "",
    height_cm: "",
    experience: "starting",
    goals: ["strength", "pain_free"],
    weekly_target: 3,
    session_minutes: 35,
    conditions: "",
    medications: "",
    clinician_notes: "",
    injury: {
      name: "Medial epicondylitis",
      area: "elbow",
      side: "right",
      status: "recovering",
      pain_level: 4,
      avoid_tags: ["medial_elbow", "grip"],
      notes: "",
    },
    measurement: { date: isoDate() },
    measurement_unit: "in",
    equipment: [],
  });

  useEffect(() => {
    (async () => {
      const profile = await getProfile();
      if (profile?.onboarding_complete) {
        setForm((f) => ({
          ...f,
          display_name: profile.display_name || "",
          age: profile.age ?? "",
          height_cm: profile.height_cm ?? "",
          experience: profile.experience || "starting",
          goals: profile.goals || f.goals,
          weekly_target: profile.weekly_target ?? 3,
          session_minutes: profile.session_minutes ?? 35,
          conditions: profile.conditions || "",
          medications: profile.medications || "",
          clinician_notes: profile.clinician_notes || "",
          measurement_unit: profile.measurement_unit || "in",
        }));
      }
    })();
  }, []);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setInjury = (value) => set({ injury: value });
  const setMeasurement = (value) => set({ measurement: value });

  const toggleEquipment = (preset) => {
    const exists = form.equipment.find((e) => e.category === preset.category);
    set({
      equipment: exists
        ? form.equipment.filter((e) => e.category !== preset.category)
        : [
            ...form.equipment,
            {
              category: preset.category,
              name: EQUIPMENT_NAME[preset.category] || preset.category,
              weight_unit: "kg",
              increment: 2.5,
              quantity: preset.category === "dumbbell" ? 2 : 1,
              weight_value: "",
            },
          ],
    });
  };

  const setWeight = (category, value) =>
    set({
      equipment: form.equipment.map((e) =>
        e.category === category ? { ...e, weight_value: value } : e
      ),
    });

  const finish = async () => {
    setSaving(true);
    try {
      const num = (v) => (v === "" || v === null || v === undefined ? undefined : Number(v));

      const existing = await getProfile();
      const profilePayload = {
        display_name: form.display_name,
        age: num(form.age),
        height_cm: num(form.height_cm),
        experience: form.experience,
        goals: form.goals,
        weekly_target: num(form.weekly_target) ?? 3,
        session_minutes: num(form.session_minutes) ?? 35,
        conditions: form.conditions,
        medications: form.medications,
        clinician_notes: form.clinician_notes,
        measurement_unit: form.measurement_unit,
        onboarding_complete: true,
      };
      const profile = existing?.id
        ? await base44.entities.HealthProfile.update(existing.id, profilePayload)
        : await base44.entities.HealthProfile.create(profilePayload);

      if (form.injury?.name) {
        const injuryPayload = { ...form.injury, pain_level: num(form.injury.pain_level) ?? 0 };
        if (existing?.id) {
          const current = await getInjuries();
          const match = current.find((i) => i.name === form.injury.name && i.area === form.injury.area);
          if (match) await base44.entities.Injury.update(match.id, injuryPayload);
          else await base44.entities.Injury.create(injuryPayload);
        } else {
          await base44.entities.Injury.create(injuryPayload);
        }
      }

      const measurement = {};
      let hasMeasure = false;
      METRICS.forEach((m) => {
        const raw = form.measurement[m.key];
        if (raw === "" || raw === undefined || raw === null) return;
        const value = m.length ? unitToCm(raw, form.measurement_unit) : Number(raw);
        if (value === undefined || Number.isNaN(value)) return;
        measurement[m.key] = value;
        hasMeasure = true;
      });
      if (hasMeasure) {
        await base44.entities.Measurement.create({
          ...measurement,
          date: form.measurement.date || isoDate(),
          is_baseline: true,
        });
      }

      const kit = form.equipment.map((e) => ({
        ...e,
        weight_value: num(e.weight_value),
        quantity: num(e.quantity) ?? 1,
      }));
      if (kit.length) await base44.entities.Equipment.bulkCreate(kit);

      const [injuries, equipment] = await Promise.all([getInjuries(), getEquipment()]);
      const drafts = buildWeek({
        profile,
        injuries,
        equipment,
        sessions: [],
        weekStart: mondayOf(),
      });
      await base44.entities.WorkoutSession.deleteMany({ week_start: mondayOf(), status: "planned" });
      await base44.entities.WorkoutSession.bulkCreate(drafts);

      toast.success("Your first week is ready");
      navigate({ to: "/" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[560px] space-y-6 py-2">
      <header className="space-y-3">
        <p className="eyebrow">
          Step {step + 1} of 3 · {STEPS[step]}
        </p>
        <h1 className="font-display text-[1.9rem] leading-[1.1] tracking-[-0.02em] sm:text-[2.4rem]">
          {step === 0
            ? "Let’s start with where you are."
            : step === 1
              ? "Your before picture."
              : "What you train with."}
        </h1>
        <div className="flex gap-1.5">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-secondary"}`}
            />
          ))}
        </div>
      </header>

      <div className="panel px-5 py-5">
        {step === 0 ? <StepHealth form={form} set={set} setInjury={setInjury} /> : null}
        {step === 1 ? (
          <StepMeasurements
            value={form.measurement}
            onChange={setMeasurement}
            unit={form.measurement_unit}
            onUnitChange={(unit) => set({ measurement_unit: unit })}
          />
        ) : null}
        {step === 2 ? (
          <StepEquipment
            equipment={form.equipment}
            onToggle={toggleEquipment}
            onWeight={setWeight}
          />
        ) : null}
      </div>

      <div className="flex gap-2">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-1.5 rounded-full border border-border px-5 py-3.5 text-[13px] text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        ) : null}

        {step < 2 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-3.5 text-[13.5px] font-medium text-primary-foreground transition hover:opacity-90"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={finish}
            disabled={saving}
            className="flex-1 rounded-full bg-primary px-5 py-3.5 text-[13.5px] font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Building your week…" : "Build my first week"}
          </button>
        )}
      </div>

      <p className="pb-2 text-center text-[10.5px] leading-relaxed text-muted-foreground">
        This app supports, and never replaces, advice from your doctor or physiotherapist.
      </p>
    </div>
  );
}

const EQUIPMENT_NAME = {
  dumbbell: "Dumbbells",
  band: "Resistance band",
  bench: "Bench",
  kettlebell: "Kettlebell",
  barbell: "Barbell",
  pull_up_bar: "Pull-up bar",
  bike: "Stationary bike",
  treadmill: "Treadmill",
  rower: "Rowing machine",
  medicine_ball: "Medicine ball",
};