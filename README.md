# Caleb Will Be A Pro

Private gym, food, and calendar site for Caleb and Nix.

Hosted at [calebwillbeapro.cosa.net.au](https://calebwillbeapro.cosa.net.au).

This repository is this site only.

## What it does

- **Gym, Monday–Sunday**, built for ice hockey in Japan: explosiveness, cardio, recoverability, and strength.
- **Two rest days each week**, taken from **that week’s games**, not a standing weekday.
- **Food / nutrition** with game, train, and rest targets, Japan-friendly quick adds, and Nix’s notes.
- **Built-in calendar** in **Asia/Tokyo** time.
- **Supabase logins:** Caleb and Nix each have a username and password.

## Logins

- **Nix** — nutritionist. Password: `NixIsTheBest`
- **Caleb** — set `CALEB_PASSWORD` in Vercel, then open `/api/seed` once.

## Run

```bash
npm install
npm run dev
```

```bash
npm test
npm run build
```

## Supabase setup

1. In the Supabase SQL editor, run `supabase/schema.sql`.
2. On the Vercel project, set `SUPABASE_SERVICE_ROLE_KEY` (and `CALEB_PASSWORD` for Caleb).
3. Open `/api/seed` once to create the users.
4. Sign in on the site with username + password.
