import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ClipDialog from "@/components/library/ClipDialog";
import ExerciseCard from "@/components/library/ExerciseCard";
import ExerciseDialog from "@/components/library/ExerciseDialog";
import LibraryFilters, { EMPTY_FILTERS } from "@/components/library/LibraryFilters";
import { muscleSearchTerms } from "@/lib/library";

export const Route = createFileRoute("/_authed/library")({
  head: () => ({ meta: [{ title: "Library · Back in Shape" }] }),
  component: LibraryPage,
});

// A page that is opened cold can ask before the session is ready; one quiet retry
// turns that hiccup into a normal load instead of an empty page.
async function fetchExercises(query) {
  try {
    return await base44.entities.Exercise.filter(query, { sort: "name", limit: 200 });
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 700));
    return base44.entities.Exercise.filter(query, { sort: "name", limit: 200 });
  }
}

function LibraryPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  // null = closed, {} = a new movement, a record = editing it.
  const [editing, setEditing] = useState(null);
  const [watching, setWatching] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const query = {};
    if (filters.type) query.type = filters.type;
    if (filters.difficulty) query.difficulty = filters.difficulty;
    if (filters.source) query.video_source = filters.source;
    const search = filters.q.trim();
    if (search) query.name = { $regex: search, $options: "i" };
    const muscleTerms = muscleSearchTerms(filters.muscle);
    if (muscleTerms.length) {
      query.$or = muscleTerms.map((term) => ({
        muscle: { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" },
      }));
    }

    try {
      const { items } = await fetchExercises(query);
      setRows(
        filters.equipment
          ? items.filter((exercise) => (exercise.equipment || []).includes(filters.equipment))
          : items
      );
    } catch {
      setRows([]);
      setLoadError("Your library could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  const save = async (form) => {
    setSaving(true);
    try {
      if (editing?.id) await base44.entities.Exercise.update(editing.id, form);
      else await base44.entities.Exercise.create(form);
      setEditing(null);
      await load();
      toast.success(editing?.id ? "Movement updated." : "Added to your library.");
    } catch {
      toast.error("That did not save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (exercise) => {
    if (!window.confirm(`Remove ${exercise.name} from your library?`)) return;
    try {
      await base44.entities.Exercise.delete(exercise.id);
      setRows((list) => list.filter((row) => row.id !== exercise.id));
      toast.success("Removed.");
    } catch {
      toast.error("Could not remove that one.");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="eyebrow">Library</p>
          <h1 className="font-display text-[2rem] leading-[1.08] tracking-[-0.02em] sm:text-[2.4rem]">
            Your own movements.
          </h1>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Every exercise you keep, with the clip that shows it.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing({})}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 py-2.5 text-[11.5px] font-medium text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </header>

      <LibraryFilters filters={filters} onChange={setFilters} count={rows.length} />

      {loadError ? (
        <div className="rounded-2xl border border-dashed border-border px-5 py-14 text-center">
          <p className="text-[13px] text-muted-foreground">{loadError}</p>
          <button
            type="button"
            onClick={load}
            className="mt-4 rounded-full border border-border px-4 py-2 text-[11.5px] text-muted-foreground transition hover:border-primary/60 hover:text-primary"
          >
            Try again
          </button>
        </div>
      ) : loading ? (
        <p className="py-16 text-center text-[13px] text-muted-foreground">Loading library…</p>
      ) : rows.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onOpen={setWatching}
              onEdit={setEditing}
              onDelete={remove}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border px-5 py-14 text-center">
          <p className="text-[13px] text-muted-foreground">
            Nothing here matches yet. Add a movement and attach a clip to it.
          </p>
          <button
            type="button"
            onClick={() => setEditing({})}
            className="mt-4 rounded-full border border-border px-4 py-2 text-[11.5px] text-muted-foreground transition hover:border-primary/60 hover:text-primary"
          >
            Add a movement
          </button>
        </div>
      )}

      <ClipDialog
        exercise={watching}
        open={Boolean(watching)}
        onOpenChange={(next) => !next && setWatching(null)}
      />

      {editing ? (
        <ExerciseDialog
          initial={editing.id ? editing : null}
          onOpenChange={() => setEditing(null)}
          onSave={save}
          saving={saving}
        />
      ) : null}
    </div>
  );
}