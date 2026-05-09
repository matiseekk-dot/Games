// v1.16.1 — Parser for Steam library exports (paste flow).
//
// Steam Web API is CORS-blocked from browsers, so we go via paste. User opens
// https://steamcommunity.com/id/{username}/games?tab=all in their browser, gets
// the rgGames JS array (multiple paths — see below), pastes into our app.
//
// Accepted input formats (most-permissive-first):
//   1. `var rgGames = [{...}, ...];` — direct from page source (Ctrl+U)
//   2. Raw JSON array `[{...}, ...]` — user extracted just the array
//   3. JSON object `{ rgGames: [...] }` — wrapped form
//   4. Newline-separated game titles (last-resort fallback for users who
//      gave up on JSON and just typed game names)
//
// Steam's rgGames object shape (fields we care about):
//   {
//     appid: 1245620,
//     name: "ELDEN RING",
//     logo: "https://cdn.cloudflare.steamstatic.com/...",
//     playtime_forever: 5840,  // minutes
//     last_played: 1730000000  // unix seconds
//   }
//
// We normalize to: { title, hours, platform:'PC', lastPlayed, raw }

// Extract JSON array text from "var rgGames = [...]" form. Handles trailing
// semicolon, surrounding whitespace, and commented-out lines around it.
function extractRgGamesJson(text) {
  const m = /(?:var\s+)?rgGames\s*=\s*(\[[\s\S]*?\])\s*;?/i.exec(text);
  return m ? m[1] : null;
}

// Try to parse text as JSON. Returns parsed value or null on failure.
function tryParseJson(text) {
  try { return JSON.parse(text); } catch { return null; }
}

// Normalize one Steam game record to our canonical row shape.
function normalizeSteamGame(g) {
  if (!g || typeof g !== 'object') return null;
  const title = String(g.name || g.friendly_name || g.title || '').trim();
  if (!title) return null;
  // playtime_forever is in MINUTES per Steam Web API convention.
  // Convert to fractional hours, rounded to 1 decimal.
  const minutes = +g.playtime_forever || +g.playtime || 0;
  const hours = minutes > 0 ? Math.round(minutes / 6) / 10 : 0;
  // last_played is unix seconds. Convert to ISO if present.
  let lastPlayed = null;
  if (g.last_played) {
    try { lastPlayed = new Date(+g.last_played * 1000).toISOString(); } catch {}
  }
  return {
    title,
    platform: 'PC',
    hours,
    completionPct: null,  // Steam doesn't expose completion % via rgGames
    lastPlayed,
    raw: g,
  };
}

// Public entry. Returns { format, count, rows }.
//
// format: 'js' | 'json-array' | 'json-object' | 'plaintext' | 'unknown'
//   js          — parsed from "var rgGames = [...]" syntax
//   json-array  — parsed from raw "[...]"
//   json-object — parsed from "{ rgGames: [...] }" or "{ games: [...] }"
//   plaintext   — fallback: newline-separated title list (no hours/etc)
//   unknown     — couldn't parse
//
// rows: array of { title, platform:'PC', hours, completionPct:null, lastPlayed, raw }
export function parseSteamPaste(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return { format: 'unknown', count: 0, rows: [] };

  // 1. Try "var rgGames = [...]"
  const extracted = extractRgGamesJson(trimmed);
  if (extracted) {
    const arr = tryParseJson(extracted);
    if (Array.isArray(arr)) {
      const rows = arr.map(normalizeSteamGame).filter(Boolean);
      return { format: 'js', count: rows.length, rows };
    }
  }

  // 2. Try raw JSON array
  if (trimmed.startsWith('[')) {
    const arr = tryParseJson(trimmed);
    if (Array.isArray(arr)) {
      const rows = arr.map(normalizeSteamGame).filter(Boolean);
      return { format: 'json-array', count: rows.length, rows };
    }
  }

  // 3. Try JSON object with games/rgGames key
  if (trimmed.startsWith('{')) {
    const obj = tryParseJson(trimmed);
    if (obj && (Array.isArray(obj.rgGames) || Array.isArray(obj.games) || Array.isArray(obj.response?.games))) {
      const arr = obj.rgGames || obj.games || obj.response.games;
      const rows = arr.map(normalizeSteamGame).filter(Boolean);
      return { format: 'json-object', count: rows.length, rows };
    }
  }

  // 4. Fallback: newline-separated titles. Last-resort for users who couldn't
  //    figure out JSON extraction. Titles only — hours/platform default.
  const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0 && l.length < 200);
  if (lines.length > 0 && lines.length < 5000) {
    // Reject if any line looks like JSON garbage (common when user pasted partial)
    const looksJsonish = lines.some(l => /^[{}\[\],"]/.test(l));
    if (!looksJsonish) {
      const rows = lines.map(title => ({
        title, platform: 'PC', hours: 0, completionPct: null, lastPlayed: null, raw: { source: 'plaintext' },
      }));
      return { format: 'plaintext', count: rows.length, rows };
    }
  }

  return { format: 'unknown', count: 0, rows: [] };
}
