require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs/promises');
const path = require('path');
const express = require('express');
const cors = require('cors');

const PORT = Number(process.env.PORT, 10) || 3847;
const rootDir = path.join(__dirname, '..');
const dataDir = path.join(__dirname, 'data');
const stateFile = path.join(dataDir, 'state.json');
const keepAliveEnabled = String(process.env.KEEP_ALIVE_ENABLED || 'true').toLowerCase() !== 'false';
const keepAliveIntervalMs = Math.max(60_000, Number(process.env.KEEP_ALIVE_INTERVAL_MS || 8 * 60 * 1000));
const keepAliveUrl = String(process.env.KEEP_ALIVE_URL || process.env.RENDER_EXTERNAL_URL || '').trim();

const usePostgres = Boolean(String(process.env.DATABASE_URL || '').trim());

let pgPool = null;
function getPgPool() {
  if (!usePostgres) return null;
  if (!pgPool) {
    const { Pool } = require('pg');
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
      max: parseInt(process.env.PG_POOL_MAX || '8', 10) || 8,
    });
    pgPool.on('error', (err) => {
      console.error('Postgres pool error:', err);
    });
  }
  return pgPool;
}

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

async function readStateFile() {
  try {
    const raw = await fs.readFile(stateFile, 'utf8');
    const data = JSON.parse(raw);
    return typeof data === 'object' && data !== null ? data : {};
  } catch {
    return {};
  }
}

async function writeStateFile(payload) {
  await ensureDataDir();
  await fs.writeFile(stateFile, JSON.stringify(payload, null, 2), 'utf8');
}

async function readStatePostgres() {
  const pool = getPgPool();
  if (!pool) return {};
  const { rows } = await pool.query('SELECT payload FROM cindy_app_state WHERE id = 1 LIMIT 1');
  if (!rows.length) return {};
  const p = rows[0].payload;
  if (p && typeof p === 'object') return p;
  if (typeof p === 'string') {
    try {
      return JSON.parse(p);
    } catch {
      return {};
    }
  }
  return {};
}

async function writeStatePostgres(payload) {
  const pool = getPgPool();
  if (!pool) throw new Error('Postgres not configured');
  await pool.query(
    `INSERT INTO cindy_app_state (id, payload, updated_at)
     VALUES (1, $1::jsonb, now())
     ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = now()`,
    [JSON.stringify(payload)]
  );
}

async function readState() {
  if (usePostgres) return readStatePostgres();
  return readStateFile();
}

async function writeState(payload) {
  if (usePostgres) return writeStatePostgres(payload);
  return writeStateFile(payload);
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    storage: usePostgres ? 'postgres' : 'file',
    path: usePostgres ? null : stateFile,
  });
});

app.get('/api/state', async (_req, res) => {
  try {
    const payload = await readState();
    return res.json(payload);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'read_error' });
  }
});

app.put('/api/state', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Expected JSON body' });
    }
    await writeState(payload);
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'write_error' });
  }
});

app.use(express.static(rootDir));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Cindy platform: http://localhost:${PORT}/index.html`);
  console.log(usePostgres ? 'Storage: Supabase Postgres (DATABASE_URL)' : `Storage: file (${stateFile})`);
  if (keepAliveEnabled && keepAliveUrl) {
    const pingUrl = `${keepAliveUrl.replace(/\/$/, '')}/api/health`;
    console.log(`Keep-alive ping enabled: ${pingUrl} every ${Math.round(keepAliveIntervalMs / 1000)}s`);
    const runPing = async () => {
      try {
        await fetch(pingUrl, { method: 'GET', headers: { 'user-agent': 'cindy-keepalive' } });
      } catch (e) {
        console.warn('Keep-alive ping failed:', e?.message || e);
      }
    };
    void runPing();
    setInterval(() => {
      void runPing();
    }, keepAliveIntervalMs);
  } else {
    console.log('Keep-alive ping disabled (set KEEP_ALIVE_URL to enable).');
  }
});
