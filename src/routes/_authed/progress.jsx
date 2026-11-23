import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getMeasurements, getProfile, getSessions } from "@/lib/api";
import { fmtNum, prettyDate } from "@/lib/format";
import { cmToUnit, kgToLb } from "@/lib/units";
import MetricTable from "@/components/progress/MetricTable";
import UnitToggle from "@/components/measurements/UnitToggle";
import WeightChart from "@/components/progress/WeightChart";
import MeasurementDialog from "@/components/progress/MeasurementDialog";
import StrengthTrend from "@/components/progress/StrengthTrend";

export const Route = createFileRoute("/_authed/progress")({
  head: () => ({ meta: [{ title: "Progress · Back in Shape" }] }),
  component: ProgressPage,
});

function ProgressPage() {
  const [measurements, setMeasurements] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [unit, setUnit] = useState("in");
  const [profileId, setProfileId] = useState(null);

  const load = async () => {
    const [m, s, p] = await Promise.all([
      getMeasurements(),
      getSessions({ status: "completed" }),
      getProfile(),
    ]);
    setMeasurements(m);
    setSessions(s.sort((a, b) => b.date.localeCompare(a.date)));
    setUnit(p?.measurement_unit || "in");
    setProfileId(p?.id || null);
  };

  useEffect(() => {
    load();
  }, []);

  if (!measurements) {
    return <p className="py-24 text-center text-[13px] text-muted-foreground">Loading progress…</p>;
  }

  const latest = measurements[0] || null;
  const baseline = measurements[measurements.length - 1] || null;
  const chartPoints = [...measurements]
    .reverse()
    .filter((m) => m.weight_kg)
    .map((m) => ({
      label: prettyDate(m.date, { day: "numeric", month: "short" }),
      value: Number(kgToLb(m.weight_kg)),
    }));

  const recent = sessions.slice(0, 6);
  const elbowAvg = recent.length
    ? recent.reduce((t, s) => t + Number(s.elbow_pain || 0), 0) / recent.length
    : null;

  const save = async (payload) => {
    setSaving(true);
    try {
      await base44.entities.Measurement.create({ ...payload, is_baseline: measurements.length === 0 });
      await load();
      setOpen(false);
      toast.success("Measurements saved");
    } finally {
      setSaving(false);
    }
  };

  const changeUnit = async (next) => {
    setUnit(next);
    if (profileId) {
      await base44.entities.HealthProfile.update(profileId, { measurement_unit: next });
    }
  };

  return (
    <div className="space-y-7">
      <header className="space-y-3">
        <p className="eyebrow">Progress</p>
        <h1 className="font-display text-[2rem] leading-[1.08] tracking-[-0.02em] sm:text-[2.5rem]">
          Before, and after.
        </h1>
        <p className="text-[13px] text-muted-foreground">
          {measurements.length} measurement{measurements.length === 1 ? "" : "s"} ·{" "}
          {sessions.length} session{sessions.length === 1 ? "" : "s"} logged
        </p>
      </header>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="panel px-3 py-4 sm:px-4">
          <p className="text-[9px] uppercase tracking-[0.13em] text-muted-foreground">Weight now</p>
          <p className="tnum mt-2.5 font-display text-xl leading-none sm:text-2xl">
            {latest?.weight_kg ? fmtNum(kgToLb(latest.weight_kg)) : "—"}
            <span className="ml-1 font-body text-[11px] text-muted-foreground">lb</span>
          </p>
        </div>
        <div className="panel px-3 py-4 sm:px-4">
          <p className="text-[9px] uppercase tracking-[0.13em] text-muted-foreground">Waist now</p>
          <p className="tnum mt-2.5 font-display text-xl leading-none sm:text-2xl">
            {latest?.waist_cm ? fmtNum(cmToUnit(latest.waist_cm, unit)) : "—"}
            <span className="ml-1 font-body text-[11px] text-muted-foreground">{unit}</span>
          </p>
        </div>
        <div className="panel px-3 py-4 sm:px-4">
          <p className="text-[9px] uppercase tracking-[0.13em] text-muted-foreground">Elbow avg</p>
          <p className="tnum mt-2.5 font-display text-xl leading-none sm:text-2xl">
            {elbowAvg === null ? "—" : elbowAvg.toFixed(1)}
            <span className="ml-1 font-body text-[11px] text-muted-foreground">/ 10</span>
          </p>
        </div>
      </div>

      <section className="panel px-5 py-4">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Before and after</p>
          <div className="flex items-center gap-2">
            <UnitToggle unit={unit} onChange={changeUnit} />
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground transition hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              Measure
            </button>
          </div>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {baseline ? `Baseline ${prettyDate(baseline.date)}` : "No baseline yet"}
          {latest && baseline && latest.id !== baseline.id ? ` · latest ${prettyDate(latest.date)}` : ""}
        </p>
        <div className="mt-3">
          <MetricTable baseline={baseline} latest={latest} unit={unit} />
        </div>
      </section>

      <section className="panel px-5 py-4">
        <p className="eyebrow">Body weight</p>
        <div className="mt-3">
          <WeightChart points={chartPoints} />
        </div>
      </section>

      <StrengthTrend sessions={sessions} />

      <section className="panel px-5 py-4">
        <p className="eyebrow">Recent sessions</p>
        {recent.length ? (
          <ul className="mt-2 divide-y divide-border">
            {recent.map((s) => (
              <li key={s.id} className="flex items-center gap-3 py-2.5">
                <span className="flex-1 text-[12.5px]">
                  {s.title}
                  <span className="ml-1.5 text-[10.5px] text-muted-foreground">
                    {prettyDate(s.date)}
                  </span>
                </span>
                <span className="tnum text-[11px] text-muted-foreground">
                  {Math.round(s.volume || 0)} lb lifted
                </span>
                <span className="tnum w-10 text-right text-[11px] text-primary">
                  {fmtNum(s.elbow_pain ?? 0, 0)}/10
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[12px] text-muted-foreground">
            Finish a session and it will show up here with the elbow score you gave it.
          </p>
        )}
      </section>

      {open ? (
        <MeasurementDialog
          onOpenChange={(v) => !v && setOpen(false)}
          onSave={save}
          saving={saving}
          unit={unit}
          onUnitChange={changeUnit}
        />
      ) : null}
    </div>
  );
}