import { LENGTH_UNITS } from "@/lib/units";

export default function UnitToggle({ unit, onChange }) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-border p-0.5">
      {LENGTH_UNITS.map((u) => (
        <button
          key={u}
          type="button"
          onClick={() => onChange(u)}
          className={`rounded-full px-2.5 py-1 text-[10.5px] transition ${
            unit === u ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {u}
        </button>
      ))}
    </div>
  );
}