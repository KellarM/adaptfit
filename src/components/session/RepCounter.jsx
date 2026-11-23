import { useEffect, useRef, useState } from "react";
import { Hand, Minus, Pause, Play, Plus, Volume2, VolumeX, X } from "lucide-react";

// Two short tones, kept quiet: one per rep, a lower pair when the set is done.
// Audio is a nicety, never a blocker, so every failure here is swallowed.
function useTone(enabled) {
  const ctx = useRef(null);
  return (freq, ms, gain = 0.045) => {
    if (!enabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      ctx.current = ctx.current || new AudioCtx();
      const ac = ctx.current;
      const osc = ac.createOscillator();
      const vol = ac.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      vol.gain.value = gain;
      osc.connect(vol).connect(ac.destination);
      osc.start();
      osc.stop(ac.currentTime + ms / 1000);
    } catch {
      // no audio device, no problem
    }
  };
}

export default function RepCounter({ exercise, setNumber, target = 8, onFinish, onCancel }) {
  const [mode, setMode] = useState("pace"); // pace keeps time, tap counts your own
  const [reps, setReps] = useState(0);
  const [pace, setPace] = useState(3);
  const [running, setRunning] = useState(true);
  const [sound, setSound] = useState(true);
  const [done, setDone] = useState(false);
  const tone = useTone(sound);

  const beat = useRef(null);
  const reached = useRef(false);

  // One rep per pace seconds. The counter is a metronome, not a judge: it never
  // decides a rep was ugly, it just keeps you honest about the count.
  useEffect(() => {
    if (mode !== "pace" || !running || done) return;
    const id = setInterval(() => {
      setReps((n) => {
        const next = n + 1;
        if (next >= target) {
          if (!reached.current) {
            reached.current = true;
            tone(660, 220);
            setTimeout(() => tone(520, 320), 240);
            setRunning(false);
            setDone(true);
          }
          return target;
        }
        tone(880, 60);
        return next;
      });
    }, pace * 1000);
    beat.current = id;
    return () => clearInterval(id);
  }, [mode, running, pace, target, done, tone]);

  const tap = () => {
    if (done) return;
    setReps((n) => {
      const next = Math.min(target, n + 1);
      if (next >= target) {
        tone(660, 220);
        setTimeout(() => tone(520, 320), 240);
        setDone(true);
      } else {
        tone(880, 60);
      }
      return next;
    });
  };

  const reset = () => {
    reached.current = false;
    setReps(0);
    setDone(false);
    setRunning(mode === "pace");
  };

  const pct = target ? Math.min(100, (reps / target) * 100) : 0;
  const circumference = 2 * Math.PI * 46;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/97 px-4 pb-5 pt-4 backdrop-blur">
      <div className="mx-auto max-w-md">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.13em] text-muted-foreground">
              Set {setNumber} · {exercise?.name}
            </p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {mode === "pace"
                ? `One rep every ${pace}s, out loud with the count.`
                : "Tap each rep as you finish it."}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close the counter"
            className="rounded-full border border-border p-1.5 text-muted-foreground transition hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-5">
          <div className="relative h-[112px] w-[112px] shrink-0">
            <svg viewBox="0 0 104 104" className="h-full w-full -rotate-90">
              <circle cx="52" cy="52" r="46" fill="none" stroke="currentColor" strokeWidth="7" className="text-secondary" />
              <circle
                cx="52"
                cy="52"
                r="46"
                fill="none"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (pct / 100) * circumference}
                className="text-primary transition-[stroke-dashoffset] duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="tnum font-display text-[2rem] leading-none" aria-live="polite">
                {reps}
              </span>
              <span className="tnum text-[10px] text-muted-foreground">of {target}</span>
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            {mode === "tap" ? (
              <button
                type="button"
                onClick={tap}
                disabled={done}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-6 text-[13px] font-medium text-primary-foreground transition active:scale-[0.99] disabled:opacity-50"
              >
                <Hand className="h-4 w-4" /> Tap for each rep
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setRunning((r) => !r)}
                disabled={done}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-[13px] font-medium text-primary-foreground transition active:scale-[0.99] disabled:opacity-50"
              >
                {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {running ? "Hold the pace" : "Carry on"}
              </button>
            )}

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 rounded-full border border-border px-1">
                <button
                  type="button"
                  onClick={() => setPace((p) => Math.max(1, p - 1))}
                  aria-label="Faster pace"
                  className="p-1.5 text-muted-foreground transition hover:text-foreground"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="tnum w-8 text-center text-[11px]">{pace}s</span>
                <button
                  type="button"
                  onClick={() => setPace((p) => Math.min(8, p + 1))}
                  aria-label="Slower pace"
                  className="p-1.5 text-muted-foreground transition hover:text-foreground"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMode((m) => (m === "pace" ? "tap" : "pace"))}
                  className="rounded-full border border-border px-2.5 py-1.5 text-[10.5px] text-muted-foreground transition hover:text-foreground"
                >
                  {mode === "pace" ? "Count my own" : "Keep time"}
                </button>
                <button
                  type="button"
                  onClick={() => setSound((s) => !s)}
                  aria-label={sound ? "Mute the ticks" : "Unmute the ticks"}
                  className="rounded-full border border-border p-1.5 text-muted-foreground transition hover:text-foreground"
                >
                  {sound ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={reset}
            className="flex-1 rounded-xl border border-border px-3 py-2.5 text-[11.5px] text-muted-foreground transition hover:text-foreground"
          >
            Start the set again
          </button>
          <button
            type="button"
            onClick={() => onFinish(reps)}
            className="flex-1 rounded-xl bg-foreground px-3 py-2.5 text-[11.5px] font-medium text-background transition active:scale-[0.99]"
          >
            {reps > 0 ? `Log ${reps} reps` : "Log the set"}
          </button>
        </div>
      </div>
    </div>
  );
}
