import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ─── WKLEJ SWÓJ KLUCZ RAWG TUTAJ ────────────────────────────────────────────
const RAWG_KEY = "0c13edec026d489a97cc183170d796fd";
// ─────────────────────────────────────────────────────────────────────────────

const SM = {
  gram:      { label:"Gram",      c:"#00D4FF", bg:"rgba(0,212,255,.13)" },
  ukonczone: { label:"Ukończone", c:"#39FF6E", bg:"rgba(57,255,110,.13)" },
  planuje:   { label:"Planuję",   c:"#A78BFA", bg:"rgba(167,139,250,.13)" },
  porzucone: { label:"Porzucone", c:"#FF4D6D", bg:"rgba(255,77,109,.13)" },
};
const GENRES = ["Action","RPG","FPS","Horror","Sport","Racing","Platformer","Puzzle","Adventure","Strategia","Fighting","Indie","Inne"];
const RAWG_GENRE_MAP = {
  "action":"Action","role-playing-games-rpg":"RPG","shooter":"FPS",
  "horror":"Horror","sports":"Sport","racing":"Racing","platformer":"Platformer",
  "puzzle":"Puzzle","adventure":"Adventure","strategy":"Strategia",
  "fighting":"Fighting","indie":"Indie",
};
const C = { bg:"#080B14", card:"#0D1120", card2:"#111827", bdr:"#1E2A42", txt:"#E8EDF8", dim:"#5A6A8A", blu:"#00D4FF", grn:"#39FF6E", pur:"#A78BFA", red:"#FF4D6D", gld:"#FFD166" };
const EF = { title:"", abbr:"", status:"planuje", year:new Date().getFullYear(), genre:"", hours:"", rating:"", notes:"", cover:"" };

function uid() { return "g" + Date.now().toString(36) + Math.random().toString(36).slice(2,5); }
function makeAbbr(t) {
  const w = t.trim().split(/\s+/).filter(Boolean);
  if (!w.length) return "??";
  return (w.length === 1 ? w[0].slice(0,2) : w[0][0] + w[1][0]).toUpperCase();
}

