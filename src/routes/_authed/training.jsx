import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { isoDate, prettyDate } from "@/lib/format";
import { summarise, totals } from "@/lib/training";
import EntryCard from "@/components/training/EntryCard";
import QuickAdd from "@/components/training/QuickAdd";
import TellMe from "@/components/training/TellMe";

export const Route = createFileRoute("/_authed/training")({
  head: () => ({ meta: [{ title: "My training · Back in Shape" }] }),
  component: TrainingPage,
});

// His own training, kept apart from the generated plan on purpose. The plan
// engine never reads these rows, so nothing here can be counted as a missed
// session or used to ease a load without him asking.
function TrainingPage() {
  const [draft, setDraft] = useState(null);
  const [entries, setEntries] = useState([]);
  const [saved, setSaved] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [{ items: drafts }, { items: done }] = await Promise.all([
        base44.entities.TrainingLog.filter({ status: "draft" }, { sort: "-created_date", limit: 1 }),
        base44.entities.TrainingLog.filter({ status: "saved" }, { sort: "-date", limit: 60 }),
      ]);
      if (!alive) return;
      setDraft(drafts[0] || null);
      setEntries(drafts[0]?.entries || []);
      setSaved(done);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Every change is written the moment it happens. A phone that sleeps, a tab
  // that reloads, a workout that takes an hour: the draft is never only in memory.
  const persist = async (next, extra = {}) => {
    setEntries(next);
    if (draft?.id) {
      await base44.entities.TrainingLog.update(draft.id, { entries: next, ...extra });
      return draft.id;
    }
    const created = await base44.entities.TrainingLog.create({
      date: isoDate(),
      status: "draft",
      entries: next,
      ...extra,
    });
    setDraft(created);
    return created.id;
  };

  const addEntries = async (rows) => {
    const next = [...entries, ...rows];
    await persist(next, { title: draft?.title || "" });
  };

  const removeEntry = async (index) => {
    const next = entries.filter((_, i) => i !== index);
    await persist(next);
  };

  const save = async () => {
    if (!entries.length) return;
    setBusy(true);
    try {
      const body = {
        status: "saved",
        entries,
        date: draft?.date || isoDate(),
        title: draft?.title || "",
        total_minutes: totals(entries).minutes || null,
        summary: summarise(entries),
        completed_at: new Date().toISOString(),
      };
      const id = await persist(entries, body);
      const record = { id, ...draft, ...body };
      setSaved([record, ...saved.filter((s) => s.id !== id)]);
      setDraft(null);
      setEntries([]);
      toast.success("Saved. The workout is in your history.");
    } finally {
      setBusy(false);
    }
  };

  const live = totals(entries);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="eyebrow">My training</p>
        <h1 className="font-display text-[2rem] leading-[1.08] tracking-[-0.02em] sm:text-[2.4rem]">
          What you actually did.
        </h1>
        <p className="text-[13px] text-muted-foreground">
          Separate from the plan. Nothing here is scored, skipped or adjusted.
        </p>
      </header>

      <TellMe onParsed={addEntries} />
      <QuickAdd onAdd={(entry) => addEntries([entry])} />

      <section className="panel px-5 py-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="eyebrow">This workout</p>
          <p className="tnum text-[11.5px] text-muted-foreground">
            {live.entries} entr{live.entries === 1 ? "y" : "ies"}
            {live.minutes ? ` · ${live.minutes} min` : ""}
            {live.sets ? ` · ${live.sets} sets` : ""}
          </p>
        </div>

        {entries.length ? (
          <ul className="mt-2">
            {entries.map((entry, i) => (
              <EntryCard key={`${entry.name}-${i}`} entry={entry} index={i} onRemove={removeEntry} />
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-[12.5px] text-muted-foreground">
            Nothing logged yet. Tell the app what you did above, or add it by hand.
          </p>
        )}

        <button
          type="button"
          onClick={save}
          disabled={!entries.length || busy}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-[12.5px] font-medium text-primary-foreground transition disabled:opacity-40"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          {busy ? "Saving" : "Finish and save this workout"}
        </button>
      </section>

      <section className="panel px-5 py-4">
        <p className="eyebrow">Logged so far</p>
        {saved.length ? (
          <ul className="mt-2 divide-y divide-border/60">
            {saved.map((row) => (
              <li key={row.id} className="py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[13px] font-medium">{prettyDate(row.date)}</p>
                  <p className="tnum text-[11.5px] text-muted-foreground">
                    {row.total_minutes ? `${row.total_minutes} min` : ""}
                  </p>
                </div>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">{row.summary}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[12.5px] text-muted-foreground">
            No saved workouts yet. The first one you finish will appear here.
          </p>
        )}
      </section>
    </div>
  );
}
