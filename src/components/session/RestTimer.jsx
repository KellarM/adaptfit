import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";

export default function RestTimer({ rest, onDone, onExtend }) {
  const [left, setLeft] = useState(0);
  const fired = useRef(false);

  useEffect(() => {
    fired.current = false;
    if (!rest) return;

    const tick = () => {
      const remaining = Math.max(0, Math.round((rest.endsAt - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0 && !fired.current) {
        fired.current = true;
        onDone();
      }
    };

    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [rest]);

  if (!rest) return null;

  const total = rest.total || 1;
  const pct = Math.min(100, Math.max(0, ((total - left) / total) * 100));

  return (
    <div className="fixed inset-x-0 bottom-[62px] z-40 px-4 lg:bottom-6 lg:left-[232px] lg:px-8">
      <div className="mx-auto flex max-w-[560px] items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-2xl">
        <div className="tnum font-display text-2xl leading-none">
          {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
        </div>
        <div className="flex-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground">Rest</p>
        </div>
        <button
          type="button"
          onClick={() => onExtend(15)}
          className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1.5 text-[11px] text-muted-foreground transition hover:text-foreground"
        >
          <Plus className="h-3 w-3" />
          15s
        </button>
        <button
          type="button"
          onClick={onDone}
          aria-label="Skip rest"
          className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}