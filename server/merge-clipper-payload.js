/**
 * When a clipper saves, keep segment bank and per-segment posted clips exactly as
 * already stored so UI read-only cannot be bypassed via devtools.
 */
function mergeStreamPostedClips(inStream, exStream) {
  if (!inStream || !exStream) return;
  const inSegs = Array.isArray(inStream.segments) ? inStream.segments : [];
  const exSegs = Array.isArray(exStream.segments) ? exStream.segments : [];
  for (let i = 0; i < inSegs.length; i++) {
    const exSeg = exSegs[i];
    if (exSeg && Array.isArray(exSeg.postedClips)) {
      inSegs[i].postedClips = JSON.parse(JSON.stringify(exSeg.postedClips));
    }
  }
}

function applyClipperWriteGuard(incoming, existing) {
  const out = JSON.parse(JSON.stringify(incoming));
  out.segmentBankData = Array.isArray(existing.segmentBankData)
    ? JSON.parse(JSON.stringify(existing.segmentBankData))
    : out.segmentBankData;

  const inArcs = Array.isArray(out.arcsData) ? out.arcsData : [];
  const exArcs = Array.isArray(existing.arcsData) ? existing.arcsData : [];
  const exMap = new Map(exArcs.map((a) => [a.id, a]));

  for (const arc of inArcs) {
    const exA = exMap.get(arc.id);
    if (!exA) continue;
    if (arc.type === 'Arc' && Array.isArray(arc.linkedStreams) && Array.isArray(exA.linkedStreams)) {
      const exByStreamId = new Map(exA.linkedStreams.map((s) => [s.id, s]));
      for (const ls of arc.linkedStreams) {
        const exS = exByStreamId.get(ls.id);
        if (exS) mergeStreamPostedClips(ls, exS);
      }
    } else {
      mergeStreamPostedClips(arc, exA);
    }
  }
  return out;
}

module.exports = { applyClipperWriteGuard };