// ── RAWG API ─────────────────────────────────────────────────────────────────
async function rawgSearch(query) {
  if (!query.trim() || RAWG_KEY === "YOUR_KEY_HERE") return [];
  try {
    const url = `https://api.rawg.io/api/games?search=${encodeURIComponent(query)}&page_size=6&key=${RAWG_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map(g => ({
      id:     g.id,
      title:  g.name,
      year:   g.released ? parseInt(g.released.slice(0,4)) : new Date().getFullYear(),
      genre:  mapGenre(g.genres),
      cover:  g.background_image || "",
      abbr:   makeAbbr(g.name),
    }));
  } catch { return []; }
}

function mapGenre(genres = []) {
  for (const g of genres) {
    const mapped = RAWG_GENRE_MAP[g.slug];
    if (mapped) return mapped;
  }
  return genres[0]?.name || "";
}

// ── STORAGE (localStorage) ───────────────────────────────────────────────────
function storageSave(games) {
  try {
    localStorage.setItem("vault-ids", JSON.stringify(games.map(g => g.id)));
    games.forEach(g => localStorage.setItem("vault-" + g.id, JSON.stringify(g)));
  } catch {}
}
function storageLoad() {
  try {
    const raw = localStorage.getItem("vault-ids");
    if (!raw) return [];
    const ids = JSON.parse(raw);
    return ids.map(id => {
      try { const x = localStorage.getItem("vault-" + id); return x ? JSON.parse(x) : null; }
      catch { return null; }
    }).filter(Boolean);
  } catch { return []; }
}
function storageDel(id, remaining) {
  try {
    localStorage.removeItem("vault-" + id);
    localStorage.setItem("vault-ids", JSON.stringify(remaining.map(g => g.id)));
  } catch {}
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Syne:wght@400;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html{overflow-x:hidden;-webkit-text-size-adjust:100%;height:100%}
body{overflow-x:hidden;width:100vw;min-height:100%;background:${C.bg};color:${C.txt};font-family:'Syne',sans-serif;-webkit-font-smoothing:antialiased}
#root{overflow-x:hidden;width:100vw}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:${C.bg}}::-webkit-scrollbar-thumb{background:${C.bdr};border-radius:2px}

.app{width:100vw;max-width:100%;display:flex;flex-direction:column;min-height:100dvh;overflow-x:hidden}

.hdr{padding:calc(env(safe-area-inset-top,0px) + 44px) 16px 12px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));width:100%}
.htop{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.logo{display:flex;align-items:center;gap:10px}
.lico{width:34px;height:34px;flex-shrink:0;border-radius:9px;background:linear-gradient(135deg,${C.blu},#0060FF);display:flex;align-items:center;justify-content:center;font-family:'Orbitron',monospace;font-size:11px;font-weight:900;color:#fff;box-shadow:0 0 14px rgba(0,212,255,.4)}
.lnm{font-family:'Orbitron',monospace;font-size:15px;font-weight:700;letter-spacing:.1em}
.lsb{font-size:9px;color:${C.dim};letter-spacing:.2em;text-transform:uppercase}
.abtn{width:44px;height:44px;flex-shrink:0;border:none;border-radius:10px;background:linear-gradient(135deg,${C.blu},#0060FF);color:#fff;font-size:22px;display:flex;align-items:center;justify-content:center;cursor:pointer;line-height:1}
.abtn:active{opacity:.7}

.tabs{display:flex;gap:4px;background:${C.card};border:1px solid ${C.bdr};border-radius:13px;padding:4px}
.tab{flex:1;padding:8px 4px;border:none;border-radius:9px;background:transparent;color:${C.dim};font-family:'Syne',sans-serif;font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all .18s;min-height:44px}
.tab.on{background:rgba(0,212,255,.15);color:${C.blu}}

.sw{position:relative;padding:10px 16px 6px}
.si{width:100%;background:${C.card};border:1px solid ${C.bdr};border-radius:12px;padding:9px 12px 9px 36px;color:${C.txt};font-family:'Syne',sans-serif;font-size:16px;outline:none;-webkit-appearance:none;display:block}
.si:focus{border-color:${C.blu}}
.sx{position:absolute;left:28px;top:50%;transform:translateY(-50%);font-size:13px;pointer-events:none}

.chips{display:flex;gap:6px;padding:4px 16px 10px;overflow-x:auto;width:100%;-webkit-overflow-scrolling:touch}
.chips::-webkit-scrollbar{display:none}
.chip{padding:5px 12px;border-radius:20px;border:1px solid ${C.bdr};background:${C.card};color:${C.dim};font-size:11px;font-weight:600;white-space:nowrap;flex-shrink:0;cursor:pointer;min-height:36px;display:flex;align-items:center}
.chip.on{border-color:${C.blu};color:${C.blu};background:rgba(0,212,255,.1)}

.lst{flex:1;overflow-y:auto;overflow-x:hidden;padding:2px 16px calc(env(safe-area-inset-bottom,0px) + 90px);width:100%;-webkit-overflow-scrolling:touch}

.gc{width:100%;background:${C.card};border:1px solid ${C.bdr};border-radius:14px;padding:0;margin-bottom:9px;display:flex;align-items:stretch;cursor:pointer;position:relative;overflow:hidden}
.gc::before{content:'';position:absolute;top:0;left:0;width:3px;height:100%;background:var(--c);opacity:.75;z-index:1}
.gc:active{opacity:.75}
.gcov{width:58px;flex-shrink:0;background-size:cover;background-position:center;background-color:${C.card2}}
.gcov-none{width:58px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:${C.card2}}
.gab{font-family:'Orbitron',monospace;font-size:12px;font-weight:900;color:var(--c)}
.gcnt{flex:1;min-width:0;padding:11px 10px 11px 13px;display:flex;gap:10px;align-items:flex-start}
.gbdy{flex:1;min-width:0}
.gtt{font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px}
.gmt{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.gsb{font-size:10px;font-weight:700;padding:2px 7px;border-radius:5px;background:var(--bg);color:var(--c)}
.gmp{font-size:10px;color:${C.dim}}
.grt{display:flex;flex-direction:column;align-items:flex-end;gap:1px;flex-shrink:0}
.grn{font-family:'Orbitron',monospace;font-size:17px;font-weight:900;color:${C.gld};line-height:1}
.grd{font-size:9px;color:${C.dim}}

.empty{text-align:center;padding:60px 16px;color:${C.dim}}
.eic{font-size:42px;margin-bottom:12px;opacity:.35}
.ett{font-size:15px;font-weight:700;margin-bottom:6px}
.ess{font-size:12px;line-height:1.6}

.sta{flex:1;overflow-y:auto;overflow-x:hidden;padding:8px 16px calc(env(safe-area-inset-bottom,0px) + 90px);width:100%;-webkit-overflow-scrolling:touch}
.kgd{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:12px}
.kcd{background:${C.card};border:1px solid ${C.bdr};border-radius:13px;padding:14px}
.kvl{font-family:'Orbitron',monospace;font-size:22px;font-weight:900;color:var(--c);line-height:1;margin-bottom:4px}
.klb{font-size:9px;color:${C.dim};font-weight:600;letter-spacing:.07em;text-transform:uppercase}
.ccd{background:${C.card};border:1px solid ${C.bdr};border-radius:13px;padding:14px;margin-bottom:10px;overflow:hidden;width:100%}
.ctl{font-size:10px;font-weight:700;color:${C.dim};letter-spacing:.1em;text-transform:uppercase;margin-bottom:12px}

/* MODAL */
.ovr{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(4,6,14,.9);z-index:9999;display:flex;align-items:flex-end;justify-content:center}
.mdl{width:100%;background:${C.card2};border-top:1px solid ${C.bdr};border-radius:20px 20px 0 0;padding:18px 16px calc(env(safe-area-inset-bottom,0px) + 32px);max-height:92dvh;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch}
.mhdl{width:32px;height:4px;background:${C.bdr};border-radius:2px;margin:0 auto 16px}
.mttl{font-family:'Orbitron',monospace;font-size:13px;font-weight:700;color:${C.blu};letter-spacing:.06em;margin-bottom:16px}

/* RAWG SEARCH */
.rawg-wrap{position:relative;margin-bottom:11px}
.rawg-label{display:block;font-size:9px;font-weight:700;color:${C.dim};letter-spacing:.1em;text-transform:uppercase;margin-bottom:5px}
.rawg-row{display:flex;gap:6px;align-items:center}
.rawg-in{flex:1;display:block;background:${C.bg};border:1px solid ${C.blu};border-radius:9px;padding:9px 11px;color:${C.txt};font-family:'Syne',sans-serif;font-size:16px;outline:none;-webkit-appearance:none}
.rawg-in::placeholder{color:${C.dim}}
.rawg-spin{font-size:14px;animation:spin .8s linear infinite;display:inline-block;flex-shrink:0}
@keyframes spin{to{transform:rotate(360deg)}}
.rawg-badge{font-size:9px;font-weight:700;padding:3px 7px;border-radius:6px;background:rgba(0,212,255,.15);color:${C.blu};letter-spacing:.06em;white-space:nowrap;flex-shrink:0}
.rawg-hint{font-size:10px;color:${C.dim};margin-top:4px}

.rawg-dd{position:absolute;top:100%;left:0;right:0;background:${C.card};border:1px solid ${C.bdr};border-radius:12px;z-index:100;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.5);margin-top:4px}
.rawg-item{display:flex;align-items:center;gap:10px;padding:9px 12px;cursor:pointer;border-bottom:1px solid ${C.bdr};transition:background .12s;min-height:44px}
.rawg-item:last-child{border-bottom:none}
.rawg-item:active{background:rgba(0,212,255,.08)}
.rawg-thumb{width:40px;height:40px;border-radius:7px;object-fit:cover;background:${C.bg};flex-shrink:0}
.rawg-thumb-ph{width:40px;height:40px;border-radius:7px;background:${C.bg};display:flex;align-items:center;justify-content:center;font-size:10px;color:${C.dim};flex-shrink:0}
.rawg-info{flex:1;min-width:0}
.rawg-name{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rawg-meta{font-size:10px;color:${C.dim};margin-top:2px}

/* COVER PREVIEW */
.cover-prev{width:100%;height:90px;border-radius:10px;object-fit:cover;margin-bottom:11px;border:1px solid ${C.bdr}}

.fg{margin-bottom:11px}
.fl{display:block;font-size:9px;font-weight:700;color:${C.dim};letter-spacing:.1em;text-transform:uppercase;margin-bottom:5px}
/* iOS: font-size 16px on ALL inputs/selects/textareas prevents auto-zoom */
.fi,.fs,.fta{display:block;width:100%;background:${C.bg};border:1px solid ${C.bdr};border-radius:9px;padding:9px 11px;color:${C.txt};font-family:'Syne',sans-serif;font-size:16px;outline:none;-webkit-appearance:none;appearance:none}
.fi:focus,.fs:focus,.fta:focus{border-color:${C.blu}}
.fs option{background:${C.card2};color:${C.txt}}
.fta{resize:none;height:66px;font-size:16px}
.f2{display:grid;grid-template-columns:1fr 1fr;gap:9px}

.ssg{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.sso{width:100%;padding:8px 4px;border-radius:8px;border:1px solid ${C.bdr};background:transparent;color:${C.dim};font-family:'Syne',sans-serif;font-size:12px;font-weight:600;cursor:pointer;text-align:center;transition:all .15s;min-height:44px}
.sso.on{border-color:var(--c);color:var(--c);background:var(--bg)}

.mac{display:flex;gap:8px;margin-top:16px}
.bpr{flex:1;padding:14px;border:none;border-radius:11px;background:linear-gradient(135deg,${C.blu},#0060FF);color:#fff;font-family:'Orbitron',monospace;font-size:11px;font-weight:700;letter-spacing:.07em;cursor:pointer;min-height:48px}
.bpr:active{opacity:.75}
.bcn{padding:14px;border:1px solid ${C.bdr};border-radius:11px;background:${C.card};color:${C.dim};font-family:'Syne',sans-serif;font-size:13px;font-weight:600;cursor:pointer;min-height:48px}
.bdl{padding:14px;border:1px solid rgba(255,77,109,.3);border-radius:11px;background:rgba(255,77,109,.1);color:${C.red};font-size:16px;cursor:pointer;min-height:48px}

.tst{position:fixed;bottom:calc(env(safe-area-inset-bottom,0px) + 76px);left:50%;transform:translateX(-50%);background:${C.grn};color:#000;font-family:'Orbitron',monospace;font-size:11px;font-weight:700;padding:8px 18px;border-radius:20px;z-index:99999;white-space:nowrap;pointer-events:none}

.nokey{background:rgba(255,209,102,.07);border:1px solid rgba(255,209,102,.25);border-radius:10px;padding:10px 12px;margin-bottom:12px;font-size:11px;color:${C.gld};line-height:1.5}
`;

// ── TOOLTIP ───────────────────────────────────────────────────────────────────
const CTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return <div style={{background:C.card2,border:`1px solid ${C.bdr}`,borderRadius:8,padding:"6px 10px",fontSize:11,color:C.txt}}>
    <div style={{color:C.dim,marginBottom:2}}>{label}</div>
    <div style={{fontWeight:700,color:payload[0].fill||C.blu}}>{payload[0].value}</div>
  </div>;
};

// ── RAWG SEARCH COMPONENT ─────────────────────────────────────────────────────
function RawgSearch({ onSelect }) {
  const [q,       setQ]       = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);
  const timer = useRef(null);

  const search = (val) => {
    setQ(val);
    clearTimeout(timer.current);
    if (!val.trim()) { setResults([]); setOpen(false); return; }
    setLoading(true);
    timer.current = setTimeout(async () => {
      const r = await rawgSearch(val);
      setResults(r);
      setOpen(r.length > 0);
      setLoading(false);
    }, 450);
  };

  const pick = (item) => {
    onSelect(item);
    setQ("");
    setResults([]);
    setOpen(false);
  };

  const noKey = RAWG_KEY === "YOUR_KEY_HERE";

  return (
    <div className="rawg-wrap">
      <label className="rawg-label">🔍 Szukaj w RAWG</label>
      {noKey && (
        <div className="nokey">
          ⚠️ Wklej swój klucz RAWG w stałej <strong>RAWG_KEY</strong> na górze pliku, żeby aktywować wyszukiwarkę gier.
        </div>
      )}
      <div className="rawg-row">
        <input
          className="rawg-in"
          value={q}
          onChange={e => search(e.target.value)}
          placeholder={noKey ? "Klucz RAWG nieaktywny" : "Wpisz nazwę gry..."}
          disabled={noKey}
          autoComplete="off"
        />
        {loading && <span className="rawg-spin">⏳</span>}
        {!loading && !noKey && <span className="rawg-badge">RAWG</span>}
      </div>
      {!noKey && <div className="rawg-hint">Wybierz grę żeby auto-uzupełnić pola</div>}

      {open && results.length > 0 && (
        <div className="rawg-dd">
          {results.map(r => (
            <div key={r.id} className="rawg-item" onClick={() => pick(r)}>
              {r.cover
                ? <img className="rawg-thumb" src={r.cover} alt="" loading="lazy" />
                : <div className="rawg-thumb-ph">🎮</div>
              }
              <div className="rawg-info">
                <div className="rawg-name">{r.title}</div>
                <div className="rawg-meta">{r.year}{r.genre ? " · " + r.genre : ""}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
function Modal({ game, onSave, onDel, onClose }) {
  const isEdit = !!game;
  const [f, setF] = useState(() => game ? { ...game } : { ...EF });

  const upd = (k, v) => setF(p => ({ ...p, [k]: v }));

  const fillFromRawg = (item) => {
    setF(p => ({
      ...p,
      title: item.title,
      abbr:  item.abbr,
      year:  item.year,
      genre: item.genre || p.genre,
      cover: item.cover,
    }));
  };

  function handleSave() {
    if (!f.title.trim()) { alert("Wpisz tytuł gry"); return; }
    const finalAbbr   = (f.abbr||"").trim().slice(0,2).toUpperCase() || makeAbbr(f.title);
    const finalRating = (f.rating !== "" && f.rating != null && String(f.rating).trim() !== "" && !isNaN(Number(f.rating)))
      ? Math.min(10, Math.max(1, Number(f.rating))) : null;
    onSave({ ...f, abbr: finalAbbr, year: Number(f.year)||new Date().getFullYear(), hours: Number(f.hours)||0, rating: finalRating });
  }

  return (
    <div className="ovr">
      <div className="mdl">
        <div className="mhdl" />
        <div className="mttl">{isEdit ? "✎ EDYTUJ GRĘ" : "+ DODAJ GRĘ"}</div>

        {/* RAWG SEARCH */}
        <RawgSearch onSelect={fillFromRawg} />

        {/* COVER PREVIEW */}
        {f.cover && <img className="cover-prev" src={f.cover} alt="" />}

        <div className="fg">
          <label className="fl">Tytuł *</label>
          <input className="fi" value={f.title} onChange={e => upd("title", e.target.value)} placeholder="np. God of War Ragnarök" />
        </div>

        <div className="f2">
          <div className="fg">
            <label className="fl">Skrót (2 lit.)</label>
            <input className="fi" value={f.abbr} maxLength={2} onChange={e => upd("abbr", e.target.value.toUpperCase())} placeholder="GW" />
          </div>
          <div className="fg">
            <label className="fl">Rok</label>
            <input className="fi" inputMode="numeric" value={f.year} onChange={e => upd("year", e.target.value)} />
          </div>
        </div>

        <div className="fg">
          <label className="fl">Status</label>
          <div className="ssg">
            {Object.entries(SM).map(([k,m]) => (
              <button key={k} type="button" className={"sso"+(f.status===k?" on":"")}
                style={{"--c":m.c,"--bg":m.bg}} onClick={()=>upd("status",k)}>{m.label}</button>
            ))}
          </div>
        </div>

        <div className="f2">
          <div className="fg">
            <label className="fl">Gatunek</label>
            <select className="fs" value={f.genre} onChange={e=>upd("genre",e.target.value)}>
              <option value="">— wybierz —</option>
              {GENRES.map(g=><option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="fg">
            <label className="fl">Godziny</label>
            <input className="fi" inputMode="decimal" value={f.hours} onChange={e=>upd("hours",e.target.value)} placeholder="0" />
          </div>
        </div>

        <div className="fg">
          <label className="fl">Ocena (1–10)</label>
          <input className="fi" inputMode="decimal" value={f.rating??""} onChange={e=>upd("rating",e.target.value)} placeholder="—" />
        </div>

        <div className="fg">
          <label className="fl">Notatki</label>
          <textarea className="fta" value={f.notes} onChange={e=>upd("notes",e.target.value)} placeholder="Twoje przemyślenia..." />
        </div>

        <div className="mac">
          <button type="button" className="bcn" onClick={onClose}>Anuluj</button>
          <button type="button" className="bpr" onClick={handleSave}>ZAPISZ</button>
          {isEdit && <button type="button" className="bdl" onClick={()=>onDel(game.id)}>🗑</button>}
        </div>
      </div>
    </div>
  );
}

// ── STATS ─────────────────────────────────────────────────────────────────────
function Stats({ games }) {
  if (!games.length) return (
    <div className="sta"><div className="empty"><div className="eic">📈</div><div className="ett">Brak danych</div><div className="ess">Dodaj gry, żeby zobaczyć statystyki</div></div></div>
  );
  const hrs = games.reduce((s,g)=>s+(g.hours||0),0);
  const rated = games.filter(g=>g.rating!=null);
  const avg = rated.length?(rated.reduce((s,g)=>s+g.rating,0)/rated.length).toFixed(1):"—";
  const kpis=[
    {l:"Gier razem",    v:games.length,c:C.blu},
    {l:"Ukończone",     v:games.filter(g=>g.status==="ukonczone").length,c:C.grn},
    {l:"Godzin łącznie",v:hrs%1?hrs.toFixed(1):hrs,c:C.pur},
    {l:"Śr. ocena",     v:avg,c:C.gld},
  ];
  const sData=Object.entries(SM).map(([k,m])=>({n:m.label,v:games.filter(g=>g.status===k).length,c:m.c}));
  const gMap={}; games.forEach(g=>{if(g.genre)gMap[g.genre]=(gMap[g.genre]||0)+1;});
  const gData=Object.entries(gMap).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([n,v])=>({n,v}));
  const buckets=[1,2,3,4,5,6,7,8,9,10].map(r=>({n:String(r),v:games.filter(g=>g.rating!=null&&Math.round(g.rating)===r).length}));

  return (
    <div className="sta">
      <div className="kgd">
        {kpis.map(k=><div key={k.l} className="kcd" style={{"--c":k.c}}><div className="kvl">{k.v}</div><div className="klb">{k.l}</div></div>)}
      </div>
      <div className="ccd">
        <div className="ctl">📊 Status kolekcji</div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={sData} barSize={24} margin={{top:4,left:-20,right:4,bottom:0}}>
            <XAxis dataKey="n" tick={{fill:C.dim,fontSize:9}} axisLine={false} tickLine={false}/>
            <YAxis hide/><Tooltip content={<CTip/>}/>
            <Bar dataKey="v" radius={[4,4,0,0]}>{sData.map((d,i)=><Cell key={i} fill={d.c} fillOpacity={.85}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {gData.length>0&&<div className="ccd">
        <div className="ctl">🎮 Top gatunki</div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={gData} barSize={20} margin={{top:4,left:-20,right:4,bottom:0}}>
            <XAxis dataKey="n" tick={{fill:C.dim,fontSize:9}} axisLine={false} tickLine={false}/>
            <YAxis hide/><Tooltip content={<CTip/>}/>
            <Bar dataKey="v" radius={[4,4,0,0]} fill={C.pur} fillOpacity={.8}/>
          </BarChart>
        </ResponsiveContainer>
      </div>}
      {rated.length>0&&<div className="ccd">
        <div className="ctl">⭐ Histogram ocen</div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={buckets} barSize={16} margin={{top:4,left:-20,right:4,bottom:0}}>
            <XAxis dataKey="n" tick={{fill:C.dim,fontSize:10}} axisLine={false} tickLine={false}/>
            <YAxis hide/><Tooltip content={<CTip/>}/>
            <Bar dataKey="v" radius={[4,4,0,0]}>{buckets.map((_,i)=><Cell key={i} fill={`hsl(${i*12},88%,55%)`} fillOpacity={.85}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>}
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [games,  setGames]  = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [tab,    setTab]    = useState("col");
  const [flt,    setFlt]    = useState("all");
  const [q,      setQ]      = useState("");
  const [modal,  setModal]  = useState(null);
  const [toast,  setToast]  = useState(null);

  useEffect(() => {
    const saved = storageLoad();
    if (saved.length) setGames(saved);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    storageSave(games);
  }, [games, loaded]);

  const flash = msg => { setToast(msg); setTimeout(()=>setToast(null), 1800); };

  function handleSave(form) {
    const isEdit = !!form.id;
    const id     = isEdit ? form.id : uid();
    const game   = { ...form, id };
    setGames(prev => isEdit ? prev.map(g => g.id===id ? game : g) : [...prev, game]);
    setModal(null);
    flash(isEdit ? "Zapisano ✓" : "Dodano ✓");
  }

  function handleDel(id) {
    const remaining = games.filter(g => g.id !== id);
    setGames(remaining);
    storageDel(id, remaining);
    setModal(null);
    flash("Usunięto");
  }

  const chips   = [{k:"all",l:"Wszystkie"}, ...Object.entries(SM).map(([k,m])=>({k,l:m.label}))];
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
            <button type="button" className={"tab"+(tab==="st"?" on":"")} onClick={()=>setTab("st")}>📊 Statystyki</button>
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
                      ? <div className="gcov" style={{backgroundImage:`url(${g.cover})`}}/>
                      : <div className="gcov-none"><div className="gab">{g.abbr||"??"}</div></div>
                    }
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
                        {g.rating!=null
                          ?<><span className="grn">{g.rating}</span><span className="grd">/10</span></>
                          :<span style={{color:C.dim,fontSize:17}}>—</span>}
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
