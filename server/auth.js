const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const { applyClipperWriteGuard } = require('./merge-clipper-payload');

const COOKIE_NAME = 'cindy_auth';
const BCRYPT_ROUNDS = 12;
const JWT_SECRET_KEY = 'jwt_secret';

/** Env override, else row from DB after initJwtSecret(), else null (auth off). */
let jwtSecretCached = null;

async function initJwtSecret(getPgPool) {
  const env = String(process.env.CINDY_LOGIN_SECRET || '').trim();
  if (env) {
    jwtSecretCached = env;
    console.log('Auth: using CINDY_LOGIN_SECRET from environment.');
    return;
  }
  const pool = typeof getPgPool === 'function' ? getPgPool() : null;
  if (!pool) {
    jwtSecretCached = null;
    console.log('Auth: no DATABASE_URL and no CINDY_LOGIN_SECRET — sign-in disabled (local file mode).');
    return;
  }
  const { rows: existing } = await pool.query('SELECT v FROM cindy_runtime_settings WHERE k = $1 LIMIT 1', [
    JWT_SECRET_KEY,
  ]);
  if (existing.length) {
    jwtSecretCached = existing[0].v;
    console.log('Auth: JWT secret loaded from database (optional: set CINDY_LOGIN_SECRET to override).');
    return;
  }
  const gen = crypto.randomBytes(48).toString('base64url');
  await pool.query(
    `INSERT INTO cindy_runtime_settings (k, v) VALUES ($1, $2)
     ON CONFLICT (k) DO NOTHING`,
    [JWT_SECRET_KEY, gen]
  );
  const { rows } = await pool.query('SELECT v FROM cindy_runtime_settings WHERE k = $1 LIMIT 1', [JWT_SECRET_KEY]);
  jwtSecretCached = rows[0]?.v || gen;
  console.log('Auth: generated and stored JWT secret in database (no CINDY_LOGIN_SECRET env required).');
}

function getJwtSecret() {
  const env = String(process.env.CINDY_LOGIN_SECRET || '').trim();
  if (env) return env;
  if (!jwtSecretCached) {
    throw new Error('JWT secret not initialized (call initJwtSecret after DB schema is ready).');
  }
  return jwtSecretCached;
}

function isAuthEnabled() {
  if (String(process.env.CINDY_LOGIN_SECRET || '').trim()) return true;
  return Boolean(jwtSecretCached);
}

function normalizeEmail(raw) {
  return String(raw || '')
    .trim()
    .toLowerCase();
}

function parseEmailSet(envVal) {
  const set = new Set();
  String(envVal || '')
    .split(',')
    .map((s) => normalizeEmail(s))
    .filter(Boolean)
    .forEach((e) => set.add(e));
  return set;
}

/** If email is listed in env, return that role; otherwise null (keep DB role). */
function roleOverrideFromEnv(email) {
  const e = normalizeEmail(email);
  if (parseEmailSet(process.env.CINDY_LEAD_EMAILS).has(e)) return 'lead';
  if (parseEmailSet(process.env.CINDY_COORDINATOR_EMAILS).has(e)) return 'coordinator';
  return null;
}

