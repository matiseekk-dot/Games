// v1.17.0 — Parser for Playnite library exports (JSON).
//
// Playnite (https://playnite.link) is a free open-source Windows game library
// manager that aggregates Steam / Epic / GOG / Xbox / PlayStation / Battle.net /
// Origin / Uplay / etc. into a single library. Most importantly it has its own
// CompletionStatus field that maps almost 1:1 to our statuses — so imports
// from Playnite skip all the heuristic guessing because the user already
// categorized everything themselves.
//
// User flow:
//   1. Install Playnite (or already have it)
//   2. Install "Library Exporter" extension (Add-ons → Browse → search)
//      OR use built-in export if available in user's Playnite version
//   3. Export library to JSON
//   4. Upload .json file in our app
//
// JSON shape (Playnite's native PascalCase OR camelCase from custom exporters):
//   {
//     Name / name: "Game Title",
//     Source: { Name: "Steam" } / source: "Steam",
//     Platforms: [{Name: "PC"}] / platform: "PC",
//     Playtime / playtime: 360000,        // SECONDS, not minutes!
//     LastActivity / lastActivity: "2024-12-15T18:30:00Z",
//     CompletionStatus: { Name: "Beaten" } / completionStatus: "Beaten",
//     ...
//   }
//
// We accept both shapes (PascalCase = Playnite native dump, camelCase = some
// custom plugins / re-serialized). Output normalized to our row shape.

// Playnite CompletionStatus → our status enum.
// Playnite supports custom statuses too — we match by substring on common names.
function mapPlayniteStatus(name) {
  const s = String(name || '').toLowerCase().trim();
  if (!s) return null;
  if (s.includes('completed')) return 'ukonczone';   // "Completed" = 100% achievements
  if (s.includes('beaten'))    return 'ukonczone';   // "Beaten" = main story done
  if (s.includes('playing'))   return 'gram';        // "Playing" = active
  if (s.includes('played'))    return 'gram';        // "Played" = did try this
  if (s.includes('abandoned')) return 'porzucone';
  if (s.includes('on hold'))   return 'porzucone';   // "On Hold" → shelf'd
  if (s.includes('on-hold'))   return 'porzucone';
  if (s.includes('plan'))      return 'planuje';     // "Plan to Play"
  if (s === 'not played')      return 'planuje';
  if (s.includes('not played')) return 'planuje';
  if (s.includes('wishlist'))  return 'planuje';
  return null;  // unknown → fall back to derived
}

// Map Playnite source/platform name to our PLATFORMS enum.
// Playnite "Source" tells us the store (Steam, Epic, GOG, ...) which usually
// equates to PC. "Platform" can be more specific (PS5, Xbox One, Switch).
// Prefer Platform when present, fall back to Source.
function mapPlaynitePlatform(platformName, sourceName) {
  const candidate = String(platformName || sourceName || '').toLowerCase().trim();
  if (!candidate) return 'PC';
  if (candidate.includes('ps5') || candidate.includes('playstation 5')) return 'PS5';
  if (candidate.includes('ps4') || candidate.includes('playstation 4')) return 'PS4';
  if (candidate.includes('ps3') || candidate.includes('ps2') || candidate.includes('vita')) return 'Other';
  if (candidate.includes('playstation') && !candidate.includes('5') && !candidate.includes('4')) return 'PS5'; // "PlayStation" generic
  if (candidate.includes('xbox series')) return 'Xbox Series X/S';
  if (candidate.includes('xbox one')) return 'Xbox One';
  if (candidate.includes('xbox 360')) return 'Other';
  if (candidate.includes('xbox')) return 'Xbox Series X/S';
  if (candidate.includes('switch') || candidate.includes('nintendo')) return 'Switch';
  if (candidate.includes('android') || candidate.includes('ios') || candidate === 'mobile') return 'Mobile';
  // Anything PC-ish (Steam, Epic, GOG, Origin, Uplay, Battle.net, GOG Galaxy, etc.)
  return 'PC';
}

// Normalize one Playnite game record to our canonical row shape.
function normalizePlayniteGame(g) {
  if (!g || typeof g !== 'object') return null;

  const title = String(g.Name || g.name || g.title || '').trim();
  if (!title || title.length < 1) return null;

  // Source = store / launcher (Steam, Epic, GOG, PSN, Xbox, ...)
  const source = (g.Source?.Name || g.source?.Name || g.source || '').toString();

  // Platform — Playnite stores as array; take first. Some plugins flatten.
  let platformName = '';
  if (Array.isArray(g.Platforms) && g.Platforms.length > 0) {
    platformName = g.Platforms[0]?.Name || g.Platforms[0] || '';
  } else if (g.Platform?.Name) {
    platformName = g.Platform.Name;
  } else if (g.platform) {
    platformName = g.platform;
  } else if (Array.isArray(g.platforms) && g.platforms.length > 0) {
    platformName = g.platforms[0]?.Name || g.platforms[0] || '';
  }

  // Playtime: SECONDS in Playnite native (different from Steam's MINUTES!).
  // Convert to fractional hours rounded to 0.1.
  const playtimeSec = +(g.Playtime ?? g.playtime ?? 0);
  const hours = playtimeSec > 0 ? Math.round(playtimeSec / 360) / 10 : 0;

  // LastActivity is already an ISO string in Playnite native exports
  let lastPlayed = g.LastActivity || g.lastActivity || g.LastPlayed || g.lastPlayed || null;
  if (lastPlayed && typeof lastPlayed === 'object') lastPlayed = null;  // skip non-string values

  // CompletionStatus → user's manual status (gold standard, beats heuristics)
  const csName = g.CompletionStatus?.Name || g.completionStatus?.Name || g.CompletionStatus || g.completionStatus || '';
  const explicitStatus = mapPlayniteStatus(csName);

  return {
    title,
    platform: mapPlaynitePlatform(platformName, source),
    hours,
    completionPct: null,  // Playnite doesn't track per-game achievement %
    lastPlayed,
    explicitStatus,        // pre-mapped from user's Playnite CompletionStatus
    raw: g,
  };
}

// Public entry. Returns { format, count, rows, debug? }.
//
// format: 'playnite-json' | 'unknown'
// rows: normalized canonical shape with optional `explicitStatus` field that
//       commit() in PlatformImportOverlay should honor over derived status.
export function parsePlaynitePaste(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return { format: 'unknown', count: 0, rows: [] };

  let arr = null;
  let parseError = null;
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      arr = parsed;
    } else if (parsed && typeof parsed === 'object') {
      // Wrapped forms: { games: [...] }, { Games: [...] }, { Items: [...] }, { library: [...] }
      arr = parsed.games || parsed.Games || parsed.Items || parsed.items
         || parsed.library || parsed.Library || parsed.results || parsed.Results
         || null;
    }
  } catch (err) {
    parseError = err.message;
  }

  if (!Array.isArray(arr)) {
    const debug = {
      bytesRead: trimmed.length,
      firstLine: trimmed.split(/\r?\n/)[0]?.slice(0, 200) || '',
      firstLines: trimmed.split(/\r?\n/).slice(0, 20).map(l => l.slice(0, 200)),
      parseError: parseError || 'JSON did not contain an array of games',
      hint: 'Expected JSON array OR { games: [...] } wrapper. Use Library Exporter extension in Playnite.',
    };
    return { format: 'unknown', count: 0, rows: [], debug };
  }

  const rows = arr.map(normalizePlayniteGame).filter(r => r && r.title);
  return { format: 'playnite-json', count: rows.length, rows };
}
