import { useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { isUpload, labelOf, youtubeId, SOURCE_OPTIONS } from "@/lib/library";
import { warmClip } from "@/lib/clipSource";

const SPEEDS = [1, 1.5, 2];

export default function ClipDialog({ exercise, open, onOpenChange }) {
  const [src, setSrc] = useState(null);
  const [speed, setSpeed] = useState(1);
  const [error, setError] = useState("");
  const videoRef = useRef(null);

  const uploaded = isUpload(exercise);
  const youtube = exercise?.video_source === "youtube" ? youtubeId(exercise.video_url) : null;
  const link = exercise?.video_url && !uploaded && !youtube ? exercise.video_url : null;

  useEffect(() => {
    if (!open || !uploaded) return;
    let alive = true;
    setSrc(null);
    setError("");
    setSpeed(1);
    warmClip(exercise.video_url)
      .then((url) => alive && setSrc(url))
      .catch(() => alive && setError("That clip could not be loaded."));
    return () => {
      alive = false;
    };
  }, [open, uploaded, exercise?.video_url]);

  if (!exercise) return null;

  const changeSpeed = (rate) => {
    setSpeed(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-3 p-4 sm:p-5">
        <div className="pr-7">
          <DialogTitle className="font-display text-[1.25rem] leading-tight">
            {exercise.name}
          </DialogTitle>
          <p className="mt-1 text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
            {exercise.video_source
              ? labelOf(SOURCE_OPTIONS, exercise.video_source)
              : "No clip yet"}
            {exercise.muscle ? ` · ${exercise.muscle}` : ""}
          </p>
        </div>

        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
          {uploaded && src ? (
            <>
              <video
                ref={videoRef}
                src={src}
                controls
                autoPlay
                playsInline
                onLoadedMetadata={() => {
                  if (videoRef.current) videoRef.current.playbackRate = speed;
                }}
                className="h-full w-full object-contain"
              />
              <div className="absolute right-2 top-2 flex gap-1">
                {SPEEDS.map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => changeSpeed(rate)}
                    className={`tnum rounded-full px-2 py-0.5 text-[10px] backdrop-blur transition ${
                      speed === rate
                        ? "bg-primary text-primary-foreground"
                        : "bg-background/70 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {rate}×
                  </button>
                ))}
              </div>
            </>
          ) : uploaded && error ? (
            <p className="grid h-full place-items-center text-[12px] text-destructive">{error}</p>
          ) : uploaded ? (
            <p className="flex h-full items-center justify-center gap-2 text-[11.5px] text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading clip…
            </p>
          ) : youtube ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtube}?autoplay=1`}
              title={exercise.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          ) : link ? (
            <div className="grid h-full place-items-center">
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-[11.5px] text-muted-foreground transition hover:border-primary/60 hover:text-primary"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open this clip
              </a>
            </div>
          ) : (
            <p className="grid h-full place-items-center text-[11.5px] text-muted-foreground">
              No clip on this movement yet.
            </p>
          )}
        </div>

        {exercise.cue ? (
          <p className="rounded-xl bg-secondary px-3.5 py-2.5 text-[11.5px] leading-relaxed text-muted-foreground">
            {exercise.cue}
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}