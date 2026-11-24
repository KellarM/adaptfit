import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2, Play } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isUpload, youtubeId } from "@/lib/library";

// Uploaded clips live in private storage, so the playable link is created when
// the clip is needed. Links to other sites open in their own tab.
// One link per clip per visit: a second look skips the round trip.
const signedCache = new Map();

export default function ClipPlayer({ exercise }) {
  const [open, setOpen] = useState(false);
  const [src, setSrc] = useState(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [speed, setSpeed] = useState(1);
  const videoRef = useRef(null);
  const boxRef = useRef(null);

  const youtube = exercise.video_source === "youtube" ? youtubeId(exercise.video_url) : null;
  const uploaded = isUpload(exercise);
  const hasClip = Boolean(exercise.video_url);

  const resolveSrc = useCallback(async () => {
    const cached = signedCache.get(exercise.video_url);
    if (cached) {
      setSrc(cached);
      return cached;
    }
    const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
      file_uri: exercise.video_url,
      expires_in: 3600,
    });
    signedCache.set(exercise.video_url, signed_url);
    setSrc(signed_url);
    return signed_url;
  }, [exercise.video_url]);

  // An uploaded clip keeps its index at the end of the file, so the browser can
  // show no frame until nearly all of it has arrived. Pulling it in while the
  // card is on screen is what makes the play button start instantly.
  useEffect(() => {
    if (!uploaded || src || !boxRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          resolveSrc().catch(() => {});
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(boxRef.current);
    return () => observer.disconnect();
  }, [uploaded, src, resolveSrc]);

  const changeSpeed = (rate) => {
    setSpeed(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
  };

  const start = async () => {
    if (uploaded) {
      setError("");
      if (src) {
        setOpen(true);
        return;
      }
      setBusy(true);
      try {
        await resolveSrc();
        setOpen(true);
      } catch {
        setError("That clip could not be loaded.");
      } finally {
        setBusy(false);
      }
      return;
    }
    if (youtube) {
      setOpen(true);
      return;
    }
    if (hasClip) window.open(exercise.video_url, "_blank", "noopener");
  };

  const label = !hasClip
    ? "No clip yet"
    : uploaded || youtube
      ? "Play clip"
      : "Open clip";

  return (
    <div ref={boxRef} className="relative aspect-video w-full bg-background">
      {uploaded && src ? (
        <div className="relative h-full w-full">
          <video
            ref={videoRef}
            src={src}
            controls={open}
            autoPlay={open}
            playsInline
            preload="auto"
            onLoadedMetadata={() => {
              if (videoRef.current) videoRef.current.playbackRate = speed;
            }}
            onCanPlay={() => setReady(true)}
            className="h-full w-full bg-black object-contain"
          />
          {!open ? (
            <button
              type="button"
              onClick={start}
              className="group absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/40 transition"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full border border-border text-muted-foreground transition group-hover:border-primary/60 group-hover:text-primary">
                {ready ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </span>
              <span className="text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
                {ready ? label : "Loading clip"}
              </span>
            </button>
          ) : (
            <div className="absolute right-2 top-2 flex gap-1">
              {[1, 1.5, 2].map((rate) => (
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
          )}
          {error ? (
            <span className="absolute bottom-2 left-2 text-[10.5px] text-destructive">{error}</span>
          ) : null}
        </div>
      ) : open && youtube ? (
        <iframe
          src={`https://www.youtube.com/embed/${youtube}`}
          title={exercise.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={start}
          disabled={!hasClip || busy}
          className="group flex h-full w-full flex-col items-center justify-center gap-2 transition disabled:cursor-default"
        >
          <span className="grid h-11 w-11 place-items-center rounded-full border border-border text-muted-foreground transition group-hover:border-primary/60 group-hover:text-primary">
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : hasClip && !uploaded && !youtube ? (
              <ExternalLink className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </span>
          <span className="text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </span>
          {error ? <span className="text-[10.5px] text-destructive">{error}</span> : null}
        </button>
      )}
    </div>
  );
}