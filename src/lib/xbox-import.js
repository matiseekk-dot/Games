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
// v1.16.3 — pass delimiter as a param (TA UK exports as ',', some EU regions
// re-export from Excel which switches to ';' based on the user's locale).
function splitCsvLine(line, delim = ',') {
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
      if (ch === delim) { fields.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
  }
  fields.push(cur.trim());
  return fields;
}

// v1.16.3 — strip UTF-8 BOM (﻿) that Windows / Excel commonly prepends to
// CSV files. Without this the first header reads as "﻿Game" and never
// matches the title alias list, causing the entire CSV to fail and fall through
// to plaintext (which is rejected because line 0 has commas).
function stripBOM(text) {
  return text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
}

// v1.16.3 — auto-detect delimiter by counting on header line. Pick whichever of
// ','  ';'  '\t' appears most often. Tab-separated (TSV) is what some TA legacy
// exports use; semicolon comes from Excel re-exports in EU locales.
function detectDelimiter(headerLine) {
  const counts = {
    ',': (headerLine.match(/,/g) || []).length,
    ';': (headerLine.match(/;/g) || []).length,
    '\t': (headerLine.match(/\t/g) || []).length,
  };
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : ',';
}

function parseCsv(text) {
  const cleaned = stripBOM(text);
  const lines = cleaned.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return { header: [], rows: [], delim: ',' };
  const delim = detectDelimiter(lines[0]);
  const header = splitCsvLine(lines[0], delim).map(h => h.toLowerCase());
  const rows = lines.slice(1).map(l => splitCsvLine(l, delim));
  return { header, rows, delim };
}

// Column aliases — TrueAchievements uses different casings + sometimes legacy
// names. v1.16.3 expanded with more variants observed across TA Pro CSV exports
// (incl. localized headers, "Title" vs "Game", "Total Hours" etc.).
const COLUMN_MAP = {
  title:        ['game', 'title', 'name', 'game title', 'game name', 'gra', 'tytuł', 'tytul', 'titulo', 'título', 'juego'],
  platform:     ['platform', 'console', 'system', 'platforma', 'plataforma', 'sistema'],
  hours:        ['time played', 'time_played', 'hours', 'playtime', 'gameplay hours', 'total hours', 'play time', 'czas gry', 'godziny', 'horas'],
  completion:   ['completion', 'progress', 'completion %', 'completion percentage', 'progress %', 'progreso', 'ukończenie', 'ukonczenie', 'postęp', 'postep'],
  gamerscore:   ['gamerscore', 'gs', 'gamer score', 'score', 'punktacja', 'puntuación'],
  achievements: ['achievements', 'achievements earned', 'osiągnięcia', 'osiagniecia', 'logros'],
  lastPlayed:   ['date finished', 'date_finished', 'last played', 'last activity', 'finished', 'completed', 'last_played'],
};

