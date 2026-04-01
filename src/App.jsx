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
const RMAP = {"action":"Action","role-playing-games-rpg":"RPG","shooter":"FPS","horror":"Horror","sports":"Sport","racing":"Racing","platformer":"Platformer","puzzle":"Puzzle","adventure":"Adventure","strategy":"Strategia","fighting":"Fighting","indie":"Indie"};
const G = { bg:"#080B14", card:"#0D1120", card2:"#111827", bdr:"#1E2A42", txt:"#E8EDF8", dim:"#5A6A8A", blu:"#00D4FF", grn:"#39FF6E", pur:"#A78BFA", red:"#FF4D6D", gld:"#FFD166" };
const EF = { title:"", abbr:"", status:"planuje", year:new Date().getFullYear(), genre:"", hours:"", rating:"", notes:"", cover:"" };

function uid() { return "g" + Date.now().toString(36) + Math.random().toString(36).slice(2,5); }
function mkAbbr(t) { const w=t.trim().split(/\s+/).filter(Boolean); return !w.length?"??":(w.length===1?w[0].slice(0,2):w[0][0]+w[1][0]).toUpperCase(); }

// ─── LOCALSTORAGE ─────────────────────────────────────────────────────────────
// Jeden klucz, cała tablica, sync
const LS = "ps5vault";
function load() { try { return JSON.parse(localStorage.getItem(LS)||"[]"); } catch { return []; } }
function save(g) { try { localStorage.setItem(LS, JSON.stringify(g)); } catch {} }

