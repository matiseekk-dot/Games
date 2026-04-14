import { useState, useEffect, useRef, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const RAWG_KEY   = '0c13edec026d489a97cc183170d796fd';
const APP_VER    = '1.0.0';
const LS_KEY     = 'ps5vault_v1';
const LS_ONBOARD = 'ps5vault_onboarded';
const LS_LANG    = 'ps5vault_lang';

// ─── i18n ────────────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  pl: {
    gram:"Gram", psplus:"PS Plus", ukonczone:"Ukończone", planuje:"Planuję", porzucone:"Porzucone",
    home:"🏠 Home", collection:"🎮 Gry", releases:"📅 Premiery", stats:"📊 Statsy", settings:"⚙️ Opcje",
    goodMorning:"🌅 Dzień dobry", goodAfternoon:"🎮 Cześć!", goodEvening:"🌆 Dobry wieczór", goodNight:"🌙 Dobranoc",
    gamesInCollection:"gier", active:"aktywnych", upcomingReleases:"premier",
    continuePlay:"Kontynuuj granie", whatToPlay:"Co teraz grać", nextRelease:"Najbliższa premiera",
    financeInsight:"Finansowy insight", backlog:"BACKLOG",
    noActiveGame:"Nie grasz teraz w żadną grę.", changeStatusHint:"Zmień status gry na Gram",
    startPlaying:"▶ Zacznij grać", completed:"ukończone", remaining:"pozostało",
    addTargetHint:"Dodaj cel godzinowy żeby śledzić postęp",
    moreActive:"+{n} innych aktywnych gier",
    genreReason:"Lubisz {genre} — masz {n} ukończone w tym gatunku",
    backlogReason:"Czeka najdłużej w backlogu",
    releaseToday:"Premiera dzisiaj!", releaseTomorrow:"Jutro!",
    daysToRelease:"dni do premiery", dayToRelease:"dzień do premiery",
    details:"📋 Szczegóły", remind:"🔔 Przypomnij", addToCollection:"+ Edytuj",
    spentTotal:"Wydano łącznie", recovered:"Odzyskano ze sprzedaży", realCost:"Realny koszt kolekcji",
    sellSuggestion:"💡 Sprzedaj {title} i odzyskaj ~{amount}",
    searchPlaceholder:"Szukaj gry...", allGames:"Wszystkie",
    noGames:"Brak gier", noResults:"Brak wyników", addFirst:"Naciśnij + żeby dodać grę.",
    noResultsFor:"Brak gier dla {q}",
    addGame:"+ DODAJ GRĘ",
    export:"⬆ Export", import:"⬇ Import",
    upcoming:"Nadchodzące premiery", alreadyOut:"📦 Już dostępne", tba:"TBA — brak daty",
    noReleases:"Brak nadchodzących premier",
    noReleasesHint:"Dodaj datę premiery do gier ze statusem Planuję.",
    today:"DZIŚ!", out:"✓ Wyszło", premiere:"Premiera:",
    edit:"📋 Edytuj", watch:"👀 Obserwuj", buy:"🛒 Kup", addToColl:"+ Edytuj",
    notifyToggle:"🔔 Powiadomienie o premierze",
    enableNotif:"Włącz powiadomienia", enableNotifDesc:"Alert 3 dni przed premierą i w dniu wydania",
    enable:"Włącz",
    general:"🎮 Ogólne", finance:"💰 Finanse", analysis:"💡 Analiza",
    gamesTotal:"Gier razem", completed2:"Ukończone", hoursTotal:"Godzin łącznie", avgRating:"Śr. ocena",
    statusChart:"📊 Status kolekcji", genreChart:"🎮 Top gatunki", ratingChart:"⭐ Histogram ocen",
    noFinanceData:"Brak danych finansowych", addPricesHint:"Dodaj ceny kupna do gier",
    spent:"Wydano", earnedBack:"Odzyskano", realCostShort:"Realny koszt", costPerHour:"Koszt/godzinę",
    byStore:"🏪 Wydatki wg sklepu", byGenre:"🎮 Wydatki wg gatunku",
    roi:"📈 ROI sprzedanych", mostExpensive:"💸 Najdroższe gry", bestValue:"⏱ Najlepsza wartość (zł/h)",
    noInsights:"Za mało danych", addPricesAndHours:"Dodaj ceny i godziny do gier",
    potentialSaving:"💡 Potencjalna oszczędność",
    savingsFrom:"z unikniętych strat", savingsFromSell:"z odsprzedaży porzuconych gier",
    clickCards:"Kliknij karty poniżej żeby dowiedzieć się jak",
    biggestLoss:"Największa strata", bestInvestment:"Najlepsza inwestycja",
    mostExpensiveHours:"Najdroższe godziny", bestValueShort:"Najlepsza wartość",
    financeSummary:"Podsumowanie finansowe",
    biggestLossDesc:"Sprzedając {title} straciłeś {amount}",
    bestInvestDesc:"{title} przyniosło {amount} zysku",
    expHoursDesc:"{title} — {cph} zł/h. Powyżej 10 zł/h to słaba wartość.",
    bestValDesc:"{title} — tylko {cph} zł/h. Twoja najlepsza inwestycja.",
    finSummaryDesc:"Wydałeś {spent}, odzyskałeś {earned}. Realny koszt to {net}.",
    data:"Dane", exportData:"Eksportuj dane", exportDesc:"Pobierz backup {n} gier jako JSON",
    importData:"Importuj dane", importDesc:"Wczytaj backup z pliku JSON",
    info:"Informacje", privacyPolicy:"Polityka prywatności", privacyDesc:"Nie zbieramy żadnych danych osobowych",
    poweredBy:"Powered by RAWG.io", poweredByDesc:"Baza ponad 800 000 gier",
    appInfo:"PS5 Vault", appInfoDesc:"Wersja {ver} — Dane przechowywane lokalnie",
    language:"Język / Language", dangerZone:"Niebezpieczna strefa",
    clearCollection:"Wyczyść kolekcję", clearDesc:"Usuń wszystkie {n} gier",
    clearConfirm:"Usunąć wszystkie {n} gier? Tej operacji nie można cofnąć.",
    addGameTitle:"+ DODAJ GRĘ", editGameTitle:"✎ EDYTUJ GRĘ",
    searchRawg:"🔍 Szukaj w RAWG", rawgPlaceholder:"Wpisz nazwę gry...",
    rawgHint:"Wybierz grę żeby auto-uzupełnić pola + datę premiery",
    titleField:"Tytuł *", abbrField:"Skrót (2 lit.)", yearField:"Rok",
    releaseDateField:"Data premiery", releaseDateHint:"Zostaw puste jeśli nieznana (TBA)",
    statusField:"Status", genreField:"Gatunek", hoursField:"Godziny",
    ratingField:"Ocena (1–10)", targetHoursField:"Cel (godz.)", notesField:"Notatki",
    notesPh:"Twoje przemyślenia...", genrePh:"— wybierz —", targetPh:"np. 40",
    finances:"💰 Finanse", priceBoughtField:"Zapłacono (PLN)", storeField:"Sklep",
    storePh:"—", soldToggle:"Sprzedałem tę grę", soldPriceField:"Sprzedano za (PLN)",
    notifications:"Powiadomienia", notifyOn:"🔔 Powiadamiaj o premierze",
    notifyDesc:"3 dni przed i w dniu premiery", notifyBlocked:"⛔ Zablokowane w ustawieniach przeglądarki",
    cancel:"Anuluj", save:"ZAPISZ", enterTitle:"Wpisz tytuł",
    delete:"🗑", confirmDelete:"Usuń grę", confirmDeleteBody:"Czy na pewno chcesz usunąć {title} z kolekcji?",
    obTitle:"PS5 VAULT", obSub:"Twój osobisty tracker gier PlayStation 5. Zero rejestracji — wszystko lokalnie na urządzeniu.",
    obStart:"ZACZYNAMY →",
    obF1Title:"Kolekcja gier", obF1Desc:"Dodaj grę ręcznie lub wyszukaj przez bazę RAWG z okładkami",
    obF2Title:"Śledzenie premier", obF2Desc:"Countdown do premiery + powiadomienia 3 dni wcześniej",
    obF3Title:"Analiza finansowa", obF3Desc:"Ile wydajesz, ile odzyskujesz — realny koszt kolekcji",
    obF4Title:"Statystyki", obF4Desc:"Wykresy, oceny, koszt/godzinę i inteligentna analiza",
    saved:"✓ Zapisano", added:"✓ Dodano", deleted:"✓ Usunięto {title}",
    imported:"✓ Zaimportowano {n} gier", cleared:"ℹ Kolekcja wyczyszczona",
    statusChanged:"✓ Status → {status}",
    avoidLoss:"🔍 Unikaj takich strat", buyBetter:"📋 Kup podobne gry",
    optimizeBacklog:"⚡ Zoptymalizuj backlog", findSimilar:"🎯 Znajdź podobne gry", saveMoney:"💡 Jak oszczędzić więcej",
    flowAvoidTitle:"Jak uniknąć strat", flowInvestTitle:"Strategie dobrego zakupu",
    flowOptimTitle:"Optymalizacja backlogu", flowSimilarTitle:"Jak znaleźć podobne gry",
    flowSaveTitle:"Plan oszczędności",
    iUnderstand:"ROZUMIEM",
    hoursPlayed:"{n}h zagranych",
    progComplete:"{n}% ukończone",
  },
  en: {
    gram:"Playing", psplus:"PS Plus", ukonczone:"Completed", planuje:"Planning", porzucone:"Abandoned",
    home:"🏠 Home", collection:"🎮 Games", releases:"📅 Releases", stats:"📊 Stats", settings:"⚙️ Settings",
    goodMorning:"🌅 Good morning", goodAfternoon:"🎮 Hey!", goodEvening:"🌆 Good evening", goodNight:"🌙 Good night",
    gamesInCollection:"games", active:"active", upcomingReleases:"releases",
    continuePlay:"Continue playing", whatToPlay:"What to play next", nextRelease:"Upcoming release",
    financeInsight:"Financial insight", backlog:"BACKLOG",
    noActiveGame:"Not playing anything right now.", changeStatusHint:"Set a game status to Playing",
    startPlaying:"▶ Start playing", completed:"complete", remaining:"left",
    addTargetHint:"Add a target hours goal to track progress",
    moreActive:"+{n} more active games",
    genreReason:"You like {genre} — {n} completed in this genre",
    backlogReason:"Waiting longest in backlog",
    releaseToday:"Releases today!", releaseTomorrow:"Tomorrow!",
    daysToRelease:"days to release", dayToRelease:"day to release",
    details:"📋 Details", remind:"🔔 Remind me", addToCollection:"+ Edit",
    spentTotal:"Total spent", recovered:"Recovered from sales", realCost:"Real collection cost",
    sellSuggestion:"💡 Sell {title} and recover ~{amount}",
    searchPlaceholder:"Search games...", allGames:"All",
    noGames:"No games", noResults:"No results", addFirst:"Tap + to add your first game.",
    noResultsFor:"No games for {q}",
    addGame:"+ ADD GAME",
    export:"⬆ Export", import:"⬇ Import",
    upcoming:"Upcoming releases", alreadyOut:"📦 Already out", tba:"TBA — no date",
    noReleases:"No upcoming releases",
    noReleasesHint:"Add a release date to games with status Planning.",
    today:"TODAY!", out:"✓ Out", premiere:"Released:",
    edit:"📋 Edit", watch:"👀 Watch", buy:"🛒 Buy", addToColl:"+ Edit",
    notifyToggle:"🔔 Notify on release",
    enableNotif:"Enable notifications", enableNotifDesc:"Alert 3 days before and on release day",
    enable:"Enable",
    general:"🎮 General", finance:"💰 Finance", analysis:"💡 Analysis",
    gamesTotal:"Total games", completed2:"Completed", hoursTotal:"Total hours", avgRating:"Avg rating",
    statusChart:"📊 Collection status", genreChart:"🎮 Top genres", ratingChart:"⭐ Rating histogram",
    noFinanceData:"No financial data", addPricesHint:"Add purchase prices to games",
    spent:"Spent", earnedBack:"Recovered", realCostShort:"Real cost", costPerHour:"Cost/hour",
    byStore:"🏪 Spending by store", byGenre:"🎮 Spending by genre",
    roi:"📈 ROI on sold games", mostExpensive:"💸 Most expensive", bestValue:"⏱ Best value ($/h)",
    noInsights:"Not enough data", addPricesAndHours:"Add prices and hours to games",
    potentialSaving:"💡 Potential savings",
    savingsFrom:"from avoided losses", savingsFromSell:"from selling abandoned games",
    clickCards:"Click cards below to learn how",
    biggestLoss:"Biggest loss", bestInvestment:"Best investment",
    mostExpensiveHours:"Most expensive hours", bestValueShort:"Best value",
    financeSummary:"Financial summary",
    biggestLossDesc:"Selling {title} lost you {amount}",
    bestInvestDesc:"{title} earned {amount} profit",
    expHoursDesc:"{title} — {cph}/h. Above $10/h is poor value.",
    bestValDesc:"{title} — only {cph}/h. Your best investment.",
    finSummaryDesc:"Spent {spent}, recovered {earned}. Real cost is {net}.",
    data:"Data", exportData:"Export data", exportDesc:"Download backup of {n} games as JSON",
    importData:"Import data", importDesc:"Load backup from JSON file",
    info:"Info", privacyPolicy:"Privacy policy", privacyDesc:"We collect no personal data",
    poweredBy:"Powered by RAWG.io", poweredByDesc:"Database of 800,000+ games",
    appInfo:"PS5 Vault", appInfoDesc:"Version {ver} — Data stored locally",
    language:"Język / Language", dangerZone:"Danger zone",
    clearCollection:"Clear collection", clearDesc:"Delete all {n} games",
    clearConfirm:"Delete all {n} games? This cannot be undone.",
    addGameTitle:"+ ADD GAME", editGameTitle:"✎ EDIT GAME",
    searchRawg:"🔍 Search RAWG", rawgPlaceholder:"Type game name...",
    rawgHint:"Select a game to auto-fill fields + release date",
    titleField:"Title *", abbrField:"Abbr (2 chars)", yearField:"Year",
    releaseDateField:"Release date", releaseDateHint:"Leave empty if unknown (TBA)",
    statusField:"Status", genreField:"Genre", hoursField:"Hours",
    ratingField:"Rating (1–10)", targetHoursField:"Target (hrs)", notesField:"Notes",
    notesPh:"Your thoughts...", genrePh:"— select —", targetPh:"e.g. 40",
    finances:"💰 Finances", priceBoughtField:"Price paid", storeField:"Store",
    storePh:"—", soldToggle:"I sold this game", soldPriceField:"Sold for",
    notifications:"Notifications", notifyOn:"🔔 Notify on release",
    notifyDesc:"3 days before and on release day", notifyBlocked:"⛔ Blocked in browser settings",
    cancel:"Cancel", save:"SAVE", enterTitle:"Enter title",
    delete:"🗑", confirmDelete:"Delete game", confirmDeleteBody:"Delete {title} from collection?",
    obTitle:"PS5 VAULT", obSub:"Your personal PS5 game tracker. No registration — everything stored locally on device.",
    obStart:"GET STARTED →",
    obF1Title:"Game collection", obF1Desc:"Add manually or search RAWG database with cover art",
    obF2Title:"Release tracking", obF2Desc:"Countdown + notifications 3 days before release",
    obF3Title:"Financial analysis", obF3Desc:"Track spending, recovery — real collection cost",
    obF4Title:"Statistics", obF4Desc:"Charts, ratings, cost/hour and smart insights",
    saved:"✓ Saved", added:"✓ Added", deleted:"✓ Deleted {title}",
    imported:"✓ Imported {n} games", cleared:"ℹ Collection cleared",
    statusChanged:"✓ Status → {status}",
    avoidLoss:"🔍 Avoid such losses", buyBetter:"📋 Find similar games",
    optimizeBacklog:"⚡ Optimize backlog", findSimilar:"🎯 Find similar games", saveMoney:"💡 How to save more",
    flowAvoidTitle:"How to avoid losses", flowInvestTitle:"Smart buying strategies",
    flowOptimTitle:"Optimize your backlog", flowSimilarTitle:"How to find similar games",
    flowSaveTitle:"Savings plan",
    iUnderstand:"GOT IT",
    hoursPlayed:"{n}h played",
    progComplete:"{n}% complete",
  }
};

