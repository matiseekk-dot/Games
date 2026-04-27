// Barcode / EAN lookup pipeline.
//
// Strategy: scan EAN with BarcodeDetector → resolve EAN→product name via UPCitemdb
// trial endpoint (free, 100/day/IP, CORS-enabled, no key) → feed cleaned name into
// rawgSearch(). RAWG itself has no EAN index, hence the name-resolution hop.
//
// Cache is aggressive: a successful hit OR a confirmed 404 miss are both stored
// so we don't rehit the trial quota for the same EAN.
import { LS_EAN_CACHE } from '../constants.js';

export function eanCacheRead() { try { return JSON.parse(localStorage.getItem(LS_EAN_CACHE) || '{}'); } catch { return {}; } }
export function eanCacheWrite(c) { try { localStorage.setItem(LS_EAN_CACHE, JSON.stringify(c)); } catch {} }

// Strips console/edition noise so RAWG name search has a chance.
// "Sony PS5 God of War Ragnarok Standard Edition (EU)" → "God of War Ragnarok"
export function cleanProductName(raw) {
  if (!raw) return '';
  let s = ' ' + raw + ' ';
  // Region/edition tags inside parens
  s = s.replace(/\([^)]*?(EU|PAL|NTSC|US|UK|JP|JAPAN|REGION\s*FREE|ENG|EUR|MULTI[^)]*)[^)]*\)/gi, ' ');
  // ORDER MATTERS: longest/most-specific patterns first, so "for PS5" matches
  // before bare "PS5" gets ripped out and leaves an orphan "for".
  const noise = [
    /\bfor\s+PlayStation\s*[345]\b/gi, /\bfor\s+PS\s*[345]\b/gi,
    /\bSony\s+Interactive\s+Entertainment\b/gi, /\bInteractive\s+Entertainment\b/gi,
    /\bPlayStation\s*[345]\b/gi, /\bPS\s*[345]\b/gi, /\bSony\b/gi,
    /\bXbox(\s+(One|Series\s*[XS]|360))?\b/gi, /\bMicrosoft\b/gi,
    /\bNintendo\s+Switch\b/gi, /\bSwitch\b/gi,
    /\bStandard\s+Edition\b/gi, /\bLaunch\s+Edition\b/gi, /\bDeluxe\s+Edition\b/gi,
    /\bGold\s+Edition\b/gi, /\bSpecial\s+Edition\b/gi, /\bComplete\s+Edition\b/gi,
    /\bUltimate\s+Edition\b/gi, /\bDefinitive\s+Edition\b/gi, /\bRemastered\s+Edition\b/gi,
    /\bGame\s+Of\s+The\s+Year\s+Edition\b/gi, /\bGOTY(\s+Edition)?\b/gi,
    /\bDisc\s+Version\b/gi, /\bPhysical\s+Edition\b/gi, /\bPhysical\s+Copy\b/gi,
    /\bVideo\s+Game\b/gi,
  ];
  for (const n of noise) s = s.replace(n, ' ');
  // Punctuation cleanup: only collapse dashes/colons that have whitespace around them,
  // so in-word hyphens like "Spider-Man" survive.
  s = s.replace(/\s+[\-–—:|·,]+\s+/g, ' ').replace(/\s{2,}/g, ' ').trim();
  // Drop empty parens left behind
  s = s.replace(/\(\s*\)/g, '').trim();
  // Orphan stop-words at the start/end after publisher/console strip ("...XVI for")
  s = s.replace(/^(for|a|an)\s+/i, '').replace(/\s+(for|with)$/i, '').trim();
  return s;
}

// Returns product title string, or null if not found / call failed.
export async function eanLookup(ean) {
  const cache = eanCacheRead();
  if (Object.prototype.hasOwnProperty.call(cache, ean)) {
    return cache[ean] || null;
  }
  const ctrl = new AbortController();
  const tm = setTimeout(() => ctrl.abort(), 7000);
  try {
    const r = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(ean)}`, { signal:ctrl.signal });
    if (!r.ok) {
      // 404 = not in DB → cache the miss. 429/other = transient → don't cache.
      if (r.status === 404) { cache[ean] = ''; eanCacheWrite(cache); }
      return null;
    }
    const j = await r.json();
    const title = (j && Array.isArray(j.items) && j.items[0] && j.items[0].title) || '';
    cache[ean] = title;
    eanCacheWrite(cache);
    return title || null;
  } catch {
    // Network/abort/timeout — don't poison cache, allow retry next time
    return null;
  } finally { clearTimeout(tm); }
}
