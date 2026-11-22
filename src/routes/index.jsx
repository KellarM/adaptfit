import { createFileRoute } from "@tanstack/react-router";
import TodayHero from "@/components/today/TodayHero";
import MetricsStrip from "@/components/today/MetricsStrip";
import SessionCard from "@/components/today/SessionCard";
import ElbowCard from "@/components/today/ElbowCard";
import WeekStrip from "@/components/today/WeekStrip";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today · Back in Shape" },
      {
        name: "description",
        content: "Today's elbow-aware session, readiness and week at a glance.",
      },
    ],
  }),
  component: TodayPage,
});

// Sample content for the first render — replaced by live data next.
const SAMPLE = {
  eyebrow: "Week 3 · Foundation block",
  title: "Slow and steady, elbow first.",
  meta: "5 movements · about 35 minutes · right elbow monitored",
  metrics: [
    { label: "Elbow", value: "2", unit: "/ 10", note: "down from 4 last week" },
    { label: "This week", value: "2", unit: "/ 4", note: "sessions completed" },
    { label: "Weight", value: "84.6", unit: "kg", note: "−1.2 kg since baseline" },
  ],
  exercises: [
    { name: "Incline dumbbell press", sets: 3, reps: 8, load: "12.5 kg each", note: "Chest, shoulders, triceps" },
    { name: "Band row, palms facing in", sets: 3, reps: 10, load: "medium band", note: "Back — gentler on the elbow", swapped: true },
    { name: "Dumbbell lateral raise", sets: 3, reps: 12, load: "5 kg each", note: "Shoulders" },
    { name: "Goblet squat", sets: 3, reps: 10, load: "16 kg", note: "Legs, hips, trunk" },
    { name: "Dead bug", sets: 3, reps: 8, load: "each side", note: "Core control" },
  ],
  days: [
    { label: "Mon", short: "Push", state: "done" },
    { label: "Tue", short: "Walk", state: "done" },
    { label: "Wed", short: "Pull", state: "today" },
    { label: "Thu", short: "Rest", state: "rest" },
    { label: "Fri", short: "Legs", state: "upcoming" },
    { label: "Sat", short: "Cardio", state: "upcoming" },
    { label: "Sun", short: "Rest", state: "rest" },
  ],
};

function TodayPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[880px] px-5 pb-16 pt-8 sm:px-8 sm:pt-12 lg:pt-16">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-[11px] font-medium text-primary-foreground">
              B
            </span>
            <span className="font-display text-[15px] tracking-[-0.01em]">Back in Shape</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Sun 22 Nov</p>
        </div>

        <div className="space-y-7">
          <TodayHero eyebrow={SAMPLE.eyebrow} title={SAMPLE.title} meta={SAMPLE.meta} />
          <MetricsStrip items={SAMPLE.metrics} />
          <SessionCard
            title="Push & legs — elbow-safe"
            subtitle="Built from your kit and your elbow rules"
            exercises={SAMPLE.exercises}
            onStart={() => {}}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <ElbowCard
              condition="Medial epicondylitis"
              side="Right"
              status="Recovering"
              pain={2}
              guidance="Grip-heavy pulling stays swapped out until this sits at 0–2 for a full week. If it creeps up, the next week's load drops automatically."
            />
            <section className="panel px-5 py-4">
              <p className="eyebrow">New to this?</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/80">
                Every movement in a session comes with one plain-English cue and a starting
                weight. You finish each set when the last rep still feels controlled — never to
                failure.
              </p>
              <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                This app supports, and never replaces, advice from your doctor or physiotherapist.
              </p>
            </section>
          </div>
          <WeekStrip days={SAMPLE.days} />
        </div>
      </div>
    </div>
  );
}