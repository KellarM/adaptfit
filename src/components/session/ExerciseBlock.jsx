import { Check } from "lucide-react";
import { demoFor } from "@/lib/exerciseDemos";
import ExerciseDemo from "@/components/session/ExerciseDemo";

export default function ExerciseBlock({ index, exercise, onSetChange, onSetDone, onCountSet }) {
  const timed = !exercise.reps;
  const nextSet = (exercise.sets_log || []).findIndex((set) => !set.done);
  const canCount = !timed && nextSet >= 0;

  return (
    <section className="panel overflow-hidden">
      <div className="px-4 py-4">
        <div className="flex items-start gap-3">
          <span className="tnum mt-0.5 w-4 shrink-0 text-[10.5px] text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[14px] font-medium leading-snug">{exercise.name}</h3>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              {exercise.muscle}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="tnum text-[13px]">
              {timed && exercise.sets === 1
                ? exercise.duration
                : `${exercise.sets} × ${timed ? exercise.duration : exercise.reps}`}
            </p>
            <p className="tnum text-[10.5px] text-muted-foreground">{exercise.load}</p>
            {exercise.rest_seconds > 0 ? (
              <p className="tnum text-[10px] text-muted-foreground">
                Rest {exercise.rest_seconds}s
              </p>
            ) : null}
          </div>
        </div>

        <p className="mt-2.5 rounded-xl bg-background/70 px-3 py-2 text-[11.5px] leading-relaxed text-muted-foreground">
          {exercise.cue}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
        <ExerciseDemo src={demoFor(exercise)} name={exercise.name} />
        {canCount ? (
          <button
            type="button"
            onClick={() => onCountSet?.(index)}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[10.5px] text-muted-foreground transition hover:border-primary/50 hover:text-primary"
          >
            Count set {nextSet + 1}
          </button>
        ) : null}
      </div>

        {exercise.last ? (
          <p className="mt-1.5 text-[10.5px] text-muted-foreground">
            Last time {exercise.last.weight} lb
            {exercise.last.reps ? ` × ${exercise.last.reps}` : ""}
          </p>
        ) : null}

        {exercise.swapped ? (
          <p className="mt-2 text-[10.5px] text-primary">
            {exercise.swap_reason || "Swapped for a gentler grip while your elbow settles."}
          </p>
        ) : null}
      </div>

      <div>
        {(exercise.sets_log || []).map((set, si) => (
          <div
            key={si}
            className={`flex items-center gap-2 border-t border-border px-4 py-2 ${
              set.done ? "bg-primary/5" : ""
            }`}
          >
            <span className="w-11 shrink-0 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              Set {si + 1}
            </span>

            {timed ? (
              <span className="flex-1 text-[11.5px] text-muted-foreground">{exercise.duration}</span>
            ) : (
              <div className="flex flex-1 items-center gap-1.5">
                <input
                  type="number"
                  inputMode="numeric"
                  value={set.reps ?? ""}
                  onChange={(e) => onSetChange(si, { reps: e.target.value })}
                  className="tnum h-10 w-14 rounded-lg border border-input bg-background text-center text-[13px] outline-none focus:border-primary/60"
                />
                <span className="text-[10px] text-muted-foreground">reps</span>
                {Number(exercise.load_kg) > 0 ? (
                  <>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={set.weight ?? ""}
                      onChange={(e) => onSetChange(si, { weight: e.target.value })}
                      className="tnum ml-1 h-10 w-16 rounded-lg border border-input bg-background text-center text-[13px] outline-none focus:border-primary/60"
                    />
                    <span className="text-[10px] text-muted-foreground">lb</span>
                  </>
                ) : null}
              </div>
            )}

            <button
              type="button"
              onClick={() => onSetDone(si)}
              aria-label={`Mark set ${si + 1} done`}
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg border transition ${
                set.done
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input text-muted-foreground hover:border-primary/60 hover:text-primary"
              }`}
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}