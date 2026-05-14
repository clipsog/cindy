/**
 * Shared demo users for Cindy Zheng workspace (used by CLI seed + optional boot-time sync).
 * clippertest uses ClipDemo2026! (12 chars) — matches earlier docs; re-run seed after any password change.
 */
const bcrypt = require('bcryptjs');

const BCRYPT_ROUNDS = 12;

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

module.exports = { ACCOUNTS, seedDemoAccounts };
