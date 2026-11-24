import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const AVOID_TAGS = ["grip", "medial_elbow", "wrist", "overhead", "shoulder", "lumbar", "knee"];

const RESULT_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    areas: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          area: {
            type: "string",
            enum: [
              "elbow",
              "shoulder",
              "wrist",
              "lower_back",
              "knee",
              "hip",
              "ankle",
              "neck",
              "other",
            ],
          },
          side: { type: "string", enum: ["left", "right", "both"] },
          status: { type: "string", enum: ["active", "recovering", "resolved"] },
          pain_level: { type: "number" },
          avoid_tags: { type: "array", items: { type: "string", enum: AVOID_TAGS } },
          note: { type: "string" },
        },
        required: ["name", "area", "side", "status", "pain_level", "avoid_tags", "note"],
      },
    },
    flags: { type: "array", items: { type: "string" } },
    follow_up_questions: { type: "array", items: { type: "string" } },
  },
  required: ["summary", "areas", "flags", "follow_up_questions"],
};

export const analyzeConditions = createServerFn({ method: "POST" })
  .validator(z.object({ text: z.string().min(3).max(4000) }))
  .handler(async ({ data, context }) => {
    const prompt = `You are a careful strength coach reading, in the client's own words, what is going on with their body. You are not a doctor and never diagnose.

The client wrote:
"""
${data.text}
"""

Return JSON with exactly these fields:
- summary: two or three short sentences, plain everyday language, restating what you understood. No jargon, no diagnosis.
- areas: one entry per body problem the client mentions. name is their own words or a common name (for example "Medial epicondylitis"). area must be one of the allowed enum values. side is left, right or both (use "both" when they do not say). status is active if it is flaring now, recovering if it is improving, resolved if it is healed. pain_level is 0 to 10 as they describe it (estimate conservatively from their wording, 0 if they mention no pain). avoid_tags is the movement stress that must stay out of their programme, chosen only from: ${AVOID_TAGS.join(", ")}. note is one short line of useful context.
- flags: short phrases for anything a doctor should hear about (chest pain, dizziness, numbness or tingling, recent surgery, pregnancy, a fall or accident). Empty array if none.
- follow_up_questions: at most three short questions, only about things that genuinely change the programme and are missing from what they wrote (which side, how long, what makes it worse, current pain level). Empty array if nothing important is missing. Never ask for information they already gave.`;

    return context.getBase44().asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: RESULT_SCHEMA,
    });
  });

const GOAL_KEYS = ["strength", "muscle", "mobility", "fat_loss", "conditioning", "pain_free"];

const BASICS_SCHEMA = {
  type: "object",
  properties: {
    display_name: { type: "string" },
    age: { type: "number" },
    experience: { type: "string", enum: ["starting", "returning", "intermediate"] },
    goals: { type: "array", items: { type: "string", enum: GOAL_KEYS } },
    weekly_target: { type: "number" },
    session_minutes: { type: "number" },
    summary: { type: "string" },
  },
  required: [
    "display_name",
    "age",
    "experience",
    "goals",
    "weekly_target",
    "session_minutes",
    "summary",
  ],
};

export const analyzeBasics = createServerFn({ method: "POST" })
  .validator(z.object({ text: z.string().min(3).max(4000) }))
  .handler(async ({ data, context }) => {
    const prompt = `You are a careful strength coach reading the client's own introduction and filling in the fields their programme needs. Never invent a fact the client did not give: when something is missing, use the stated default.

The client wrote:
"""
${data.text}
"""

Return JSON with exactly these fields:
- display_name: the first name they give. Empty string if they give none.
- age: their age in whole years as a number. Use 0 if they do not say.
- experience: "starting" if they are new to strength training or have barely trained, "returning" if they are coming back after a long break or injury, "intermediate" if they are comfortable and consistent with weights.
- goals: one or more of ${GOAL_KEYS.join(", ")}. strength = get stronger, muscle = build muscle, mobility = move without pain or move better, fat_loss = lose weight, conditioning = more stamina or cardio, pain_free = protect the elbow or another sore joint. Infer from what they say; use ["strength"] if they mention nothing.
- weekly_target: how many days a week they can realistically train, a whole number from 2 to 6. Use 3 if they do not say.
- session_minutes: how many minutes they have per session, a whole number from 15 to 90. Use 35 if they do not say.
- summary: two short sentences in plain everyday language saying what you understood about them. No jargon, no advice, no diagnosis.`;
    return context.getBase44().asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: BASICS_SCHEMA,
    });
  });

const KIT_CATEGORIES = [
  "dumbbell",
  "barbell",
  "plates",
  "bench",
  "band",
  "kettlebell",
  "cable",
  "pull_up_bar",
  "bike",
  "rower",
  "treadmill",
  "medicine_ball",
  "other",
];

const KIT_SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          category: { type: "string", enum: KIT_CATEGORIES },
          weight_value: { type: "number" },
          weight_unit: { type: "string", enum: ["lb"] },
          increment: { type: "number" },
          quantity: { type: "number" },
          notes: { type: "string" },
        },
        required: [
          "name",
          "category",
          "weight_value",
          "weight_unit",
          "increment",
          "quantity",
          "notes",
        ],
      },
    },
  },
  required: ["items"],
};

export const analyzeKit = createServerFn({ method: "POST" })
  .validator(
    z.object({
      text: z.string().max(2000).optional(),
      file_uri: z.string().optional(),
    })
  )
  .handler(async ({ data, context }) => {
    const prompt = `You are listing the home gym equipment a client actually owns. You get their own description and sometimes a photo of the equipment.

The client wrote:
"""
${data.text?.trim() || "(no description given — use the photo)"}
"""

Return JSON with exactly one field, items: one entry per distinct piece of equipment they own. Include only what they describe or what is clearly visible in the photo. Never add equipment they did not mention and that is not in the photo.

Each item:
- name: what it is, in the client's own words plus the size when given (for example "Adjustable dumbbells", "25 lb kettlebell", "Flat bench", "Light resistance band").
- category: one of ${KIT_CATEGORIES.join(", ")}.
- weight_value: the heaviest or working weight as a number, always in pounds. Convert any kilogram figure to pounds (1 kg = 2.2 lb). Use 0 when the item has no meaningful weight (bench, band, bike, rower, an empty bar).
- weight_unit: always "lb".
- increment: the smallest available jump for that item, in pounds (dumbbells 5, barbell and plates 2.5, kettlebell 5, machine 5). Use 2.5 when unsure.
- quantity: how many they have — 2 for a pair of dumbbells, otherwise 1.
- notes: one short line with anything that matters, or an empty string.`;
    return context.getBase44().asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      file_urls: data.file_uri ? [data.file_uri] : undefined,
      response_json_schema: KIT_SCHEMA,
    });
  });