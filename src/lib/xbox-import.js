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
// v1.16.9 — Same plaintext-table detector as psnprofiles-import.js. Handles
// iOS Safari "Select All → Copy" which produces one-cell-per-line text.
// v1.16.11 — Same noise/section-break filters as psnprofiles-import.js. Kept
// in sync intentionally because both platforms have similar sidebar/recommendation
// pollution problems when user does Select-All-Copy on mobile.
const SECTION_BREAK_RX = /^(recommended|trending|sponsored|advertis|you may|you might|popular|featured|related|similar|sugest|polec|reklam|sponsorow|see also|learn more|sign up|log in|register)/i;
const UI_NOISE_RX = /^(more|edit|add|view|play|filter|sort|share|home|games|trophies|achievements|friends|search|menu|settings|profile|next|prev|back|all|none|select)$/i;

function isLikelyTitle(line) {
  if (!line || line.length < 2 || line.length > 120) return false;
  if (/^\d+(\.\d+)?%?$/.test(line)) return false;
  if (/^\d+\s*\/\s*\d+$/.test(line)) return false;
  if (/^\d+\s*h(\s+\d+\s*m)?$/i.test(line)) return false;
  if (/^\d+\s*m$/i.test(line)) return false;
  if (/^(PS[1-5]|PSP|PS\s?Vita|Xbox(\s+(Series\s*[XS]?(\|S)?|One|360))?|PC|Steam|Switch|Mobile|iOS|Android)$/i.test(line)) return false;
  if (/^(PS[1-5][,\s/|]+PS[1-5])$/i.test(line)) return false;
  if (UI_NOISE_RX.test(line)) return false;
  if (!/[a-zA-Z]/.test(line)) return false;
  return true;
}

function rowHasTrophyMetadata(cells) {
  return cells.some(c =>
    /^\d+\s*\/\s*\d+$/.test(c) ||  // "10/30"
    /^\d+\s*%$/.test(c)             // "42%"
  );
}

function parsePlaintextTable(lines) {
  // v1.16.11 — Truncate at first section-break (Recommended/Sponsored/etc.)
  let workingLines = lines;
  for (let i = 10; i < lines.length; i++) {
    if (SECTION_BREAK_RX.test(lines[i])) { workingLines = lines.slice(0, i); break; }
  }

  const titleIdxs = workingLines.map((l, i) => isLikelyTitle(l) ? i : -1).filter(i => i >= 0);
  if (titleIdxs.length < 4) return null;
  const gaps = [];
  for (let i = 1; i < titleIdxs.length; i++) gaps.push(titleIdxs[i] - titleIdxs[i-1]);
  const hist = {};
  gaps.forEach(g => { hist[g] = (hist[g] || 0) + 1; });
  const sorted = Object.entries(hist).sort((a, b) => b[1] - a[1]);
  const [modeGap, count] = sorted[0];
  const rowSize = +modeGap;
  if (count < 3 || rowSize < 2 || rowSize > 12) return null;
  const rawRows = [];
  for (let i = 0; i < titleIdxs.length; i++) {
    if (i > 0 && titleIdxs[i] - titleIdxs[i-1] !== rowSize) continue;
    const tIdx = titleIdxs[i];
    if (tIdx + rowSize > workingLines.length) break;
    rawRows.push(workingLines.slice(tIdx, tIdx + rowSize));
  }
  if (rawRows.length < 3) return null;
  // v1.16.11 — STRICT: keep only rows with trophy/achievement metadata
  const filtered = rawRows.filter(rowHasTrophyMetadata);
  const rows = filtered.length >= Math.max(3, rawRows.length * 0.3) ? filtered : rawRows;
  if (rows.length < 3) return null;
  const sample = rows.slice(0, Math.min(10, rows.length));
  const header = [];
  for (let c = 0; c < rowSize; c++) {
    const cells = sample.map(r => r[c] || '');
    if (c === 0) { header.push('title'); continue; }
    const fracCount = cells.filter(x => /^\d+\s*\/\s*\d+$/.test(x)).length;
    const pctCount  = cells.filter(x => /^\d+\s*%$/.test(x)).length;
    const hrCount   = cells.filter(x => /^\d+\s*h(\s+\d+\s*m)?$/i.test(x) || /^\d+(\.\d+)?$/.test(x)).length;
    const platCount = cells.filter(x => /^(PS[1-5]|Xbox|PC|Switch)/i.test(x)).length;
    if (fracCount >= sample.length * 0.6) header.push('achievements');
    else if (pctCount >= sample.length * 0.6) header.push('completion');
    else if (platCount >= sample.length * 0.6) header.push('platform');
    else if (hrCount >= sample.length * 0.6) header.push('hours');
    else header.push(`col${c}`);
  }
  return { header, rows, delim: '\n' };
}

function detectDelimiter(headerLine) {
  const counts = {
    ',': (headerLine.match(/,/g) || []).length,
    ';': (headerLine.match(/;/g) || []).length,
    '\t': (headerLine.match(/\t/g) || []).length,
  };
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : ',';
}

