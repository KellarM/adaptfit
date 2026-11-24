import { useState } from "react";
import { ChevronDown } from "lucide-react";
import EntryCard from "@/components/training/EntryCard";

// A day in the plan that has no prescribed session but does have a workout you
// logged in Mine. It sits in the same row as the rest of the week, folded up.
export default function LoggedDay({ day, log }) {
  const [open, setOpen] = useState(false);
  const entries = log.entries || [];

  return (
    <div className="rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <span className="w-9 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
          {day}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-medium">
            {log.title || "Your own workout"}
          </span>
          <span className="block truncate text-[11px] text-muted-foreground">
            {entries.length} {entries.length === 1 ? "movement" : "movements"}
            {log.total_minutes ? ` · ${log.total_minutes} min` : ""} · from Mine
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-primary/15 px-2 py-1 text-[9.5px] uppercase tracking-[0.1em] text-primary">
          Logged
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <ul className="border-t border-border/60 px-4">
          {entries.length ? (
            entries.map((entry, i) => (
              <EntryCard key={`${entry.name}-${i}`} entry={entry} index={i} />
            ))
          ) : (
            <li className="py-3 text-[11.5px] text-muted-foreground">No breakdown was stored.</li>
          )}
        </ul>
      ) : null}
    </div>
  );
}