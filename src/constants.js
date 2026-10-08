// Top-level app constants: version, API key, localStorage keys, theme colors,
// genre/store/platform enums, currency table, default form shape.
// No external dependencies - every other module imports from here.

export const APP_VER  = '1.21.0';
export const RAWG_KEY = import.meta.env.VITE_RAWG_KEY || '0c13edec026d489a97cc183170d796fd';
// v1.17.7 - Umami Cloud website ID (public by design, like the Cloudflare beacon token).
// Empty = funnel analytics fully off (see src/lib/analytics.js).
export const UMAMI_WEBSITE_ID = '';

// ─── PS5 Vault Pro (v1.18.0) ──────────────────────────────────────────────
// One-time in-app product sold through Google Play Billing (Digital Goods API inside
// the TWA). PRO_ENABLED is the master switch: while false nothing is locked anywhere
// and no Pro UI shows. Flip it only after (1) the billing Worker is deployed and
// BILLING_API points at it, (2) an AAB with the Play Billing module is live, and
// (3) the product PRO_SKU exists and is active in Play Console.
export const PRO_ENABLED = true;
export const PRO_SKU = 'pro_lifetime';
export const BILLING_API = 'https://ps5vault-billing.skudev.workers.dev';
export const FREE_IMPORT_LIMIT = 50;     // imported games (Steam/Xbox/PSN/Playnite) allowed without Pro
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.skudev.ps5vault';

// v1.19.0 - Google Drive backup (src/lib/drivebackup.js). OAuth 2.0 Web client ID from
// Google Cloud Console (public by design). Empty = backup feature hidden.
export const DRIVE_CLIENT_ID = '';

// localStorage keys (single source of truth - DON'T inline these)
export const LS_KEY       = 'ps5vault_v1';
export const LS_ONBOARD   = 'ps5vault_onboarded';
export const LS_LANG      = 'ps5vault_lang';
export const LS_CURRENCY  = 'ps5vault_currency';
export const LS_EAN_CACHE = 'ps5vault_ean_cache';
// v1.7.0 - set of achievement IDs the user has been notified about. Used to detect
// freshly-unlocked achievements without spamming the banner on every render.
// Stored as a JSON array (Sets don't serialize); cast back to Set on read.
export const LS_LAST_SEEN_ACH = 'ps5vault_last_seen_ach';
// v1.8.0 - record of when user last opened each menu section. Drives the red-dot
// trigger on the hamburger button + per-row dots in MenuOverlay. Schema:
//   { achievementsCount:number, goalsAt:string|null, wrappedYear:number|null }
// achievementsCount is "how many were unlocked when user last opened Achievements
// view"; if current count > stored, there's something new to show.
export const LS_MENU_SEEN = 'ps5vault_menu_seen';
// v1.10.0 - Timestamp of the last weekly summary notification we fired. Drives the
// once-per-week throttle in App.jsx. Stored as ISO string. Default null → first
// eligible visit triggers immediately (assuming permission + sessions).
export const LS_LAST_WEEKLY_PUSH = 'ps5vault_last_weekly_push';
// v1.14.1 - One-shot dismissal of the "these are example games" banner on Home.
// Driven by Play Console feedback: ~60% of fresh installs never opened the app a
// second time, with users on r/SideProject reporting they couldn't tell that the
// games shown were demos and not their own library. Banner is shown until either
// the user clicks dismiss/clear, OR adds their first non-demo game (auto-dismiss).
// Stored as the literal string '1' once dismissed; absence = not yet dismissed.
export const LS_ONBOARDING_BANNER_DISMISSED = 'ps5vault_onboarding_demo_banner_dismissed';
// v1.20.2 - wishlist with target prices (lib/wishlist.js). Array of wish items.
export const LS_WISHLIST = 'ps5vault_wishlist';