// ─── TRANSLATION HELPER ───────────────────────────────────────────────────────
function t(lang, key, vars={}) {
  let str = TRANSLATIONS[lang]?.[key] || TRANSLATIONS.pl[key] || key;
  Object.entries(vars).forEach(([k,v]) => { str = str.replace(`{${k}}`, v); });
  return str;
}

function getLang() {
  const saved = localStorage.getItem(LS_LANG);
  if (saved) return saved;
  return navigator.language?.startsWith('pl') ? 'pl' : 'en';
}

// ─── STATUS MAP (dynamic) ─────────────────────────────────────────────────────
function getSM(lang) {
  return {
    gram:      { label:t(lang,'gram'),      c:'#00D4FF', bg:'rgba(0,212,255,.13)' },
    psplus:    { label:t(lang,'psplus'),    c:'#FFD166', bg:'rgba(255,209,102,.13)' },
    ukonczone: { label:t(lang,'ukonczone'), c:'#39FF6E', bg:'rgba(57,255,110,.13)' },
    planuje:   { label:t(lang,'planuje'),   c:'#A78BFA', bg:'rgba(167,139,250,.13)' },
    porzucone: { label:t(lang,'porzucone'), c:'#FF4D6D', bg:'rgba(255,77,109,.13)' },
  };
}

const GENRES_PL = ['Action','RPG','FPS','Horror','Sport','Racing','Platformer','Puzzle','Adventure','Strategia','Fighting','Indie','Inne'];
const GENRES_EN = ['Action','RPG','FPS','Horror','Sports','Racing','Platformer','Puzzle','Adventure','Strategy','Fighting','Indie','Other'];
const RMAP = {'action':'Action','role-playing-games-rpg':'RPG','shooter':'FPS','horror':'Horror','sports':'Sport','racing':'Racing','platformer':'Platformer','puzzle':'Puzzle','adventure':'Adventure','strategy':'Strategia','fighting':'Fighting','indie':'Indie'};
const STORES = ['PSN','Disc','CDP','Media Expert','Allegro','OLX','Key','Other'];
const G = { bg:'#080B14', card:'#0D1120', card2:'#111827', bdr:'#1E2A42', txt:'#E8EDF8', dim:'#5A6A8A', blu:'#00D4FF', grn:'#39FF6E', pur:'#A78BFA', red:'#FF4D6D', gld:'#FFD166', org:'#FF9F1C' };

function uid()    { return 'g'+Date.now().toString(36)+Math.random().toString(36).slice(2,5); }
function mkAbbr(s){ const w=s.trim().split(/\s+/).filter(Boolean); return !w.length?'??':(w.length===1?w[0].slice(0,2):w[0][0]+w[1][0]).toUpperCase(); }
function daysUntil(d){ if(!d)return null; const a=new Date();a.setHours(0,0,0,0);const b=new Date(d);b.setHours(0,0,0,0);return Math.round((b-a)/86400000); }
function fmtDate(d,lang){ if(!d)return''; return new Date(d).toLocaleDateString(lang==='en'?'en-GB':'pl-PL',{day:'numeric',month:'short',year:'numeric'}); }
function fmtShort(d,lang){ if(!d)return''; return new Date(d).toLocaleDateString(lang==='en'?'en-GB':'pl-PL',{day:'numeric',month:'short'}); }
function pln(v,lang){ return lang==='en'?`$${(+v||0).toFixed(0)}`:`${(+v||0).toFixed(0)} zł`; }

const EF = { title:'',abbr:'',status:'planuje',year:new Date().getFullYear(),genre:'',hours:'',rating:'',notes:'',cover:'',releaseDate:'',notifyEnabled:false,priceBought:'',priceSold:'',storeBought:'',targetHours:'' };

function lsRead()  { try{ return JSON.parse(localStorage.getItem(LS_KEY)||'[]'); }catch{ return []; } }
function lsWrite(g){ try{ localStorage.setItem(LS_KEY,JSON.stringify(g)); }catch{} }
function isOnboarded(){ return !!localStorage.getItem(LS_ONBOARD); }
function setOnboarded(){ localStorage.setItem(LS_ONBOARD,'1'); }

function exportData(games,lang){
  const blob=new Blob([JSON.stringify({version:1,exported:new Date().toISOString(),count:games.length,games},null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download=`ps5vault-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();
}
function importData(file,onOk,onErr){
  const r=new FileReader();
  r.onload=e=>{try{const d=JSON.parse(e.target.result);const g=Array.isArray(d)?d:d.games;if(!Array.isArray(g))throw new Error('Invalid format');onOk(g);}catch(e){onErr(e.message);}};
  r.readAsText(file);
}
async function registerSW(){ if(!('serviceWorker'in navigator))return;try{await navigator.serviceWorker.register('/Games/sw.js');}catch{} }
async function requestNotifPerm(){ if(!('Notification'in window))return'denied';if(Notification.permission!=='default')return Notification.permission;return await Notification.requestPermission(); }
async function checkReleases(games){ if(!('serviceWorker'in navigator))return;try{const reg=await navigator.serviceWorker.ready;reg.active?.postMessage({type:'CHECK_RELEASES',games});}catch{} }
async function rawgSearch(q){
  try{
    const r=await fetch(`https://api.rawg.io/api/games?search=${encodeURIComponent(q)}&page_size=6&key=${RAWG_KEY}`);
    if(!r.ok)return[];
    return(await r.json()).results.map(g=>({id:g.id,title:g.name,year:g.released?+g.released.slice(0,4):new Date().getFullYear(),releaseDate:g.released||'',genre:(g.genres||[]).map(x=>RMAP[x.slug]).filter(Boolean)[0]||g.genres?.[0]?.name||'',cover:g.background_image||'',abbr:mkAbbr(g.name)}));
  }catch{return[];}
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Syne:wght@400;600;700&display=swap');
@keyframes spin    { to{transform:rotate(360deg)} }
@keyframes pulse   { 0%,100%{opacity:1}50%{opacity:.4} }
@keyframes slideUp { from{transform:translateY(100%)}to{transform:translateY(0)} }
@keyframes fadeIn  { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }
@keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)} }
@keyframes scaleIn { from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)} }
@keyframes shake   { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
@keyframes tabSlide{ from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:translateX(0)} }

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html{-webkit-text-size-adjust:100%;overflow-x:hidden;max-width:100%}
body{overflow-x:hidden;max-width:100%;background:${G.bg};color:${G.txt};font-family:'Syne',sans-serif;-webkit-font-smoothing:antialiased}
#root{overflow-x:hidden;max-width:100%}
.app{display:flex;flex-direction:column;min-height:100dvh;max-width:100%;overflow-x:hidden}

