import { useState } from "react";
import { Play, X } from "lucide-react";

// Collapsed by default so a long session doesn't load a dozen videos at once.
export default function ExerciseDemo({ src, name }) {
  const [open, setOpen] = useState(false);
  if (!src) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mt-2 flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[10.5px] text-muted-foreground transition hover:border-primary/50 hover:text-primary"
      >
        {open ? <X className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        {open ? "Hide the demo" : "Watch the movement"}
      </button>

      {open ? (
        <div className="mt-2 overflow-hidden rounded-xl border border-border bg-background">
          <video
            src={src}
            autoPlay
            loop
            muted
            playsInline
            aria-label={`Demonstration of ${name}`}
            className="aspect-video w-full bg-black object-contain"
          />
        </div>
      ) : null}
    </>
  );
}