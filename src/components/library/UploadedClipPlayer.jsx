import { useEffect, useRef, useState } from "react";
import { Loader2, Repeat } from "lucide-react";
import { getClipSource } from "@/lib/clipSource";

export default function UploadedClipPlayer({ fileUri }) {
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [speed, setSpeed] = useState(1);
  const [loop, setLoop] = useState(false);
  const videoRef = useRef(null);
  useEffect(() => {
    let active = true;
    getClipSource(fileUri)
      .then((url) => { if (active) setSrc(url); })
      .catch(() => { if (active) setError("That clip could not be loaded."); });
    return () => { active = false; };
  }, [fileUri]);

  return (
    <>
      {src && !error ? <video
        ref={videoRef} src={src} controls autoPlay playsInline preload="auto" loop={loop}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onPlaying={() => setLoading(false)}
        onError={() => setError("That clip could not be played.")}
        onLoadedMetadata={() => { videoRef.current.playbackRate = speed; }}
        className="h-full w-full object-contain"
      /> : null}
      {loading && !error ? <div role="status" className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-[11.5px] text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />Loading clip…
      </div> : null}
      {error ? <p role="alert" className="absolute inset-0 grid place-items-center text-[12px] text-destructive">{error}</p> : null}
      {src && !error ? <div className="absolute right-2 top-2 flex gap-1">
        <button
          type="button" aria-pressed={loop} aria-label="Repeat this clip"
          onClick={() => setLoop((on) => !on)}
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] backdrop-blur transition ${loop ? "bg-primary text-primary-foreground" : "bg-background/70 text-muted-foreground hover:text-foreground"}`}
        >
          <Repeat className="h-2.5 w-2.5" />Repeat
        </button>
        {[1, 1.5, 2].map((rate) => <button
          key={rate} type="button" aria-pressed={speed === rate}
          onClick={() => { setSpeed(rate); if (videoRef.current) videoRef.current.playbackRate = rate; }}
          className={`tnum rounded-full px-2 py-0.5 text-[10px] backdrop-blur transition ${speed === rate ? "bg-primary text-primary-foreground" : "bg-background/70 text-muted-foreground hover:text-foreground"}`}
        >{rate}×</button>)}
      </div> : null}
    </>
  );
}