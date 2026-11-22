import { useState } from "react";
import { analyzeConditions } from "@/lib/intake-fns";
import AnalysisCard from "@/components/onboarding/AnalysisCard";
import TextToggle from "@/components/onboarding/TextToggle";

export default function ConditionsSection({
  text,
  onText,
  analysis,
  onAnalysis,
  answers,
  onAnswer,
  onClearAnswers,
}) {
  const [busy, setBusy] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  // null means "follow the result": closed as soon as there is something read back.
  const [showText, setShowText] = useState(null);
  const open = showText === null ? !analysis : showText;

  const analyse = async () => {
    if (!text.trim()) return;
    setBusy(true);
    setError("");
    try {
      const result = await analyzeConditions({ data: { text: text.trim() } });
      onAnalysis(result);
      setShowText(false);
    } catch {
      setError("I couldn't read that just now. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  // Folds the follow-up answers into the description and reads it again, so the
  // plan is built from the full picture.
  const applyAnswers = async () => {
    const lines = Object.entries(answers)
      .filter(([, value]) => value && value.trim())
      .map(([question, value]) => `${question} ${value.trim()}`);
    if (!lines.length) return;
    const combined = [text.trim(), ...lines].filter(Boolean).join("\n");
    setApplying(true);
    setError("");
    try {
      const result = await analyzeConditions({ data: { text: combined } });
      onText(combined);
      onAnalysis(result);
      setShowText(false);
      if (onClearAnswers) onClearAnswers();
    } catch {
      setError("I couldn't update that just now. Try again in a moment.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-3">
      {analysis ? (
        <AnalysisCard
          analysis={analysis}
          answers={answers}
          onAnswer={onAnswer}
          onApply={applyAnswers}
          applying={applying}
        />
      ) : null}

      {open ? (
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
              {busy
                ? "Reading your description…"
                : analysis
                  ? "Read it again"
                  : "Read my description"}
            </button>
            <p className="text-[10.5px] leading-relaxed text-muted-foreground">
              {analysis
                ? "Saved with your setup. Correct anything here and read it again."
                : "I'll break it into areas, what to avoid, and anything I still need to ask."}
            </p>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-[11px] text-destructive">{error}</p> : null}

      {analysis ? (
        <TextToggle open={open} onToggle={() => setShowText(!open)} label="what I wrote" />
      ) : null}
    </div>
  );
}