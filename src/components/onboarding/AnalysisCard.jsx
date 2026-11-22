const TAG_LABELS = {
  grip: "Grip-heavy work",
  medial_elbow: "Inner-elbow load",
  wrist: "Wrist load",
  overhead: "Overhead pressing",
  shoulder: "Shoulder load",
  lumbar: "Lower-back load",
  knee: "Knee load",
};

const SIDE_LABEL = { left: "left side", right: "right side", both: "both sides" };

export default function AnalysisCard({ analysis, answers, onAnswer, onApply, applying }) {
  const questions = analysis.follow_up_questions || [];
  const hasAnswers = Object.values(answers || {}).some((v) => v && v.trim());

  return (
    <div className="space-y-3 rounded-2xl border border-primary/30 bg-primary/[0.06] px-4 py-4">
      <p className="eyebrow text-primary">What I understood</p>
      <p className="text-[12.5px] leading-relaxed text-foreground/85">{analysis.summary}</p>

      {analysis.areas?.length ? (
        <ul className="space-y-2">
          {analysis.areas.map((area) => (
            <li
              key={`${area.name}-${area.area}`}
              className="rounded-xl border border-border bg-background/60 px-3 py-2"
            >
              <p className="text-[11.5px]">
                {area.name}{" "}
                <span className="text-muted-foreground">
                  · {SIDE_LABEL[area.side] || area.side} · {area.status} · {area.pain_level}/10
                </span>
              </p>
              {area.note ? (
                <p className="mt-0.5 text-[10.5px] leading-snug text-muted-foreground">{area.note}</p>
              ) : null}
              {area.avoid_tags?.length ? (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {area.avoid_tags.map((tag) => (
                    <span key={tag} className="chip px-2 py-0.5 text-[10px]">
                      {TAG_LABELS[tag] || tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {analysis.flags?.length ? (
        <div>
          <p className="text-[10.5px] text-muted-foreground">Worth mentioning to your doctor</p>
          <p className="text-[11.5px] leading-relaxed text-foreground/80">
            {analysis.flags.join(" · ")}
          </p>
        </div>
      ) : null}

      {questions.length ? (
        <div className="space-y-2">
          <p className="text-[10.5px] text-muted-foreground">
            A couple of things I&rsquo;m not sure about
          </p>
          {questions.map((question) => (
            <label key={question} className="block">
              <span className="text-[11px] leading-snug">{question}</span>
              <input
                value={answers[question] || ""}
                onChange={(e) => onAnswer(question, e.target.value)}
                className="field mt-1"
              />
            </label>
          ))}
          {onApply ? (
            <button
              type="button"
              onClick={onApply}
              disabled={applying || !hasAnswers}
              className="w-full rounded-full border border-primary/60 bg-primary/15 px-4 py-2.5 text-[12px] text-primary transition hover:bg-primary/25 disabled:opacity-50"
            >
              {applying ? "Updating what I understood…" : "Update with my answers"}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}