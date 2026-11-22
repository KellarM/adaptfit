import { X } from "lucide-react";
import { EQUIPMENT_CATEGORIES, labelOf } from "@/lib/options";
import { isWeighted } from "@/lib/kit";
import { weightToLb } from "@/lib/units";

export default function KitItemRow({ item, onChange, onRemove }) {
  return (
    <div className="rounded-xl border border-border px-3 py-2.5">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px]">{item.name}</p>
          <p className="text-[10px] text-muted-foreground">
            {labelOf(EQUIPMENT_CATEGORIES, item.category)}
            {item.notes ? ` · ${item.notes}` : ""}
          </p>
        </div>

        {isWeighted(item.category) ? (
          <div className="flex shrink-0 items-center gap-1.5">
            <input
              type="number"
              inputMode="decimal"
              value={weightToLb(item.weight_value, item.weight_unit)}
              onChange={(e) => onChange({ weight_value: e.target.value, weight_unit: "lb" })}
              placeholder="weight"
              className="tnum h-8 w-16 rounded-lg border border-input bg-background text-center text-[11.5px] outline-none focus:border-primary/60"
            />
            <span className="text-[10px] text-muted-foreground">lb</span>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${item.name}`}
          className="shrink-0 text-muted-foreground transition hover:text-destructive"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}