import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";

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
  .middleware([requireUser])
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