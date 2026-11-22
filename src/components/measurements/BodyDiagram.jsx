import { Image } from "@/components/ui/image";
import { BODY_SITES } from "@/lib/metrics";
import { kgToLb } from "@/lib/units";

const FIGURE =
  "https://media.base44.com/images/public/6b0353326b6a55d9c1a5fcd0/63fc62d26_generated_image.png";

function isFilled(value) {
  return value !== "" && value !== null && value !== undefined;
}

// What was typed for this site, in the chosen unit.
function siteValue(site, values, unit) {
  const parts = site.keys
    .filter((key) => isFilled(values?.[key]))
    .map((key) => {
      const shown = Math.round(Number(values[key]) * 10) / 10;
      if (Number.isNaN(shown)) return null;
      return site.keys.length > 1 ? `${key.includes("left") ? "L" : "R"} ${shown}` : `${shown}`;
    })
    .filter(Boolean);
  return parts.length ? `${parts.join(" · ")} ${unit}` : "";
}

export default function BodyDiagram({ active, onSelect, values = {}, unit = "in" }) {
  const weight = isFilled(values.weight_kg) ? kgToLb(values.weight_kg) : "";

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border bg-background">
      <Image
        src={FIGURE}
        alt="Front view of the body with every tape-measure site marked"
        fittingType="fill"
        className="h-full w-full"
      />

      {weight ? (
        <span className="tnum absolute left-2 top-2 rounded-full border border-primary/50 bg-background/90 px-2 py-0.5 text-[9.5px] leading-none text-primary">
          {weight} lb
        </span>
      ) : null}

      {BODY_SITES.map((site) => {
        const on = active === site.id;
        const onLeft = site.x < 35;
        const shown = siteValue(site, values, unit);
        return (
          <button
            key={site.id}
            type="button"
            onClick={() => onSelect(site)}
            style={{ left: `${site.x}%`, top: `${site.y}%` }}
            className={`absolute flex -translate-y-1/2 items-start gap-1.5 ${
              onLeft ? "" : "-translate-x-1/2"
            }`}
          >
            <span
              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full border transition ${
                on
                  ? "border-primary bg-primary ring-4 ring-primary/25"
                  : "border-foreground/60 bg-background/80"
              }`}
            />
            <span className="flex flex-col items-start gap-0.5">
              <span
                className={`whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[9.5px] leading-none transition ${
                  on
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background/85 text-foreground/75 backdrop-blur hover:border-primary/60 hover:text-foreground"
                }`}
              >
                {site.label}
              </span>
              {shown ? (
                <span className="tnum whitespace-nowrap rounded-full border border-primary/40 bg-background/90 px-1.5 py-0.5 text-[9px] leading-none text-primary">
                  {shown}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}