# CINDY Creative Platform

Static UI (`index.html`, `app.js`, `styles.css`) plus a small Node server under `server/` that persists app state.

## Local

```bash
cd server && npm install && npm start
```

Open `http://localhost:3847/index.html` (or the port printed in the terminal).

Without `DATABASE_URL`, state is stored in `server/data/state.json`.

## Supabase Postgres

1. In the Supabase SQL editor, you can run `server/schema.sql` (the migrate script also applies it automatically).
2. Set `DATABASE_URL` to your pooler URI (use the **Session** or **Transaction** pooler string from Supabase; keep SSL on).
3. One-shot copy local `state.json` into the DB:

```bash
cd server
DATABASE_URL="postgresql://..." npm run migrate:file-to-pg
```

## Render

1. Create a new **Web Service**, connect this repo.
2. Use the included `render.yaml` or set manually:
   - **Root directory:** `server`
   - **Build:** `npm install`
   - **Start:** `npm start`
3. Add environment variable **`DATABASE_URL`** (same value as Supabase). Do not commit it to git.
4. After deploy, open `https://<your-service>.onrender.com/index.html`.

The server listens on `0.0.0.0` and uses `process.env.PORT` (Render provides this).

## GitHub

```bash
git init
git add -A
git commit -m "Initial platform with Postgres-backed state"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```
