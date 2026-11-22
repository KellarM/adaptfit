import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getEquipment } from "@/lib/api";
import { fmtNum } from "@/lib/format";
import { EQUIPMENT_CATEGORIES, labelOf } from "@/lib/options";
import EquipmentDialog from "@/components/equipment/EquipmentDialog";

export const Route = createFileRoute("/_authed/equipment")({
  head: () => ({ meta: [{ title: "Your kit · Back in Shape" }] }),
  component: EquipmentPage,
});

function EquipmentPage() {
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => setItems(await getEquipment());

  useEffect(() => {
    load();
  }, []);

  if (!items) {
    return <p className="py-24 text-center text-[13px] text-muted-foreground">Loading your kit…</p>;
  }

  const save = async (payload) => {
    setSaving(true);
    try {
      if (editing?.id) await base44.entities.Equipment.update(editing.id, payload);
      else await base44.entities.Equipment.create(payload);
      await load();
      setOpen(false);
      setEditing(null);
      toast.success("Kit updated");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    await base44.entities.Equipment.delete(item.id);
    await load();
    toast.success("Removed");
  };

  const grouped = EQUIPMENT_CATEGORIES.map((c) => ({
    ...c,
    items: items.filter((i) => i.category === c.key),
  })).filter((g) => g.items.length);

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="eyebrow">Your kit</p>
        <h1 className="font-display text-[2rem] leading-[1.08] tracking-[-0.02em] sm:text-[2.5rem]">
          What you train with at home.
        </h1>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          Your plan only uses what is on this list. Bodyweight movements are always available.
        </p>
      </header>

      <button
        type="button"
        onClick={() => {
          setEditing(null);
          setOpen(true);
        }}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-[13.5px] font-medium text-primary-foreground transition hover:opacity-90"
      >
        <Plus className="h-4 w-4" />
        Add equipment
      </button>

      {grouped.length ? (
        <div className="space-y-4">
          {grouped.map((group) => (
            <section key={group.key} className="panel overflow-hidden">
              <p className="border-b border-border px-4 py-2.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {group.label}
              </p>
              <ul className="divide-y divide-border">
                {group.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(item);
                        setOpen(true);
                      }}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="block truncate text-[13px]">{item.name}</span>
                      <span className="tnum block text-[10.5px] text-muted-foreground">
                        {item.weight_value
                          ? `${fmtNum(item.weight_value)} ${item.weight_unit || "kg"}`
                          : labelOf(EQUIPMENT_CATEGORIES, item.category)}
                        {item.quantity ? ` · qty ${item.quantity}` : ""}
                        {item.increment ? ` · ${fmtNum(item.increment)} jumps` : ""}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(item)}
                      aria-label={`Remove ${item.name}`}
                      className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:border-destructive/60 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-border px-5 py-8 text-center text-[12.5px] text-muted-foreground">
          Nothing added yet. Start with dumbbells and a band — that covers most of a home plan.
        </p>
      )}

      {open ? (
        <EquipmentDialog
          initial={editing}
          onOpenChange={(v) => {
            if (!v) {
              setOpen(false);
              setEditing(null);
            }
          }}
          onSave={save}
          saving={saving}
        />
      ) : null}
    </div>
  );
}