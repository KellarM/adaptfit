import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { prettyDate } from "@/lib/format";
import EntryCard from "@/components/training/EntryCard";

// A finished workout in history, folded up. Opening it shows the same
// breakdown as the workout did while it was being logged.
export default function SavedWorkout({ row }) {
  const [open, setOpen] = useState(false);
  const entries = row.entries || [];

  return (
    <li className="py-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-baseline justify-between gap-3 text-left"
      >
        <span className="text-[13px] font-medium">{prettyDate(row.date)}</span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="tnum text-[11.5px] text-muted-foreground">
            {row.total_minutes ? `${row.total_minutes} min` : ""}
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-muted-foreground transition ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      <p className="mt-0.5 text-[11.5px] text-muted-foreground">{row.summary}</p>
      {open ? (
        entries.length ? (
          <ul className="mt-1 border-t border-border/60 pt-1">
            {entries.map((entry, i) => (
              <EntryCard key={`${entry.name}-${i}`} entry={entry} index={i} />
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[11.5px] text-muted-foreground">No breakdown was stored.</p>
        )
      ) : null}
    </li>
  );
}