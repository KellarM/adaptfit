import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { analyzeKit } from "@/lib/intake-fns";
import { mergeItems } from "@/lib/kit";
import KitItemRow from "@/components/onboarding/KitItemRow";
import TextToggle from "@/components/onboarding/TextToggle";

export default function StepEquipment({ text, onText, items, onItems }) {
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState("");
  const [showText, setShowText] = useState(!items.length);
  const fileRef = useRef(null);

  const attach = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      setPhoto({ file_uri, name: file.name });
    } catch {
      setError("That photo didn't upload. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const read = async () => {
    if (!text.trim() && !photo?.file_uri) return;
    setBusy(true);
    setError("");
    try {
      const result = await analyzeKit({
        data: { text: text.trim(), file_uri: photo?.file_uri },
      });
      onItems(mergeItems(items, result.items || []));
      setShowText(false);
    } catch {
      setError("I couldn't read that just now. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      {items.length ? (
        <div className="space-y-2">
          <p className="text-[10.5px] text-muted-foreground">
            {items.length} item{items.length === 1 ? "" : "s"} found. Remove anything that
            isn&rsquo;t yours, or fix a weight.
          </p>
          {items.map((item, index) => (
            <KitItemRow
              key={`${item.name}-${index}`}
              item={item}
              onChange={(patch) =>
                onItems(items.map((x, i) => (i === index ? { ...x, ...patch } : x)))
              }
              onRemove={() => onItems(items.filter((_, i) => i !== index))}
            />
          ))}
        </div>
      ) : null}

      {showText ? (
        <div className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => onText(e.target.value)}
            rows={5}
            placeholder="Describe everything you train with: dumbbells from 5 to 40 lb, a flat bench, one light band, a cheap rower. Leave out anything you don't actually have."
            className="field h-auto resize-none py-3 leading-relaxed"
          />

          <div className="flex flex-wrap items-center gap-2">
            <input ref={fileRef} type="file" accept="image/*" onChange={attach} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground transition hover:text-foreground disabled:opacity-50"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              {uploading ? "Uploading…" : photo ? "Replace photo" : "Add a photo"}
            </button>

            {photo ? (
              <span className="flex items-center gap-1 text-[10.5px] text-muted-foreground">
                {photo.name}
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  aria-label="Remove photo"
                  className="transition hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ) : null}

            <button
              type="button"
              onClick={read}
              disabled={busy || uploading || (!text.trim() && !photo)}
              className="rounded-full border border-primary/60 bg-primary/15 px-4 py-2.5 text-[12px] text-primary transition hover:bg-primary/25 disabled:opacity-50"
            >
              {busy ? "Listing your kit…" : items.length ? "Read it again" : "Read my kit"}
            </button>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-[11px] text-destructive">{error}</p> : null}

      {items.length ? (
        <TextToggle
          open={showText}
          onToggle={() => setShowText((open) => !open)}
          label="what I wrote"
        />
      ) : null}
    </div>
  );
}