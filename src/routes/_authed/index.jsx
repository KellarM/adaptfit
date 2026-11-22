import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { getEquipment, getInjuries, getMeasurements, getProfile, getSessions } from "@/lib/api";
import { addDays, DAY_SHORT, fmtDelta, fmtNum, isoDate, mondayOf, prettyDate } from "@/lib/format";
import { buildWeek } from "@/lib/plan";
import { kgToLb } from "@/lib/units";
import TodayHero from "@/components/today/TodayHero";
import MetricsStrip from "@/components/today/MetricsStrip";
import SessionCard from "@/components/today/SessionCard";
import ElbowCard from "@/components/today/ElbowCard";
import WeekStrip from "@/components/today/WeekStrip";

export const Route = createFileRoute("/_authed/")({
  head: () => ({ meta: [{ title: "Today · Back in Shape" }] }),
  component: TodayPage,
});

const SHORT = {
  "Full body A": "Full",
  "Full body B": "Full",
  "Full body C": "Full",
  "Full body": "Full",
  "Upper body": "Upper",
  "Lower body": "Lower",
  "Legs and easy cardio": "Legs",
  Conditioning: "Cardio",
  Mobility: "Move",
};

function TodayPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [profile, injuries, equipment, sessions, measurements] = await Promise.all([
      getProfile(),
      getInjuries(),
      getEquipment(),
      getSessions({ week_start: mondayOf() }),
      getMeasurements(),
    ]);
    setData({ profile, injuries, equipment, sessions, measurements });
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (data && (!data.profile || !data.profile.onboarding_complete)) {
      navigate({ to: "/onboarding" });
    }
  }, [data, navigate]);

  if (!data || !data.profile) {
    return <p className="py-24 text-center text-[13px] text-muted-foreground">Loading your day…</p>;
  }

  const { profile, injuries, equipment, sessions, measurements } = data;
  const today = isoDate();
  const weekStart = mondayOf();

  const completed = sessions.filter((s) => s.status === "completed");
  const todaySession = sessions.find((s) => s.date === today && s.status !== "skipped");
  const nextSession = sessions
    .filter((s) => s.date > today && s.status === "planned")
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const session = todaySession || nextSession || null;

  const elbowInjury =
    injuries.find((i) => i.area === "elbow" && i.status !== "resolved") ||
    injuries.find((i) => i.status !== "resolved") ||
    null;

  const lastDone = [...completed].sort((a, b) =>
    String(b.completed_at || b.date).localeCompare(String(a.completed_at || a.date))
  )[0];
  const pain = lastDone?.elbow_pain ?? elbowInjury?.pain_level ?? 0;

  const latest = measurements[0];
  const baseline = measurements[measurements.length - 1];
  const weightDelta =
    latest?.weight_kg && baseline?.weight_kg
      ? Number(kgToLb(latest.weight_kg)) - Number(kgToLb(baseline.weight_kg))
      : null;

  const metrics = [
    {
      label: elbowInjury ? "Elbow" : "Pain",
      value: fmtNum(pain, 0),
      unit: "/ 10",
      note: lastDone ? "at your last session" : "reported at baseline",
    },
    {
      label: "This week",
      value: String(completed.length),
      unit: `/ ${profile.weekly_target || 3}`,
      note: "sessions completed",
    },
    {
      label: "Weight",
      value: latest?.weight_kg ? fmtNum(kgToLb(latest.weight_kg)) : "—",
      unit: latest?.weight_kg ? "lb" : "",
      note: weightDelta === null ? "no baseline yet" : `${fmtDelta(weightDelta, " lb")} since baseline`,
    },
  ];

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const s = sessions.find((x) => x.date === date);
    let state = "upcoming";
    if (s?.status === "completed") state = "done";
    else if (date === today) state = "today";
    else if (!s) state = "rest";
    return { label: DAY_SHORT[i], short: s ? SHORT[s.title] || s.title.split(" ")[0] : "Rest", state };
  });

  const build = async () => {
    setBusy(true);
    try {
      const drafts = buildWeek({ profile, injuries, equipment, sessions, weekStart });
      await base44.entities.WorkoutSession.bulkCreate(drafts);
      await load();
      toast.success("Week built around your kit and your elbow");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-7">
      <TodayHero
        eyebrow={`Week of ${prettyDate(weekStart, { day: "numeric", month: "short" })} · at home`}
        title={session ? `${session.title}, kept simple.` : "Let’s build your week."}
        meta={
          session
            ? `${session.exercises.length} movements · about ${session.planned_minutes} minutes${
                elbowInjury ? ` · ${elbowInjury.side} elbow monitored` : ""
              }`
            : "Two minutes to set up a week that fits your kit."
        }
      />

      <MetricsStrip items={metrics} />

      {session ? (
        <SessionCard
          title={`${session.title} — ${prettyDate(session.date)}`}
          subtitle={session.adjustment_note || session.focus}
          exercises={session.exercises.map((ex) => ({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps ?? ex.duration,
            load: ex.load,
            note: ex.muscle,
            swapped: ex.swapped,
          }))}
          actionLabel={session.status === "completed" ? "Review session" : "Start session"}
          onStart={() => navigate({ to: "/session/$sessionId", params: { sessionId: session.id } })}
        />
      ) : (
        <section className="panel px-5 py-6">
          <p className="eyebrow">Nothing scheduled</p>
          <p className="mt-2 text-[13px] leading-relaxed text-foreground/80">
            Build this week from your equipment and your elbow rules. You can rebuild it any time
            from the Plan tab.
          </p>
          <button
            type="button"
            onClick={build}
            disabled={busy}
            className="mt-4 w-full rounded-full bg-primary px-5 py-3.5 text-[13.5px] font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Building…" : "Build my week"}
          </button>
        </section>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {elbowInjury ? (
          <ElbowCard
            condition={elbowInjury.name}
            side={elbowInjury.side === "both" ? "Both sides" : `${elbowInjury.side} side`}
            status={elbowInjury.status}
            pain={pain}
            guidance="Grip-heavy pulling stays swapped out until this sits at 0–2 for a full week. If it creeps up, next week's load drops automatically."
          />
        ) : null}

        <section className="panel px-5 py-4">
          <p className="eyebrow">New to this?</p>
          <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/80">
            Every movement comes with one plain-English cue and a starting weight. Finish a set
            while the last rep still feels controlled — never to failure.
          </p>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            This app supports, and never replaces, advice from your doctor or physiotherapist.
          </p>
        </section>
      </div>

      <WeekStrip days={days} />
    </div>
  );
}