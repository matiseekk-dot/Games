import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const RAWG_KEY = "0c13edec026d489a97cc183170d796fd";

const SM = {
  gram:      { label:"Gram",      c:"#00D4FF", bg:"rgba(0,212,255,.13)" },
  ukonczone: { label:"Ukończone", c:"#39FF6E", bg:"rgba(57,255,110,.13)" },
  planuje:   { label:"Planuję",   c:"#A78BFA", bg:"rgba(167,139,250,.13)" },
  porzucone: { label:"Porzucone", c:"#FF4D6D", bg:"rgba(255,77,109,.13)" },
};
const GENRES = ["Action","RPG","FPS","Horror","Sport","Racing","Platformer","Puzzle","Adventure","Strategia","Fighting","Indie","Inne"];
const RMAP   = {"action":"Action","role-playing-games-rpg":"RPG","shooter":"FPS","horror":"Horror","sports":"Sport","racing":"Racing","platformer":"Platformer","puzzle":"Puzzle","adventure":"Adventure","strategy":"Strategia","fighting":"Fighting","indie":"Indie"};
const G = { bg:"#080B14", card:"#0D1120", card2:"#111827", bdr:"#1E2A42", txt:"#E8EDF8", dim:"#5A6A8A", blu:"#00D4FF", grn:"#39FF6E", pur:"#A78BFA", red:"#FF4D6D", gld:"#FFD166", org:"#FF9F1C" };
const EF = { title:"", abbr:"", status:"planuje", year:new Date().getFullYear(), genre:"", hours:"", rating:"", notes:"", cover:"", releaseDate:"", notifyEnabled:false, priceBought:"", priceSold:"", storeBought:"" };
const STORES = ["PSN","Disc","CDP","Media Expert","Allegro","OLX","Klucz","Inne"];

function uid()  { return "g" + Date.now().toString(36) + Math.random().toString(36).slice(2,5); }
function mkAbbr(t) { const w=t.trim().split(/\s+/).filter(Boolean); return !w.length?"??":(w.length===1?w[0].slice(0,2):w[0][0]+w[1][0]).toUpperCase(); }

// ─── DATES ────────────────────────────────────────────────────────────────────
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today   = new Date(); today.setHours(0,0,0,0);
  const release = new Date(dateStr); release.setHours(0,0,0,0);
  return Math.round((release - today) / 86400000);
}
function fmtDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("pl-PL", { day:"numeric", month:"short", year:"numeric" });
}

// ─── STORAGE ─────────────────────────────────────────────────────────────────
const KEY = "ps5vault_v1";
function lsRead()    { try { return JSON.parse(localStorage.getItem(KEY)||"[]"); } catch { return []; } }
function lsWrite(g)  { try { localStorage.setItem(KEY, JSON.stringify(g)); } catch {} }

// ─── SERVICE WORKER + NOTIFICATIONS ──────────────────────────────────────────
async function registerSW() {
  if (!("serviceWorker" in navigator)) return;
  try { await navigator.serviceWorker.register("/Games/sw.js"); } catch {}
}