// ─── Theme ─────────────────────────────────────────────────────────────────
// Used by both the CSS template literal AND inline JSX styles. Hex strings inside
// rgba(...) calls are duplicated by hand in CSS - see `styles.js`. Don't try to
// derive them from G (would require runtime CSS templating per render).
// v1.8.0: dim bumped from #5A6A8A → #7B8AAD. Old value gave ~3.6:1 contrast against G.bg
// (sub-AA - failed WCAG 2.1 4.5:1 threshold for normal text). New value gives ~5.4:1 vs G.bg
// and ~5.0:1 vs G.card - both pass AA. Used in 45+ places (secondary text, labels, captions),
// so this single change cascades across the entire UI. Hex outside G - see G/CSS comment.
export const G = { bg:'#080B14', card:'#0D1120', card2:'#111827', bdr:'#1E2A42', txt:'#E8EDF8', dim:'#7B8AAD', blu:'#00D4FF', grn:'#39FF6E', pur:'#A78BFA', red:'#FF4D6D', gld:'#FFD166', org:'#FF9F1C' };

// ─── Genre dropdowns ───────────────────────────────────────────────────────
// PL/EN parallel arrays. RMAP maps RAWG slugs to PL labels for fill().
// Keep PL labels canonical - the EN array is just a translation layer for UI.
export const GENRES_PL = ['Action','RPG','FPS','Horror','Sport','Racing','Platformer','Puzzle','Adventure','Strategia','Fighting','Indie','Inne'];
export const GENRES_EN = ['Action','RPG','FPS','Horror','Sports','Racing','Platformer','Puzzle','Adventure','Strategy','Fighting','Indie','Other'];
// v1.14.3 - Spanish genre labels. Keep keys identical to PL so RMAP / persisted
// genre values keep working - this list is for *display* only.
export const GENRES_ES = ['Acción','RPG','FPS','Terror','Deportes','Carreras','Plataformas','Puzles','Aventura','Estrategia','Lucha','Indie','Otros'];
// v1.21.0 - German, French, Italian, Brazilian Portuguese (display only, same order as PL)
export const GENRES_DE = ['Action','RPG','FPS','Horror','Sport','Rennspiel','Plattformer','Puzzle','Adventure','Strategie','Kampfspiel','Indie','Andere'];
export const GENRES_FR = ['Action','RPG','FPS','Horreur','Sport','Course','Plateforme','Puzzle','Aventure','Stratégie','Combat','Indé','Autre'];
export const GENRES_IT = ['Azione','RPG','FPS','Horror','Sport','Corse','Platform','Puzzle','Avventura','Strategia','Picchiaduro','Indie','Altro'];
export const GENRES_PT = ['Ação','RPG','FPS','Terror','Esporte','Corrida','Plataforma','Quebra-cabeça','Aventura','Estratégia','Luta','Indie','Outros'];
export const GENRES_BY_LANG = { pl: GENRES_PL, en: GENRES_EN, es: GENRES_ES, de: GENRES_DE, fr: GENRES_FR, it: GENRES_IT, pt: GENRES_PT };

// v1.21.0 - app languages: code, picker label, locale for dates. pt = Brazilian Portuguese.
export const LANGS = [
  { code:'pl', label:'🇵🇱 Polski',    locale:'pl-PL' },
  { code:'en', label:'🇬🇧 English',   locale:'en-US' },
  { code:'es', label:'🌎 Español',    locale:'es-ES' },
  { code:'de', label:'🇩🇪 Deutsch',   locale:'de-DE' },
  { code:'fr', label:'🇫🇷 Français',  locale:'fr-FR' },
  { code:'it', label:'🇮🇹 Italiano',  locale:'it-IT' },
  { code:'pt', label:'🇧🇷 Português', locale:'pt-BR' },
];
// Languages users can pick or get auto-detected. Add a code here only once its block
// exists in i18n.js; until then de/fr/it/pt stay hidden (the rest of the support is in place).
export const READY_LANGS = ['pl', 'en', 'es'];
export function localeFor(lang) { return (LANGS.find(l => l.code === lang) || LANGS[1]).locale; }

