import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Naming a movement and the kit you own is enough for a person; it is enough
// for the model too. This fills the three fields that are annoying to answer by
// hand and easy to get consistently wrong.

const PATTERNS = ["push", "pull", "squat", "hinge", "lunge", "core", "carry", "mobility", "cardio"];

const RESULT_SCHEMA = {
  type: "object",
  properties: {
    type: { type: "string", enum: PATTERNS },
    difficulty: { type: "string", enum: ["easy", "moderate", "hard"] },
    muscle: { type: "string" },
  },
  required: ["type", "difficulty", "muscle"],
};

export const classifyMovement = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().min(2).max(120),
      equipment: z.array(z.string().max(40)).max(12).optional(),
    })
  )
  .handler(async ({ data, context }) => {
    const kit = data.equipment?.length ? data.equipment.join(", ") : "no equipment listed";

    const prompt = `You are labelling one exercise for a strength-training app. The person is new to lifting and is training around a sore elbow, so be conservative.

Movement name: "${data.name}"
Equipment they own: ${kit}

Return JSON with exactly these fields:
- type: the movement pattern, one of ${PATTERNS.join(", ")}. push = pressing away, pull = rowing or curling toward you, squat = knee-bend standing up, hinge = hips back with a flat back, lunge = single-leg stance, core = trunk control, carry = walking with weight, mobility = range-of-motion work, cardio = conditioning on a machine or on foot.
- difficulty: easy, moderate or hard, judged for someone new to strength training doing this movement with the equipment listed. Bodyweight and band versions are easy; loaded barbell and single-leg loaded work are hard.
- muscle: two to five words naming what it mainly works, in plain language ("Chest, shoulders, triceps").`;
    return context.getBase44().asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: RESULT_SCHEMA,
    });
  });