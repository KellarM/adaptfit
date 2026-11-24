import { useEffect, useRef, useState } from "react";
import { ClipboardPaste, FileVideo, Loader2, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SOURCE_OPTIONS, sourceForUrl } from "@/lib/library";

const isVideo = (file) => Boolean(file) && String(file.type).startsWith("video/");

// One place to get a clip into a movement: copy a video and paste it, paste a
// link, or pick a file from the device.
export default function ClipPicker({ video_source, video_url, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef(null);
  const uploadRef = useRef(null);

  const uploadFile = async (file) => {
    if (!file) return;
    if (!isVideo(file)) {
      setError("That was not a video file.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      onChange({ video_url: file_uri, video_source: "upload" });
    } catch {
      setError("That clip could not be uploaded.");
    } finally {
      setUploading(false);
    }
  };

  uploadRef.current = uploadFile;

  // A copied clip can be pasted anywhere while this form is open.
  useEffect(() => {
    const onPaste = (event) => {
      const file = Array.from(event.clipboardData?.items || [])
        .map((item) => item.getAsFile())
        .find(isVideo);
      if (!file) return;
      event.preventDefault();
      uploadRef.current?.(file);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, []);

  const takePaste = (event) => {
    const file = Array.from(event.clipboardData?.items || [])
      .map((item) => item.getAsFile())
      .find(isVideo);
    if (file) {
      event.preventDefault();
      uploadFile(file);
      return;
    }
    const text = event.clipboardData?.getData("text/plain")?.trim() || "";
    if (/^https?:\/\//i.test(text)) {
      event.preventDefault();
      onChange({ video_url: text, video_source: sourceForUrl(text) });
    }
  };

  const linked = video_source !== "upload";

  const changeLink = (value) => {
    const patch = { video_url: value };
    const detected = sourceForUrl(value);
    if (detected !== "other" && video_source !== detected) patch.video_source = detected;
    onChange(patch);
  };

  return (
    <div>
      <span className="text-[10.5px] text-muted-foreground">Clip</span>

      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {SOURCE_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange({ video_source: option.key })}
            className={`chip ${video_source === option.key ? "chip-on" : ""}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {linked ? (
        <input
          value={video_url || ""}
          onChange={(e) => changeLink(e.target.value)}
          onPaste={takePaste}
          placeholder="Paste the link to the clip"
          className="field mt-2 text-[12px]"
        />
      ) : video_url ? (
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2.5">
          <FileVideo className="h-4 w-4 shrink-0 text-primary" />
          <p className="min-w-0 flex-1 truncate text-[11.5px] text-primary">Clip attached</p>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="shrink-0 text-[11px] text-primary underline-offset-4 hover:underline"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={() => onChange({ video_url: "" })}
            aria-label="Remove clip"
            className="shrink-0 rounded-full p-1 text-primary transition hover:opacity-70"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div
          tabIndex={0}
          onPaste={takePaste}
          className="mt-2 flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-5 text-center outline-none transition focus:border-primary/60"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <ClipboardPaste className="h-4 w-4 text-muted-foreground" />
          )}
          <p className="text-[11.5px] text-muted-foreground">
            {uploading ? "Uploading the clip…" : "Click here and press ⌘V / Ctrl+V to paste a clip"}
          </p>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="mt-1 rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground transition hover:border-primary/60 hover:text-primary"
          >
            Or choose a video file
          </button>
        </div>
      )}

      <input
        ref={fileInput}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          uploadFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {error ? <p className="mt-1.5 text-[11px] text-destructive">{error}</p> : null}

      <p className="mt-1.5 text-[10.5px] text-muted-foreground">
        {linked
          ? "YouTube links play in the app. Other links open in a new tab."
          : "Uploaded clips are stored privately and play inside the app."}
      </p>
    </div>
  );
}