// v1.14.3 - Localize a stored canonical (PL) genre value for display in lang. Returns the
// input unchanged if it isn't in the canonical list (e.g. legacy/imported game with a free-form
// genre). Storage values stay PL canonical so cross-language collections + RMAP keep working.
export function localizeGenre(stored, lang) {
  if (!stored) return stored;
  const idx = GENRES_PL.indexOf(stored);
  if (idx < 0) return stored;
  return (GENRES_BY_LANG[lang] || GENRES_EN)[idx];
}
export const RMAP = {'action':'Action','role-playing-games-rpg':'RPG','shooter':'FPS','horror':'Horror','sports':'Sport','racing':'Racing','platformer':'Platformer','puzzle':'Puzzle','adventure':'Adventure','strategy':'Strategia','fighting':'Fighting','indie':'Indie'};

export const STORES    = ['PSN','PS Store','Steam','CDP','Allegro','OLX','Media Expert','Empik','Amazon','eBay','Disc','Key','Other'];
export const PLATFORMS = ['PS5','PS4','Xbox Series X/S','Xbox One','PC','Nintendo Switch','Mobile','Other'];

// ─── Currency ──────────────────────────────────────────────────────────────
// Single-currency per user - NO conversion. User enters raw numbers, app swaps symbol.
// after:true  → "100 zł"  (PLN/CZK/SEK/NOK)
// after:false → "$100"    (EUR/USD/GBP)
export const CURRENCIES = {
  PLN: { code:'PLN', symbol:'zł', after:true,  name:{pl:'Polski złoty',      en:'Polish złoty',     es:'Złoty polaco', de:'Polnischer Złoty', fr:'Złoty polonais', it:'Złoty polacco', pt:'Zloty polonês'} },
  EUR: { code:'EUR', symbol:'€',  after:false, name:{pl:'Euro',              en:'Euro',             es:'Euro', de:'Euro', fr:'Euro', it:'Euro', pt:'Euro'} },
  USD: { code:'USD', symbol:'$',  after:false, name:{pl:'Dolar amerykański', en:'US dollar',        es:'Dólar estadounidense', de:'US-Dollar', fr:'Dollar américain', it:'Dollaro statunitense', pt:'Dólar americano'} },
  GBP: { code:'GBP', symbol:'£',  after:false, name:{pl:'Funt brytyjski',    en:'British pound',    es:'Libra esterlina', de:'Britisches Pfund', fr:'Livre sterling', it:'Sterlina britannica', pt:'Libra esterlina'} },
  // v1.14.0 - North American / Australian markets requested by users
  CAD: { code:'CAD', symbol:'C$', after:false, name:{pl:'Dolar kanadyjski',  en:'Canadian dollar', es:'Dólar canadiense', de:'Kanadischer Dollar', fr:'Dollar canadien', it:'Dollaro canadese', pt:'Dólar canadense'} },
  AUD: { code:'AUD', symbol:'A$', after:false, name:{pl:'Dolar australijski',en:'Australian dollar', es:'Dólar australiano', de:'Australischer Dollar', fr:'Dollar australien', it:'Dollaro australiano', pt:'Dólar australiano'} },
  // v1.14.2 - Mexican peso for the growing es-MX userbase
  MXN: { code:'MXN', symbol:'$',  after:false, name:{pl:'Peso meksykańskie', en:'Mexican peso',     es:'Peso mexicano', de:'Mexikanischer Peso', fr:'Peso mexicain', it:'Peso messicano', pt:'Peso mexicano'} },
  CZK: { code:'CZK', symbol:'Kč', after:true,  name:{pl:'Korona czeska',     en:'Czech koruna',     es:'Corona checa', de:'Tschechische Krone', fr:'Couronne tchèque', it:'Corona ceca', pt:'Coroa tcheca'} },
  SEK: { code:'SEK', symbol:'kr', after:true,  name:{pl:'Korona szwedzka',   en:'Swedish krona',    es:'Corona sueca', de:'Schwedische Krone', fr:'Couronne suédoise', it:'Corona svedese', pt:'Coroa sueca'} },
  // v1.21.0 - Brazilian real for the Portuguese (Brazil) translation
  BRL: { code:'BRL', symbol:'R$', after:false, name:{pl:'Real brazylijski', en:'Brazilian real', es:'Real brasileño', de:'Brasilianischer Real', fr:'Réal brésilien', it:'Real brasiliano', pt:'Real brasileiro'} },
  NOK: { code:'NOK', symbol:'kr', after:true,  name:{pl:'Korona norweska',   en:'Norwegian krone',  es:'Corona noruega', de:'Norwegische Krone', fr:'Couronne norvégienne', it:'Corona norvegese', pt:'Coroa norueguesa'} },
};

