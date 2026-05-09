// v1.16.0 — Parser for PSN-Profiles game library exports.
//
// PSN-Profiles (psnprofiles.com) is the de-facto public PSN library mirror — users
// link their PSN ID and the site scrapes their public trophy/game data. It exposes a
// "Games" tab with built-in CSV export, plus a copy-paste-friendly HTML table.
// Both are public, scraped from public PSN data — no Sony API access, no NPSSO token,
// no ToS violation. User views their own data via their own browser, copies, pastes
// into our app, we parse locally.
//
// This module accepts either format and returns a normalized games array:
//   [{ title, platform, hours, completionPct, lastPlayedISO, source }]
// where source is 'psnprofiles' (for migration tracking).
//
// Format flexibility is intentional — PSN-Profiles has changed export schemas a few
// times, and users sometimes paste partial data (just a column they highlighted).
// Parser is generous: ignores unknown columns, skips empty rows, recovers from
// malformed quotes by line-by-line scan instead of requiring strict RFC 4180.

// ─── CSV PARSER (RFC 4180-ish with recovery) ───────────────────────────────
// Splits a single CSV line into fields, respecting "double quotes" and embedded
// commas. Embedded quotes inside a field are encoded as "" per CSV convention.
// Returns array of strings, trimmed.
// v1.16.3 — delimiter param + BOM strip + auto-detect (matches xbox-import.js
// for consistency). Original PSN-Profiles CSV uses ',', but users sometimes
// re-export from Excel which switches to ';' in EU locales.
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

function stripBOM(text) {
  return text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
}

// v1.16.9 — iOS Safari "Select All → Copy" on a rendered <table> produces
// plain text with each cell on its own line — no tabs, no commas. So:
//   God of War Ragnarök
//   PS5
//   36/36
//   18
//   100%
//   Elden Ring
//   PS5,PS4
//   42/42
//   95
//   100%
//   ...
// Detect this pattern by finding "title-looking" lines (alphabetic, not pure
// numbers/fractions/percentages/platforms) and the consistent gap K between
// them. Then group each K-line block as one row. Synthetic header is inferred
// from cell contents (column where most entries match a fraction → 'trophies',
// where most are 'X%' → 'completion', etc.).
function isLikelyTitle(line) {
  if (!line || line.length < 2 || line.length > 120) return false;
  if (/^\d+(\.\d+)?%?$/.test(line)) return false;             // pure number / percentage
  if (/^\d+\s*\/\s*\d+$/.test(line)) return false;            // fraction "X/Y"
  if (/^\d+\s*h(\s+\d+\s*m)?$/i.test(line)) return false;     // "12h 30m"
  if (/^\d+\s*m$/i.test(line)) return false;                  // "60m"
  if (/^(PS[1-5]|PSP|PS\s?Vita|Xbox(\s+(Series\s*[XS]?(\|S)?|One|360))?|PC|Steam|Switch|Mobile|iOS|Android)$/i.test(line)) return false;
  if (/^(PS[1-5][,\s/|]+PS[1-5])$/i.test(line)) return false; // "PS5,PS4"
  if (!/[a-zA-Z]/.test(line)) return false;                   // must have at least one letter
  return true;
}

