import { EXPERIENCE, GOALS, labelOf } from "@/lib/options";

export default function BasicsCard({ basics }) {
  const goals = (basics.goals || []).map((key) => labelOf(GOALS, key)).join(" · ");
  const facts = [
    { label: "Name", value: basics.display_name || "—" },
    { label: "Age", value: basics.age ? String(basics.age) : "—" },
    { label: "Experience", value: labelOf(EXPERIENCE, basics.experience) },
    { label: "Days per week", value: basics.weekly_target ? String(basics.weekly_target) : "—" },
    {
      label: "Session length",
      value: basics.session_minutes ? `${basics.session_minutes} min` : "—",
    },
    { label: "Working toward", value: goals || "—" },
  ];

  return (
    <div className="space-y-3 rounded-2xl border border-primary/30 bg-primary/[0.06] px-4 py-4">
      <p className="eyebrow text-primary">What I filled in</p>
      {basics.summary ? (
        <p className="text-[12.5px] leading-relaxed text-foreground/85">{basics.summary}</p>
      ) : null}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground">
              {fact.label}
            </dt>
            <dd className="mt-0.5 text-[11.5px] leading-snug">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}