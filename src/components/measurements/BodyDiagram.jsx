import { Image } from "@/components/ui/image";
import { BODY_SITES } from "@/lib/metrics";

const FIGURE =
  "https://media.base44.com/images/public/6b0353326b6a55d9c1a5fcd0/65c606d41_generated_image.png";

export default function BodyDiagram({ active, onSelect }) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-background">
      <Image
        src={FIGURE}
        alt="Front view of the body with every tape-measure site marked"
        fittingType="fit"
        className="h-full w-full"
      />
      {BODY_SITES.map((site) => (
        <button
          key={site.id}
          type="button"
          onClick={() => onSelect(site)}
          style={{ left: `${site.x}%`, top: `${site.y}%` }}
          className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[9.5px] leading-none transition ${
            active === site.id
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background/85 text-foreground/75 backdrop-blur hover:border-primary/60 hover:text-foreground"
          }`}
        >
          {site.label}
        </button>
      ))}
    </div>
  );
}