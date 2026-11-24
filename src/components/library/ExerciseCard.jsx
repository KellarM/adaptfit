import { Pencil, Trash2 } from "lucide-react";
import ClipPlayer from "@/components/library/ClipPlayer";
import {
  DIFFICULTY_OPTIONS,
  EQUIPMENT_OPTIONS,
  SOURCE_OPTIONS,
  TYPE_OPTIONS,
  labelOf,
} from "@/lib/library";

export default function ExerciseCard({ exercise, onEdit, onDelete }) {
  const equipment = (exercise.equipment || []).map((key) => labelOf(EQUIPMENT_OPTIONS, key));

  return (
    <div className="panel overflow-hidden">
      <ClipPlayer exercise={exercise} />

      <div className="px-4 py-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[14px] font-medium leading-snug">{exercise.name}</h3>
          <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground">
            {labelOf(DIFFICULTY_OPTIONS, exercise.difficulty)}
          </span>
        </div>

        <p className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
          {labelOf(TYPE_OPTIONS, exercise.type)}
          {exercise.muscle ? ` · ${exercise.muscle}` : ""}
        </p>

        {equipment.length ? (
          <p className="mt-1.5 text-[11.5px] text-muted-foreground">{equipment.join(", ")}</p>
        ) : null}

        {exercise.cue ? (
          <p className="mt-2 rounded-xl bg-background/70 px-3 py-2 text-[11.5px] leading-relaxed text-muted-foreground">
            {exercise.cue}
          </p>
        ) : null}

        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            {exercise.video_source ? labelOf(SOURCE_OPTIONS, exercise.video_source) : "No clip yet"}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(exercise)}
              aria-label={`Edit ${exercise.name}`}
              className="rounded-full p-1.5 text-muted-foreground transition hover:bg-background hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(exercise)}
              aria-label={`Remove ${exercise.name}`}
              className="rounded-full p-1.5 text-muted-foreground transition hover:bg-background hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}