import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { isoDate } from "@/lib/format";
import { summarise, totals } from "@/lib/training";
import EntryCard from "@/components/training/EntryCard";
import QuickAdd from "@/components/training/QuickAdd";
import TellMe from "@/components/training/TellMe";
import SavedWorkout from "@/components/training/SavedWorkout";

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
  const [saveError, setSaveError] = useState(false);

  // Writes go out one at a time, and every one reads the draft and the entry
  // list from these refs, never from a render that may already be stale.
  const draftRef = useRef(null);
  const entriesRef = useRef([]);
  const queue = useRef(Promise.resolve());

  const remember = (record) => {
    draftRef.current = record;
    setDraft(record);
  };

  const applyEntries = (next) => {
    entriesRef.current = next;
    setEntries(next);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      const [{ items: drafts }, { items: done }] = await Promise.all([
        base44.entities.TrainingLog.filter({ status: "draft" }, { sort: "-created_date", limit: 1 }),
        base44.entities.TrainingLog.filter({ status: "saved" }, { sort: "-date", limit: 60 }),
      ]);
      if (!alive) return;
      remember(drafts[0] || null);
      applyEntries(drafts[0]?.entries || []);
      setSaved(done);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Every change is written the moment it happens. A phone that sleeps, a tab
  // that reloads, a workout that takes an hour: the draft is never only in memory.
  const persist = (next, extra = {}) => {
    applyEntries(next);
    const run = queue.current.then(async () => {
      const payload = { entries: next, ...extra };
      const record = draftRef.current?.id
        ? await base44.entities.TrainingLog.update(draftRef.current.id, payload)
        : await base44.entities.TrainingLog.create({
            date: isoDate(),
            status: "draft",
            ...payload,
          });
      remember(record);
      setSaveError(false);
      return record;
    });
    queue.current = run.catch(() => setSaveError(true));
    return run;
  };

  const addEntries = async (rows) => {
    const next = [...entriesRef.current, ...rows];
    await persist(next, { title: draftRef.current?.title || "" });
    toast.success(
      `Added ${rows.length === 1 ? "1 entry" : `${rows.length} entries`} to this workout.`
    );
    return true;
  };

  const removeEntry = async (index) => {
    const next = entriesRef.current.filter((_, i) => i !== index);
    await persist(next).catch(() => {});
  };

  const retry = async () => {
    try {
      await persist(entriesRef.current, { title: draftRef.current?.title || "" });
      toast.success("Saved.");
    } catch {
      toast.error("Still could not save. Your details are safe on this screen.");
    }
  };

  const save = async () => {
    const current = entriesRef.current;
    if (!current.length) return;
    setBusy(true);
    try {
      const record = await persist(current, {
        status: "saved",
        date: draftRef.current?.date || isoDate(),
        title: draftRef.current?.title || "",
        total_minutes: totals(current).minutes || null,
        summary: summarise(current),
        completed_at: new Date().toISOString(),
      });
      setSaved((rows) => [record, ...rows.filter((row) => row.id !== record.id)]);
      draftRef.current = null;
      setDraft(null);
      applyEntries([]);
      toast.success("Saved. The workout is in your history.");
    } catch {
      toast.error("Could not save the workout. Nothing is lost — press save again.");
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

        {saveError ? (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2">
            <p className="text-[11.5px] text-foreground">
              Not saved to the server yet. Your details are still here.
            </p>
            <button
              type="button"
              onClick={retry}
              className="shrink-0 rounded-full border border-border px-3 py-1 text-[11px] text-foreground transition hover:border-primary/60 hover:text-primary"
            >
              Try again
            </button>
          </div>
        ) : null}

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
              <SavedWorkout key={row.id} row={row} />
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