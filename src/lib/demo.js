// v1.7.0 demo data factory.
//
// Produces 5 realistic-looking games for first-time users. Generated relative to
// `now` (not hardcoded dates) so addedAt / lastPlayed / completedAt always show as
// recent regardless of when the demo is loaded. Every game carries `_demo:true` so
// Settings can selectively delete only the demos and leave user-added games alone.
//
// Composition (carefully chosen — see CHANGELOG-v1.7.0.md):
// - Status mix: 2× ukonczone, 2× gram, 1× planuje
// - Genres: Action, RPG, Sport, Action, Platformer (4 unique → motivates 5th for genre_hopper)
// - Hours: 0, 35, 50, 120, 200 (showcases all hour-formatting cases)
// - Ratings: null + 7,9,9,10 (one unrated → motivates Critic achievement)
// - Money: 80–330 (~1050 total to populate Finance tab)
// - Active days: rolling 5-day streak via FC + GTA recent sessions
// - Years: spans 2 calendar years → Year-in-Review picker has 2+ entries
// - Achievements unlocked: ~5 of 19 (collector_1, finisher_1, trophy_1, marathoner, sprinter)
// - rawgId set on 3 of 5 games (Spider-Man 2 / Elden Ring / GTA V) so the v1.10.0
//   demo onboarding can showcase Recommendations immediately. FC 25 + Crash 4 left
//   as null (their RAWG IDs are uncertain — better to skip than hardcode wrong ones
//   and waste cache slots on 404s). Three RAWG-id seeds is enough to populate both
//   tracks of Recommendations (top-rated: 9/10/9 ratings, completed: SP2 + ER).
//
// IDs are prefixed with 'demo_' so they're easy to spot in exports/devtools.
import { uid } from './util.js';

// Helper: ISO string for `now - days` (rounded to 12:00 local for stability)
function daysAgoISO(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}
function sessionAt(daysAgo, hour, hours) {
  const start = new Date();
  start.setDate(start.getDate() - daysAgo);
  start.setHours(hour, 0, 0, 0);
  const end = new Date(start.getTime() + hours * 3600 * 1000);
  return { startedAt: start.toISOString(), endedAt: end.toISOString(), hours };
}

