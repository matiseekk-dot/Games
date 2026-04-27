// v1.5.0 Achievements.
// Pure derivation from games[] + longestStreak. No persistence — recomputed on every render.
// Multi-tier achievements (Collector I/II/III) are separate entries — keeps logic flat
// and lets the UI show all tiers including locked ones in the grid.
// Bilingual title/desc strings live INSIDE the entries so this module is self-contained
// (no i18n.js import needed). Trade-off: editing labels means editing this file vs.
// the global TRANSLATIONS table — fine since it's a closed set of 19 entries.

export const ACHIEVEMENTS = [
  // Collector tiers
  { id:'collector_1',  ico:'🎮', tier:1, group:'collector',
    title:{pl:'Pierwsza krew',           en:'First Blood'},
    desc :{pl:'Dodaj pierwszą grę',      en:'Add your first game'},
    threshold:1,    measure:({games})=>games.length },
  { id:'collector_2',  ico:'🎮', tier:2, group:'collector',
    title:{pl:'Kolekcjoner I',           en:'Collector I'},
    desc :{pl:'10 gier w kolekcji',      en:'10 games in collection'},
    threshold:10,   measure:({games})=>games.length },
  { id:'collector_3',  ico:'🎮', tier:3, group:'collector',
    title:{pl:'Kolekcjoner II',          en:'Collector II'},
    desc :{pl:'25 gier w kolekcji',      en:'25 games in collection'},
    threshold:25,   measure:({games})=>games.length },
  { id:'collector_4',  ico:'🎮', tier:4, group:'collector', rare:true,
    title:{pl:'Kolekcjoner III',         en:'Collector III'},
    desc :{pl:'50 gier w kolekcji',      en:'50 games in collection'},
    threshold:50,   measure:({games})=>games.length },
  { id:'collector_5',  ico:'💎', tier:5, group:'collector', rare:true,
    title:{pl:'Hoarder',                 en:'Hoarder'},
    desc :{pl:'100 gier w kolekcji',     en:'100 games in collection'},
    threshold:100,  measure:({games})=>games.length },

  // Completionist tiers
  { id:'finisher_1',   ico:'✅',
    title:{pl:'Finiszer',                en:'Finisher'},
    desc :{pl:'Ukończ pierwszą grę',     en:'Complete your first game'},
    threshold:1,    measure:({games})=>games.filter(g=>g.status==='ukonczone').length },
  { id:'finisher_2',   ico:'✅',
    title:{pl:'Seryjny finiszer',        en:'Serial Finisher'},
    desc :{pl:'Ukończ 10 gier',          en:'Complete 10 games'},
    threshold:10,   measure:({games})=>games.filter(g=>g.status==='ukonczone').length },
  { id:'finisher_3',   ico:'🏁', rare:true,
    title:{pl:'Maraton',                 en:'Marathon'},
    desc :{pl:'Ukończ 25 gier',          en:'Complete 25 games'},
    threshold:25,   measure:({games})=>games.filter(g=>g.status==='ukonczone').length },

  // Trophy hunting
  { id:'trophy_1',     ico:'🏆',
    title:{pl:'Łowca trofeów',           en:'Trophy Hunter'},
    desc :{pl:'Pierwsza platyna',        en:'First platinum'},
    threshold:1,    measure:({games})=>games.filter(g=>g.platinum).length },
  { id:'trophy_2',     ico:'🏆',
    title:{pl:'Łowca trofeów II',        en:'Trophy Hunter II'},
    desc :{pl:'5 platyn',                en:'5 platinums'},
    threshold:5,    measure:({games})=>games.filter(g=>g.platinum).length },
  { id:'trophy_3',     ico:'👑', rare:true,
    title:{pl:'Platynowy król',          en:'Platinum King'},
    desc :{pl:'10 platyn',               en:'10 platinums'},
    threshold:10,   measure:({games})=>games.filter(g=>g.platinum).length },

  // Hours
  { id:'marathoner',   ico:'⏱',
    title:{pl:'Maratończyk',             en:'Marathoner'},
    desc :{pl:'100h w jednej grze',      en:'100h on a single game'},
    threshold:100,  measure:({games})=>Math.floor(Math.max(0,...games.map(g=>+g.hours||0))) },
  { id:'sprinter',     ico:'💨',
    title:{pl:'Sprinter',                en:'Sprinter'},
    desc :{pl:'Ukończ grę w ≤10h',       en:'Complete a game in ≤10h'},
    threshold:1,
    measure:({games})=>games.some(g=>g.status==='ukonczone' && +g.hours>0 && +g.hours<=10)?1:0 },

  // Critic
  { id:'critic_1',     ico:'⭐',
    title:{pl:'Krytyk',                  en:'Critic'},
    desc :{pl:'Oceń 10 gier',            en:'Rate 10 games'},
    threshold:10,   measure:({games})=>games.filter(g=>g.rating!=null && +g.rating>0).length },
  { id:'critic_2',     ico:'⭐',
    title:{pl:'Krytyk II',               en:'Critic II'},
    desc :{pl:'Oceń 25 gier',            en:'Rate 25 games'},
    threshold:25,   measure:({games})=>games.filter(g=>g.rating!=null && +g.rating>0).length },

  // Streaks (from sessionsByDay → longestStreak passed in by caller)
  { id:'streak_7',     ico:'🔥',
    title:{pl:'Rozpędzony',              en:'On Fire'},
    desc :{pl:'7-dniowa passa grania',   en:'7-day play streak'},
    threshold:7,    measure:({longestStreak})=>longestStreak },
  { id:'streak_30',    ico:'🔥', rare:true,
    title:{pl:'Niezniszczalny',          en:'Unstoppable'},
    desc :{pl:'30-dniowa passa grania',  en:'30-day play streak'},
    threshold:30,   measure:({longestStreak})=>longestStreak },

  // Variety
  { id:'genre_hopper', ico:'🎨',
    title:{pl:'Wszystkożerny',           en:'Genre Hopper'},
    desc :{pl:'Gry w 5+ gatunkach',      en:'Games in 5+ genres'},
    threshold:5,    measure:({games})=>new Set(games.map(g=>g.genre).filter(Boolean)).size },

  // Money
  { id:'reseller',     ico:'💰',
    title:{pl:'Handlarz',                en:'Reseller'},
    desc :{pl:'Sprzedaj 5 gier',         en:'Sell 5 games'},
    threshold:5,    measure:({games})=>games.filter(g=>g.priceSold!=null && +g.priceSold>0).length },
];

// Computes per-achievement state. Returns array of { ...def, progress, unlocked, pct }.
export function computeAchievements(games, longestStreak) {
  return ACHIEVEMENTS.map(a => {
    const progress = Math.max(0, Math.floor(a.measure({ games, longestStreak })));
    const unlocked = progress >= a.threshold;
    const pct = Math.min(100, Math.round((progress / a.threshold) * 100));
    return { ...a, progress, unlocked, pct };
  });
}

// v1.7.0: Returns Set<id> of currently-unlocked achievements. Lighter than
// computeAchievements when you only need the unlocked set for diffing (banner).
export function unlockedAchievementIds(games, longestStreak) {
  const out = new Set();
  for (const a of ACHIEVEMENTS) {
    const progress = Math.max(0, Math.floor(a.measure({ games, longestStreak })));
    if (progress >= a.threshold) out.add(a.id);
  }
  return out;
}

// v1.7.0: Look up an achievement definition by ID. Used by AchievementBanner to
// render title/desc for newly-unlocked achievements without re-running compute.
export function getAchievementById(id) {
  return ACHIEVEMENTS.find(a => a.id === id) || null;
}
