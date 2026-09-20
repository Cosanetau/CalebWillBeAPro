# Caleb Will Be A Pro

Private gym, food, and calendar site for Caleb and Nix.

Hosted at [calebwillbeapro.cosa.net.au](https://calebwillbeapro.cosa.net.au).

This repository is this site only.

## What it does

- **Gym, Monday–Sunday**, a set ice-hockey session each day (agility, aerobic, recovery, strength, intervals, long bike, core). Rest only if you mark it.
- **Weigh-in every day** on Gym. That number shows on the calendar square, under the date.
- **Today** shows Game day, Rest day, or Gym day, and the food for that day. Nothing else.
- **Cookbook** is where you add a food and each ingredient, with kcal, protein, carbs, fat, and sodium.
- **Food** is a day to drop cookbook food onto. Required kcal, protein, carbs, fat, and sodium sit at the bottom. **Nix** can see those numbers on the day.
- **Grocery** is this week’s shop list, from the ingredients you dropped onto days.
- **Built-in calendar** in local time. Each day has a Game tick box and a Rest tick box. If it’s a game, rest is off. Gym shows no session on a game day.
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
