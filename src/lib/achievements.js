// v1.5.0 Achievements.
// Pure derivation from games[] + longestStreak. No persistence - recomputed on every render.
// Multi-tier achievements (Collector I/II/III) are separate entries - keeps logic flat
// and lets the UI show all tiers including locked ones in the grid.
// Title/desc strings for all 7 app languages (v1.21.2: es/de/fr/it/pt) live INSIDE the entries so this module is self-contained
// (no i18n.js import needed). Trade-off: editing labels means editing this file vs.
// the global TRANSLATIONS table - fine since it's a closed set of 19 entries.

export const ACHIEVEMENTS = [
  // Collector tiers
  { id:'collector_1',  ico:'🎮', tier:1, group:'collector',
    title:{pl:'Pierwsza krew',           en:'First Blood', es:"Primera sangre", de:"Erstes Blut", fr:"Premier sang", it:"Primo sangue", pt:"Primeiro sangue"},
    desc :{pl:'Dodaj pierwszą grę',      en:'Add your first game', es:"Añade tu primer juego", de:"Füge dein erstes Spiel hinzu", fr:"Ajoute ton premier jeu", it:"Aggiungi il tuo primo gioco", pt:"Adicione seu primeiro jogo"},
    threshold:1,    measure:({games})=>games.length },
  { id:'collector_2',  ico:'🎮', tier:2, group:'collector',
    title:{pl:'Kolekcjoner I',           en:'Collector I', es:"Coleccionista I", de:"Sammler I", fr:"Collectionneur I", it:"Collezionista I", pt:"Colecionador I"},
    desc :{pl:'10 gier w kolekcji',      en:'10 games in collection', es:"10 juegos en la colección", de:"10 Spiele in der Sammlung", fr:"10 jeux dans la collection", it:"10 giochi in collezione", pt:"10 jogos na coleção"},
    threshold:10,   measure:({games})=>games.length },
  { id:'collector_3',  ico:'🎮', tier:3, group:'collector',
    title:{pl:'Kolekcjoner II',          en:'Collector II', es:"Coleccionista II", de:"Sammler II", fr:"Collectionneur II", it:"Collezionista II", pt:"Colecionador II"},
    desc :{pl:'25 gier w kolekcji',      en:'25 games in collection', es:"25 juegos en la colección", de:"25 Spiele in der Sammlung", fr:"25 jeux dans la collection", it:"25 giochi in collezione", pt:"25 jogos na coleção"},
    threshold:25,   measure:({games})=>games.length },
  { id:'collector_4',  ico:'🎮', tier:4, group:'collector', rare:true,
    title:{pl:'Kolekcjoner III',         en:'Collector III', es:"Coleccionista III", de:"Sammler III", fr:"Collectionneur III", it:"Collezionista III", pt:"Colecionador III"},
    desc :{pl:'50 gier w kolekcji',      en:'50 games in collection', es:"50 juegos en la colección", de:"50 Spiele in der Sammlung", fr:"50 jeux dans la collection", it:"50 giochi in collezione", pt:"50 jogos na coleção"},
    threshold:50,   measure:({games})=>games.length },
  { id:'collector_5',  ico:'💎', tier:5, group:'collector', rare:true,
    title:{pl:'Hoarder',                 en:'Hoarder', es:"Acumulador", de:"Hamsterer", fr:"Accumulateur", it:"Accumulatore", pt:"Acumulador"},
    desc :{pl:'100 gier w kolekcji',     en:'100 games in collection', es:"100 juegos en la colección", de:"100 Spiele in der Sammlung", fr:"100 jeux dans la collection", it:"100 giochi in collezione", pt:"100 jogos na coleção"},
    threshold:100,  measure:({games})=>games.length },

  // Completionist tiers
  { id:'finisher_1',   ico:'✅',
    title:{pl:'Finiszer',                en:'Finisher', es:"Finalista", de:"Finisher", fr:"Finisseur", it:"Finisher", pt:"Finalizador"},
    desc :{pl:'Ukończ pierwszą grę',     en:'Complete your first game', es:"Termina tu primer juego", de:"Beende dein erstes Spiel", fr:"Termine ton premier jeu", it:"Finisci il tuo primo gioco", pt:"Zere seu primeiro jogo"},
    threshold:1,    measure:({games})=>games.filter(g=>g.status==='ukonczone').length },
  { id:'finisher_2',   ico:'✅',
    title:{pl:'Seryjny finiszer',        en:'Serial Finisher', es:"Finalista en serie", de:"Serien-Finisher", fr:"Finisseur en série", it:"Finisher seriale", pt:"Zerador em série"},
    desc :{pl:'Ukończ 10 gier',          en:'Complete 10 games', es:"Termina 10 juegos", de:"Beende 10 Spiele", fr:"Termine 10 jeux", it:"Finisci 10 giochi", pt:"Zere 10 jogos"},
    threshold:10,   measure:({games})=>games.filter(g=>g.status==='ukonczone').length },
  { id:'finisher_3',   ico:'🏁', rare:true,
    title:{pl:'Maraton',                 en:'Marathon', es:"Maratón", de:"Marathon", fr:"Marathon", it:"Maratona", pt:"Maratona"},
    desc :{pl:'Ukończ 25 gier',          en:'Complete 25 games', es:"Termina 25 juegos", de:"Beende 25 Spiele", fr:"Termine 25 jeux", it:"Finisci 25 giochi", pt:"Zere 25 jogos"},
    threshold:25,   measure:({games})=>games.filter(g=>g.status==='ukonczone').length },

  // Trophy hunting
  { id:'trophy_1',     ico:'🏆',
    title:{pl:'Łowca trofeów',           en:'Trophy Hunter', es:"Cazador de trofeos", de:"Trophäenjäger", fr:"Chasseur de trophées", it:"Cacciatore di trofei", pt:"Caçador de troféus"},
    desc :{pl:'Pierwsza platyna',        en:'First platinum', es:"Primer platino", de:"Erste Platin-Trophäe", fr:"Premier platine", it:"Primo platino", pt:"Primeira platina"},
    threshold:1,    measure:({games})=>games.filter(g=>g.platinum).length },
  { id:'trophy_2',     ico:'🏆',
    title:{pl:'Łowca trofeów II',        en:'Trophy Hunter II', es:"Cazador de trofeos II", de:"Trophäenjäger II", fr:"Chasseur de trophées II", it:"Cacciatore di trofei II", pt:"Caçador de troféus II"},
    desc :{pl:'5 platyn',                en:'5 platinums', es:"5 platinos", de:"5 Platin-Trophäen", fr:"5 platines", it:"5 platini", pt:"5 platinas"},
    threshold:5,    measure:({games})=>games.filter(g=>g.platinum).length },
  { id:'trophy_3',     ico:'👑', rare:true,
    title:{pl:'Platynowy król',          en:'Platinum King', es:"Rey del platino", de:"Platin-König", fr:"Roi du platine", it:"Re del platino", pt:"Rei da platina"},
    desc :{pl:'10 platyn',               en:'10 platinums', es:"10 platinos", de:"10 Platin-Trophäen", fr:"10 platines", it:"10 platini", pt:"10 platinas"},
    threshold:10,   measure:({games})=>games.filter(g=>g.platinum).length },

  // Hours
  { id:'marathoner',   ico:'⏱',
    title:{pl:'Maratończyk',             en:'Marathoner', es:"Maratoniano", de:"Marathonläufer", fr:"Marathonien", it:"Maratoneta", pt:"Maratonista"},
    desc :{pl:'100h w jednej grze',      en:'100h on a single game', es:"100 h en un solo juego", de:"100 h in einem Spiel", fr:"100 h sur un seul jeu", it:"100 h in un solo gioco", pt:"100 h em um só jogo"},
    threshold:100,  measure:({games})=>Math.floor(Math.max(0,...games.map(g=>+g.hours||0))) },
  { id:'sprinter',     ico:'💨',
    title:{pl:'Sprinter',                en:'Sprinter', es:"Velocista", de:"Sprinter", fr:"Sprinteur", it:"Velocista", pt:"Velocista"},
    desc :{pl:'Ukończ grę w ≤10h',       en:'Complete a game in ≤10h', es:"Termina un juego en ≤10 h", de:"Beende ein Spiel in ≤10 h", fr:"Termine un jeu en ≤10 h", it:"Finisci un gioco in ≤10 h", pt:"Zere um jogo em ≤10 h"},
    threshold:1,
    measure:({games})=>games.some(g=>g.status==='ukonczone' && +g.hours>0 && +g.hours<=10)?1:0 },

  // Critic
  { id:'critic_1',     ico:'⭐',
    title:{pl:'Krytyk',                  en:'Critic', es:"Crítico", de:"Kritiker", fr:"Critique", it:"Critico", pt:"Crítico"},
    desc :{pl:'Oceń 10 gier',            en:'Rate 10 games', es:"Puntúa 10 juegos", de:"Bewerte 10 Spiele", fr:"Note 10 jeux", it:"Valuta 10 giochi", pt:"Avalie 10 jogos"},
    threshold:10,   measure:({games})=>games.filter(g=>g.rating!=null && +g.rating>0).length },
  { id:'critic_2',     ico:'⭐',
    title:{pl:'Krytyk II',               en:'Critic II', es:"Crítico II", de:"Kritiker II", fr:"Critique II", it:"Critico II", pt:"Crítico II"},
    desc :{pl:'Oceń 25 gier',            en:'Rate 25 games', es:"Puntúa 25 juegos", de:"Bewerte 25 Spiele", fr:"Note 25 jeux", it:"Valuta 25 giochi", pt:"Avalie 25 jogos"},
    threshold:25,   measure:({games})=>games.filter(g=>g.rating!=null && +g.rating>0).length },

  // Streaks (from sessionsByDay → longestStreak passed in by caller)
  { id:'streak_7',     ico:'🔥',
    title:{pl:'Rozpędzony',              en:'On Fire', es:"En racha", de:"Im Flow", fr:"En feu", it:"In fiamme", pt:"Pegando fogo"},
    desc :{pl:'7-dniowa passa grania',   en:'7-day play streak', es:"Racha de 7 días jugando", de:"7 Tage am Stück gespielt", fr:"7 jours de jeu d’affilée", it:"7 giorni di gioco di fila", pt:"7 dias seguidos jogando"},
    threshold:7,    measure:({longestStreak})=>longestStreak },
  { id:'streak_30',    ico:'🔥', rare:true,
    title:{pl:'Niezniszczalny',          en:'Unstoppable', es:"Imparable", de:"Unaufhaltsam", fr:"Inarrêtable", it:"Inarrestabile", pt:"Imparável"},
    desc :{pl:'30-dniowa passa grania',  en:'30-day play streak', es:"Racha de 30 días jugando", de:"30 Tage am Stück gespielt", fr:"30 jours de jeu d’affilée", it:"30 giorni di gioco di fila", pt:"30 dias seguidos jogando"},
    threshold:30,   measure:({longestStreak})=>longestStreak },

  // Variety
  { id:'genre_hopper', ico:'🎨',
    title:{pl:'Wszystkożerny',           en:'Genre Hopper', es:"Todoterreno", de:"Genre-Hopper", fr:"Touche-à-tout", it:"Onnivoro", pt:"Eclético"},
    desc :{pl:'Gry w 5+ gatunkach',      en:'Games in 5+ genres', es:"Juegos de 5+ géneros", de:"Spiele aus 5+ Genres", fr:"Des jeux de 5+ genres", it:"Giochi di 5+ generi", pt:"Jogos de 5+ gêneros"},
    threshold:5,    measure:({games})=>new Set(games.map(g=>g.genre).filter(Boolean)).size },

  // Money
  { id:'reseller',     ico:'💰',
    title:{pl:'Handlarz',                en:'Reseller', es:"Revendedor", de:"Händler", fr:"Revendeur", it:"Rivenditore", pt:"Revendedor"},
    desc :{pl:'Sprzedaj 5 gier',         en:'Sell 5 games', es:"Vende 5 juegos", de:"Verkaufe 5 Spiele", fr:"Revends 5 jeux", it:"Vendi 5 giochi", pt:"Venda 5 jogos"},
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
