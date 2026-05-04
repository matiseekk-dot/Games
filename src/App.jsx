import { useState, useEffect, useRef, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

// v1.6.0 — extracted modules. App.jsx is now a thin orchestrator + components shell.
import {
  APP_VER,
  LS_LANG, LS_CURRENCY,
  G, GENRES_PL, GENRES_EN, STORES, PLATFORMS, CURRENCIES, EF,
} from './constants.js';
import { CSS } from './styles.js';
import { t, getSM } from './i18n.js';
import { uid, mkAbbr, daysUntil, dayKey, weekStart } from './lib/util.js';
import { fmtDate, fmtShort, pln, gamesWord, hoursWord, platynaWord, sessionsWord, fmtCph, fmtHours } from './lib/format.js';
import {
  lsRead, lsWrite,
  budgetRead, budgetWrite, timerRead, timerWrite,
  isOnboarded, setOnboarded,
  getLang, getCurrency, getCurSymbol, getDefaultCurrency,
  exportData, importMerge, importReplace,
  lastSeenAchRead, lastSeenAchWrite,
  menuSeenRead, menuSeenUpdate,
  wipeAllData,
} from './lib/storage.js';
import { registerSW, requestNotifPerm, checkReleases, shareText } from './lib/platform.js';
import { rawgSearch, fetchGameById } from './lib/rawg.js';
import { eanCacheRead, eanCacheWrite, cleanProductName, eanLookup } from './lib/barcode.js';
import { collectSessions, computeStreak, computeLongestStreak } from './lib/sessions.js';
import { ACHIEVEMENTS, computeAchievements, unlockedAchievementIds, getAchievementById } from './lib/achievements.js';
import { goalsRead, goalsWrite, monthBounds, daysLeftInMonth, GOAL_TYPES, GOAL_TEMPLATES, goalCurrent, goalParams } from './lib/goals.js';
import { getYearsWithData, computeYearReview } from './lib/wrapped.js';
import { makeDemoGames, hasDemoGames, removeDemoGames } from './lib/demo.js';
import { buildRecommendations, recsCacheStats, recsCacheClear } from './lib/recommend.js';
import { maybePushWeeklySummary } from './lib/weeklysummary.js';

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

function Onboarding({onSkip,onCurrencyPick,onLoadDemo,lang}){
  const features=[
    {ico:'🎮',tk:'obF1Title',dk:'obF1Desc'},{ico:'📅',tk:'obF2Title',dk:'obF2Desc'},
    {ico:'💰',tk:'obF3Title',dk:'obF3Desc'},{ico:'📊',tk:'obF4Title',dk:'obF4Desc'},
  ];
  // v1.10.0 — Flipped onboarding flow: demo loads first, features animate in background,
  // currency is a 1-tap confirmation derived from navigator.language. Three steps:
  //   1 = welcome (single big CTA, hooks attention)
  //   2 = features carousel (auto-advance ~1.5s/card, skippable, demo loads in bg on entry)
  //   3 = currency confirm (preselected, 1-tap dismiss; secondary "change" link expands picker)
  const [step,setStep]=useState(1);
  // Auto-advancing carousel index for step 2 (0..features.length-1, then +1 = "done").
  const [carIdx,setCarIdx]=useState(0);
  // Toggle: when user taps "change →" on step 3, expand the full grid picker.
  const [expandedPicker,setExpandedPicker]=useState(false);
  // Detected currency from navigator.language (already uses navigator.language internally).
  // Shows as preselected in confirm step; user can override via expanded picker.
  const [pickedCur,setPickedCur]=useState(()=>{
    try { const s=localStorage.getItem(LS_CURRENCY); if(s && CURRENCIES[s]) return s; } catch{}
    return getDefaultCurrency();
  });
  function selectCur(code){
    setPickedCur(code);
    if(typeof onCurrencyPick==='function') onCurrencyPick(code);
  }

  // Step 1 → Step 2 transition: load demo silently in the background. By the time the
  // user finishes the carousel (~6s) or skips it, demo data is already in localStorage and
  // games[] is populated. The currency confirm step then just persists the locale-derived
  // pick and exits to the populated Home — net latency: zero.
  function startCarousel(){
    if(typeof onLoadDemo==='function') onLoadDemo();
    setStep(2);
  }

  // Auto-advance carousel: 1500ms per card, then advance to step 3. Cleanup timer on
  // unmount or step change — important because skip/back would leave a stray timeout.
  useEffect(()=>{
    if(step!==2) return;
    if(carIdx >= features.length){ setStep(3); return; }
    const tm=setTimeout(()=>setCarIdx(i=>i+1), 1500);
    return ()=>clearTimeout(tm);
  },[step,carIdx,features.length]);

  if(step===1){
    return(
      <div className='onboard'>
        <div className='ob-logo'>V</div>
        <div className='ob-title'>{t(lang,'obWelcomeTitle')}</div>
        <div className='ob-sub'>{t(lang,'obWelcomeSub')}</div>
        <button type='button' className='ob-start' onClick={startCarousel}>{t(lang,'obWelcomeStart')}</button>
      </div>
    );
  }

  if(step===2){
    // Features carousel — single card visible at a time, dot indicators below, skip link top-right.
    const f = features[Math.min(carIdx, features.length-1)];
    return(
      <div className='onboard ob-carousel'>
        <button type='button' className='ob-carousel-skip' onClick={()=>setStep(3)}>{t(lang,'obCarouselSkip')}</button>
        <div className='ob-carousel-card' key={carIdx}>
          <div className='ob-carousel-ico'>{f.ico}</div>
          <div className='ob-carousel-title'>{t(lang,f.tk)}</div>
          <div className='ob-carousel-desc'>{t(lang,f.dk)}</div>
        </div>
        <div className='ob-carousel-dots'>
          {features.map((_,i)=>(
            <span key={i} className={'ob-carousel-dot'+(i===carIdx?' on':'')}/>
          ))}
        </div>
      </div>
    );
  }

  // Step 3: 1-tap currency confirm. The expanded picker is hidden behind "change →"
  // so the default path is a single tap.
  // Escape hatch: tapping "Zacznę od pustej kolekcji" clears the demo data that loaded
  // in the background during step 1→2 — gives users who explicitly don't want demo a way
  // out, at the cost of a slightly less prominent placement (below the change-currency link).
  const def = CURRENCIES[pickedCur] || CURRENCIES.PLN;
  const curName = def.name[lang] || def.name.en;
  if(!expandedPicker){
    return(
      <div className='onboard'>
        <div className='ob-logo' style={{fontSize:36}}>{def.symbol}</div>
        <div className='ob-title'>{t(lang,'obCurConfirmTitle')}</div>
        <div className='ob-sub'>{t(lang,'obCurConfirmSub',{curName,curCode:pickedCur})}</div>
        <button type='button' className='ob-start' onClick={()=>{selectCur(pickedCur);onSkip();}}>{t(lang,'obCurConfirmOk')}</button>
        <button type='button' onClick={()=>setExpandedPicker(true)} style={{marginTop:10,padding:'10px',background:'transparent',border:'none',color:'#8B93A7',fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:500,cursor:'pointer',textDecoration:'underline',textUnderlineOffset:3,width:'100%'}}>{t(lang,'obCurConfirmChange')}</button>
        <button type='button' onClick={()=>{
          // User explicitly opts out of demo. Caller's onSkip handler doesn't know about
          // demo — we need to tell App to clear demo games. Done inline by re-using
          // onLoadDemo's state with empty input (semantic abuse, but practical):
          // we set onCurrencyPick to picked then call onSkip with an "empty" hint.
          // Simpler approach: directly call window.__ps5v_clearDemo if exposed by App,
          // else just call onSkip — user will see demo and can clear via Settings.
          if(typeof window.__ps5v_clearDemo === 'function') window.__ps5v_clearDemo();
          selectCur(pickedCur);
          onSkip();
        }} style={{marginTop:6,padding:'8px',background:'transparent',border:'none',color:'#6B7388',fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:500,cursor:'pointer',textDecoration:'underline',textUnderlineOffset:3,width:'100%'}}>{t(lang,'obDemoSkip')}</button>
      </div>
    );
  }
  // Expanded picker (legacy step 2 from v1.9 — same component, reached only if user taps "change →")
  return(
    <div className='onboard'>
      <div className='ob-logo' style={{fontSize:36}}>💰</div>
      <div className='ob-title'>{t(lang,'obCurrencyTitle')}</div>
      <div className='ob-sub'>{t(lang,'obCurrencySub')}</div>
      <div className='cur-grid'>
        {Object.values(CURRENCIES).map(d=>(
          <button key={d.code} type='button'
            className={'cur-btn'+(pickedCur===d.code?' on':'')}
            onClick={()=>selectCur(d.code)}>
            <span className='cur-btn-sym'>{d.symbol}</span>
            <span className='cur-btn-code'>{d.code}</span>
            <span className='cur-btn-name'>{d.name[lang]||d.name.en}</span>
          </button>
        ))}
      </div>
      <button type='button' className='ob-start' onClick={()=>{selectCur(pickedCur);onSkip();}}>{t(lang,'obContinue')}</button>
    </div>
  );
}

function Toast({msg}){
  if(!msg)return null;
  const type=msg.startsWith('❌')?'err':msg.startsWith('ℹ')?'info':'ok';
  return<div className={`toast toast-${type}`}>{msg}</div>;
}

function Confirm({title,body,onYes,onNo,lang}){
  return(
    <div className='confirm-ovr' onClick={onNo}>
      <div className='confirm-box' onClick={e=>e.stopPropagation()}>
        <div className='confirm-ico'>🗑</div>
        <div className='confirm-title'>{title}</div>
        <div className='confirm-body'>{body}</div>
        <div className='confirm-btns'>
          <button type='button' className='confirm-no' onClick={onNo}>{t(lang||'pl','cancel')}</button>
          <button type='button' className='confirm-yes' onClick={onYes}>{t(lang||'pl','delete')}</button>
        </div>
      </div>
    </div>
  );
}

// v1.7.0 — toast-style banner that surfaces freshly-unlocked achievements.
// Renders at most ONE achievement at a time (the first newly-unlocked, by definition order
// in ACHIEVEMENTS array). If multiple unlocked simultaneously, queue head shows + counter.
// Tap → opens Achievements overlay. Auto-dismisses after 6s. Rare-tier gets gold accent.
//
// Important: we deliberately don't show the banner on first load after install/update —
// the App-level useEffect handles the silent migration (sets lastSeenAch = current set).
// This banner only fires for genuine NEW unlocks during the session.
function AchievementBanner({ ach, queueLen, onTap, onDismiss, lang }){
  if(!ach) return null;
  const title = ach.title?.[lang] || ach.title?.pl || ach.id;
  return (
    <div className={'ach-banner'+(ach.rare?' rare':'')} onClick={onTap}>
      <div className='ach-banner-ico'>{ach.ico||'🏆'}</div>
      <div className='ach-banner-body'>
        <div className='ach-banner-lbl'>{t(lang,'achNewUnlock')}</div>
        <div className='ach-banner-ttl'>{title}{queueLen>1 && <span className='ach-banner-cnt'> +{queueLen-1}</span>}</div>
      </div>
      <button type='button' className='ach-banner-x' onClick={e=>{e.stopPropagation();onDismiss();}} aria-label={t(lang,'cancel')}>✕</button>
    </div>
  );
}

function BarcodeScanner({ onPick, onClose, lang }){
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const intervalRef = useRef(null);
  const handleEANRef = useRef(null);
  // Phases:
  //   'init'        — checking BarcodeDetector / requesting camera
  //   'scanning'    — camera live, polling for codes
  //   'lookup'      — got an EAN, asking UPCitemdb
  //   'rawg'        — got a name, asking RAWG
  //   'results'     — done, show RAWG hits (possibly 0) + scan-again
  //   'unsupported' — no BarcodeDetector available (iOS Safari)
  //   'denied'      — user denied camera
  //   'error'       — getUserMedia threw something else
  const [phase, setPhase] = useState('init');
  const [ean, setEan] = useState('');
  const [productName, setProductName] = useState('');
  const [fromCache, setFromCache] = useState(false);
  const [results, setResults] = useState([]);
  const [errMsg, setErrMsg] = useState('');
  const [manualEAN, setManualEAN] = useState('');

  const stopCam = useCallback(()=>{
    if(intervalRef.current){ clearInterval(intervalRef.current); intervalRef.current = null; }
    const s = streamRef.current;
    if(s){ s.getTracks().forEach(t=>{ try{ t.stop(); }catch{} }); streamRef.current = null; }
    const v = videoRef.current;
    if(v){ try{ v.srcObject = null; }catch{} }
  },[]);

  // Pure pipeline: EAN → UPCitemdb → name cleaning → rawgSearch → results
  const handleEAN = useCallback(async (code)=>{
    stopCam();
    const clean = String(code).replace(/\D/g,'');
    if(!clean){ return; }
    setEan(clean);
    setProductName('');
    setResults([]);
    setFromCache(Object.prototype.hasOwnProperty.call(eanCacheRead(), clean));
    setPhase('lookup');
    const name = await eanLookup(clean);
    if(name){
      setProductName(name);
      const cleanedName = cleanProductName(name);
      const query = cleanedName.length >= 3 ? cleanedName : name;
      setPhase('rawg');
      const r = await rawgSearch(query);
      setResults(r);
      setPhase('results');
    } else {
      // No name available — try the raw EAN against RAWG as a Hail Mary, but it'll
      // almost always come back empty. The 'results' phase handles 0 hits gracefully.
      setProductName('');
      setPhase('rawg');
      const r = await rawgSearch(clean);
      setResults(r);
      setPhase('results');
    }
  },[stopCam]);

  // Keep the latest handleEAN reachable from the polling interval without re-creating it
  handleEANRef.current = handleEAN;

  const startCamera = useCallback(async ()=>{
    setPhase('init');
    setEan(''); setProductName(''); setResults([]); setErrMsg(''); setFromCache(false);

    if(!('BarcodeDetector' in window)){
      setPhase('unsupported');
      return;
    }
    try{
      const formats = await window.BarcodeDetector.getSupportedFormats();
      const want = ['ean_13','ean_8','upc_a','upc_e'].filter(f=>formats.includes(f));
      if(!want.length){ setPhase('unsupported'); return; }
      detectorRef.current = new window.BarcodeDetector({ formats: want });
    }catch{
      setPhase('unsupported');
      return;
    }

    if(!navigator.mediaDevices?.getUserMedia){
      setPhase('unsupported');
      return;
    }

    try{
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      const v = videoRef.current;
      if(!v){ stream.getTracks().forEach(t=>t.stop()); return; }
      v.srcObject = stream;
      v.setAttribute('playsinline','true');
      v.muted = true;
      try{ await v.play(); }catch{}
      setPhase('scanning');

      intervalRef.current = setInterval(async ()=>{
        const det = detectorRef.current; const vid = videoRef.current;
        if(!det || !vid || vid.readyState < 2) return;
        try{
          const codes = await det.detect(vid);
          if(codes && codes.length){
            const raw = codes[0].rawValue || '';
            // EAN-13 is 13 digits, EAN-8 is 8, UPC-A is 12, UPC-E is 6-8. Accept 8–14 digits.
            if(/^\d{8,14}$/.test(raw)){
              handleEANRef.current?.(raw);
            }
          }
        }catch{ /* one bad frame is fine, keep polling */ }
      }, 280);
    }catch(e){
      const name = e && e.name;
      if(name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError'){
        setPhase('denied');
      } else {
        setErrMsg((e && e.message) || String(e || ''));
        setPhase('error');
      }
    }
  },[]);

  // Boot once on mount; stop camera on unmount.
  useEffect(()=>{
    let alive = true;
    (async()=>{ if(alive) await startCamera(); })();
    return ()=>{ alive = false; stopCam(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // Re-acquire camera when user taps "Scan again" after a result/no-match
  const rescan = ()=>{ stopCam(); startCamera(); };

  const submitManual = ()=>{
    const code = manualEAN.replace(/\D/g,'');
    if(code.length < 8) return;
    setManualEAN('');
    handleEAN(code);
  };

  const close = ()=>{ stopCam(); onClose(); };

  // ── Render bits ──
  const showVideo = phase === 'init' || phase === 'scanning';
  const showStatus = phase === 'lookup' || phase === 'rawg';
  const showResults = phase === 'results';
  const showHardError = phase === 'unsupported' || phase === 'denied' || phase === 'error';

  return (
    <div className='bs-ovr' role='dialog' aria-label={t(lang,'scanTitle')}>
      <div className='bs-hdr'>
        <div className='bs-ttl'>📷 {t(lang,'scanTitle')}</div>
        <button type='button' className='bs-x' onClick={close} aria-label={t(lang,'cancel')}>✕</button>
      </div>

      {showVideo && (
        <div className='bs-vid'>
          <video ref={videoRef} playsInline muted autoPlay/>
          <div className='bs-frm'><div className='bs-laser'/></div>
          <div className='bs-hint'>
            {phase==='init' ? t(lang,'scanInitializing') : t(lang,'scanHint')}
          </div>
        </div>
      )}

      <div className='bs-pn'>
        {showHardError && (
          <>
            <div className={'bs-err'+(phase==='unsupported'?' warn':'')}>
              <div className='bs-err-h'>
                {phase==='unsupported' && t(lang,'scanUnsupported')}
                {phase==='denied'      && t(lang,'scanDenied')}
                {phase==='error'       && t(lang,'scanError')}
              </div>
              <div className='bs-err-d'>
                {phase==='unsupported' && t(lang,'scanUnsupportedHint')}
                {phase==='denied'      && t(lang,'scanDeniedHint')}
                {phase==='error'       && (errMsg || '—')}
              </div>
            </div>
          </>
        )}

        {showStatus && (
          <div className='bs-st'>
            <span className='bs-spin'>⏳</span>
            <div className='bs-stxt'>
              <div className='bs-stitle'>
                {phase==='lookup' && t(lang,'scanLookup',{ean})}
                {phase==='rawg'   && t(lang,'scanRawg',{q: productName ? cleanProductName(productName) || productName : ean})}
                {phase==='rawg' && fromCache && <span className='bs-cached'>{t(lang,'scanCachedHint')}</span>}
              </div>
              {phase==='rawg' && productName && (
                <div className='bs-sdesc'>{t(lang,'scanFoundAs',{name: productName})}</div>
              )}
            </div>
          </div>
        )}

        {showResults && results.length > 0 && (
          <>
            {productName && (
              <div className='bs-st'>
                <span style={{fontSize:18,flexShrink:0}}>🎯</span>
                <div className='bs-stxt'>
                  <div className='bs-stitle'>EAN {ean}{fromCache && <span className='bs-cached'>{t(lang,'scanCachedHint')}</span>}</div>
                  <div className='bs-sdesc'>{t(lang,'scanFoundAs',{name: productName})}</div>
                </div>
              </div>
            )}
            <div className='bs-results-h'>{t(lang,'scanFound')||'Results'}</div>
            <div className='rdd' style={{position:'relative',marginTop:0}}>
              {results.map(r=>(
                <div key={r.id} className='rit' onClick={()=>{ stopCam(); onPick(r); }}>
                  {r.cover ? <img className='rthm' src={r.cover} alt='' loading='lazy'/> : <div className='rph'>🎮</div>}
                  <div className='rinf'>
                    <div className='rnm'>{r.title}</div>
                    <div className='rmt'>{r.year}{r.genre?' · '+r.genre:''}{r.releaseDate?' · '+fmtDate(r.releaseDate,lang):''}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className='bs-actrow'>
              <button type='button' className='bs-retry' onClick={rescan}>{t(lang,'scanRetry')}</button>
            </div>
          </>
        )}

        {showResults && results.length === 0 && (
          <>
            <div className='bs-err warn'>
              <div className='bs-err-h'>
                {productName ? t(lang,'scanNoMatch') : t(lang,'scanNoEAN',{ean})}
              </div>
              <div className='bs-err-d'>
                {productName ? <>EAN {ean} → "{productName}". {t(lang,'scanNoMatchHint')}</> : t(lang,'scanNoEANHint')}
              </div>
            </div>
            <div className='bs-actrow'>
              <button type='button' className='bs-retry' onClick={rescan}>{t(lang,'scanRetry')}</button>
            </div>
          </>
        )}

        {/* Manual EAN entry — always available as a fallback */}
        <div className='bs-mlbl'>{t(lang,'scanManualLabel')}</div>
        <div className='bs-mrow'>
          <input
            inputMode='numeric'
            pattern='\d*'
            maxLength={14}
            value={manualEAN}
            onChange={e=>setManualEAN(e.target.value.replace(/\D/g,''))}
            placeholder={t(lang,'scanManualPh')}
            onKeyDown={e=>{ if(e.key==='Enter') submitManual(); }}
            disabled={phase==='lookup'||phase==='rawg'}
          />
          <button
            type='button'
            onClick={submitManual}
            disabled={manualEAN.length < 8 || phase==='lookup' || phase==='rawg'}
          >{t(lang,'scanManualBtn')}</button>
        </div>
      </div>
    </div>
  );
}

function RawgSearch({onSelect,lang}){
  const [q,setQ]=useState(''); const [res,setRes]=useState([]); const [busy,setBusy]=useState(false); const [open,setOpen]=useState(false);
  const [scanOpen,setScanOpen]=useState(false);
  const timer=useRef(null);
  const reqId=useRef(0);
  const search=val=>{
    setQ(val);
    clearTimeout(timer.current);
    setRes([]);
    if(!val.trim()){setOpen(false);setBusy(false);return;}
    setBusy(true);
    setOpen(true);
    const myReq=++reqId.current;
    timer.current=setTimeout(async()=>{
      const r=await rawgSearch(val);
      if(myReq!==reqId.current)return;
      setRes(r);
      // Keep dropdown open even when 0 results — show "not found" hint instead of silently closing
      setOpen(true);
      setBusy(false);
    },450);
  };
  const pick=item=>{onSelect(item);setQ('');setRes([]);setOpen(false);reqId.current++;};
  // Scanner pick goes through the same fill pipeline, then closes the scanner.
  const pickFromScan=item=>{ pick(item); setScanOpen(false); };
  return(
    <div className='rwrp'>
      <label className='rlbl'>{t(lang,'searchRawg')}</label>
      <div className='rrow'>
        <input className='rin' value={q} onChange={e=>search(e.target.value)} placeholder={t(lang,'rawgPlaceholder')} autoComplete='off'/>
        <button type='button' className='rscan' onClick={()=>setScanOpen(true)} aria-label={t(lang,'scanBarcodeAria')} title={t(lang,'scanBarcodeAria')}>📷</button>
        {busy?<span style={{flexShrink:0,display:'inline-block',animation:'spin .8s linear infinite'}}>⏳</span>:<span className='rbdg2'>RAWG</span>}
      </div>
      <div className='rhnt'>{t(lang,'rawgHint')}</div>
      {open&&<div className='rdd'>
        {busy&&res.length===0&&<div style={{padding:'14px',textAlign:'center',color:'#8B93A7',fontSize:11}}>{lang==='pl'?'Szukam...':'Searching...'}</div>}
        {!busy&&res.length===0&&q.trim()&&<div style={{padding:'14px 12px',textAlign:'center'}}>
          <div style={{fontSize:22,marginBottom:6}}>🔍</div>
          <div style={{fontSize:12,fontWeight:700,color:G.txt,marginBottom:3}}>{t(lang,'rawgNotFound')}</div>
          <div style={{fontSize:10,color:G.dim,lineHeight:1.4}}>{t(lang,'rawgNotFoundHint')}</div>
        </div>}
        {res.map(r=>(
        <div key={r.id} className='rit' onClick={()=>pick(r)}>
          {r.cover?<img className='rthm' src={r.cover} alt='' loading='lazy'/>:<div className='rph'>🎮</div>}
          <div className='rinf'><div className='rnm'>{r.title}</div><div className='rmt'>{r.year}{r.genre?' · '+r.genre:''}{r.releaseDate?' · '+fmtDate(r.releaseDate,lang):''}</div></div>
        </div>
      ))}</div>}
      {scanOpen && <BarcodeScanner onPick={pickFromScan} onClose={()=>setScanOpen(false)} lang={lang}/>}
    </div>
  );
}

function Modal({game,onSave,onDel,onClose,notifPerm,onRequestNotif,lang,flash}){
  // v1.9.0: isEdit checks game.id specifically (not just truthy) so that pre-fill
  // objects from Recommendations (which carry title/cover/rawgId but no id) are
  // treated as NEW games with prefilled fields, not edits of nonexistent games.
  const isEdit=!!(game && game.id);
  const [f,setF]=useState(()=>game?{...EF,...game}:{...EF});
  const [confirmDel,setConfirmDel]=useState(false);
  const [shake,setShake]=useState(false);
  // v1.4.0 — Quick add: collapsed by default for new games, expanded for edits.
  // Edits typically need full visibility (user came to change something specific);
  // adds want a friction-free "RAWG → pick → save" path.
  const [showDetails,setShowDetails]=useState(isEdit);
  // Track whether targetHours came from RAWG playtime so we can show the explanatory hint
  // and clear it once the user manually overrides the value.
  const [targetFromRawg,setTargetFromRawg]=useState(false);
  // v1.13.1 — Refresh-from-RAWG state. Only meaningful for edited games with a rawgId.
  // Flips true while the fetch is in flight, blocks button taps, shows spinner.
  const [refreshing,setRefreshing]=useState(false);
  const titleRef=useRef(null);
  const SM=getSM(lang);
  const genres=lang==='en'?GENRES_EN:GENRES_PL;
  // upd auto-regenerates abbr from title on every keystroke (abbr field is hidden in UI now).
  const upd=(k,v)=>setF(p=>{
    const n={...p,[k]:v};
    if(k==='title'&&!isEdit) n.abbr=mkAbbr(v);
    if(k==='targetHours') setTargetFromRawg(false); // user-typed → drop the "from RAWG" badge
    return n;
  });
  // RAWG/scanner pick: prefill title/year/genre/cover/release date AND target hours
  // (only if currently empty — never overwrite a user-typed target).
  // v1.9.0: also stash the RAWG game id as `rawgId` for later use as a Recommendations seed.
  const fill=item=>setF(p=>{
    const next={
      ...p,
      title:item.title,
      abbr:item.abbr || mkAbbr(item.title),
      year:item.year,
      genre:item.genre||p.genre,
      cover:item.cover,
      releaseDate:item.releaseDate||p.releaseDate,
      rawgId:item.id || p.rawgId || null,
    };
    const pt=+item.playtime||0;
    const currentTarget=+p.targetHours||0;
    if(pt>0 && currentTarget===0){
      next.targetHours=pt;
      setTargetFromRawg(true);
    }
    return next;
  });
  // v1.13.1 — Refresh-from-RAWG: re-fetch the canonical game data by rawgId and
  // overwrite the 4 RAWG-controlled fields (releaseDate, year, genre, cover).
  // We do NOT touch user-controlled fields:
  //   title — user may have customized ("My Speedrun Save")
  //   abbr — derived from title, user may have overridden
  //   status, hours, rating, notes, priceBought/Sold, storeBought, targetHours,
  //   extraSpend, platform, platinum, lastPlayed, completedAt, sessions,
  //   notifyEnabled — all user-tracked or user-preference fields
  //
  // Diff is reported in the success toast so the user knows what changed
  // ("Zaktualizowano: data, okładka") or that there was nothing new ("Brak zmian").
  // Errors (404, network, abort) flash a generic failure toast.
  async function refreshFromRawg(){
    if(refreshing) return;
    if(!f.rawgId) return; // button only renders when rawgId exists, but defensive
    setRefreshing(true);
    try {
      const fresh = await fetchGameById(f.rawgId);
      if(!fresh){
        if(typeof flash==='function') flash(t(lang,'rawgRefreshErr'));
        return;
      }
      // Build per-field diff. Only flag a field as "changed" if the new value is
      // truthy AND different from current. RAWG returning empty string for a field
      // we already have populated should NOT clear our data.
      const changes = [];
      const updates = {};
      if(fresh.releaseDate && fresh.releaseDate !== f.releaseDate){
        updates.releaseDate = fresh.releaseDate;
        changes.push(t(lang,'rawgFieldDate'));
      }
      if(fresh.year && fresh.year !== f.year){
        updates.year = fresh.year;
        // year usually moves with releaseDate so we don't double-flag in the toast
        if(!updates.releaseDate) changes.push(t(lang,'rawgFieldYear'));
      }
      if(fresh.genre && fresh.genre !== f.genre){
        updates.genre = fresh.genre;
        changes.push(t(lang,'rawgFieldGenre'));
      }
      if(fresh.cover && fresh.cover !== f.cover){
        updates.cover = fresh.cover;
        changes.push(t(lang,'rawgFieldCover'));
      }
      if(changes.length === 0){
        if(typeof flash==='function') flash(t(lang,'rawgRefreshNoChanges'));
        return;
      }
      // Apply updates (functional form — safe vs concurrent state changes mid-fetch).
      setF(p => ({...p, ...updates}));
      if(typeof flash==='function') flash(t(lang,'rawgRefreshOk',{fields:changes.join(', ')}));
    } catch {
      if(typeof flash==='function') flash(t(lang,'rawgRefreshErr'));
    } finally {
      setRefreshing(false);
    }
  }
  function handleSave(){
    if(!f.title.trim()){
      setShake(true);
      setTimeout(()=>setShake(false),500);
      titleRef.current?.focus();
      // Force the details accordion open if user hits Save without a title — but
      // title lives in the quick-add view, so just shake. Nothing to expand here.
      return;
    }
    // abbr is no longer user-editable; always derive from title at save time as the
    // canonical fallback. Keeps existing-game abbr stable across edits.
    const abbr=(f.abbr||'').trim().slice(0,2).toUpperCase()||mkAbbr(f.title);
    // Rating: only clamp if user actually typed something. Previously `+null = 0` coerced to 1
    // via Math.max(1,0), which magically assigned rating=1 every time an unrated game was saved
    // (e.g. after a status change). Guard against null/undefined/empty/non-finite before clamping.
    const rRaw=f.rating;
    const rNum=(rRaw===null||rRaw===undefined||rRaw==='')?NaN:+rRaw;
    const rating=Number.isFinite(rNum)&&rNum>0?Math.min(10,Math.max(1,rNum)):null;
    // priceSold UX: single input where empty string = not sold (no toggle anymore).
    // Anything else gets coerced to a number string at the storage layer.
    const priceSold = (f.priceSold===null||f.priceSold==='') ? null : f.priceSold;
    onSave({...f,abbr,year:+f.year||new Date().getFullYear(),hours:+f.hours||0,rating,targetHours:+f.targetHours||0,priceSold});
  }
  const days=daysUntil(f.releaseDate);
  return(
    <>
      <div className='ovr'>
        <div className='mdl'>
          <div className='mhdl'/>
          <div className='mttl'>{isEdit?t(lang,'editGameTitle'):t(lang,'addGameTitle')}</div>
          {/* ── Quick add core: search → cover → title → status ─────────────────── */}
          <RawgSearch onSelect={fill} lang={lang}/>
          {f.cover&&<img className='covp' src={f.cover} alt=''/>}
          <div className='fg'>
            <label className='fl'>{t(lang,'titleField')}</label>
            <input ref={titleRef} className={`fi${shake?' shake':''}`} value={f.title} onChange={e=>upd('title',e.target.value)} placeholder='God of War Ragnarök'/>
          </div>
          <div className='fg'><label className='fl'>{t(lang,'statusField')}</label>
            <div className='ssg'>{Object.entries(SM).map(([k,m])=>(
              <button key={k} type='button' className={'sso'+(f.status===k?' on':'')} style={{'--c':m.c,'--bg':m.bg}} onClick={()=>upd('status',k)}>{m.label}</button>
            ))}</div>
          </div>

          {/* ── Accordion toggle ────────────────────────────────────────────────── */}
          <button type='button' className='acc-btn' onClick={()=>setShowDetails(v=>!v)} aria-expanded={showDetails}>
            {showDetails?t(lang,'lessDetails'):t(lang,'moreDetails')}
          </button>

          {/* ── Details body (year, platform, release, genre, hours, rating, target, notes, finance, notifications, platinum) ── */}
          {showDetails && <div className='acc-body'>
            <div className='f2'>
              <div className='fg'><label className='fl'>{t(lang,'yearField')}</label><input className='fi' inputMode='numeric' value={f.year} onChange={e=>upd('year',e.target.value)}/></div>
              <div className='fg'><label className='fl'>{t(lang,'platformField')}</label>
                <select className='fs' value={f.platform||'PS5'} onChange={e=>upd('platform',e.target.value)}>
                  {PLATFORMS.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className='fg'>
              <label className='fl'>{t(lang,'releaseDateField')}{days!==null&&days>=0&&<span style={{marginLeft:8,fontWeight:700,color:days===0?G.grn:days<=3?G.org:G.pur}}>{days===0?'— '+t(lang,'releaseToday'):`— ${lang==='en'?'in':'za'} ${days} ${lang==='en'?'days':'dni'}`}</span>}</label>
              <input className='fi' type='date' value={f.releaseDate} onChange={e=>upd('releaseDate',e.target.value)} style={{colorScheme:'dark'}}/>
              <div className='fhnt'>{t(lang,'releaseDateHint')}</div>
              {/* v1.13.1 — Refresh from RAWG. Only shown for edited games with a rawgId
                  (new games and pre-v1.9 games without rawgId have nothing to refresh). */}
              {isEdit && f.rawgId && (
                <button type='button' className='rawg-refresh' onClick={refreshFromRawg} disabled={refreshing}>
                  {refreshing ? <><span className='rawg-refresh-spin'/>{t(lang,'rawgRefreshing')}</> : <>🔄 {t(lang,'rawgRefreshBtn')}</>}
                </button>
              )}
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
              <div className='fg'>
                <label className='fl'>{t(lang,'targetHoursField')}</label>
                <input className='fi' inputMode='decimal' value={f.targetHours||''} onChange={e=>upd('targetHours',e.target.value)} placeholder={t(lang,'targetPh')}/>
                {targetFromRawg && f.targetHours>0 && <div className='fhnt' style={{color:G.blu}}>⚡ {t(lang,'targetFromRawg')}</div>}
              </div>
            </div>
            <div className='fg'><label className='fl'>{t(lang,'notesField')}</label><textarea className='fta' value={f.notes} onChange={e=>upd('notes',e.target.value)} placeholder={t(lang,'notesPh')}/></div>
            {f.status==='ukonczone'&&<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',background:f.platinum?'rgba(255,209,102,.08)':G.bg,border:f.platinum?'1px solid rgba(255,209,102,.4)':'1px solid '+G.bdr,borderRadius:9,cursor:'pointer',transition:'all .2s'}} onClick={()=>upd('platinum',!f.platinum)}>
              <div><div style={{fontSize:14,color:f.platinum?G.gld:G.txt}}>🏆 {t(lang,'platinum')}</div><div style={{fontSize:10,color:G.dim,marginTop:2}}>{lang==='pl'?'Zdobyłem platynowe trofeum':'I earned the platinum trophy'}</div></div>
              <div style={{width:44,height:26,borderRadius:13,background:f.platinum?G.gld:G.bdr,position:'relative',flexShrink:0,transition:'background .2s'}}>
                <div style={{position:'absolute',top:3,left:f.platinum?21:3,width:20,height:20,borderRadius:'50%',background:'#fff',transition:'left .2s'}}/>
              </div>
            </div>}
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
            <div className='fg'><label className='fl'>{t(lang,'extraSpendField')}</label><input className='fi' inputMode='decimal' value={f.extraSpend||''} onChange={e=>upd('extraSpend',e.target.value)} placeholder='0'/><div className='fhnt'>{t(lang,'extraSpendHint')}</div></div>
            {/* Sold-for: single input replaces former toggle+input combo. Empty value = not sold. */}
            <div className='fg'>
              <label className='fl'>{t(lang,'soldField')}</label>
              <input
                className='fi'
                inputMode='decimal'
                value={f.priceSold==null?'':f.priceSold}
                onChange={e=>upd('priceSold', e.target.value===''?null:e.target.value)}
                placeholder='—'
              />
              <div className='fhnt'>{t(lang,'soldFieldHint')}</div>
            </div>
            {f.releaseDate&&<div className='fg'><label className='fl'>{t(lang,'notifications')}</label>
              {notifPerm==='denied'?<div style={{fontSize:11,color:G.red,padding:'8px 0'}}>{t(lang,'notifyBlocked')}</div>:(
                <div className='ntgl2' onClick={async()=>{if(!f.notifyEnabled&&notifPerm!=='granted')await onRequestNotif();upd('notifyEnabled',!f.notifyEnabled);}}>
                  <div><div className='ntgl2-l'>{t(lang,'notifyOn')}</div><div className='ntgl2-s'>{t(lang,'notifyDesc')}</div></div>
                  <div className={'ntgl2-sw'+(f.notifyEnabled?' on':'')}><div className='ntgl2-knob'/></div>
                </div>
              )}
            </div>}
          </div>}
          <div className='mac'>
            <button type='button' className='bcn' onClick={onClose}>{t(lang,'cancel')}</button>
            <button type='button' className='bpr' onClick={handleSave}>{t(lang,'save')}</button>
            {isEdit&&<button type='button' className='bdl' onClick={()=>setConfirmDel(true)}>🗑</button>}
          </div>
        </div>
      </div>
      {confirmDel&&<Confirm title={t(lang,'confirmDelete')} body={t(lang,'confirmDeleteBody',{title:game.title})} onYes={()=>onDel(game.id)} onNo={()=>setConfirmDel(false)} lang={lang}/>}
    </>
  );
}

function SessionTimer({game, onSave, lang}) {
  // Timer state shape in localStorage: {gameId, start, pausedAt?, totalPause?}
  // - start: Unix ms when session began
  // - pausedAt: Unix ms of current pause start (null if not paused)
  // - totalPause: accumulated pause ms from all previous pauses in this session
  const [active, setActive] = useState(()=>{ const t=timerRead(); return t&&t.gameId===game.id?t:null; });
  const [elapsed, setElapsed] = useState(0);  // seconds of ACTIVE play time (excluding pauses)
  const G2 = G;

  // On mount: stale pause guard — if user paused and app was closed >24h ago, auto-stop saving what we have
  useEffect(()=>{
    if(!active || !active.pausedAt) return;
    const pauseDurationMs = Date.now() - active.pausedAt;
    if(pauseDurationMs > 24*60*60*1000){
      // Stale pause — save whatever was played before pause, don't count 24h+ as play
      const totalPauseMs = (active.totalPause||0) + 0; // freeze pause at moment it started
      const activeMs = active.pausedAt - active.start - totalPauseMs;
      const hrs = Math.max(0, activeMs/3600000);
      timerWrite(null); setActive(null); setElapsed(0);
      if(hrs > 0){
        onSave(hrs, {startedAt: active.start, endedAt: active.pausedAt, hours: hrs});
      }
    }
  },[]);

  useEffect(()=>{
    if(!active) return;
    // Tick only when NOT paused; pause = frozen elapsed counter
    if(active.pausedAt) return;
    const iv = setInterval(()=>{
      const totalPause = active.totalPause || 0;
      setElapsed(Math.floor((Date.now()-active.start-totalPause)/1000));
    },1000);
    return ()=>clearInterval(iv);
  },[active]);

  // When resumed from pause, recompute elapsed once immediately (don't wait 1s tick)
  useEffect(()=>{
    if(!active || active.pausedAt) return;
    const totalPause = active.totalPause || 0;
    setElapsed(Math.floor((Date.now()-active.start-totalPause)/1000));
  },[active]);

  function start(){
    const t={gameId:game.id, start:Date.now(), pausedAt:null, totalPause:0};
    timerWrite(t); setActive(t); setElapsed(0);
  }
  function pause(){
    if(!active || active.pausedAt) return;
    const t={...active, pausedAt: Date.now()};
    timerWrite(t); setActive(t);
  }
  function resume(){
    if(!active || !active.pausedAt) return;
    const thisPauseMs = Date.now() - active.pausedAt;
    const t={...active, pausedAt: null, totalPause: (active.totalPause||0) + thisPauseMs};
    timerWrite(t); setActive(t);
  }
  function stop(){
    if(!active) return;
    const endAt = Date.now();
    // If stopping while paused, don't count current pause duration as play
    const currentPauseMs = active.pausedAt ? (endAt - active.pausedAt) : 0;
    const totalPauseMs = (active.totalPause||0) + currentPauseMs;
    const activeMs = endAt - active.start - totalPauseMs;
    const hrs = Math.max(0, activeMs/3600000);
    timerWrite(null); setActive(null); setElapsed(0);
    // Only save if at least 1 minute of actual play (prevents noise from accidental start/stop)
    if(hrs * 60 < 1){ return; }
    onSave(hrs, {startedAt: active.start, endedAt: endAt, hours: hrs, totalPauseMs});
  }

  const isPaused = active && active.pausedAt;
  const h=Math.floor(elapsed/3600), m=Math.floor((elapsed%3600)/60), s=elapsed%60;
  const timerColor = isPaused ? G2.gld : G2.grn;
  const borderColor = !active ? 'rgba(0,212,255,.2)' : isPaused ? 'rgba(255,209,102,.3)' : 'rgba(57,255,110,.3)';
  const bgColor = !active ? 'rgba(0,212,255,.06)' : isPaused ? 'rgba(255,209,102,.07)' : 'rgba(57,255,110,.08)';

  return (
    <div style={{marginTop:8,padding:'10px 12px',background:bgColor,border:'1px solid '+borderColor,borderRadius:10}}>
      {active&&<div style={{fontFamily:"'Orbitron',monospace",fontSize:22,fontWeight:900,color:timerColor,textAlign:'center',marginBottom:6,letterSpacing:'.05em'}}>
        {String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}
        {isPaused && <div style={{fontSize:9,fontWeight:600,color:G2.gld,letterSpacing:'.15em',marginTop:2}}>⏸ {lang==='pl'?'PAUZA':'PAUSED'}</div>}
      </div>}
      {!active && (
        <button type='button' onClick={start} style={{width:'100%',padding:'8px 0',border:'none',borderRadius:8,background:G2.blu,color:'#000',fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:700,cursor:'pointer'}}>
          {lang==='pl'?'▶ Zacznij sesję':'▶ Start session'}
        </button>
      )}
      {active && !isPaused && (
        <div style={{display:'flex',gap:6}}>
          <button type='button' onClick={pause} style={{flex:1,padding:'8px 0',border:'none',borderRadius:8,background:G2.gld,color:'#000',fontFamily:"'Orbitron',monospace",fontSize:12,fontWeight:700,cursor:'pointer'}}>
            {lang==='pl'?'⏸ Pauza':'⏸ Pause'}
          </button>
          <button type='button' onClick={stop} style={{flex:1,padding:'8px 0',border:'none',borderRadius:8,background:G2.grn,color:'#000',fontFamily:"'Orbitron',monospace",fontSize:12,fontWeight:700,cursor:'pointer'}}>
            {lang==='pl'?'⏹ Zakończ':'⏹ Stop'}
          </button>
        </div>
      )}
      {active && isPaused && (
        <div style={{display:'flex',gap:6}}>
          <button type='button' onClick={resume} style={{flex:1,padding:'8px 0',border:'none',borderRadius:8,background:G2.grn,color:'#000',fontFamily:"'Orbitron',monospace",fontSize:12,fontWeight:700,cursor:'pointer'}}>
            {lang==='pl'?'▶ Wznów':'▶ Resume'}
          </button>
          <button type='button' onClick={stop} style={{flex:1,padding:'8px 0',border:'1px solid '+G2.bdr,borderRadius:8,background:'transparent',color:G2.txt,fontFamily:"'Orbitron',monospace",fontSize:12,fontWeight:700,cursor:'pointer'}}>
            {lang==='pl'?'⏹ Zakończ':'⏹ Stop'}
          </button>
        </div>
      )}
    </div>
  );
}

function Home({games,onOpen,onStatusChange,onAddFirst,onToggleNotify,lang,goals,onGoalsOpen,onRecOpen}){
  const [monthOpen,setMonthOpen]=useState(false);
  const SM=getSM(lang);
  const current=games.filter(g=>g.status==='gram');
  const backlog=games.filter(g=>g.status==='planuje'&&!g.releaseDate);
  const upcoming=games.filter(g=>g.releaseDate&&daysUntil(g.releaseDate)>=0).sort((a,b)=>new Date(a.releaseDate)-new Date(b.releaseDate));
  const bought=games.filter(g=>!!+g.priceBought);
  const sold=games.filter(g=>g.priceSold!=null&&!!+g.priceSold);
  const active=[...current].sort((a,b)=>(b.hours||0)-(a.hours||0))[0]||null;
  const prog=active&&active.targetHours>0?Math.min(100,Math.round((active.hours/active.targetHours)*100)):null;
  const remHrs=active&&active.targetHours>0?Math.max(0,active.targetHours-active.hours).toFixed(0):null;
  const nextUp=upcoming[0]||null;
  const days=nextUp?daysUntil(nextUp.releaseDate):null;
  const totalBase=bought.reduce((s,g)=>s+ +g.priceBought,0);
  const totalDLC=games.filter(g=>!!+g.extraSpend).reduce((s,g)=>s+ +(g.extraSpend||0),0);
  const totalSpent=totalBase+totalDLC;
  const totalEarned=sold.reduce((s,g)=>s+ +g.priceSold,0);
  const sellable=games.filter(g=>g.status==='porzucone'&&!!+g.priceBought&&(g.priceSold==null||!+g.priceSold)).sort((a,b)=>+b.priceBought - +a.priceBought);
  // Monthly purchases — games added in the current local month with a price.
  // Shown as expandable card on Home when purchases exist this month.
  const monthKey=(()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;})();
  const monthPurchasesList=games
    .filter(g=>g.addedAt&&g.addedAt.slice(0,7)===monthKey&&!!+g.priceBought)
    .sort((a,b)=>(b.addedAt||'').localeCompare(a.addedAt||''));
  const monthSpent=monthPurchasesList.reduce((s,g)=>s+ +g.priceBought + +(g.extraSpend||0),0);
  if(!games.length)return(<div className='scr'><div className='empty' style={{paddingTop:60}}><div className='eic'>🎮</div><div className='ett'>{t(lang,'obTitle')}</div><div className='ess'>{t(lang,'obSub')}</div><button className='empty-cta' onClick={onAddFirst}>{t(lang,'addGame')}</button></div></div>);
  const hour=new Date().getHours();
  const greet=hour<6?t(lang,'goodNight'):hour<12?t(lang,'goodMorning'):hour<18?t(lang,'goodAfternoon'):t(lang,'goodEvening');
  return(
    <div className='scr'>
      <div style={{marginBottom:16}}>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:700,color:G.blu,letterSpacing:'.06em',marginBottom:2}}>{greet}</div>
        <div style={{fontSize:11,color:G.dim}}>{games.length} {t(lang,'gamesInCollection')} · {current.length} {t(lang,'active')} · {upcoming.length} {t(lang,'upcomingReleases')}</div>
      </div>
      {/* v1.5.0 — Goals card. Always rendered (empty state is itself a CTA). */}
      <GoalsCard goals={goals||[]} games={games} sessions={collectSessions(games)} lang={lang} onOpen={onGoalsOpen}/>
      {current.length>0?(
        <div className='hcard'>
          <div className='hcard-hdr'><span className='hcard-title'>▶️ {t(lang,'continuePlay')}</span><span className='hcard-badge' style={{background:'rgba(0,212,255,.12)',color:G.blu}}>{current.length}</span></div>
          {current.map((g,idx)=>{
            const gProg=(g.targetHours&&g.hours)?Math.min(100,Math.round(g.hours/g.targetHours*100)):null;
            const gRem=g.targetHours?Math.max(0,g.targetHours-(g.hours||0)):0;
            return <div key={g.id} style={{marginTop:idx>0?14:0,paddingTop:idx>0?14:0,borderTop:idx>0?'1px solid '+G.bdr:'none'}}>
              <div className='cont-game' onClick={()=>onOpen(g)} style={{cursor:'pointer'}}>
                {g.cover?<div className='cont-cover' style={{backgroundImage:`url(${g.cover})`}}/>:<div className='cont-cover0'>{g.abbr||'??'}</div>}
                <div className='cont-body'>
                  <div className='cont-title'>{g.title}</div>
                  <div className='cont-meta'>{[g.genre,g.hours&&t(lang,'hoursPlayed',{h:fmtHours(g.hours)})].filter(Boolean).join(' · ')}</div>
                  {gProg!==null?(<><div className='prog-bar'><div className='prog-fill' style={{width:gProg+'%'}}/></div><div className='prog-label'><span>{t(lang,'progComplete',{n:gProg})}</span>{gProg<100&&<span>~{fmtHours(gRem)} {t(lang,'remaining')}</span>}</div></>):(g.hours>0&&<div style={{fontSize:11,color:G.dim}}>{t(lang,'addTargetHint')}</div>)}
                </div>
              </div>
              <SessionTimer game={g} lang={lang} onSave={(hrs,session)=>{
                const newHrs=Math.round(((+g.hours||0)+hrs)*10)/10;
                // Append session to history for time-tracking stats (F07)
                // Backward compat: existing games have sessions: undefined, coerce to []
                const newSession={
                  startedAt: session.startedAt,
                  endedAt: session.endedAt,
                  hours: Math.round(session.hours*10000)/10000,  // keep 4 decimals for accuracy
                  pauseMs: session.totalPauseMs || 0,  // pause duration in ms — for future "active vs idle" analytics
                };
                const newSessions=[...(g.sessions||[]),newSession];
                onStatusChange(g.id,'gram',{hours:newHrs,lastPlayed:new Date().toISOString(),sessions:newSessions});
              }}/>
            </div>;
          })}
        </div>
      ):(
        <div className='hcard'>
          <div className='hcard-hdr'><span className='hcard-title'>▶️ {t(lang,'continuePlay')}</span></div>
          <div style={{textAlign:'center',padding:'16px 0',color:G.dim,fontSize:12}}>{t(lang,'noActiveGame')}<br/><span style={{color:G.pur}}>{t(lang,'changeStatusHint')}</span></div>
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
            {days>0?<><button type='button' className='cnt-btn' onClick={()=>onOpen(nextUp)}>{t(lang,'details')}</button><button type='button' className={'cnt-btn '+(nextUp.notifyEnabled?'cnt-btn-success':'cnt-btn-primary')} onClick={()=>onToggleNotify&&onToggleNotify(nextUp.id)}>{nextUp.notifyEnabled?'✓ '+t(lang,'remind'):t(lang,'remind')}</button></>
                   :<><button type='button' className='cnt-btn cnt-btn-success' onClick={()=>onStatusChange(nextUp.id,'gram')}>{t(lang,'startPlaying')}</button><button type='button' className='cnt-btn cnt-btn-primary' onClick={()=>onOpen(nextUp)}>{t(lang,'addToCollection')}</button></>}
          </div>
        </div>
      )}
      {bought.length>0&&(
        <div className='hcard'>
          <div className='hcard-hdr'><span className='hcard-title'>💰 {t(lang,'financeInsight')}</span></div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12}}><span style={{color:G.dim}}>{lang==='pl'?'Gry (cena bazowa)':'Games (base price)'}</span><span style={{fontFamily:"'Orbitron',monospace",fontWeight:700,color:G.red}}>{pln(totalBase,lang)}</span></div>
            {totalDLC>0&&<div style={{display:'flex',justifyContent:'space-between',fontSize:12}}><span style={{color:G.dim}}>{lang==='pl'?'DLC / Mikrotransakcje':'DLC / Microtransactions'}</span><span style={{fontFamily:"'Orbitron',monospace",fontWeight:700,color:'#FF6B9D'}}>{pln(totalDLC,lang)}</span></div>}
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12}}><span style={{color:G.dim}}>{t(lang,'recovered')}</span><span style={{fontFamily:"'Orbitron',monospace",fontWeight:700,color:G.grn}}>{pln(totalEarned,lang)}</span></div>
            <div style={{height:1,background:G.bdr,margin:'2px 0'}}/>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}><span style={{fontWeight:600}}>{t(lang,'realCost')}</span><span style={{fontFamily:"'Orbitron',monospace",fontWeight:900,color:G.org}}>{pln(totalSpent-totalEarned,lang)}</span></div>
            {sellable.length>0&&<div style={{marginTop:6,padding:'10px 12px',background:'rgba(57,255,110,.07)',border:'1px solid rgba(57,255,110,.2)',borderRadius:10,fontSize:11,color:G.txt,lineHeight:1.5}}>{t(lang,'sellSuggestion',{title:sellable[0].title,amount:pln(+sellable[0].priceBought*0.6,lang)})}{sellable.length>1&&` (+${sellable.length-1})`}</div>}
          </div>
        </div>
      )}
      {monthPurchasesList.length>0 && (
        <div className='hcard' style={{cursor:'pointer'}} onClick={()=>setMonthOpen(o=>!o)}>
          <div className='hcard-hdr'>
            <span className='hcard-title'>{t(lang,'monthPurchases')}</span>
            <span className='hcard-badge' style={{background:'rgba(167,139,250,.12)',color:G.pur}}>
              {monthPurchasesList.length} {gamesWord(monthPurchasesList.length,lang)} · {pln(monthSpent,lang)}
            </span>
          </div>
          {monthOpen && (
            <div style={{marginTop:10,display:'flex',flexDirection:'column',gap:6}}>
              {monthPurchasesList.slice(0,8).map(g=>(
                <div key={g.id} onClick={e=>{e.stopPropagation();onOpen(g);}}
                  style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',background:G.card2,borderRadius:8,cursor:'pointer'}}>
                  {g.cover
                    ? <div style={{width:32,height:32,borderRadius:6,backgroundImage:`url(${g.cover})`,backgroundSize:'cover',backgroundPosition:'center',flexShrink:0}}/>
                    : <div style={{width:32,height:32,borderRadius:6,background:G.card,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontFamily:"'Orbitron',monospace",fontWeight:900,color:G.pur,flexShrink:0}}>{g.abbr||'??'}</div>}
                  <div style={{flex:1,overflow:'hidden'}}>
                    <div style={{fontSize:12,fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{g.title}</div>
                    {g.storeBought && <div style={{fontSize:10,color:G.dim}}>{g.storeBought}</div>}
                  </div>
                  <div style={{fontSize:11,fontFamily:"'Orbitron',monospace",fontWeight:700,color:G.org,flexShrink:0}}>
                    {pln(+g.priceBought + +(g.extraSpend||0),lang)}
                  </div>
                </div>
              ))}
              {monthPurchasesList.length>8 && (
                <div style={{fontSize:10,color:G.dim,textAlign:'center',marginTop:4}}>
                  +{monthPurchasesList.length-8} {gamesWord(monthPurchasesList.length-8,lang)}
                </div>
              )}
            </div>
          )}
          {!monthOpen && (
            <div style={{fontSize:11,color:G.dim,marginTop:6}}>
              {lang==='pl'?'Stuknij żeby zobaczyć szczegóły':'Tap to see details'}
            </div>
          )}
        </div>
      )}
      {/* v1.9.0 — Recommendations CTA. Always renders; the overlay handles its own
          empty/loading states. Tap → opens Recommendations overlay (if rawg-id seeds
          exist, fetches and shows; otherwise empty CTA pointing at RAWG search). */}
      <div className='rec-home-card' onClick={onRecOpen}>
        <div className='rec-home-ico'>✨</div>
        <div className='rec-home-body'>
          <div className='rec-home-title'>{t(lang,'recHomeCardTitle')}</div>
          <div className='rec-home-sub'>{t(lang,'recHomeCardSub')}</div>
        </div>
        <span className='rec-home-arrow'>›</span>
      </div>
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
              <div className='upc-acts'>{d===0?(<><button type='button' className='upc-btn upc-btn-play' onClick={()=>onStatusChange(g.id,'gram')}>{t(lang,'startPlaying')}</button><button type='button' className='upc-btn upc-btn-add' onClick={()=>onOpen(g)}>{t(lang,'addToColl')}</button></>):(<><button type='button' className='upc-btn upc-btn-plan' onClick={()=>onOpen(g)}>{t(lang,'edit')}</button><button type='button' className={'upc-btn upc-btn-watch'+(g.notifyEnabled?' on':'')} onClick={async()=>{if(!g.notifyEnabled&&notifPerm!=='granted')await onRequestNotif();onToggleNotify(g.id);}}>{g.notifyEnabled?'✓ '+t(lang,'watch'):t(lang,'watch')}</button><button type='button' className='upc-btn' style={{borderColor:'rgba(0,212,255,.3)',color:G.blu,background:'rgba(0,212,255,.07)'}} onClick={()=>window.open(`https://store.playstation.com/search/${encodeURIComponent(g.title)}`,'_blank','noopener,noreferrer')}>{t(lang,'buy')}</button></>)}</div>
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
  const isEn = lang==='en';
  const flowData={
    avoid:{title:t(lang,"flowAvoidTitle"),steps:[
      {ico:"⏰",tip:isEn?"Buy 3-6 months after release — price drops 30-50%.":"Kupuj 3-6 miesięcy po premierze — cena spada o 30-50%."},
      {ico:"🏷",tip:isEn?"Track sales on PSN and stores. Set price alerts.":"Śledź promocje PSN, CDP i Allegro. Ustaw alerty cenowe."},
      {ico:"📦",tip:isEn?"Buy physical — you can resell. Digital is permanent.":"Kupuj pudełkowe — możesz odsprzedać. Cyfrowe są definitywne."},
      {ico:"⭐",tip:isEn?"Check reviews before buying. Games below 7/10 rarely worth full price.":"Sprawdź oceny przed zakupem. Gry poniżej 7/10 rzadko warte pełnej ceny."},
    ]},
    invest:{title:t(lang,"flowInvestTitle"),steps:[
      {ico:"🎮",tip:isEn?"Long RPGs and open worlds give the best cost/hour ratio.":"Długie RPG i otwarte światy dają najlepszy koszt/godzinę."},
      {ico:"💎",tip:isEn?"Sony exclusives hold resale value well.":"Gry Sony utrzymują wartość przy odsprzedaży."},
      {ico:"🛒",tip:isEn?"GOTY editions often include all DLC at a lower price.":"Edycje GOTY — wszystkie DLC w niższej cenie."},
      {ico:"👥",tip:isEn?"Multiplayer with active community has long lifespan.":"Multiplayer z aktywną społecznością ma długą żywotność."},
    ]},
    optim:{title:t(lang,"flowOptimTitle"),steps:[
      {ico:"📋",tip:isEn?"Remove games waiting over 1 year — chance of playing is low.":"Usuń gry czekające ponad rok — szansa że zagrasz jest mała."},
      {ico:"⏱",tip:isEn?"Prioritize short games (10-20h) for quick satisfaction.":"Priorytetyzuj krótkie gry (10-20h) dla szybkiej satysfakcji."},
      {ico:"💰",tip:isEn?"Sell abandoned games before they lose value.":"Sprzedaj porzucone zanim stracą wartość — im szybciej tym lepiej."},
      {ico:"🎯",tip:isEn?"Play your favourite genre — you finish faster.":"Graj w swój ulubiony gatunek — szybciej ukończysz."},
    ]},
    similar:{title:t(lang,"flowSimilarTitle"),steps:[
      {ico:"🔍",tip:isEn?"RAWG.io has a Similar games section for every title.":"RAWG.io ma sekcję Similar games dla każdego tytułu."},
      {ico:"📊",tip:isEn?"Filter your backlog by genre — you already have games you like.":"Filtruj backlog po gatunku — masz już gry które lubisz."},
      {ico:"⭐",tip:isEn?"PS Plus Extra offers games similar to your favourites.":"PS Plus Extra oferuje gry podobne do Twoich ulubionych."},
      {ico:"💬",tip:isEn?"r/PS5 and r/patientgamers recommend games by preference.":"r/PS5 i r/patientgamers polecają gry wg preferencji."},
    ]},
    save:{title:t(lang,"flowSaveTitle"),steps:[
      {ico:"📅",tip:isEn?"Max 1-2 full-price games per month. Rest on sale.":"Max 1-2 gry miesięcznie po pełnej cenie. Resztę w promocjach."},
      {ico:"🔄",tip:isEn?"Resell immediately after finishing — less value lost.":"Odsprzedaj zaraz po ukończeniu — tracisz mniej wartości."},
      {ico:"📦",tip:isEn?"1 new + 2 used = same gaming for less money.":"1 nowa + 2 używane = tyle samo grania za mniej pieniędzy."},
      {ico:"🎮",tip:isEn?"PS Plus Extra gives access to hundreds of games for a fraction.":"PS Plus Extra daje dostęp do setek gier za ułamek ceny."},
    ]},
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

// F07 — Time tracking helpers
// Collect all sessions from all games into flat array, normalized
// v1.2.0 — Import modal with dual-mode selection
function ImportModal({onClose,onPickFile,mode,onPickMode,games,lang,pendingFile,onConfirmReplace}){
  // Three phases: mode selection -> file picker -> confirm (replace only)
  const [confirming,setConfirming]=useState(false);
  useEffect(()=>{
    if(pendingFile && mode==='replace' && !confirming) setConfirming(true);
  },[pendingFile,mode,confirming]);
  return (
    <div className='mbg' onClick={onClose}>
      <div className='mwr' onClick={e=>e.stopPropagation()} style={{maxWidth:440}}>
        <div className='mhd'>
          <span className='mtt'>📥 {t(lang,'importTitle')}</span>
          <button type='button' className='mcb' onClick={onClose}>×</button>
        </div>
        <div className='mbd'>
          {!mode && <>
            <div style={{fontSize:12,color:G.dim,marginBottom:14,lineHeight:1.5}}>{t(lang,'importModeQ')}</div>
            <button type='button' onClick={()=>onPickMode('merge')} style={{width:'100%',padding:'14px 14px',marginBottom:10,textAlign:'left',background:'rgba(0,212,255,.06)',border:`1px solid ${G.bdr}`,borderRadius:12,cursor:'pointer',color:G.txt}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,marginBottom:6,color:G.blu}}>{t(lang,'importMerge')}</div>
              <div style={{fontSize:11,color:G.dim,lineHeight:1.45}}>{t(lang,'importMergeDesc')}</div>
            </button>
            <button type='button' onClick={()=>onPickMode('replace')} style={{width:'100%',padding:'14px 14px',textAlign:'left',background:'rgba(255,77,109,.06)',border:'1px solid rgba(255,77,109,.25)',borderRadius:12,cursor:'pointer',color:G.txt}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,marginBottom:6,color:G.red}}>{t(lang,'importReplace')}</div>
              <div style={{fontSize:11,color:G.dim,lineHeight:1.45}}>{t(lang,'importReplaceDesc')}</div>
            </button>
          </>}
          {mode && !pendingFile && <>
            <div style={{padding:'14px',background:'rgba(0,212,255,.06)',border:`1px solid ${G.bdr}`,borderRadius:12,marginBottom:12,fontSize:12,color:G.dim,textAlign:'center'}}>
              {mode==='merge'?t(lang,'importMerge'):t(lang,'importReplace')}
            </div>
            <label style={{display:'block',width:'100%',padding:'14px',background:G.blu,color:'#000',borderRadius:10,textAlign:'center',cursor:'pointer',fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700}}>
              {lang==='pl'?'📁 Wybierz plik JSON':'📁 Choose JSON file'}
              <input type='file' accept='.json' style={{display:'none'}} onChange={e=>{if(e.target.files[0])onPickFile(e.target.files[0]);}}/>
            </label>
          </>}
          {mode==='replace' && pendingFile && confirming && <>
            <div style={{padding:'14px',background:'rgba(255,77,109,.08)',border:'1px solid rgba(255,77,109,.3)',borderRadius:12,marginBottom:12,fontSize:12,color:G.txt,lineHeight:1.5}}>
              ⚠️ {t(lang,'importReplaceConfirm',{n:games.length})}
            </div>
            <div style={{display:'flex',gap:8}}>
              <button type='button' onClick={onClose} style={{flex:1,padding:'12px',background:'transparent',border:`1px solid ${G.bdr}`,borderRadius:10,color:G.txt,fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:600,cursor:'pointer'}}>
                {t(lang,'cancel2')}
              </button>
              <button type='button' onClick={onConfirmReplace} style={{flex:1,padding:'12px',background:G.red,border:'none',borderRadius:10,color:'#fff',fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,cursor:'pointer'}}>
                {t(lang,'importReplace')}
              </button>
            </div>
          </>}
        </div>
      </div>
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
  const kpis=[{l:t(lang,'gamesTotal'),v:games.length,c:G.blu},{l:t(lang,'completed2'),v:games.filter(g=>g.status==='ukonczone').length,c:G.grn},{l:t(lang,'hoursTotal'),v:fmtHours(hrs),c:G.pur},{l:t(lang,'avgRating'),v:avg,c:G.gld}];
  const sData=Object.entries(SM2).map(([k,m])=>({n:m.label,v:games.filter(g=>g.status===k).length,c:m.c})).filter(d=>d.v>0);
  const gMap={}; games.forEach(g=>{if(g.genre)gMap[g.genre]=(gMap[g.genre]||0)+1;});
  const gData=Object.entries(gMap).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([n,v])=>({n,v}));
  const buckets=[1,2,3,4,5,6,7,8,9,10].map(r=>({n:String(r),v:games.filter(g=>g.rating!=null&&Math.round(g.rating)===r).length,min:0.01}));
  const bought=games.filter(g=>!!+g.priceBought);
  const sold=games.filter(g=>g.priceSold!=null&&!!+g.priceSold);
  const totalBase=bought.reduce((s,g)=>s+ +g.priceBought,0);
  const totalDLC=games.filter(g=>!!+g.extraSpend).reduce((s,g)=>s+ +(g.extraSpend||0),0);
  const totalSpent=totalBase+totalDLC;
  const totalEarned=sold.reduce((s,g)=>s+ +g.priceSold,0);
  const netCost=totalSpent-totalEarned;
  const withHrs=bought.filter(g=>g.hours>0);
  const cph=withHrs.length?(withHrs.reduce((s,g)=>s+ +g.priceBought + +(g.extraSpend||0),0)/withHrs.reduce((s,g)=>s+g.hours,0)):null;
  const storeMap={}; bought.forEach(g=>{const s=g.storeBought||'Other';storeMap[s]=(storeMap[s]||0)+ +g.priceBought;});
  const storeData=Object.entries(storeMap).sort((a,b)=>b[1]-a[1]).map(([n,v])=>({n,v:+v.toFixed(0)}));
  const gcMap={}; bought.forEach(g=>{if(g.genre)gcMap[g.genre]=(gcMap[g.genre]||0)+ +g.priceBought;});
  const gcData=Object.entries(gcMap).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([n,v])=>({n,v:+v.toFixed(0)}));
  const soldG=sold.map(g=>({...g,roi:+g.priceSold - +g.priceBought})).sort((a,b)=>b.roi-a.roi);
  const fkpis=[
    {l:t(lang,'spent'),        v:pln(totalBase,lang),   c:G.red, bg:'rgba(255,77,109,.07)'},
    {l:t(lang,'spentDLC'),     v:pln(totalDLC,lang),    c:'#FF6B9D', bg:'rgba(255,107,157,.07)'},
    {l:t(lang,'spentTotal2'),  v:pln(totalSpent,lang),  c:G.org, bg:'rgba(255,159,28,.07)'},
    {l:t(lang,'earnedBack'),   v:pln(totalEarned,lang), c:G.grn, bg:'rgba(57,255,110,.07)'},
    {l:t(lang,'realCostShort'),v:pln(netCost,lang),     c:netCost>0?G.org:G.grn, bg:'rgba(255,159,28,.05)'},
    {l:t(lang,'costPerHour'),  v:cph?fmtCph(cph):'—', c:G.blu, bg:'rgba(0,212,255,.07)'},
  ];
  const insights=[];
  if(bought.length){
    const worst=soldG.filter(g=>g.roi<0).slice(-1)[0];
    const best=soldG.filter(g=>g.roi>0)[0];
    const wCph=[...withHrs].sort((a,b)=>(+b.priceBought/b.hours)-(+a.priceBought/a.hours))[0];
    const bCph=[...withHrs].sort((a,b)=>(+a.priceBought/a.hours)-(+b.priceBought/b.hours))[0];
    if(worst)insights.push({ico:'📉',color:G.red,bg:'rgba(255,77,109,.07)',title:t(lang,'biggestLoss'),body:t(lang,'biggestLossDesc',{title:worst.title,amount:pln(Math.abs(worst.roi),lang)}),val:'-'+pln(Math.abs(worst.roi),lang)});
    if(best)insights.push({ico:'📈',color:G.grn,bg:'rgba(57,255,110,.07)',title:t(lang,'bestInvestment'),body:t(lang,'bestInvestDesc',{title:best.title,amount:pln(best.roi,lang)}),val:'+'+pln(best.roi,lang)});
    if(wCph&&wCph.hours>0)insights.push({ico:'⚠️',color:G.org,bg:'rgba(255,159,28,.07)',title:t(lang,'mostExpensiveHours'),body:t(lang,'expHoursDesc',{title:wCph.title,cph:(+wCph.priceBought/wCph.hours).toFixed(1)}),val:fmtCph(+wCph.priceBought/wCph.hours)});
    if(bCph&&bCph.hours>0)insights.push({ico:'💎',color:G.blu,bg:'rgba(0,212,255,.07)',title:t(lang,'bestValueShort'),body:t(lang,'bestValDesc',{title:bCph.title,cph:(+bCph.priceBought/bCph.hours).toFixed(1)}),val:fmtCph(+bCph.priceBought/bCph.hours)});
    if(totalSpent>0)insights.push({ico:'💰',color:G.pur,bg:'rgba(167,139,250,.07)',title:t(lang,'financeSummary'),body:t(lang,'finSummaryDesc',{spent:pln(totalSpent,lang),earned:pln(totalEarned,lang),net:pln(netCost,lang)}),val:pln(netCost,lang)});
  }
  const subTabs=[[' general',t(lang,'general')],[' time',t(lang,'time')]];
  return(
    <div className='scr'>
      <div style={{display:'flex',gap:3,background:G.card,border:`1px solid ${G.bdr}`,borderRadius:11,padding:4,marginBottom:14}}>
        {subTabs.map(([k,l])=><button key={k} type='button' onClick={()=>setTab(k.trim())} style={{flex:1,minHeight:40,padding:'7px 2px',border:'none',borderRadius:8,background:tab===k.trim()?'rgba(0,212,255,.15)':'transparent',color:tab===k.trim()?G.blu:G.dim,fontFamily:"'Syne',sans-serif",fontSize:10,fontWeight:600,cursor:'pointer'}}>{l}</button>)}
      </div>
      {tab==='general'&&<>
        <div className='kgd'>{kpis.map(k=><div key={k.l} className='kcd' style={{'--c':k.c}}><div className='kvl'>{k.v}</div><div className='klb'>{k.l}</div></div>)}</div>
        <div className='ccd'><div className='ctl'>{t(lang,'statusChart')}</div><ResponsiveContainer width='100%' height={130}><BarChart data={sData} barSize={28} margin={{top:4,left:0,right:0,bottom:4}}><XAxis dataKey='n' tick={{fill:G.dim,fontSize:9}} axisLine={false} tickLine={false} interval={0} padding={{left:24,right:24}}/><YAxis hide/><Tooltip content={<CTip/>}/><Bar dataKey='v' radius={[4,4,0,0]}>{sData.map((d,i)=><Cell key={i} fill={d.c} fillOpacity={0.85}/>)}</Bar></BarChart></ResponsiveContainer></div>
        {gData.length>0&&<div className='ccd'><div className='ctl'>{t(lang,'genreChart')}</div><ResponsiveContainer width='100%' height={130}><BarChart data={gData} barSize={22} margin={{top:4,left:0,right:0,bottom:4}}><XAxis dataKey='n' tick={{fill:G.dim,fontSize:9}} axisLine={false} tickLine={false} interval={0} padding={{left:22,right:22}}/><YAxis hide/><Tooltip content={<CTip/>}/><Bar dataKey='v' radius={[4,4,0,0]} fill={G.pur} fillOpacity={0.8}/></BarChart></ResponsiveContainer></div>}
        {rated.length>0&&<div className='ccd'><div className='ctl'>{t(lang,'ratingChart')}</div><ResponsiveContainer width='100%' height={140}><BarChart data={buckets} barSize={20} margin={{top:4,left:0,right:0,bottom:4}}><CartesianGrid vertical={false} stroke={G.bdr} strokeDasharray='3 3'/><XAxis dataKey='n' tick={{fill:G.dim,fontSize:10}} axisLine={false} tickLine={false} padding={{left:20,right:20}}/><YAxis hide/><Tooltip content={<CTip/>}/><Bar dataKey='v' radius={[4,4,0,0]} minPointSize={3}>{buckets.map((b,i)=><Cell key={i} fill={`hsl(${i*12},88%,55%)`} fillOpacity={b.v===0?0.2:0.85}/>)}</Bar></BarChart></ResponsiveContainer></div>}
      </>}
      {tab==='time'&&(()=>{
        const sessions=collectSessions(games);
        if(!sessions.length){
          return <div className='empty'><div className='eic'>⏱</div><div className='ett'>{t(lang,'noSessions')}</div><div className='ess'>{t(lang,'noSessionsHint')}</div></div>;
        }
        // Group sessions by day
        const byDay=new Map();
        sessions.forEach(s=>{
          const arr=byDay.get(s.dateKey)||[];
          arr.push(s); byDay.set(s.dateKey,arr);
        });
        const todayKey=dayKey(new Date());
        const todaySessions=byDay.get(todayKey)||[];
        const todayHours=todaySessions.reduce((a,s)=>a+s.hours,0);
        // This week (Mon-Sun)
        const wkStart=weekStart(new Date());
        const wkDays=[0,1,2,3,4,5,6].map(i=>{
          const d=new Date(wkStart); d.setDate(d.getDate()+i);
          const k=dayKey(d);
          const hrs=(byDay.get(k)||[]).reduce((a,s)=>a+s.hours,0);
          return {date:d, key:k, hours:hrs};
        });
        const weekHours=wkDays.reduce((a,d)=>a+d.hours,0);
        // Previous week for comparison
        const prevWkStart=new Date(wkStart); prevWkStart.setDate(prevWkStart.getDate()-7);
        let prevWkHours=0;
        for(let i=0;i<7;i++){
          const d=new Date(prevWkStart); d.setDate(d.getDate()+i);
          prevWkHours+=(byDay.get(dayKey(d))||[]).reduce((a,s)=>a+s.hours,0);
        }
        const weekDelta=weekHours-prevWkHours;
        // This month — build calendar heatmap
        const now=new Date();
        const mStart=new Date(now.getFullYear(),now.getMonth(),1);
        const mEnd=new Date(now.getFullYear(),now.getMonth()+1,0);
        const daysInMonth=mEnd.getDate();
        const monthDays=[];
        let monthHours=0;
        for(let i=1;i<=daysInMonth;i++){
          const d=new Date(now.getFullYear(),now.getMonth(),i);
          const k=dayKey(d);
          const hrs=(byDay.get(k)||[]).reduce((a,s)=>a+s.hours,0);
          monthDays.push({day:i,key:k,hours:hrs,isFuture:d>new Date()});
          monthHours+=hrs;
        }
        // Prev month for comparison
        const prevMStart=new Date(now.getFullYear(),now.getMonth()-1,1);
        const prevMEnd=new Date(now.getFullYear(),now.getMonth(),0);
        let prevMHours=0;
        for(let d=new Date(prevMStart); d<=prevMEnd; d.setDate(d.getDate()+1)){
          prevMHours+=(byDay.get(dayKey(d))||[]).reduce((a,s)=>a+s.hours,0);
        }
        const monthDelta=monthHours-prevMHours;
        // Streaks
        const currentStreak=computeStreak(byDay);
        const longestStreak=computeLongestStreak(byDay);
        // Session stats
        const avgSessionHours=sessions.reduce((a,s)=>a+s.hours,0)/sessions.length;
        const longestSessionHours=sessions.reduce((m,s)=>Math.max(m,s.hours),0);
        // v1.3 #5 — Active gaming days this month vs last month
        const activeDaysThisMonth=monthDays.filter(d=>d.hours>0&&!d.isFuture).length;
        const daysElapsedThisMonth=monthDays.filter(d=>!d.isFuture).length;
        let activeDaysPrevMonth=0;
        for(let d=new Date(prevMStart); d<=prevMEnd; d.setDate(d.getDate()+1)){
          const k=dayKey(d);
          if((byDay.get(k)||[]).length>0)activeDaysPrevMonth++;
        }
        // Top games by total session hours (this month scope)
        const monthSessions=sessions.filter(s=>{
          const d=new Date(s.startedAt);
          return d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth();
        });
        const perGame={};
        monthSessions.forEach(s=>{
          perGame[s.gameId]=perGame[s.gameId]||{title:s.gameTitle,abbr:s.gameAbbr,cover:s.gameCover,hours:0,count:0};
          perGame[s.gameId].hours+=s.hours;
          perGame[s.gameId].count++;
        });
        const topGames=Object.values(perGame).sort((a,b)=>b.hours-a.hours).slice(0,5);
        // Max hours in any day this month (for heatmap scaling)
        const maxDayHours=Math.max(1,...monthDays.map(d=>d.hours));
        // Max hours in week bar chart
        const maxWkHours=Math.max(0.5,...wkDays.map(d=>d.hours));
        const dayLabels=[t(lang,'dayMon'),t(lang,'dayTue'),t(lang,'dayWed'),t(lang,'dayThu'),t(lang,'dayFri'),t(lang,'daySat'),t(lang,'daySun')];
        const deltaLine=(delta,label)=>{
          if(Math.abs(delta)<0.05)return <span style={{color:G.dim}}>{t(lang,label)}: —</span>;
          const positive=delta>0;
          return <span style={{color:positive?G.grn:G.red,fontWeight:700}}>{positive?'↑':'↓'} {fmtHours(Math.abs(delta),{compact:true})} {t(lang,label)}</span>;
        };
        return <>
          {/* KPI Grid */}
          <div className='kgd'>
            <div className='kcd' style={{'--c':G.grn}}><div className='kvl' style={{fontSize:currentStreak>=10?24:28}}>🔥 {currentStreak}</div><div className='klb'>{t(lang,'currentStreak')} ({t(lang,'daysStreak')})</div></div>
            <div className='kcd' style={{'--c':G.gld}}><div className='kvl'>{longestStreak}</div><div className='klb'>{t(lang,'longestStreak')} ({t(lang,'daysStreak')})</div></div>
            <div className='kcd' style={{'--c':G.blu}}><div className='kvl' style={{fontSize:18}}>{fmtHours(avgSessionHours,{compact:true})}</div><div className='klb'>{t(lang,'avgSession')}</div></div>
            <div className='kcd' style={{'--c':G.pur}}><div className='kvl' style={{fontSize:18}}>{fmtHours(longestSessionHours,{compact:true})}</div><div className='klb'>{t(lang,'longestSession')}</div></div>
          </div>
          <div className='ccd' style={{borderColor:'rgba(167,139,250,.3)',background:'linear-gradient(135deg,rgba(167,139,250,.06),rgba(0,212,255,.04))'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:6}}>
              <div style={{fontSize:11,fontWeight:700,color:G.pur,letterSpacing:'.05em'}}>{t(lang,'activeDays')}</div>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:24,fontWeight:900,color:G.pur,lineHeight:1}}>
                {activeDaysThisMonth}<span style={{fontSize:14,color:G.dim,fontWeight:500}}>/{daysElapsedThisMonth}</span>
              </div>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:11,color:G.dim}}>
              <span>{t(lang,'activeDaysDesc',{played:activeDaysThisMonth,total:daysElapsedThisMonth})}</span>
              {activeDaysPrevMonth>0&&<span>{t(lang,'activeDaysVs',{n:activeDaysPrevMonth})}</span>}
            </div>
          </div>

          {/* Today */}
          <div className='ccd'>
            <div className='ctl'>{t(lang,'today2')}</div>
            {todaySessions.length===0 ? (
              <div style={{padding:'16px 0',textAlign:'center',color:G.dim,fontSize:12}}>{t(lang,'noSessionsToday')}</div>
            ) : (
              <div>
                <div style={{display:'flex',alignItems:'baseline',gap:10,marginBottom:8}}>
                  <span style={{fontFamily:"'Orbitron',monospace",fontSize:28,fontWeight:900,color:G.grn}}>{fmtHours(todayHours)}</span>
                  <span style={{fontSize:11,color:G.dim}}>{t(lang,'sessionsCount',{n:todaySessions.length, sw:sessionsWord(todaySessions.length,lang)})}</span>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:4,marginTop:6,paddingTop:8,borderTop:'1px solid '+G.bdr}}>
                  {todaySessions.slice(0,4).map((s,i)=>(
                    <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:11}}>
                      <span style={{color:G.txt,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginRight:8}}>{s.gameTitle}</span>
                      <span style={{color:G.dim,flexShrink:0,fontFamily:"'Orbitron',monospace"}}>{fmtHours(s.hours,{compact:true})}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* This Week — 7 day bar chart */}
          <div className='ccd'>
            <div className='ctl'>{t(lang,'thisWeek')}</div>
            <div style={{display:'flex',alignItems:'baseline',gap:10,marginBottom:12}}>
              <span style={{fontFamily:"'Orbitron',monospace",fontSize:24,fontWeight:900,color:G.pur}}>{fmtHours(weekHours)}</span>
              {prevWkHours>0 && deltaLine(weekDelta,'vsLastWeek')}
            </div>
            <div style={{display:'flex',gap:4,height:80,alignItems:'flex-end'}}>
              {wkDays.map((d,i)=>{
                const heightPct=d.hours/maxWkHours*100;
                const isToday=d.key===todayKey;
                return (
                  <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                    <div style={{flex:1,width:'100%',display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
                      <div style={{width:'100%',height:heightPct+'%',minHeight:d.hours>0?4:0,background:d.hours>0?(isToday?G.grn:G.pur):'transparent',borderRadius:'4px 4px 0 0',opacity:d.hours>0?(isToday?1:0.7):0.2,transition:'height .3s'}}/>
                    </div>
                    <div style={{fontSize:9,color:isToday?G.grn:G.dim,fontWeight:isToday?700:500}}>{dayLabels[i]}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* This Month — calendar heatmap */}
          <div className='ccd'>
            <div className='ctl'>{t(lang,'thisMonth')}</div>
            <div style={{display:'flex',alignItems:'baseline',gap:10,marginBottom:12}}>
              <span style={{fontFamily:"'Orbitron',monospace",fontSize:24,fontWeight:900,color:G.blu}}>{fmtHours(monthHours)}</span>
              {prevMHours>0 && deltaLine(monthDelta,'vsLastMonth')}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3}}>
              {monthDays.map((d,i)=>{
                const intensity=d.hours/maxDayHours;
                const isToday=d.key===todayKey;
                let bg,color=G.dim;
                if(d.isFuture){ bg='transparent'; color='rgba(90,106,138,.3)'; }
                else if(d.hours===0){ bg=G.card2; }
                else {
                  // Green gradient: light to bright based on intensity
                  const op=0.2+intensity*0.8;
                  bg=`rgba(57,255,110,${op})`;
                  color=intensity>0.5?'#000':G.txt;
                }
                return (
                  <div key={i} title={d.hours>0?fmtHours(d.hours):''} style={{
                    aspectRatio:'1',
                    background:bg,
                    border:'1px solid '+(isToday?G.grn:d.isFuture?'transparent':G.bdr),
                    borderRadius:4,
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    fontSize:10,
                    fontWeight:isToday?700:500,
                    color,
                    fontFamily:"'Orbitron',monospace",
                  }}>{d.day}</div>
                );
              })}
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',alignItems:'center',gap:4,marginTop:8,fontSize:9,color:G.dim}}>
              <span>{lang==='pl'?'Mniej':'Less'}</span>
              {[0.2,0.4,0.6,0.8,1.0].map(op=>(
                <div key={op} style={{width:10,height:10,background:`rgba(57,255,110,${op})`,borderRadius:2}}/>
              ))}
              <span>{lang==='pl'?'Więcej':'More'}</span>
            </div>
          </div>

          {/* Top played games this month */}
          {topGames.length>0 && (
            <div className='ccd'>
              <div className='ctl'>{t(lang,'topGames')}</div>
              <ul className='top-list'>
                {topGames.map((g,i)=>(
                  <li key={i} className='top-item'>
                    <span className='top-title'>{g.title}</span>
                    <span style={{fontSize:10,color:G.dim,flexShrink:0}}>{g.count}×</span>
                    <span className='top-val' style={{color:G.grn}}>{fmtHours(g.hours,{compact:true})}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>;
      })()}
      {/* Finance (tab==='finance') and Insights (tab==='insights') moved to Finance top-level component in v1.2.0 */}
    </div>
  );
}

// v1.2.0 — Finance as standalone main-tab component
// Combines former Stats→Finance and Stats→Analysis subtabs
function Finance({games,lang}){
  const [tab,setTab]=useState('overview');
  if(!games.length)return<div className='scr'><div className='empty'><div className='eic'>💰</div><div className='ett'>{t(lang,'noGames')}</div></div></div>;

  // === Computed values (copied from Stats) ===
  const bought=games.filter(g=>!!+g.priceBought);
  const sold=games.filter(g=>g.priceSold!=null&&!!+g.priceSold);
  const totalBase=bought.reduce((s,g)=>s+ +g.priceBought,0);
  const totalDLC=games.filter(g=>!!+g.extraSpend).reduce((s,g)=>s+ +(g.extraSpend||0),0);
  const totalSpent=totalBase+totalDLC;
  const totalEarned=sold.reduce((s,g)=>s+ +g.priceSold,0);
  const netCost=totalSpent-totalEarned;
  const withHrs=bought.filter(g=>g.hours>0);
  const cph=withHrs.length?(withHrs.reduce((s,g)=>s+ +g.priceBought + +(g.extraSpend||0),0)/withHrs.reduce((s,g)=>s+g.hours,0)):null;
  const storeMap={}; bought.forEach(g=>{const s=g.storeBought||'Other';storeMap[s]=(storeMap[s]||0)+ +g.priceBought;});
  const storeData=Object.entries(storeMap).sort((a,b)=>b[1]-a[1]).map(([n,v])=>({n,v:+v.toFixed(0)}));
  const gcMap={}; bought.forEach(g=>{if(g.genre)gcMap[g.genre]=(gcMap[g.genre]||0)+ +g.priceBought;});
  const gcData=Object.entries(gcMap).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([n,v])=>({n,v:+v.toFixed(0)}));
  const soldG=sold.map(g=>({...g,roi:+g.priceSold - +g.priceBought})).sort((a,b)=>b.roi-a.roi);
  // Monthly spending — last 12 months, oldest first for chart left-to-right
  // Aggregates priceBought + extraSpend per month based on g.addedAt (UTC ok for trend visualization)
  const monthlyMap={};
  bought.forEach(g=>{
    if(!g.addedAt)return;
    const k=g.addedAt.slice(0,7);  // YYYY-MM
    monthlyMap[k]=(monthlyMap[k]||0)+ +g.priceBought + +(g.extraSpend||0);
  });
  // Build last 12 months series — fill gaps with 0 so chart shows continuous timeline
  const monthlyData=[];
  const _now=new Date();
  for(let i=11;i>=0;i--){
    const d=new Date(_now.getFullYear(),_now.getMonth()-i,1);
    const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    const months=lang==='en'?['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']:['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'];
    const label=`${months[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
    monthlyData.push({n:label,v:Math.round(monthlyMap[k]||0),k});
  }
  // Find max month (highest spend) for highlight + caption
  const maxMonth=monthlyData.reduce((m,d)=>d.v>m.v?d:m,{v:0});
  const monthlyHasData=monthlyData.some(d=>d.v>0);

  // v1.3 #3 — Backlog cost: games with priceBought but zero hours played
  const backlogGames=games.filter(g=>!!+g.priceBought && (!g.hours || +g.hours===0) && g.status!=='ukonczone' && g.status!=='porzucone');
  const backlogCost=backlogGames.reduce((s,g)=>s+ +g.priceBought + +(g.extraSpend||0),0);

  // v1.3 #1 — Year projection: avg from last 3-6 months × remaining months in year
  // Requires at least 1 month of data (excluding current incomplete month)
  // Compare with same period prior year
  const _curMonth=_now.getMonth();  // 0-indexed
  const _curYear=_now.getFullYear();
  // Avg of last 3 fully complete months (skip current incomplete month)
  const recent3=[];
  for(let i=1;i<=3;i++){
    const d=new Date(_curYear,_curMonth-i,1);
    const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    if(monthlyMap[k]!==undefined)recent3.push(monthlyMap[k]||0);
  }
  const avgRecent=recent3.length>0?recent3.reduce((s,v)=>s+v,0)/recent3.length:0;
  // Already spent this year
  const ytdSpent=Object.entries(monthlyMap)
    .filter(([k])=>k.startsWith(_curYear+'-'))
    .reduce((s,[,v])=>s+v,0);
  // Project remainder of year
  const monthsRemaining=11-_curMonth;  // months after current (e.g. April = 7 remaining)
  const projectedTotal=Math.round(ytdSpent + avgRecent * monthsRemaining);
  // Prior year same period total (Jan-current month last year)
  const prevYear=_curYear-1;
  const prevYearSamePeriod=Object.entries(monthlyMap)
    .filter(([k])=>{
      if(!k.startsWith(prevYear+'-'))return false;
      const m=parseInt(k.slice(5,7),10);
      return m<=_curMonth+1;
    })
    .reduce((s,[,v])=>s+v,0);
  const prevYearFull=Object.entries(monthlyMap)
    .filter(([k])=>k.startsWith(prevYear+'-'))
    .reduce((s,[,v])=>s+v,0);
  const projectionHasData=avgRecent>0 && recent3.length>=2;
  const ratioVsLast=prevYearFull>0?(projectedTotal/prevYearFull):null;

  // v1.3 #2 — Per-genre $/h aggregate
  const genreAgg={};
  bought.filter(g=>g.genre && +g.hours>0).forEach(g=>{
    const ge=g.genre;
    if(!genreAgg[ge])genreAgg[ge]={hours:0,cost:0,count:0};
    genreAgg[ge].hours+=+g.hours;
    genreAgg[ge].cost+=+g.priceBought + +(g.extraSpend||0);
    genreAgg[ge].count++;
  });
  const perGenreData=Object.entries(genreAgg)
    .map(([n,v])=>({n,cph:v.cost/v.hours,hours:v.hours,count:v.count}))
    .filter(d=>d.count>=1)  // at least 1 game with hours
    .sort((a,b)=>a.cph-b.cph)  // best (lowest) first
    .slice(0,5);
  const perGenreHasData=perGenreData.length>0;

  // v1.3 #4 — Year over year ROI: bought vs recovered ratio per calendar year
  const yearAgg={};
  games.forEach(g=>{
    if(g.addedAt && +g.priceBought){
      const y=g.addedAt.slice(0,4);
      yearAgg[y]=yearAgg[y]||{bought:0,recovered:0};
      yearAgg[y].bought+=+g.priceBought + +(g.extraSpend||0);
    }
    // Use addedAt year for sold tracking too — sale year would need separate field
    if(g.addedAt && g.priceSold!=null && +g.priceSold>0){
      const y=g.addedAt.slice(0,4);
      yearAgg[y]=yearAgg[y]||{bought:0,recovered:0};
      yearAgg[y].recovered+=+g.priceSold;
    }
  });
  const yearROIData=Object.entries(yearAgg)
    .map(([y,v])=>({year:y,bought:v.bought,recovered:v.recovered,pct:v.bought>0?Math.round(v.recovered/v.bought*100):0}))
    .sort((a,b)=>b.year.localeCompare(a.year))  // newest first
    .slice(0,3);
  const yearROIHasData=yearROIData.some(d=>d.recovered>0);

  const fkpis=[
    {l:t(lang,'spent'),        v:pln(totalBase,lang),   c:G.red, bg:'rgba(255,77,109,.07)'},
    {l:t(lang,'spentDLC'),     v:pln(totalDLC,lang),    c:'#FF6B9D', bg:'rgba(255,107,157,.07)'},
    {l:t(lang,'earnedBack'),   v:pln(totalEarned,lang), c:G.grn, bg:'rgba(57,255,110,.07)'},
    {l:t(lang,'realCostShort'),v:pln(netCost,lang),     c:G.org, bg:'rgba(255,159,64,.07)'},
  ];
  if(cph!==null){fkpis.push({l:t(lang,'costPerHour'),v:fmtCph(cph),c:G.blu,bg:'rgba(0,212,255,.07)'});}

  // === Insights (copied from Stats) ===
  const insights=[];
  if(games.length){
    const abandoned=games.filter(g=>g.status==='porzucone'&&+g.priceBought>0&&!g.priceSold);
    const totalAbandonedLoss=abandoned.reduce((s,g)=>s+ +g.priceBought,0);
    const sellableAbandoned=abandoned.map(g=>({...g,estimatedSell:Math.round(+g.priceBought*0.6)}));
    const potentialRecovery=sellableAbandoned.reduce((s,g)=>s+g.estimatedSell,0);
    const biggestLossGame=abandoned.sort((a,b)=>+b.priceBought - +a.priceBought)[0];
    const completedROI=sold.map(g=>({...g,roi:+g.priceSold - +g.priceBought})).filter(g=>g.roi>0).sort((a,b)=>b.roi-a.roi);
    const bestInvestGame=completedROI[0];
    const expensiveHours=withHrs.filter(g=>+g.priceBought/g.hours>10).sort((a,b)=>(+b.priceBought/b.hours)-(+a.priceBought/a.hours));
    const mostExpHour=expensiveHours[0];
    const bestValGame=[...withHrs].sort((a,b)=>(+a.priceBought/a.hours)-(+b.priceBought/b.hours))[0];
    const savingsFromAvoidance=biggestLossGame?Math.round(+biggestLossGame.priceBought*0.3):0;
    const totalPotentialSavings=savingsFromAvoidance+potentialRecovery;
    if(totalPotentialSavings>0)insights.push({ico:'💡',color:G.grn,bg:'rgba(57,255,110,.07)',title:t(lang,'potentialSaving'),body:t(lang,'savingsDesc',{amount:pln(totalPotentialSavings,lang)}),val:pln(totalPotentialSavings,lang),big:true});
    if(biggestLossGame)insights.push({ico:'🚨',color:G.red,bg:'rgba(255,77,109,.07)',title:t(lang,'biggestLoss'),body:t(lang,'biggestLossDesc',{title:biggestLossGame.title,amount:pln(+biggestLossGame.priceBought,lang)}),val:'-'+pln(+biggestLossGame.priceBought,lang),actionKey:'avoidLoss'});
    if(bestInvestGame)insights.push({ico:'✅',color:G.grn,bg:'rgba(57,255,110,.07)',title:t(lang,'bestInvestment'),body:t(lang,'bestInvestmentDesc',{title:bestInvestGame.title,amount:pln(bestInvestGame.roi,lang)}),val:'+'+pln(bestInvestGame.roi,lang),actionKey:'buyBetter'});
    if(mostExpHour)insights.push({ico:'⚠️',color:G.org,bg:'rgba(255,159,64,.07)',title:t(lang,'mostExpensiveHours'),body:t(lang,'expHoursDesc',{title:mostExpHour.title,cph:(+mostExpHour.priceBought/mostExpHour.hours).toFixed(1)}),val:fmtCph(+mostExpHour.priceBought/mostExpHour.hours),actionKey:'optimizeBacklog'});
    if(bestValGame)insights.push({ico:'💎',color:G.blu,bg:'rgba(0,212,255,.07)',title:t(lang,'bestValueShort'),body:t(lang,'bestValDesc',{title:bestValGame.title,cph:(+bestValGame.priceBought/bestValGame.hours).toFixed(1)}),val:fmtCph(+bestValGame.priceBought/bestValGame.hours),actionKey:'findSimilar'});
    if(totalSpent>0)insights.push({ico:'💰',color:G.pur,bg:'rgba(167,139,250,.07)',title:t(lang,'financeSummary'),body:t(lang,'finSummaryDesc',{spent:pln(totalSpent,lang),earned:pln(totalEarned,lang),net:pln(netCost,lang)}),val:pln(netCost,lang)});
  }

  const subTabs=[[' overview',lang==='pl'?'📊 Przegląd':'📊 Overview'],[' insights',t(lang,'analysis')]];

  return(
    <div className='scr'>
      <div style={{display:'flex',gap:3,background:G.card,border:`1px solid ${G.bdr}`,borderRadius:11,padding:4,marginBottom:14}}>
        {subTabs.map(([k,l])=><button key={k} type='button' onClick={()=>setTab(k.trim())} style={{flex:1,minHeight:40,padding:'7px 2px',border:'none',borderRadius:8,background:tab===k.trim()?'rgba(0,212,255,.15)':'transparent',color:tab===k.trim()?G.blu:G.dim,fontFamily:"'Syne',sans-serif",fontSize:10,fontWeight:600,cursor:'pointer'}}>{l}</button>)}
      </div>
      {tab==='overview'&&<>
        <div style={{display:'flex',alignItems:'flex-start',gap:8,marginBottom:12,padding:'10px 12px',background:'rgba(0,212,255,.06)',border:`1px solid ${G.bdr}`,borderRadius:10,fontSize:11,color:G.dim,lineHeight:1.4}}>
          <span style={{fontSize:14,flexShrink:0}}>ℹ️</span>
          <span>{t(lang,'financeInfoHint')}</span>
        </div>
        {!bought.length?<div className='empty'><div className='eic'>💰</div><div className='ett'>{t(lang,'noFinanceData')}</div><div className='ess'>{t(lang,'addPricesHint')}</div></div>:<>
          <div className='fkgd'>{fkpis.map(k=><div key={k.l} className='fkcd' style={{'--c':k.c,background:k.bg}}><div className='fkv'>{k.v}</div><div className='fkl'>{k.l}</div></div>)}</div>
          {backlogGames.length>0&&<div className='ccd' style={{borderColor:'rgba(255,159,28,.3)',background:'linear-gradient(135deg,rgba(255,159,28,.06),rgba(255,77,109,.04))'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:4}}>
              <div style={{fontSize:11,fontWeight:700,color:G.org,letterSpacing:'.05em'}}>{t(lang,'backlogCost')}</div>
              <div style={{fontSize:9,color:G.dim,textTransform:'uppercase',letterSpacing:'.08em'}}>{t(lang,'backlogCostBadge')}</div>
            </div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:30,fontWeight:900,color:G.org,lineHeight:1,marginTop:6,marginBottom:4}}>{pln(backlogCost,lang)}</div>
            <div style={{fontSize:11,color:G.dim}}>{t(lang,'backlogCostDesc',{n:backlogGames.length,gamesWord:gamesWord(backlogGames.length,lang)})}</div>
          </div>}
          {monthlyHasData&&<div className='ccd'>
            <div className='ctl'>{t(lang,'spendingByMonth')}</div>
            <ResponsiveContainer width='100%' height={140}>
              <BarChart data={monthlyData} barSize={14} margin={{top:4,left:4,right:14,bottom:4}}>
                <XAxis dataKey='n' tick={{fill:G.dim,fontSize:8}} axisLine={false} tickLine={false} interval='preserveStartEnd' minTickGap={4} padding={{left:6,right:6}}/>
                <YAxis hide/>
                <Tooltip content={<CTip/>}/>
                <Bar dataKey='v' radius={[4,4,0,0]}>
                  {monthlyData.map((d,i)=><Cell key={i} fill={d.k===maxMonth.k&&d.v>0?G.red:G.blu} fillOpacity={d.v>0?(d.k===maxMonth.k?0.95:0.7):0.15}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {maxMonth.v>0&&<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:11,color:G.dim,marginTop:4}}>
              <span>{t(lang,'topMonth')}: <span style={{color:G.red,fontWeight:700}}>{maxMonth.n}</span></span>
              <span style={{fontFamily:"'Orbitron',monospace",fontWeight:700,color:G.red}}>{pln(maxMonth.v,lang)}</span>
            </div>}
          </div>}
          {projectionHasData&&<div className='ccd' style={{borderColor:'rgba(0,212,255,.3)'}}>
            <div className='ctl'>{t(lang,'yearProjection')}</div>
            <div style={{fontSize:12,color:G.dim,lineHeight:1.5,marginBottom:8}}>
              {t(lang,'yearProjectionDesc',{avg:pln(Math.round(avgRecent),lang),months:recent3.length})}
            </div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:24,fontWeight:900,color:G.blu,lineHeight:1,marginBottom:6}}>
              ~{pln(projectedTotal,lang)}
            </div>
            <div style={{fontSize:11,color:G.dim}}>
              {t(lang,'yearProjectionEnd',{year:_curYear,total:pln(projectedTotal,lang)}).replace(': ~'+pln(projectedTotal,lang),'')}
            </div>
            {ratioVsLast!==null && Math.abs(ratioVsLast-1)>0.05 && <div style={{fontSize:11,marginTop:8,padding:'8px 10px',background:ratioVsLast>1?'rgba(255,77,109,.07)':'rgba(57,255,110,.07)',border:`1px solid ${ratioVsLast>1?'rgba(255,77,109,.2)':'rgba(57,255,110,.2)'}`,borderRadius:8,color:ratioVsLast>1?G.red:G.grn,fontWeight:600}}>
              {t(lang,'yearVsLast',{ratio:ratioVsLast.toFixed(1),dir:t(lang,ratioVsLast>1?'yearVsLastDirMore':'yearVsLastDirLess'),year:prevYear})}
            </div>}
          </div>}
          {storeData.length>0&&<div className='ccd'><div className='ctl'>{t(lang,'byStore')}</div><ResponsiveContainer width='100%' height={130}><BarChart data={storeData} barSize={28} margin={{top:4,left:0,right:0,bottom:4}}><XAxis dataKey='n' tick={{fill:G.dim,fontSize:9}} axisLine={false} tickLine={false} interval={0} padding={{left:28,right:28}}/><YAxis hide/><Tooltip content={<CTip/>}/><Bar dataKey='v' radius={[4,4,0,0]} fill={G.org} fillOpacity={0.85}/></BarChart></ResponsiveContainer></div>}
          {gcData.length>0&&<div className='ccd'><div className='ctl'>{t(lang,'byGenre')}</div><ResponsiveContainer width='100%' height={130}><BarChart data={gcData} barSize={22} margin={{top:4,left:0,right:0,bottom:4}}><XAxis dataKey='n' tick={{fill:G.dim,fontSize:9}} axisLine={false} tickLine={false} interval={0} padding={{left:22,right:22}}/><YAxis hide/><Tooltip content={<CTip/>}/><Bar dataKey='v' radius={[4,4,0,0]} fill={G.pur} fillOpacity={0.8}/></BarChart></ResponsiveContainer></div>}
          {perGenreHasData&&<div className='ccd'>
            <div className='ctl'>{t(lang,'perGenreValue')}</div>
            <div style={{fontSize:11,color:G.dim,marginBottom:8}}>{t(lang,'perGenreValueHint')}</div>
            <ul className='top-list'>{perGenreData.map((d,i)=><li key={i} className='top-item'>
              <span className='top-title'>{d.n}</span>
              <span style={{fontSize:10,color:G.dim,flexShrink:0}}>{t(lang,'perGenreCol',{n:d.count,gamesWord:gamesWord(d.count,lang),hours:fmtHours(d.hours,{compact:true})})}</span>
              <span className='top-val' style={{color:i===0?G.grn:G.blu}}>{fmtCph(d.cph)}</span>
            </li>)}</ul>
          </div>}
          {soldG.length>0&&<div className='ccd'><div className='ctl'>{t(lang,'roi')}</div><ul className='top-list'>{soldG.map(g=><li key={g.id} className='top-item'><span className='top-title'>{g.title}</span><span style={{fontSize:10,color:G.dim,flexShrink:0}}>{pln(+g.priceBought,lang)}→{pln(+g.priceSold,lang)}</span><span className={'top-val '+(g.roi>=0?'roi-pos':'roi-neg')}>{g.roi>=0?'+':''}{pln(g.roi,lang)}</span></li>)}</ul></div>}
          {yearROIHasData&&<div className='ccd'>
            <div className='ctl'>{t(lang,'yearROI')}</div>
            <ul className='top-list'>{yearROIData.map((d,i)=><li key={i} className='top-item' style={{display:'grid',gridTemplateColumns:'48px 1fr auto',gap:8,alignItems:'baseline'}}>
              <span style={{fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:700,color:G.txt}}>{d.year}</span>
              <span style={{fontSize:11,color:G.dim,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{t(lang,'yearROIBought')}: {pln(d.bought,lang)} · {t(lang,'yearROIRecovered')}: {pln(d.recovered,lang)}</span>
              <span style={{fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:700,color:d.pct>=60?G.grn:d.pct>=40?G.org:G.red}}>{d.pct}%</span>
            </li>)}</ul>
          </div>}
          <div className='ccd'><div className='ctl'>{t(lang,'mostExpensive')}</div><ul className='top-list'>{[...bought].sort((a,b)=>+b.priceBought - +a.priceBought).slice(0,5).map(g=><li key={g.id} className='top-item'><span className='top-title'>{g.title}</span>{g.storeBought&&<span style={{fontSize:10,color:G.dim,flexShrink:0}}>{g.storeBought}</span>}<span className='top-val' style={{color:G.org}}>{pln(+g.priceBought,lang)}</span></li>)}</ul></div>
          {withHrs.length>0&&<div className='ccd'><div className='ctl'>{t(lang,'bestValue')}</div><ul className='top-list'>{[...withHrs].sort((a,b)=>(+a.priceBought/a.hours)-(+b.priceBought/b.hours)).slice(0,5).map(g=><li key={g.id} className='top-item'><span className='top-title'>{g.title}</span><span style={{fontSize:10,color:G.dim,flexShrink:0}}>{fmtHours(g.hours,{compact:true})}</span><span className='top-val' style={{color:G.grn}}>{fmtCph(+g.priceBought/g.hours)}</span></li>)}</ul></div>}
        </>}
      </>}
      {tab==='insights'&&<>{!insights.length?<div className='empty'><div className='eic'>💡</div><div className='ett'>{t(lang,'noInsights')}</div><div className='ess'>{t(lang,'addPricesAndHours')}</div></div>:<InsightsTab insights={insights} games={games} lang={lang}/>}</>}
    </div>
  );
}

// ─── v1.5.0 Hamburger menu overlay ───────────────────────────────────────────
// Fullscreen drawer triggered from the header ⋮ button. Lists secondary screens
// (Wrapped, Achievements, Goals, Settings) — these used to either be a tab or a
// modal. Centralizing them here freed a tab slot and gave each feature breathing
// room behind a single entry point.
function MenuOverlay({ onClose, onPick, lang, achStats, goalStats, currentYear, triggers }){
  // v1.8.0: triggers={achievements, goals, wrapped, any} drive per-row red dots.
  // Falls back to no-dots if not provided (defensive — older callsites still work).
  const trig = triggers || { achievements:false, goals:false, wrapped:false };
  const items=[
    { key:'wrapped',      ico:'🎁', tk:'menuWrapped',     dk:'menuWrappedDesc',
      badge: currentYear ? String(currentYear) : null, dot: trig.wrapped },
    { key:'achievements', ico:'🏆', tk:'menuAchievements',dk:'menuAchievementsDesc',
      vars:{ unlocked:achStats.unlocked, total:achStats.total },
      badge: achStats.unlocked>0 ? `${achStats.unlocked}/${achStats.total}` : null, dot: trig.achievements },
    { key:'goals',        ico:'🎯', tk:'menuGoals',       dk:'menuGoalsDesc',
      vars:{ active:goalStats.active, done:goalStats.done },
      badge: goalStats.active>0 ? String(goalStats.active) : null, dot: trig.goals },
    { key:'settings',     ico:'⚙️', tk:'menuSettings',    dk:'menuSettingsDesc' },
  ];
  return (
    <div className='ovr menu-ovr' onClick={onClose}>
      <div className='menu-pn' onClick={e=>e.stopPropagation()}>
        <div className='mhdl'/>
        <div className='menu-hdr'>
          <div className='mttl'>{t(lang,'menuTitle')}</div>
          <button type='button' className='bs-x' onClick={onClose} aria-label={t(lang,'cancel')}>✕</button>
        </div>
        {items.map(it=>(
          <button key={it.key} type='button' className='menu-row' onClick={()=>onPick(it.key)}>
            <span className='menu-ico'>{it.ico}{it.dot && <span className='menu-row-dot' aria-hidden='true'/>}</span>
            <div className='menu-body'>
              <div className='menu-title'>{t(lang, it.tk).replace(/^[^\s]+\s/, '')}</div>
              <div className='menu-desc'>{t(lang, it.dk, it.vars||{})}</div>
            </div>
            {it.badge && <span className='menu-badge'>{it.badge}</span>}
            <span className='menu-arrow'>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── v1.5.0 Achievements overlay ─────────────────────────────────────────────
// Read-only grid. Locked achievements appear dimmed with a progress bar; unlocked
// ones get a colored card. Multi-tier groups (collector_1..5) render as separate
// tiles by design — players see "what's next" instead of just one badge that
// silently leveled up.
function Achievements({ games, longestStreak, lang, onClose }){
  const list=computeAchievements(games, longestStreak);
  const unlockedCount=list.filter(a=>a.unlocked).length;
  const total=list.length;
  const pct=total ? Math.round((unlockedCount/total)*100) : 0;
  return (
    <div className='bs-ovr'>
      <div className='bs-hdr'>
        <div className='bs-ttl'>{t(lang,'achievementsTitle')}</div>
        <button type='button' className='bs-x' onClick={onClose} aria-label={t(lang,'cancel')}>✕</button>
      </div>
      <div className='ach-pn'>
        <div className='ach-sub'>{t(lang,'achievementsSub',{unlocked:unlockedCount, total, pct})}</div>
        {games.length===0 && <div className='empty' style={{padding:'40px 20px'}}>
          <div className='eic'>🏆</div>
          <div className='ett'>{t(lang,'achEmpty')}</div>
        </div>}
        {games.length>0 && <div className='ach-grid'>
          {list.map(a=>{
            const titleStr=a.title[lang]||a.title.en;
            const descStr=a.desc[lang]||a.desc.en;
            return (
              <div key={a.id} className={'ach-card'+(a.unlocked?' ach-on':'')+(a.rare?' ach-rare':'')}>
                <div className='ach-ico'>{a.ico}</div>
                <div className='ach-title'>{titleStr}</div>
                <div className='ach-desc'>{descStr}</div>
                {!a.unlocked && (
                  <div className='ach-bar'>
                    <div className='ach-bar-fill' style={{width:`${a.pct}%`}}/>
                  </div>
                )}
                <div className='ach-progress'>
                  {a.unlocked
                    ? <span style={{color:G.grn}}>✓ {t(lang,'achUnlocked')}</span>
                    : t(lang,'achProgress',{cur:a.progress, tgt:a.threshold})}
                </div>
              </div>
            );
          })}
        </div>}
      </div>
    </div>
  );
}

// ─── v1.5.0 Goals manager overlay ────────────────────────────────────────────
// Full CRUD on goals list. Adding a goal picks from GOAL_TEMPLATES and snapshots
// the current month bounds — so a "Complete 3 games this month" goal added on
// Apr 26 ends Apr 30, and on May 1 a fresh goal needs to be added (or the user
// re-adds one). Keeps logic dumb and avoids surprise auto-renew.
function GoalsManager({ goals, setGoals, games, sessions, lang, flash, onClose }){
  const [picking,setPicking]=useState(false);
  const active=goals.filter(g=>!g.doneAt);
  const done=goals.filter(g=>!!g.doneAt);
  const daysLeft=daysLeftInMonth();
  function addGoal(tpl){
    const { startKey, endKey } = monthBounds();
    const id='gl_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    const next=[...goals, { id, type:tpl.type, target:tpl.target, periodStart:startKey, periodEnd:endKey, doneAt:null }];
    setGoals(next); goalsWrite(next);
    setPicking(false);
    flash(t(lang,'goalAdded'));
  }
  function delGoal(id){
    const next=goals.filter(g=>g.id!==id);
    setGoals(next); goalsWrite(next);
    flash(t(lang,'goalRemoved'));
  }
  // Auto-mark goals done when current value reaches target. Persists doneAt.
  // (App.jsx passes a setGoals that also writes to localStorage, so we don't
  //  need a separate effect here for that — but we do need to detect crossings.)
  useEffect(()=>{
    let dirty=false;
    const updated=goals.map(gl=>{
      if(gl.doneAt) return gl;
      const cur=goalCurrent(gl, games, sessions);
      if(cur >= gl.target){
        dirty=true;
        return { ...gl, doneAt:new Date().toISOString() };
      }
      return gl;
    });
    if(dirty){
      setGoals(updated); goalsWrite(updated);
      const newlyDone = updated.filter((g,i)=>g.doneAt && !goals[i].doneAt);
      if(newlyDone.length){
        const gl=newlyDone[0];
        const tpl=GOAL_TYPES[gl.type];
        // v1.13.10 — defensive: goalsRead() filters unknown types, but if anything slips
        // through (in-memory mutation, race), don't crash the toast — just skip it.
        if(tpl){
          const titleStr=t(lang, tpl.tk, goalParams(gl.type, gl.target, lang));
          flash(t(lang,'goalDone',{title:titleStr}));
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[games, sessions]);

  return (
    <div className='bs-ovr'>
      <div className='bs-hdr'>
        <div className='bs-ttl'>{t(lang,'goalsTitle')}</div>
        <button type='button' className='bs-x' onClick={onClose} aria-label={t(lang,'cancel')}>✕</button>
      </div>
      <div className='ach-pn'>
        <div className='ach-sub'>{t(lang,'goalsSub')}</div>

        {/* Active goals */}
        <div className='goals-h'>{t(lang,'goalsActive',{n:active.length})}</div>
        {active.length===0 && <div className='goals-empty'>
          <div style={{fontSize:32,marginBottom:6}}>🎯</div>
          <div className='goals-empty-t'>{t(lang,'goalsEmpty')}</div>
          <div className='goals-empty-h'>{t(lang,'goalsEmptyHint')}</div>
        </div>}
        {active.map(gl=>{
          const tpl=GOAL_TYPES[gl.type];
          if(!tpl) return null;  // v1.13.10 — defensive: skip unknown goal types
          const cur=goalCurrent(gl, games, sessions);
          const pct=Math.min(100, Math.round((cur/gl.target)*100));
          const titleStr=t(lang, tpl.tk, goalParams(gl.type, gl.target, lang));
          return (
            <div key={gl.id} className='goal-card'>
              <div className='goal-row'>
                <span className='goal-ico'>{tpl.ico}</span>
                <div className='goal-body'>
                  <div className='goal-title'>{titleStr}</div>
                  <div className='goal-meta'>{cur} / {gl.target} · {daysLeft===0?t(lang,'goalLastDay'):t(lang,'goalRemainingDays',{n:daysLeft})}</div>
                </div>
                <button type='button' className='goal-del' onClick={()=>delGoal(gl.id)} aria-label={t(lang,'goalDelete')}>✕</button>
              </div>
              <div className='goal-bar'><div className='goal-bar-fill' style={{width:`${pct}%`}}/></div>
            </div>
          );
        })}
        <button type='button' className='acc-btn' style={{margin:'14px 0 6px'}} onClick={()=>setPicking(true)}>{t(lang,'goalsAdd')}</button>

        {/* Done goals — collapsed list */}
        {done.length>0 && <>
          <div className='goals-h' style={{marginTop:14}}>{t(lang,'goalsDone',{n:done.length})}</div>
          {done.map(gl=>{
            const tpl=GOAL_TYPES[gl.type];
            if(!tpl) return null;  // v1.13.10 — defensive: skip unknown goal types
            const titleStr=t(lang, tpl.tk, goalParams(gl.type, gl.target, lang));
            return (
              <div key={gl.id} className='goal-card goal-card-done'>
                <div className='goal-row'>
                  <span className='goal-ico'>✅</span>
                  <div className='goal-body'>
                    <div className='goal-title'>{titleStr}</div>
                    <div className='goal-meta'>{fmtShort(gl.doneAt, lang)}</div>
                  </div>
                  <button type='button' className='goal-del' onClick={()=>delGoal(gl.id)} aria-label={t(lang,'goalDelete')}>✕</button>
                </div>
              </div>
            );
          })}
        </>}
      </div>

      {/* Goal template picker */}
      {picking && (
        <div className='confirm-ovr' onClick={()=>setPicking(false)}>
          <div className='confirm-box' onClick={e=>e.stopPropagation()} style={{maxWidth:380}}>
            <div className='confirm-title'>{t(lang,'goalsAddTitle')}</div>
            <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:14}}>
              {GOAL_TEMPLATES.map((tpl,i)=>{
                const def=GOAL_TYPES[tpl.type];
                if(!def) return null;  // v1.13.10 — defensive (templates are static, but consistent)
                return (
                  <button key={i} type='button' className='goal-tpl' onClick={()=>addGoal(tpl)}>
                    <span style={{fontSize:20}}>{def.ico}</span>
                    <span style={{flex:1,textAlign:'left'}}>{t(lang, def.tk, goalParams(tpl.type, tpl.target, lang))}</span>
                  </button>
                );
              })}
            </div>
            <button type='button' className='bcn' style={{marginTop:14,width:'100%'}} onClick={()=>setPicking(false)}>{t(lang,'cancel')}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── v1.5.0 Goals card (Home) ────────────────────────────────────────────────
// Compact view of active goals on the Home tab. Tap → opens GoalsManager.
function GoalsCard({ goals, games, sessions, lang, onOpen }){
  const active=goals.filter(g=>!g.doneAt);
  if(!active.length){
    return (
      <div className='goal-home-empty' onClick={onOpen}>
        <span className='goal-ico' style={{fontSize:24}}>🎯</span>
        <div className='goal-body'>
          <div className='goal-title'>{t(lang,'goalCardTitle')}</div>
          <div className='goal-meta'>{t(lang,'goalCardEmpty')}</div>
        </div>
        <span className='menu-arrow'>{t(lang,'goalCardCta')}</span>
      </div>
    );
  }
  return (
    <div className='goal-home' onClick={onOpen}>
      <div className='goal-home-h'>{t(lang,'goalCardTitle')}</div>
      {active.slice(0,3).map(gl=>{
        const tpl=GOAL_TYPES[gl.type];
        if(!tpl) return null;  // v1.13.10 — defensive: skip unknown goal types
        const cur=goalCurrent(gl, games, sessions);
        const pct=Math.min(100, Math.round((cur/gl.target)*100));
        const titleStr=t(lang, tpl.tk, goalParams(gl.type, gl.target, lang));
        return (
          <div key={gl.id} className='goal-mini'>
            <div className='goal-mini-row'>
              <span className='goal-ico'>{tpl.ico}</span>
              <div className='goal-body'>
                <div className='goal-mini-title'>{titleStr}</div>
                <div className='goal-mini-meta'>{cur} / {gl.target}</div>
              </div>
            </div>
            <div className='goal-bar'><div className='goal-bar-fill' style={{width:`${pct}%`}}/></div>
          </div>
        );
      })}
      {active.length>3 && <div className='goal-mini-meta' style={{textAlign:'center',marginTop:6}}>+ {active.length-3}</div>}
    </div>
  );
}

// ─── v1.5.0 Year-in-Review (Spotify Wrapped style) ───────────────────────────
// Big-numbers card layout. Year picker at top defaults to current year, falls
// back to most recent year with data. If selected year has no data → empty state.
function YearInReview({ games, lang, onClose, flash }){
  const years=getYearsWithData(games);
  const currentYear=new Date().getFullYear();
  const defaultYear = years.includes(currentYear) ? currentYear : (years[0] || currentYear);
  const [year,setYear]=useState(defaultYear);
  const review=computeYearReview(games, year);
  const sym=getCurSymbol();
  // v1.7.0: native share sheet with clipboard fallback. Builds a short text recap
  // that fits in a tweet/Slack message — title from i18n, body from review's headline numbers.
  async function handleShare(){
    if(!review) return;
    const top = review.topPlayed[0]?.game?.title;
    const lines = [
      lang==='pl' ? `🎮 Mój ${year} w grach (PS5 Vault)` : `🎮 My ${year} in games (PS5 Vault)`,
      lang==='pl' ? `${review.totalHours}h grania, ${review.gamesAdded} dodanych, ${review.gamesCompleted} ukończonych`
                  : `${review.totalHours}h played, ${review.gamesAdded} added, ${review.gamesCompleted} completed`,
    ];
    if(top) lines.push(lang==='pl' ? `Najwięcej: ${top}` : `Most played: ${top}`);
    const text = lines.join('\n');
    const result = await shareText({
      title: t(lang,'wrappedShareTitle',{year}),
      text,
      url: 'https://matiseekk-dot.github.io/Games/',
    });
    if(result==='shared')   { /* OS handled it — no toast needed */ }
    else if(result==='copied')    { flash && flash(t(lang,'wrappedShareCopied')); }
    else if(result==='cancelled') { /* user dismissed — silent */ }
    else                          { flash && flash(t(lang,'wrappedShareFailed')); }
  }
  return (
    <div className='bs-ovr'>
      <div className='bs-hdr'>
        <div className='bs-ttl'>🎁 {t(lang,'wrappedTitle',{year})}</div>
        <button type='button' className='bs-x' onClick={onClose} aria-label={t(lang,'cancel')}>✕</button>
      </div>
      <div className='wr-pn'>
        {years.length>1 && (
          <div className='wr-years'>
            <span className='wr-years-lbl'>{t(lang,'wrappedYearPicker')}</span>
            {years.slice(0,5).map(y=>(
              <button key={y} type='button' className={'wr-year'+(y===year?' on':'')} onClick={()=>setYear(y)}>{y}</button>
            ))}
          </div>
        )}

        {!review && (
          <div className='empty' style={{padding:'48px 20px'}}>
            <div className='eic'>🎁</div>
            <div className='ett'>{t(lang,'wrappedEmpty',{year})}</div>
            <div className='ess'>{t(lang,'wrappedEmptyHint')}</div>
          </div>
        )}

        {review && <>
          <div className='wr-sub'>{t(lang,'wrappedSub',{year})}</div>

          {/* Big-number hero card */}
          <div className='wr-hero'>
            <div className='wr-hero-num'>{review.totalHours}</div>
            <div className='wr-hero-lbl'>{t(lang,'wrappedTotalHours')}</div>
            <div className='wr-hero-sub'>{review.sessionCount} {sessionsWord(review.sessionCount, lang)}</div>
          </div>

          {/* Stats grid */}
          <div className='wr-grid'>
            <div className='wr-stat'>
              <div className='wr-stat-num'>{review.gamesAdded}</div>
              <div className='wr-stat-lbl'>{t(lang,'wrappedGamesAdded')}</div>
            </div>
            <div className='wr-stat'>
              <div className='wr-stat-num'>{review.gamesCompleted}</div>
              <div className='wr-stat-lbl'>{t(lang,'wrappedGamesCompleted')}</div>
            </div>
            <div className='wr-stat'>
              <div className='wr-stat-num' style={{color:G.gld}}>{review.platinums}</div>
              <div className='wr-stat-lbl'>{t(lang,'wrappedPlatinums')}</div>
            </div>
            <div className='wr-stat'>
              <div className='wr-stat-num' style={{color:G.pur}}>{review.activeDays}</div>
              <div className='wr-stat-lbl'>{t(lang,'wrappedActiveDays')}</div>
              <div className='wr-stat-sub'>{t(lang,'wrappedActiveDaysDesc',{total:review.totalDaysInYear})}</div>
            </div>
          </div>

          {/* Top played */}
          {review.topPlayed.length>0 && <div className='wr-card'>
            <div className='wr-card-h'>{t(lang,'wrappedTopPlayed')}</div>
            {review.topPlayed.map((entry,i)=>{
              const g=entry.game;
              return (
                <div key={g.id} className='wr-row'>
                  <span className='wr-rank'>#{i+1}</span>
                  {g.cover ? <img className='wr-cov' src={g.cover} alt='' loading='lazy'/> : <div className='wr-cov0'>{g.abbr||'??'}</div>}
                  <div className='wr-row-body'>
                    <div className='wr-row-title'>{g.title}</div>
                    <div className='wr-row-meta'>{Math.round(entry.hours)}h{g.genre?' · '+g.genre:''}</div>
                  </div>
                </div>
              );
            })}
          </div>}

          {/* Highest rated */}
          {review.highestRated && <div className='wr-card'>
            <div className='wr-card-h'>{t(lang,'wrappedHighestRated')}</div>
            <div className='wr-row'>
              {review.highestRated.cover ? <img className='wr-cov' src={review.highestRated.cover} alt='' loading='lazy'/> : <div className='wr-cov0'>{review.highestRated.abbr||'??'}</div>}
              <div className='wr-row-body'>
                <div className='wr-row-title'>{review.highestRated.title}</div>
                <div className='wr-row-meta' style={{color:G.gld,fontWeight:700}}>★ {(+review.highestRated.rating).toFixed(1)} / 10</div>
              </div>
            </div>
          </div>}

          {/* Top genre */}
          {review.topGenre && <div className='wr-card'>
            <div className='wr-card-h'>{t(lang,'wrappedTopGenre')}</div>
            <div className='wr-genre-name'>{review.topGenre.name}</div>
            <div className='wr-genre-meta'>{t(lang,'wrappedTopGenreDesc',{n:review.topGenre.hours, hrs:hoursWord(review.topGenre.hours,lang), games:review.topGenre.gamesCount, gw:gamesWord(review.topGenre.gamesCount,lang)})}</div>
          </div>}

          {/* Money + records */}
          <div className='wr-grid'>
            <div className='wr-stat'>
              <div className='wr-stat-num' style={{color:G.org}}>{Math.round(review.totalSpent)}{sym}</div>
              <div className='wr-stat-lbl'>{t(lang,'wrappedSpent')}</div>
            </div>
            <div className='wr-stat'>
              <div className='wr-stat-num' style={{color:G.grn}}>{Math.round(review.totalRecovered)}{sym}</div>
              <div className='wr-stat-lbl'>{t(lang,'wrappedRecovered')}</div>
            </div>
            <div className='wr-stat'>
              <div className='wr-stat-num'>{review.longestStreak}</div>
              <div className='wr-stat-lbl'>{t(lang,'wrappedLongestStreak')}</div>
            </div>
            <div className='wr-stat'>
              <div className='wr-stat-num'>{review.longestSession}h</div>
              <div className='wr-stat-lbl'>{t(lang,'wrappedLongestSession')}</div>
            </div>
          </div>

          <button type='button' className='wr-share-btn' onClick={handleShare}>
            📤 {t(lang,'wrappedShare')}
          </button>
        </>}
      </div>
    </div>
  );
}

// v1.9.0 — Recommendations overlay.
// Hybrid two-track UI ("Bo lubisz" / "Bo grałeś w") backed by lib/recommend.js.
// Loading is async (fetch from RAWG with 30-day cache). Empty states are per-track
// — if a user has rated games but never completed any, only the "Bo lubisz" track
// has content; the "Bo grałeś w" tab shows a CTA telling them to mark a game completed.
//
// Tapping "+ Dodaj do kolekcji" on a recommendation opens the add-Modal pre-filled
// with the title/cover/genre/year/rawgId/playtime so the user just picks a status
// and saves. The pre-fill object has no `id`, so Modal's isEdit check correctly
// treats it as a NEW game.
function Recommendations({ games, lang, onClose, onAdd }){
  const [tab,setTab]=useState('rated');  // 'rated' | 'completed'
  const [data,setData]=useState(null);    // null while loading, then {topRated, completed, hasAnyData}
  const [error,setError]=useState(false);

  // Pre-check: does the user even have any rawg-id-bearing games to seed from?
  // If not, skip the fetch entirely and show the bootstrap empty state.
  const hasSeedableGames = games.some(g => g && g.rawgId);

  useEffect(()=>{
    if(!hasSeedableGames){ setData({ topRated:{recs:[],seeds:[]}, completed:{recs:[],seeds:[]}, hasAnyData:false }); return; }
    let cancelled=false;
    setError(false);
    buildRecommendations(games)
      .then(d => { if(!cancelled) setData(d); })
      .catch(() => { if(!cancelled) setError(true); });
    return () => { cancelled = true; };
  },[hasSeedableGames]);// eslint-disable-line — only re-run if seed availability changes

  const track = data ? (tab==='rated' ? data.topRated : data.completed) : null;

  return (
    <div className='bs-ovr'>
      <div className='bs-hdr'>
        <div className='bs-ttl'>✨ {t(lang,'recTitle')}</div>
        <button type='button' className='bs-x' onClick={onClose} aria-label={t(lang,'cancel')}>✕</button>
      </div>
      <div className='rec-pn'>
        {/* Intent picker tabs */}
        <div className='rec-tabs'>
          <button type='button' className={'rec-tab'+(tab==='rated'?' on':'')} onClick={()=>setTab('rated')}>
            ❤️ {t(lang,'recTabRated')}
          </button>
          <button type='button' className={'rec-tab'+(tab==='completed'?' on':'')} onClick={()=>setTab('completed')}>
            ✅ {t(lang,'recTabCompleted')}
          </button>
        </div>

        {/* Bootstrap empty: no rawg-id games to seed from */}
        {!hasSeedableGames && (
          <div className='rec-empty'>
            <div className='eic'>✨</div>
            <div className='ett'>{t(lang,'recEmptyNoRawg')}</div>
            <div className='ess'>{t(lang,'recEmptyNoRawgHint')}</div>
          </div>
        )}

        {/* Loading state */}
        {hasSeedableGames && !data && !error && (
          <div className='rec-loading'>
            <div className='rec-spinner' aria-hidden='true'/>
            <div>{t(lang,'recLoading')}</div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className='rec-empty'>
            <div className='eic'>⚠️</div>
            <div className='ett'>{t(lang,'recError')}</div>
            <button type='button' className='rec-retry' onClick={()=>{ setError(false); setData(null); }}>{t(lang,'retry')}</button>
          </div>
        )}

        {/* Per-track empty state.
            v1.13.9 — Distinguish "user not eligible" (no seeds) from "RAWG returned nothing
            for the seeds we sent" (seeds present but recs empty). Previously both showed the
            same "Rate ≥8 / Finish more" hint, which lied to users who already had eligible
            seeds — they'd see the message and assume their data was wrong, not that the
            external API returned an empty suggested-list. */}
        {data && track && track.recs.length===0 && (
          <div className='rec-empty'>
            {track.seeds.length===0 ? (
              <>
                <div className='eic'>{tab==='rated'?'❤️':'✅'}</div>
                <div className='ett'>{tab==='rated'?t(lang,'recEmptyRated'):t(lang,'recEmptyCompleted')}</div>
                <div className='ess'>{tab==='rated'?t(lang,'recEmptyRatedHint'):t(lang,'recEmptyCompletedHint')}</div>
              </>
            ) : (
              <>
                <div className='eic'>🤷</div>
                <div className='ett'>{t(lang,'recNoMatches')}</div>
                <div className='ess'>{t(lang,'recNoMatchesHint')}</div>
                <button type='button' className='rec-retry' onClick={()=>{ setError(false); setData(null); }}>{t(lang,'retry')}</button>
              </>
            )}
          </div>
        )}

        {/* Recommendations grid */}
        {data && track && track.recs.length>0 && (
          <>
            <div className='rec-grid'>
              {track.recs.map((rec,idx)=>{
                // Build the "why recommended" line. Show the highest-rated reason first;
                // if multiple seeds suggested this game, show the strongest one with a "+N" hint.
                const reasons=[...rec.reasons].sort((a,b)=>(+b.rating||0)-(+a.rating||0));
                const main=reasons[0];
                const extras=reasons.length-1;
                const reasonText = tab==='rated'
                  ? t(lang,'recReason',{title:main.title, rating:main.rating ?? '?'})
                  : t(lang,'recReasonCompleted',{title:main.title});
                return (
                  <div key={rec.id||idx} className='rec-card'>
                    {rec.cover
                      ? <div className='rec-cover' style={{backgroundImage:`url(${rec.cover})`}}/>
                      : <div className='rec-cover0'>{rec.abbr||'??'}</div>}
                    <div className='rec-body'>
                      <div className='rec-title'>{rec.title}</div>
                      <div className='rec-meta'>{[rec.genre, rec.year].filter(Boolean).join(' · ')}</div>
                      <div className='rec-reason'>
                        {reasonText}
                        {extras>0 && <span className='rec-reason-more'> +{extras}</span>}
                      </div>
                      <button type='button' className='rec-add' onClick={()=>onAdd(rec)}>
                        + {t(lang,'recAdd')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* External link to explore more on RAWG */}
            <a className='rec-explore' href='https://rawg.io' target='_blank' rel='noopener noreferrer'>
              {t(lang,'recExploreMore')}
            </a>
          </>
        )}
      </div>
    </div>
  );
}

// v1.11.1 — Wipe-all-data confirmation modal.
// GDPR right-to-deletion + Play Data Safety compliance: user must have an in-app way
// to delete ALL their data. This is the gate before pulling that trigger.
//
// Two-layer safety:
//   1. Modal opens (= one tap)
//   2. User must type the literal word "USUŃ" / "DELETE" to enable the destructive button
//   3. Tap → wipeAllData() → toast → window.location.reload()
//
// The reload is mandatory: useState/useRef refs hold deleted localStorage data, so just
// clearing storage without unmounting React would leave the UI in inconsistent state.
function WipeConfirm({ games, lang, onClose }){
  const [confirmText, setConfirmText] = useState('');
  const expected = lang === 'pl' ? 'USUŃ' : 'DELETE';
  const ready = confirmText.trim().toUpperCase() === expected;

  function doWipe(){
    if (!ready) return;
    wipeAllData();
    // No way to flash a toast that survives the reload — so we just reload immediately.
    // The user lands on the welcome screen, which is itself the "✓ done" feedback.
    window.location.reload();
  }

  return (
    <div className='confirm-ovr' onClick={onClose}>
      <div className='confirm-box wipe-box' onClick={e=>e.stopPropagation()}>
        <div className='confirm-ico'>⚠️</div>
        <div className='confirm-title'>{t(lang,'wipeTitle')}</div>
        <div className='confirm-body'>
          {t(lang,'wipeBody',{ n: games.length })}
        </div>
        <div className='wipe-typeprompt'>{t(lang,'wipeTypePrompt',{ word: expected })}</div>
        <input
          type='text'
          className='wipe-input'
          value={confirmText}
          onChange={e=>setConfirmText(e.target.value)}
          placeholder={expected}
          autoCapitalize='characters'
          autoCorrect='off'
          spellCheck='false'
        />
        <div className='confirm-btns'>
          <button type='button' className='confirm-no' onClick={onClose}>{t(lang,'cancel')}</button>
          <button
            type='button'
            className={'confirm-yes wipe-yes'+(ready?'':' disabled')}
            onClick={doWipe}
            disabled={!ready}
          >{t(lang,'wipeConfirmBtn')}</button>
        </div>
      </div>
    </div>
  );
}

function Settings({games,setGames,flash,lang,setLang,currency,setCurrency,openImport,openPrivacy,onWipeOpen}){
  // importRef removed in v1.2.0 — import now opens via ImportModal
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
        <div className='set-section-title'>{t(lang,'currencyLabel')}</div>
        <select className='cur-select'
          value={currency}
          onChange={e=>setCurrency(e.target.value)}>
          {Object.values(CURRENCIES).map(def=>(
            <option key={def.code} value={def.code}>{def.symbol} — {def.code} · {def.name[lang]||def.name.en}</option>
          ))}
        </select>
        <div style={{fontSize:11,color:G.dim,marginTop:8,padding:'0 4px',lineHeight:1.5}}>{t(lang,'currencyDesc')}</div>
      </div>
      <div className='set-section'>
        <div className='set-section-title'>{t(lang,'data')}</div>
        <div className='set-row' onClick={()=>exportData(games,lang,()=>flash(lang==='pl'?'✓ Backup zapisany':'✓ Backup saved'))}>
          <span className='set-row-ico'>⬆️</span><div className='set-row-body'><div className='set-row-title'>{t(lang,'exportData')}</div><div className='set-row-desc'>{t(lang,'exportDesc',{n:games.length})}</div></div><span className='set-row-arrow'>›</span>
        </div>
        <div className='set-row' onClick={openImport}>
          <span className='set-row-ico'>⬇️</span><div className='set-row-body'><div className='set-row-title'>{t(lang,'importData')}</div><div className='set-row-desc'>{t(lang,'importDesc')}</div></div><span className='set-row-arrow'>›</span>
        </div>
        {hasDemoGames(games) && (
          <div className='set-row' onClick={()=>{
            const demoCount=games.filter(g=>g._demo).length;
            if(window.confirm(t(lang,'demoClearConfirm',{n:demoCount}))){
              setGames(removeDemoGames(games));
              flash(t(lang,'demoCleared',{n:demoCount}));
            }
          }}>
            <span className='set-row-ico'>🧹</span><div className='set-row-body'><div className='set-row-title'>{t(lang,'demoClear')}</div><div className='set-row-desc'>{t(lang,'demoClearDesc',{n:games.filter(g=>g._demo).length})}</div></div><span className='set-row-arrow'>›</span>
          </div>
        )}
        {/* v1.9.0 — Recommendations cache cleanup (only renders if cache has any entries) */}
        {(()=>{const stats=recsCacheStats(); if(stats.entries===0) return null; return (
          <div className='set-row' onClick={()=>{
            if(window.confirm(t(lang,'recCacheClearConfirm',{n:stats.entries}))){
              recsCacheClear();
              flash(t(lang,'recCacheCleared'));
            }
          }}>
            <span className='set-row-ico'>♻️</span><div className='set-row-body'><div className='set-row-title'>{t(lang,'recCacheClear')}</div><div className='set-row-desc'>{t(lang,'recCacheClearDesc',{n:stats.entries, kb:Math.round(stats.bytes/1024)})}</div></div><span className='set-row-arrow'>›</span>
          </div>
        );})()}
        {/* v1.11.1 — GDPR right-to-deletion. Always visible; opens 2-step confirm modal.
            Last row of Data section because it's the most destructive action. */}
        <div className='set-row set-row-danger' onClick={onWipeOpen}>
          <span className='set-row-ico'>🗑️</span><div className='set-row-body'><div className='set-row-title'>{t(lang,'wipeRowTitle')}</div><div className='set-row-desc'>{t(lang,'wipeRowDesc')}</div></div><span className='set-row-arrow'>›</span>
        </div>
        {/* importRef input removed in v1.2.0 — replaced by ImportModal */}
      </div>
      <div className='set-section'>
        <div className='set-section-title'>{t(lang,'support')}</div>
        <div className='set-row' onClick={()=>window.open('https://buycoffee.to/skudev','_blank','noopener,noreferrer')}>
          <span className='set-row-ico'>☕</span><div className='set-row-body'><div className='set-row-title'>{t(lang,'buyCoffee')}</div><div className='set-row-desc'>{t(lang,'buyCoffeeDesc')}</div></div><span className='set-row-arrow'>›</span>
        </div>
      </div>
      <div className='set-section'>
        <div className='set-section-title'>{t(lang,'info')}</div>
        <div className='set-row' onClick={openPrivacy}>
          <span className='set-row-ico'>🔒</span><div className='set-row-body'><div className='set-row-title'>{t(lang,'privacyPolicy')}</div><div className='set-row-desc'>{t(lang,'privacyDesc')}</div></div><span className='set-row-arrow'>›</span>
        </div>
        <div className='set-row' onClick={()=>window.open('https://rawg.io','_blank','noopener,noreferrer')}>
          <span className='set-row-ico'>🎮</span><div className='set-row-body'><div className='set-row-title'>{t(lang,'poweredBy')}</div><div className='set-row-desc'>{t(lang,'poweredByDesc')}</div></div><span className='set-row-arrow'>›</span>
        </div>
        <div className='set-row' onClick={()=>{
          const subject=encodeURIComponent(`PS5 Vault v${APP_VER} — feedback`);
          // Pull last error from ErrorBoundary log (main.jsx). Helps diagnose crashes that
          // user couldn't describe — they just hit "Report" and we get the stack.
          let lastErr='';
          try{
            const log=JSON.parse(localStorage.getItem('ps5vault_error_log')||'[]');
            const last=log[log.length-1];
            if(last) lastErr=`\nLast error (${last.ts||'?'}): ${last.msg||''}`;
          }catch{}
          const body=encodeURIComponent(`\n\n---\nDevice: ${navigator.userAgent}\nApp: v${APP_VER}\nLang: ${lang}\nGames: ${games.length}${lastErr}`);
          window.location.href=`mailto:skudev6@gmail.com?subject=${subject}&body=${body}`;
        }}>
          <span className='set-row-ico'>📧</span><div className='set-row-body'><div className='set-row-title'>{t(lang,'reportProblem')}</div><div className='set-row-desc'>{t(lang,'reportProblemDesc')}</div></div><span className='set-row-arrow'>›</span>
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

// v1.3: BudgetEditor — proper save/edit pattern instead of "phantom Set button"
// State machine: editing=true (input + Set/Cancel) ←→ editing=false (display + Edit + Clear)
function BudgetEditor({budget,setBudget,games,flash,lang}){
  // editing=true on first paint when no amount yet (so user sees an input, not empty)
  const [editing,setEditing]=useState(()=>!budget.amount);
  const [draft,setDraft]=useState(()=>budget.amount||'');
  // Local-time month key (YYYY-MM) — see dayKey() comment about UTC bug
  const monthKey=(()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;})();
  // Spent this month: games added in current local month with priceBought, plus extraSpend
  // Note: g.addedAt is stored as toISOString() (UTC), so for users near midnight a game added
  // 1 maja 00:30 local time may slot into "April" budget. Documented limitation, not fixed
  // because g.addedAt schema would need a refactor.
  const spent=games.filter(g=>g.addedAt&&g.addedAt.slice(0,7)===monthKey&&!!+g.priceBought)
    .reduce((s,g)=>s+ +g.priceBought + +(g.extraSpend||0),0);

  function commit(){
    const v=+draft;
    if(!Number.isFinite(v) || v<=0){
      flash(t(lang,'budgetInvalidAmount'));
      return;
    }
    if(v>99999){ flash(t(lang,'budgetMaxErr')); return; }
    setBudget(p=>({...p,amount:String(Math.round(v)),month:monthKey}));
    flash(t(lang,'budgetSaved',{amount:pln(v,lang)}));
    setEditing(false);
  }
  function clear(){
    setBudget(p=>({...p,amount:''}));
    setDraft('');
    setEditing(true);
    flash(t(lang,'budgetCleared'));
  }
  function startEdit(){
    setDraft(budget.amount||'');
    setEditing(true);
  }
  function cancelEdit(){
    setDraft(budget.amount||'');
    setEditing(false);
  }

  if(editing){
    return (
      <>
        <div style={{display:'flex',gap:8,marginBottom:budget.amount?6:0}}>
          <input className='fi' style={{flex:1}} inputMode='decimal'
            placeholder={t(lang,'budgetPlaceholder')}
            value={draft}
            onChange={e=>setDraft(e.target.value.replace(/[^\d.]/g,''))}
            onKeyDown={e=>{if(e.key==='Enter')commit();}}
            autoFocus={!budget.amount}/>
          <button type='button' onClick={commit}
            style={{padding:'8px 14px',border:'none',borderRadius:9,background:G.blu,color:'#000',fontWeight:700,fontSize:12,cursor:'pointer'}}>
            {t(lang,'budgetSetBtn')}
          </button>
        </div>
        {budget.amount && <button type='button' onClick={cancelEdit}
          style={{background:'transparent',border:'none',color:G.dim,fontSize:11,cursor:'pointer',padding:'4px 0'}}>
          {t(lang,'cancel2')}
        </button>}
      </>
    );
  }

  // Display mode (saved)
  const left=+budget.amount-spent;
  const pct=Math.min(100,(spent/+budget.amount)*100);
  return (
    <>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:900,color:G.txt}}>{pln(+budget.amount,lang)}</div>
        <div style={{display:'flex',gap:6}}>
          <button type='button' onClick={startEdit}
            style={{padding:'6px 12px',border:`1px solid ${G.bdr}`,borderRadius:8,background:'transparent',color:G.blu,fontSize:11,fontWeight:700,cursor:'pointer'}}>
            ✏ {t(lang,'budgetEdit')}
          </button>
          <button type='button' onClick={clear}
            style={{padding:'6px 10px',border:`1px solid rgba(255,77,109,.2)`,borderRadius:8,background:'transparent',color:G.red,fontSize:11,fontWeight:700,cursor:'pointer'}}>
            ✕
          </button>
        </div>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
        <span style={{color:G.dim}}>{t(lang,'budgetSpent')}</span>
        <span style={{fontWeight:700,color:G.org}}>{pln(spent,lang)}</span>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:8}}>
        <span style={{color:G.dim}}>{left>=0?t(lang,'budgetLeft'):t(lang,'budgetOverflow')}</span>
        <span style={{fontWeight:700,color:left>=0?G.grn:G.red}}>{left>=0?pln(left,lang):'-'+pln(Math.abs(left),lang)}</span>
      </div>
      <div style={{height:8,borderRadius:4,background:G.bdr,overflow:'hidden'}}>
        <div style={{height:'100%',borderRadius:4,background:left>=0?G.grn:G.red,width:pct+'%',transition:'width .3s'}}/>
      </div>
      {left<0 && <div style={{fontSize:11,color:G.red,marginTop:6,fontWeight:700}}>⚠️ {t(lang,'budgetOver')}</div>}
    </>
  );
}

export default function App(){
  const [games,setGamesRaw]    = useState(()=>lsRead());
  const [onboarded,setOnboard] = useState(()=>isOnboarded());
  const [lang,setLang]         = useState(()=>getLang());
  const [currency,setCurrencyState] = useState(()=>getCurrency());
  const [tab,setTab]           = useState('home');
  const [flt,setFlt]           = useState('all');
  const [q,setQ]               = useState('');
  const [sortBy,setSortBy]     = useState('added');
  const [platFilter,setPlatFilter]= useState('all');
  const [rateModal,setRateModal]= useState(null);
  const [privacyOpen,setPrivacyOpen]=useState(false);
  // v1.5.0 — Hamburger-driven secondary screens. Single 'overlay' enum keeps mutual
  // exclusion trivial (you can't have Wrapped and Achievements open at once).
  const [overlay,setOverlay]=useState(null); // 'menu' | 'wrapped' | 'achievements' | 'goals' | 'settings' | null
  const [goals,setGoals]=useState(()=>goalsRead());
  // v1.7.0 — Queue of newly-unlocked achievement IDs not yet acknowledged by user.
  // Render shows the first one as a banner; tap or dismiss pops the queue.
  // Banner auto-dismisses after 6s (handled by useEffect below).
  const [achQueue,setAchQueue]=useState([]);
  // v1.8.0 — Hamburger badge trigger state. The full "seen" object lives in LS;
  // we mirror it here so React re-renders when we mark sections as seen.
  const [menuSeen,setMenuSeen]=useState(()=>menuSeenRead());
  // v1.2.0 — Import modal state
  const [importModal,setImportModal]=useState(null);  // null | {mode:null|'merge'|'replace', file:null|File}
  const openImport=()=>setImportModal({mode:null,file:null});
  const closeImport=()=>setImportModal(null);
  const [budget,setBudgetRaw]      = useState(()=>budgetRead());
  const setBudget=useCallback(val=>{setBudgetRaw(prev=>{const next=typeof val==='function'?val(prev):val;budgetWrite(next);return next;});},[]);
  const [modal,setModal]       = useState(null);
  const [toast,setToast]       = useState(null);
  const [notifPerm,setNotifP]  = useState(()=>'Notification'in window?Notification.permission:'denied');

  const setGames=useCallback(val=>{setGamesRaw(prev=>{const next=typeof val==='function'?val(prev):val;lsWrite(next);return next;});},[]);
  useEffect(()=>{registerSW().then(()=>{const g=games.filter(g=>g.notifyEnabled&&g.releaseDate);if(g.length&&Notification.permission==='granted')checkReleases(g,lang);});},[]);// eslint-disable-line

  // v1.10.0 — Weekly summary push. Once-per-mount call; the helper internally throttles
  // to ≥7 days between fires + checks permission + activity. We wait until games are
  // hydrated (skip first render where games might still be empty during initial load)
  // by gating on games.length > 0. Lang is also a dep so notification text matches the
  // current UI language if user switches mid-week.
  useEffect(()=>{
    if(!games.length) return;
    maybePushWeeklySummary(games, lang, t).catch(()=>{});
  },[games.length, lang]);// eslint-disable-line — intentional: only re-run on count change, not on every games mutation

  // v1.10.0 — URL-driven initial tab + SW message handler for weekly push clicks.
  // SW's notificationclick may openWindow('/Games/?tab=st') OR postMessage to existing tab.
  // We support both paths.
  useEffect(()=>{
    // Initial: read ?tab= from URL once on mount.
    try {
      const url = new URL(window.location.href);
      const t0 = url.searchParams.get('tab');
      if (t0 && ['home','col','upc','fin','st'].includes(t0)) {
        setTab(t0);
        // Strip the param so a manual reload doesn't keep forcing the same tab
        url.searchParams.delete('tab');
        window.history.replaceState({}, '', url.toString());
      }
    } catch {}
    // Listen for SWITCH_TAB messages from SW (existing-tab focus path).
    const handler = (event) => {
      const d = event.data || {};
      if (d.type === 'SWITCH_TAB' && ['home','col','upc','fin','st'].includes(d.tab)) {
        setTab(d.tab);
      }
    };
    if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', handler);
    return () => { if ('serviceWorker' in navigator) navigator.serviceWorker.removeEventListener('message', handler); };
  },[]);// eslint-disable-line — mount-only

  const flash=useCallback(msg=>{setToast(msg);setTimeout(()=>setToast(null),2200);},[]);
  // Register a global callback so top-level lsWrite/timerWrite can signal storage failures
  // (quota exceeded, storage disabled) and surface them as a toast — instead of silent loss.
  useEffect(()=>{
    window.__ps5v_storageError=(kind)=>{
      flash(t(lang, kind==='quota'?'storageQuotaErr':'storageGenericErr'));
    };
    return ()=>{ delete window.__ps5v_storageError; };
  },[lang,flash]);

  // v1.10.0 — Demo escape hatch for onboarding step 3. The Onboarding component loads
  // demo games in the background during step 1→2; if the user explicitly opts out
  // ("Zacznę od pustej kolekcji" link on currency confirm step), this hook clears them.
  // Implemented as a global hook because Onboarding doesn't have a direct setGames ref.
  useEffect(()=>{
    window.__ps5v_clearDemo=()=>{
      setGames(prev=>removeDemoGames(prev));
    };
    return ()=>{ delete window.__ps5v_clearDemo; };
  },[setGames]);

  // v1.7.0 — Achievement-unlock diff. Watches `games` and surfaces freshly-unlocked
  // achievements as a banner. Two phases:
  //   1. First-ever run (lastSeenAchRead returns null) → silent migration: persist
  //      the current unlocked set as "already seen". This prevents 5+ banners stacking
  //      up when a user upgrades from v1.6 with an existing collection that already
  //      has things unlocked. They never asked for a banner, so we don't surprise them.
  //   2. Steady state → diff current vs stored. New IDs append to achQueue.
  // Updates to lastSeenAch always include the FULL current set so achievements that
  // become re-locked (theoretically: e.g. user deletes the only platinum game) don't
  // re-trigger when they later re-unlock.
  useEffect(()=>{
    // Recompute longestStreak from current games — it's an input to streak achievements.
    const sbd=new Map();
    games.forEach(g=>{
      (g.sessions||[]).forEach(s=>{
        const k=dayKey(s.startedAt);
        if(!sbd.has(k))sbd.set(k,[]);
        sbd.get(k).push(s);
      });
    });
    const longest=computeLongestStreak(sbd);
    const current=unlockedAchievementIds(games,longest);
    const seen=lastSeenAchRead();
    if(seen===null){
      // First-ever run — silent sync, no banner. Includes upgrade from pre-v1.7.
      lastSeenAchWrite(current);
      return;
    }
    // Diff: anything in current that isn't in seen is newly unlocked.
    const added=[...current].filter(id=>!seen.has(id));
    if(added.length){
      // Preserve the order in which achievements appear in the ACHIEVEMENTS array
      // (Collector I before Collector II etc) — the unlockedAchievementIds Set
      // doesn't promise insertion order across iterations, so re-sort by definition index.
      const idx=new Map(ACHIEVEMENTS.map((a,i)=>[a.id,i]));
      added.sort((a,b)=>(idx.get(a)??999)-(idx.get(b)??999));
      setAchQueue(prev=>[...prev,...added]);
      // Persist the full current set immediately. If the user dismisses the banner
      // mid-session, the same achievements won't re-fire after a reload.
      lastSeenAchWrite(current);
    } else if(current.size!==seen.size){
      // Set shrunk (rare — game deletion or status change). Keep storage in sync
      // so that future re-unlocks fire the banner.
      lastSeenAchWrite(current);
    }
  },[games]);

  // Auto-dismiss the head of the achievement queue after 6 seconds. If user taps
  // the banner during this window, the tap handler clears the queue immediately.
  useEffect(()=>{
    if(!achQueue.length)return;
    const tm=setTimeout(()=>{
      setAchQueue(prev=>prev.slice(1));
    }, 6000);
    return ()=>clearTimeout(tm);
  },[achQueue]);

  const requestNotif=async()=>{const p=await requestNotifPerm();setNotifP(p);return p;};

  function handleSave(form){
    const isEdit=!!form.id;const id=isEdit?form.id:uid();
    // v1.7.0: stamp completedAt when modal saves with status='ukonczone' for the first time.
    // For new games: only if user explicitly picked ukonczone in the picker.
    // For edits: only if status changed FROM something else TO ukonczone (not on re-save).
    const prevGame = isEdit ? games.find(g=>g.id===id) : null;
    const wasCompleted = prevGame?.status === 'ukonczone';
    const isCompleted  = form.status === 'ukonczone';
    let completedAt = form.completedAt || null;
    if(isCompleted && !wasCompleted && !completedAt){ completedAt = new Date().toISOString(); }
    const game={...form,id,addedAt:form.addedAt||new Date().toISOString(),completedAt};
    // Fix zombie timer: if edit sets status away from 'gram' while this game's timer is active, clean it up
    if(isEdit && game.status!=='gram'){
      const t=timerRead(); if(t&&t.gameId===id) timerWrite(null);
    }
    setGames(prev=>isEdit?prev.map(g=>g.id===id?game:g):[...prev,game]);
    setModal(null);flash(isEdit?t(lang,'saved'):t(lang,'added'));
  }
  function handleDel(id){
    const title=games.find(g=>g.id===id)?.title||'';
    // Clean up timer if the deleted game had an active session
    const tmr=timerRead(); if(tmr&&tmr.gameId===id) timerWrite(null);
    setGames(prev=>prev.filter(g=>g.id!==id));
    setModal(null);flash(t(lang,'deleted',{title}));
  }
  function handleStatusChange(id,status,extra={}){
    const SM2=getSM(lang);
    // Clean up timer if status moves away from 'gram' (prevents zombie timer on status swap)
    if(status!=='gram'){
      const tmr=timerRead(); if(tmr&&tmr.gameId===id) timerWrite(null);
    }
    setGames(prev=>prev.map(g=>{
      if(g.id!==id) return g;
      // v1.7.0: stamp completedAt on transition INTO 'ukonczone' (only if not already set —
      // we don't reset it on toggle off→on, since a re-completion isn't really a new completion).
      // This is what lets Goals/Wrapped count completions accurately by date.
      const next={...g,status,...extra};
      if(status==='ukonczone' && g.status!=='ukonczone' && !next.completedAt){
        next.completedAt=new Date().toISOString();
      }
      return next;
    }));
    if(extra.hours!==undefined)flash(lang==='pl'?`✓ Sesja zapisana`:t(lang,'sessionSaved',{h:Math.floor(extra.hours),m:Math.round((extra.hours%1)*60)}));
    else flash(t(lang,'statusChanged',{status:SM2[status]?.label}));
  }
  function toggleNotify(id){
    const g=games.find(g=>g.id===id);
    if(!g)return;
    const next=!g.notifyEnabled;
    // If enabling and permission not granted, request it first
    if(next && typeof Notification!=='undefined' && Notification.permission==='default'){
      requestNotif();  // best-effort — user may decline; we still toggle the flag
    }
    setGames(prev=>prev.map(g=>g.id===id?{...g,notifyEnabled:next}:g));
    flash(next?(lang==='pl'?'🔔 Powiadomienia włączone':'🔔 Notifications enabled'):(lang==='pl'?'🔕 Powiadomienia wyłączone':'🔕 Notifications disabled'));
  }

  // Currency: silent persist (used by Onboarding initial pick — no toast on first-time setup)
  const setCurrencyPersist=useCallback((code)=>{
    if(!CURRENCIES[code]) return;
    try { localStorage.setItem(LS_CURRENCY,code); } catch{}
    setCurrencyState(code);
  },[]);
  // Currency: change from Settings — persists + emits toast
  const changeCurrency=useCallback((code)=>{
    if(!CURRENCIES[code]) return;
    try { localStorage.setItem(LS_CURRENCY,code); } catch{}
    setCurrencyState(code);
    const def=CURRENCIES[code];
    flash(t(lang,'currencyChanged',{name:(def.name[lang]||def.name.en)}));
  },[lang,flash]);

  // v1.13.2 — A4 fix: Back button intercept (Android hardware back / TWA back).
  //
  // Native pattern: pressing back in Android should pop the topmost screen,
  // and on the root screen show a "press back again to exit" toast for ~2s before
  // actually closing the app. Our PWA was just letting browser default behavior
  // close the app immediately on any back press from any screen — surprising
  // users and losing in-flight modal data.
  //
  // Implementation: on mount we push a fake history entry. The browser back button
  // pops it, firing 'popstate'. Our handler decides what to dismiss:
  //   1. innermost overlay (rateModal / privacy / import)
  //   2. Add/Edit modal
  //   3. hamburger overlay screens (settings, recommendations, etc.)
  //   4. on root with nothing open: arm exit, show toast, second press within 2s exits
  //
  // After every dismiss we re-push the fake entry so the next back press has
  // something to pop. The arm timer auto-disarms after 2s (returns to step-1 state).
  //
  // v1.13.8 — Hoisted ABOVE the `if(!onboarded) return` early return below.
  // Previously these hooks lived after the gate, so they were skipped during onboarding
  // and only mounted on the first post-onboarding render. That added 3 hooks to the
  // call list mid-lifecycle and tripped React's "Rendered more hooks than during the
  // previous render" Rules-of-Hooks check, crashing the app right after the user
  // confirmed the currency step. Hooks must be unconditionally called in the same
  // order every render — so they belong above any conditional return.
  const backExitArmed = useRef(false);
  const backDisarmTimer = useRef(null);
  useEffect(() => {
    // The back-button trap is meaningless during onboarding (the Onboarding subtree is
    // rendered above instead of <div className='app'>), so wait until the user is past
    // the gate before pushing the sentinel history entry + wiring popstate.
    if (!onboarded) return;
    // Push fake entry on mount so first back press fires popstate (not app exit)
    try { window.history.pushState({ ps5vault: true }, ''); } catch {}

    const onPop = (e) => {
      // Re-push immediately so subsequent back presses still hit our handler.
      // We do this BEFORE the dismiss so that if any dismiss is slow, we don't lose
      // the back-button trap.
      try { window.history.pushState({ ps5vault: true }, ''); } catch {}

      // Priority 1: innermost overlays (rate prompt, privacy modal, import flow)
      if (rateModal != null) { setRateModal(null); return; }
      if (privacyOpen)        { setPrivacyOpen(false); return; }
      if (importModal != null){ setImportModal(null); return; }
      // Priority 2: Add/Edit game modal
      if (modal != null)      { setModal(null); return; }
      // Priority 3: hamburger overlay screens (settings, wrapped, achievements, etc.)
      if (overlay != null)    { setOverlay(null); return; }

      // Priority 4: root screen — arm exit on first press, allow exit on second
      if (backExitArmed.current) {
        // Second press within window: actually exit. Pop our re-pushed fake entry
        // AND then go back once more — browser/TWA closes app when no history left.
        if (backDisarmTimer.current) clearTimeout(backDisarmTimer.current);
        backExitArmed.current = false;
        // history.go(-2) pops both the just-pushed fake entry and the original
        // entry, leaving an empty stack → TWA / browser closes.
        try { window.history.go(-2); } catch { try { window.history.back(); } catch {} }
        return;
      }
      backExitArmed.current = true;
      flash(t(lang,'backToExit'));
      backDisarmTimer.current = setTimeout(() => { backExitArmed.current = false; }, 2000);
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      if (backDisarmTimer.current) clearTimeout(backDisarmTimer.current);
    };
  }, [onboarded, rateModal, privacyOpen, importModal, modal, overlay, lang, flash]);

  if(!onboarded)return(<><style>{CSS}</style><Onboarding
    onSkip={()=>{setOnboarded(true);setOnboard(true);}}
    onCurrencyPick={setCurrencyPersist}
    onLoadDemo={()=>{
      // v1.10.0 — Demo loads silently in the background during step 1→2 transition.
      // We do NOT finalize onboarding here — that happens on the currency confirm step.
      // By the time the user finishes the carousel (~6s) or skips it, demo is already
      // in localStorage and games[] is populated, so currency confirm exits to a fully
      // populated Home with zero perceived latency.
      const demos=makeDemoGames();
      setGames(demos);
      flash(t(lang,'demoLoaded',{n:demos.length}));
    }}
    lang={lang}
  /></>);

  const SM2=getSM(lang);
  const upcomingCount=games.filter(g=>g.releaseDate&&daysUntil(g.releaseDate)>=0).length;

  // v1.8.0 — Compute hamburger badge triggers (red dot on ⋮ + per-row dots in MenuOverlay).
  // Three signals, each independent. UI shows a dot when ANY is true.
  // Implementation note: this runs on every render but the work is O(games.length) bounded
  // by Stats which already does the same — no perf concern.
  const menuTriggers = (() => {
    // Achievements: count current unlocked vs lastSeen count. Need longestStreak for streak achs.
    const sbd2=new Map();
    games.forEach(g=>{(g.sessions||[]).forEach(s=>{const k=dayKey(s.startedAt);if(!sbd2.has(k))sbd2.set(k,[]);sbd2.get(k).push(s);});});
    const ach=computeAchievements(games, computeLongestStreak(sbd2));
    const unlockedCount=ach.filter(a=>a.unlocked).length;
    const achTrigger = unlockedCount > menuSeen.achievementsCount;
    // Goals: any goal that completed (doneAt) OR expired (periodEnd in past, no doneAt)
    // since user last opened the manager. Both deserve attention — a finished goal feels
    // good to acknowledge, an expired one is feedback for next month.
    const lastGoalsAt = menuSeen.goalsAt ? new Date(menuSeen.goalsAt) : new Date(0);
    const now = new Date();
    const goalsTrigger = goals.some(g => {
      if (g.doneAt) return new Date(g.doneAt) > lastGoalsAt;
      return g.periodEnd && new Date(g.periodEnd) < now;
    });
    // Year-in-Review: nudge in December (month 11 zero-indexed) if user hasn't opened
    // Wrapped for the current year yet. Dot disappears the moment they tap it.
    const wrappedTrigger = now.getMonth() === 11 && menuSeen.wrappedYear !== now.getFullYear();
    return {
      achievements: achTrigger,
      goals: goalsTrigger,
      wrapped: wrappedTrigger,
      any: achTrigger || goalsTrigger || wrappedTrigger,
      // Pass current unlocked count along so MenuOverlay's onPick can mark seen
      _unlockedCount: unlockedCount,
    };
  })();
  // Mark a section as seen when user opens it from MenuOverlay. Updates LS + state.
  const markMenuSectionSeen = (section) => {
    let patch;
    if (section === 'achievements')      patch = { achievementsCount: menuTriggers._unlockedCount };
    else if (section === 'goals')        patch = { goalsAt: new Date().toISOString() };
    else if (section === 'wrapped')      patch = { wrappedYear: new Date().getFullYear() };
    else return; // 'settings' has no trigger
    setMenuSeen(menuSeenUpdate(patch));
  };
  const chips=[{k:'all',l:t(lang,'allGames')},...Object.entries(SM2).map(([k,m])=>({k,l:m.label})),{k:'sold',l:'💰 '+t(lang,'filterSold')},{k:'platinum',l:t(lang,'filterPlatinum')}];

  // v1.13.8 — back-button intercept hook moved above the `if(!onboarded) return` early
  // return earlier in this component (Rules of Hooks fix). See comment block there.

  const sortFn = {
    added:  (a,b) => 0,
    title:  (a,b) => a.title.localeCompare(b.title),
    rating: (a,b) => (b.rating??-1)-(a.rating??-1),
    hours:  (a,b) => (b.hours||0)-(a.hours||0),
    price:  (a,b) => (+b.priceBought||0)-(+a.priceBought||0),

  };
  const visible=games
    .filter(g=>flt==='all'||(flt==='sold'?g.priceSold!=null&&!!+g.priceSold:flt==='platinum'?g.platinum===true:g.status===flt))
    .filter(g=>platFilter==='all'||g.platform===platFilter)
    .filter(g=>!q||g.title.toLowerCase().includes(q.toLowerCase()))
    .sort(sortFn[sortBy]||sortFn.added);

  return(
    <>
      <style>{CSS}</style>
      <div className='app'>
        <div className='hdr'>
          <div className='htop'>
            <div className='logo'><div className='lico'>V</div><div><div className='lnm'>VAULT</div><div className='lsb'>Game Tracker</div></div></div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <button type='button' className={'hmb'+(menuTriggers.any?' hmb-pulse':'')} onClick={()=>setOverlay('menu')} aria-label={t(lang,'menuAria')} title={t(lang,'menuAria')}>
                ≡
                {menuTriggers.any && <span className='hmb-dot' aria-hidden='true'/>}
              </button>
              <button type='button' className='abtn' onClick={()=>setModal('add')}>+ {lang==='pl'?'Dodaj grę':'Add game'}</button>
            </div>
          </div>
          <div className='tabs'>
            <button type='button' className={'tab'+(tab==='home'?' on':'')} onClick={()=>setTab('home')}>{t(lang,'home')}</button>
            <button type='button' className={'tab'+(tab==='col'?' on':'')} onClick={()=>setTab('col')}>{t(lang,'collection')}</button>
            <button type='button' className={'tab'+(tab==='upc'?' on':'')} onClick={()=>setTab('upc')} style={{position:'relative'}}>{t(lang,'releases')}{upcomingCount>0&&<span className='tab-dot'/>}</button>
            <button type='button' className={'tab'+(tab==='fin'?' on':'')} onClick={()=>setTab('fin')}>{t(lang,'finance')}</button>
            <button type='button' className={'tab'+(tab==='st'?' on':'')} onClick={()=>setTab('st')}>{t(lang,'stats')}</button>
          </div>
        </div>

        {tab==='home'&&<Home games={games} onOpen={setModal} onStatusChange={handleStatusChange} onAddFirst={()=>setModal('add')} onToggleNotify={toggleNotify} lang={lang} goals={goals} onGoalsOpen={()=>setOverlay('goals')} onRecOpen={()=>setOverlay('recommendations')}/>}

        {tab==='col'&&<>
          <div className='sw'><span className='sx'>🔍</span><input className='si' value={q} onChange={e=>setQ(e.target.value)} placeholder={t(lang,'searchPlaceholder')}/></div>
          <div className='toolbar'>
            <button type='button' className='tbtn' onClick={()=>exportData(games,lang,()=>flash(lang==='pl'?'✓ Backup zapisany':'✓ Backup saved'))}>{t(lang,'export')}</button>
            <button type='button' className='tbtn' onClick={openImport}>{t(lang,'import')}</button>
          </div>
          <div className='chips'>{chips.map(ch=><button type='button' key={ch.k} className={'chip'+(flt===ch.k?' on':'')} onClick={()=>setFlt(ch.k)}>{ch.l}</button>)}</div>
          {[...new Set(games.map(g=>g.platform||'PS5'))].filter(p=>p!=='PS5').length>0&&<div className='sort-row'>
            <span className='sort-lbl'>{lang==='pl'?'Platforma:':'Platform:'}</span>
            <button type='button' className={'sort-btn'+(platFilter==='all'?' on':'')} onClick={()=>setPlatFilter('all')}>{lang==='pl'?'Wszystkie':'All'}</button>
            {[...new Set(games.map(g=>g.platform||'PS5'))].sort().map(p=>(
              <button type='button' key={p} className={'sort-btn'+(platFilter===p?' on':'')} onClick={()=>setPlatFilter(p)}>{p}</button>
            ))}
          </div>}
          <div className='sort-row'>
            <span className='sort-lbl'>{t(lang,'sortBy')}</span>
            {[['added',t(lang,'sortAdded')],['title',t(lang,'sortTitle')],['rating',t(lang,'sortRating')],['hours',t(lang,'sortHours')],['price',t(lang,'sortPrice')]].map(([k,l])=>(
              <button type='button' key={k} className={'sort-btn'+(sortBy===k?' on':'')} onClick={()=>setSortBy(k)}>{l}</button>
            ))}
          </div>
          <div className='lst'>
            {visible.length===0
              ?<div className='empty'><div className='eic'>🎮</div><div className='ett'>{q?t(lang,'noResults'):t(lang,'noGames')}</div><div className='ess'>{q?t(lang,'noResultsFor',{q}):t(lang,'addFirst')}</div>{!q&&<button className='empty-cta' onClick={()=>setModal('add')}>{t(lang,'addGame')}</button>}</div>
              :visible.map(g=>{const m=SM2[g.status]||SM2.planuje;const roi=g.priceSold!=null?+(g.priceSold||0) - +(g.priceBought||0):null;return(
                <div key={g.id} className='gc' style={{'--c':m.c,'--bg':m.bg}} onClick={()=>setModal(g)}>
                  {g.cover?<div className='gcov' style={{backgroundImage:`url(${g.cover})`}}/>:<div className='gcov0'><div className='gab'>{g.abbr||'??'}</div></div>}
                  <div className='gcnt'>
                    <div className='gbdy'><div className='gtt'>{g.title}</div><div className='gmt'><span className='gsb'>{m.label}</span>{g.platform&&g.platform!=='PS5'&&<span className='gmp' style={{color:G.org}}>🎮 {g.platform}</span>}{g.genre&&<span className='gmp'>{g.genre}</span>}{g.year&&<span className='gmp'>📅{g.year}</span>}{!!g.hours&&<span className='gmp'>⏱{fmtHours(g.hours,{compact:true})}</span>}<ReleaseBadge releaseDate={g.releaseDate} lang={lang}/></div></div>
                    <div className='grt'>
                      {g.rating!=null?<><span className='grn'>{g.rating}</span><span className='grd'>/10</span></>:<span style={{color:G.dim,fontSize:17}}>—</span>}
                      {g.notifyEnabled&&<span style={{fontSize:12}}>🔔</span>}
                      {g.status==='psplus'&&<span style={{fontSize:11,fontWeight:700,color:G.gld}}>PS+</span>}
                      {g.platinum&&<span style={{fontSize:13}} title={t(lang,'platinum')}>🏆</span>}
                      {!!+g.extraSpend&&<span style={{fontSize:10,color:G.red,fontWeight:700}}>+{pln(+g.extraSpend,lang)} DLC</span>}
                      {roi!==null?<span className={'gprice-roi '+(roi>=0?'roi-pos':'roi-neg')}>{roi>=0?'+':''}{pln(roi,lang)}</span>:!!+g.priceBought&&<span className='gprice'>{pln(+g.priceBought,lang)}</span>}
                      {g.status==='ukonczone'&&g.rating==null&&<span style={{fontSize:11,color:G.gld,cursor:'pointer',fontWeight:700}} onClick={e=>{e.stopPropagation();setRateModal({id:g.id,title:g.title});}} title={t(lang,'rateGame')}>★?</span>}
                    </div>
                  </div>
                </div>
              );})
            }
          </div>
        </>}

        {tab==='upc'&&<Upcoming games={games} onOpen={setModal} onToggleNotify={toggleNotify} onStatusChange={handleStatusChange} notifPerm={notifPerm} onRequestNotif={requestNotif} lang={lang}/>}
        {tab==='fin'&&<Finance games={games} lang={lang}/>}
        {tab==='st'&&<Stats games={games} lang={lang}/>}
        {/* v1.5.0 — Settings/Achievements/Goals/Wrapped now live behind hamburger menu (see overlays below) */}

        {modal&&<Modal game={modal==='add'?null:modal} onSave={handleSave} onDel={handleDel} onClose={()=>setModal(null)} notifPerm={notifPerm} onRequestNotif={requestNotif} lang={lang} flash={flash}/>}
        <Toast msg={toast}/>
        {achQueue.length>0 && (
          <AchievementBanner
            ach={getAchievementById(achQueue[0])}
            queueLen={achQueue.length}
            onTap={()=>{ setAchQueue([]); setOverlay('achievements'); }}
            onDismiss={()=>setAchQueue(prev=>prev.slice(1))}
            lang={lang}
          />
        )}

        {importModal && (
          <ImportModal
            onClose={closeImport}
            mode={importModal.mode}
            onPickMode={(m)=>{
              if(m==='merge'){
                // Merge mode — open file picker directly, no confirmation needed
                setImportModal({mode:'merge',file:null});
              } else {
                // Replace mode — open file picker, then show confirmation
                setImportModal({mode:'replace',file:null});
              }
            }}
            pendingFile={importModal.file}
            onPickFile={(file)=>{
              if(importModal.mode==='merge'){
                // Execute merge immediately
                importMerge(file,games,(merged,added,dupes)=>{
                  setGames(merged);
                  closeImport();
                  if(dupes===0){
                    flash(t(lang,'importedMergeNoSkip',{added}));
                  } else {
                    flash(t(lang,'importedMerge',{added,dupes}));
                  }
                },err=>{closeImport();flash('❌ '+err);});
              } else {
                // Replace — stash file, show confirmation
                setImportModal(prev=>({...prev,file}));
              }
            }}
            onConfirmReplace={()=>{
              const file=importModal.file;
              if(!file)return;
              importReplace(file,(games2,n)=>{
                setGames(games2);
                closeImport();
                flash(t(lang,'importedReplace',{n}));
              },err=>{closeImport();flash('❌ '+err);});
            }}
            games={games}
            lang={lang}
          />
        )}

        {rateModal&&(
          <div className='rate-modal' onClick={()=>setRateModal(null)}>
            <div className='rate-box' onClick={e=>e.stopPropagation()}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:12,fontWeight:700,color:G.blu,marginBottom:8,textAlign:'center'}}>{rateModal.title}</div>
              <div className='rate-title'>{t(lang,'ratingQuick')}</div>
              <div className='rate-stars'>
                {[1,2,3,4,5,6,7,8,9,10].map(n=>(
                  <button key={n} type='button' className={'rate-star'+(rateModal.val===n?' on':'')}
                    onClick={()=>setRateModal(p=>({...p,val:n}))}>
                    {n}
                  </button>
                ))}
              </div>
              <div className='rate-btns'>
                <button type='button' className='confirm-no' onClick={()=>setRateModal(null)}>{t(lang,'rateSkip')}</button>
                <button type='button' className='confirm-yes' style={{background:G.gld,color:'#000'}}
                  onClick={()=>{
                    if(rateModal.val){
                      setGames(prev=>prev.map(g=>g.id===rateModal.id?{...g,rating:rateModal.val}:g));
                      flash('⭐ '+rateModal.val+'/10');
                    }
                    setRateModal(null);
                  }}>{t(lang,'rateSave')}</button>
              </div>
            </div>
          </div>
        )}

        {privacyOpen&&(
          <div className='rate-modal' onClick={()=>setPrivacyOpen(false)}>
            <div onClick={e=>e.stopPropagation()} style={{background:G.card2,border:`1px solid ${G.bdr}`,borderRadius:18,padding:'22px 20px 18px',maxWidth:480,width:'100%',animation:'scaleIn .2s ease'}}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:700,color:G.blu,marginBottom:10,textAlign:'center'}}>{t(lang,'privacyTitle')}</div>
              <div style={{display:'inline-block',alignSelf:'center',background:'rgba(57,255,110,.1)',border:'1px solid rgba(57,255,110,.3)',color:'#39FF6E',fontSize:11,fontWeight:700,padding:'4px 12px',borderRadius:20,marginBottom:14,width:'fit-content',marginLeft:'auto',marginRight:'auto'}}>
                <div style={{display:'flex',justifyContent:'center'}}>{t(lang,'privacyBadge')}</div>
              </div>
              {/* v1.5.0 — Single-paragraph privacy summary; full policy linked out to privacy.html */}
              <div style={{fontSize:13,color:G.txt,lineHeight:1.6,marginBottom:16,textAlign:'left'}}>{t(lang,'privacyMiniBody')}</div>
              <a href='https://matiseekk-dot.github.io/Games/privacy.html' target='_blank' rel='noopener noreferrer' style={{display:'block',fontSize:13,fontWeight:700,color:G.blu,textDecoration:'none',padding:'10px',background:'rgba(0,212,255,.08)',border:'1px solid rgba(0,212,255,.3)',borderRadius:10,textAlign:'center',marginBottom:10}}>{t(lang,'privacyMiniLink')}</a>
              <div style={{fontSize:10,color:G.dim,textAlign:'center',marginBottom:14}}>{t(lang,'privacyUpdated')}</div>
              <button type='button' onClick={()=>setPrivacyOpen(false)} style={{padding:'12px',background:G.blu,color:'#000',border:'none',borderRadius:10,fontWeight:700,fontSize:14,cursor:'pointer',width:'100%'}}>{t(lang,'privacyClose')}</button>
            </div>
          </div>
        )}

        {/* v1.5.0 — Hamburger menu + secondary screens */}
        {overlay==='menu' && (
          <MenuOverlay
            onClose={()=>setOverlay(null)}
            onPick={key=>{ markMenuSectionSeen(key); setOverlay(key); }}
            lang={lang}
            currentYear={new Date().getFullYear()}
            achStats={(()=>{const sbd=new Map();collectSessions(games).forEach(s=>{const k=s.dateKey;if(!sbd.has(k))sbd.set(k,[]);sbd.get(k).push(s);});const ach=computeAchievements(games, computeLongestStreak(sbd));return {unlocked:ach.filter(a=>a.unlocked).length, total:ach.length};})()}
            goalStats={{active:goals.filter(g=>!g.doneAt).length, done:goals.filter(g=>!!g.doneAt).length}}
            triggers={menuTriggers}
          />
        )}
        {overlay==='wrapped' && (
          <YearInReview games={games} lang={lang} onClose={()=>setOverlay('menu')} flash={flash}/>
        )}
        {overlay==='achievements' && (() => {
          // Compute longest streak from sessionsByDay for streak achievements
          const sbd=new Map();
          collectSessions(games).forEach(s=>{const k=s.dateKey;if(!sbd.has(k))sbd.set(k,[]);sbd.get(k).push(s);});
          const longest=computeLongestStreak(sbd);
          return <Achievements games={games} longestStreak={longest} lang={lang} onClose={()=>setOverlay('menu')}/>;
        })()}
        {overlay==='goals' && (
          <GoalsManager
            goals={goals}
            setGoals={setGoals}
            games={games}
            sessions={collectSessions(games)}
            lang={lang}
            flash={flash}
            onClose={()=>setOverlay(null)}
          />
        )}
        {overlay==='recommendations' && (
          <Recommendations
            games={games}
            lang={lang}
            onClose={()=>setOverlay(null)}
            onAdd={rec=>{
              // v1.9.0 — Pre-fill add modal from a recommendation. The pre-fill object
              // intentionally omits `id` so Modal treats this as a NEW game (isEdit=false),
              // but carries `rawgId` so the new game can itself become a Recommendations seed.
              setOverlay(null);
              setModal({
                title: rec.title,
                cover: rec.cover || '',
                year: rec.year || new Date().getFullYear(),
                genre: rec.genre || '',
                releaseDate: rec.releaseDate || '',
                abbr: rec.abbr || mkAbbr(rec.title),
                rawgId: rec.id || null,
                // pre-fill targetHours from RAWG playtime (same as fill() in Modal)
                targetHours: +rec.playtime || '',
              });
            }}
          />
        )}
        {overlay==='wipe' && (
          <WipeConfirm
            games={games}
            lang={lang}
            onClose={()=>setOverlay('settings')}
          />
        )}
        {overlay==='settings' && (
          <div className='bs-ovr'>
            <div className='bs-hdr'>
              <div className='bs-ttl'>⚙️ {t(lang,'settings').replace(/^[^\s]+\s/,'')}</div>
              <button type='button' className='bs-x' onClick={()=>setOverlay('menu')} aria-label={t(lang,'cancel')}>✕</button>
            </div>
            <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch'}}>
              <Settings games={games} setGames={setGames} flash={flash} lang={lang} setLang={setLang} currency={currency} setCurrency={changeCurrency} openImport={openImport} openPrivacy={()=>setPrivacyOpen(true)} onWipeOpen={()=>setOverlay('wipe')}/>
              <div style={{padding:'0 16px 8px'}}>
                <div style={{fontSize:10,fontWeight:700,color:G.org,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:10,marginTop:4}}>{t(lang,'budget')}</div>
                <div style={{background:G.card,border:'1px solid '+G.bdr,borderRadius:14,padding:14}}>
                  <BudgetEditor budget={budget} setBudget={setBudget} games={games} flash={flash} lang={lang}/>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
