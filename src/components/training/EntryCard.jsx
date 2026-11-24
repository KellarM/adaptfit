import { Trash2 } from "lucide-react";
import { metricLine } from "@/lib/training";

function SetRows({ entry }) {
  if (!entry.sets?.length) return null;
  return (
    <ul className="mt-2 space-y-1">
      {entry.sets.map((s, i) => (
        <li key={i} className="tnum text-[12px] text-muted-foreground">
          Set {i + 1}: {s.reps ?? "—"} reps
          {Number.isFinite(s.weight) ? ` × ${s.weight} lb` : ""}
        </li>
      ))}
    </ul>
  );
}

function SegmentRows({ entry }) {
  if (!entry.segments?.length) return null;
  return (
    <ul className="mt-2 space-y-1">
      {entry.segments.map((s, i) => (
        <li key={i} className="tnum text-[12px] text-muted-foreground">
          {s.minutes ?? "—"} min {s.mode}
          {Number.isFinite(s.speed_kph) ? ` · ${s.speed_kph} km/h` : ""}
          {Number.isFinite(s.incline) ? ` · incline ${s.incline}` : ""}
        </li>
      ))}
    </ul>
  );
}

export default function EntryCard({ entry, index, onRemove }) {
  const meta = metricLine(entry);
  return (
    <li className="flex items-start gap-3 border-b border-border/60 py-3 last:border-0">
      <span className="tnum mt-0.5 w-4 shrink-0 text-[10.5px] text-muted-foreground">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-medium leading-snug">{entry.name}</p>
        <p className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
          {entry.kind}
          {entry.kind !== "strength" && entry.minutes ? ` · ${entry.minutes} min` : ""}
        </p>
        {meta ? <p className="tnum mt-1 text-[11.5px] text-muted-foreground">{meta}</p> : null}
        <SetRows entry={entry} />
        <SegmentRows entry={entry} />
        {entry.note ? (
          <p className="mt-1.5 text-[11.5px] text-muted-foreground">{entry.note}</p>
        ) : null}
      </div>
      {onRemove ? (
        <button
          type="button"
          onClick={() => onRemove(index)}
          aria-label={`Remove ${entry.name}`}
          className="mt-0.5 shrink-0 rounded-full p-1.5 text-muted-foreground transition hover:bg-background hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </li>
  );
}
