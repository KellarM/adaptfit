import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import InjuryFields from "@/components/profile/InjuryFields";
import { useState } from "react";

export default function InjuryDialog({ initial, onOpenChange, onSave, saving }) {
  const [value, setValue] = useState(initial || { name: "", area: "elbow", side: "right", status: "active", pain_level: 4, avoid_tags: [] });

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-normal">
            {initial ? "Edit niggle" : "Add a niggle"}
          </DialogTitle>
          <DialogDescription className="text-[12px] leading-relaxed">
            Anything you flag here is kept out of your plan while it is active or recovering.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <InjuryFields value={value} onChange={setValue} />
          <button
            type="button"
            disabled={saving || !value.name}
            onClick={() => onSave({ ...value, pain_level: Number(value.pain_level) || 0 })}
            className="w-full rounded-full bg-primary px-5 py-3.5 text-[13.5px] font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}