import { useState } from "react";
import { ExternalLink, Repeat } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { isUpload, labelOf, youtubeId, SOURCE_OPTIONS } from "@/lib/library";
import UploadedClipPlayer from "@/components/library/UploadedClipPlayer";

export default function ClipDialog({ exercise, open, onOpenChange }) {
  const [loop, setLoop] = useState(false);
  const uploaded = isUpload(exercise);
  const youtube = exercise?.video_source === "youtube" ? youtubeId(exercise.video_url) : null;
  const link = exercise?.video_url && !uploaded && !youtube ? exercise.video_url : null;

  if (!exercise) return null;

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
          {uploaded ? (
            <UploadedClipPlayer key={exercise.video_url} fileUri={exercise.video_url} />
          ) : youtube ? (
            <>
              <iframe
                key={loop ? "looped" : "once"}
                src={`https://www.youtube.com/embed/${youtube}?autoplay=1${
                  loop ? `&loop=1&playlist=${youtube}` : ""
                }`}
                title={exercise.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
              <button
                type="button"
                aria-pressed={loop}
                onClick={() => setLoop((on) => !on)}
                className={`absolute right-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] backdrop-blur transition ${
                  loop
                    ? "bg-primary text-primary-foreground"
                    : "bg-background/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Repeat className="h-2.5 w-2.5" />
                Repeat
              </button>
            </>
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