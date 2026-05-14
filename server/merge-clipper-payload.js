function normClipUrl(u) {
  return String(u || '').trim().toLowerCase();
}

/**
 * Clippers may only append new posted clips on existing standalone segment rows (matched by id).
 * All other fields stay exactly as already stored.
 */
function mergeClipperStandaloneClipPosts(out, incoming) {
  const incSegs = Array.isArray(incoming?.segmentBankData) ? incoming.segmentBankData : [];
  const outSegs = Array.isArray(out.segmentBankData) ? out.segmentBankData : [];
  const outById = new Map(outSegs.map((s) => [String(s?.id || ''), s]));

  for (const row of incSegs) {
    const id = String(row?.id || '');
    if (!id || !outById.has(id)) continue;
    const target = outById.get(id);
    const existing = Array.isArray(target.postedClips) ? [...target.postedClips] : [];
    const seen = new Set(existing.map((c) => normClipUrl(c?.url)).filter(Boolean));
    const incomingClips = Array.isArray(row.postedClips) ? row.postedClips : [];
    for (const c of incomingClips) {
      const url = String(c?.url || '').trim();
      const lu = normClipUrl(url);
      if (!lu || seen.has(lu)) continue;
      if (!/^https?:\/\//i.test(url)) continue;
      seen.add(lu);
      existing.push({
        title: String(c?.title || '').trim().slice(0, 200),
        url: url.slice(0, 2000),
        tags: Array.isArray(c?.tags) ? c.tags : [],
        people: Array.isArray(c?.people) ? c.people : [],
        submittedAt: new Date().toISOString(),
      });
    }
    target.postedClips = existing;
  }
}

/**
 * Clipper PUT: keep entire stored workspace except append-only standalone segment posted clips.
 */
function applyClipperWriteGuard(incoming, existing) {
  if (!existing || typeof existing !== 'object') {
    return {};
  }
  const out = JSON.parse(JSON.stringify(existing));
  mergeClipperStandaloneClipPosts(out, incoming);
  return out;
}

module.exports = { applyClipperWriteGuard };
