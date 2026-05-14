/**
 * One-time (or idempotent) demo accounts for Cindy Zheng workspace.
 * Run from server/:  npm run seed:demo-accounts
 * Requires DATABASE_URL (same as production). Safe to re-run: upserts by username.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const BCRYPT_ROUNDS = 12;

const ACCOUNTS = [
  { username: 'cindy', email: 'cindy@cindyplatform.local', password: 'CindyZheng2026!', role: 'lead', displayName: 'Cindy' },
  { username: 'lito', email: 'lito@cindyplatform.local', password: 'LitoZheng2026!', role: 'coordinator', displayName: 'Lito' },
  { username: 'clippertest', email: 'clippertest@cindyplatform.local', password: 'ClipTest2026!', role: 'clipper', displayName: 'Clip test' },
];

async function main() {
  const conn = String(process.env.DATABASE_URL || '').trim();
  if (!conn) {
    console.error('DATABASE_URL is not set. Add it to server/.env or the environment.');
    process.exit(1);
  }
  const pool = new Pool({ connectionString: conn });
  try {
    for (const a of ACCOUNTS) {
      const username = String(a.username).trim().toLowerCase();
      const email = String(a.email).trim().toLowerCase();
      const hash = await bcrypt.hash(a.password, BCRYPT_ROUNDS);
      const displayName = String(a.displayName || username).trim().slice(0, 120) || username;

      const { rows: existing } = await pool.query(
        'SELECT id FROM cindy_users WHERE lower(trim(username)) = $1 LIMIT 1',
        [username]
      );
      if (existing.length) {
        await pool.query(
          `UPDATE cindy_users
           SET email = $2, display_name = $3, password_hash = $4, role = $5
           WHERE id = $1`,
          [existing[0].id, email, displayName, hash, a.role]
        );
        console.log('Updated:', username);
      } else {
        await pool.query(
          `INSERT INTO cindy_users (email, username, display_name, password_hash, role)
           VALUES ($1, $2, $3, $4, $5)`,
          [email, username, displayName, hash, a.role]
        );
        console.log('Inserted:', username);
      }
    }
    console.log('Done. You can sign in with username + password (see ACCOUNTS in this script).');
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
