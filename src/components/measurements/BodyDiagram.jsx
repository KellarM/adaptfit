import { Image } from "@/components/ui/image";
import { BODY_SITES } from "@/lib/metrics";
import { kgToLb } from "@/lib/units";

const FIGURE =
  "https://media.base44.com/images/public/6b0353326b6a55d9c1a5fcd0/63fc62d26_generated_image.png";

// Where the two label columns sit, as percentages of the picture.
const LEFT_EDGE = 33;
const RIGHT_EDGE = 67;

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

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {BODY_SITES.map((site) => (
          <line
            key={site.id}
            x1={site.x}
            y1={site.y}
            x2={site.side === "left" ? LEFT_EDGE : RIGHT_EDGE}
            y2={site.y}
            stroke="currentColor"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            className={active === site.id ? "text-primary" : "text-foreground/30"}
          />
        ))}
      </svg>

      {BODY_SITES.map((site) => {
        const on = active === site.id;
        return (
          <button
            key={`dot-${site.id}`}
            type="button"
            onClick={() => onSelect(site)}
            aria-label={site.label}
            style={{ left: `${site.x}%`, top: `${site.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 p-1.5"
          >
            <span
              className={`block h-2 w-2 rounded-full border transition ${
                on
                  ? "border-primary bg-primary ring-4 ring-primary/25"
                  : "border-foreground/70 bg-background/80"
              }`}
            />
          </button>
        );
      })}

      {BODY_SITES.map((site) => {
        const on = active === site.id;
        const shown = siteValue(site, values, unit);
        const onLeft = site.side === "left";
        return (
          <button
            key={`label-${site.id}`}
            type="button"
            onClick={() => onSelect(site)}
            style={
              onLeft
                ? { right: `${100 - LEFT_EDGE}%`, top: `${site.y}%` }
                : { left: `${RIGHT_EDGE}%`, top: `${site.y}%` }
            }
            className={`absolute flex -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-1 text-[9.5px] leading-none transition ${
              on
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background/90 text-foreground/80 backdrop-blur hover:border-primary/60 hover:text-foreground"
            }`}
          >
            <span>{site.label}</span>
            {shown ? (
              <span
                className={`tnum border-l pl-1.5 ${
                  on ? "border-primary-foreground/40" : "border-primary/40 text-primary"
                }`}
              >
                {shown}
              </span>
            ) : null}
          </button>
        );
      })}

      {weight ? (
        <span className="tnum absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-primary/50 bg-background/90 px-2 py-0.5 text-[9.5px] leading-none text-primary">
          Body weight {weight} lb
        </span>
      ) : null}
    </div>
  );
}