// v1.16.7 — Find a table section in noisy input (e.g. mobile Select-All-Copy
// from a rendered TA page that includes nav/sidebar). Same algorithm as
// psnprofiles-import.js — kept in sync deliberately.
function findBestTableSection(lines) {
  const DELIMS = ['\t', ',', ';'];
  let best = null;
  for (const delim of DELIMS) {
    const sample = lines.slice(0, 100);
    const counts = sample.map(l => (l.match(delim === '\t' ? /\t/g : new RegExp(`\\${delim}`,'g')) || []).length);
    const histogram = {};
    counts.forEach((c, i) => {
      if (c >= 2) {
        if (!histogram[c]) histogram[c] = [];
        histogram[c].push(i);
      }
    });
    const modes = Object.entries(histogram).sort((a, b) => b[1].length - a[1].length);
    if (modes.length === 0) continue;
    const [, indices] = modes[0];
    if (indices.length < 3) continue;
    if (best === null || indices.length > best.indices.length) {
      best = { delim, indices, headerIdx: indices[0], dataIdxs: indices.slice(1) };
    }
  }
  return best;
}

function parseCsv(text) {
  const cleaned = stripBOM(text);
  const lines = cleaned.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return { header: [], rows: [], delim: ',' };

  // Strict mode: line 0 is header, recognized title column present.
  const strictDelim = detectDelimiter(lines[0]);
  const header = splitCsvLine(lines[0], strictDelim).map(h => h.toLowerCase());
  const hasTitleCol = header.some(h => /game|title|name|gra|tytuł|tytul|titulo|juego/.test(h));
  if (hasTitleCol) {
    const rows = lines.slice(1).map(l => splitCsvLine(l, strictDelim));
    return { header, rows, delim: strictDelim };
  }

  // Fuzzy fallback: find table-like section in noisy input
  const best = findBestTableSection(lines);
  if (best) {
    return {
      header: splitCsvLine(lines[best.headerIdx], best.delim).map(h => h.toLowerCase()),
      rows:   best.dataIdxs.map(i => splitCsvLine(lines[i], best.delim)),
      delim:  best.delim,
    };
  }

  // Last resort: original behavior
  return { header, rows: lines.slice(1).map(l => splitCsvLine(l, strictDelim)), delim: strictDelim };
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

  // Try CSV (or plaintext-table fallback for iOS Safari pastes)
  let csv = parseCsv(trimmed);
  // v1.16.9 — If CSV parsing produced a single-column or no-column result
  // (typical of iOS Safari "Select All → Copy" which gives one cell per line),
  // try the plaintext-table pattern detector. It groups consecutive lines into
  // rows by finding the modal gap between title-looking lines.
  if (csv.header.length <= 1 || csv.rows.length === 0 || (csv.rows.length > 0 && csv.rows[0].length <= 1)) {
    const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const plain = parsePlaintextTable(lines);
    if (plain) csv = plain;
  }

  if (csv.header.length > 0 && csv.rows.length > 0) {
    let idxTitle       = findColumn(csv.header, 'title');
    const idxPlatform   = findColumn(csv.header, 'platform');
    const idxHours      = findColumn(csv.header, 'hours');
    const idxCompletion = findColumn(csv.header, 'completion');
    const idxLastPlayed = findColumn(csv.header, 'lastPlayed');
    const idxAchievements = findColumn(csv.header, 'achievements');  // v1.16.4 — "X/Y" for platinum detection

    // v1.16.3 — if no header alias matched, try heuristic title-column guess
    // (e.g. column 0 is usually the game name even when header is "Item" / localized)
    let format = csv.delim === '\n' ? 'plaintext-table' : 'csv';
    if (idxTitle < 0) {
      idxTitle = guessTitleColumn(csv.header, csv.rows);
      if (idxTitle >= 0 && format === 'csv') format = 'csv-guessed';
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

  // v1.16.10 — Last-resort: extract alphabetic-rich lines as titles only.
  // v1.16.11 — Truncate at section break first (Recommended/Sponsored/etc.)
  const allLinesRaw = trimmed.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let allLinesAll = allLinesRaw;
  for (let i = 10; i < allLinesRaw.length; i++) {
    if (SECTION_BREAK_RX.test(allLinesRaw[i])) { allLinesAll = allLinesRaw.slice(0, i); break; }
  }
  const titleLines = allLinesAll.filter(isLikelyTitle);
  if (titleLines.length >= 5 && titleLines.length <= 5000) {
    const titlesOnly = titleLines.map(t => ({
      title: t, platform: 'Xbox Series X/S', hours: 0, completionPct: null, lastPlayed: null,
      achievements: '', raw: { source: 'titles-only' },
    }));
    return { format: 'titles-only', count: titlesOnly.length, rows: titlesOnly };
  }

  // v1.16.3/v1.16.10 — rich diagnostic on full failure
  const debug = {
    bytesRead: trimmed.length,
    totalLines: allLinesAll.length,
    firstLine: allLinesAll[0]?.slice(0, 200) || '',
    firstLines: allLinesAll.slice(0, 20).map(l => l.slice(0, 200)),
    detectedDelim: csv.delim || '?',
    headerCols: csv.header || [],
    dataRows: csv.rows?.length || 0,
    looksLikeBinary: /[\x00-\x08\x0E-\x1F]/.test(trimmed.slice(0, 200)),
  };
  return { format: 'unknown', count: 0, rows: [], debug };
}