.hdr{overflow:hidden;padding-top:calc(env(safe-area-inset-top,0px) + 44px);padding-bottom:12px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
.htop{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:14px}
.logo{display:flex;align-items:center;gap:10px;min-width:0}
.lico{width:34px;height:34px;flex-shrink:0;border-radius:9px;background:linear-gradient(135deg,${G.blu},#0060FF);display:flex;align-items:center;justify-content:center;font-family:'Orbitron',monospace;font-size:11px;font-weight:900;color:#fff;box-shadow:0 0 12px rgba(0,212,255,.35)}
.lnm{font-family:'Orbitron',monospace;font-size:15px;font-weight:700;letter-spacing:.1em;white-space:nowrap}
.lsb{font-size:9px;color:${G.dim};letter-spacing:.2em;text-transform:uppercase}
.abtn{width:44px;height:44px;flex-shrink:0;border:none;border-radius:10px;background:linear-gradient(135deg,${G.blu},#0060FF);color:#fff;font-size:22px;display:flex;align-items:center;justify-content:center;cursor:pointer}
.abtn:active{opacity:.7;transform:scale(.95)}

.tabs{display:flex;gap:2px;background:${G.card};border:1px solid ${G.bdr};border-radius:13px;padding:4px}
.tab{flex:1;min-height:42px;padding:6px 2px;border:none;border-radius:9px;background:transparent;color:${G.dim};font-family:'Syne',sans-serif;font-size:9px;font-weight:600;cursor:pointer;white-space:nowrap;position:relative;line-height:1.3;transition:all .18s}
.tab.on{background:rgba(0,212,255,.15);color:${G.blu}}
.tab-dot{position:absolute;top:5px;right:4px;width:5px;height:5px;border-radius:50%;background:${G.org};animation:pulse 1.5s infinite}

.scr{flex:1;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;padding:8px 16px calc(env(safe-area-inset-bottom,0px) + 24px);max-width:100%;animation:tabSlide .2s ease}

.hcard{background:${G.card};border:1px solid ${G.bdr};border-radius:16px;padding:16px;margin-bottom:12px;overflow:hidden;max-width:100%;animation:fadeIn .3s ease}
.hcard-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.hcard-title{font-size:10px;font-weight:700;color:${G.dim};letter-spacing:.1em;text-transform:uppercase;display:flex;align-items:center;gap:6px}
.hcard-badge{font-size:9px;font-weight:700;padding:3px 8px;border-radius:6px}
.cont-game{display:flex;gap:12px;align-items:flex-start}
.cont-cover{width:52px;height:52px;border-radius:10px;background-size:cover;background-position:center;background-color:${G.card2};flex-shrink:0}
.cont-cover0{width:52px;height:52px;border-radius:10px;background:${G.card2};display:flex;align-items:center;justify-content:center;font-family:'Orbitron',monospace;font-size:13px;font-weight:900;color:${G.blu};flex-shrink:0}
.cont-body{flex:1;min-width:0}
.cont-title{font-size:15px;font-weight:700;margin-bottom:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cont-meta{font-size:11px;color:${G.dim};margin-bottom:8px}
.prog-bar{height:5px;background:${G.bdr};border-radius:3px;overflow:hidden;margin-bottom:4px}
.prog-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,${G.blu},${G.pur});transition:width .5s ease}
.prog-label{font-size:10px;color:${G.dim};display:flex;justify-content:space-between}
.rec-game{display:flex;gap:12px;align-items:center}
.rec-cover{width:48px;height:48px;border-radius:9px;background-size:cover;background-position:center;background-color:${G.card2};flex-shrink:0}
.rec-cover0{width:48px;height:48px;border-radius:9px;background:${G.card2};display:flex;align-items:center;justify-content:center;font-family:'Orbitron',monospace;font-size:12px;font-weight:900;color:${G.pur};flex-shrink:0}
.rec-body{flex:1;min-width:0}
.rec-title{font-size:14px;font-weight:700;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rec-reason{font-size:11px;color:${G.dim};line-height:1.4}
.cnt-big{font-family:'Orbitron',monospace;font-size:34px;font-weight:900;color:${G.org};line-height:1;margin-bottom:3px}
.cnt-label{font-size:11px;color:${G.dim};margin-bottom:10px}
.cnt-game-row{display:flex;gap:10px;align-items:center;margin-bottom:10px}
.cnt-cover{width:44px;height:44px;border-radius:8px;background-size:cover;background-position:center;background-color:${G.card2};flex-shrink:0}
.cnt-actions{display:flex;gap:6px;flex-wrap:wrap}
.cnt-btn{padding:8px 10px;border-radius:9px;border:1px solid ${G.bdr};background:${G.card2};color:${G.txt};font-family:'Syne',sans-serif;font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap;flex:1;text-align:center}
.cnt-btn-primary{background:linear-gradient(135deg,${G.blu},#0060FF);color:#fff;border-color:transparent}
.cnt-btn-success{background:linear-gradient(135deg,${G.grn},#00a040);color:#000;border-color:transparent;font-weight:700}
.sw{position:relative;padding:10px 16px 6px}
.si{display:block;width:100%;background:${G.card};border:1px solid ${G.bdr};border-radius:12px;padding:11px 12px 11px 36px;color:${G.txt};font-family:'Syne',sans-serif;font-size:16px;outline:none;-webkit-appearance:none}
.si:focus{border-color:${G.blu}}
.sx{position:absolute;left:28px;top:50%;transform:translateY(-50%);pointer-events:none}
.chips{display:flex;gap:6px;padding:6px 16px 10px;overflow-x:auto;-webkit-overflow-scrolling:touch}
.chips::-webkit-scrollbar{display:none}
.chip{padding:7px 14px;border-radius:20px;border:1px solid ${G.bdr};background:${G.card};color:${G.dim};font-size:11px;font-weight:600;white-space:nowrap;flex-shrink:0;cursor:pointer;transition:all .15s}
.chip.on{border-color:${G.blu};color:${G.blu};background:rgba(0,212,255,.1)}
.toolbar{display:flex;gap:8px;padding:0 16px 8px;justify-content:flex-end}
.tbtn{padding:6px 12px;border:1px solid ${G.bdr};border-radius:8px;background:${G.card};color:${G.dim};font-family:'Syne',sans-serif;font-size:11px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px}
.lst{flex:1;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;padding:4px 16px calc(env(safe-area-inset-bottom,0px) + 24px)}
.gc{width:100%;background:${G.card};border:1px solid ${G.bdr};border-radius:14px;margin-bottom:9px;display:flex;align-items:stretch;cursor:pointer;position:relative;overflow:hidden;animation:fadeIn .25s ease;transition:border-color .15s}
.gc::before{content:'';position:absolute;top:0;left:0;width:3px;height:100%;background:var(--c);opacity:.75;z-index:1}
.gc:active{opacity:.75;transform:scale(.99)}
.gcov{width:56px;flex-shrink:0;background-size:cover;background-position:center;background-color:${G.card2}}
.gcov0{width:56px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:${G.card2}}
.gab{font-family:'Orbitron',monospace;font-size:12px;font-weight:900;color:var(--c)}
.gcnt{flex:1;min-width:0;padding:10px 12px 10px 14px;display:flex;gap:8px;align-items:flex-start;overflow:hidden}
.gbdy{flex:1;min-width:0;overflow:hidden}
.gtt{font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px}
.gmt{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.gsb{font-size:10px;font-weight:700;padding:2px 7px;border-radius:5px;background:var(--bg);color:var(--c)}
.gmp{font-size:10px;color:${G.dim}}
.grt{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0}
.grn{font-family:'Orbitron',monospace;font-size:17px;font-weight:900;color:${G.gld};line-height:1}
.grd{font-size:9px;color:${G.dim}}
.gprice{font-size:11px;font-weight:700;color:${G.org};white-space:nowrap}
.gprice-roi{font-size:11px;font-weight:700;white-space:nowrap}
.rbdg-today{padding:3px 8px;border-radius:6px;background:rgba(57,255,110,.15);color:${G.grn};font-size:10px;font-weight:700;white-space:nowrap;border:1px solid rgba(57,255,110,.3);animation:pulse 1s infinite}
.rbdg-soon{padding:3px 8px;border-radius:6px;background:rgba(255,159,28,.15);color:${G.org};font-size:10px;font-weight:700;white-space:nowrap;border:1px solid rgba(255,159,28,.3)}
.rbdg-upcoming{padding:3px 8px;border-radius:6px;background:rgba(167,139,250,.12);color:${G.pur};font-size:10px;font-weight:700;white-space:nowrap}
.rbdg-tba{padding:3px 8px;border-radius:6px;background:rgba(90,106,138,.15);color:${G.dim};font-size:10px;font-weight:600;white-space:nowrap}
.upc-card{width:100%;background:${G.card};border:1px solid ${G.bdr};border-radius:16px;margin-bottom:12px;overflow:hidden;animation:fadeIn .3s ease}
.upc-banner{width:100%;height:80px;background-size:cover;background-position:center top;background-color:${G.card2};position:relative}
.upc-ov{position:absolute;inset:0;background:linear-gradient(to right,rgba(8,11,20,.92) 0%,rgba(8,11,20,.3) 100%)}
.upc-bt{position:absolute;bottom:8px;left:12px;font-size:14px;font-weight:700}
.upc-bd{position:absolute;top:8px;right:10px;font-family:'Orbitron',monospace;font-size:10px;font-weight:900;padding:3px 9px;border-radius:7px;background:rgba(255,159,28,.2);color:${G.org};border:1px solid rgba(255,159,28,.35)}
.upc-body{padding:10px 12px 12px}
.upc-date{font-size:11px;color:${G.dim};margin-bottom:10px}
.upc-acts{display:flex;gap:6px;flex-wrap:wrap}
.upc-btn{padding:8px 10px;border-radius:9px;border:1px solid ${G.bdr};background:${G.card2};color:${G.dim};font-family:'Syne',sans-serif;font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap;flex:1;text-align:center;min-height:36px}
.upc-btn-watch{border-color:rgba(255,209,102,.3);color:${G.gld};background:rgba(255,209,102,.07)}
.upc-btn-play{background:linear-gradient(135deg,${G.grn},#00a040);color:#000;border-color:transparent;font-weight:700}
.upc-btn-add{background:linear-gradient(135deg,${G.blu},#0060FF);color:#fff;border-color:transparent;font-weight:700}
.ntgl-row{display:flex;align-items:center;justify-content:space-between;padding-top:8px;margin-top:8px;border-top:1px solid ${G.bdr}}
.ntgl-lbl{font-size:11px;color:${G.dim}}
.ntgl-sw{width:38px;height:22px;border-radius:11px;background:${G.bdr};position:relative;flex-shrink:0;transition:background .2s;cursor:pointer}
.ntgl-sw.on{background:${G.blu}}
.ntgl-knob{position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .2s}
.ntgl-sw.on .ntgl-knob{transform:translateX(16px)}
.sec-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding:0 2px}
.sec-title{font-family:'Orbitron',monospace;font-size:10px;font-weight:700;color:${G.dim};letter-spacing:.1em;text-transform:uppercase}
.sec-count{font-size:10px;color:${G.dim}}
.notif-banner{margin-bottom:12px;padding:12px 14px;background:rgba(0,212,255,.07);border:1px solid rgba(0,212,255,.2);border-radius:12px;display:flex;gap:10px;align-items:center}
.notif-banner-txt{flex:1;font-size:12px;color:${G.txt};line-height:1.4}
.notif-banner-btn{padding:7px 12px;border:none;border-radius:8px;background:${G.blu};color:#000;font-family:'Syne',sans-serif;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0}
.kgd{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:12px}
.kcd{background:${G.card};border:1px solid ${G.bdr};border-radius:13px;padding:14px;overflow:hidden}
.kvl{font-family:'Orbitron',monospace;font-size:22px;font-weight:900;color:var(--c);line-height:1;margin-bottom:4px}
.klb{font-size:9px;color:${G.dim};font-weight:600;letter-spacing:.07em;text-transform:uppercase}
.ccd{background:${G.card};border:1px solid ${G.bdr};border-radius:13px;padding:14px;margin-bottom:10px;overflow:hidden}
.ctl{font-size:10px;font-weight:700;color:${G.dim};letter-spacing:.1em;text-transform:uppercase;margin-bottom:12px}
.top-list{list-style:none}
.top-item{display:flex;align-items:center;padding:9px 0;border-bottom:1px solid ${G.bdr};gap:8px}
.top-item:last-child{border-bottom:none}
.top-title{flex:1;min-width:0;font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.top-val{font-family:'Orbitron',monospace;font-size:12px;font-weight:700;flex-shrink:0}
.roi-pos{color:${G.grn}} .roi-neg{color:${G.red}}
.fkgd{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:12px}
.fkcd{border-radius:13px;padding:14px;overflow:hidden;border:1px solid ${G.bdr}}
.fkv{font-family:'Orbitron',monospace;font-size:16px;font-weight:900;color:var(--c);line-height:1;margin-bottom:4px}
.fkl{font-size:9px;color:${G.dim};font-weight:600;letter-spacing:.07em;text-transform:uppercase}
.ins-card{border-radius:13px;padding:14px;margin-bottom:10px;border:1px solid transparent;animation:fadeIn .35s ease}
.ovr{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(4,6,14,.9);z-index:9999;display:flex;align-items:flex-end}
.mdl{width:100%;overflow:visible;overflow-y:auto;-webkit-overflow-scrolling:touch;background:${G.card2};border-top:1px solid ${G.bdr};border-radius:20px 20px 0 0;padding:18px 16px calc(env(safe-area-inset-bottom,0px) + 24px);max-height:90dvh;animation:slideUp .22s ease}
.mhdl{width:32px;height:4px;background:${G.bdr};border-radius:2px;margin:0 auto 16px}
.mttl{font-family:'Orbitron',monospace;font-size:13px;font-weight:700;color:${G.blu};letter-spacing:.06em;margin-bottom:16px}
.rwrp{position:relative;margin-bottom:12px}
.rlbl{display:block;font-size:9px;font-weight:700;color:${G.dim};letter-spacing:.1em;text-transform:uppercase;margin-bottom:5px}
.rrow{display:flex;gap:6px;align-items:center;overflow:hidden}
.rin{flex:1;min-width:0;display:block;background:${G.bg};border:1px solid ${G.blu};border-radius:9px;padding:10px 11px;color:${G.txt};font-family:'Syne',sans-serif;font-size:16px;outline:none;-webkit-appearance:none}
.rin::placeholder{color:${G.dim}}
.rbdg2{font-size:9px;font-weight:700;padding:4px 8px;border-radius:6px;background:rgba(0,212,255,.15);color:${G.blu};flex-shrink:0;white-space:nowrap}
.rhnt{font-size:10px;color:${G.dim};margin-top:4px}
.rdd{position:absolute;top:100%;left:0;right:0;background:${G.card};border:1px solid ${G.bdr};border-radius:12px;z-index:99998;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.7);margin-top:4px}
.rit{display:flex;align-items:center;gap:10px;padding:10px 12px;cursor:pointer;border-bottom:1px solid ${G.bdr};min-height:52px}
.rit:last-child{border-bottom:none}
.rit:active{background:rgba(0,212,255,.08)}
.rthm{width:40px;height:40px;border-radius:7px;object-fit:cover;flex-shrink:0;background:${G.bg}}
.rph{width:40px;height:40px;border-radius:7px;background:${G.bg};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.rinf{flex:1;min-width:0;overflow:hidden}
.rnm{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rmt{font-size:10px;color:${G.dim};margin-top:2px}
.covp{display:block;width:100%;height:90px;border-radius:10px;object-fit:cover;margin-bottom:11px;border:1px solid ${G.bdr}}
.fg{margin-bottom:11px}
.fl{display:block;font-size:9px;font-weight:700;color:${G.dim};letter-spacing:.1em;text-transform:uppercase;margin-bottom:5px}
.fi,.fs,.fta{display:block;width:100%;background:${G.bg};border:1px solid ${G.bdr};border-radius:9px;padding:10px 11px;color:${G.txt};font-family:'Syne',sans-serif;font-size:16px;outline:none;-webkit-appearance:none;appearance:none;transition:border-color .15s}
.fi:focus,.fs:focus,.fta:focus{border-color:${G.blu}}
.fi.shake{animation:shake .4s ease}
.fs option{background:${G.card2};color:${G.txt}}
.fta{resize:none;height:68px}
.f2{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.ssg{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.sso{width:100%;min-height:44px;padding:8px 4px;border-radius:8px;border:1px solid ${G.bdr};background:transparent;color:${G.dim};font-family:'Syne',sans-serif;font-size:12px;font-weight:600;cursor:pointer;text-align:center;transition:all .15s}
.sso.on{border-color:var(--c);color:var(--c);background:var(--bg)}
.ntgl2{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:${G.bg};border:1px solid ${G.bdr};border-radius:9px;cursor:pointer}
.ntgl2-l{font-size:14px;color:${G.txt}}.ntgl2-s{font-size:10px;color:${G.dim};margin-top:2px}
.ntgl2-sw{width:44px;height:26px;border-radius:13px;background:${G.bdr};position:relative;flex-shrink:0;transition:background .2s}
.ntgl2-sw.on{background:${G.blu}}.ntgl2-knob{position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform .2s}
.ntgl2-sw.on .ntgl2-knob{transform:translateX(18px)}
.sold-tgl{display:flex;align-items:center;justify-content:space-between;padding:11px 14px;background:${G.bg};border:1px solid ${G.bdr};border-radius:9px;cursor:pointer;margin-bottom:11px}
.sold-sw{width:44px;height:26px;border-radius:13px;background:${G.bdr};position:relative;flex-shrink:0;transition:background .2s}
.sold-sw.on{background:${G.grn}}.sold-k{position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform .2s}
.sold-sw.on .sold-k{transform:translateX(18px)}
.fdiv{height:1px;background:${G.bdr};margin:14px 0 12px}
.fslbl{font-size:9px;font-weight:700;color:${G.org};letter-spacing:.12em;text-transform:uppercase;margin-bottom:10px}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.mac{display:flex;gap:8px;margin-top:16px}
.bpr{flex:1;min-height:50px;padding:13px;border:none;border-radius:11px;background:linear-gradient(135deg,${G.blu},#0060FF);color:#fff;font-family:'Orbitron',monospace;font-size:11px;font-weight:700;letter-spacing:.07em;cursor:pointer;transition:opacity .15s}
.bpr:active{opacity:.75}
.bcn{min-height:50px;padding:13px 14px;border:1px solid ${G.bdr};border-radius:11px;background:${G.card};color:${G.dim};font-family:'Syne',sans-serif;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap}
.bdl{min-height:50px;padding:13px 14px;border:1px solid rgba(255,77,109,.3);border-radius:11px;background:rgba(255,77,109,.1);color:${G.red};font-size:16px;cursor:pointer}
.toast{position:fixed;bottom:calc(env(safe-area-inset-bottom,0px) + 32px);left:50%;transform:translateX(-50%);font-family:'Orbitron',monospace;font-size:11px;font-weight:700;padding:9px 20px;border-radius:20px;z-index:99999;white-space:nowrap;pointer-events:none;animation:toastIn .25s ease;display:flex;align-items:center;gap:6px}
.toast-ok{background:${G.grn};color:#000}
.toast-err{background:${G.red};color:#fff}
.toast-info{background:${G.blu};color:#000}
.confirm-ovr{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(4,6,14,.88);z-index:19999;display:flex;align-items:center;justify-content:center;padding:20px}
.confirm-box{background:${G.card2};border:1px solid ${G.bdr};border-radius:18px;padding:24px 20px;max-width:320px;width:100%;animation:scaleIn .2s ease}
.confirm-ico{font-size:36px;text-align:center;margin-bottom:12px}
.confirm-title{font-size:16px;font-weight:700;text-align:center;margin-bottom:8px}
.confirm-body{font-size:13px;color:${G.dim};text-align:center;line-height:1.5;margin-bottom:20px}
.confirm-btns{display:flex;gap:8px}
.confirm-yes{flex:1;padding:13px;border:none;border-radius:11px;background:${G.red};color:#fff;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;cursor:pointer}
.confirm-no{flex:1;padding:13px;border:1px solid ${G.bdr};border-radius:11px;background:${G.card};color:${G.dim};font-family:'Syne',sans-serif;font-size:13px;font-weight:600;cursor:pointer}
.onboard{position:fixed;inset:0;background:${G.bg};z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px;text-align:center}
.ob-logo{width:80px;height:80px;border-radius:22px;background:linear-gradient(135deg,${G.blu},#0060FF);display:flex;align-items:center;justify-content:center;font-family:'Orbitron',monospace;font-size:20px;font-weight:900;color:#fff;margin:0 auto 24px;box-shadow:0 0 40px rgba(0,212,255,.4);animation:scaleIn .5s ease}
.ob-title{font-family:'Orbitron',monospace;font-size:24px;font-weight:900;color:${G.txt};margin-bottom:8px;letter-spacing:.06em}
.ob-sub{font-size:14px;color:${G.dim};line-height:1.6;margin-bottom:24px;max-width:280px}
.ob-features{display:flex;flex-direction:column;gap:10px;margin-bottom:28px;width:100%;max-width:300px}
.ob-feat{display:flex;align-items:center;gap:12px;text-align:left;background:${G.card};border:1px solid ${G.bdr};border-radius:12px;padding:11px 14px}
.ob-feat-ico{font-size:20px;flex-shrink:0;width:28px;text-align:center}
.ob-feat-title{font-size:13px;font-weight:700;margin-bottom:1px}
.ob-feat-desc{font-size:11px;color:${G.dim}}
.ob-start{width:100%;max-width:300px;padding:16px;border:none;border-radius:14px;background:linear-gradient(135deg,${G.blu},#0060FF);color:#fff;font-family:'Orbitron',monospace;font-size:13px;font-weight:700;letter-spacing:.08em;cursor:pointer;box-shadow:0 0 24px rgba(0,212,255,.4)}
.set-section{margin-bottom:20px}
.set-section-title{font-size:9px;font-weight:700;color:${G.dim};letter-spacing:.12em;text-transform:uppercase;padding:0 4px;margin-bottom:8px}
.set-row{display:flex;align-items:center;background:${G.card};border:1px solid ${G.bdr};border-radius:12px;padding:14px;margin-bottom:6px;cursor:pointer;transition:border-color .15s}
.set-row:active{border-color:${G.blu}}
.set-row-ico{font-size:20px;flex-shrink:0;margin-right:12px}
.set-row-body{flex:1}
.set-row-title{font-size:14px;font-weight:600}
.set-row-desc{font-size:11px;color:${G.dim};margin-top:2px}
.set-row-arrow{color:${G.dim};font-size:14px}
.set-badge{font-size:9px;font-weight:700;padding:3px 8px;border-radius:6px;background:rgba(0,212,255,.12);color:${G.blu}}
.lang-row{display:flex;gap:6px;padding:0 4px;margin-bottom:20px}
.lang-btn{flex:1;padding:10px;border-radius:10px;border:1px solid ${G.bdr};background:${G.card};color:${G.dim};font-family:'Syne',sans-serif;font-size:13px;font-weight:600;cursor:pointer;text-align:center;transition:all .15s}
.lang-btn.on{border-color:${G.blu};color:${G.blu};background:rgba(0,212,255,.1)}
.empty{text-align:center;padding:48px 16px;color:${G.dim};animation:fadeIn .3s ease}
.eic{font-size:44px;margin-bottom:14px;opacity:.4}
.ett{font-size:16px;font-weight:700;margin-bottom:8px;color:${G.txt}}
.ess{font-size:12px;line-height:1.7;margin-bottom:20px}
.empty-cta{padding:11px 24px;border:none;border-radius:11px;background:linear-gradient(135deg,${G.blu},#0060FF);color:#fff;font-family:'Orbitron',monospace;font-size:11px;font-weight:700;letter-spacing:.06em;cursor:pointer}
.flow-step{display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-bottom:1px solid ${G.bdr}}
.flow-step:last-child{border-bottom:none}
.flow-ico{font-size:22px;flex-shrink:0;width:32px;text-align:center}
`;

// ── HELPERS ───────────────────────────────────────────────────────────────────
const CTip = ({active,payload,label}) => {
  if(!active||!payload?.length)return null;
  return <div style={{background:G.card2,border:`1px solid ${G.bdr}`,borderRadius:8,padding:'6px 10px',fontSize:11,color:G.txt}}>
    <div style={{color:G.dim,marginBottom:2}}>{label}</div>
    <div style={{fontWeight:700,color:payload[0].fill||G.blu}}>{payload[0].value}</div>
  </div>;
};

function ReleaseBadge({releaseDate,lang}){
  if(!releaseDate)return null;
  const d=daysUntil(releaseDate);
  if(d===null)return<span className='rbdg-tba'>TBA</span>;
  if(d<0)return null;
  if(d===0)return<span className='rbdg-today'>🎉 {t(lang,'today')}</span>;
  if(d<=3)return<span className='rbdg-soon'>⏰ {d}d</span>;
  if(d<=30)return<span className='rbdg-upcoming'>📅 {d} {lang==='en'?'days':'dni'}</span>;
  return<span className='rbdg-upcoming'>📅 {fmtShort(releaseDate,lang)}</span>;
}

function Onboarding({onDone,lang}){
  const features=[
    {ico:'🎮',tk:'obF1Title',dk:'obF1Desc'},{ico:'📅',tk:'obF2Title',dk:'obF2Desc'},
    {ico:'💰',tk:'obF3Title',dk:'obF3Desc'},{ico:'📊',tk:'obF4Title',dk:'obF4Desc'},
  ];
  return(
    <div className='onboard'>
      <div className='ob-logo'>PS5</div>
      <div className='ob-title'>{t(lang,'obTitle')}</div>
      <div className='ob-sub'>{t(lang,'obSub')}</div>
      <div className='ob-features'>
        {features.map(f=>(
          <div key={f.tk} className='ob-feat'>
            <span className='ob-feat-ico'>{f.ico}</span>
            <div><div className='ob-feat-title'>{t(lang,f.tk)}</div><div className='ob-feat-desc'>{t(lang,f.dk)}</div></div>
          </div>
        ))}
      </div>
      <button className='ob-start' onClick={onDone}>{t(lang,'obStart')}</button>
    </div>
  );
}

function Toast({msg}){
  if(!msg)return null;
  const type=msg.startsWith('❌')?'err':msg.startsWith('ℹ')?'info':'ok';
  return<div className={`toast toast-${type}`}>{msg}</div>;
}

function Confirm({title,body,onYes,onNo}){
  return(
    <div className='confirm-ovr' onClick={onNo}>
      <div className='confirm-box' onClick={e=>e.stopPropagation()}>
        <div className='confirm-ico'>🗑</div>
        <div className='confirm-title'>{title}</div>
        <div className='confirm-body'>{body}</div>
        <div className='confirm-btns'>
          <button type='button' className='confirm-no' onClick={onNo}>{t('pl','cancel')}</button>
          <button type='button' className='confirm-yes' onClick={onYes}>{t('pl','delete')}</button>
        </div>
      </div>
    </div>
  );
}

function RawgSearch({onSelect,lang}){
  const [q,setQ]=useState(''); const [res,setRes]=useState([]); const [busy,setBusy]=useState(false); const [open,setOpen]=useState(false);
  const timer=useRef(null);
  const search=val=>{setQ(val);clearTimeout(timer.current);if(!val.trim()){setRes([]);setOpen(false);return;}setBusy(true);timer.current=setTimeout(async()=>{const r=await rawgSearch(val);setRes(r);setOpen(r.length>0);setBusy(false);},450);};
  const pick=item=>{onSelect(item);setQ('');setRes([]);setOpen(false);};
  return(
    <div className='rwrp'>
      <label className='rlbl'>{t(lang,'searchRawg')}</label>
      <div className='rrow'>
        <input className='rin' value={q} onChange={e=>search(e.target.value)} placeholder={t(lang,'rawgPlaceholder')} autoComplete='off'/>
        {busy?<span style={{flexShrink:0,display:'inline-block',animation:'spin .8s linear infinite'}}>⏳</span>:<span className='rbdg2'>RAWG</span>}
      </div>
      <div className='rhnt'>{t(lang,'rawgHint')}</div>
      {open&&<div className='rdd'>{res.map(r=>(
        <div key={r.id} className='rit' onClick={()=>pick(r)}>
          {r.cover?<img className='rthm' src={r.cover} alt='' loading='lazy'/>:<div className='rph'>🎮</div>}
          <div className='rinf'><div className='rnm'>{r.title}</div><div className='rmt'>{r.year}{r.genre?' · '+r.genre:''}{r.releaseDate?' · '+fmtDate(r.releaseDate,lang):''}</div></div>
        </div>
      ))}</div>}
    </div>
  );
}

function Modal({game,onSave,onDel,onClose,notifPerm,onRequestNotif,lang}){
  const isEdit=!!game;
  const [f,setF]=useState(()=>game?{...game}:{...EF});
  const [confirmDel,setConfirmDel]=useState(false);
  const [shake,setShake]=useState(false);
  const titleRef=useRef(null);
  const SM=getSM(lang);
  const genres=lang==='en'?GENRES_EN:GENRES_PL;
  const upd=(k,v)=>setF(p=>{const n={...p,[k]:v};if(k==='title'&&!isEdit)n.abbr=mkAbbr(v);return n;});
  const fill=item=>setF(p=>({...p,title:item.title,abbr:item.abbr,year:item.year,genre:item.genre||p.genre,cover:item.cover,releaseDate:item.releaseDate||p.releaseDate}));
  function handleSave(){
    if(!f.title.trim()){
      setShake(true);
      setTimeout(()=>setShake(false),500);
      titleRef.current?.focus();
      return;
    }
    const abbr=(f.abbr||'').trim().slice(0,2).toUpperCase()||mkAbbr(f.title);
    const rating=f.rating!==''&&!isNaN(+f.rating)?Math.min(10,Math.max(1,+f.rating)):null;
    onSave({...f,abbr,year:+f.year||new Date().getFullYear(),hours:+f.hours||0,rating,targetHours:+f.targetHours||0});
  }
  const days=daysUntil(f.releaseDate);
  return(
    <>
      <div className='ovr'>
        <div className='mdl'>
          <div className='mhdl'/>
          <div className='mttl'>{isEdit?t(lang,'editGameTitle'):t(lang,'addGameTitle')}</div>
          <RawgSearch onSelect={fill} lang={lang}/>
          {f.cover&&<img className='covp' src={f.cover} alt=''/>}
          <div className='fg'>
            <label className='fl'>{t(lang,'titleField')}</label>
            <input ref={titleRef} className={`fi${shake?' shake':''}`} value={f.title} onChange={e=>upd('title',e.target.value)} placeholder='God of War Ragnarök'/>
          </div>
          <div className='f2'>
            <div className='fg'><label className='fl'>{t(lang,'abbrField')}</label><input className='fi' value={f.abbr} maxLength={2} onChange={e=>upd('abbr',e.target.value.toUpperCase())} placeholder='GW'/></div>
            <div className='fg'><label className='fl'>{t(lang,'yearField')}</label><input className='fi' inputMode='numeric' value={f.year} onChange={e=>upd('year',e.target.value)}/></div>
          </div>
          <div className='fg'>
            <label className='fl'>{t(lang,'releaseDateField')}{days!==null&&days>=0&&<span style={{marginLeft:8,fontWeight:700,color:days===0?G.grn:days<=3?G.org:G.pur}}>{days===0?'— '+t(lang,'releaseToday'):`— ${lang==='en'?'in':'za'} ${days} ${lang==='en'?'days':'dni'}`}</span>}</label>
            <input className='fi' type='date' value={f.releaseDate} onChange={e=>upd('releaseDate',e.target.value)} style={{colorScheme:'dark'}}/>
            <div style={{fontSize:10,color:G.dim,marginTop:4}}>{t(lang,'releaseDateHint')}</div>
          </div>
          <div className='fg'><label className='fl'>{t(lang,'statusField')}</label>
            <div className='ssg'>{Object.entries(SM).map(([k,m])=>(
              <button key={k} type='button' className={'sso'+(f.status===k?' on':'')} style={{'--c':m.c,'--bg':m.bg}} onClick={()=>upd('status',k)}>{m.label}</button>
            ))}</div>
          </div>
          <div className='f2'>
            <div className='fg'><label className='fl'>{t(lang,'genreField')}</label>
              <select className='fs' value={f.genre} onChange={e=>upd('genre',e.target.value)}>
                <option value=''>{t(lang,'genrePh')}</option>
                {genres.map(g=><option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className='fg'><label className='fl'>{t(lang,'hoursField')}</label><input className='fi' inputMode='decimal' value={f.hours} onChange={e=>upd('hours',e.target.value)} placeholder='0'/></div>
          </div>
          <div className='f2'>
            <div className='fg'><label className='fl'>{t(lang,'ratingField')}</label><input className='fi' inputMode='decimal' value={f.rating??''} onChange={e=>upd('rating',e.target.value)} placeholder='—'/></div>
            <div className='fg'><label className='fl'>{t(lang,'targetHoursField')}</label><input className='fi' inputMode='decimal' value={f.targetHours||''} onChange={e=>upd('targetHours',e.target.value)} placeholder={t(lang,'targetPh')}/></div>
          </div>
          <div className='fg'><label className='fl'>{t(lang,'notesField')}</label><textarea className='fta' value={f.notes} onChange={e=>upd('notes',e.target.value)} placeholder={t(lang,'notesPh')}/></div>
          <div className='fdiv'/><div className='fslbl'>{t(lang,'finances')}</div>
          <div className='frow'>
            <div className='fg'><label className='fl'>{t(lang,'priceBoughtField')}</label><input className='fi' inputMode='decimal' value={f.priceBought??''} onChange={e=>upd('priceBought',e.target.value)} placeholder='0'/></div>
            <div className='fg'><label className='fl'>{t(lang,'storeField')}</label>
              <select className='fs' value={f.storeBought||''} onChange={e=>upd('storeBought',e.target.value)}>
                <option value=''>{t(lang,'storePh')}</option>
                {STORES.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className='sold-tgl' onClick={()=>upd('priceSold',f.priceSold==null?'':null)}>
            <span style={{fontSize:14,color:G.txt}}>{t(lang,'soldToggle')}</span>
            <div className={'sold-sw'+(f.priceSold!=null?' on':'')}><div className='sold-k'/></div>
          </div>
          {f.priceSold!=null&&<div className='fg'><label className='fl'>{t(lang,'soldPriceField')}</label><input className='fi' inputMode='decimal' value={f.priceSold??''} onChange={e=>upd('priceSold',e.target.value)} placeholder='0'/></div>}
          {f.releaseDate&&<div className='fg'><label className='fl'>{t(lang,'notifications')}</label>
            {notifPerm==='denied'?<div style={{fontSize:11,color:G.red,padding:'8px 0'}}>{t(lang,'notifyBlocked')}</div>:(
              <div className='ntgl2' onClick={async()=>{if(!f.notifyEnabled&&notifPerm!=='granted')await onRequestNotif();upd('notifyEnabled',!f.notifyEnabled);}}>
                <div><div className='ntgl2-l'>{t(lang,'notifyOn')}</div><div className='ntgl2-s'>{t(lang,'notifyDesc')}</div></div>
                <div className={'ntgl2-sw'+(f.notifyEnabled?' on':'')}><div className='ntgl2-knob'/></div>
              </div>
            )}
          </div>}
          <div className='mac'>
            <button type='button' className='bcn' onClick={onClose}>{t(lang,'cancel')}</button>
            <button type='button' className='bpr' onClick={handleSave}>{t(lang,'save')}</button>
            {isEdit&&<button type='button' className='bdl' onClick={()=>setConfirmDel(true)}>🗑</button>}
          </div>
        </div>
      </div>
      {confirmDel&&<Confirm title={t(lang,'confirmDelete')} body={t(lang,'confirmDeleteBody',{title:game.title})} onYes={()=>onDel(game.id)} onNo={()=>setConfirmDel(false)}/>}
    </>
  );
}

function Home({games,onOpen,onStatusChange,onAddFirst,lang}){
  const SM=getSM(lang);
  const current=games.filter(g=>g.status==='gram');
  const backlog=games.filter(g=>g.status==='planuje'&&!g.releaseDate);
  const upcoming=games.filter(g=>g.releaseDate&&daysUntil(g.releaseDate)>=0).sort((a,b)=>new Date(a.releaseDate)-new Date(b.releaseDate));
  const bought=games.filter(g=>!!+g.priceBought);
  const sold=games.filter(g=>g.priceSold!=null&&!!+g.priceSold);
  const active=[...current].sort((a,b)=>(b.hours||0)-(a.hours||0))[0]||null;
  const prog=active&&active.targetHours>0?Math.min(100,Math.round((active.hours/active.targetHours)*100)):null;
  const remHrs=active&&active.targetHours>0?Math.max(0,active.targetHours-active.hours).toFixed(0):null;
  const rec=(()=>{if(!backlog.length)return null;const fav=games.filter(g=>g.status==='ukonczone'&&g.genre&&g.rating>=8).sort((a,b)=>b.rating-a.rating)[0]?.genre;return(fav&&backlog.find(g=>g.genre===fav))||backlog[0];})();
  const nextUp=upcoming[0]||null;
  const days=nextUp?daysUntil(nextUp.releaseDate):null;
  const totalSpent=bought.reduce((s,g)=>s+ +g.priceBought,0);
  const totalEarned=sold.reduce((s,g)=>s+ +g.priceSold,0);
  const sellable=games.filter(g=>g.status==='porzucone'&&!!+g.priceBought&&(g.priceSold==null||!+g.priceSold)).sort((a,b)=>+b.priceBought - +a.priceBought);
  if(!games.length)return(<div className='scr'><div className='empty' style={{paddingTop:60}}><div className='eic'>🎮</div><div className='ett'>{t(lang,'obTitle')}</div><div className='ess'>{t(lang,'obSub')}</div><button className='empty-cta' onClick={onAddFirst}>{t(lang,'addGame')}</button></div></div>);
  const hour=new Date().getHours();
  const greet=hour<6?t(lang,'goodNight'):hour<12?t(lang,'goodMorning'):hour<18?t(lang,'goodAfternoon'):t(lang,'goodEvening');
  return(
    <div className='scr'>
      <div style={{marginBottom:16}}>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:700,color:G.blu,letterSpacing:'.06em',marginBottom:2}}>{greet}</div>
        <div style={{fontSize:11,color:G.dim}}>{games.length} {t(lang,'gamesInCollection')} · {current.length} {t(lang,'active')} · {upcoming.length} {t(lang,'upcomingReleases')}</div>
      </div>
      {active?(
        <div className='hcard' onClick={()=>onOpen(active)} style={{cursor:'pointer'}}>
          <div className='hcard-hdr'><span className='hcard-title'>▶️ {t(lang,'continuePlay')}</span><span className='hcard-badge' style={{background:'rgba(0,212,255,.12)',color:G.blu}}>GRAM</span></div>
          <div className='cont-game'>
            {active.cover?<div className='cont-cover' style={{backgroundImage:`url(${active.cover})`}}/>:<div className='cont-cover0'>{active.abbr||'??'}</div>}
            <div className='cont-body'>
              <div className='cont-title'>{active.title}</div>
              <div className='cont-meta'>{[active.genre,active.hours&&t(lang,'hoursPlayed',{n:active.hours})].filter(Boolean).join(' · ')}</div>
              {prog!==null?(<><div className='prog-bar'><div className='prog-fill' style={{width:prog+'%'}}/></div><div className='prog-label'><span>{t(lang,'progComplete',{n:prog})}</span><span>~{remHrs}h {t(lang,'remaining')}</span></div></>):(active.hours>0&&<div style={{fontSize:11,color:G.dim}}>{t(lang,'addTargetHint')}</div>)}
            </div>
          </div>
          {current.length>1&&<div style={{fontSize:10,color:G.dim,marginTop:10}}>{t(lang,'moreActive',{n:current.length-1})}</div>}
        </div>
      ):(
        <div className='hcard'>
          <div className='hcard-hdr'><span className='hcard-title'>▶️ {t(lang,'continuePlay')}</span></div>
          <div style={{textAlign:'center',padding:'16px 0',color:G.dim,fontSize:12}}>{t(lang,'noActiveGame')}<br/><span style={{color:G.pur}}>{t(lang,'changeStatusHint')}</span></div>
        </div>
      )}
      {rec&&(
        <div className='hcard'>
          <div className='hcard-hdr'><span className='hcard-title'>🎯 {t(lang,'whatToPlay')}</span><span className='hcard-badge' style={{background:'rgba(167,139,250,.12)',color:G.pur}}>{t(lang,'backlog')}</span></div>
          <div className='rec-game'>
            {rec.cover?<div className='rec-cover' style={{backgroundImage:`url(${rec.cover})`}}/>:<div className='rec-cover0'>{rec.abbr||'??'}</div>}
            <div className='rec-body'><div className='rec-title'>{rec.title}</div><div className='rec-reason'>{rec.genre&&games.filter(g=>g.status==='ukonczone'&&g.genre===rec.genre).length>0?t(lang,'genreReason',{genre:rec.genre,n:games.filter(g=>g.status==='ukonczone'&&g.genre===rec.genre).length}):t(lang,'backlogReason')}</div></div>
          </div>
          <button type='button' onClick={e=>{e.stopPropagation();onStatusChange(rec.id,'gram');}} style={{width:'100%',marginTop:10,padding:'9px 16px',border:`1px solid rgba(167,139,250,.3)`,borderRadius:9,background:'rgba(167,139,250,.1)',color:G.pur,fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,cursor:'pointer'}}>
            {t(lang,'startPlaying')}
          </button>
        </div>
      )}
      {nextUp&&(
        <div className='hcard'>
          <div className='hcard-hdr'><span className='hcard-title'>📅 {t(lang,'nextRelease')}</span>{days===0?<span className='hcard-badge' style={{background:'rgba(57,255,110,.12)',color:G.grn,animation:'pulse 1s infinite'}}>{t(lang,'today')}</span>:<span className='hcard-badge' style={{background:'rgba(255,159,28,.12)',color:G.org}}>{days}d</span>}</div>
          <div className='cnt-game-row'>
            {nextUp.cover?<div className='cnt-cover' style={{backgroundImage:`url(${nextUp.cover})`}}/>:<div style={{width:44,height:44,borderRadius:8,background:G.card2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontFamily:"'Orbitron',monospace",fontWeight:900,color:G.pur,flexShrink:0}}>{nextUp.abbr||'??'}</div>}
            <div><div style={{fontSize:13,fontWeight:700,marginBottom:2}}>{nextUp.title}</div><div style={{fontSize:11,color:G.dim}}>{days===0?t(lang,'releaseToday'):days===1?t(lang,'releaseTomorrow'):fmtDate(nextUp.releaseDate,lang)}</div></div>
          </div>
          {days>0&&<><div className='cnt-big'>{days}</div><div className='cnt-label'>{days===1?t(lang,'dayToRelease'):t(lang,'daysToRelease')}</div></>}
          <div className='cnt-actions'>
            {days>0?<><button type='button' className='cnt-btn' onClick={()=>onOpen(nextUp)}>{t(lang,'details')}</button><button type='button' className='cnt-btn cnt-btn-primary'>{t(lang,'remind')}</button></>
                   :<><button type='button' className='cnt-btn cnt-btn-success' onClick={()=>onStatusChange(nextUp.id,'gram')}>{t(lang,'startPlaying')}</button><button type='button' className='cnt-btn cnt-btn-primary' onClick={()=>onOpen(nextUp)}>{t(lang,'addToCollection')}</button></>}
          </div>
        </div>
      )}
      {bought.length>0&&(
        <div className='hcard'>
          <div className='hcard-hdr'><span className='hcard-title'>💰 {t(lang,'financeInsight')}</span></div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12}}><span style={{color:G.dim}}>{t(lang,'spentTotal')}</span><span style={{fontFamily:"'Orbitron',monospace",fontWeight:700,color:G.red}}>{pln(totalSpent,lang)}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12}}><span style={{color:G.dim}}>{t(lang,'recovered')}</span><span style={{fontFamily:"'Orbitron',monospace",fontWeight:700,color:G.grn}}>{pln(totalEarned,lang)}</span></div>
            <div style={{height:1,background:G.bdr,margin:'2px 0'}}/>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}><span style={{fontWeight:600}}>{t(lang,'realCost')}</span><span style={{fontFamily:"'Orbitron',monospace",fontWeight:900,color:G.org}}>{pln(totalSpent-totalEarned,lang)}</span></div>
            {sellable.length>0&&<div style={{marginTop:6,padding:'10px 12px',background:'rgba(57,255,110,.07)',border:'1px solid rgba(57,255,110,.2)',borderRadius:10,fontSize:11,color:G.txt,lineHeight:1.5}}>{t(lang,'sellSuggestion',{title:sellable[0].title,amount:pln(+sellable[0].priceBought*0.6,lang)})}{sellable.length>1&&` (+${sellable.length-1})`}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function Upcoming({games,onOpen,onToggleNotify,onStatusChange,notifPerm,onRequestNotif,lang}){
  const upcoming=games.filter(g=>g.releaseDate&&daysUntil(g.releaseDate)>=0).sort((a,b)=>new Date(a.releaseDate)-new Date(b.releaseDate));
  const released=games.filter(g=>g.releaseDate&&daysUntil(g.releaseDate)<0&&g.status==='planuje').sort((a,b)=>new Date(b.releaseDate)-new Date(a.releaseDate)).slice(0,5);
  const tba=games.filter(g=>!g.releaseDate&&g.status==='planuje');
  if(!upcoming.length&&!released.length&&!tba.length)return(<div className='scr'><div className='empty'><div className='eic'>📅</div><div className='ett'>{t(lang,'noReleases')}</div><div className='ess'>{t(lang,'noReleasesHint')}</div></div></div>);
  return(
    <div className='scr'>
      {notifPerm==='default'&&(<div className='notif-banner'><span style={{fontSize:22}}>🔔</span><div className='notif-banner-txt'><strong>{t(lang,'enableNotif')}</strong><br/>{t(lang,'enableNotifDesc')}</div><button className='notif-banner-btn' onClick={onRequestNotif}>{t(lang,'enable')}</button></div>)}
      {upcoming.length>0&&<><div className='sec-hdr'><span className='sec-title'>{t(lang,'upcoming')}</span><span className='sec-count'>{upcoming.length}</span></div>
        {upcoming.map(g=>{const d=daysUntil(g.releaseDate);return(
          <div key={g.id} className='upc-card'>
            <div className='upc-banner' style={g.cover?{backgroundImage:`url(${g.cover})`}:{}}><div className='upc-ov'/><div className='upc-bt'>{g.title}</div>{d===0?<div className='upc-bd' style={{color:G.grn,background:'rgba(57,255,110,.2)',borderColor:'rgba(57,255,110,.4)'}}>{t(lang,'today')}</div>:<div className='upc-bd'>{d}d</div>}</div>
            <div className='upc-body'>
              <div className='upc-date'>{fmtDate(g.releaseDate,lang)}{g.genre?' · '+g.genre:''}</div>
              <div className='upc-acts'>{d===0?(<><button type='button' className='upc-btn upc-btn-play' onClick={()=>onStatusChange(g.id,'gram')}>{t(lang,'startPlaying')}</button><button type='button' className='upc-btn upc-btn-add' onClick={()=>onOpen(g)}>{t(lang,'addToColl')}</button></>):(<><button type='button' className='upc-btn upc-btn-plan' onClick={()=>onOpen(g)}>{t(lang,'edit')}</button><button type='button' className='upc-btn upc-btn-watch'>{t(lang,'watch')}</button><button type='button' className='upc-btn' style={{borderColor:'rgba(0,212,255,.3)',color:G.blu,background:'rgba(0,212,255,.07)'}}>{t(lang,'buy')}</button></>)}</div>
              <div className='ntgl-row'><span className='ntgl-lbl'>{t(lang,'notifyToggle')}</span><div className={'ntgl-sw'+(g.notifyEnabled?' on':'')} onClick={async()=>{if(!g.notifyEnabled&&notifPerm!=='granted')await onRequestNotif();onToggleNotify(g.id);}}><div className='ntgl-knob'/></div></div>
            </div>
          </div>
        );})}
      </>}
      {released.length>0&&<><div className='sec-hdr' style={{marginTop:16}}><span className='sec-title'>{t(lang,'alreadyOut')}</span><span className='sec-count'>{released.length}</span></div>
        {released.map(g=>(<div key={g.id} className='upc-card'><div className='upc-banner' style={g.cover?{backgroundImage:`url(${g.cover})`}:{}}><div className='upc-ov'/><div className='upc-bt'>{g.title}</div><div className='upc-bd' style={{color:G.grn,background:'rgba(57,255,110,.2)',borderColor:'rgba(57,255,110,.4)'}}>{t(lang,'out')}</div></div><div className='upc-body'><div className='upc-date'>{t(lang,'premiere')} {fmtDate(g.releaseDate,lang)}</div><div className='upc-acts'><button type='button' className='upc-btn upc-btn-play' onClick={()=>onStatusChange(g.id,'gram')}>{t(lang,'startPlaying')}</button><button type='button' className='upc-btn upc-btn-add' onClick={()=>onOpen(g)}>{t(lang,'addToColl')}</button></div></div></div>))}
      </>}
      {tba.length>0&&<><div className='sec-hdr' style={{marginTop:16}}><span className='sec-title'>{t(lang,'tba')}</span><span className='sec-count'>{tba.length}</span></div>
        {tba.map(g=>{const SM2=getSM(lang);const m=SM2[g.status]||SM2.planuje;return(<div key={g.id} className='gc' style={{'--c':m.c,'--bg':m.bg}} onClick={()=>onOpen(g)}>{g.cover?<div className='gcov' style={{backgroundImage:`url(${g.cover})`}}/>:<div className='gcov0'><div className='gab'>{g.abbr||'??'}</div></div>}<div className='gcnt'><div className='gbdy'><div className='gtt'>{g.title}</div><div className='gmt'><span className='rbdg-tba'>TBA</span>{g.genre&&<span className='gmp'>{g.genre}</span>}</div></div></div></div>);})}
      </>}
    </div>
  );
}

function InsightsTab({insights,games,lang}){
  const [flowModal,setFlowModal]=useState(null);
  const sold=games.filter(g=>g.priceSold!=null&&!!+g.priceSold);
  const losses=sold.filter(g=>+g.priceSold<+g.priceBought).reduce((s,g)=>s+(+g.priceBought - +g.priceSold),0);
  const porzucone=games.filter(g=>g.status==='porzucone'&&!!+g.priceBought&&(g.priceSold==null||!+g.priceSold));
  const unsold=porzucone.reduce((s,g)=>s+ +g.priceBought*0.5,0);
  const totalSav=Math.round(losses+unsold);
  const ctaKeys={[t(lang,'biggestLoss')]:{label:t(lang,'avoidLoss'),flow:'avoid'},[t(lang,'bestInvestment')]:{label:t(lang,'buyBetter'),flow:'invest'},[t(lang,'mostExpensiveHours')]:{label:t(lang,'optimizeBacklog'),flow:'optim'},[t(lang,'bestValueShort')]:{label:t(lang,'findSimilar'),flow:'similar'},[t(lang,'financeSummary')]:{label:t(lang,'saveMoney'),flow:'save'}};
  const flowData={
    avoid:{title:t(lang,'flowAvoidTitle'),steps:[{ico:'⏰',tip:lang==='en'?'Buy 3–6 months after release — price drops 30–50%.':'Kupuj 3–6 miesięcy po premierze — cena spada o 30–50%.'},{ico:'🏷',tip:lang==='en'?'Track sales on PSN and stores. Set price alerts.':'Śledź promocje PSN, CDP i Allegro. Ustaw alerty cenowe.'},{ico:'📦',tip:lang==='en'?'Buy physical — you can resell. Digital is permanent.':'Kupuj pudełkowe — możesz odsprzedać. Cyfrowe są definitywne.'},{ico:'⭐',tip:lang==='en'?'Check reviews before buying. Games below 7/10 rarely worth full price.':'Sprawdź oceny przed zakupem. Gry <7/10 rzadko warte pełnej ceny.'}]},
    invest:{title:t(lang,'flowInvestTitle'),steps:[{ico:'🎮',tip:lang==='en'?'Long RPGs and open worlds give the best cost/hour ratio.':'Długie RPG i otwarte światy dają najlepszy koszt/godzinę.'},{ico:'💎',tip:lang==='en'?'Sony exclusives (GoW, Spider-Man) hold resale value well.':'Gry Sony (GoW, Spider-Man) utrzymują wartość przy odsprzedaży.'},{ico:'🛒',tip:lang==='en'?'GOTY editions often include all DLC at a lower price.':'Edycje GOTY — wszystkie DLC w niższej cenie.'},{ico:'👥',tip:lang==='en'?'Multiplayer with active community has long lifespan.':'Multiplayer z aktywną społecznością ma długą żywotność.'}]},
    optim:{title:t(lang,'flowOptimTitle'),steps:[{ico:'📋',tip:lang==='en'?'Remove games waiting over 1 year — chance of playing is low.':'Usuń gry czekające >1 rok — szansa że zagrasz jest mała.'},{ico:'⏱',tip:lang==='en'?'Prioritize short games (10–20h) for quick satisfaction.':'Priorytetyzuj krótkie gry (10–20h) dla szybkiej satysfakcji.'},{ico:'💰',tip:lang==='en'?'Sell abandoned games before they lose value — sooner is better.':'Sprzedaj porzucone zanim stracą wartość — im szybciej tym lepiej.'},{ico:'🎯',tip:lang==='en'?'Play your favourite genre — you'll finish faster.':'Graj w swój ulubiony gatunek — szybciej ukończysz.'}]},
    similar:{title:t(lang,'flowSimilarTitle'),steps:[{ico:'🔍',tip:lang==='en'?'RAWG.io has a 'Similar games' section for every title.':'RAWG.io ma sekcję 'Similar games' dla każdego tytułu.'},{ico:'📊',tip:lang==='en'?'Filter your backlog by genre — you already have games you like.':'Filtruj backlog po gatunku — masz już gry które lubisz.'},{ico:'⭐',tip:lang==='en'?'PS Plus Extra offers games similar to your favourites.':'PS Plus Extra oferuje gry podobne do Twoich ulubionych.'},{ico:'💬',tip:lang==='en'?'r/PS5 and r/patientgamers recommend games by preference.':'r/PS5 i r/patientgamers polecają gry wg preferencji.'}]},
    save:{title:t(lang,'flowSaveTitle'),steps:[{ico:'📅',tip:lang==='en'?'Max 1–2 full-price games per month. Rest on sale.':'Max 1–2 gry miesięcznie po pełnej cenie. Resztę w promocjach.'},{ico:'🔄',tip:lang==='en'?'Resell immediately after finishing — less value lost.':'Odsprzedaj zaraz po ukończeniu — tracisz mniej wartości.'},{ico:'📦',tip:lang==='en'?'1 new + 2 used = same gaming for less money.':'1 nowa + 2 używane = tyle samo grania za mniej pieniędzy.'},{ico:'🎮',tip:lang==='en'?'PS Plus Extra gives access to hundreds of games for a fraction.':'PS Plus Extra daje dostęp do setek gier za ułamek ceny.'}]},
  };
  return(
    <div>
      {totalSav>0&&(<div style={{background:'linear-gradient(135deg,rgba(57,255,110,.08),rgba(0,212,255,.06))',border:'1px solid rgba(57,255,110,.22)',borderRadius:16,padding:16,marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:700,color:G.dim,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:4}}>{t(lang,'potentialSaving')}</div>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:36,fontWeight:900,color:G.grn,lineHeight:1,marginBottom:4}}>{pln(totalSav,lang)}</div>
        <div style={{fontSize:11,color:'#B0B8CC',lineHeight:1.5}}>{losses>0&&`${pln(Math.round(losses),lang)} ${t(lang,'savingsFrom')}`}{losses>0&&unsold>0&&' + '}{unsold>0&&`~${pln(Math.round(unsold),lang)} ${t(lang,'savingsFromSell')}`}</div>
        <div style={{fontSize:10,color:G.dim,marginTop:6}}>{t(lang,'clickCards')}</div>
      </div>)}
      {insights.map((ins,i)=>{
        const cta=ctaKeys[ins.title];
        return(<div key={i} className='ins-card' style={{background:ins.bg,border:`1px solid ${ins.color}30`}}>
          <div style={{fontSize:22,marginBottom:8}}>{ins.ico}</div>
          <div style={{fontSize:12,fontWeight:700,color:ins.color,marginBottom:4}}>{ins.title}</div>
          <div style={{fontSize:11,lineHeight:1.6,opacity:.85,marginBottom:10}}>{ins.body}</div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:900,color:ins.color,marginBottom:cta?12:0}}>{ins.val}</div>
          {cta&&<button type='button' onClick={()=>setFlowModal(flowData[cta.flow])} style={{width:'100%',padding:'10px',border:`1px solid ${ins.color}50`,borderRadius:9,background:`${ins.color}15`,color:ins.color,fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,cursor:'pointer'}}>{cta.label}</button>}
        </div>);
      })}
      {flowModal&&(<div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(4,6,14,.92)',zIndex:19999,display:'flex',alignItems:'flex-end'}} onClick={()=>setFlowModal(null)}>
        <div style={{width:'100%',background:G.card2,borderTop:`1px solid ${G.bdr}`,borderRadius:'20px 20px 0 0',padding:`18px 16px calc(env(safe-area-inset-bottom,0px) + 24px)`,maxHeight:'80dvh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
          <div style={{width:32,height:4,background:G.bdr,borderRadius:2,margin:'0 auto 16px'}}/>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:700,color:G.blu,marginBottom:16}}>{flowModal.title}</div>
          {flowModal.steps.map((s,i)=>(<div key={i} className='flow-step'><span className='flow-ico'>{s.ico}</span><p style={{fontSize:13,color:'#B0B8CC',lineHeight:1.6}}>{s.tip}</p></div>))}
          <button type='button' onClick={()=>setFlowModal(null)} style={{width:'100%',marginTop:16,padding:13,border:'none',borderRadius:11,background:`linear-gradient(135deg,${G.blu},#0060FF)`,color:'#fff',fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:700,cursor:'pointer'}}>{t(lang,'iUnderstand')}</button>
        </div>
      </div>)}
    </div>
  );
}

function Stats({games,lang}){
  const [tab,setTab]=useState('general');
  if(!games.length)return<div className='scr'><div className='empty'><div className='eic'>📈</div><div className='ett'>{t(lang,'noGames')}</div></div></div>;
  const hrs=games.reduce((s,g)=>s+(g.hours||0),0);
  const rated=games.filter(g=>g.rating!=null);
  const avg=rated.length?(rated.reduce((s,g)=>s+g.rating,0)/rated.length).toFixed(1):'—';
  const SM2=getSM(lang);
  const kpis=[{l:t(lang,'gamesTotal'),v:games.length,c:G.blu},{l:t(lang,'completed2'),v:games.filter(g=>g.status==='ukonczone').length,c:G.grn},{l:t(lang,'hoursTotal'),v:hrs%1?hrs.toFixed(1):hrs,c:G.pur},{l:t(lang,'avgRating'),v:avg,c:G.gld}];
  const sData=Object.entries(SM2).map(([k,m])=>({n:m.label,v:games.filter(g=>g.status===k).length,c:m.c}));
  const gMap={}; games.forEach(g=>{if(g.genre)gMap[g.genre]=(gMap[g.genre]||0)+1;});
  const gData=Object.entries(gMap).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([n,v])=>({n,v}));
  const buckets=[1,2,3,4,5,6,7,8,9,10].map(r=>({n:String(r),v:games.filter(g=>g.rating!=null&&Math.round(g.rating)===r).length}));
  const bought=games.filter(g=>!!+g.priceBought);
  const sold=games.filter(g=>g.priceSold!=null&&!!+g.priceSold);
  const totalSpent=bought.reduce((s,g)=>s+ +g.priceBought,0);
  const totalEarned=sold.reduce((s,g)=>s+ +g.priceSold,0);
  const netCost=totalSpent-totalEarned;
  const withHrs=bought.filter(g=>g.hours>0);
  const cph=withHrs.length?(withHrs.reduce((s,g)=>s+ +g.priceBought,0)/withHrs.reduce((s,g)=>s+g.hours,0)):null;
  const storeMap={}; bought.forEach(g=>{const s=g.storeBought||'Other';storeMap[s]=(storeMap[s]||0)+ +g.priceBought;});
  const storeData=Object.entries(storeMap).sort((a,b)=>b[1]-a[1]).map(([n,v])=>({n,v:+v.toFixed(0)}));
  const gcMap={}; bought.forEach(g=>{if(g.genre)gcMap[g.genre]=(gcMap[g.genre]||0)+ +g.priceBought;});
  const gcData=Object.entries(gcMap).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([n,v])=>({n,v:+v.toFixed(0)}));
  const soldG=sold.map(g=>({...g,roi:+g.priceSold - +g.priceBought})).sort((a,b)=>b.roi-a.roi);
  const fkpis=[{l:t(lang,'spent'),v:pln(totalSpent,lang),c:G.red,bg:'rgba(255,77,109,.07)'},{l:t(lang,'earnedBack'),v:pln(totalEarned,lang),c:G.grn,bg:'rgba(57,255,110,.07)'},{l:t(lang,'realCostShort'),v:pln(netCost,lang),c:netCost>0?G.org:G.grn,bg:'rgba(255,159,28,.07)'},{l:t(lang,'costPerHour'),v:cph?cph.toFixed(1)+(lang==='en'?' $/h':' zł/h'):'—',c:G.blu,bg:'rgba(0,212,255,.07)'}];
  const insights=[];
  if(bought.length){
    const worst=soldG.filter(g=>g.roi<0).slice(-1)[0];
    const best=soldG.filter(g=>g.roi>0)[0];
    const wCph=[...withHrs].sort((a,b)=>(+b.priceBought/b.hours)-(+a.priceBought/a.hours))[0];
    const bCph=[...withHrs].sort((a,b)=>(+a.priceBought/a.hours)-(+b.priceBought/b.hours))[0];
    if(worst)insights.push({ico:'📉',color:G.red,bg:'rgba(255,77,109,.07)',title:t(lang,'biggestLoss'),body:t(lang,'biggestLossDesc',{title:worst.title,amount:pln(Math.abs(worst.roi),lang)}),val:'-'+pln(Math.abs(worst.roi),lang)});
    if(best)insights.push({ico:'📈',color:G.grn,bg:'rgba(57,255,110,.07)',title:t(lang,'bestInvestment'),body:t(lang,'bestInvestDesc',{title:best.title,amount:pln(best.roi,lang)}),val:'+'+pln(best.roi,lang)});
    if(wCph&&wCph.hours>0)insights.push({ico:'⚠️',color:G.org,bg:'rgba(255,159,28,.07)',title:t(lang,'mostExpensiveHours'),body:t(lang,'expHoursDesc',{title:wCph.title,cph:(+wCph.priceBought/wCph.hours).toFixed(1)}),val:(+wCph.priceBought/wCph.hours).toFixed(1)+(lang==='en'?' $/h':' zł/h')});
    if(bCph&&bCph.hours>0)insights.push({ico:'💎',color:G.blu,bg:'rgba(0,212,255,.07)',title:t(lang,'bestValueShort'),body:t(lang,'bestValDesc',{title:bCph.title,cph:(+bCph.priceBought/bCph.hours).toFixed(1)}),val:(+bCph.priceBought/bCph.hours).toFixed(1)+(lang==='en'?' $/h':' zł/h')});
    if(totalSpent>0)insights.push({ico:'💰',color:G.pur,bg:'rgba(167,139,250,.07)',title:t(lang,'financeSummary'),body:t(lang,'finSummaryDesc',{spent:pln(totalSpent,lang),earned:pln(totalEarned,lang),net:pln(netCost,lang)}),val:pln(netCost,lang)});
  }
  const subTabs=[[' general',t(lang,'general')],[' finance',t(lang,'finance')],[' insights',t(lang,'analysis')]];
  return(
    <div className='scr'>
      <div style={{display:'flex',gap:3,background:G.card,border:`1px solid ${G.bdr}`,borderRadius:11,padding:4,marginBottom:14}}>
        {subTabs.map(([k,l])=><button key={k} type='button' onClick={()=>setTab(k.trim())} style={{flex:1,minHeight:40,padding:'7px 2px',border:'none',borderRadius:8,background:tab===k.trim()?'rgba(0,212,255,.15)':'transparent',color:tab===k.trim()?G.blu:G.dim,fontFamily:"'Syne',sans-serif",fontSize:10,fontWeight:600,cursor:'pointer'}}>{l}</button>)}
      </div>
      {tab==='general'&&<>
        <div className='kgd'>{kpis.map(k=><div key={k.l} className='kcd' style={{'--c':k.c}}><div className='kvl'>{k.v}</div><div className='klb'>{k.l}</div></div>)}</div>
        <div className='ccd'><div className='ctl'>{t(lang,'statusChart')}</div><ResponsiveContainer width='100%' height={120}><BarChart data={sData} barSize={24} margin={{top:4,left:-20,right:4,bottom:0}}><XAxis dataKey='n' tick={{fill:G.dim,fontSize:9}} axisLine={false} tickLine={false}/><YAxis hide/><Tooltip content={<CTip/>}/><Bar dataKey='v' radius={[4,4,0,0]}>{sData.map((d,i)=><Cell key={i} fill={d.c} fillOpacity={.85}/>)}</Bar></BarChart></ResponsiveContainer></div>
        {gData.length>0&&<div className='ccd'><div className='ctl'>{t(lang,'genreChart')}</div><ResponsiveContainer width='100%' height={120}><BarChart data={gData} barSize={20} margin={{top:4,left:-20,right:4,bottom:0}}><XAxis dataKey='n' tick={{fill:G.dim,fontSize:9}} axisLine={false} tickLine={false}/><YAxis hide/><Tooltip content={<CTip/>}/><Bar dataKey='v' radius={[4,4,0,0]} fill={G.pur} fillOpacity={.8}/></BarChart></ResponsiveContainer></div>}
        {rated.length>0&&<div className='ccd'><div className='ctl'>{t(lang,'ratingChart')}</div><ResponsiveContainer width='100%' height={120}><BarChart data={buckets} barSize={16} margin={{top:4,left:-20,right:4,bottom:0}}><XAxis dataKey='n' tick={{fill:G.dim,fontSize:10}} axisLine={false} tickLine={false}/><YAxis hide/><Tooltip content={<CTip/>}/><Bar dataKey='v' radius={[4,4,0,0]}>{buckets.map((_,i)=><Cell key={i} fill={`hsl(${i*12},88%,55%)`} fillOpacity={.85}/>)}</Bar></BarChart></ResponsiveContainer></div>}
      </>}
      {tab==='finance'&&<>
        {!bought.length?<div className='empty'><div className='eic'>💰</div><div className='ett'>{t(lang,'noFinanceData')}</div><div className='ess'>{t(lang,'addPricesHint')}</div></div>:<>
          <div className='fkgd'>{fkpis.map(k=><div key={k.l} className='fkcd' style={{'--c':k.c,background:k.bg}}><div className='fkv'>{k.v}</div><div className='fkl'>{k.l}</div></div>)}</div>
          {storeData.length>0&&<div className='ccd'><div className='ctl'>{t(lang,'byStore')}</div><ResponsiveContainer width='100%' height={120}><BarChart data={storeData} barSize={24} margin={{top:4,left:-20,right:4,bottom:0}}><XAxis dataKey='n' tick={{fill:G.dim,fontSize:9}} axisLine={false} tickLine={false}/><YAxis hide/><Tooltip content={<CTip/>}/><Bar dataKey='v' radius={[4,4,0,0]} fill={G.org} fillOpacity={.85}/></BarChart></ResponsiveContainer></div>}
          {gcData.length>0&&<div className='ccd'><div className='ctl'>{t(lang,'byGenre')}</div><ResponsiveContainer width='100%' height={120}><BarChart data={gcData} barSize={20} margin={{top:4,left:-20,right:4,bottom:0}}><XAxis dataKey='n' tick={{fill:G.dim,fontSize:9}} axisLine={false} tickLine={false}/><YAxis hide/><Tooltip content={<CTip/>}/><Bar dataKey='v' radius={[4,4,0,0]} fill={G.pur} fillOpacity={.8}/></BarChart></ResponsiveContainer></div>}
          {soldG.length>0&&<div className='ccd'><div className='ctl'>{t(lang,'roi')}</div><ul className='top-list'>{soldG.map(g=><li key={g.id} className='top-item'><span className='top-title'>{g.title}</span><span style={{fontSize:10,color:G.dim,flexShrink:0}}>{pln(+g.priceBought,lang)}→{pln(+g.priceSold,lang)}</span><span className={'top-val '+(g.roi>=0?'roi-pos':'roi-neg')}>{g.roi>=0?'+':''}{pln(g.roi,lang)}</span></li>)}</ul></div>}
          <div className='ccd'><div className='ctl'>{t(lang,'mostExpensive')}</div><ul className='top-list'>{[...bought].sort((a,b)=>+b.priceBought - +a.priceBought).slice(0,5).map(g=><li key={g.id} className='top-item'><span className='top-title'>{g.title}</span>{g.storeBought&&<span style={{fontSize:10,color:G.dim,flexShrink:0}}>{g.storeBought}</span>}<span className='top-val' style={{color:G.org}}>{pln(+g.priceBought,lang)}</span></li>)}</ul></div>
          {withHrs.length>0&&<div className='ccd'><div className='ctl'>{t(lang,'bestValue')}</div><ul className='top-list'>{[...withHrs].sort((a,b)=>(+a.priceBought/a.hours)-(+b.priceBought/b.hours)).slice(0,5).map(g=><li key={g.id} className='top-item'><span className='top-title'>{g.title}</span><span style={{fontSize:10,color:G.dim,flexShrink:0}}>{g.hours}h</span><span className='top-val' style={{color:G.grn}}>{(+g.priceBought/g.hours).toFixed(1)}{lang==='en'?' $/h':' zł/h'}</span></li>)}</ul></div>}
        </>}
      </>}
      {tab==='insights'&&<>{!insights.length?<div className='empty'><div className='eic'>💡</div><div className='ett'>{t(lang,'noInsights')}</div><div className='ess'>{t(lang,'addPricesAndHours')}</div></div>:<InsightsTab insights={insights} games={games} lang={lang}/>}</>}
    </div>
  );
}

function Settings({games,setGames,flash,lang,setLang}){
  const importRef=useRef(null);
  return(
    <div className='scr'>
      <div className='set-section'>
        <div className='set-section-title'>{t(lang,'language')}</div>
        <div className='lang-row'>
          <button type='button' className={'lang-btn'+(lang==='pl'?' on':'')} onClick={()=>{setLang('pl');localStorage.setItem(LS_LANG,'pl');}}>🇵🇱 Polski</button>
          <button type='button' className={'lang-btn'+(lang==='en'?' on':'')} onClick={()=>{setLang('en');localStorage.setItem(LS_LANG,'en');}}>🇬🇧 English</button>
        </div>
      </div>
      <div className='set-section'>
        <div className='set-section-title'>{t(lang,'data')}</div>
        <div className='set-row' onClick={()=>exportData(games,lang)}>
          <span className='set-row-ico'>⬆️</span><div className='set-row-body'><div className='set-row-title'>{t(lang,'exportData')}</div><div className='set-row-desc'>{t(lang,'exportDesc',{n:games.length})}</div></div><span className='set-row-arrow'>›</span>
        </div>
        <div className='set-row' onClick={()=>importRef.current?.click()}>
          <span className='set-row-ico'>⬇️</span><div className='set-row-body'><div className='set-row-title'>{t(lang,'importData')}</div><div className='set-row-desc'>{t(lang,'importDesc')}</div></div><span className='set-row-arrow'>›</span>
        </div>
        <input ref={importRef} type='file' accept='.json' style={{display:'none'}} onChange={e=>{if(!e.target.files[0])return;importData(e.target.files[0],g=>{setGames(g);flash(t(lang,'imported',{n:g.length}));},err=>flash('❌ '+err));e.target.value='';}}/>
      </div>
      <div className='set-section'>
        <div className='set-section-title'>{t(lang,'info')}</div>
        <div className='set-row' onClick={()=>window.open('https://matiseekk-dot.github.io/Games/privacy.html','_blank')}>
          <span className='set-row-ico'>🔒</span><div className='set-row-body'><div className='set-row-title'>{t(lang,'privacyPolicy')}</div><div className='set-row-desc'>{t(lang,'privacyDesc')}</div></div><span className='set-row-arrow'>›</span>
        </div>
        <div className='set-row' onClick={()=>window.open('https://rawg.io','_blank')}>
          <span className='set-row-ico'>🎮</span><div className='set-row-body'><div className='set-row-title'>{t(lang,'poweredBy')}</div><div className='set-row-desc'>{t(lang,'poweredByDesc')}</div></div><span className='set-row-arrow'>›</span>
        </div>
        <div className='set-row' style={{cursor:'default'}}>
          <span className='set-row-ico'>ℹ️</span><div className='set-row-body'><div className='set-row-title'>{t(lang,'appInfo')}</div><div className='set-row-desc'>{t(lang,'appInfoDesc',{ver:APP_VER})}</div></div><span className='set-badge'>v{APP_VER}</span>
        </div>
      </div>
      <div className='set-section'>
        <div className='set-section-title'>{t(lang,'dangerZone')}</div>
        <div className='set-row' onClick={()=>{if(window.confirm(t(lang,'clearConfirm',{n:games.length}))){setGames([]);flash(t(lang,'cleared'));}}} style={{borderColor:'rgba(255,77,109,.2)'}}>
          <span className='set-row-ico'>🗑</span><div className='set-row-body'><div className='set-row-title' style={{color:G.red}}>{t(lang,'clearCollection')}</div><div className='set-row-desc'>{t(lang,'clearDesc',{n:games.length})}</div></div><span className='set-row-arrow' style={{color:G.red}}>›</span>
        </div>
      </div>
    </div>
  );
}

export default function App(){
  const [games,setGamesRaw]    = useState(()=>lsRead());
  const [onboarded,setOnboard] = useState(()=>isOnboarded());
  const [lang,setLang]         = useState(()=>getLang());
  const [tab,setTab]           = useState('home');
  const [flt,setFlt]           = useState('all');
  const [q,setQ]               = useState('');
  const [modal,setModal]       = useState(null);
  const [toast,setToast]       = useState(null);
  const [notifPerm,setNotifP]  = useState(()=>'Notification'in window?Notification.permission:'denied');

  const setGames=useCallback(val=>{setGamesRaw(prev=>{const next=typeof val==='function'?val(prev):val;lsWrite(next);return next;});},[]);
  useEffect(()=>{registerSW().then(()=>{const g=games.filter(g=>g.notifyEnabled&&g.releaseDate);if(g.length&&Notification.permission==='granted')checkReleases(g);});},[]);// eslint-disable-line
  const flash=useCallback(msg=>{setToast(msg);setTimeout(()=>setToast(null),2200);},[]);
  const requestNotif=async()=>{const p=await requestNotifPerm();setNotifP(p);return p;};

  function handleSave(form){
    const isEdit=!!form.id;const id=isEdit?form.id:uid();const game={...form,id};
    setGames(prev=>isEdit?prev.map(g=>g.id===id?game:g):[...prev,game]);
    setModal(null);flash(isEdit?t(lang,'saved'):t(lang,'added'));
  }
  function handleDel(id){
    const title=games.find(g=>g.id===id)?.title||'';
    setGames(prev=>prev.filter(g=>g.id!==id));
    setModal(null);flash(t(lang,'deleted',{title}));
  }
  function handleStatusChange(id,status){
    const SM2=getSM(lang);
    setGames(prev=>prev.map(g=>g.id===id?{...g,status}:g));
    flash(t(lang,'statusChanged',{status:SM2[status]?.label}));
  }
  function toggleNotify(id){setGames(prev=>prev.map(g=>g.id===id?{...g,notifyEnabled:!g.notifyEnabled}:g));}

  if(!onboarded)return(<><style>{CSS}</style><Onboarding onDone={()=>{setOnboarded(true);setOnboard(true);}} lang={lang}/></>);

  const SM2=getSM(lang);
  const upcomingCount=games.filter(g=>g.releaseDate&&daysUntil(g.releaseDate)>=0).length;
  const chips=[{k:'all',l:t(lang,'allGames')},...Object.entries(SM2).map(([k,m])=>({k,l:m.label}))];
  const visible=games.filter(g=>flt==='all'||g.status===flt).filter(g=>!q||g.title.toLowerCase().includes(q.toLowerCase()));

  return(
    <>
      <style>{CSS}</style>
      <div className='app'>
        <div className='hdr'>
          <div className='htop'>
            <div className='logo'><div className='lico'>PS5</div><div><div className='lnm'>VAULT</div><div className='lsb'>Game Tracker</div></div></div>
            <button type='button' className='abtn' onClick={()=>setModal('add')}>+</button>
          </div>
          <div className='tabs'>
            <button type='button' className={'tab'+(tab==='home'?' on':'')} onClick={()=>setTab('home')}>{t(lang,'home')}</button>
            <button type='button' className={'tab'+(tab==='col'?' on':'')} onClick={()=>setTab('col')}>{t(lang,'collection')}</button>
            <button type='button' className={'tab'+(tab==='upc'?' on':'')} onClick={()=>setTab('upc')} style={{position:'relative'}}>{t(lang,'releases')}{upcomingCount>0&&<span className='tab-dot'/>}</button>
            <button type='button' className={'tab'+(tab==='st'?' on':'')} onClick={()=>setTab('st')}>{t(lang,'stats')}</button>
            <button type='button' className={'tab'+(tab==='cfg'?' on':'')} onClick={()=>setTab('cfg')}>{t(lang,'settings')}</button>
          </div>
        </div>

        {tab==='home'&&<Home games={games} onOpen={setModal} onStatusChange={handleStatusChange} onAddFirst={()=>setModal('add')} lang={lang}/>}

        {tab==='col'&&<>
          <div className='sw'><span className='sx'>🔍</span><input className='si' value={q} onChange={e=>setQ(e.target.value)} placeholder={t(lang,'searchPlaceholder')}/></div>
          <div className='toolbar'>
            <button type='button' className='tbtn' onClick={()=>exportData(games,lang)}>{t(lang,'export')}</button>
            <label className='tbtn'>{t(lang,'import')}<input type='file' accept='.json' style={{display:'none'}} onChange={e=>{if(!e.target.files[0])return;importData(e.target.files[0],g=>{setGames(g);flash(t(lang,'imported',{n:g.length}));},err=>flash('❌ '+err));e.target.value='';}}/></label>
          </div>
          <div className='chips'>{chips.map(c=><button type='button' key={c.k} className={'chip'+(flt===c.k?' on':'')} onClick={()=>setFlt(c.k)}>{c.l}</button>)}</div>
          <div className='lst'>
            {visible.length===0
              ?<div className='empty'><div className='eic'>🎮</div><div className='ett'>{q?t(lang,'noResults'):t(lang,'noGames')}</div><div className='ess'>{q?t(lang,'noResultsFor',{q}):t(lang,'addFirst')}</div>{!q&&<button className='empty-cta' onClick={()=>setModal('add')}>{t(lang,'addGame')}</button>}</div>
              :visible.map(g=>{const m=SM2[g.status]||SM2.planuje;const roi=g.priceSold!=null?+(g.priceSold||0) - +(g.priceBought||0):null;return(
                <div key={g.id} className='gc' style={{'--c':m.c,'--bg':m.bg}} onClick={()=>setModal(g)}>
                  {g.cover?<div className='gcov' style={{backgroundImage:`url(${g.cover})`}}/>:<div className='gcov0'><div className='gab'>{g.abbr||'??'}</div></div>}
                  <div className='gcnt'>
                    <div className='gbdy'><div className='gtt'>{g.title}</div><div className='gmt'><span className='gsb'>{m.label}</span>{g.genre&&<span className='gmp'>{g.genre}</span>}{g.year&&<span className='gmp'>📅{g.year}</span>}{!!g.hours&&<span className='gmp'>⏱{g.hours}h</span>}<ReleaseBadge releaseDate={g.releaseDate} lang={lang}/></div></div>
                    <div className='grt'>
                      {g.rating!=null?<><span className='grn'>{g.rating}</span><span className='grd'>/10</span></>:<span style={{color:G.dim,fontSize:17}}>—</span>}
                      {g.notifyEnabled&&<span style={{fontSize:12}}>🔔</span>}
                      {g.status==='psplus'&&<span style={{fontSize:11,fontWeight:700,color:G.gld}}>PS+</span>}
                      {roi!==null?<span className={'gprice-roi '+(roi>=0?'roi-pos':'roi-neg')}>{roi>=0?'+':''}{pln(roi,lang)}</span>:!!+g.priceBought&&<span className='gprice'>{pln(+g.priceBought,lang)}</span>}
                    </div>
                  </div>
                </div>
              );})
            }
          </div>
        </>}

        {tab==='upc'&&<Upcoming games={games} onOpen={setModal} onToggleNotify={toggleNotify} onStatusChange={handleStatusChange} notifPerm={notifPerm} onRequestNotif={requestNotif} lang={lang}/>}
        {tab==='st'&&<Stats games={games} lang={lang}/>}
        {tab==='cfg'&&<Settings games={games} setGames={setGames} flash={flash} lang={lang} setLang={setLang}/>}

        {modal&&<Modal game={modal==='add'?null:modal} onSave={handleSave} onDel={handleDel} onClose={()=>setModal(null)} notifPerm={notifPerm} onRequestNotif={requestNotif} lang={lang}/>}
        <Toast msg={toast}/>
      </div>
    </>
  );
}
