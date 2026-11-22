import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getEquipment, getInjuries, getProfile, getSessions } from "@/lib/api";
import { addDays, DAY_SHORT, isoDate, mondayOf, prettyDate } from "@/lib/format";
import { buildWeek } from "@/lib/plan";

export const Route = createFileRoute("/_authed/plan")({
  head: () => ({ meta: [{ title: "Weekly plan · Back in Shape" }] }),
  component: PlanPage,
});

function PlanPage() {
  const navigate = useNavigate();
  const [weekStart, setWeekStart] = useState(mondayOf());
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [profile, injuries, equipment, sessions] = await Promise.all([
      getProfile(),
      getInjuries(),
      getEquipment(),
      getSessions({ week_start: weekStart }),
    ]);
    setData({ profile, injuries, equipment, sessions });
  };

  useEffect(() => {
    load();
  }, [weekStart]);

  if (!data) {
    return <p className="py-24 text-center text-[13px] text-muted-foreground">Loading plan…</p>;
  }

  const { profile, injuries, equipment, sessions } = data;
  const today = isoDate();
  const adjustment = sessions.find((s) => s.adjustment_note)?.adjustment_note;

  const build = async () => {
    setBusy(true);
    try {
      await base44.entities.WorkoutSession.deleteMany({ week_start: weekStart, status: "planned" });
      const drafts = buildWeek({ profile, injuries, equipment, sessions, weekStart });
      await base44.entities.WorkoutSession.bulkCreate(drafts);
      await load();
      toast.success("Week rebuilt");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="eyebrow">Weekly plan</p>
        <h1 className="font-display text-[2rem] leading-[1.08] tracking-[-0.02em] sm:text-[2.5rem]">
          {sessions.length ? "Built around your elbow." : "No plan for this week yet."}
        </h1>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setWeekStart(addDays(weekStart, -7))}
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:text-foreground"
              aria-label="Previous week"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="tnum text-[12px] text-muted-foreground">
              {prettyDate(weekStart, { day: "numeric", month: "short" })} –{" "}
              {prettyDate(addDays(weekStart, 6), { day: "numeric", month: "short" })}
            </span>
            <button
              type="button"
              onClick={() => setWeekStart(addDays(weekStart, 7))}
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:text-foreground"
              aria-label="Next week"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={build}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-[11.5px] text-muted-foreground transition hover:text-foreground disabled:opacity-60"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {busy ? "Rebuilding…" : sessions.length ? "Rebuild" : "Build week"}
          </button>
        </div>
      </header>

      {adjustment ? (
        <p className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-[11.5px] leading-relaxed text-primary">
          {adjustment}
        </p>
      ) : null}

      <div className="space-y-2.5">
        {Array.from({ length: 7 }, (_, i) => {
          const date = addDays(weekStart, i);
          const session = sessions.find((s) => s.date === date);
          const isToday = date === today;

          if (!session) {
            return (
              <div
                key={date}
                className="flex items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-3.5"
              >
                <span className="w-9 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  {DAY_SHORT[i]}
                </span>
                <span className="text-[12.5px] text-muted-foreground">Rest</span>
              </div>
            );
          }

          return (
            <button
              key={date}
              type="button"
              onClick={() => navigate({ to: "/session/$sessionId", params: { sessionId: session.id } })}
              className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition hover:border-primary/50 ${
                isToday ? "border-primary/50 bg-primary/5" : "border-border bg-card"
              }`}
            >
              <span className="w-9 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                {DAY_SHORT[i]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-medium">{session.title}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {session.exercises.length} movements · {session.planned_minutes} min
                  {session.status === "completed" ? " · completed" : ""}
                </span>
              </span>
              {session.status === "completed" ? (
                <span className="rounded-full bg-primary/15 px-2 py-1 text-[9.5px] uppercase tracking-[0.1em] text-primary">
                  Done
                </span>
              ) : (
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </button>
          );
        })}
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Exercises are chosen only from kit you own, with anything that loads the inner elbow kept
        out while that niggle is active.{" "}
        <Link to="/equipment" className="text-primary underline-offset-4 hover:underline">
          Update your kit
        </Link>
        .
      </p>
    </div>
  );
}