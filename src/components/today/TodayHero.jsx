export default function TodayHero({ eyebrow, title, meta }) {
  return (
    <header className="space-y-3">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="font-display text-[2.05rem] leading-[1.06] tracking-[-0.022em] sm:text-[2.9rem]">
        {title}
      </h1>
      <p className="text-[13px] text-muted-foreground">{meta}</p>
    </header>
  );
}