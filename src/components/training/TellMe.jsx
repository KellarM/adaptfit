import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { parseTrainingEntry } from "@/lib/training-fns";
import { normaliseParsed } from "@/lib/training";

// The tell-me box. Type or dictate what you did in your own words and it comes
// back as entries you can check before they are kept. The parse never fills a
// blank in: if you did not say the number, the number is empty.
export default function TellMe({ onParsed }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const body = text.trim();
    if (body.length < 3) return;
    setBusy(true);
    try {
      const result = await parseTrainingEntry({ data: { text: body } });
      const entries = normaliseParsed(result);
      if (!entries.length) {
        toast.error("Nothing I could read as a workout. Try naming what you did and for how long.");
        return;
      }
      onParsed(entries);
      setText("");
      toast.success(
        `Added ${entries.length} ${entries.length === 1 ? "entry" : "entries"}. Check them below.`
      );
    } catch {
      toast.error("Could not read that just now. The quick add below always works.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel px-5 py-4">
      <p className="eyebrow">Tell me what you did</p>
      <p className="mt-1 text-[12px] text-muted-foreground">
        Plain words. Sets, weights, minutes, machine settings, whatever you know. I only record
        what you tell me and I never fill in a number you did not give.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder={"20 min bike, 12 km, 340 cal, avg 28 km/h\n3 sets of 8 pull-ups\n20 min on the boxing bag, 5 rounds"}
        className="mt-3 w-full resize-y rounded-xl border border-border bg-background px-3 py-2.5 text-[13px] leading-relaxed outline-none focus:border-primary/60"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-[10.5px] text-muted-foreground">
          Saved as you go. Refresh and nothing is lost.
        </p>
        <button
          type="button"
          onClick={submit}
          disabled={busy || text.trim().length < 3}
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12px] font-medium text-primary-foreground transition disabled:opacity-40"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {busy ? "Reading" : "Add to workout"}
        </button>
      </div>
    </section>
  );
}
