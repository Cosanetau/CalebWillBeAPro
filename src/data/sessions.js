export const WEEKDAY_SESSION_IDS = [
  "mon-strength",
  "tue-recovery",
  "wed-speed",
  "thu-power",
  "fri-conditioning",
  "sat-battle",
  "sun-mobility",
];

function work(id, name, sets, reps) {
  return { id, name, sets, reps };
}

export const sessions = {
  "mon-strength": {
    id: "mon-strength",
    title: "Strength",
    short: "Strength",
    weekday: "Monday",
    intent: "Heavy legs and hips for skating. Ice hockey strength.",
    items: [
      work("squat", "Back squat", 5, "5"),
      work("rdl", "Romanian deadlift", 4, "8"),
      work("split", "Bulgarian split squat", 3, "8 each leg"),
      work("calf", "Calf raise", 4, "12"),
      work("pallof", "Pallof press", 3, "10 each side"),
    ],
  },
  "tue-recovery": {
    id: "tue-recovery",
    title: "Recovery",
    short: "Recovery",
    weekday: "Tuesday",
    intent: "Come back able to train. Easy work, hips, breathing.",
    items: [
      work("bike", "Easy bike or walk", 1, "20 min"),
      work("hip", "90/90 hip switch", 3, "8 each side"),
      work("couch", "Couch stretch", 3, "8 breaths each side"),
      work("deadbug", "Dead bug", 3, "10"),
      work("carry", "Light farmer carry", 4, "40 m"),
    ],
  },
  "wed-speed": {
    id: "wed-speed",
    title: "Speed",
    short: "Speed",
    weekday: "Wednesday",
    intent: "First-step and stride speed. Fast, then stop.",
    items: [
      work("bound", "Broad jump", 6, "3"),
      work("lateral", "Lateral bound", 5, "5 each side"),
      work("sprint", "Hard sprint or bike sprint", 8, "10 seconds"),
      work("skip", "A-skip", 4, "20 m"),
      work("stick", "Stick jump (quiet landing)", 5, "3"),
    ],
  },
  "thu-power": {
    id: "thu-power",
    title: "Power",
    short: "Power",
    weekday: "Thursday",
    intent: "Explosiveness for the first three strides and a hard stop.",
    items: [
      work("jump-squat", "Trap-bar or jump squat", 6, "3"),
      work("medball", "Med-ball rotational throw", 5, "6 each side"),
      work("box", "Box jump", 5, "4"),
      work("split-jump", "Split squat jump", 4, "5 each leg"),
      work("sled", "Sled push or 10-second bike", 8, "10 seconds"),
    ],
  },
  "fri-conditioning": {
    id: "fri-conditioning",
    title: "Conditioning",
    short: "Conditioning",
    weekday: "Friday",
    intent: "Shift after shift. Hard, recover, go again.",
    items: [
      work("rsa", "15-second hard bike / 45 easy", 10, "15 seconds"),
      work("shuffle", "Lateral shuffle into 5 m sprint", 8, "1"),
      work("burst", "Battle rope or bike burst", 6, "20 seconds"),
      work("hollow", "Hollow hold", 4, "30 seconds"),
      work("flush", "Easy bike flush", 1, "8 min"),
    ],
  },
  "sat-battle": {
    id: "sat-battle",
    title: "Battle",
    short: "Battle",
    weekday: "Saturday",
    intent: "Upper body and contact. Win the boards, keep the shoulders.",
    items: [
      work("pullup", "Pull-up", 5, "5"),
      work("press", "DB bench or floor press", 4, "6"),
      work("row", "1-arm DB row", 4, "8 each side"),
      work("carry", "Farmer carry", 5, "30 m"),
      work("facepull", "Face pull", 3, "15"),
    ],
  },
  "sun-mobility": {
    id: "sun-mobility",
    title: "Mobility",
    short: "Mobility",
    weekday: "Sunday",
    intent: "Hips, ankles, and an easy engine so Monday is clean.",
    items: [
      work("z2", "Easy bike, row, or skate", 1, "30 min"),
      work("ankle", "Ankle rocks", 3, "12"),
      work("adductor", "Adductor rock", 3, "10 each side"),
      work("lunge", "Walking lunge", 3, "12 each leg"),
      work("tspine", "T-spine opener", 3, "8 each side"),
    ],
  },
  rest: {
    id: "rest",
    title: "Rest day",
    short: "Rest",
    weekday: "",
    intent: "Off gym. Walk, eat, sleep. The session waits until you unmark rest.",
    items: [],
  },
};

export function rxLine(item) {
  if (!item) return "";
  const sets = Number(item.sets) === 1 ? "1 set" : `${item.sets} sets`;
  return `${sets} of ${item.reps}`;
}
