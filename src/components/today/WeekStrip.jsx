const STATE_CLASS = {
  done: "border-primary/25 bg-primary/10 text-primary",
  today: "border-primary bg-primary text-primary-foreground",
  upcoming: "border-border bg-card text-foreground",
  rest: "border-dashed border-border bg-transparent text-muted-foreground",
};

export default function WeekStrip({ days }) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-baseline justify-between">
        <p className="eyebrow">This week</p>
        <p className="text-[10.5px] text-muted-foreground">Tap a day in Plan to open it</p>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => (
          <div
            key={day.label}
            className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2.5 ${
              STATE_CLASS[day.state] || STATE_CLASS.upcoming
            }`}
          >
            <span className="text-[9px] uppercase tracking-[0.1em] opacity-70">{day.label}</span>
            <span className="tnum text-[11.5px] font-medium">{day.short}</span>
          </div>
        ))}
      </div>
    </section>
  );
}