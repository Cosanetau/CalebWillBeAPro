# Caleb Will Be A Pro

Private gym, food, and calendar site for Caleb and Nix.

Hosted at [calebwillbeapro.cosa.net.au](https://calebwillbeapro.cosa.net.au).

This repository is this site only.

## What it does

- **Gym, Monday–Sunday**, a set ice-hockey session each day (agility, aerobic, recovery, strength, intervals, long bike, core). Rest only if you mark it.
- **Weigh-in every day** on Gym. That number shows on the calendar square, under the date.
- **Today** shows Game day, Rest day, or Gym day, and the food for that day. Nothing else.
- **Food** is a book you edit (chicken, rice, whatever you eat). Pick foods onto whatever day you’re cooking. The week’s shop list fills from those days. No check-in. Required kcal, protein, carbs, and fat sit at the bottom and stay until you change them. **Nix** can see calories, protein, carbs, and fat on the foods.
- **Built-in calendar** in local time. Each day has a Game tick box and a Rest tick box.
- **Logins:** Caleb and Nix each have a username and password.

## Logins

Sign in with the name, not an email.

- **Nix** — password `NixIsTheBest`
- **Caleb** — password from `CALEB_PASSWORD` on Vercel

Login is checked on the server. It does not need a working Supabase auth user.

## Run

```bash
npm install
npm run dev
```

```bash
npm test
npm run build
```

## Shared saving

1. In the Supabase SQL editor, run `supabase/schema.sql`.
2. On Vercel, set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `CALEB_PASSWORD`.
3. Redeploy.

If Supabase is missing, you can still log in. The book then saves on that server only.
