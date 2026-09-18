# Caleb Will Be A Pro

Private gym, food, and calendar site for Caleb and Nix.

Hosted at [calebwillbeapro.cosa.net.au](https://calebwillbeapro.cosa.net.au).

This repository is this site only.

## What it does

- **Gym, Monday–Sunday**, a set ice-hockey session each day (agility, aerobic, recovery, strength, intervals, long bike, core). Rest only if you mark it.
- **Weigh-in every day** on Gym or Today. That number shows on the calendar square for that day.
- **Food** is a book you edit (chicken, rice, whatever you eat). Pick foods onto whatever day you’re cooking. The week’s shop list fills from those days. No check-in on Food.
- **Built-in calendar** in local time.
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
