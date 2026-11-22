import { ChevronDown } from "lucide-react";

export default function TextToggle({ open, onToggle, label }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground transition hover:text-foreground"
    >
      <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      {open ? `Hide ${label}` : `Show ${label}`}
    </button>
  );
}