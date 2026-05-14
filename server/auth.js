const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { applyClipperWriteGuard } = require('./merge-clipper-payload');

const COOKIE_NAME = 'cindy_auth';

const ACCOUNTS = [
  { id: 'cindy', displayName: 'Cindy', role: 'lead', passEnv: 'CINDY_PASSWORD_CINDY' },
  { id: 'lito', displayName: 'Lito', role: 'coordinator', passEnv: 'CINDY_PASSWORD_LITO' },
  { id: 'clipper', displayName: 'Clipper', role: 'clipper', passEnv: 'CINDY_PASSWORD_CLIPPER' },
];

function timingSafeEqualStr(a, b) {
  const x = Buffer.from(String(a || ''), 'utf8');
  const y = Buffer.from(String(b || ''), 'utf8');
  if (x.length !== y.length) return false;
  return crypto.timingSafeEqual(x, y);
}

function isAuthEnabled() {
  return Boolean(String(process.env.CINDY_LOGIN_SECRET || '').trim());
}

function getJwtSecret() {
  return String(process.env.CINDY_LOGIN_SECRET || '').trim();
}

function getAccountPassword(account) {
  return String(process.env[account.passEnv] || '').trim();
}

function verifyLogin(username, password) {
  const u = String(username || '').trim().toLowerCase();
  const acc = ACCOUNTS.find((a) => a.id === u);
  if (!acc) return null;
  const expected = getAccountPassword(acc);
  if (!expected) return null;
  if (!timingSafeEqualStr(password, expected)) return null;
  return { username: acc.id, role: acc.role, displayName: acc.displayName };
}

function signUser(user) {
  return jwt.sign(
    { sub: user.username, role: user.role, name: user.displayName },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
}

function readUserFromReq(req) {
  if (!isAuthEnabled()) {
    return { username: 'dev', role: 'lead', displayName: 'Dev (auth off)' };
  }
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  try {
    const p = jwt.verify(token, getJwtSecret());
    return {
      username: p.sub,
      role: p.role,
      displayName: p.name || p.sub,
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

function mountAuth(app, { readState, writeState }) {
  app.use(cookieParser());

  app.get('/api/me', (req, res) => {
    if (!isAuthEnabled()) {
      return res.json({
        authDisabled: true,
        user: { username: 'dev', role: 'lead', displayName: 'Dev' },
      });
    }
    const user = readUserFromReq(req);
    return res.json({ authDisabled: false, user });
  });

  app.post('/api/login', (req, res) => {
    if (!isAuthEnabled()) {
      return res.status(400).json({ error: 'auth_not_configured' });
    }
    const username = req.body?.username;
    const password = req.body?.password;
    const user = verifyLogin(username, password);
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });
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

module.exports = { mountAuth, COOKIE_NAME, isAuthEnabled };
