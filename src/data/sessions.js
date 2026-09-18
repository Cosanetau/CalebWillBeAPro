export const sessions = {
  "power-lower": {
    id: "power-lower",
    title: "Lower power + strength",
    short: "Explosiveness / strength",
    pillars: ["explosiveness", "strength"],
    duration: "70–85 min",
    intent:
      "Build stride force and first-step. Heavy enough to get stronger, fast enough to still look like hockey.",
    warmup: [
      "Bike or skip 5 min",
      "World’s greatest stretch, 90/90, ankle rocks",
      "Pogo jumps 2x20, A-skips, 2 ramp-up bounds",
    ],
    blocks: [
      {
        name: "Power",
        items: [
          { id: "trap-bar-jump", name: "Trap-bar or bodyweight jump squat", rx: "5×3", rest: "90s", cue: "Hard against the floor. Soft, quiet landings." },
          { id: "lateral-bound", name: "Lateral bound to skate-edge stick", rx: "3×5/side", rest: "60s", cue: "Push the ice away. Stick the outside edge." },
        ],
      },
      {
        name: "Strength",
        items: [
          { id: "squat", name: "Back squat or front squat", rx: "4×5", rest: "2–3 min", cue: "Brace, own the bottom, stand up like a stride." },
          { id: "split-squat", name: "Bulgarian split squat", rx: "3×8/leg", rest: "90s", cue: "Front heel heavy. Hip stays square." },
          { id: "hinge", name: "Romanian deadlift or Nordic curl", rx: "3×6–8", rest: "90s", cue: "Hamstrings and glutes, not a lower-back yank." },
        ],
      },
      {
        name: "Trunk",
        items: [
          { id: "pallof", name: "Pallof press", rx: "3×10/side", rest: "45s", cue: "Ribs down. Do not let the cable rotate you." },
        ],
      },
    ],
    finish: "Optional 6×10s hard bike or sled, 50s easy. Skip this if legs are cooked or a game is tomorrow.",
  },
  "upper-battle": {
    id: "upper-battle",
    title: "Upper battle strength",
    short: "Strength",
    pillars: ["strength"],
    duration: "60–75 min",
    intent: "Win board fights, stay tall in contact, and keep shoulders healthy through a Japan season.",
    warmup: [
      "Band pull-aparts, scap push-ups, dead bugs",
      "Arm swings and T-spine openers",
      "2 light sets of the first lift",
    ],
    blocks: [
      {
        name: "Main",
        items: [
          { id: "pullup", name: "Weighted or strict pull-up", rx: "4×5", rest: "2 min", cue: "Full hang, ribs down, squeeze the back." },
          { id: "press", name: "DB bench or floor press", rx: "4×6", rest: "2 min", cue: "Own the bottom. Press like a check, not a bounce." },
          { id: "row", name: "1-arm DB row", rx: "3×8/side", rest: "75s", cue: "Hip stays still. Pull the elbow to the hip pocket." },
        ],
      },
      {
        name: "Contact extras",
        items: [
          { id: "landmine", name: "Landmine or half-kneeling press", rx: "3×8/side", rest: "75s", cue: "Glute on, no rib flare." },
          { id: "carry", name: "Farmer carry", rx: "4×30–40m", rest: "60s", cue: "Tall, packed shoulders, quiet feet." },
          { id: "facepull", name: "Face pull or Y-T-W", rx: "3×12–15", rest: "45s", cue: "Rear delts and cuff, not shrugging traps." },
        ],
      },
    ],
    finish: "Grip: 2×30s towel hang or rice-bucket if the rink has nothing. Then 5 min easy bike.",
  },
  rsa: {
    id: "rsa",
    title: "Repeat-sprint engine",
    short: "Cardio / explosiveness",
    pillars: ["cardio", "explosiveness"],
    duration: "45–60 min",
    intent: "Shift after shift. Fast, recover, go again — the Japan ice-time tax.",
    warmup: [
      "10 min easy bike / row / skate",
      "Dynamic hips, 3 build-up strides",
    ],
    blocks: [
      {
        name: "Alactic power",
        items: [
          { id: "sprint", name: "10–15s hard / 50–90s easy", rx: "8–12 reps", rest: "inside the split", cue: "Full speed. If the last reps die, you started too hard or rested too little." },
          { id: "lateral", name: "Lateral shuffle + 5m sprint", rx: "6 reps", rest: "45s", cue: "Stay low, then explode forward like a breakout." },
        ],
      },
      {
        name: "Trunk + lungs",
        items: [
          { id: "deadbug", name: "Dead bug or hollow hold", rx: "3×30–40s", rest: "30s", cue: "Exhale, ribs down, quiet neck." },
        ],
      },
    ],
    finish: "5–8 min easy flush. Nasal if you can. No extra lifting.",
  },
  aerobic: {
    id: "aerobic",
    title: "Aerobic engine",
    short: "Cardio / recoverability",
    pillars: ["cardio", "recoverability"],
    duration: "45–60 min",
    intent: "Zone 2 that makes hard nights cheaper. Keep this the day before a game when you train.",
    warmup: ["Easy 5 min, then settle into a pace you could talk in short sentences."],
    blocks: [
      {
        name: "Engine",
        items: [
          { id: "z2", name: "Bike / row / easy skate Zone 2", rx: "30–40 min", rest: "—", cue: "Nasal when possible. Heart rate in a sustainable band, not a grind." },
          { id: "mobility", name: "Hip / T-spine / ankle flow", rx: "12–15 min", rest: "—", cue: "Long exhales. Open what skating closes." },
        ],
      },
    ],
    finish: "5 min lying breathing: 4s in, 6s out. Then food and sleep.",
  },
  reset: {
    id: "reset",
    title: "Recoverability reset",
    short: "Recoverability",
    pillars: ["recoverability"],
    duration: "35–50 min",
    intent: "Come back able to train. This is a session, not a couch day.",
    warmup: ["20 min easy walk or bike, conversational."],
    blocks: [
      {
        name: "Tissue and range",
        items: [
          { id: "flow", name: "90/90, couch stretch, adductor rocks, calf", rx: "12 min", rest: "—", cue: "Breathe into stiffness. Do not force end range." },
          { id: "carry-easy", name: "Easy suitcase or farmer carry", rx: "3×40m light", rest: "45s", cue: "Posture reset, not a max effort." },
          { id: "breath", name: "Box breathing or 4-6 breathing", rx: "5 min", rest: "—", cue: "Down-regulate. Jaw unclenched." },
        ],
      },
    ],
    finish: "Contrast shower if you like it. Dim lights later. Protect sleep like a lift.",
  },
  "game-activation": {
    id: "game-activation",
    title: "Game-day activation",
    short: "Game / light",
    pillars: ["explosiveness"],
    duration: "15–20 min",
    intent: "Wake the system. Do not leave it in the gym.",
    warmup: ["Skip, open hips, banded walks, 2–3 ramp sprints."],
    blocks: [
      {
        name: "Prime",
        items: [
          { id: "hops", name: "Low pogo + 2 stick jumps", rx: "2 rounds", rest: "45s", cue: "Elastic, not heavy." },
          { id: "shots", name: "Optional 8–10 easy shots or band rotations", rx: "1 round", rest: "—", cue: "Feel the stick and hips. Stop while fresh." },
        ],
      },
    ],
    finish: "Fuel, hydrate, leave. The game is the session.",
  },
  "game-rest": {
    id: "game-rest",
    title: "Game day — rest from gym",
    short: "Game rest",
    pillars: [],
    duration: "On ice",
    intent: "The game is the work. No lift. Eat, hydrate, warm up to play.",
    warmup: [],
    blocks: [],
    finish: "Post-game: protein + carbs within 60 min, then wind down.",
  },
  rest: {
    id: "rest",
    title: "Rest day",
    short: "Rest",
    pillars: ["recoverability"],
    duration: "Walk if you want",
    intent: "Taken from this week’s games, not a standing Monday or Friday off.",
    warmup: [],
    blocks: [],
    finish: "Sleep, food, light walk, mobility if it helps you feel human.",
  },
};
