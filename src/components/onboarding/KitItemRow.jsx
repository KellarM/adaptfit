import { X } from "lucide-react";
import { EQUIPMENT_CATEGORIES, labelOf } from "@/lib/options";
import { isWeighted } from "@/lib/kit";

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
              value={item.weight_value ?? ""}
              onChange={(e) => onChange({ weight_value: e.target.value })}
              placeholder="weight"
              className="tnum h-8 w-16 rounded-lg border border-input bg-background text-center text-[11.5px] outline-none focus:border-primary/60"
            />
            <select
              value={item.weight_unit || "lb"}
              onChange={(e) => onChange({ weight_unit: e.target.value })}
              className="h-8 rounded-lg border border-input bg-background px-1 text-[11px] outline-none focus:border-primary/60"
            >
              <option value="lb">lb</option>
              <option value="kg">kg</option>
            </select>
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