# Caleb Will Be A Pro

Private gym, food, and calendar site for Caleb and his nutritionist.

Hosted at [calebwillbeapro.cosa.net.au](https://calebwillbeapro.cosa.net.au).

This repository is this site only.

## What it does

- **Gym, Monday–Sunday**, built for ice hockey in Japan: explosiveness, cardio, recoverability, and strength.
- **Two rest days each week**, taken from **that week’s games**, not a standing weekday. Add games on the calendar and rest days follow. Override a week by hand if you need to.
- **Food / nutrition** with game, train, and rest targets, Japan-friendly quick adds, and a nutritionist note.
- **Built-in calendar** in **Asia/Tokyo** time.
- **One shared access word** for both of you. No public company pages.

## Run

```bash
npm install
npm run dev
```

First visit: set the shared access word. After that, both of you use that same word.

```bash
npm test
npm run build
```

## Sharing live data

The local app stores state in `data/state.json`.

Production deploys from `main` to `https://caleb-will-be-a-pro.vercel.app`. Until KV is set, the live site keeps data in this browser so you can still test.

For a live shared copy between Japan and the nutritionist, set Upstash/Vercel KV:

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

Optional: `ACCESS_WORD` to seed the word on first boot instead of setting it in the browser.
