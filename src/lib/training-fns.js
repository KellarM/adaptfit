import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Turning "20 min bike, 12 km, 340 cal, avg 28 km/h" into numbers the app can
// add up. The one rule that matters: it records what he said and nothing else.
// A guessed calorie figure is worse than a blank, because the blank is honest
// and the guess quietly becomes history.

const ENTRY_SCHEMA = {
  type: "object",
  properties: {
    entries: {
      type: "array",
      items: {
        type: "object",
        properties: {
          kind: { type: "string", enum: ["strength", "cardio", "activity"] },
          name: { type: "string" },
          sets: {
            type: "array",
            items: {
              type: "object",
              properties: {
                reps: { type: ["number", "null"] },
                weight: { type: ["number", "null"] },
              },
              required: ["reps", "weight"],
            },
          },
          segments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                minutes: { type: ["number", "null"] },
                mode: { type: "string", enum: ["walk", "run", "other"] },
                speed_kph: { type: ["number", "null"] },
                incline: { type: ["number", "null"] },
              },
              required: ["minutes", "mode", "speed_kph", "incline"],
            },
          },
          minutes: { type: ["number", "null"] },
          metrics: {
            type: "object",
            properties: {
              distance_km: { type: ["number", "null"] },
              calories: { type: ["number", "null"] },
              avg_speed_kph: { type: ["number", "null"] },
              rounds: { type: ["number", "null"] },
            },
            required: ["distance_km", "calories", "avg_speed_kph", "rounds"],
          },
          note: { type: "string" },
        },
        required: ["kind", "name", "sets", "segments", "minutes", "metrics", "note"],
      },
    },
  },
  required: ["entries"],
};

export const parseTrainingEntry = createServerFn({ method: "POST" })
  .validator(z.object({ text: z.string().min(3).max(2000) }))
  .handler(async ({ data, context }) => {
    const prompt = `You are reading what someone did in a workout, in their own words, and turning it into entries.

They wrote:
"""
${data.text.trim()}
"""

Return JSON with one field, entries: one entry per distinct thing they did, in the order they did it.

Never invent a value. If they did not state a number, it is null. Do not estimate calories, distance, speed, time, weight or reps. Do not add warm-ups, sets or movements they did not mention. Do not round a number they gave into a different one. A blank field is correct and expected; a plausible guess is a lie.

Each entry:
- kind: "strength" for sets of a movement with weight or reps, "cardio" for anything measured in time on a machine, "activity" for anything else measured in time (boxing bag, circuits, a walk outside).
- name: what it was, in their words, capitalised normally ("Bicep curls", "Treadmill", "Boxing bag").

For strength only:
- sets: one object per set they described, with reps and weight as numbers. A drop set is one set per weight, so 20 lb, then 15 lb, then 10 lb at 20 reps each is three sets, not one. Weight is in pounds unless they said kg; if they said kg, convert to pounds and note it.
- minutes: null unless they gave a duration.
- segments: [].
- metrics: all four null.

For cardio:
- segments: one object per change in pace or setting. "5 min walk at 10 incline, 5 min run at 3 incline" is two segments. minutes is that segment's length, mode is walk or run, speed_kph is their speed in km/h if stated, incline is the number their machine showed (record it as given, do not convert).
- minutes: the total duration if they stated one.
- sets: [].
- metrics: distance_km, calories, avg_speed_kph and rounds only if they said them, otherwise null.

For activity:
- minutes: the duration if stated.
- sets: [] and segments: [].
- metrics: rounds, calories, distance_km and avg_speed_kph only if stated, otherwise null.

Every entry also carries note: one short line of anything useful they said that does not fit a field, or an empty string.`;

    return context.getBase44().asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: ENTRY_SCHEMA,
    });
  });