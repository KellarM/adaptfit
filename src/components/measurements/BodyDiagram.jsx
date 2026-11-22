import { Image } from "@/components/ui/image";
import { BODY_SITES } from "@/lib/metrics";

const FIGURE =
  "https://media.base44.com/images/public/6b0353326b6a55d9c1a5fcd0/63fc62d26_generated_image.png";

export default function BodyDiagram({ active, onSelect }) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border bg-background">
      <Image
        src={FIGURE}
        alt="Front view of the body with every tape-measure site marked"
        fittingType="fill"
        className="h-full w-full"
      />
      {BODY_SITES.map((site) => {
        const on = active === site.id;
        const onLeft = site.x < 35;
        return (
          <button
            key={site.id}
            type="button"
            onClick={() => onSelect(site)}
            style={{ left: `${site.x}%`, top: `${site.y}%` }}
            className={`absolute flex -translate-y-1/2 items-center gap-1.5 ${
              onLeft ? "" : "-translate-x-1/2"
            }`}
          >
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full border transition ${
                on
                  ? "border-primary bg-primary ring-4 ring-primary/25"
                  : "border-foreground/60 bg-background/80"
              }`}
            />
            <span
              className={`whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[9.5px] leading-none transition ${
                on
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background/85 text-foreground/75 backdrop-blur hover:border-primary/60 hover:text-foreground"
              }`}
            >
              {site.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}