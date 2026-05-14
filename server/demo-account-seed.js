/**
 * Shared demo users for Cindy Zheng workspace (used by CLI seed + optional boot-time sync).
 * clippertest uses ClipDemo2026! (12 chars) — matches earlier docs; re-run seed after any password change.
 */
const bcrypt = require('bcryptjs');

const BCRYPT_ROUNDS = 12;

/** Bump when demo passwords or account set change so hosted DBs resync on deploy. */
const DEMO_ACCOUNT_SEED_VERSION = 2;
const DEMO_SEED_VERSION_KEY = 'demo_account_seed_version';

const ACCOUNTS = [
  { username: 'cindy', email: 'cindy@cindyplatform.local', password: 'CindyZheng2026!', role: 'lead', displayName: 'Cindy' },
  { username: 'lito', email: 'lito@cindyplatform.local', password: 'LitoZheng2026!', role: 'coordinator', displayName: 'Lito' },
  {
    username: 'clippertest',
    email: 'clippertest@cindyplatform.local',
    password: 'ClipDemo2026!',
    role: 'clipper',
    displayName: 'Clip test',
  },
];

/**
 * Upsert demo accounts by username (updates password hash each time).
 * @param {import('pg').Pool} pool
 */
async function seedDemoAccounts(pool) {
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
    } else {
      await pool.query(
        `INSERT INTO cindy_users (email, username, display_name, password_hash, role)
         VALUES ($1, $2, $3, $4, $5)`,
        [email, username, displayName, hash, a.role]
      );
    }
  }
}

/**
 * When DATABASE_URL is set (unless CINDY_SEED_DEMO_ACCOUNTS=false):
 * - If DB seed version is behind DEMO_ACCOUNT_SEED_VERSION, upserts demo users (fixes missing/wrong clippertest, etc.).
 * - If CINDY_SEED_DEMO_ACCOUNTS=true, always upserts and bumps version (use to force password reset).
 */
async function maybeSyncDemoAccounts(pool) {
  if (!pool) return;
  const flag = String(process.env.CINDY_SEED_DEMO_ACCOUNTS || '').toLowerCase();
  if (flag === 'false') return;

  const force = flag === 'true';
  if (!force) {
    const { rows } = await pool.query(
      'SELECT v FROM cindy_runtime_settings WHERE k = $1 LIMIT 1',
      [DEMO_SEED_VERSION_KEY]
    );
    const dbv = Number(rows[0]?.v || 0);
    if (dbv >= DEMO_ACCOUNT_SEED_VERSION) return;
  }

  await seedDemoAccounts(pool);
  await pool.query(
    `INSERT INTO cindy_runtime_settings (k, v) VALUES ($1, $2)
     ON CONFLICT (k) DO UPDATE SET v = EXCLUDED.v, updated_at = now()`,
    [DEMO_SEED_VERSION_KEY, String(DEMO_ACCOUNT_SEED_VERSION)]
  );
  console.log(
    force
      ? 'CINDY_SEED_DEMO_ACCOUNTS=true: demo accounts (cindy, lito, clippertest) synced.'
      : `Demo accounts synced (seed version ${DEMO_ACCOUNT_SEED_VERSION}).`
  );
}

module.exports = { ACCOUNTS, DEMO_ACCOUNT_SEED_VERSION, seedDemoAccounts, maybeSyncDemoAccounts };