export function makeDemoGames() {
  return [
    {
      id: 'demo_' + uid(),
      _demo: true,
      title: "Marvel's Spider-Man 2",
      abbr: 'SP',
      status: 'ukonczone',
      year: 2023,
      genre: 'Action',
      hours: 35,
      rating: 9,
      notes: '',
      cover: 'https://image.api.playstation.com/vulcan/ap/rnd/202306/1219/9aa416fbcb6c0bbe19eb732e29ee1d29bcf17ba8e7647c46.jpg',
      releaseDate: '2023-10-20',
      notifyEnabled: false,
      priceBought: 330, priceSold: null, storeBought: 'PS Store',
      targetHours: 30, extraSpend: '',
      platform: 'PS5', platinum: false,
      // v1.10.0 — RAWG ID for Recommendations seed. Verified against rawg.io public catalog.
      rawgId: 58175,
      lastPlayed: daysAgoISO(120),
      completedAt: daysAgoISO(120),
      addedAt: daysAgoISO(180),
      sessions: [
        sessionAt(180, 20, 2.5),
        sessionAt(165, 21, 3),
        sessionAt(150, 19, 2),
        sessionAt(135, 20, 4),
        sessionAt(125, 19, 3.5),
        sessionAt(120, 20, 2),
      ],
    },
    {
      id: 'demo_' + uid(),
      _demo: true,
      title: 'Elden Ring',
      abbr: 'ER',
      status: 'ukonczone',
      year: 2022,
      genre: 'RPG',
      hours: 120,
      rating: 10,
      notes: '',
      cover: 'https://image.api.playstation.com/vulcan/ap/rnd/202110/2000/aGgJYcgvAJiZGWVFWbvkwAVx.png',
      releaseDate: '2022-02-25',
      notifyEnabled: false,
      priceBought: 240, priceSold: null, storeBought: 'PS Store',
      targetHours: 80, extraSpend: 100,
      platform: 'PS5', platinum: true,
      rawgId: 326243,
      lastPlayed: daysAgoISO(60),
      completedAt: daysAgoISO(60),
      addedAt: daysAgoISO(330),
      sessions: [
        sessionAt(330, 20, 3),
        sessionAt(310, 21, 4),
        sessionAt(280, 19, 5),
        sessionAt(250, 20, 6),
        sessionAt(220, 21, 4.5),
        sessionAt(180, 19, 3),
        sessionAt(120, 20, 5),
        sessionAt(90,  19, 4),
        sessionAt(75,  20, 3.5),
        sessionAt(60,  21, 4),
      ],
    },
    {
      id: 'demo_' + uid(),
      _demo: true,
      title: 'EA SPORTS FC 25',
      abbr: 'FC',
      status: 'gram',
      year: 2024,
      genre: 'Sport',
      hours: 50,
      rating: 7,
      notes: '',
      cover: 'https://image.api.playstation.com/vulcan/ap/rnd/202407/2415/4d5cd9d2e9ae27f628d10410d9cacd4d4f50b39a99c5e7e0.png',
      releaseDate: '2024-09-27',
      notifyEnabled: false,
      priceBought: 280, priceSold: null, storeBought: 'PS Store',
      targetHours: 0, extraSpend: '',
      platform: 'PS5', platinum: false,
      lastPlayed: daysAgoISO(2),
      completedAt: null,
      addedAt: daysAgoISO(240),
      sessions: [
        sessionAt(240, 20, 2),
        sessionAt(200, 21, 1.5),
        sessionAt(150, 19, 2),
        sessionAt(100, 20, 1.5),
        sessionAt(60,  21, 2),
        sessionAt(30,  19, 1.5),
        sessionAt(10,  20, 1.5),
        sessionAt(5,   21, 2),
        sessionAt(4,   20, 1.5),
        sessionAt(2,   19, 2),
      ],
    },
    {
      id: 'demo_' + uid(),
      _demo: true,
      title: 'Grand Theft Auto V',
      abbr: 'GT',
      status: 'gram',
      year: 2014,
      genre: 'Action',
      hours: 200,
      rating: 9,
      notes: '',
      cover: 'https://image.api.playstation.com/vulcan/ap/rnd/202403/0506/b2ddf0c9e6dad65b54d2d49c90e5b8c739cb0e1dbf67c5c9.png',
      releaseDate: '2022-03-15',
      notifyEnabled: false,
      priceBought: 80, priceSold: null, storeBought: 'PS Store',
      targetHours: 0, extraSpend: 60,
      platform: 'PS5', platinum: false,
      rawgId: 3328,
      lastPlayed: daysAgoISO(1),
      completedAt: null,
      addedAt: daysAgoISO(540),
      sessions: [
        sessionAt(540, 20, 4),
        sessionAt(500, 21, 5),
        sessionAt(450, 19, 6),
        sessionAt(380, 20, 4),
        sessionAt(300, 21, 5),
        sessionAt(220, 19, 3.5),
        sessionAt(150, 20, 4),
        sessionAt(80,  21, 5),
        sessionAt(40,  19, 4.5),
        sessionAt(20,  20, 3),
        sessionAt(6,   21, 3.5),
        sessionAt(3,   20, 2.5),
        sessionAt(1,   21, 3),
      ],
    },
    {
      id: 'demo_' + uid(),
      _demo: true,
      title: "Crash Bandicoot 4: It's About Time",
      abbr: 'CR',
      status: 'planuje',
      year: 2020,
      genre: 'Platformer',
      hours: 0,
      rating: null,
      notes: '',
      cover: 'https://image.api.playstation.com/vulcan/ap/rnd/202008/0402/yHzZ1lQM6rkz2N4DcGJiv1TT.png',
      releaseDate: '2020-10-02',
      notifyEnabled: false,
      priceBought: 120, priceSold: null, storeBought: 'Allegro',
      targetHours: 15, extraSpend: '',
      platform: 'PS5', platinum: false,
      lastPlayed: null,
      completedAt: null,
      addedAt: daysAgoISO(7),
      sessions: [],
    },
  ];
}

// Returns true if the games array contains at least one demo entry.
export function hasDemoGames(games) {
  return Array.isArray(games) && games.some(g => g && g._demo === true);
}

// Returns games array with all _demo:true entries removed.
export function removeDemoGames(games) {
  return (games || []).filter(g => !(g && g._demo === true));
}
