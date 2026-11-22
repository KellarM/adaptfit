import { useState } from "react";
import { analyzeConditions } from "@/lib/intake-fns";
import AnalysisCard from "@/components/onboarding/AnalysisCard";

export default function ConditionsSection({ text, onText, analysis, onAnalysis, answers, onAnswer }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const analyse = async () => {
    if (!text.trim()) return;
    setBusy(true);
    setError("");
    try {
      const result = await analyzeConditions({ data: { text: text.trim() } });
      onAnalysis(result);
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
        rows={6}
        placeholder="Write it the way you'd tell a friend. What hurts, when it started, what makes it worse, anything your doctor or physio said…"
        className="field h-auto resize-none py-3 leading-relaxed"
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={analyse}
          disabled={busy || !text.trim()}
          className="rounded-full border border-primary/60 bg-primary/15 px-4 py-2.5 text-[12px] text-primary transition hover:bg-primary/25 disabled:opacity-50"
        >
          {busy ? "Reading your description…" : analysis ? "Read it again" : "Read my description"}
        </button>
        <p className="text-[10.5px] leading-relaxed text-muted-foreground">
          {analysis
            ? "Saved with your setup. Correct anything below and read it again."
            : "I'll break it into areas, what to avoid, and anything I still need to ask."}
        </p>
      </div>

      {error ? <p className="text-[11px] text-destructive">{error}</p> : null}

      {analysis ? (
        <AnalysisCard analysis={analysis} answers={answers} onAnswer={onAnswer} />
      ) : null}
    </div>
  );
}