// Detect repeating-block plaintext pattern. Returns { header, rows, delim }
// shape compatible with parseCsv output, or null if pattern not found.
function parsePlaintextTable(lines) {
  const titleIdxs = lines.map((l, i) => isLikelyTitle(l) ? i : -1).filter(i => i >= 0);
  if (titleIdxs.length < 4) return null;  // need ≥4 candidate titles
  // Find modal gap between consecutive title indices
  const gaps = [];
  for (let i = 1; i < titleIdxs.length; i++) gaps.push(titleIdxs[i] - titleIdxs[i-1]);
  const hist = {};
  gaps.forEach(g => { hist[g] = (hist[g] || 0) + 1; });
  const sorted = Object.entries(hist).sort((a, b) => b[1] - a[1]);
  const [modeGap, count] = sorted[0];
  const rowSize = +modeGap;
  if (count < 3 || rowSize < 2 || rowSize > 12) return null;
  // Extract rows where title→title gap matches mode
  const rows = [];
  for (let i = 0; i < titleIdxs.length; i++) {
    if (i > 0 && titleIdxs[i] - titleIdxs[i-1] !== rowSize) continue;
    const tIdx = titleIdxs[i];
    if (tIdx + rowSize > lines.length) break;
    rows.push(lines.slice(tIdx, tIdx + rowSize));
  }
  if (rows.length < 3) return null;
  // Infer column types from first 10 rows — synthesize header
  const sample = rows.slice(0, Math.min(10, rows.length));
  const header = [];
  for (let c = 0; c < rowSize; c++) {
    const cells = sample.map(r => r[c] || '');
    if (c === 0) { header.push('title'); continue; }
    const fracCount = cells.filter(x => /^\d+\s*\/\s*\d+$/.test(x)).length;
    const pctCount  = cells.filter(x => /^\d+\s*%$/.test(x)).length;
    const hrCount   = cells.filter(x => /^\d+\s*h(\s+\d+\s*m)?$/i.test(x) || /^\d+(\.\d+)?$/.test(x)).length;
    const platCount = cells.filter(x => /^(PS[1-5]|Xbox|PC|Switch)/i.test(x)).length;
    if (fracCount >= sample.length * 0.6) header.push('trophies');
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

// Parse full CSV string into rows of fields. First non-empty line is the header.
// Returns { header: string[], rows: string[][], delim: string }.
// v1.16.7 — Find the best "table-like" line to use as header. Mobile users
// pasting "Select All → Copy" from PSN-Profiles get the entire page content
// including navigation, footer, etc. The actual games table is buried in the
// middle. Scan first 100 lines for the one with the most consistent column
// count (tabs/commas/etc.) — that's almost certainly the table header line.
//
// Algorithm: for each line in first 100, count delim occurrences. Find the
// modal column count among lines that share it (≥3 lines with same count, ≥3
// columns each). Pick the FIRST line matching that mode as the header — the
// rest of those modal-count lines become data rows. Other lines (nav/footer)
// are dropped.
function findBestTableSection(lines) {
  // Try each delim, pick one that yields the cleanest table
  const DELIMS = ['\t', ',', ';'];
  let best = null;
  for (const delim of DELIMS) {
    const sample = lines.slice(0, 100);
    const counts = sample.map(l => {
      // Count delim occurrences NOT inside quotes (rough — ok for this heuristic)
      return (l.match(new RegExp(delim === '\t' ? '\\t' : `\\${delim}`, 'g')) || []).length;
    });
    // Find the modal count (most common count value, must be ≥2 = ≥3 columns)
    const histogram = {};
    counts.forEach((c, i) => {
      if (c >= 2) {
        if (!histogram[c]) histogram[c] = [];
        histogram[c].push(i);
      }
    });
    const modes = Object.entries(histogram).sort((a, b) => b[1].length - a[1].length);
    if (modes.length === 0) continue;
    const [modeColCount, indices] = modes[0];
    if (indices.length < 3) continue;  // need ≥3 lines with same column count for table
    // First index is header, rest are data
    const headerIdx = indices[0];
    const dataIdxs = indices.slice(1);
    if (best === null || indices.length > best.indices.length) {
      best = { delim, modeColCount: +modeColCount, indices, headerIdx, dataIdxs };
    }
  }
  return best;
}

function parseCsv(text) {
  const cleaned = stripBOM(text);
  const lines = cleaned.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return { header: [], rows: [], delim: ',' };

  // Try strict mode first: line 0 IS the header (covers TA CSV / clean exports).
  const strictDelim = detectDelimiter(lines[0]);
  const strictCols = (lines[0].match(strictDelim === '\t' ? /\t/g : new RegExp(`\\${strictDelim}`,'g')) || []).length;
  if (strictCols >= 1) {
    const header = splitCsvLine(lines[0], strictDelim).map(h => h.toLowerCase());
    const rows = lines.slice(1).map(l => splitCsvLine(l, strictDelim));
    // If strict mode found a recognizable title column, use it
    const hasTitleCol = header.some(h => /game|title|name|gra|tytuł|tytul|titulo|juego/.test(h));
    if (hasTitleCol) {
      return { header, rows, delim: strictDelim };
    }
  }

  // v1.16.7 — Fuzzy fallback for noisy mobile pastes (Select-All-Copy from a
  // rendered PSN-Profiles page includes nav/sidebar/footer noise). Find the
  // table section by column-count consistency.
  const best = findBestTableSection(lines);
  if (best) {
    const header = splitCsvLine(lines[best.headerIdx], best.delim).map(h => h.toLowerCase());
    const rows = best.dataIdxs.map(i => splitCsvLine(lines[i], best.delim));
    return { header, rows, delim: best.delim };
  }

  // Last fallback: original behavior (line 0 as header)
  const delim = strictDelim;
  const header = splitCsvLine(lines[0], delim).map(h => h.toLowerCase());
  const rows = lines.slice(1).map(l => splitCsvLine(l, delim));
  return { header, rows, delim };
}

// ─── COLUMN NAME NORMALIZATION ─────────────────────────────────────────────
// Map varying column names from PSN-Profiles / similar sites to canonical fields.
// Each canonical field has a list of accepted aliases (lowercase, alphanumeric).
// v1.16.3 — broader aliases incl. PL/ES localized headers + "Game Title" forms.
const COLUMN_MAP = {
  title:        ['title', 'game', 'name', 'game title', 'game name', 'gra', 'tytuł', 'tytul', 'titulo', 'título', 'juego'],
  platform:     ['platform', 'platforms', 'console', 'system', 'platforma', 'plataforma'],
  hours:        ['hours', 'playtime', 'time', 'time played', 'h', 'czas gry', 'godziny', 'horas'],
  completion:   ['completion', 'progress', 'progress %', '%', 'complete', 'progreso', 'ukończenie', 'ukonczenie'],
  lastPlayed:   ['last played', 'last_played', 'lastplayed', 'updated', 'last activity', 'finished'],
  trophies:     ['trophies', 'earned', 'trophy', 'trofea'],
};

// v1.16.3 — exact-then-substring matching, same logic as xbox-import.js
function findColumn(header, canonical) {
  const aliases = COLUMN_MAP[canonical] || [canonical];
  for (let i = 0; i < header.length; i++) {
    const h = header[i].toLowerCase().trim();
    if (aliases.includes(h)) return i;
  }
  for (let i = 0; i < header.length; i++) {
    const h = header[i].toLowerCase().trim();
    if (aliases.some(a => h.includes(a))) return i;
  }
  return -1;
}

// v1.16.3 — heuristic title-column guess for unknown CSV schemas (same as xbox-import.js).
function guessTitleColumn(header, rows) {
  // v1.16.3 — only guess on multi-column, multi-row inputs (same guard as xbox-import.js).
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
  candidates.sort((a, b) => b.count - a.count || b.avgLen - a.avgLen);
  return candidates[0].col;
}

// ─── PLATFORM NORMALIZATION ────────────────────────────────────────────────
// PSN-Profiles uses values like "PS5", "PS4,PS3", "PSVita", "PSP", "PS1".
// We map to our PLATFORMS enum (PS5/PS4/Xbox.../PC/Switch/Mobile/Other).
// Multiple platforms get split — we take the first one (most relevant).
function normalizePlatform(raw) {
  if (!raw) return 'PS5';  // safe default
  const first = String(raw).split(/[,/|;]/)[0].trim().toUpperCase();
  if (first === 'PS5')         return 'PS5';
  if (first === 'PS4')         return 'PS4';
  if (first === 'PS3')         return 'Other';   // not in our enum
  if (first === 'PSVITA' || first === 'VITA' || first === 'PS VITA') return 'Other';
  if (first === 'PSP')         return 'Other';
  if (first === 'PS1' || first === 'PSX') return 'Other';
  return 'PS5';  // PSN-Profiles is PS-centric — anything else is likely PS5
}

// Parse hours field. PSN-Profiles formats vary:
//   "12" → 12
//   "12h" → 12
//   "12h 30m" → 12.5
//   "12.5" → 12.5
//   "" / null → 0
function parseHours(raw) {
  if (!raw) return 0;
  const s = String(raw).trim();
  if (!s || s === '-' || s === 'N/A') return 0;
  // "12h 30m" or "12h30m"
  const m = /^(\d+(?:\.\d+)?)\s*h\s*(?:(\d+)\s*m)?$/i.exec(s);
  if (m) {
    const h = parseFloat(m[1]) || 0;
    const min = parseInt(m[2] || '0', 10) || 0;
    return h + min / 60;
  }
  // "12.5" or "12"
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

// Parse completion %. PSN-Profiles formats:
//   "100%" → 100
//   "92.3%" → 92
//   "92" → 92
//   "" → null (unknown)
function parseCompletion(raw) {
  if (!raw) return null;
  const m = /(\d+(?:\.\d+)?)/.exec(String(raw));
  if (!m) return null;
  return Math.round(parseFloat(m[1]));
}

// ─── HTML PARSER ──────────────────────────────────────────────────────────
// Fallback for users who paste / upload the rendered HTML table from the Games
// page. Uses DOMParser (browser-only — Node tests skip this path). Looks for
// <table> and extracts <th> as header, <td> as rows.
//
// v1.16.6 — When a cell contains an anchor (e.g. PSN-Profiles wraps game
// titles in <a class="title">), prefer the anchor's text. PSN-Profiles' title
// cell typically has the format:
//   <td><a class="title" href="...">Game Title</a> <span>PS5 · 36/36</span></td>
// `td.textContent` returns "Game Title PS5 · 36/36" which pollutes RAWG search;
// the anchor's text is just "Game Title" which matches cleanly.
function cellText(td) {
  // Prefer .title anchor (PSN-Profiles), then any anchor with reasonable length,
  // then fall back to textContent with whitespace collapsed.
  const titleLink = td.querySelector('a.title, a[class*="title"]');
  if (titleLink && titleLink.textContent.trim().length >= 1) {
    return titleLink.textContent.trim();
  }
  const anyLink = td.querySelector('a');
  if (anyLink) {
    const lt = anyLink.textContent.trim();
    if (lt.length >= 1 && lt.length <= 150) return lt;
  }
  return td.textContent.replace(/\s+/g, ' ').trim();
}

function parseHtmlTable(html) {
  if (typeof DOMParser === 'undefined') return null;
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const tables = doc.querySelectorAll('table');
    for (const table of tables) {
      const ths = [...table.querySelectorAll('thead th, tr:first-child th')];
      if (ths.length === 0) continue;
      const header = ths.map(th => th.textContent.trim().toLowerCase());
      const trs = [...table.querySelectorAll('tbody tr')].length > 0
        ? [...table.querySelectorAll('tbody tr')]
        : [...table.querySelectorAll('tr')].slice(1);
      const rows = trs.map(tr => [...tr.querySelectorAll('td')].map(cellText));
      if (rows.length > 0 && rows[0].length === header.length) {
        return { header, rows };
      }
    }
    return null;
  } catch { return null; }
}

// ─── MAIN PARSER ───────────────────────────────────────────────────────────
// Public entry. Accepts CSV text, HTML, or JSON array (in case PSN-Profiles
// adds a raw export later). Returns normalized rows + format detected.
//
// Output: { format, count, rows: [{title, platform, hours, completionPct, lastPlayed, raw}] }
//   format: 'csv' | 'html' | 'json' | 'unknown'
//   raw:    original row object (CSV string[]/HTML cells/JSON object) for debugging
//
// Empty / malformed input returns count:0 + empty rows. Caller should check count
// before showing the import preview.
export function parsePsnProfilesPaste(text) {
  const trimmed = stripBOM((text || '').trim());
  if (!trimmed) return { format: 'unknown', count: 0, rows: [] };

  // v1.16.3 — early reject binary inputs (xlsx / xls / zip etc.). See xbox-import.js comment.
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

  let parsed = null;
  let format = 'unknown';

  // 1. Try JSON (PSN-Profiles doesn't expose this today, but future-proof)
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const j = JSON.parse(trimmed);
      const arr = Array.isArray(j) ? j : (Array.isArray(j.games) ? j.games : null);
      if (arr) {
        format = 'json';
        const rows = arr.map(o => ({
          title: String(o.title || o.game || o.name || '').trim(),
          platform: normalizePlatform(o.platform || o.platforms || ''),
          hours: parseHours(o.hours || o.playtime || ''),
          completionPct: parseCompletion(o.completion || o.progress || ''),
          lastPlayed: String(o.lastPlayed || o.last_played || '').trim() || null,
          trophies: String(o.trophies || o.trophy || '').trim(),  // v1.16.4
          raw: o,
        })).filter(r => r.title);
        return { format, count: rows.length, rows };
      }
    } catch { /* fall through */ }
  }

  // 2. Try HTML if it looks tag-like
  if (trimmed.includes('<table') || trimmed.includes('<tr')) {
    const parsedHtml = parseHtmlTable(trimmed);
    if (parsedHtml) { parsed = parsedHtml; format = 'html'; }
  }

  // 3. Default: CSV
  if (!parsed) {
    parsed = parseCsv(trimmed);
    format = 'csv';
  }

  // 3b. v1.16.9 — Plaintext-table fallback for iOS Safari "Select All → Copy"
  // which produces one-cell-per-line text. Only kicks in when CSV detection
  // failed to find a title column (otherwise normal CSV path wins).
  if (!parsed.header.length || !parsed.rows.length || (parsed.header.length === 1 && parsed.rows.length > 0)) {
    const lines = stripBOM(trimmed).split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const plain = parsePlaintextTable(lines);
    if (plain) {
      parsed = plain;
      format = 'plaintext-table';
    }
  }

  if (!parsed.header.length || !parsed.rows.length) {
    const debug = {
      bytesRead: trimmed.length,
      firstLine: trimmed.split(/\r?\n/)[0]?.slice(0, 200) || '',
      detectedDelim: parsed?.delim || '?',
      headerCols: parsed?.header || [],
      dataRows: parsed?.rows?.length || 0,
      looksLikeBinary: /[\x00-\x08\x0E-\x1F]/.test(trimmed.slice(0, 200)),
    };
    return { format, count: 0, rows: [], debug };
  }

  let idxTitle       = findColumn(parsed.header, 'title');
  const idxPlatform   = findColumn(parsed.header, 'platform');
  const idxHours      = findColumn(parsed.header, 'hours');
  const idxCompletion = findColumn(parsed.header, 'completion');
  const idxLastPlayed = findColumn(parsed.header, 'lastPlayed');
  const idxTrophies   = findColumn(parsed.header, 'trophies');  // v1.16.4 — platinum detection

  // v1.16.3 — column-guess fallback for non-standard CSV schemas
  if (idxTitle < 0) {
    idxTitle = guessTitleColumn(parsed.header, parsed.rows);
    if (idxTitle >= 0) format = format + '-guessed';
  }

  if (idxTitle < 0) {
    const debug = {
      bytesRead: trimmed.length,
      firstLine: trimmed.split(/\r?\n/)[0]?.slice(0, 200) || '',
      detectedDelim: parsed?.delim || '?',
      headerCols: parsed?.header || [],
      dataRows: parsed?.rows?.length || 0,
      looksLikeBinary: /[\x00-\x08\x0E-\x1F]/.test(trimmed.slice(0, 200)),
    };
    return { format, count: 0, rows: [], debug };
  }

  const rows = parsed.rows
    .map(r => ({
      title:         (r[idxTitle] || '').trim(),
      platform:      normalizePlatform(idxPlatform   >= 0 ? r[idxPlatform]   : ''),
      hours:         parseHours      (idxHours       >= 0 ? r[idxHours]       : ''),
      completionPct: parseCompletion (idxCompletion  >= 0 ? r[idxCompletion]  : ''),
      lastPlayed:    (idxLastPlayed  >= 0 ? r[idxLastPlayed] : '') || null,
      // v1.16.4 — raw "X/Y" trophies string (e.g. "36/36"). Used downstream to
      // detect platinum trophy on PSN — when X==Y, all trophies (incl. platinum
      // if the game has one) are earned.
      trophies:      idxTrophies >= 0 ? String(r[idxTrophies] || '').trim() : '',
      raw: r,
    }))
    .filter(r => r.title);  // drop empty rows; single-char titles legit ("A", "B" used in tests/data)

  return { format, count: rows.length, rows };
}