// v1.16.3 — match header against alias list using EXACT first, then SUBSTRING
// fallback (e.g. "Game (10h+)" still matches title via substring 'game'). Substring
// match is intentionally lossy — better to over-match a column than to fail entirely.
function findColumn(header, canonical) {
  const aliases = COLUMN_MAP[canonical] || [canonical];
  // Exact match pass
  for (let i = 0; i < header.length; i++) {
    const h = header[i].toLowerCase().trim();
    if (aliases.includes(h)) return i;
  }
  // Substring fallback pass — alias appears anywhere in header cell
  for (let i = 0; i < header.length; i++) {
    const h = header[i].toLowerCase().trim();
    if (aliases.some(a => h.includes(a))) return i;
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

// v1.16.3 — heuristic: pick the column most likely to contain game titles when
// header aliases don't match. Skips columns that are mostly numeric / dates /
// short codes. Picks the column with longest average string length among text
// columns. Returns -1 if no column qualifies (e.g. all-numeric CSV).
function guessTitleColumn(header, rows) {
  // v1.16.3 — only guess on multi-column, multi-row inputs. Single-column CSVs
  // are usually plaintext title lists (handled by the plaintext fallback);
  // single-row inputs are too ambiguous to guess from.
  if (header.length < 2 || rows.length < 2) return -1;
  const sampleSize = Math.min(rows.length, 20);
  const candidates = [];
  for (let c = 0; c < header.length; c++) {
    let textCount = 0;
    let numericCount = 0;
    let totalLen = 0;
    for (let r = 0; r < sampleSize; r++) {
      const cell = (rows[r][c] || '').trim();
      if (!cell) continue;
      // Numeric or date-ish?
      if (/^[-+]?\d+(\.\d+)?$/.test(cell) || /^\d{4}-\d{2}-\d{2}/.test(cell) || /^\d+%$/.test(cell)) {
        numericCount++;
      } else if (cell.length >= 2 && cell.length <= 100) {
        textCount++;
        totalLen += cell.length;
      }
    }
    if (textCount > numericCount && textCount > 0) {
      candidates.push({ col: c, avgLen: totalLen / textCount, count: textCount });
    }
  }
  if (candidates.length === 0) return -1;
  // Prefer column with most text values, breaking ties by longest avg
  candidates.sort((a, b) => b.count - a.count || b.avgLen - a.avgLen);
  return candidates[0].col;
}

// Public entry — returns { format, count, rows, debug? }.
// `debug` is set on failure to help diagnose what was seen (header columns,
// first data line, detected delimiter). v1.16.3 added BOM stripping, ; / \t
// delimiter auto-detect, broader column aliases, and column-guessing fallback.
export function parseXboxPaste(text) {
  const trimmed = stripBOM((text || '').trim());
  if (!trimmed) return { format: 'unknown', count: 0, rows: [] };

  // v1.16.3 — early reject binary inputs (xlsx / xls / zip / docx all have null
  // bytes or low control chars in their first ~200 bytes). Without this, the
  // plaintext fallback would happily accept a single garbage-line as a "title".
  const looksLikeBinary = /[\x00-\x08\x0E-\x1F]/.test(trimmed.slice(0, 200));
  if (looksLikeBinary) {
    return {
      format: 'unknown',
      count: 0,
      rows: [],
      debug: {
        bytesRead: trimmed.length,
        firstLine: trimmed.split(/\r?\n/)[0]?.slice(0, 200) || '',
        detectedDelim: '?',
        headerCols: [],
        dataRows: 0,
        looksLikeBinary: true,
      },
    };
  }

  // Try CSV
  const csv = parseCsv(trimmed);
  if (csv.header.length > 0 && csv.rows.length > 0) {
    let idxTitle       = findColumn(csv.header, 'title');
    const idxPlatform   = findColumn(csv.header, 'platform');
    const idxHours      = findColumn(csv.header, 'hours');
    const idxCompletion = findColumn(csv.header, 'completion');
    const idxLastPlayed = findColumn(csv.header, 'lastPlayed');
    const idxAchievements = findColumn(csv.header, 'achievements');  // v1.16.4 — "X/Y" for platinum detection

    // v1.16.3 — if no header alias matched, try heuristic title-column guess
    // (e.g. column 0 is usually the game name even when header is "Item" / localized)
    let format = 'csv';
    if (idxTitle < 0) {
      idxTitle = guessTitleColumn(csv.header, csv.rows);
      if (idxTitle >= 0) format = 'csv-guessed';
    }

    if (idxTitle >= 0) {
      const rows = csv.rows
        .map(r => ({
          title:         (r[idxTitle] || '').trim(),
          platform:      normalizePlatform(idxPlatform   >= 0 ? r[idxPlatform]   : ''),
          hours:         parseHours      (idxHours       >= 0 ? r[idxHours]       : ''),
          completionPct: parseCompletion (idxCompletion  >= 0 ? r[idxCompletion]  : ''),
          lastPlayed:    (idxLastPlayed  >= 0 ? r[idxLastPlayed] : '') || null,
          // v1.16.4 — raw "X/Y" achievements string. Mapped downstream to
          // platinum=true when fully completed (Xbox doesn't have platinum
          // trophies but our schema reuses the same flag for "all unlocked").
          achievements:  idxAchievements >= 0 ? String(r[idxAchievements] || '').trim() : '',
          raw: r,
        }))
        .filter(r => r.title);  // drop blank rows; single-char titles ("A", "B") legit in tests/data
      if (rows.length > 0) return { format, count: rows.length, rows };
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

  // v1.16.3 — emit diagnostic info on full failure so the UI can show user
  // *what* we actually parsed (helps debug "no games found" mysteries: was it
  // a binary xlsx? wrong delimiter? all-numeric file?).
  const debug = {
    bytesRead: trimmed.length,
    firstLine: trimmed.split(/\r?\n/)[0]?.slice(0, 200) || '',
    detectedDelim: csv.delim || '?',
    headerCols: csv.header || [],
    dataRows: csv.rows?.length || 0,
    looksLikeBinary: /[\x00-\x08\x0E-\x1F]/.test(trimmed.slice(0, 200)),  // null bytes etc → xlsx/xls/zip
  };
  return { format: 'unknown', count: 0, rows: [], debug };
}
