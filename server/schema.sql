-- One-row document store for the CINDY creative app (JSON mirrors client state).
CREATE TABLE IF NOT EXISTS cindy_app_state (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO cindy_app_state (id, payload)
VALUES (1, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Self-serve accounts (username + email + password). Roles: lead | coordinator | clipper
CREATE TABLE IF NOT EXISTS cindy_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  username TEXT NOT NULL DEFAULT '',
  display_name TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'clipper' CHECK (role IN ('lead', 'coordinator', 'clipper')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- DBs created before username existed
ALTER TABLE cindy_users ADD COLUMN IF NOT EXISTS username TEXT NOT NULL DEFAULT '';

-- Backfill username from email local-part when missing
UPDATE cindy_users u
SET username = left(regexp_replace(split_part(lower(trim(u.email)), '@', 1), '[^a-z0-9_]', '', 'g'), 32)
WHERE length(trim(u.username)) = 0 AND position('@' IN trim(u.email)) > 1;

UPDATE cindy_users u
SET username = 'user_' || left(replace(u.id::text, '-', ''), 12)
WHERE length(trim(regexp_replace(coalesce(u.username, ''), '[^a-z0-9_]', '', 'gi'))) < 3;

-- Resolve duplicate usernames (keep oldest row per lower(username))
WITH ranked AS (
  SELECT id,
    row_number() OVER (PARTITION BY lower(trim(username)) ORDER BY created_at NULLS LAST, id) AS rn
  FROM cindy_users
  WHERE length(trim(username)) > 0
)
UPDATE cindy_users c
SET username = 'user_' || left(replace(c.id::text, '-', ''), 12)
FROM ranked r
WHERE c.id = r.id AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS cindy_users_email_lower_idx ON cindy_users (lower(trim(email)));
CREATE UNIQUE INDEX IF NOT EXISTS cindy_users_username_lower_idx ON cindy_users (lower(trim(username)));

-- Optional: JWT signing secret when CINDY_LOGIN_SECRET env is unset (auto-created once per database).
CREATE TABLE IF NOT EXISTS cindy_runtime_settings (
  k TEXT PRIMARY KEY,
  v TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