// ─── Game source ──────────────────────────────────────────────────────────
// v1.14.0 - Where did the user get the game from? Drives cost-exclusion: subscription
// games (PS Plus, Game Pass, EA Play) shouldn't count toward "total spent" or
// cost-per-hour, since the user pays a flat monthly fee unrelated to the title.
// Only `owned` games contribute to financial KPIs and ROI math. Hours/genre/status
// stats include all sources (the game was still played, regardless of how it was
// acquired).
//
// Default for new + legacy games is 'owned' - see EF and lsRead migration.
// Order matters: the form dropdown renders in this sequence; `owned` first so the
// default is the top option.
export const SOURCES = ['owned', 'psplus', 'gamepass', 'eaplay', 'other_sub', 'other'];
// Subset that should be excluded from cost calculations. Anything not in this set
// (currently just 'owned') is treated as a paid-per-title acquisition.
export const COST_EXCLUDED_SOURCES = new Set(['psplus', 'gamepass', 'eaplay', 'other_sub', 'other']);
// Helper: returns true if the game's cost should count toward total spent / cph / ROI.
// Defensive against legacy games that pre-date the source field - null/undefined → owned.
export function isOwned(g) { return !COST_EXCLUDED_SOURCES.has(g?.source || 'owned'); }

// ─── Empty form ────────────────────────────────────────────────────────────
// Default shape for new game in the add-modal. priceSold:null is the canonical
// "not sold" state; priceBought defaults to '' (empty string) so users can leave
// it blank. abbr is auto-derived from title - never user-editable since v1.4.0.
// rawgId (v1.9.0) holds the RAWG.io game ID when the title was picked from
// RAWG search - used as the seed for /games/{id}/suggested in Recommendations.
// null for manually-entered or pre-v1.9 games (Recommendations skips those as seeds).
// v1.14.0 - added `source: 'owned'` (default for new games). Pre-v1.14 games loaded
// from localStorage have no source field; lsRead migration backfills them to 'owned'.
// v1.15.3 - added `preOrdered: false`. Set when user already paid for a game whose
// releaseDate is in the future. Distinguishes "watching upcoming" from "owned but not
// yet released" - visible in Releases tab as a 💳 badge + dedicated section. Field is
// orthogonal to `status` (which tracks play state) and to `source` (which tracks
// acquisition channel).
// v1.16.5 - `importSource` tags games imported via PSN/Steam/Xbox paste flows
// (null for manually-added games). Enables Settings → "Undo import" to delete a
// specific platform's batch without touching manual entries. Orthogonal to `source`
// (which tracks acquisition channel like 'owned'/'subscription'/'gift').
export const EF = { title:'', abbr:'', status:'planuje', year:new Date().getFullYear(), genre:'', hours:'', rating:'', notes:'', cover:'', releaseDate:'', notifyEnabled:false, priceBought:'', priceSold:null, storeBought:'', targetHours:'', extraSpend:'', platform:'PS5', source:'owned', preOrdered:false, platinum:false, lastPlayed:null, completedAt:null, rawgId:null, sessions:[], importSource:null };