function isValidEmail(email) {
  const e = normalizeEmail(email);
  if (e.length < 3 || e.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function signUser(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      name: user.displayName,
      email: user.email,
    },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
}

function readUserFromReq(req) {
  if (!isAuthEnabled()) {
    return { id: 'dev', email: 'local', role: 'lead', displayName: 'Dev (auth off)' };
  }
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  try {
    const p = jwt.verify(token, getJwtSecret());
    return {
      id: p.sub,
      email: p.email || '',
      role: p.role,
      displayName: p.name || p.email || 'User',
    };
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const user = readUserFromReq(req);
  if (!user) return res.status(401).json({ error: 'unauthorized' });
  req.authUser = user;
  next();
}

function mountAuth(app, { readState, writeState, getPgPool }) {
  app.use(cookieParser());

  async function requireDb(res) {
    const pool = getPgPool && getPgPool();
    if (!pool) {
      res.status(503).json({ error: 'database_required_for_accounts' });
      return null;
    }
    return pool;
  }

  app.get('/api/me', (req, res) => {
    if (!isAuthEnabled()) {
      return res.json({
        authDisabled: true,
        authHint:
          'Add DATABASE_URL (Postgres) so the app can store accounts and an auto JWT secret, or set CINDY_LOGIN_SECRET for file-only dev with JWT.',
        user: { id: 'dev', email: '', role: 'lead', displayName: 'Local workspace' },
      });
    }
    const user = readUserFromReq(req);
    return res.json({ authDisabled: false, user });
  });

  app.post('/api/register', async (req, res) => {
    if (!isAuthEnabled()) {
      return res.status(400).json({ error: 'auth_not_configured' });
    }
    const pool = await requireDb(res);
    if (!pool) return;

    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');
    const displayName = String(req.body?.displayName || '').trim().slice(0, 120) || email.split('@')[0] || 'User';

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'invalid_email' });
    }
    if (password.length < 8 || password.length > 256) {
      return res.status(400).json({ error: 'invalid_password' });
    }

    try {
      const { rows: cnt } = await pool.query('SELECT COUNT(*)::int AS c FROM cindy_users');
      const isFirst = Number(cnt[0]?.c || 0) === 0;
      let role = isFirst ? 'lead' : 'clipper';
      const envRole = roleOverrideFromEnv(email);
      if (!isFirst && envRole) role = envRole;

      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const { rows } = await pool.query(
        `INSERT INTO cindy_users (email, display_name, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, display_name, role`,
        [email, displayName, passwordHash, role]
      );
      const row = rows[0];
      const user = {
        id: row.id,
        email: row.email,
        displayName: row.display_name,
        role: row.role,
      };
      const token = signUser(user);
      const secure = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });
      return res.json({ ok: true, user });
    } catch (e) {
      if (e && e.code === '23505') {
        return res.status(409).json({ error: 'email_taken' });
      }
      console.error(e);
      return res.status(500).json({ error: 'register_failed' });
    }
  });

  app.post('/api/login', async (req, res) => {
    if (!isAuthEnabled()) {
      return res.status(400).json({ error: 'auth_not_configured' });
    }
    const pool = await requireDb(res);
    if (!pool) return;

    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');
    if (!email || !password) {
      return res.status(400).json({ error: 'missing_fields' });
    }

    try {
      const { rows } = await pool.query(
        'SELECT id, email, display_name, password_hash, role FROM cindy_users WHERE lower(trim(email)) = $1 LIMIT 1',
        [email]
      );
      const row = rows[0];
      if (!row) return res.status(401).json({ error: 'invalid_credentials' });
      const match = await bcrypt.compare(password, row.password_hash);
      if (!match) return res.status(401).json({ error: 'invalid_credentials' });

      let role = row.role;
      const envRole = roleOverrideFromEnv(row.email);
      if (envRole && envRole !== role) {
        await pool.query('UPDATE cindy_users SET role = $1 WHERE id = $2', [envRole, row.id]);
        role = envRole;
      }

      const user = {
        id: row.id,
        email: row.email,
        displayName: row.display_name,
        role,
      };
      const token = signUser(user);
      const secure = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });
      return res.json({ ok: true, user });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'login_failed' });
    }
  });

  app.post('/api/logout', (req, res) => {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    return res.json({ ok: true });
  });

  app.get('/api/state', requireAuth, async (_req, res) => {
    try {
      const payload = await readState();
      return res.json(payload);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message || 'read_error' });
    }
  });

  app.put('/api/state', requireAuth, async (req, res) => {
    try {
      const payload = req.body;
      if (!payload || typeof payload !== 'object') {
        return res.status(400).json({ error: 'Expected JSON body' });
      }
      let toWrite = payload;
      if (req.authUser.role === 'clipper') {
        const existing = await readState();
        toWrite = applyClipperWriteGuard(payload, existing && typeof existing === 'object' ? existing : {});
      }
      await writeState(toWrite);
      return res.json({ ok: true });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message || 'write_error' });
    }
  });
}

module.exports = { mountAuth, COOKIE_NAME, isAuthEnabled, initJwtSecret };
