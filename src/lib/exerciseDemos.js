import { LIBRARY } from "./exerciseLibrary";

// One short looping clip per movement pattern, shown on the session screen.
// Keyed by the exercise's pattern so every movement in the plan has a demo.
// Each clip shows one complete repetition, from the start position through the
// fullest range of motion and back.
export const DEMO_CLIPS = {
  push: "https://media.base44.com/videos/public/6b0353326b6a55d9c1a5fcd0/9fe8a57c3_Push_demo.mp4",
  pull: "https://media.base44.com/videos/public/6b0353326b6a55d9c1a5fcd0/3bf1dd4ec_Pull_demo.mp4",
  squat: "https://media.base44.com/videos/public/6b0353326b6a55d9c1a5fcd0/cb3b88ce4_Squat_demo.mp4",
  hinge: "https://media.base44.com/videos/public/6b0353326b6a55d9c1a5fcd0/f2d074be6_Hinge_demo.mp4",
  lunge: "https://media.base44.com/videos/public/6b0353326b6a55d9c1a5fcd0/c470bf469_Lunge_demo.mp4",
  core: "https://media.base44.com/videos/public/6b0353326b6a55d9c1a5fcd0/1f415bff9_Core_demo.mp4",
  carry: "https://media.base44.com/videos/public/6b0353326b6a55d9c1a5fcd0/1d85560c7_Carry_demo.mp4",
  cardio: "https://media.base44.com/videos/public/6b0353326b6a55d9c1a5fcd0/5480c4934_Cardio_demo.mp4",
};

// Movements that look nothing like the rest of their pattern get their own clip.
export const EXERCISE_CLIPS = {
  plank: "https://media.base44.com/videos/public/6b0353326b6a55d9c1a5fcd0/a16728a92_Plank_demo.mp4",
  "band-hip-hinge":
    "https://media.base44.com/videos/public/6b0353326b6a55d9c1a5fcd0/76ca0ee79_Band_hinge_demo.mp4",
  "face-pull":
    "https://media.base44.com/videos/public/6b0353326b6a55d9c1a5fcd0/472438e13_Face_pull_demo.mp4",
  "band-pull-apart":
    "https://media.base44.com/videos/public/6b0353326b6a55d9c1a5fcd0/100fb22fb_Pull_apart_demo.mp4",
  "pallof-press":
    "https://media.base44.com/videos/public/6b0353326b6a55d9c1a5fcd0/123b27779_Pallof_press_demo.mp4",
  "step-up":
    "https://media.base44.com/videos/public/6b0353326b6a55d9c1a5fcd0/fff21a648_Step_up_demo.mp4",
  "table-pushup":
    "https://media.base44.com/videos/public/6b0353326b6a55d9c1a5fcd0/3bd1c7ef9_Table_push-up_demo.mp4",
  "band-row":
    "https://media.base44.com/videos/public/6b0353326b6a55d9c1a5fcd0/73f13f28e_Band_row_demo.mp4",
  "bird-dog":
    "https://media.base44.com/videos/public/6b0353326b6a55d9c1a5fcd0/3c90c9cdd_Bird_dog_demo.mp4",
};

export function demoFor(exercise) {
  // Planned sessions store the movement by name, so fall back to the library id.
  const id = exercise?.id || LIBRARY.find((item) => item.name === exercise?.name)?.id;
  return EXERCISE_CLIPS[id] || DEMO_CLIPS[exercise?.pattern] || null;
}