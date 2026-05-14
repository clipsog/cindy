-- One-row document store for the CINDY creative app (JSON mirrors client state).
CREATE TABLE IF NOT EXISTS cindy_app_state (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO cindy_app_state (id, payload)
VALUES (1, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Self-serve accounts (email + password). Roles: lead | coordinator | clipper
CREATE TABLE IF NOT EXISTS cindy_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'clipper' CHECK (role IN ('lead', 'coordinator', 'clipper')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS cindy_users_email_lower_idx ON cindy_users (lower(trim(email)));

-- Optional: JWT signing secret when CINDY_LOGIN_SECRET env is unset (auto-created once per database).
CREATE TABLE IF NOT EXISTS cindy_runtime_settings (
  k TEXT PRIMARY KEY,
  v TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
