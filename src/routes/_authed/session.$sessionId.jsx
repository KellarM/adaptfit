import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getSessions, sessionVolume } from "@/lib/api";
import { prettyDate } from "@/lib/format";
import { kgToLb } from "@/lib/units";
import ExerciseBlock from "@/components/session/ExerciseBlock";
import RestTimer from "@/components/session/RestTimer";
import FeedbackDialog from "@/components/session/FeedbackDialog";
import RepCounter from "@/components/session/RepCounter";

export const Route = createFileRoute("/_authed/session/$sessionId")({
  head: () => ({ meta: [{ title: "Session · Back in Shape" }] }),
  component: SessionPage,
});

// The prescription says where to start; last week says where you actually got
// to. Prefilling from history is the difference between tapping a set done and
// retyping the same weight every session.
function withSets(exercise, last) {
  const sets_log =
    exercise.sets_log && exercise.sets_log.length
      ? exercise.sets_log
      : Array.from({ length: exercise.sets || 2 }, () => ({
          reps: last?.reps ?? exercise.reps ?? "",
          weight: last?.weight ?? exercise.load_lb ?? (exercise.load_kg ? kgToLb(exercise.load_kg) : ""),
          done: false,
        }));
  return { ...exercise, sets_log, last: last || null };
}

// Newest first, so the first hit for a movement is the most recent one.
function lastLogged(sessions = []) {
  const byName = new Map();
  [...sessions]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .forEach((session) => {
      (session.exercises || []).forEach((exercise) => {
        if (byName.has(exercise.name)) return;
        const sets = (exercise.sets_log || []).filter((set) => set.done && Number(set.weight) > 0);
        const set = sets[sets.length - 1];
        if (set) byName.set(exercise.name, { weight: set.weight, reps: set.reps });
      });
    });
  return byName;
}

