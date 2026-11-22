import { Activity } from "lucide-react";

export default function ElbowCard({ condition, side, status, pain, guidance }) {
  return (
    <section className="panel relative overflow-hidden px-5 py-4">
      <span className="absolute inset-y-0 left-0 w-[3px] bg-primary/70" aria-hidden="true" />
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-primary" />
          <p className="eyebrow">Elbow check-in</p>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-[9.5px] uppercase tracking-[0.12em] text-secondary-foreground">
          {status}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <p className="tnum font-display text-2xl leading-none">{pain}</p>
        <p className="text-[11px] text-muted-foreground">/ 10 at the last session</p>
      </div>
      <p className="mt-1.5 text-[12.5px] text-foreground/80">
        {condition} · {side}
      </p>
      <p className="mt-3 border-t border-border pt-3 text-[11.5px] leading-relaxed text-muted-foreground">
        {guidance}
      </p>
    </section>
  );
}