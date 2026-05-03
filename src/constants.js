// Top-level app constants: version, API key, localStorage keys, theme colors,
// genre/store/platform enums, currency table, default form shape.
// No external dependencies — every other module imports from here.

export const APP_VER  = '1.13.8';
export const RAWG_KEY = import.meta.env.VITE_RAWG_KEY || '0c13edec026d489a97cc183170d796fd';

// localStorage keys (single source of truth — DON'T inline these)
export const LS_KEY       = 'ps5vault_v1';
export const LS_ONBOARD   = 'ps5vault_onboarded';
export const LS_LANG      = 'ps5vault_lang';
export const LS_CURRENCY  = 'ps5vault_currency';
export const LS_EAN_CACHE = 'ps5vault_ean_cache';
export const LS_GOALS     = 'ps5vault_goals';
// v1.7.0 — set of achievement IDs the user has been notified about. Used to detect
// freshly-unlocked achievements without spamming the banner on every render.
// Stored as a JSON array (Sets don't serialize); cast back to Set on read.
export const LS_LAST_SEEN_ACH = 'ps5vault_last_seen_ach';
// v1.8.0 — record of when user last opened each menu section. Drives the red-dot
// trigger on the hamburger button + per-row dots in MenuOverlay. Schema:
//   { achievementsCount:number, goalsAt:string|null, wrappedYear:number|null }
// achievementsCount is "how many were unlocked when user last opened Achievements
// view"; if current count > stored, there's something new to show.
export const LS_MENU_SEEN = 'ps5vault_menu_seen';
// v1.9.0 — Recommendations cache. Per-RAWG-game-id storage of the last fetched
// /games/{id}/suggested results. Suggestions are content-based and stable per game,
// so we cache aggressively (TTL 30 days) to stay well under the 20k/month free quota.
// Schema: { '<rawgId>': { fetchedAt: ISO, results: [{id,name,background_image,genres,released,playtime}] } }
export const LS_RECS_CACHE = 'ps5vault_recs_cache';
// v1.10.0 — Timestamp of the last weekly summary notification we fired. Drives the
// once-per-week throttle in App.jsx. Stored as ISO string. Default null → first
// eligible visit triggers immediately (assuming permission + sessions).
export const LS_LAST_WEEKLY_PUSH = 'ps5vault_last_weekly_push';

// ─── Theme ─────────────────────────────────────────────────────────────────
// Used by both the CSS template literal AND inline JSX styles. Hex strings inside
// rgba(...) calls are duplicated by hand in CSS — see `styles.js`. Don't try to
// derive them from G (would require runtime CSS templating per render).
// v1.8.0: dim bumped from #5A6A8A → #7B8AAD. Old value gave ~3.6:1 contrast against G.bg
// (sub-AA — failed WCAG 2.1 4.5:1 threshold for normal text). New value gives ~5.4:1 vs G.bg
// and ~5.0:1 vs G.card — both pass AA. Used in 45+ places (secondary text, labels, captions),
// so this single change cascades across the entire UI. Hex outside G — see G/CSS comment.
export const G = { bg:'#080B14', card:'#0D1120', card2:'#111827', bdr:'#1E2A42', txt:'#E8EDF8', dim:'#7B8AAD', blu:'#00D4FF', grn:'#39FF6E', pur:'#A78BFA', red:'#FF4D6D', gld:'#FFD166', org:'#FF9F1C' };

// ─── Genre dropdowns ───────────────────────────────────────────────────────
// PL/EN parallel arrays. RMAP maps RAWG slugs to PL labels for fill().
// Keep PL labels canonical — the EN array is just a translation layer for UI.
export const GENRES_PL = ['Action','RPG','FPS','Horror','Sport','Racing','Platformer','Puzzle','Adventure','Strategia','Fighting','Indie','Inne'];
export const GENRES_EN = ['Action','RPG','FPS','Horror','Sports','Racing','Platformer','Puzzle','Adventure','Strategy','Fighting','Indie','Other'];
export const RMAP = {'action':'Action','role-playing-games-rpg':'RPG','shooter':'FPS','horror':'Horror','sports':'Sport','racing':'Racing','platformer':'Platformer','puzzle':'Puzzle','adventure':'Adventure','strategy':'Strategia','fighting':'Fighting','indie':'Indie'};

export const STORES    = ['PSN','PS Store','Steam','CDP','Allegro','OLX','Media Expert','Empik','Amazon','eBay','Disc','Key','Other'];
export const PLATFORMS = ['PS5','PS4','Xbox Series X/S','Xbox One','PC','Nintendo Switch','Mobile','Other'];

// ─── Currency ──────────────────────────────────────────────────────────────
// Single-currency per user — NO conversion. User enters raw numbers, app swaps symbol.
// after:true  → "100 zł"  (PLN/CZK/SEK/NOK)
// after:false → "$100"    (EUR/USD/GBP)
export const CURRENCIES = {
  PLN: { code:'PLN', symbol:'zł', after:true,  name:{pl:'Polski złoty',      en:'Polish złoty'} },
  EUR: { code:'EUR', symbol:'€',  after:false, name:{pl:'Euro',              en:'Euro'} },
  USD: { code:'USD', symbol:'$',  after:false, name:{pl:'Dolar amerykański', en:'US dollar'} },
  GBP: { code:'GBP', symbol:'£',  after:false, name:{pl:'Funt brytyjski',    en:'British pound'} },
  CZK: { code:'CZK', symbol:'Kč', after:true,  name:{pl:'Korona czeska',     en:'Czech koruna'} },
  SEK: { code:'SEK', symbol:'kr', after:true,  name:{pl:'Korona szwedzka',   en:'Swedish krona'} },
  NOK: { code:'NOK', symbol:'kr', after:true,  name:{pl:'Korona norweska',   en:'Norwegian krone'} },
};

// ─── Empty form ────────────────────────────────────────────────────────────
// Default shape for new game in the add-modal. priceSold:null is the canonical
// "not sold" state; priceBought defaults to '' (empty string) so users can leave
// it blank. abbr is auto-derived from title — never user-editable since v1.4.0.
// rawgId (v1.9.0) holds the RAWG.io game ID when the title was picked from
// RAWG search — used as the seed for /games/{id}/suggested in Recommendations.
// null for manually-entered or pre-v1.9 games (Recommendations skips those as seeds).
export const EF = { title:'', abbr:'', status:'planuje', year:new Date().getFullYear(), genre:'', hours:'', rating:'', notes:'', cover:'', releaseDate:'', notifyEnabled:false, priceBought:'', priceSold:null, storeBought:'', targetHours:'', extraSpend:'', platform:'PS5', platinum:false, lastPlayed:null, completedAt:null, rawgId:null, sessions:[] };
