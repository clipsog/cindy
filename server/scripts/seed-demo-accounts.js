/**
 * One-time (or idempotent) demo accounts for Cindy Zheng workspace.
 * Run from server/:  npm run seed:demo-accounts
 * Requires DATABASE_URL (same as production). Safe to re-run: upserts by username.
 *
 * Optional: set CINDY_SEED_DEMO_ACCOUNTS=true on the host to run the same upserts once at server startup (then remove the env).
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const { seedDemoAccounts } = require('../demo-account-seed');

async function main() {
  const conn = String(process.env.DATABASE_URL || '').trim();
  if (!conn) {
    console.error('DATABASE_URL is not set. Add it to server/.env or the environment.');
    process.exit(1);
  }
  const pool = new Pool({ connectionString: conn });
  try {
    await seedDemoAccounts(pool);
    console.log('Done. Demo users are ready (see server/demo-account-seed.js for usernames and passwords).');
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
