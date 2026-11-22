import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EQUIPMENT_CATEGORIES } from "@/lib/options";

const BLANK = {
  name: "",
  category: "dumbbell",
  weight_value: "",
  weight_unit: "kg",
  increment: "2.5",
  quantity: "1",
  notes: "",
};

export default function EquipmentDialog({ initial, onOpenChange, onSave, saving }) {
  const [form, setForm] = useState({ ...BLANK, ...(initial || {}) });
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const num = (v) => (v === "" || v === null || v === undefined ? undefined : Number(v));

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-normal">
            {initial ? "Edit kit" : "Add to your kit"}
          </DialogTitle>
          <DialogDescription className="text-[12px] leading-relaxed">
            Only movements your kit can do will appear in your plan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <label className="block">
            <span className="text-[10.5px] text-muted-foreground">What is it</span>
            <input
              value={form.name}
              onChange={(e) => set({ name: e.target.value })}
              placeholder="Pair of 12.5 kg dumbbells"
              className="field mt-1"
            />
          </label>

          <label className="block">
            <span className="text-[10.5px] text-muted-foreground">Type</span>
            <select
              value={form.category}
              onChange={(e) => set({ category: e.target.value })}
              className="field mt-1"
            >
              {EQUIPMENT_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-3 gap-2.5">
            <label className="block">
              <span className="text-[10.5px] text-muted-foreground">Weight</span>
              <input
                type="number"
                inputMode="decimal"
                value={form.weight_value}
                onChange={(e) => set({ weight_value: e.target.value })}
                className="field tnum mt-1"
              />
            </label>
            <label className="block">
              <span className="text-[10.5px] text-muted-foreground">Unit</span>
              <select
                value={form.weight_unit}
                onChange={(e) => set({ weight_unit: e.target.value })}
                className="field mt-1"
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[10.5px] text-muted-foreground">Jump</span>
              <input
                type="number"
                inputMode="decimal"
                value={form.increment}
                onChange={(e) => set({ increment: e.target.value })}
                className="field tnum mt-1"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-[10.5px] text-muted-foreground">How many</span>
            <input
              type="number"
              inputMode="numeric"
              value={form.quantity}
              onChange={(e) => set({ quantity: e.target.value })}
              className="field tnum mt-1"
            />
          </label>

          <label className="block">
            <span className="text-[10.5px] text-muted-foreground">Notes</span>
            <textarea
              value={form.notes || ""}
              onChange={(e) => set({ notes: e.target.value })}
              rows={2}
              className="field mt-1 h-auto resize-none py-2.5"
            />
          </label>

          <button
            type="button"
            disabled={saving || !form.name}
            onClick={() =>
              onSave({
                ...form,
                weight_value: num(form.weight_value),
                increment: num(form.increment),
                quantity: num(form.quantity) ?? 1,
              })
            }
            className="w-full rounded-full bg-primary px-5 py-3.5 text-[13.5px] font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}