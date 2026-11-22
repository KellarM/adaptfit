// Plain-language movement library. Every entry carries the stress tags that
// injuries can filter on, plus one cue written for someone new to lifting.
// equipment: categories from the Equipment entity that make it possible.
// bodyweight is always available.
export const PATTERN_LABEL = {
  push: "Push",
  pull: "Pull",
  squat: "Squat",
  hinge: "Hinge",
  lunge: "Single leg",
  core: "Core",
  carry: "Carry",
  cardio: "Conditioning",
  mobility: "Mobility",
};

export const STRESS_TAGS = [
  { key: "medial_elbow", label: "Loads the inner elbow" },
  { key: "grip", label: "Heavy gripping" },
  { key: "wrist", label: "Bends the wrist back" },
  { key: "overhead", label: "Arms overhead" },
  { key: "shoulder", label: "Shoulder stress" },
  { key: "lumbar", label: "Loads the lower back" },
  { key: "knee", label: "Loads the knees" },
];

export const LIBRARY = [
  // ---- push
  { id: "incline-db-press", name: "Incline dumbbell press", pattern: "push", equipment: ["dumbbell", "bench"], tags: [], level: 1, load: "per_hand", muscle: "Chest, shoulders, triceps", cue: "Bench at a shallow angle. Lower the dumbbells to the sides of your chest, then press up and slightly in." },
  { id: "floor-press", name: "Dumbbell floor press", pattern: "push", equipment: ["dumbbell"], tags: [], level: 1, load: "per_hand", muscle: "Chest, triceps", cue: "Lie on your back, elbows about 45° from your body. Lower until your upper arms touch the floor, then press up." },
  { id: "table-pushup", name: "Push-up on a table", pattern: "push", equipment: ["bodyweight"], tags: ["wrist"], level: 1, load: "body", muscle: "Chest, shoulders, core", cue: "Hands on a sturdy table, body in one straight line. Lower your chest to the edge, then press away." },
  { id: "band-chest-press", name: "Band chest press", pattern: "push", equipment: ["band"], tags: [], level: 1, load: "band", muscle: "Chest, shoulders", cue: "Loop the band behind your back, press both handles forward until your arms are straight, then return slowly." },
  { id: "seated-db-press", name: "Seated dumbbell shoulder press", pattern: "push", equipment: ["dumbbell", "bench"], tags: ["overhead", "shoulder"], level: 2, load: "per_hand", muscle: "Shoulders, triceps", cue: "Sit tall against the backrest. Press overhead without letting your lower back arch." },
  { id: "lateral-raise", name: "Dumbbell lateral raise", pattern: "push", equipment: ["dumbbell"], tags: [], level: 1, load: "per_hand", muscle: "Side shoulders", cue: "Light weight, arms almost straight. Lift out to shoulder height as if pouring water from a jug." },
  { id: "band-pull-apart", name: "Band pull-apart", pattern: "push", equipment: ["band"], tags: [], level: 1, load: "band", muscle: "Upper back, shoulders", cue: "Arms straight at chest height. Pull the band apart until it touches your chest, squeezing your shoulder blades." },
  { id: "wall-slide", name: "Wall slide", pattern: "push", equipment: ["bodyweight"], tags: [], level: 1, load: "body", muscle: "Shoulders, upper back", cue: "Back against a wall, arms in a goalpost shape. Slide up and down keeping your forearms on the wall." },

  // ---- pull
  { id: "band-row", name: "Band row, palms facing in", pattern: "pull", equipment: ["band"], tags: [], level: 1, load: "band", muscle: "Back, biceps", cue: "Anchor the band at chest height. Pull your elbows back past your ribs with palms facing each other." },
  { id: "chest-supported-row", name: "Chest-supported dumbbell row", pattern: "pull", equipment: ["dumbbell", "bench"], tags: ["grip"], level: 2, load: "per_hand", muscle: "Back, biceps", cue: "Lie chest-down on the bench. Row both dumbbells toward your hips, thumbs pointing forward." },
  { id: "single-arm-row", name: "Single-arm dumbbell row", pattern: "pull", equipment: ["dumbbell", "bench"], tags: ["grip"], level: 1, load: "per_hand", muscle: "Back, biceps", cue: "One hand on the bench, back flat. Pull the dumbbell to your hip and lower it slowly." },
  { id: "table-inverted-row", name: "Inverted row under a table", pattern: "pull", equipment: ["bodyweight"], tags: ["grip"], level: 2, load: "body", muscle: "Back, biceps", cue: "Hang under a sturdy table, body straight. Pull your chest up to the edge, then lower slowly." },
  { id: "band-pulldown", name: "Band lat pulldown", pattern: "pull", equipment: ["band"], tags: ["grip", "overhead"], level: 1, load: "band", muscle: "Back, biceps", cue: "Anchor the band high. Pull the handles down toward your chest, elbows driving toward your ribs." },
  { id: "face-pull", name: "Band face pull", pattern: "pull", equipment: ["band"], tags: [], level: 1, load: "band", muscle: "Upper back, shoulders", cue: "Pull the band toward your forehead with elbows high, finishing with your hands beside your ears." },
  { id: "db-curl", name: "Dumbbell curl", pattern: "pull", equipment: ["dumbbell"], tags: ["medial_elbow", "grip"], level: 2, load: "per_hand", muscle: "Biceps", cue: "Elbows pinned to your sides. Curl up without swinging, lower all the way down." },
  { id: "band-external-rotation", name: "Band external rotation", pattern: "mobility", equipment: ["band"], tags: [], level: 1, load: "band", muscle: "Rotator cuff", cue: "Elbow bent 90° at your side. Rotate your forearm outward slowly, then return." },

  // ---- squat
  { id: "goblet-squat", name: "Goblet squat", pattern: "squat", equipment: ["dumbbell", "kettlebell"], tags: [], level: 1, load: "total", muscle: "Legs, hips, trunk", cue: "Hold one weight at your chest. Sit down between your knees, then stand up tall." },
  { id: "chair-squat", name: "Chair-assisted squat", pattern: "squat", equipment: ["bodyweight"], tags: [], level: 1, load: "body", muscle: "Legs, hips", cue: "Hold a doorframe or chair back. Sit back and down, then press through your feet to stand." },
  { id: "split-squat", name: "Split squat", pattern: "squat", equipment: ["bodyweight", "dumbbell"], tags: ["knee"], level: 2, load: "body", muscle: "Legs, hips", cue: "Staggered stance, drop the back knee toward the floor, then push up through the front foot." },
  { id: "step-up", name: "Step-up", pattern: "squat", equipment: ["bench", "bodyweight"], tags: ["knee"], level: 1, load: "body", muscle: "Legs, hips", cue: "Step onto a low bench, press through the top foot, then lower slowly under control." },
  { id: "wall-sit", name: "Wall sit", pattern: "squat", equipment: ["bodyweight"], tags: [], level: 1, load: "time", muscle: "Legs", cue: "Back flat on the wall, thighs toward level. Breathe steadily and hold." },

  // ---- hinge
  { id: "band-hip-hinge", name: "Band hip hinge", pattern: "hinge", equipment: ["band"], tags: [], level: 1, load: "band", muscle: "Glutes, hamstrings", cue: "Band under your feet. Push your bottom back with a flat back, then stand up tall." },
  { id: "db-rdl", name: "Dumbbell Romanian deadlift", pattern: "hinge", equipment: ["dumbbell"], tags: ["grip", "lumbar"], level: 2, load: "per_hand", muscle: "Hamstrings, glutes", cue: "Soften the knees, slide the weights down your thighs, stop when you feel a stretch, then stand tall." },
  { id: "glute-bridge", name: "Glute bridge", pattern: "hinge", equipment: ["bodyweight"], tags: [], level: 1, load: "body", muscle: "Glutes, hamstrings", cue: "Heels close to your bottom. Press your hips up until your body is a straight line, then lower slowly." },
  { id: "hip-thrust", name: "Shoulder-elevated hip thrust", pattern: "hinge", equipment: ["bench", "bodyweight"], tags: [], level: 1, load: "body", muscle: "Glutes", cue: "Shoulders on the bench, feet flat. Drive your hips up, squeeze at the top, lower under control." },

  // ---- lunge
  { id: "reverse-lunge", name: "Reverse lunge", pattern: "lunge", equipment: ["bodyweight", "dumbbell"], tags: ["knee"], level: 1, load: "body", muscle: "Legs, glutes", cue: "Step back, lower the back knee, then push through the front foot to return." },
  { id: "lateral-lunge", name: "Lateral lunge", pattern: "lunge", equipment: ["bodyweight"], tags: ["knee"], level: 2, load: "body", muscle: "Inner thighs, glutes", cue: "Step out to the side, sit into that hip, then push back to standing." },

  // ---- core
  { id: "dead-bug", name: "Dead bug", pattern: "core", equipment: ["bodyweight"], tags: [], level: 1, load: "body", muscle: "Core control", cue: "On your back, arms up, knees over hips. Lower one arm and the opposite leg, then swap slowly." },
  { id: "bird-dog", name: "Bird dog", pattern: "core", equipment: ["bodyweight"], tags: [], level: 1, load: "body", muscle: "Core, back", cue: "On all fours, reach one arm forward and the opposite leg back. Keep your hips level." },
  { id: "side-plank", name: "Side plank, knees down", pattern: "core", equipment: ["bodyweight"], tags: [], level: 1, load: "time", muscle: "Obliques", cue: "Elbow under your shoulder, knees bent. Lift your hips and hold a straight line." },
  { id: "plank", name: "Plank", pattern: "core", equipment: ["bodyweight"], tags: ["wrist"], level: 1, load: "time", muscle: "Core", cue: "Elbows under shoulders, body in one line. Squeeze your glutes and breathe." },
  { id: "pallof-press", name: "Band Pallof press", pattern: "core", equipment: ["band"], tags: [], level: 1, load: "band", muscle: "Core", cue: "Band anchored to your side. Press both hands straight out from your chest and resist the twist." },

  // ---- carry
  { id: "farmer-carry", name: "Farmer carry", pattern: "carry", equipment: ["dumbbell", "kettlebell"], tags: ["grip", "medial_elbow"], level: 2, load: "per_hand", muscle: "Grip, core, posture", cue: "One weight in each hand, walk tall for the set distance without leaning." },

  // ---- cardio
  { id: "brisk-walk", name: "Brisk walk", pattern: "cardio", equipment: ["bodyweight"], tags: [], level: 1, load: "time", muscle: "Heart and lungs", cue: "Pace you could talk in short sentences but not sing." },
  { id: "stationary-bike", name: "Stationary bike", pattern: "cardio", equipment: ["bike"], tags: [], level: 1, load: "time", muscle: "Heart and lungs", cue: "Easy resistance, steady rhythm, relaxed shoulders." },
  { id: "rower", name: "Rowing machine", pattern: "cardio", equipment: ["rower"], tags: ["grip"], level: 2, load: "time", muscle: "Heart and lungs, back", cue: "Drive with the legs first, then swing the body back, then pull the handle to your ribs." },
  { id: "incline-treadmill", name: "Incline walk", pattern: "cardio", equipment: ["treadmill"], tags: [], level: 1, load: "time", muscle: "Heart and lungs", cue: "Gentle incline, upright posture, arms swinging freely." },

  // ---- mobility
  { id: "cat-cow", name: "Cat-cow", pattern: "mobility", equipment: ["bodyweight"], tags: [], level: 1, load: "body", muscle: "Spine", cue: "On all fours, round and arch your spine slowly with your breath." },
  { id: "open-book", name: "Open-book rotation", pattern: "mobility", equipment: ["bodyweight"], tags: [], level: 1, load: "body", muscle: "Mid back", cue: "On your side, knees bent. Open the top arm across the room and follow it with your eyes." },
  { id: "hip-flexor-stretch", name: "Half-kneeling hip stretch", pattern: "mobility", equipment: ["bodyweight"], tags: [], level: 1, load: "body", muscle: "Hips", cue: "One knee down, tuck your pelvis under and glide forward gently. Breathe." },
  { id: "wrist-extensor-iso", name: "Wrist extensor isometric", pattern: "mobility", equipment: ["bodyweight"], tags: [], level: 1, load: "body", muscle: "Forearm (rehab)", cue: "Press the back of your hand gently against your other hand and hold. Mild effort, never sharp pain." },
  { id: "shoulder-cars", name: "Shoulder circles", pattern: "mobility", equipment: ["bodyweight"], tags: [], level: 1, load: "body", muscle: "Shoulders", cue: "Slow, full circles both ways. Let the shoulder blade move with the arm." },
];