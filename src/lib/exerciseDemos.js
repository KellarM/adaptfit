// One short looping clip per movement pattern, shown on the session screen.
// Keyed by the exercise's pattern so every movement in the plan has a demo.
export const DEMO_CLIPS = {
  push: "https://media.base44.com/videos/public/6b0353326b6a55d9c1a5fcd0/a64bf7aa9_Push_demo.mp4",
  pull: "https://media.base44.com/videos/public/6b0353326b6a55d9c1a5fcd0/294a8458a_Pull_demo.mp4",
  squat: "https://media.base44.com/videos/public/6b0353326b6a55d9c1a5fcd0/df7de62b5_Squat_demo.mp4",
  lunge: "https://media.base44.com/videos/public/6b0353326b6a55d9c1a5fcd0/e5aeb7b02_Lunge_demo.mp4",
  carry: "https://media.base44.com/videos/public/6b0353326b6a55d9c1a5fcd0/1d85560c7_Carry_demo.mp4",
  cardio: "https://media.base44.com/videos/public/6b0353326b6a55d9c1a5fcd0/5480c4934_Cardio_demo.mp4",
};

export function demoFor(pattern) {
  return DEMO_CLIPS[pattern] || null;
}