function SessionPage() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [rest, setRest] = useState(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [counting, setCounting] = useState(null);
  const [saving, setSaving] = useState(false);
  // Typing in a set field shouldn't fire a save per keystroke.
  const saveTimer = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const record = await base44.entities.WorkoutSession.get(sessionId);
      if (!alive) return;

      // A finished session keeps the numbers it was logged with; only a planned
      // one is allowed to inherit last week's weights.
      let history = new Map();
      if (record.status !== "completed") {
        const prior = await getSessions({ status: "completed" });
        history = lastLogged(prior.filter((item) => String(item.date) < String(record.date)));
      }
      if (!alive) return;

      setSession(record);
      setExercises((record.exercises || []).map((ex) => withSets(ex, history.get(ex.name))));
    })();
    return () => {
      alive = false;
    };
  }, [sessionId]);

  if (!session) {
    return <p className="py-24 text-center text-[13px] text-muted-foreground">Loading session…</p>;
  }

  const persist = (next) => {
    setExercises(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      base44.entities.WorkoutSession.update(sessionId, { exercises: next });
    }, 700);
  };

  const changeSet = (exIdx, setIdx, patch) => {
    const next = exercises.map((ex, i) =>
      i !== exIdx
        ? ex
        : {
            ...ex,
            sets_log: ex.sets_log.map((s, si) => (si === setIdx ? { ...s, ...patch } : s)),
          }
    );
    persist(next);
  };

  const doneSet = (exIdx, setIdx) => {
    const ex = exercises[exIdx];
    const next = exercises.map((item, i) =>
      i !== exIdx
        ? item
        : {
            ...item,
            sets_log: item.sets_log.map((s, si) =>
              si === setIdx ? { ...s, done: !s.done } : s
            ),
          }
    );
    persist(next);
    if (!ex.sets_log[setIdx].done) {
      const seconds = ex.rest_seconds || 60;
      setRest({ endsAt: Date.now() + seconds * 1000, total: seconds });
    }
  };

  // Counting runs off the next set that hasn't been ticked, so the order of the
  // session decides it rather than the order you tap.
  const startCount = (exIdx) => {
    const ex = exercises[exIdx];
    const setIdx = (ex?.sets_log || []).findIndex((set) => !set.done);
    if (!ex || setIdx < 0) return;
    setCounting({ exIdx, setIdx });
  };

  const finishCount = (reps) => {
    if (!counting) return;
    const { exIdx, setIdx } = counting;
    const ex = exercises[exIdx];
    const weight = ex.sets_log?.[setIdx]?.weight ?? "";
    const next = exercises.map((item, i) =>
      i !== exIdx
        ? item
        : {
            ...item,
            sets_log: item.sets_log.map((set, si) =>
              si === setIdx ? { ...set, reps: reps || set.reps, weight, done: true } : set
            ),
          }
    );
    setCounting(null);
    persist(next);
    const seconds = ex.rest_seconds || 60;
    setRest({ endsAt: Date.now() + seconds * 1000, total: seconds });
  };

  const finish = async (feedback) => {
    setSaving(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    try {
      await base44.entities.WorkoutSession.update(sessionId, {
        ...feedback,
        exercises,
        status: "completed",
        completed_at: new Date().toISOString(),
        volume: Math.round(sessionVolume({ exercises })),
      });
      toast.success("Logged. Next week's plan adjusts to this.");
      navigate({ to: "/" });
    } finally {
      setSaving(false);
    }
  };

  const doneCount = exercises.reduce(
    (t, ex) => t + (ex.sets_log || []).filter((s) => s.done).length,
    0
  );
  const totalSets = exercises.reduce((t, ex) => t + (ex.sets_log || []).length, 0);

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => navigate({ to: "/plan" })}
        className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Plan
      </button>

      <header className="space-y-2">
        <p className="eyebrow">{prettyDate(session.date)} · {session.focus}</p>
        <h1 className="font-display text-[1.9rem] leading-[1.1] tracking-[-0.02em] sm:text-[2.4rem]">
          {session.title}
        </h1>
        <p className="tnum text-[12px] text-muted-foreground">
          {doneCount} of {totalSets} sets logged
          {session.status === "completed" ? " · session complete" : ""}
        </p>
      </header>

      {session.adjustment_note ? (
        <p className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-[11.5px] leading-relaxed text-primary">
          {session.adjustment_note}
        </p>
      ) : null}

      <p className="rounded-2xl bg-secondary px-4 py-3 text-[11.5px] leading-relaxed text-muted-foreground">
        Work down the list. Each movement shows its rest time under the set count — heavier lifts get
        longer, core and mobility shorter. Tap the tick when a set is done and the timer starts
        itself. The weight shown is only a starting point — adjust it if the last rep felt easy or
        wobbly.
      </p>

      <div className="space-y-3">
        {exercises.map((exercise, i) => (
          <ExerciseBlock
            key={`${exercise.name}-${i}`}
            index={i}
            exercise={exercise}
            onSetChange={(si, patch) => changeSet(i, si, patch)}
            onSetDone={(si) => doneSet(i, si)}
            onCountSet={startCount}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setFeedbackOpen(true)}
        className="w-full rounded-full bg-primary px-5 py-3.5 text-[13.5px] font-medium text-primary-foreground transition hover:opacity-90"
      >
        {session.status === "completed" ? "Update feedback" : "Finish and rate the session"}
      </button>

      <RestTimer
        rest={rest}
        onDone={() => setRest(null)}
        onExtend={(s) =>
          setRest((r) => (r ? { ...r, endsAt: r.endsAt + s * 1000, total: r.total + s } : r))
        }
      />

      {counting ? (
        <RepCounter
          exercise={exercises[counting.exIdx]}
          setNumber={counting.setIdx + 1}
          target={Number(exercises[counting.exIdx]?.reps) || 8}
          onFinish={finishCount}
          onCancel={() => setCounting(null)}
        />
      ) : null}

      <FeedbackDialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        onSubmit={finish}
        saving={saving}
        initial={session}
      />
    </div>
  );
}