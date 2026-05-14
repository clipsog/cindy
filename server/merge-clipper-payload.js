/**
 * Clippers are view-only: PUT /api/state must not persist any client-side edits
 * to shared workspace data (prevents tampering via devtools or a modified client).
 */
function applyClipperWriteGuard(_incoming, existing) {
  if (!existing || typeof existing !== 'object') {
    return {};
  }
  return JSON.parse(JSON.stringify(existing));
}

module.exports = { applyClipperWriteGuard };
