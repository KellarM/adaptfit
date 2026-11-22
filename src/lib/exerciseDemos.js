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

export function demoFor(pattern) {
  return DEMO_CLIPS[pattern] || null;
}