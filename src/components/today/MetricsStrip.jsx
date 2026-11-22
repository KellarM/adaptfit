export default function MetricsStrip({ items }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {items.map((item) => (
        <div key={item.label} className="panel px-3 py-4 sm:px-4">
          <p className="text-[9px] uppercase tracking-[0.13em] text-muted-foreground">{item.label}</p>
          <p className="tnum mt-2.5 font-display text-xl leading-none sm:text-2xl">
            {item.value}
            {item.unit ? (
              <span className="ml-1 font-body text-[11px] font-normal text-muted-foreground">
                {item.unit}
              </span>
            ) : null}
          </p>
          <p className="mt-2 text-[10.5px] leading-snug text-muted-foreground">{item.note}</p>
        </div>
      ))}
    </div>
  );
}