async function requestNotifPermission() {
  if (!("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied")  return "denied";
  return await Notification.requestPermission();
}

async function checkReleasesNow(games) {
  if (!("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  if (!reg.active) return;
  reg.active.postMessage({ type:"CHECK_RELEASES", games });
}

// ─── RAWG ─────────────────────────────────────────────────────────────────────
async function rawgSearch(q) {
  try {
    const r = await fetch(`https://api.rawg.io/api/games?search=${encodeURIComponent(q)}&page_size=6&key=${RAWG_KEY}`);
    if (!r.ok) return [];
    return (await r.json()).results.map(g => ({
      id: g.id, title: g.name,
      year: g.released ? +g.released.slice(0,4) : new Date().getFullYear(),
      releaseDate: g.released || "",
      genre: (g.genres||[]).map(x=>RMAP[x.slug]).filter(Boolean)[0] || g.genres?.[0]?.name || "",
      cover: g.background_image || "",
      abbr: mkAbbr(g.name),
    }));
  } catch { return []; }
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Syne:wght@400;600;700&display=swap');
@keyframes spin    { to { transform:rotate(360deg); } }
@keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.5} }
@keyframes slideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }

*,*::before,*::after { box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; }
html { -webkit-text-size-adjust:100%; overflow-x:hidden; max-width:100%; }
body { overflow-x:hidden; max-width:100%; background:${G.bg}; color:${G.txt}; font-family:'Syne',sans-serif; -webkit-font-smoothing:antialiased; }
#root { overflow-x:hidden; max-width:100%; }

.app { display:flex; flex-direction:column; min-height:100dvh; max-width:100%; overflow-x:hidden; }

/* HEADER */
.hdr { max-width:100%; overflow:hidden; padding-top:calc(env(safe-area-inset-top,0px) + 44px); padding-bottom:12px; padding-left:max(16px,env(safe-area-inset-left,0px)); padding-right:max(16px,env(safe-area-inset-right,0px)); }
.htop { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:14px; }
.logo { display:flex; align-items:center; gap:10px; min-width:0; }
.lico { width:34px; height:34px; flex-shrink:0; border-radius:9px; background:linear-gradient(135deg,${G.blu},#0060FF); display:flex; align-items:center; justify-content:center; font-family:'Orbitron',monospace; font-size:11px; font-weight:900; color:#fff; }
.lnm  { font-family:'Orbitron',monospace; font-size:15px; font-weight:700; letter-spacing:.1em; white-space:nowrap; }
.lsb  { font-size:9px; color:${G.dim}; letter-spacing:.2em; text-transform:uppercase; }
.abtn { width:44px; height:44px; flex-shrink:0; border:none; border-radius:10px; background:linear-gradient(135deg,${G.blu},#0060FF); color:#fff; font-size:22px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
.abtn:active { opacity:.7; }

.tabs { display:flex; gap:3px; background:${G.card}; border:1px solid ${G.bdr}; border-radius:13px; padding:4px; }
.tab  { flex:1; min-height:44px; padding:8px 2px; border:none; border-radius:9px; background:transparent; color:${G.dim}; font-family:'Syne',sans-serif; font-size:10px; font-weight:600; cursor:pointer; white-space:nowrap; position:relative; }
.tab.on { background:rgba(0,212,255,.15); color:${G.blu}; }
.tab-dot { position:absolute; top:6px; right:6px; width:6px; height:6px; border-radius:50%; background:${G.org}; animation:pulse 1.5s infinite; }

/* SEARCH */
.sw { position:relative; padding:10px 16px 6px; max-width:100%; }
.si { display:block; width:100%; max-width:100%; background:${G.card}; border:1px solid ${G.bdr}; border-radius:12px; padding:11px 12px 11px 36px; color:${G.txt}; font-family:'Syne',sans-serif; font-size:16px; outline:none; -webkit-appearance:none; }
.si:focus { border-color:${G.blu}; }
.sx { position:absolute; left:28px; top:50%; transform:translateY(-50%); pointer-events:none; }

/* CHIPS */
.chips { display:flex; gap:6px; padding:6px 16px 10px; overflow-x:auto; -webkit-overflow-scrolling:touch; max-width:100%; }
.chips::-webkit-scrollbar { display:none; }
.chip { padding:7px 14px; border-radius:20px; border:1px solid ${G.bdr}; background:${G.card}; color:${G.dim}; font-size:11px; font-weight:600; white-space:nowrap; flex-shrink:0; cursor:pointer; }
.chip.on { border-color:${G.blu}; color:${G.blu}; background:rgba(0,212,255,.1); }

/* LIST */
.lst { flex:1; overflow-y:auto; overflow-x:hidden; -webkit-overflow-scrolling:touch; padding:4px 16px calc(env(safe-area-inset-bottom,0px) + 24px); max-width:100%; }

/* GAME CARD */
.gc { width:100%; max-width:100%; background:${G.card}; border:1px solid ${G.bdr}; border-radius:14px; margin-bottom:9px; display:flex; align-items:stretch; cursor:pointer; position:relative; overflow:hidden; }
.gc::before { content:''; position:absolute; top:0; left:0; width:3px; height:100%; background:var(--c); opacity:.75; z-index:1; }
.gc:active { opacity:.75; }
.gcov  { width:56px; flex-shrink:0; background-size:cover; background-position:center; background-color:${G.card2}; }
.gcov0 { width:56px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:${G.card2}; }
.gab   { font-family:'Orbitron',monospace; font-size:12px; font-weight:900; color:var(--c); }
.gcnt  { flex:1; min-width:0; padding:10px 12px 10px 14px; display:flex; gap:8px; align-items:flex-start; overflow:hidden; }
.gbdy  { flex:1; min-width:0; overflow:hidden; }
.gtt   { font-size:14px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:4px; }
.gmt   { display:flex; gap:6px; flex-wrap:wrap; align-items:center; }
.gsb   { font-size:10px; font-weight:700; padding:2px 7px; border-radius:5px; background:var(--bg); color:var(--c); }
.gmp   { font-size:10px; color:${G.dim}; }
.grt   { display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0; }
.grn   { font-family:'Orbitron',monospace; font-size:17px; font-weight:900; color:${G.gld}; line-height:1; }
.grd   { font-size:9px; color:${G.dim}; }

/* RELEASE BADGE */
.rbdg-today { padding:3px 8px; border-radius:6px; background:rgba(57,255,110,.15); color:${G.grn}; font-size:10px; font-weight:700; white-space:nowrap; border:1px solid rgba(57,255,110,.3); animation:pulse 1s infinite; }
.rbdg-soon  { padding:3px 8px; border-radius:6px; background:rgba(255,159,28,.15); color:${G.org}; font-size:10px; font-weight:700; white-space:nowrap; border:1px solid rgba(255,159,28,.3); }
.rbdg-upcoming { padding:3px 8px; border-radius:6px; background:rgba(167,139,250,.12); color:${G.pur}; font-size:10px; font-weight:700; white-space:nowrap; }
.rbdg-tba   { padding:3px 8px; border-radius:6px; background:rgba(90,106,138,.15); color:${G.dim}; font-size:10px; font-weight:600; white-space:nowrap; }

/* NOTIF BANNER */
.notif-banner { margin:0 16px 10px; padding:12px 14px; background:rgba(0,212,255,.07); border:1px solid rgba(0,212,255,.2); border-radius:12px; display:flex; gap:10px; align-items:center; }
.notif-banner-txt { flex:1; font-size:12px; color:${G.txt}; line-height:1.4; }
.notif-banner-btn { padding:7px 12px; border:none; border-radius:8px; background:${G.blu}; color:#000; font-family:'Syne',sans-serif; font-size:11px; font-weight:700; cursor:pointer; white-space:nowrap; flex-shrink:0; }

/* UPCOMING SECTION */
.section-hdr { display:flex; align-items:center; justify-content:space-between; padding:0 16px; margin-bottom:10px; }
.section-title { font-family:'Orbitron',monospace; font-size:11px; font-weight:700; color:${G.dim}; letter-spacing:.1em; text-transform:uppercase; }
.section-count { font-size:10px; color:${G.dim}; }

.upc-card { width:100%; max-width:100%; background:${G.card}; border:1px solid ${G.bdr}; border-radius:14px; margin-bottom:9px; overflow:hidden; cursor:pointer; }
.upc-card:active { opacity:.75; }
.upc-banner { width:100%; height:70px; background-size:cover; background-position:center top; background-color:${G.card2}; position:relative; }
.upc-banner-overlay { position:absolute; inset:0; background:linear-gradient(to right, rgba(8,11,20,.9) 0%, transparent 100%); }
.upc-banner-title { position:absolute; bottom:8px; left:12px; font-size:14px; font-weight:700; font-family:'Syne',sans-serif; }
.upc-body { padding:10px 12px; display:flex; align-items:center; justify-content:space-between; gap:8px; }
.upc-date { font-size:12px; color:${G.dim}; }
.upc-actions { display:flex; align-items:center; gap:8px; }
.notif-toggle { display:flex; align-items:center; gap:6px; font-size:11px; color:${G.dim}; cursor:pointer; }
.notif-toggle-ico { font-size:16px; }

/* EMPTY */
.empty { text-align:center; padding:60px 16px; color:${G.dim}; }
.eic { font-size:40px; margin-bottom:12px; opacity:.4; }
.ett { font-size:15px; font-weight:700; margin-bottom:6px; }
.ess { font-size:12px; line-height:1.6; }

/* STATS */
.sta { flex:1; overflow-y:auto; overflow-x:hidden; -webkit-overflow-scrolling:touch; padding:8px 16px calc(env(safe-area-inset-bottom,0px) + 24px); max-width:100%; }
.kgd { display:grid; grid-template-columns:1fr 1fr; gap:9px; margin-bottom:12px; }
.kcd { background:${G.card}; border:1px solid ${G.bdr}; border-radius:13px; padding:14px; overflow:hidden; }
.kvl { font-family:'Orbitron',monospace; font-size:22px; font-weight:900; color:var(--c); line-height:1; margin-bottom:4px; }
.klb { font-size:9px; color:${G.dim}; font-weight:600; letter-spacing:.07em; text-transform:uppercase; }
.ccd { background:${G.card}; border:1px solid ${G.bdr}; border-radius:13px; padding:14px; margin-bottom:10px; overflow:hidden; max-width:100%; }
.ctl { font-size:10px; font-weight:700; color:${G.dim}; letter-spacing:.1em; text-transform:uppercase; margin-bottom:12px; }

/* MODAL */
.ovr { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(4,6,14,.9); z-index:9999; display:flex; align-items:flex-end; }
.mdl { width:100%; max-width:100%; overflow:visible; overflow-y:auto; -webkit-overflow-scrolling:touch; background:${G.card2}; border-top:1px solid ${G.bdr}; border-radius:20px 20px 0 0; padding:18px 16px calc(env(safe-area-inset-bottom,0px) + 24px); max-height:90dvh; animation:slideUp .22s ease; }
.mhdl { width:32px; height:4px; background:${G.bdr}; border-radius:2px; margin:0 auto 16px; }
.mttl { font-family:'Orbitron',monospace; font-size:13px; font-weight:700; color:${G.blu}; letter-spacing:.06em; margin-bottom:16px; }

/* RAWG */
.rwrp { position:relative; margin-bottom:12px; max-width:100%; }
.rlbl { display:block; font-size:9px; font-weight:700; color:${G.dim}; letter-spacing:.1em; text-transform:uppercase; margin-bottom:5px; }
.rrow { display:flex; gap:6px; align-items:center; max-width:100%; overflow:hidden; }
.rin  { flex:1; min-width:0; display:block; background:${G.bg}; border:1px solid ${G.blu}; border-radius:9px; padding:10px 11px; color:${G.txt}; font-family:'Syne',sans-serif; font-size:16px; outline:none; -webkit-appearance:none; }
.rin::placeholder { color:${G.dim}; }
.rbdg2 { font-size:9px; font-weight:700; padding:4px 8px; border-radius:6px; background:rgba(0,212,255,.15); color:${G.blu}; flex-shrink:0; white-space:nowrap; }
.rhnt { font-size:10px; color:${G.dim}; margin-top:4px; }
.rdd  { position:absolute; top:100%; left:0; right:0; background:${G.card}; border:1px solid ${G.bdr}; border-radius:12px; z-index:99998; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,.6); margin-top:4px; }
.rit  { display:flex; align-items:center; gap:10px; padding:10px 12px; cursor:pointer; border-bottom:1px solid ${G.bdr}; min-height:52px; }
.rit:last-child { border-bottom:none; }
.rit:active { background:rgba(0,212,255,.08); }
.rthm { width:40px; height:40px; border-radius:7px; object-fit:cover; flex-shrink:0; background:${G.bg}; }
.rph  { width:40px; height:40px; border-radius:7px; background:${G.bg}; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
.rinf { flex:1; min-width:0; overflow:hidden; }
.rnm  { font-size:13px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.rmt  { font-size:10px; color:${G.dim}; margin-top:2px; }

.covp { display:block; width:100%; max-width:100%; height:90px; border-radius:10px; object-fit:cover; margin-bottom:11px; border:1px solid ${G.bdr}; }

/* FORM */
.fg  { margin-bottom:11px; max-width:100%; }
.fl  { display:block; font-size:9px; font-weight:700; color:${G.dim}; letter-spacing:.1em; text-transform:uppercase; margin-bottom:5px; }
.fi,.fs,.fta { display:block; width:100%; max-width:100%; background:${G.bg}; border:1px solid ${G.bdr}; border-radius:9px; padding:10px 11px; color:${G.txt}; font-family:'Syne',sans-serif; font-size:16px; outline:none; -webkit-appearance:none; appearance:none; }
.fi:focus,.fs:focus,.fta:focus { border-color:${G.blu}; }
.fs option { background:${G.card2}; color:${G.txt}; }
.fta { resize:none; height:68px; }
.f2  { display:grid; grid-template-columns:1fr 1fr; gap:9px; max-width:100%; }
.ssg { display:grid; grid-template-columns:1fr 1fr; gap:6px; max-width:100%; }
.sso { width:100%; min-height:44px; padding:8px 4px; border-radius:8px; border:1px solid ${G.bdr}; background:transparent; color:${G.dim}; font-family:'Syne',sans-serif; font-size:12px; font-weight:600; cursor:pointer; text-align:center; }
.sso.on { border-color:var(--c); color:var(--c); background:var(--bg); }

/* NOTIFY TOGGLE IN FORM */
.ntgl { display:flex; align-items:center; justify-content:space-between; padding:12px 14px; background:${G.bg}; border:1px solid ${G.bdr}; border-radius:9px; cursor:pointer; }
.ntgl-label { font-size:14px; color:${G.txt}; }
.ntgl-sub   { font-size:10px; color:${G.dim}; margin-top:2px; }
.ntgl-sw    { width:44px; height:26px; border-radius:13px; background:${G.bdr}; position:relative; flex-shrink:0; transition:background .2s; }
.ntgl-sw.on { background:${G.blu}; }
.ntgl-knob  { position:absolute; top:3px; left:3px; width:20px; height:20px; border-radius:50%; background:#fff; transition:transform .2s; }
.ntgl-sw.on .ntgl-knob { transform:translateX(18px); }

.mac { display:flex; gap:8px; margin-top:16px; max-width:100%; }
.bpr { flex:1; min-height:50px; padding:13px; border:none; border-radius:11px; background:linear-gradient(135deg,${G.blu},#0060FF); color:#fff; font-family:'Orbitron',monospace; font-size:11px; font-weight:700; letter-spacing:.07em; cursor:pointer; }
.bpr:active { opacity:.75; }
.bcn { min-height:50px; padding:13px 14px; border:1px solid ${G.bdr}; border-radius:11px; background:${G.card}; color:${G.dim}; font-family:'Syne',sans-serif; font-size:13px; font-weight:600; cursor:pointer; white-space:nowrap; }
.bdl { min-height:50px; padding:13px 14px; border:1px solid rgba(255,77,109,.3); border-radius:11px; background:rgba(255,77,109,.1); color:${G.red}; font-size:16px; cursor:pointer; }


/* FINANCE */
.fin-row { display:grid; grid-template-columns:1fr 1fr; gap:9px; max-width:100%; }
.fin-divider { height:1px; background:${G.bdr}; margin:14px 0 12px; }
.fin-section-lbl { font-size:9px; font-weight:700; color:${G.org}; letter-spacing:.12em; text-transform:uppercase; margin-bottom:10px; }
.sold-toggle { display:flex; align-items:center; justify-content:space-between; padding:11px 14px; background:${G.bg}; border:1px solid ${G.bdr}; border-radius:9px; cursor:pointer; margin-bottom:11px; }
.sold-toggle-lbl { font-size:14px; color:${G.txt}; }
.sold-sw { width:44px; height:26px; border-radius:13px; background:${G.bdr}; position:relative; flex-shrink:0; transition:background .2s; }
.sold-sw.on { background:${G.grn}; }
.sold-knob { position:absolute; top:3px; left:3px; width:20px; height:20px; border-radius:50%; background:#fff; transition:transform .2s; }
.sold-sw.on .sold-knob { transform:translateX(18px); }
/* card finance badge */
.gprice { font-size:11px; font-weight:700; color:${G.org}; white-space:nowrap; }
.gprice-sold { font-size:11px; font-weight:700; color:${G.grn}; white-space:nowrap; }
/* finance stats */
.fin-kgd { display:grid; grid-template-columns:1fr 1fr; gap:9px; margin-bottom:12px; }
.fin-kcd { border-radius:13px; padding:14px; overflow:hidden; border:1px solid ${G.bdr}; }
.fin-kv { font-family:'Orbitron',monospace; font-size:18px; font-weight:900; color:var(--c); line-height:1; margin-bottom:4px; }
.fin-kl { font-size:9px; color:${G.dim}; font-weight:600; letter-spacing:.07em; text-transform:uppercase; }
.roi-positive { color:${G.grn}; }
.roi-negative { color:${G.red}; }
.top-list { list-style:none; }
.top-item { display:flex; align-items:center; justify-content:space-between; padding:9px 0; border-bottom:1px solid ${G.bdr}; gap:8px; }
.top-item:last-child { border-bottom:none; }
.top-title { flex:1; min-width:0; font-size:13px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.top-val { font-family:'Orbitron',monospace; font-size:12px; font-weight:700; flex-shrink:0; }

.tst { position:fixed; bottom:calc(env(safe-area-inset-bottom,0px) + 32px); left:50%; transform:translateX(-50%); background:${G.grn}; color:#000; font-family:'Orbitron',monospace; font-size:11px; font-weight:700; padding:9px 20px; border-radius:20px; z-index:99999; white-space:nowrap; pointer-events:none; }
`;

// ─── RELEASE BADGE ────────────────────────────────────────────────────────────
function ReleaseBadge({ releaseDate }) {
  if (!releaseDate) return null;
  const days = daysUntil(releaseDate);
  if (days === null) return <span className="rbdg-tba">TBA</span>;
  if (days < 0)  return null; // already released
  if (days === 0) return <span className="rbdg-today">🎉 Dziś!</span>;
  if (days <= 3)  return <span className="rbdg-soon">⏰ {days}d</span>;
  if (days <= 30) return <span className="rbdg-upcoming">📅 {days} dni</span>;
  return <span className="rbdg-upcoming">📅 {fmtDate(releaseDate)}</span>;
}

// ─── TOOLTIP ──────────────────────────────────────────────────────────────────
const CTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return <div style={{background:G.card2,border:`1px solid ${G.bdr}`,borderRadius:8,padding:"6px 10px",fontSize:11,color:G.txt}}>
    <div style={{color:G.dim,marginBottom:2}}>{label}</div>
    <div style={{fontWeight:700,color:payload[0].fill||G.blu}}>{payload[0].value}</div>
  </div>;
};

// ─── RAWG SEARCH ──────────────────────────────────────────────────────────────
function RawgSearch({ onSelect }) {
  const [q,    setQ]    = useState("");
  const [res,  setRes]  = useState([]);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = useRef(null);

  const search = val => {
    setQ(val);
    clearTimeout(timer.current);
    if (!val.trim()) { setRes([]); setOpen(false); return; }
    setBusy(true);
    timer.current = setTimeout(async () => {
      const r = await rawgSearch(val);
      setRes(r); setOpen(r.length > 0); setBusy(false);
    }, 450);
  };

  const pick = item => { onSelect(item); setQ(""); setRes([]); setOpen(false); };

  return (
    <div className="rwrp">
      <label className="rlbl">🔍 Szukaj w RAWG</label>
      <div className="rrow">
        <input className="rin" value={q} onChange={e=>search(e.target.value)} placeholder="Wpisz nazwę gry..." autoComplete="off"/>
        {busy
          ? <span style={{flexShrink:0,display:"inline-block",animation:"spin .8s linear infinite"}}>⏳</span>
          : <span className="rbdg2">RAWG</span>}
      </div>
      <div className="rhnt">Wybierz grę żeby auto-uzupełnić pola + datę premiery</div>
      {open && <div className="rdd">
        {res.map(r=>(
          <div key={r.id} className="rit" onClick={()=>pick(r)}>
            {r.cover ? <img className="rthm" src={r.cover} alt="" loading="lazy"/> : <div className="rph">🎮</div>}
            <div className="rinf">
              <div className="rnm">{r.title}</div>
              <div className="rmt">{r.year}{r.genre?" · "+r.genre:""}{r.releaseDate?" · "+fmtDate(r.releaseDate):""}</div>
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ game, onSave, onDel, onClose, notifPermission, onRequestNotif }) {
  const isEdit = !!game;
  const [f, setF] = useState(() => game ? {...game} : {...EF});

  const upd  = (k, v) => setF(p => { const n={...p,[k]:v}; if(k==="title"&&!isEdit) n.abbr=mkAbbr(v); return n; });
  const fill = item  => setF(p => ({...p, title:item.title, abbr:item.abbr, year:item.year, genre:item.genre||p.genre, cover:item.cover, releaseDate:item.releaseDate||p.releaseDate}));

  function handleSave() {
    if (!f.title.trim()) { alert("Wpisz tytuł gry"); return; }
    const abbr   = (f.abbr||"").trim().slice(0,2).toUpperCase() || mkAbbr(f.title);
    const rating = f.rating!==""&&!isNaN(+f.rating) ? Math.min(10,Math.max(1,+f.rating)) : null;
    onSave({...f, abbr, year:+f.year||new Date().getFullYear(), hours:+f.hours||0, rating});
  }

  const days = daysUntil(f.releaseDate);

  return (
    <div className="ovr">
      <div className="mdl">
        <div className="mhdl"/>
        <div className="mttl">{isEdit?"✎ EDYTUJ GRĘ":"+ DODAJ GRĘ"}</div>

        <RawgSearch onSelect={fill}/>
        {f.cover && <img className="covp" src={f.cover} alt=""/>}

        <div className="fg"><label className="fl">Tytuł *</label>
          <input className="fi" value={f.title} onChange={e=>upd("title",e.target.value)} placeholder="np. God of War Ragnarök"/>
        </div>
        <div className="f2">
          <div className="fg"><label className="fl">Skrót (2 lit.)</label>
            <input className="fi" value={f.abbr} maxLength={2} onChange={e=>upd("abbr",e.target.value.toUpperCase())} placeholder="GW"/>
          </div>
          <div className="fg"><label className="fl">Rok</label>
            <input className="fi" inputMode="numeric" value={f.year} onChange={e=>upd("year",e.target.value)}/>
          </div>
        </div>

        <div className="fg">
          <label className="fl">
            Data premiery
            {days !== null && days >= 0 && (
              <span style={{marginLeft:8,fontWeight:700,color: days===0?G.grn:days<=3?G.org:G.pur}}>
                {days===0?"— dziś!":` — za ${days} dni`}
              </span>
            )}
          </label>
          <input className="fi" type="date" value={f.releaseDate} onChange={e=>upd("releaseDate",e.target.value)}
            style={{colorScheme:"dark"}}/>
          <div style={{fontSize:10,color:G.dim,marginTop:4}}>Zostaw puste jeśli data nieznana (TBA)</div>
        </div>

        <div className="fg">
          <label className="fl">Status</label>
          <div className="ssg">
            {Object.entries(SM).map(([k,m])=>(
              <button key={k} type="button" className={"sso"+(f.status===k?" on":"")}
                style={{"--c":m.c,"--bg":m.bg}} onClick={()=>upd("status",k)}>{m.label}</button>
            ))}
          </div>
        </div>

        <div className="f2">
          <div className="fg"><label className="fl">Gatunek</label>
            <select className="fs" value={f.genre} onChange={e=>upd("genre",e.target.value)}>
              <option value="">— wybierz —</option>
              {GENRES.map(g=><option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="fg"><label className="fl">Godziny</label>
            <input className="fi" inputMode="decimal" value={f.hours} onChange={e=>upd("hours",e.target.value)} placeholder="0"/>
          </div>
        </div>

        <div className="fg"><label className="fl">Ocena (1–10)</label>
          <input className="fi" inputMode="decimal" value={f.rating??""} onChange={e=>upd("rating",e.target.value)} placeholder="—"/>
        </div>

        {/* FINANSE */}
        <div className="fin-divider"/>
        <div className="fin-section-lbl">💰 Finanse</div>
        <div className="fin-row">
          <div className="fg">
            <label className="fl">Zapłacono (PLN)</label>
            <input className="fi" inputMode="decimal" value={f.priceBought??""} onChange={e=>upd("priceBought",e.target.value)} placeholder="0"/>
          </div>
          <div className="fg">
            <label className="fl">Sklep / źródło</label>
            <select className="fs" value={f.storeBought||""} onChange={e=>upd("storeBought",e.target.value)}>
              <option value="">— wybierz —</option>
              {STORES.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="sold-toggle" onClick={()=>upd("priceSold", f.priceSold==null?"":null)}>
          <div className="sold-toggle-lbl">Sprzedałem tę grę</div>
          <div className={"sold-sw"+(f.priceSold!=null?" on":"")}>
            <div className="sold-knob"/>
          </div>
        </div>
        {f.priceSold!=null && (
          <div className="fg">
            <label className="fl">Sprzedano za (PLN)</label>
            <input className="fi" inputMode="decimal" value={f.priceSold??""} onChange={e=>upd("priceSold",e.target.value)} placeholder="0"/>
          </div>
        )}

        <div className="fg"><label className="fl">Notatki</label>
          <textarea className="fta" value={f.notes} onChange={e=>upd("notes",e.target.value)} placeholder="Twoje przemyślenia..."/>
        </div>

        {/* POWIADOMIENIA */}
        {f.releaseDate && (
          <div className="fg">
            <label className="fl">Powiadomienia o premierze</label>
            {notifPermission === "denied" ? (
              <div style={{fontSize:11,color:G.red,padding:"8px 0"}}>
                ⛔ Powiadomienia zablokowane w ustawieniach przeglądarki
              </div>
            ) : (
              <div className="ntgl" onClick={async () => {
                if (!f.notifyEnabled && notifPermission !== "granted") {
                  await onRequestNotif();
                }
                upd("notifyEnabled", !f.notifyEnabled);
              }}>
                <div>
                  <div className="ntgl-label">🔔 Powiadamiaj o premierze</div>
                  <div className="ntgl-sub">3 dni przed i w dniu premiery</div>
                </div>
                <div className={"ntgl-sw"+(f.notifyEnabled?" on":"")}>
                  <div className="ntgl-knob"/>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mac">
          <button type="button" className="bcn" onClick={onClose}>Anuluj</button>
          <button type="button" className="bpr" onClick={handleSave}>ZAPISZ</button>
          {isEdit && <button type="button" className="bdl" onClick={()=>onDel(game.id)}>🗑</button>}
        </div>
      </div>
    </div>
  );
}

// ─── UPCOMING VIEW ────────────────────────────────────────────────────────────
function Upcoming({ games, onOpen, onToggleNotify, notifPermission, onRequestNotif }) {
  const upcoming = games
    .filter(g => g.releaseDate && daysUntil(g.releaseDate) >= 0)
    .sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));

  const tba = games.filter(g => !g.releaseDate && g.status === "planuje");

  if (!upcoming.length && !tba.length) return (
    <div className="lst">
      <div className="empty">
        <div className="eic">📅</div>
        <div className="ett">Brak nadchodzących premier</div>
        <div className="ess">Dodaj datę premiery do gier ze statusem "Planuję"</div>
      </div>
    </div>
  );

  return (
    <div className="lst">
      {notifPermission === "default" && (
        <div className="notif-banner">
          <span style={{fontSize:22}}>🔔</span>
          <div className="notif-banner-txt">
            Włącz powiadomienia żeby dostawać alerty 3 dni przed premierą i w dniu premiery
          </div>
          <button className="notif-banner-btn" onClick={onRequestNotif}>Włącz</button>
        </div>
      )}

      {upcoming.length > 0 && <>
        <div className="section-hdr">
          <span className="section-title">Nadchodzące premiery</span>
          <span className="section-count">{upcoming.length} gier</span>
        </div>
        {upcoming.map(g => {
          const days = daysUntil(g.releaseDate);
          return (
            <div key={g.id} className="upc-card" onClick={() => onOpen(g)}>
              <div className="upc-banner" style={g.cover?{backgroundImage:`url(${g.cover})`}:{}}>
                <div className="upc-banner-overlay"/>
                <div className="upc-banner-title">{g.title}</div>
              </div>
              <div className="upc-body">
                <div>
                  <div style={{fontSize:12,color:G.txt,fontWeight:600,marginBottom:3}}>
                    {fmtDate(g.releaseDate)}
                  </div>
                  <ReleaseBadge releaseDate={g.releaseDate}/>
                </div>
                <div className="upc-actions" onClick={e => e.stopPropagation()}>
                  {g.genre && <span style={{fontSize:10,color:G.dim}}>{g.genre}</span>}
                  <div className="notif-toggle" onClick={async () => {
                    if (!g.notifyEnabled && notifPermission !== "granted") await onRequestNotif();
                    onToggleNotify(g.id);
                  }}>
                    <span className="notif-toggle-ico">{g.notifyEnabled ? "🔔" : "🔕"}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </>}

      {tba.length > 0 && <>
        <div className="section-hdr" style={{marginTop:16}}>
          <span className="section-title">TBA — brak daty</span>
          <span className="section-count">{tba.length}</span>
        </div>
        {tba.map(g => {
          const m = SM[g.status]||SM.planuje;
          return (
            <div key={g.id} className="gc" style={{"--c":m.c,"--bg":m.bg}} onClick={()=>onOpen(g)}>
              {g.cover
                ? <div className="gcov" style={{backgroundImage:`url(${g.cover})`}}/>
                : <div className="gcov0"><div className="gab">{g.abbr||"??"}</div></div>}
              <div className="gcnt">
                <div className="gbdy">
                  <div className="gtt">{g.title}</div>
                  <div className="gmt">
                    <span className="rbdg-tba">TBA</span>
                    {g.genre && <span className="gmp">{g.genre}</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </>}
    </div>
  );
}

// ─── STATS ────────────────────────────────────────────────────────────────────
function Stats({ games }) {
  const [finTab, setFinTab] = useState("general");
  if (!games.length) return <div className="sta"><div className="empty"><div className="eic">📈</div><div className="ett">Brak danych</div><div className="ess">Dodaj gry, żeby zobaczyć statystyki</div></div></div>;

  const hrs=games.reduce((s,g)=>s+(g.hours||0),0);
  const rated=games.filter(g=>g.rating!=null);
  const avg=rated.length?(rated.reduce((s,g)=>s+g.rating,0)/rated.length).toFixed(1):"—";
  const kpis=[
    {l:"Gier razem",     v:games.length, c:G.blu},
    {l:"Ukończone",      v:games.filter(g=>g.status==="ukonczone").length, c:G.grn},
    {l:"Godzin łącznie", v:hrs%1?hrs.toFixed(1):hrs, c:G.pur},
    {l:"Śr. ocena",      v:avg, c:G.gld},
  ];
  const sData=Object.entries(SM).map(([k,m])=>({n:m.label,v:games.filter(g=>g.status===k).length,c:m.c}));
  const gMap={}; games.forEach(g=>{if(g.genre)gMap[g.genre]=(gMap[g.genre]||0)+1;});
  const gData=Object.entries(gMap).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([n,v])=>({n,v}));
  const buckets=[1,2,3,4,5,6,7,8,9,10].map(r=>({n:String(r),v:games.filter(g=>g.rating!=null&&Math.round(g.rating)===r).length}));

  // ── FINANCE ──
  const bought     = games.filter(g=>!!+g.priceBought);
  const sold       = games.filter(g=>g.priceSold!=null&&!!+g.priceSold);
  const totalSpent = bought.reduce((s,g)=>s+ +g.priceBought,0);
  const totalEarned= sold.reduce((s,g)=>s+ +g.priceSold,0);
  const netCost    = totalSpent - totalEarned;
  const withHours  = bought.filter(g=>g.hours>0);
  const costPerHr  = withHours.length ? (withHours.reduce((s,g)=>s+ +g.priceBought,0) / withHours.reduce((s,g)=>s+g.hours,0)) : null;

  // Store breakdown
  const storeMap={}; bought.forEach(g=>{const s=g.storeBought||"Inne"; storeMap[s]=(storeMap[s]||0)+ +g.priceBought;});
  const storeData=Object.entries(storeMap).sort((a,b)=>b[1]-a[1]).map(([n,v])=>({n,v:+v.toFixed(0)}));

  // Best/worst investment (bought + sold)
  const soldGames = sold.map(g=>({...g, roi: +g.priceSold - +g.priceBought})).sort((a,b)=>b.roi-a.roi);

  // Cost per genre
  const genreCostMap={}; bought.forEach(g=>{if(g.genre){genreCostMap[g.genre]=(genreCostMap[g.genre]||0)+ +g.priceBought;}});
  const genreCostData=Object.entries(genreCostMap).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([n,v])=>({n,v:+v.toFixed(0)}));

  const finKpis=[
    {l:"Wydano łącznie",  v:totalSpent.toFixed(0)+" zł",  c:G.red,  bg:"rgba(255,77,109,.07)"},
    {l:"Odzyskano",       v:totalEarned.toFixed(0)+" zł", c:G.grn,  bg:"rgba(57,255,110,.07)"},
    {l:"Realny koszt",    v:netCost.toFixed(0)+" zł",     c:netCost>0?G.org:G.grn, bg:"rgba(255,159,28,.07)"},
    {l:"Koszt/godzinę",   v:costPerHr?costPerHr.toFixed(1)+" zł":"—", c:G.blu, bg:"rgba(0,212,255,.07)"},
  ];

  return (
    <div className="sta">
      {/* SUB TABS */}
      <div style={{display:"flex",gap:4,background:G.card,border:`1px solid ${G.bdr}`,borderRadius:11,padding:4,marginBottom:14}}>
        {[["general","🎮 Ogólne"],["finance","💰 Finanse"]].map(([k,l])=>(
          <button key={k} type="button" onClick={()=>setFinTab(k)}
            style={{flex:1,minHeight:40,padding:"7px 4px",border:"none",borderRadius:8,background:finTab===k?"rgba(0,212,255,.15)":"transparent",color:finTab===k?G.blu:G.dim,fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:600,cursor:"pointer"}}>
            {l}
          </button>
        ))}
      </div>

      {finTab==="general" && <>
        <div className="kgd">{kpis.map(k=><div key={k.l} className="kcd" style={{"--c":k.c}}><div className="kvl">{k.v}</div><div className="klb">{k.l}</div></div>)}</div>
        <div className="ccd"><div className="ctl">📊 Status kolekcji</div>
          <ResponsiveContainer width="100%" height={120}><BarChart data={sData} barSize={24} margin={{top:4,left:-20,right:4,bottom:0}}><XAxis dataKey="n" tick={{fill:G.dim,fontSize:9}} axisLine={false} tickLine={false}/><YAxis hide/><Tooltip content={<CTip/>}/><Bar dataKey="v" radius={[4,4,0,0]}>{sData.map((d,i)=><Cell key={i} fill={d.c} fillOpacity={.85}/>)}</Bar></BarChart></ResponsiveContainer>
        </div>
        {gData.length>0&&<div className="ccd"><div className="ctl">🎮 Top gatunki</div>
          <ResponsiveContainer width="100%" height={120}><BarChart data={gData} barSize={20} margin={{top:4,left:-20,right:4,bottom:0}}><XAxis dataKey="n" tick={{fill:G.dim,fontSize:9}} axisLine={false} tickLine={false}/><YAxis hide/><Tooltip content={<CTip/>}/><Bar dataKey="v" radius={[4,4,0,0]} fill={G.pur} fillOpacity={.8}/></BarChart></ResponsiveContainer>
        </div>}
        {rated.length>0&&<div className="ccd"><div className="ctl">⭐ Histogram ocen</div>
          <ResponsiveContainer width="100%" height={120}><BarChart data={buckets} barSize={16} margin={{top:4,left:-20,right:4,bottom:0}}><XAxis dataKey="n" tick={{fill:G.dim,fontSize:10}} axisLine={false} tickLine={false}/><YAxis hide/><Tooltip content={<CTip/>}/><Bar dataKey="v" radius={[4,4,0,0]}>{buckets.map((_,i)=><Cell key={i} fill={`hsl(${i*12},88%,55%)`} fillOpacity={.85}/>)}</Bar></BarChart></ResponsiveContainer>
        </div>}
      </>}

      {finTab==="finance" && <>
        {bought.length===0 ? (
          <div className="empty"><div className="eic">💰</div><div className="ett">Brak danych finansowych</div><div className="ess">Dodaj ceny kupna do gier żeby zobaczyć statystyki</div></div>
        ) : <>
          <div className="fin-kgd">
            {finKpis.map(k=>(
              <div key={k.l} className="fin-kcd" style={{"--c":k.c,background:k.bg}}>
                <div className="fin-kv">{k.v}</div>
                <div className="fin-kl">{k.l}</div>
              </div>
            ))}
          </div>

          {storeData.length>0&&<div className="ccd"><div className="ctl">🏪 Wydatki wg sklepu (zł)</div>
            <ResponsiveContainer width="100%" height={120}><BarChart data={storeData} barSize={24} margin={{top:4,left:-20,right:4,bottom:0}}><XAxis dataKey="n" tick={{fill:G.dim,fontSize:9}} axisLine={false} tickLine={false}/><YAxis hide/><Tooltip content={<CTip/>}/><Bar dataKey="v" radius={[4,4,0,0]} fill={G.org} fillOpacity={.85}/></BarChart></ResponsiveContainer>
          </div>}

          {genreCostData.length>0&&<div className="ccd"><div className="ctl">🎮 Wydatki wg gatunku (zł)</div>
            <ResponsiveContainer width="100%" height={120}><BarChart data={genreCostData} barSize={20} margin={{top:4,left:-20,right:4,bottom:0}}><XAxis dataKey="n" tick={{fill:G.dim,fontSize:9}} axisLine={false} tickLine={false}/><YAxis hide/><Tooltip content={<CTip/>}/><Bar dataKey="v" radius={[4,4,0,0]} fill={G.pur} fillOpacity={.8}/></BarChart></ResponsiveContainer>
          </div>}

          {soldGames.length>0&&<div className="ccd"><div className="ctl">📈 ROI sprzedanych gier</div>
            <ul className="top-list">
              {soldGames.map(g=>(
                <li key={g.id} className="top-item">
                  <span className="top-title">{g.title}</span>
                  <span style={{fontSize:10,color:G.dim,flexShrink:0}}>{(+g.priceBought).toFixed(0)}→{(+g.priceSold).toFixed(0)} zł</span>
                  <span className={"top-val "+(g.roi>=0?"roi-positive":"roi-negative")}>{g.roi>=0?"+":""}{g.roi.toFixed(0)} zł</span>
                </li>
              ))}
            </ul>
          </div>}

          <div className="ccd"><div className="ctl">💸 Najdroższe gry</div>
            <ul className="top-list">
              {[...bought].sort((a,b)=>+b.priceBought - +a.priceBought).slice(0,5).map(g=>(
                <li key={g.id} className="top-item">
                  <span className="top-title">{g.title}</span>
                  {g.storeBought&&<span style={{fontSize:10,color:G.dim,flexShrink:0}}>{g.storeBought}</span>}
                  <span className="top-val" style={{color:G.org}}>{(+g.priceBought).toFixed(0)} zł</span>
                </li>
              ))}
            </ul>
          </div>

          {withHours.length>0&&<div className="ccd"><div className="ctl">⏱ Najlepsza wartość (zł/h)</div>
            <ul className="top-list">
              {[...withHours].sort((a,b)=>(+a.priceBought/a.hours)-(+b.priceBought/b.hours)).slice(0,5).map(g=>(
                <li key={g.id} className="top-item">
                  <span className="top-title">{g.title}</span>
                  <span style={{fontSize:10,color:G.dim,flexShrink:0}}>{g.hours}h</span>
                  <span className="top-val" style={{color:G.grn}}>{(+g.priceBought/g.hours).toFixed(1)} zł/h</span>
                </li>
              ))}
            </ul>
          </div>}
        </>}
      </>}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [games,           setGames]      = useState(() => lsRead());
  const [tab,             setTab]        = useState("col");
  const [flt,             setFlt]        = useState("all");
  const [q,               setQ]          = useState("");
  const [modal,           setModal]      = useState(null);
  const [toast,           setToast]      = useState(null);
  const [notifPermission, setNotifPerm]  = useState(() =>
    "Notification" in window ? Notification.permission : "denied"
  );

  // Zapisz do localStorage przy każdej zmianie
  useEffect(() => { lsWrite(games); }, [games]);

  // Rejestruj SW i sprawdź premiery przy starcie
  useEffect(() => {
    registerSW().then(() => {
      const gamesWithNotif = games.filter(g => g.notifyEnabled && g.releaseDate);
      if (gamesWithNotif.length && Notification.permission === "granted") {
        checkReleasesNow(gamesWithNotif);
      }
    });
  }, []); // eslint-disable-line

  const flash = msg => { setToast(msg); setTimeout(()=>setToast(null),1800); };

  const requestNotif = async () => {
    const perm = await requestNotifPermission();
    setNotifPerm(perm);
    return perm;
  };

  function handleSave(form) {
    const isEdit = !!form.id;
    const id     = isEdit ? form.id : uid();
    const game   = {...form, id};
    setGames(prev => isEdit ? prev.map(g=>g.id===id?game:g) : [...prev, game]);
    setModal(null);
    flash(isEdit ? "Zapisano ✓" : "Dodano ✓");
  }

  function handleDel(id) {
    setGames(prev => prev.filter(g=>g.id!==id));
    setModal(null);
    flash("Usunięto");
  }

  function toggleNotify(id) {
    setGames(prev => prev.map(g => g.id===id ? {...g, notifyEnabled:!g.notifyEnabled} : g));
  }

  // Liczba nadchodzących premier do badge na tab
  const upcomingCount = games.filter(g => g.releaseDate && daysUntil(g.releaseDate) >= 0).length;

  const chips = [{k:"all",l:"Wszystkie"},...Object.entries(SM).map(([k,m])=>({k,l:m.label}))];
  const visible = games
    .filter(g => flt==="all" || g.status===flt)
    .filter(g => !q || g.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <style>{CSS}</style>
      <div className="app">

        <div className="hdr">
          <div className="htop">
            <div className="logo">
              <div className="lico">PS5</div>
              <div><div className="lnm">VAULT</div><div className="lsb">Game Tracker</div></div>
            </div>
            <button type="button" className="abtn" onClick={()=>setModal("add")}>+</button>
          </div>
          <div className="tabs">
            <button type="button" className={"tab"+(tab==="col"?" on":"")} onClick={()=>setTab("col")}>🎮 Kolekcja</button>
            <button type="button" className={"tab"+(tab==="upc"?" on":"")} onClick={()=>setTab("upc")} style={{position:"relative"}}>
              📅 Premiery
              {upcomingCount > 0 && <span className="tab-dot"/>}
            </button>
            <button type="button" className={"tab"+(tab==="st"?" on":"")}  onClick={()=>setTab("st")}>📊 Statystyki</button>
          </div>
        </div>

        {tab==="col" && <>
          <div className="sw">
            <span className="sx">🔍</span>
            <input className="si" value={q} onChange={e=>setQ(e.target.value)} placeholder="Szukaj gry..."/>
          </div>
          <div className="chips">
            {chips.map(c=><button type="button" key={c.k} className={"chip"+(flt===c.k?" on":"")} onClick={()=>setFlt(c.k)}>{c.l}</button>)}
          </div>
          <div className="lst">
            {visible.length===0
              ?<div className="empty"><div className="eic">🎮</div><div className="ett">Brak gier</div><div className="ess">{q?"Brak wyników.":"Naciśnij + żeby dodać grę."}</div></div>
              :visible.map(g=>{
                const m=SM[g.status]||SM.planuje;
                return (
                  <div key={g.id} className="gc" style={{"--c":m.c,"--bg":m.bg}} onClick={()=>setModal(g)}>
                    {g.cover
                      ?<div className="gcov" style={{backgroundImage:`url(${g.cover})`}}/>
                      :<div className="gcov0"><div className="gab">{g.abbr||"??"}</div></div>}
                    <div className="gcnt">
                      <div className="gbdy">
                        <div className="gtt">{g.title}</div>
                        <div className="gmt">
                          <span className="gsb">{m.label}</span>
                          {g.genre&&<span className="gmp">{g.genre}</span>}
                          {g.year&&<span className="gmp">📅{g.year}</span>}
                          {!!g.hours&&<span className="gmp">⏱{g.hours}h</span>}
                          <ReleaseBadge releaseDate={g.releaseDate}/>
                        </div>
                      </div>
                      <div className="grt">
                        {g.rating!=null
                          ?<><span className="grn">{g.rating}</span><span className="grd">/10</span></>
                          :<span style={{color:G.dim,fontSize:17}}>—</span>}
                        {g.notifyEnabled && <span style={{fontSize:12}}>🔔</span>}
                        {!!+g.priceBought && <span className={g.priceSold!=null?"gprice-sold":"gprice"}>{g.priceSold!=null?`+${(+(g.priceSold||0)-+(g.priceBought||0)).toFixed(0)} zł`:`${(+g.priceBought).toFixed(0)} zł`}</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </>}

        {tab==="upc" && (
          <Upcoming
            games={games}
            onOpen={setModal}
            onToggleNotify={toggleNotify}
            notifPermission={notifPermission}
            onRequestNotif={requestNotif}
          />
        )}

        {tab==="st" && <Stats games={games}/>}

        {modal && (
          <Modal
            game={modal==="add"?null:modal}
            onSave={handleSave}
            onDel={handleDel}
            onClose={()=>setModal(null)}
            notifPermission={notifPermission}
            onRequestNotif={requestNotif}
          />
        )}

        {toast && <div className="tst">{toast}</div>}
      </div>
    </>
  );
}
