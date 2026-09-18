export const WEEKDAY_SESSION_IDS = [
  "mon-agility",
  "tue-aerobic",
  "wed-recovery",
  "thu-strength",
  "fri-intervals",
  "sat-aerobic",
  "sun-recovery",
];

function item(id, name, rx, cue, extra = {}) {
  return { id, name, rx, cue, ...extra };
}

function section(name, note, items) {
  return { name, note: note || "", items };
}

export function rxLine(entry) {
  return entry?.rx || "";
}

export function sessionItems(session) {
  if (session?.items) return session.items;
  return (session?.sections || []).flatMap((block) => block.items || []);
}

export const sessions = {
  "mon-agility": {
    id: "mon-agility",
    title: "Agility, explosiveness and ankle strength",
    short: "Agility",
    weekday: "Monday",
    intent: "Acceleration, stopping, first-step power, and ankles that hold an edge.",
    sections: [
      section("Warm-up — 15 minutes", "", [
        item("wu-bike", "Easy bike", "5 minutes", "Cycle gently to warm your legs."),
        item("wu-squat", "Bodyweight squats", "2 × 10", "Sit your hips down between your feet and stand."),
        item("wu-lunge", "Walking lunges", "2 × 8 each leg", "Step forward, lower your rear knee and drive into the next step."),
        item("wu-ankle", "Ankle rocks", "2 × 10 each side", "Move your knee over your toes while keeping your heel down."),
        item("wu-shuffle", "Lateral shuffles", "2 × 10 metres each direction", "Stay low and move sideways without crossing your feet."),
      ]),
      section("Agility", "Rest 60–90 seconds between repetitions. Perform every drill while fresh.", [
        item("accel", "Acceleration and deceleration", "4 × 10 metres", "Accelerate for about seven metres, then lower your hips and stop under control before the line."),
        item("shuttle", "5-10-5 shuttle", "4 repetitions", "Sprint five metres to one side, ten metres across, then five metres back through the centre."),
        item("shuffle-sprint", "Lateral shuffle into sprint", "4 each direction", "Shuffle sideways for five metres, plant your outside foot and accelerate forward."),
        item("crossover", "Crossover starts", "4 each side", "Cross one leg over the other and accelerate diagonally as quickly as possible."),
      ]),
      section("Explosiveness", "Rest 90–120 seconds between sets.", [
        item("box", "Box jumps", "4 × 3", "Jump onto a secure box, land softly and step down."),
        item("bounds", "Lateral bounds", "3 × 5 each side", "Jump sideways from one leg and land under control on the opposite leg."),
        item("medball", "Medicine-ball rotational throws", "4 × 5 each side", "Rotate through your hips and throw the ball powerfully into a wall."),
        item("sled", "Sled pushes", "6 × 15–20 metres", "Drive the sled forward using powerful, short steps."),
      ]),
      section("Ankle block", "", [
        item("sl-calf", "Single-leg calf raises", "3 × 10 each leg", "Rise onto your toes, pause for two seconds and lower slowly."),
        item("tib", "Tibialis raises", "3 × 15", "Keep your heels down and lift your toes toward your shins."),
        item("balance", "Single-leg balance", "3 × 30 seconds each leg", "Balance barefoot while keeping a slight bend in your knee."),
      ]),
      section("Finish", "", [
        item("fin-bike", "Easy bike", "5 minutes", ""),
        item("sauna", "Sauna", "10–15 minutes", ""),
      ]),
    ],
  },
  "tue-aerobic": {
    id: "tue-aerobic",
    title: "Aerobic endurance and fat-loss conditioning",
    short: "Bike",
    weekday: "Tuesday",
    intent: "Long easy cycling. Build the engine that recovers between shifts.",
    sections: [
      section("Cycling — 70–90 minutes", "", [
        item("wu", "Warm-up", "10 minutes", "Start with low resistance and increase it gradually."),
        item("steady", "Steady cycling", "50–70 minutes", "About 4/10 effort. You should still be able to speak in sentences."),
        item("cd", "Cooldown", "10 minutes", "Gradually reduce your pace and resistance."),
      ]),
      section("Mobility — 10–15 minutes", "", [
        item("hip", "Hip-flexor stretch", "2 × 30 seconds each side", "Kneel, squeeze the rear glute and move your hips forward."),
        item("adductor", "Adductor stretch", "2 × 30 seconds", "Use a wide stance and gently shift your hips."),
        item("calf", "Calf stretch", "2 × 30 seconds each side", "Keep your rear heel pressed toward the floor."),
        item("tspine", "Thoracic rotations", "2 × 8 each side", "Keep your hips stable while rotating your upper back."),
      ]),
      section("Finish", "", [
        item("sauna", "Sauna", "10–15 minutes", ""),
        item("water", "Water and electrolytes", "afterward", ""),
      ]),
    ],
  },
  "wed-recovery": {
    id: "wed-recovery",
    title: "Active recovery and ankle control",
    short: "Recovery",
    weekday: "Wednesday",
    intent: "This session should make you feel better, not exhausted.",
    sections: [
      section("Easy cardio", "", [
        item("bike", "Very easy bike", "25–35 minutes", "Light resistance at about 2–3/10 effort."),
      ]),
      section("Ankle-strength circuit — 3 rounds", "Rest 30–45 seconds between exercises.", [
        item("inversion", "Band inversion", "15 each ankle", "Turn your foot inward against the band without moving your knee."),
        item("eversion", "Band eversion", "15 each ankle", "Turn your foot outward against the band without rotating your leg."),
        item("bent-calf", "Bent-knee calf raises", "15", "Keep a slight bend in the knees while raising and lowering your heels."),
        item("rocks", "Ankle rocks", "10 each side", "Move your knee over your toes without lifting your heel."),
        item("balance", "Single-leg balance", "30 seconds each leg", "Balance barefoot and keep your foot controlled."),
      ]),
      section("Mobility circuit — 3 rounds", "", [
        item("rock-back", "Adductor rock-backs", "10 each side", "Extend one leg sideways and move your hips backward."),
        item("hip", "Hip-flexor stretch", "30 seconds each side", ""),
        item("ham", "Hamstring stretch", "30 seconds each side", ""),
        item("tspine", "Thoracic rotations", "8 each side", ""),
        item("child", "Child’s-pose breathing", "5 slow breaths", ""),
      ]),
      section("Finish", "", [
        item("sauna", "Sauna", "10–15 minutes", ""),
      ]),
    ],
  },
  "thu-strength": {
    id: "thu-strength",
    title: "Full-body strength and heavy ankle work",
    short: "Strength",
    weekday: "Thursday",
    intent: "Heavy legs, upper body, and ankles. Keep about two good reps in reserve.",
    sections: [
      section("Warm-up — 15 minutes", "Complete 2–3 light warm-up sets before your first heavy exercise.", [
        item("wu-bike", "Easy bike", "8 minutes", ""),
        item("wu-squat", "Bodyweight squats", "2 × 10", ""),
        item("wu-bridge", "Glute bridges", "2 × 12", ""),
      ]),
      section("Main strength", "Rest 2–3 minutes between sets.", [
        item("hack", "Hack squat or leg press", "4 × 6", "Lower under control and push through your whole foot.", { load: true }),
        item("thrust", "Hip thrust", "4 × 6–8", "Drive your hips upward and squeeze your glutes without arching your back.", { load: true }),
        item("bench", "Dumbbell bench press", "4 × 6–8", "Lower the dumbbells beside your chest and press upward.", { load: true }),
        item("row", "Chest-supported row", "4 × 6–8", "Keep your chest against the pad and pull toward your ribs.", { load: true }),
      ]),
      section("Supporting strength", "Rest 60–90 seconds between sets.", [
        item("lunge", "Reverse lunges", "3 × 8 each leg", "Step backward, lower your rear knee and push through your front foot.", { load: true }),
        item("pulldown", "Lat pulldown", "3 × 8–10", "Pull the bar toward your upper chest without leaning far backward.", { load: true }),
        item("curl", "Seated hamstring curl", "3 × 10", "Bend your knees to pull your heels underneath you.", { load: true }),
        item("adductor", "Adductor machine", "3 × 10–12", "Bring your knees together against resistance.", { load: true }),
        item("face", "Face pulls", "3 × 12–15", "Pull the rope toward your face while squeezing your shoulder blades."),
        item("pallof", "Pallof press", "3 × 10 each side", "Press the cable forward without allowing your torso to rotate."),
      ]),
      section("Heavy ankle work", "", [
        item("stand-calf", "Standing calf raises", "4 × 8–12", "Rise powerfully, pause and lower for three seconds.", { load: true }),
        item("seat-calf", "Seated calf raises", "3 × 12–15", "Keep your knees bent and move through your full comfortable range.", { load: true }),
        item("tib", "Tibialis raises", "3 × 15–20", "Lift your toes toward your shins and lower slowly."),
      ]),
      section("Finish", "", [
        item("fin-bike", "Easy bike", "5 minutes", ""),
        item("sauna", "Sauna", "10–15 minutes", ""),
      ]),
    ],
  },
  "fri-intervals": {
    id: "fri-intervals",
    title: "Agility and hockey-style intervals",
    short: "Intervals",
    weekday: "Friday",
    intent: "Stop, start, and repeat. Shift work on the bike after the agility.",
    sections: [
      section("Warm-up — 15 minutes", "", [
        item("wu-bike", "Easy cycling", "6 minutes", ""),
        item("wu-ankle", "Ankle rocks", "2 × 10 each side", ""),
        item("wu-squat", "Bodyweight squats", "2 × 10", ""),
        item("wu-shuffle", "Lateral shuffles", "2 × 10 metres each direction", ""),
        item("wu-accel", "Progressive accelerations", "3 × 10 metres", ""),
      ]),
      section("Agility", "Rest 60–90 seconds between repetitions.", [
        item("decel", "Controlled deceleration", "4 × 10 metres", "Accelerate, lower your hips and stop without your knees collapsing inward."),
        item("hops", "Two-foot line hops", "3 × 15 seconds", "Make quick, low hops sideways over a line."),
        item("crossover", "Lateral shuffle into crossover", "4 each direction", "Shuffle sideways, crossover and accelerate diagonally."),
        item("reaction", "Reaction cone drill", "6 × 10–15 seconds", "Move toward the cone indicated by a partner, timer or random phone cue."),
        item("skater", "Skater bounds", "3 × 5 each side", "Jump laterally, land on one leg and stabilise before the next repetition."),
      ]),
      section("Bike intervals — 8 rounds", "", [
        item("hard", "Hard cycling", "30 seconds", "About 8–9/10 effort."),
        item("easy", "Very easy cycling", "90 seconds", "Keep moving while your breathing comes back."),
      ]),
      section("Cooldown", "", [
        item("cd-bike", "Easy cycling", "10–15 minutes", ""),
        item("stretch", "Gentle lower-body stretching", "10 minutes", ""),
      ]),
      section("Finish", "", [
        item("sauna", "Sauna", "8–12 minutes", ""),
        item("water", "Water and electrolytes", "afterward", ""),
      ]),
    ],
  },
  "sat-aerobic": {
    id: "sat-aerobic",
    title: "Long aerobic conditioning",
    short: "Long bike",
    weekday: "Saturday",
    intent: "Don’t turn this into intervals. This is the aerobic system that recovers between shifts.",
    sections: [
      section("Cycling — 80–105 minutes", "", [
        item("wu", "Warm-up", "10 minutes", ""),
        item("steady", "Steady cycling", "60–85 minutes", "Stay around 4/10 effort."),
        item("cd", "Cooldown", "10 minutes", ""),
      ]),
      section("Optional upper-body maintenance", "Rest 60 seconds between sets.", [
        item("chest", "Machine chest press", "2 × 12", "Push the handles forward and return slowly.", { load: true }),
        item("row", "Seated cable row", "2 × 12", "Pull toward your stomach while keeping your chest upright.", { load: true }),
        item("face", "Face pulls", "2 × 15", "Pull toward your face and squeeze your upper back."),
      ]),
      section("Finish", "", [
        item("sauna", "Sauna", "10–15 minutes", ""),
        item("water", "Water and electrolytes", "afterward", ""),
      ]),
    ],
  },
  "sun-recovery": {
    id: "sun-recovery",
    title: "Recovery, core and ankle stability",
    short: "Core",
    weekday: "Sunday",
    intent: "Easy work, a stable trunk, and ankles that stay quiet on an edge.",
    sections: [
      section("Easy cardio", "", [
        item("cardio", "Very easy bike or relaxed walk", "20–30 minutes", "Keep the effort around 2–3/10."),
      ]),
      section("Core circuit — 3 rounds", "Rest 30 seconds between exercises and 90 seconds between rounds.", [
        item("deadbug", "Dead bugs", "8 each side", "Extend opposite limbs while keeping your lower back stable."),
        item("side", "Side plank", "20–30 seconds each side", "Keep a straight line through your body."),
        item("pallof", "Pallof press", "10 each side", "Resist the cable pulling you into rotation."),
        item("bridge", "Glute bridges", "15", "Lift your hips by squeezing your glutes."),
        item("copenhagen", "Short-lever Copenhagen plank", "15–20 seconds each side", "Support your upper knee on a bench and lift your hips."),
      ]),
      section("Ankle stability", "", [
        item("heel-toe", "Heel-to-toe walking", "3 × 15 metres", "Walk slowly, placing the heel directly in front of the opposite toes."),
        item("balance", "Single-leg balance", "3 × 45 seconds each leg", ""),
        item("circles", "Ankle circles", "2 × 10 each direction per ankle", ""),
        item("rocks", "Ankle rocks", "3 × 10 each side", ""),
        item("tib", "Tibialis raises", "2 × 20", ""),
      ]),
      section("Mobility — 20 minutes", "", [
        item("hip", "Hip-flexor stretch", "2 × 30 seconds each side", ""),
        item("adductor", "Adductor rock-backs", "2 × 10 each side", ""),
        item("calf", "Calf stretch", "2 × 30 seconds each side", ""),
        item("tspine", "Thoracic rotations", "2 × 8 each side", ""),
        item("child", "Child’s-pose breathing", "5 slow breaths", ""),
      ]),
      section("Finish", "", [
        item("sauna", "Sauna", "15–20 minutes maximum", ""),
      ]),
    ],
  },
  rest: {
    id: "rest",
    title: "Rest day",
    short: "Rest",
    weekday: "",
    intent: "Off gym. Walk, eat, sleep. The session waits until you unmark rest.",
    sections: [],
  },
};
