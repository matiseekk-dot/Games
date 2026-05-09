// v1.16.1 — Parser for Xbox library exports via TrueAchievements (paste flow).
//
// TrueAchievements (truachievements.com) is the de-facto Xbox library tracker —
// users link their Gamertag, TA scrapes the public profile, and exposes a Games
// page with built-in CSV export. Same model as PSN-Profiles for PSN. No Microsoft
// API access, no OAuth flow, no Partner Center — just public data shared by user.
//
// User flow:
//   1. Open trueachievements.com, log in (or create account, link Gamertag, ~5 min)
//   2. Profile → Games tab → Export → CSV
//   3. Paste content here
//
// TrueAchievements CSV columns (varies slightly by export option):
//   Game, Platform, Gamerscore, Achievements, Date Started, Date Finished, Time Played
// Some exports include extras: TA Score, Gameplay Hours, Completion %.
//
// This parser is generous: case-insensitive header alias map, missing columns OK,
// quoted CSV with embedded commas. Same approach as psnprofiles-import.

// ─── CSV PARSER (RFC 4180-ish) ─────────────────────────────────────────────
function splitCsvLine(line) {
  const fields = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; continue; }
      if (ch === '"') { inQuotes = false; continue; }
      cur += ch;
    } else {
      if (ch === '"' && cur === '') { inQuotes = true; continue; }
      if (ch === ',') { fields.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
  }
  fields.push(cur.trim());
  return fields;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return { header: [], rows: [] };
  const header = splitCsvLine(lines[0]).map(h => h.toLowerCase());
  const rows = lines.slice(1).map(splitCsvLine);
  return { header, rows };
}

// Column aliases — TrueAchievements uses different casings + sometimes legacy
// names. This catches the common variants without enforcing one.
const COLUMN_MAP = {
  title:        ['game', 'title', 'name'],
  platform:     ['platform', 'console', 'system'],
  hours:        ['time played', 'time_played', 'hours', 'playtime', 'gameplay hours'],
  completion:   ['completion', 'progress', 'completion %', 'completion percentage'],
  gamerscore:   ['gamerscore', 'gs', 'gamer score'],
  achievements: ['achievements', 'achievements earned'],
  lastPlayed:   ['date finished', 'date_finished', 'last played', 'last activity'],
};

function findColumn(header, canonical) {
  const aliases = COLUMN_MAP[canonical] || [canonical];
  for (let i = 0; i < header.length; i++) {
    const h = header[i].toLowerCase().trim();
    if (aliases.includes(h)) return i;
  }
  return -1;
}

// Map TA's platform strings to our PLATFORMS enum.
function normalizePlatform(raw) {
  if (!raw) return 'Xbox Series X/S';
  const s = String(raw).toLowerCase().trim();
  if (s.includes('series'))     return 'Xbox Series X/S';
  if (s.includes('one'))        return 'Xbox One';
  if (s.includes('360'))        return 'Other';   // not in our enum
  if (s.includes('windows') || s.includes('pc')) return 'PC';
  if (s === 'xbox')             return 'Xbox One';  // ambiguous → safest guess
  return 'Xbox Series X/S';
}

// Hours format: TA uses "12h 34m" or "12h" or "1234m" or just numbers.
function parseHours(raw) {
  if (!raw) return 0;
  const s = String(raw).trim();
  if (!s || s === '-' || s === 'N/A') return 0;
  // "12h 34m" or "12h"
  const hm = /^(\d+(?:\.\d+)?)\s*h(?:\s*(\d+)\s*m)?$/i.exec(s);
  if (hm) {
    return (parseFloat(hm[1]) || 0) + ((parseInt(hm[2] || '0', 10) || 0) / 60);
  }
  // "1234m"
  const mOnly = /^(\d+(?:\.\d+)?)\s*m$/i.exec(s);
  if (mOnly) return (parseFloat(mOnly[1]) || 0) / 60;
  // plain decimal/int
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function parseCompletion(raw) {
  if (!raw) return null;
  const m = /(\d+(?:\.\d+)?)/.exec(String(raw));
  if (!m) return null;
  return Math.round(parseFloat(m[1]));
}

// Public entry — returns { format, count, rows }.
// Falls back to plaintext (newline-separated titles) when CSV detection fails.
export function parseXboxPaste(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return { format: 'unknown', count: 0, rows: [] };

  // Try CSV
  const csv = parseCsv(trimmed);
  if (csv.header.length > 0 && csv.rows.length > 0) {
    const idxTitle      = findColumn(csv.header, 'title');
    const idxPlatform   = findColumn(csv.header, 'platform');
    const idxHours      = findColumn(csv.header, 'hours');
    const idxCompletion = findColumn(csv.header, 'completion');
    const idxLastPlayed = findColumn(csv.header, 'lastPlayed');

    if (idxTitle >= 0) {
      const rows = csv.rows
        .map(r => ({
          title:         (r[idxTitle] || '').trim(),
          platform:      normalizePlatform(idxPlatform   >= 0 ? r[idxPlatform]   : ''),
          hours:         parseHours      (idxHours       >= 0 ? r[idxHours]       : ''),
          completionPct: parseCompletion (idxCompletion  >= 0 ? r[idxCompletion]  : ''),
          lastPlayed:    (idxLastPlayed  >= 0 ? r[idxLastPlayed] : '') || null,
          raw: r,
        }))
        .filter(r => r.title);
      return { format: 'csv', count: rows.length, rows };
    }
  }

  // Fallback: plaintext lines as titles (Xbox doesn't have a JSON form like Steam)
  const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0 && l.length < 200);
  if (lines.length > 0 && lines.length < 5000) {
    const looksCsvish = lines[0].includes(',');  // skip if header-like (already failed CSV path)
    if (!looksCsvish) {
      const rows = lines.map(title => ({
        title, platform: 'Xbox Series X/S', hours: 0, completionPct: null, lastPlayed: null, raw: { source: 'plaintext' },
      }));
      return { format: 'plaintext', count: rows.length, rows };
    }
  }

  return { format: 'unknown', count: 0, rows: [] };
}
