/**
 * One-shot: copy server/data/state.json into Supabase Postgres (cindy_app_state).
 * Run from repo root or server dir:
 *   DATABASE_URL="postgresql://..." npm run migrate:file-to-pg --prefix server
 *
 * Ensure schema exists (run server/schema.sql in Supabase SQL editor once).
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const stateFile = path.join(__dirname, '..', 'data', 'state.json');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is required.');
    process.exit(1);
  }
  if (!fs.existsSync(stateFile)) {
    console.error('Missing state file:', stateFile);
    process.exit(1);
  }
  const raw = fs.readFileSync(stateFile, 'utf8');
  const payload = JSON.parse(raw);
  if (!payload || typeof payload !== 'object') {
    console.error('state.json is not a JSON object.');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
    max: 2,
  });

  try {
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const ddl = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(ddl);
      console.log('OK: applied schema.sql');
    }

    await pool.query(
      `INSERT INTO cindy_app_state (id, payload, updated_at)
       VALUES (1, $1::jsonb, now())
       ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = now()`,
      [JSON.stringify(payload)]
    );
    console.log('OK: migrated state.json to cindy_app_state (id=1).');
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
