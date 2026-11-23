import { fmtNum, prettyDate } from "@/lib/format";
import { strengthTrend } from "@/lib/strength";

export default function StrengthTrend({ sessions = [] }) {
  const rows = strengthTrend(sessions);

  return (
    <section className="panel px-5 py-4">
      <p className="eyebrow">Strength trend</p>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Estimated best single, from the sets you actually logged.
      </p>

      {rows.length ? (
        <ul className="mt-2 divide-y divide-border">
          {rows.map((row) => (
            <li key={row.name} className="flex items-baseline gap-3 py-2.5">
              <span className="min-w-0 flex-1 text-[12.5px] leading-snug">{row.name}</span>
              <span className="tnum shrink-0 text-[12px]">
                {fmtNum(row.latest, 0)}
                <span className="ml-0.5 text-[10px] text-muted-foreground">lb</span>
              </span>
              <span
                className={`tnum w-14 shrink-0 text-right text-[11px] ${
                  row.change > 0.005
                    ? "text-primary"
                    : row.change < -0.005
                      ? "text-destructive"
                      : "text-muted-foreground"
                }`}
                title={`First logged ${prettyDate(row.firstDate)}`}
              >
                {row.change > 0.005 ? "+" : ""}
                {Math.round(row.change * 100)}%
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[12px] text-muted-foreground">
          Log the same movement twice and its trend appears here.
        </p>
      )}
    </section>
  );
}
