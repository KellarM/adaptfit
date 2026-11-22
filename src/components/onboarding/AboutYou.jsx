import { useState } from "react";
import { analyzeBasics } from "@/lib/intake-fns";
import BasicsCard from "@/components/onboarding/BasicsCard";

export default function AboutYou({ text, onText, basics, onBasics }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const read = async () => {
    if (!text.trim()) return;
    setBusy(true);
    setError("");
    try {
      onBasics(await analyzeBasics({ data: { text: text.trim() } }));
    } catch {
      setError("I couldn't read that just now. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => onText(e.target.value)}
        rows={7}
        placeholder="Write it however it comes out: your age, what you do all day, how you've trained before, how many days a week you can give this, how long you've got each time, what you want out of it, anything else that matters."
        className="field h-auto resize-none py-3 leading-relaxed"
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={read}
          disabled={busy || !text.trim()}
          className="rounded-full border border-primary/60 bg-primary/15 px-4 py-2.5 text-[12px] text-primary transition hover:bg-primary/25 disabled:opacity-50"
        >
          {busy ? "Sorting out your details…" : basics ? "Read it again" : "Read my notes"}
        </button>
        <p className="text-[10.5px] leading-relaxed text-muted-foreground">
          {basics
            ? "These are the fields I pulled out. Change the text and read it again if I got something wrong."
            : "I'll fill in what the programme needs: age, experience, goals, days per week, session length."}
        </p>
      </div>

      {error ? <p className="text-[11px] text-destructive">{error}</p> : null}

      {basics ? <BasicsCard basics={basics} /> : null}
    </div>
  );
}