// ─── RAWG ─────────────────────────────────────────────────────────────────────
async function rawg(q) {
  try {
    const r = await fetch(`https://api.rawg.io/api/games?search=${encodeURIComponent(q)}&page_size=6&key=${RAWG_KEY}`);
    if (!r.ok) return [];
    return (await r.json()).results.map(g=>({
      id:g.id, title:g.name,
      year:g.released?+g.released.slice(0,4):new Date().getFullYear(),
      genre:(g.genres||[]).map(x=>RMAP[x.slug]).filter(Boolean)[0]||g.genres?.[0]?.name||"",
      cover:g.background_image||"", abbr:mkAbbr(g.name),
    }));
  } catch { return []; }
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
// iOS rules:
// 1. font-size>=16px on inputs → no auto-zoom
// 2. width:100% (never 100vw) → no horizontal overflow
// 3. safe-area-inset-* for notch/home-bar
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Syne:wght@400;600;700&display=swap');
@keyframes spin { to { transform:rotate(360deg); } }

*,*::before,*::after { box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; }

html {
  -webkit-text-size-adjust: 100%;
  overflow-x: hidden;
}
body {
  overflow-x: hidden;
  background: ${G.bg};
  color: ${G.txt};
  font-family: 'Syne', sans-serif;
  -webkit-font-smoothing: antialiased;
}
#root { overflow-x: hidden; }

.app {
  width: 100%;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* HEADER */
.hdr {
  width: 100%;
  padding-top:    calc(env(safe-area-inset-top,0px) + 44px);
  padding-bottom: 12px;
  padding-left:   max(16px, env(safe-area-inset-left,0px));
  padding-right:  max(16px, env(safe-area-inset-right,0px));
}
.htop { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
.logo { display:flex; align-items:center; gap:10px; }
.lico { width:34px; height:34px; flex-shrink:0; border-radius:9px; background:linear-gradient(135deg,${G.blu},#0060FF); display:flex; align-items:center; justify-content:center; font-family:'Orbitron',monospace; font-size:11px; font-weight:900; color:#fff; box-shadow:0 0 14px rgba(0,212,255,.4); }
.lnm  { font-family:'Orbitron',monospace; font-size:15px; font-weight:700; letter-spacing:.1em; }
.lsb  { font-size:9px; color:${G.dim}; letter-spacing:.2em; text-transform:uppercase; }
.abtn { width:44px; height:44px; flex-shrink:0; border:none; border-radius:10px; background:linear-gradient(135deg,${G.blu},#0060FF); color:#fff; font-size:22px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
.abtn:active { opacity:.7; }

.tabs  { display:flex; gap:4px; background:${G.card}; border:1px solid ${G.bdr}; border-radius:13px; padding:4px; }
.tab   { flex:1; min-height:44px; padding:8px 4px; border:none; border-radius:9px; background:transparent; color:${G.dim}; font-family:'Syne',sans-serif; font-size:11px; font-weight:600; cursor:pointer; white-space:nowrap; }
.tab.on { background:rgba(0,212,255,.15); color:${G.blu}; }

/* SEARCH */
.sw { position:relative; padding:10px 16px 6px; }
.si { display:block; width:100%; background:${G.card}; border:1px solid ${G.bdr}; border-radius:12px; padding:11px 12px 11px 36px; color:${G.txt}; font-family:'Syne',sans-serif; font-size:16px; outline:none; -webkit-appearance:none; }
.si:focus { border-color:${G.blu}; }
.sx { position:absolute; left:28px; top:50%; transform:translateY(-50%); pointer-events:none; }

/* CHIPS */
.chips { display:flex; gap:6px; padding:6px 16px 10px; overflow-x:auto; -webkit-overflow-scrolling:touch; }
.chips::-webkit-scrollbar { display:none; }
.chip  { padding:7px 14px; border-radius:20px; border:1px solid ${G.bdr}; background:${G.card}; color:${G.dim}; font-size:11px; font-weight:600; white-space:nowrap; flex-shrink:0; cursor:pointer; }
.chip.on { border-color:${G.blu}; color:${G.blu}; background:rgba(0,212,255,.1); }

/* LIST */
.lst { flex:1; overflow-y:auto; overflow-x:hidden; -webkit-overflow-scrolling:touch; padding:4px 16px calc(env(safe-area-inset-bottom,0px) + 24px); }

/* CARD */
.gc { width:100%; background:${G.card}; border:1px solid ${G.bdr}; border-radius:14px; margin-bottom:9px; display:flex; align-items:stretch; cursor:pointer; position:relative; overflow:hidden; }
.gc::before { content:''; position:absolute; top:0; left:0; width:3px; height:100%; background:var(--c); opacity:.75; z-index:1; }
.gc:active { opacity:.75; }
.gcov  { width:56px; flex-shrink:0; background-size:cover; background-position:center; background-color:${G.card2}; }
.gcov0 { width:56px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:${G.card2}; }
.gab   { font-family:'Orbitron',monospace; font-size:12px; font-weight:900; color:var(--c); }
.gcnt  { flex:1; min-width:0; padding:11px 12px 11px 14px; display:flex; gap:8px; align-items:flex-start; }
.gbdy  { flex:1; min-width:0; }
.gtt   { font-size:14px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:4px; }
.gmt   { display:flex; gap:6px; flex-wrap:wrap; align-items:center; }
.gsb   { font-size:10px; font-weight:700; padding:2px 7px; border-radius:5px; background:var(--bg); color:var(--c); }
.gmp   { font-size:10px; color:${G.dim}; }
.grt   { display:flex; flex-direction:column; align-items:flex-end; gap:1px; flex-shrink:0; }
.grn   { font-family:'Orbitron',monospace; font-size:17px; font-weight:900; color:${G.gld}; line-height:1; }
.grd   { font-size:9px; color:${G.dim}; }

/* EMPTY */
.empty { text-align:center; padding:60px 16px; color:${G.dim}; }
.eic { font-size:40px; margin-bottom:12px; opacity:.4; }
.ett { font-size:15px; font-weight:700; margin-bottom:6px; }
.ess { font-size:12px; line-height:1.6; }

/* STATS */
.sta  { flex:1; overflow-y:auto; overflow-x:hidden; -webkit-overflow-scrolling:touch; padding:8px 16px calc(env(safe-area-inset-bottom,0px) + 24px); }
.kgd  { display:grid; grid-template-columns:1fr 1fr; gap:9px; margin-bottom:12px; }
.kcd  { background:${G.card}; border:1px solid ${G.bdr}; border-radius:13px; padding:14px; }
.kvl  { font-family:'Orbitron',monospace; font-size:22px; font-weight:900; color:var(--c); line-height:1; margin-bottom:4px; }
.klb  { font-size:9px; color:${G.dim}; font-weight:600; letter-spacing:.07em; text-transform:uppercase; }
.ccd  { background:${G.card}; border:1px solid ${G.bdr}; border-radius:13px; padding:14px; margin-bottom:10px; overflow:hidden; }
.ctl  { font-size:10px; font-weight:700; color:${G.dim}; letter-spacing:.1em; text-transform:uppercase; margin-bottom:12px; }

/* MODAL */
.ovr { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(4,6,14,.9); z-index:9999; display:flex; align-items:flex-end; }
.mdl { width:100%; background:${G.card2}; border-top:1px solid ${G.bdr}; border-radius:20px 20px 0 0; padding:18px 16px calc(env(safe-area-inset-bottom,0px) + 24px); max-height:90dvh; overflow-y:auto; -webkit-overflow-scrolling:touch; }
.mhdl { width:32px; height:4px; background:${G.bdr}; border-radius:2px; margin:0 auto 16px; }
.mttl { font-family:'Orbitron',monospace; font-size:13px; font-weight:700; color:${G.blu}; letter-spacing:.06em; margin-bottom:16px; }

/* RAWG */
.rwrp { position:relative; margin-bottom:12px; }
.rlbl { display:block; font-size:9px; font-weight:700; color:${G.dim}; letter-spacing:.1em; text-transform:uppercase; margin-bottom:5px; }
.rrow { display:flex; gap:6px; align-items:center; }
.rin  { flex:1; display:block; background:${G.bg}; border:1px solid ${G.blu}; border-radius:9px; padding:10px 11px; color:${G.txt}; font-family:'Syne',sans-serif; font-size:16px; outline:none; -webkit-appearance:none; }
.rin::placeholder { color:${G.dim}; }
.rbdg { font-size:9px; font-weight:700; padding:4px 8px; border-radius:6px; background:rgba(0,212,255,.15); color:${G.blu}; flex-shrink:0; }
.rhnt { font-size:10px; color:${G.dim}; margin-top:4px; }
.rdd  { position:absolute; top:100%; left:0; right:0; background:${G.card}; border:1px solid ${G.bdr}; border-radius:12px; z-index:200; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,.6); margin-top:4px; }
.rit  { display:flex; align-items:center; gap:10px; padding:10px 12px; cursor:pointer; border-bottom:1px solid ${G.bdr}; min-height:52px; }
.rit:last-child { border-bottom:none; }
.rit:active { background:rgba(0,212,255,.08); }
.rthm { width:40px; height:40px; border-radius:7px; object-fit:cover; flex-shrink:0; background:${G.bg}; }
.rph  { width:40px; height:40px; border-radius:7px; background:${G.bg}; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
.rinf { flex:1; min-width:0; }
.rnm  { font-size:13px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.rmt  { font-size:10px; color:${G.dim}; margin-top:2px; }
.covp { width:100%; height:90px; border-radius:10px; object-fit:cover; margin-bottom:11px; border:1px solid ${G.bdr}; display:block; }

/* FORM */
.fg { margin-bottom:11px; }
.fl { display:block; font-size:9px; font-weight:700; color:${G.dim}; letter-spacing:.1em; text-transform:uppercase; margin-bottom:5px; }
.fi,.fs,.fta { display:block; width:100%; background:${G.bg}; border:1px solid ${G.bdr}; border-radius:9px; padding:10px 11px; color:${G.txt}; font-family:'Syne',sans-serif; font-size:16px; outline:none; -webkit-appearance:none; appearance:none; }
.fi:focus,.fs:focus,.fta:focus { border-color:${G.blu}; }
.fs option { background:${G.card2}; color:${G.txt}; }
.fta { resize:none; height:68px; }
.f2  { display:grid; grid-template-columns:1fr 1fr; gap:9px; }
.ssg { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
.sso { width:100%; min-height:44px; padding:8px 4px; border-radius:8px; border:1px solid ${G.bdr}; background:transparent; color:${G.dim}; font-family:'Syne',sans-serif; font-size:12px; font-weight:600; cursor:pointer; text-align:center; }
.sso.on { border-color:var(--c); color:var(--c); background:var(--bg); }
.mac { display:flex; gap:8px; margin-top:16px; }
.bpr { flex:1; min-height:50px; padding:13px; border:none; border-radius:11px; background:linear-gradient(135deg,${G.blu},#0060FF); color:#fff; font-family:'Orbitron',monospace; font-size:11px; font-weight:700; letter-spacing:.07em; cursor:pointer; }
.bpr:active { opacity:.75; }
.bcn { min-height:50px; padding:13px 14px; border:1px solid ${G.bdr}; border-radius:11px; background:${G.card}; color:${G.dim}; font-family:'Syne',sans-serif; font-size:13px; font-weight:600; cursor:pointer; }
.bdl { min-height:50px; padding:13px 14px; border:1px solid rgba(255,77,109,.3); border-radius:11px; background:rgba(255,77,109,.1); color:${G.red}; font-size:16px; cursor:pointer; }

/* TOAST */
.tst { position:fixed; bottom:calc(env(safe-area-inset-bottom,0px) + 32px); left:50%; transform:translateX(-50%); background:${G.grn}; color:#000; font-family:'Orbitron',monospace; font-size:11px; font-weight:700; padding:9px 20px; border-radius:20px; z-index:99999; white-space:nowrap; pointer-events:none; }
`;

const CTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return <div style={{background:G.card2,border:`1px solid ${G.bdr}`,borderRadius:8,padding:"6px 10px",fontSize:11,color:G.txt}}>
    <div style={{color:G.dim,marginBottom:2}}>{label}</div>
    <div style={{fontWeight:700,color:payload[0].fill||G.blu}}>{payload[0].value}</div>
  </div>;
};

function RawgSearch({ onSelect }) {
  const [q, setQ]       = useState("");
  const [res, setRes]   = useState([]);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const t = useRef(null);

  const search = v => {
    setQ(v);
    clearTimeout(t.current);
    if (!v.trim()) { setRes([]); setOpen(false); return; }
    setBusy(true);
    t.current = setTimeout(async () => {
      const r = await rawg(v);
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
          ? <span style={{flexShrink:0,animation:"spin .8s linear infinite",display:"inline-block"}}>⏳</span>
          : <span className="rbdg">RAWG</span>}
      </div>
      <div className="rhnt">Wybierz grę żeby auto-uzupełnić pola</div>
      {open && <div className="rdd">
        {res.map(r=>(
          <div key={r.id} className="rit" onClick={()=>pick(r)}>
            {r.cover ? <img className="rthm" src={r.cover} alt="" loading="lazy"/> : <div className="rph">🎮</div>}
            <div className="rinf">
              <div className="rnm">{r.title}</div>
              <div className="rmt">{r.year}{r.genre?" · "+r.genre:""}</div>
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}

function Modal({ game, onSave, onDel, onClose }) {
  const isEdit = !!game;
  const [f, setF] = useState(() => game ? {...game} : {...EF});
  const upd = (k, v) => setF(p => { const n={...p,[k]:v}; if(k==="title"&&!isEdit) n.abbr=mkAbbr(v); return n; });
  const fill = item => setF(p => ({...p, title:item.title, abbr:item.abbr, year:item.year, genre:item.genre||p.genre, cover:item.cover}));

  function handleSave() {
    if (!f.title.trim()) { alert("Wpisz tytuł gry"); return; }
    const abbr = (f.abbr||"").trim().slice(0,2).toUpperCase() || mkAbbr(f.title);
    const rating = f.rating!==""&&!isNaN(+f.rating) ? Math.min(10,Math.max(1,+f.rating)) : null;
    onSave({...f, abbr, year:+f.year||new Date().getFullYear(), hours:+f.hours||0, rating});
  }

  return (
    <div className="ovr">
      <div className="mdl">
        <div className="mhdl"/>
        <div className="mttl">{isEdit?"✎ EDYTUJ GRĘ":"+ DODAJ GRĘ"}</div>
        <RawgSearch onSelect={fill}/>
        {f.cover && <img className="covp" src={f.cover} alt=""/>}
        <div className="fg"><label className="fl">Tytuł *</label><input className="fi" value={f.title} onChange={e=>upd("title",e.target.value)} placeholder="np. God of War Ragnarök"/></div>
        <div className="f2">
          <div className="fg"><label className="fl">Skrót (2 lit.)</label><input className="fi" value={f.abbr} maxLength={2} onChange={e=>upd("abbr",e.target.value.toUpperCase())} placeholder="GW"/></div>
          <div className="fg"><label className="fl">Rok</label><input className="fi" inputMode="numeric" value={f.year} onChange={e=>upd("year",e.target.value)}/></div>
        </div>
        <div className="fg">
          <label className="fl">Status</label>
          <div className="ssg">
            {Object.entries(SM).map(([k,m])=>(
              <button key={k} type="button" className={"sso"+(f.status===k?" on":"")} style={{"--c":m.c,"--bg":m.bg}} onClick={()=>upd("status",k)}>{m.label}</button>
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
          <div className="fg"><label className="fl">Godziny</label><input className="fi" inputMode="decimal" value={f.hours} onChange={e=>upd("hours",e.target.value)} placeholder="0"/></div>
        </div>
        <div className="fg"><label className="fl">Ocena (1–10)</label><input className="fi" inputMode="decimal" value={f.rating??""} onChange={e=>upd("rating",e.target.value)} placeholder="—"/></div>
        <div className="fg"><label className="fl">Notatki</label><textarea className="fta" value={f.notes} onChange={e=>upd("notes",e.target.value)} placeholder="Twoje przemyślenia..."/></div>
        <div className="mac">
          <button type="button" className="bcn" onClick={onClose}>Anuluj</button>
          <button type="button" className="bpr" onClick={handleSave}>ZAPISZ</button>
          {isEdit && <button type="button" className="bdl" onClick={()=>onDel(game.id)}>🗑</button>}
        </div>
      </div>
    </div>
  );
}

function Stats({ games }) {
  if (!games.length) return <div className="sta"><div className="empty"><div className="eic">📈</div><div className="ett">Brak danych</div><div className="ess">Dodaj gry, żeby zobaczyć statystyki</div></div></div>;
  const hrs=games.reduce((s,g)=>s+(g.hours||0),0);
  const rated=games.filter(g=>g.rating!=null);
  const avg=rated.length?(rated.reduce((s,g)=>s+g.rating,0)/rated.length).toFixed(1):"—";
  const kpis=[{l:"Gier razem",v:games.length,c:G.blu},{l:"Ukończone",v:games.filter(g=>g.status==="ukonczone").length,c:G.grn},{l:"Godzin łącznie",v:hrs%1?hrs.toFixed(1):hrs,c:G.pur},{l:"Śr. ocena",v:avg,c:G.gld}];
  const sData=Object.entries(SM).map(([k,m])=>({n:m.label,v:games.filter(g=>g.status===k).length,c:m.c}));
  const gMap={}; games.forEach(g=>{if(g.genre)gMap[g.genre]=(gMap[g.genre]||0)+1;});
  const gData=Object.entries(gMap).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([n,v])=>({n,v}));
  const buckets=[1,2,3,4,5,6,7,8,9,10].map(r=>({n:String(r),v:games.filter(g=>g.rating!=null&&Math.round(g.rating)===r).length}));
  return (
    <div className="sta">
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
    </div>
  );
}

export default function App() {
  // ── State załadowany wprost z localStorage (sync, bez useEffect) ──
  const [games, setGames] = useState(() => load());
  const [tab,   setTab]   = useState("col");
  const [flt,   setFlt]   = useState("all");
  const [q,     setQ]     = useState("");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  // ── Zapis przy każdej zmianie games ──
  useEffect(() => { save(games); }, [games]);

  const flash = msg => { setToast(msg); setTimeout(()=>setToast(null),1800); };

  function handleSave(form) {
    const isEdit = !!form.id;
    const id = isEdit ? form.id : uid();
    setGames(prev => isEdit ? prev.map(g=>g.id===id?{...form,id}:g) : [...prev,{...form,id}]);
    setModal(null);
    flash(isEdit ? "Zapisano ✓" : "Dodano ✓");
  }

  function handleDel(id) {
    setGames(prev => prev.filter(g=>g.id!==id));
    setModal(null);
    flash("Usunięto");
  }

  const chips = [{k:"all",l:"Wszystkie"},...Object.entries(SM).map(([k,m])=>({k,l:m.label}))];
  const visible = games.filter(g=>flt==="all"||g.status===flt).filter(g=>!q||g.title.toLowerCase().includes(q.toLowerCase()));

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
            <button type="button" className={"tab"+(tab==="col"?" on":"")} onClick={()=>setTab("col")}>🎮 Kolekcja ({games.length})</button>
            <button type="button" className={"tab"+(tab==="st"?" on":"")}  onClick={()=>setTab("st")}>📊 Statystyki</button>
          </div>
        </div>

        {tab==="col"&&<>
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
                        </div>
                      </div>
                      <div className="grt">
                        {g.rating!=null?<><span className="grn">{g.rating}</span><span className="grd">/10</span></>:<span style={{color:G.dim,fontSize:17}}>—</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </>}

        {tab==="st"&&<Stats games={games}/>}

        {modal&&<Modal game={modal==="add"?null:modal} onSave={handleSave} onDel={handleDel} onClose={()=>setModal(null)}/>}
        {toast&&<div className="tst">{toast}</div>}
      </div>
    </>
  );
}
