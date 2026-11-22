import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { getEquipment, getInjuries, getProfile } from "@/lib/api";
import { isoDate, mondayOf } from "@/lib/format";
import { METRICS } from "@/lib/metrics";
import { unitToCm } from "@/lib/units";
import { buildWeek } from "@/lib/plan";
import AboutYou from "@/components/onboarding/AboutYou";
import BodyMeasurements from "@/components/measurements/BodyMeasurements";
import ConditionsSection from "@/components/onboarding/ConditionsSection";
import StepEquipment from "@/components/onboarding/StepEquipment";

export const Route = createFileRoute("/_authed/onboarding")({
  head: () => ({ meta: [{ title: "Set up · Back in Shape" }] }),
  component: OnboardingPage,
});

// Used until a described condition is read, so the elbow stays protected.
const DEFAULT_INJURY = {
  name: "Medial epicondylitis",
  area: "elbow",
  side: "right",
  status: "recovering",
  pain_level: 4,
  avoid_tags: ["medial_elbow", "grip"],
  note: "",
};

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

function OnboardingPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [answers, setAnswers] = useState({});
  const [form, setForm] = useState({
    display_name: "",
    age: "",
    height_cm: "",
    experience: "starting",
    goals: ["strength", "pain_free"],
    weekly_target: 3,
    session_minutes: 35,
    conditions_text: "",
    measurement: { date: isoDate() },
    measurement_unit: "in",
    equipment: [],
  });

  useEffect(() => {
    (async () => {
      const profile = await getProfile();
      if (!profile) return;
      setForm((f) => ({
        ...f,
        display_name: profile.display_name || "",
        age: profile.age ?? "",
        height_cm: profile.height_cm ?? "",
        experience: profile.experience || "starting",
        goals: profile.goals?.length ? profile.goals : f.goals,
        weekly_target: profile.weekly_target ?? 3,
        session_minutes: profile.session_minutes ?? 35,
        conditions_text: profile.conditions_text || "",
        measurement_unit: profile.measurement_unit || "in",
      }));
    })();
  }, []);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setMeasurement = (value) => set({ measurement: value });
  const setAnswer = (question, value) => setAnswers((a) => ({ ...a, [question]: value }));

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

      const answerLines = Object.entries(answers)
        .filter(([, value]) => value && value.trim())
        .map(([question, value]) => `${question} ${value.trim()}`);

      const existing = await getProfile();
      const profilePayload = {
        display_name: form.display_name,
        age: num(form.age),
        height_cm: num(form.height_cm),
        experience: form.experience,
        goals: form.goals,
        weekly_target: num(form.weekly_target) ?? 3,
        session_minutes: num(form.session_minutes) ?? 35,
        conditions_text: [form.conditions_text.trim(), ...answerLines].filter(Boolean).join("\n"),
        conditions_summary: analysis?.summary || existing?.conditions_summary || "",
        measurement_unit: form.measurement_unit,
        onboarding_complete: true,
      };
      const profile = existing?.id
        ? await base44.entities.HealthProfile.update(existing.id, profilePayload)
        : await base44.entities.HealthProfile.create(profilePayload);

      const areas = analysis?.areas?.length ? analysis.areas : [DEFAULT_INJURY];
      const current = existing?.id ? await getInjuries() : [];
      for (const area of areas) {
        const payload = {
          name: area.name,
          area: area.area,
          side: area.side || "both",
          status: area.status || "recovering",
          pain_level: num(area.pain_level) ?? 0,
          avoid_tags: area.avoid_tags || [],
          notes: area.note || "",
        };
        const match = current.find((i) => i.name === payload.name && i.area === payload.area);
        if (match) await base44.entities.Injury.update(match.id, payload);
        else await base44.entities.Injury.create(payload);
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
    <div className="mx-auto max-w-[820px] space-y-5 py-2">
      <header className="space-y-3">
        <p className="eyebrow">Set up · everything before the first exercise</p>
        <h1 className="font-display text-[1.9rem] leading-[1.1] tracking-[-0.02em] sm:text-[2.4rem]">
          Your body first. The plan comes after.
        </h1>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          Four sections, one pass: your baseline numbers, every muscle you want to track, and your
          own words about what your body is dealing with. The plan only starts once all of it is in.
        </p>
      </header>

      <section className="panel px-5 py-5">
        <div className="mb-4 space-y-1">
          <p className="eyebrow">01 · About you</p>
          <h2 className="font-display text-[1.2rem]">The basics</h2>
        </div>
        <AboutYou form={form} set={set} />
      </section>

      <section className="panel px-5 py-5">
        <div className="mb-4 space-y-1">
          <p className="eyebrow">02 · Your body</p>
          <h2 className="font-display text-[1.2rem]">Every muscle you&rsquo;re tracking</h2>
          <p className="text-[11.5px] leading-relaxed text-muted-foreground">
            Each site is named on the body. Measure the widest point, tape snug and level, and leave
            anything you can&rsquo;t reach empty.
          </p>
        </div>
        <BodyMeasurements
          value={form.measurement}
          onChange={setMeasurement}
          heightCm={form.height_cm}
          onHeight={(height_cm) => set({ height_cm })}
          unit={form.measurement_unit}
          onUnitChange={(unit) => set({ measurement_unit: unit })}
        />
      </section>

      <section className="panel px-5 py-5">
        <div className="mb-4 space-y-1">
          <p className="eyebrow">03 · Conditions</p>
          <h2 className="font-display text-[1.2rem]">Tell me in your own words</h2>
          <p className="text-[11.5px] leading-relaxed text-muted-foreground">
            No boxes to tick. Describe it however it comes out and I&rsquo;ll break it down myself.
          </p>
        </div>
        <ConditionsSection
          text={form.conditions_text}
          onText={(conditions_text) => set({ conditions_text })}
          analysis={analysis}
          onAnalysis={setAnalysis}
          answers={answers}
          onAnswer={setAnswer}
        />
      </section>

      <section className="panel px-5 py-5">
        <div className="mb-4 space-y-1">
          <p className="eyebrow">04 · Your kit</p>
          <h2 className="font-display text-[1.2rem]">What you train with</h2>
          <p className="text-[11.5px] leading-relaxed text-muted-foreground">
            Last piece of data. The routine is built from this and nothing else.
          </p>
        </div>
        <StepEquipment
          equipment={form.equipment}
          onToggle={toggleEquipment}
          onWeight={setWeight}
        />
      </section>

      <button
        type="button"
        onClick={finish}
        disabled={saving}
        className="w-full rounded-full bg-primary px-5 py-3.5 text-[13.5px] font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
      >
        {saving ? "Building your week…" : "Build my first week"}
      </button>

      <p className="pb-2 text-center text-[10.5px] leading-relaxed text-muted-foreground">
        This app supports, and never replaces, advice from your doctor or physiotherapist.
      </p>
    </div>
  );
}