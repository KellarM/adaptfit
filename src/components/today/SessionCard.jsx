import { ArrowRight, Repeat2 } from "lucide-react";

export default function SessionCard({ title, subtitle, exercises, onStart }) {
  return (
    <section className="panel overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <p className="eyebrow">Today&rsquo;s session</p>
          <h2 className="mt-1.5 font-display text-xl tracking-[-0.01em]">{title}</h2>
          <p className="mt-1 text-[11.5px] text-muted-foreground">{subtitle}</p>
        </div>
        <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground">
          {exercises.length} moves
        </span>
      </div>

      <ul className="divide-y divide-border">
        {exercises.map((ex, i) => (
          <li key={ex.name} className="flex items-center gap-3 px-5 py-3">
            <span className="tnum w-4 shrink-0 text-[10.5px] text-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-medium">{ex.name}</p>
              <p className="mt-0.5 flex items-center gap-1 truncate text-[10.5px] text-muted-foreground">
                {ex.swapped ? (
                  <>
                    <Repeat2 className="h-3 w-3 shrink-0" />
                    <span className="shrink-0">swapped</span>
                    <span className="shrink-0">·</span>
                  </>
                ) : null}
                <span className="truncate">{ex.note}</span>
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="tnum text-[13px]">
                {ex.sets} × {ex.reps}
              </p>
              <p className="tnum text-[10.5px] text-muted-foreground">{ex.load}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="px-5 py-4">
        <button
          type="button"
          onClick={onStart}
          className="group flex w-full items-center justify-between rounded-full bg-primary px-5 py-3.5 text-[13.5px] font-medium text-primary-foreground transition hover:opacity-90"
        >
          Start session
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </section>
  );
}