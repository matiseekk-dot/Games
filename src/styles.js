// CSS as a template literal. Imports G to interpolate theme colors at evaluation time
// (keeps everything in one consistent palette source). Mounted in App.jsx via <style>{CSS}</style>.
//
// Heavy file (~390 lines) — extracted from App.jsx in the v1.6 refactor.
import { G } from './constants.js';

export const CSS = `
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
/* v1.13.2 — A3 fix: disable pull-to-refresh on body. Without this, swipe-down on
   any modal at scroll-top (or any page when scrolled to top) triggers browser's
   pull-to-refresh, reloading the app and losing in-flight modal data. */
body{overflow-x:hidden;max-width:100%;background:${G.bg};color:${G.txt};font-family:'Syne',sans-serif;-webkit-font-smoothing:antialiased;overscroll-behavior:none}
#root{overflow-x:hidden;max-width:100%}
/* v1.13.6 — A4 fix: min-height → height + overflow:hidden, so flex children with overflow-y:auto
   actually scroll instead of letting .app expand past viewport (was breaking scroll on Android TWA). */
.app{display:flex;flex-direction:column;height:100dvh;max-height:100dvh;max-width:100%;overflow:hidden}

/* v1.13.6 — flex-shrink:0 so header keeps its full height even when .app is fixed-height. */
.hdr{flex-shrink:0;overflow:hidden;padding-top:calc(env(safe-area-inset-top,0px) + 44px);padding-bottom:12px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
.htop{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:14px}
.logo{display:flex;align-items:center;gap:10px;min-width:0}
.lico{width:34px;height:34px;flex-shrink:0;border-radius:9px;background:linear-gradient(135deg,${G.blu},#0060FF);display:flex;align-items:center;justify-content:center;font-family:'Orbitron',monospace;font-size:20px;font-weight:900;color:#fff;box-shadow:0 0 12px rgba(0,212,255,.35)}
.lnm{font-family:'Orbitron',monospace;font-size:15px;font-weight:700;letter-spacing:.1em;white-space:nowrap}
.lsb{font-size:10px;color:${G.dim};letter-spacing:.2em;text-transform:uppercase}
/* v1.13.2 — A2 fix: padding 0 14px → 4px 14px + line-height:1.4 so descenders
   ("g" in "grę"/"game") are not clipped. Issue: tightly-fitted flex container with
   default line-height was cropping the lower portion of descender glyphs. */
/* v1.13.2 — A2 fix: replaced fixed height:44px + padding:4px with min-height:48 +
   padding:13px 14px 14px. Existing 4px top/bottom padding wasn't enough room for
   descenders in "grę"/"game" (letters g, j, p, q, y) at font-size:14 + line-height:1.4.
   New layout: 14px font * 1.4 lh = 19.6px content, 13+14 padding = 27px, total ≥48px. */
.abtn{min-height:48px;flex-shrink:0;border:none;border-radius:10px;background:linear-gradient(135deg,${G.blu},#0060FF);color:#fff;font-size:14px;font-weight:700;font-family:'Syne',sans-serif;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:13px 14px 14px;gap:6px;white-space:nowrap;line-height:1.4}
.abtn:active{opacity:.7;transform:scale(.95)}

.tabs{display:flex;gap:2px;background:${G.card};border:1px solid ${G.bdr};border-radius:13px;padding:4px}
/* v1.13.2 — A1 fix: bumped tab font from 9px → 11px (+22%) and min-height 42→46 to better
   match Material Design 14sp/48dp recommendation. Cannot hit 14sp exactly with 5 tabs on
   narrow screens (would clip "Premiery"/"Releases"), but +22% font is significant readability win. */
.tab{flex:1;min-height:46px;padding:8px 2px;border:none;border-radius:9px;background:transparent;color:${G.dim};font-family:'Syne',sans-serif;font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap;position:relative;line-height:1.3;transition:all .18s}
.tab.on{background:rgba(0,212,255,.15);color:${G.blu}}
.tab-dot{position:absolute;top:5px;right:4px;width:5px;height:5px;border-radius:50%;background:${G.org};animation:pulse 1.5s infinite}

/* v1.13.6 — min-height:0 unlocks flex-child overflow scroll (default min-height:auto blocks it).
   v1.13.7 — Android TWA: env(safe-area-inset-bottom) returns 0 (no edge-to-edge), so fixed 24px
   padding leaves last ~50-70px of content under the system nav bar. max(...,80px) guarantees the
   content always clears the nav bar — on iPhone PWA, env() is non-zero so the calc-branch wins. */
.scr{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;padding:8px 16px max(calc(env(safe-area-inset-bottom,0px) + 24px), 80px);max-width:100%;animation:tabSlide .2s ease;overscroll-behavior:contain}

.hcard{background:${G.card};border:1px solid ${G.bdr};border-radius:16px;padding:16px;margin-bottom:12px;overflow:hidden;max-width:100%;animation:fadeIn .3s ease}
.hcard-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.hcard-title{font-size:10px;font-weight:700;color:${G.dim};letter-spacing:.1em;text-transform:uppercase;display:flex;align-items:center;gap:6px}
.hcard-badge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:6px}
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
/* v1.13.6 — flex-shrink:0 on all .app's row-children (search/toolbar/chips/sort) so .lst
   gets the full remaining flex:1 height instead of every row being squeezed proportionally. */
.sw{flex-shrink:0;position:relative;padding:10px 16px 6px}
.si{display:block;width:100%;background:${G.card};border:1px solid ${G.bdr};border-radius:12px;padding:11px 12px 11px 36px;color:${G.txt};font-family:'Syne',sans-serif;font-size:16px;outline:none;-webkit-appearance:none}
.si:focus{border-color:${G.blu}}
.sx{position:absolute;left:28px;top:50%;transform:translateY(-50%);pointer-events:none}
.chips{flex-shrink:0;display:flex;gap:6px;padding:6px 16px 10px;overflow-x:auto;-webkit-overflow-scrolling:touch}
.chips::-webkit-scrollbar{display:none}
.chip{padding:7px 14px;border-radius:20px;border:1px solid ${G.bdr};background:${G.card};color:${G.dim};font-size:11px;font-weight:600;white-space:nowrap;flex-shrink:0;cursor:pointer;transition:all .15s}
.chip.on{border-color:${G.blu};color:${G.blu};background:rgba(0,212,255,.1)}
.chip.sold-on{border-color:${G.grn};color:${G.grn};background:rgba(57,255,110,.1)}
.toolbar{flex-shrink:0;display:flex;gap:8px;padding:0 16px 8px;justify-content:flex-end}
.tbtn{padding:6px 12px;border:1px solid ${G.bdr};border-radius:8px;background:${G.card};color:${G.dim};font-family:'Syne',sans-serif;font-size:11px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px}
.sort-row{flex-shrink:0;display:flex;gap:6px;padding:0 16px 8px;overflow-x:auto;-webkit-overflow-scrolling:touch;align-items:center}
.sort-row::-webkit-scrollbar{display:none}
.sort-lbl{font-size:10px;color:${G.dim};font-weight:600;white-space:nowrap;flex-shrink:0}
.sort-btn{padding:5px 10px;border-radius:16px;border:1px solid ${G.bdr};background:${G.card};color:${G.dim};font-size:10px;font-weight:600;white-space:nowrap;flex-shrink:0;cursor:pointer;transition:all .15s}
.sort-btn.on{border-color:${G.pur};color:${G.pur};background:rgba(167,139,250,.1)}
.rate-modal{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(4,6,14,.88);z-index:19999;display:flex;align-items:center;justify-content:center;padding:20px}
.rate-box{background:${G.card2};border:1px solid ${G.bdr};border-radius:18px;padding:24px 20px;max-width:320px;width:100%;animation:scaleIn .2s ease}
.rate-title{font-size:14px;color:${G.dim};margin-bottom:12px;text-align:center}
.rate-stars{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:16px}
.rate-star{width:42px;height:42px;border-radius:10px;border:1px solid ${G.bdr};background:${G.card};color:${G.txt};font-family:'Orbitron',monospace;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .12s}
.rate-star.on{border-color:${G.gld};background:rgba(255,209,102,.15);color:${G.gld}}
.rate-btns{display:flex;gap:8px}
/* v1.13.6 — min-height:0 unlocks flex-child overflow scroll (same as .scr).
   v1.13.7 — same nav-bar clearance as .scr. */
.lst{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;padding:4px 16px max(calc(env(safe-area-inset-bottom,0px) + 24px), 80px)}
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
.grd{font-size:10px;color:${G.dim}}
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
.fkgd{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px}
.fkcd{border-radius:13px;padding:14px;overflow:hidden;border:1px solid ${G.bdr}}
.fkv{font-family:'Orbitron',monospace;font-size:13px;font-weight:900;color:var(--c);line-height:1;margin-bottom:4px}
.fkl{font-size:9px;color:${G.dim};font-weight:600;letter-spacing:.07em;text-transform:uppercase}
.ins-card{border-radius:13px;padding:14px;margin-bottom:10px;border:1px solid transparent;animation:fadeIn .35s ease}
.ovr{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(4,6,14,.9);z-index:9999;display:flex;align-items:flex-end}
.mdl{width:100%;overflow:visible;overflow-y:auto;-webkit-overflow-scrolling:touch;background:${G.card2};border-top:1px solid ${G.bdr};border-radius:20px 20px 0 0;padding:18px 16px max(calc(env(safe-area-inset-bottom,0px) + 24px), 80px);max-height:90dvh;animation:slideUp .22s ease;overscroll-behavior:contain}
.mhdl{width:32px;height:4px;background:${G.bdr};border-radius:2px;margin:0 auto 16px}
.mttl{font-family:'Orbitron',monospace;font-size:13px;font-weight:700;color:${G.blu};letter-spacing:.06em;margin-bottom:16px}
.rwrp{position:relative;margin-bottom:12px}
.rlbl{display:block;font-size:9px;font-weight:700;color:${G.dim};letter-spacing:.1em;text-transform:uppercase;margin-bottom:5px}
.rrow{display:flex;gap:6px;align-items:center;overflow:hidden}
.rin{flex:1;min-width:0;display:block;background:${G.bg};border:1px solid ${G.blu};border-radius:9px;padding:10px 11px;color:${G.txt};font-family:'Syne',sans-serif;font-size:16px;outline:none;-webkit-appearance:none}
.rin::placeholder{color:${G.dim}}
.rbdg2{font-size:10px;font-weight:700;padding:4px 8px;border-radius:6px;background:rgba(0,212,255,.15);color:${G.blu};flex-shrink:0;white-space:nowrap}
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
.toast{position:fixed;bottom:calc(env(safe-area-inset-bottom,0px) + 32px);left:50%;transform:translateX(-50%);font-family:'Orbitron',monospace;font-size:11px;font-weight:700;padding:10px 18px;border-radius:14px;z-index:99999;max-width:calc(100vw - 32px);white-space:normal;text-align:center;line-height:1.45;pointer-events:none;animation:toastIn .25s ease;display:flex;align-items:center;gap:6px}
.toast-ok{background:${G.grn};color:#000}
.toast-err{background:${G.red};color:#fff}
.toast-info{background:${G.blu};color:#000}
/* v1.7.0 — Achievement unlock banner. Top-of-screen, dismissible, gold accent for rare. */
.ach-banner{position:fixed;top:calc(env(safe-area-inset-top,0px) + 12px);left:12px;right:12px;z-index:99998;display:flex;align-items:center;gap:12px;padding:12px 14px;background:linear-gradient(135deg,${G.card2},${G.card});border:1px solid ${G.blu};border-radius:14px;box-shadow:0 8px 32px rgba(0,212,255,.35),0 0 0 1px rgba(0,212,255,.2) inset;animation:achBannerIn .35s cubic-bezier(.2,.7,.3,1.2);cursor:pointer;max-width:480px;margin:0 auto}
.ach-banner.rare{border-color:${G.gld};box-shadow:0 8px 32px rgba(255,209,102,.4),0 0 0 1px rgba(255,209,102,.25) inset}
.ach-banner-ico{font-size:28px;flex-shrink:0;filter:drop-shadow(0 0 12px rgba(0,212,255,.5))}
.ach-banner.rare .ach-banner-ico{filter:drop-shadow(0 0 14px rgba(255,209,102,.6))}
.ach-banner-body{flex:1;min-width:0}
.ach-banner-lbl{font-family:'Orbitron',monospace;font-size:9px;font-weight:700;color:${G.blu};text-transform:uppercase;letter-spacing:.12em;margin-bottom:2px}
.ach-banner.rare .ach-banner-lbl{color:${G.gld}}
.ach-banner-ttl{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:${G.txt};line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ach-banner-cnt{font-family:'Orbitron',monospace;font-size:11px;font-weight:700;color:${G.dim};margin-left:6px}
.ach-banner-x{flex-shrink:0;width:28px;height:28px;border:none;border-radius:50%;background:rgba(255,255,255,.06);color:${G.dim};font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center}
.ach-banner-x:active{transform:scale(.92)}
@keyframes achBannerIn{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}
.confirm-ovr{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(4,6,14,.88);z-index:19999;display:flex;align-items:center;justify-content:center;padding:20px}
.confirm-box{background:${G.card2};border:1px solid ${G.bdr};border-radius:18px;padding:24px 20px;max-width:320px;width:100%;animation:scaleIn .2s ease}
.confirm-ico{font-size:36px;text-align:center;margin-bottom:12px}
.confirm-title{font-size:16px;font-weight:700;text-align:center;margin-bottom:8px}
.confirm-body{font-size:13px;color:${G.dim};text-align:center;line-height:1.5;margin-bottom:20px}
.confirm-btns{display:flex;gap:8px}
.confirm-yes{flex:1;padding:13px;border:none;border-radius:11px;background:${G.red};color:#fff;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;cursor:pointer}
.confirm-no{flex:1;padding:13px;border:1px solid ${G.bdr};border-radius:11px;background:${G.card};color:${G.dim};font-family:'Syne',sans-serif;font-size:13px;font-weight:600;cursor:pointer}
.onboard{position:fixed;inset:0;background:${G.bg};z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px;text-align:center}
.ob-logo{width:80px;height:80px;border-radius:22px;background:linear-gradient(135deg,${G.blu},#0060FF);display:flex;align-items:center;justify-content:center;font-family:'Orbitron',monospace;font-size:48px;font-weight:900;color:#fff;margin:0 auto 24px;box-shadow:0 0 40px rgba(0,212,255,.4);animation:scaleIn .5s ease}
.ob-title{font-family:'Orbitron',monospace;font-size:24px;font-weight:900;color:${G.txt};margin-bottom:8px;letter-spacing:.06em}
.ob-sub{font-size:14px;color:${G.dim};line-height:1.6;margin-bottom:24px;max-width:280px}
.ob-features{display:flex;flex-direction:column;gap:10px;margin-bottom:28px;width:100%;max-width:300px}
.ob-feat{display:flex;align-items:center;gap:12px;text-align:left;background:${G.card};border:1px solid ${G.bdr};border-radius:12px;padding:11px 14px}
.ob-feat-ico{font-size:20px;flex-shrink:0;width:28px;text-align:center}
.ob-feat-title{font-size:13px;font-weight:700;margin-bottom:1px}
.ob-feat-desc{font-size:11px;color:${G.dim}}
/* v1.10.0 — Onboarding flip: features carousel (single card auto-advance) */
.ob-carousel{position:relative}
.ob-carousel-skip{position:absolute;top:calc(env(safe-area-inset-top,0px) + 16px);right:20px;background:transparent;border:none;color:${G.dim};font-family:'Syne',sans-serif;font-size:13px;font-weight:600;cursor:pointer;padding:6px 10px;text-decoration:underline;text-underline-offset:3px}
.ob-carousel-card{display:flex;flex-direction:column;align-items:center;text-align:center;max-width:320px;animation:obCarFade .4s ease}
.ob-carousel-ico{font-size:64px;margin-bottom:18px;filter:drop-shadow(0 0 24px rgba(0,212,255,.5))}
.ob-carousel-title{font-family:'Orbitron',monospace;font-size:22px;font-weight:900;color:${G.txt};margin-bottom:10px;letter-spacing:.06em;line-height:1.2}
.ob-carousel-desc{font-size:14px;color:${G.dim};line-height:1.6;margin-bottom:32px}
.ob-carousel-dots{display:flex;gap:8px;margin-top:8px}
.ob-carousel-dot{width:8px;height:8px;border-radius:50%;background:${G.bdr};transition:all .25s}
.ob-carousel-dot.on{background:${G.blu};width:24px;border-radius:4px;box-shadow:0 0 8px rgba(0,212,255,.5)}
@keyframes obCarFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.ob-start{width:100%;max-width:300px;padding:16px;border:none;border-radius:14px;background:linear-gradient(135deg,${G.blu},#0060FF);color:#fff;font-family:'Orbitron',monospace;font-size:13px;font-weight:700;letter-spacing:.08em;cursor:pointer;box-shadow:0 0 24px rgba(0,212,255,.4)}
.cur-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;max-width:320px;margin-bottom:18px}
.cur-btn{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:12px 8px;border-radius:11px;border:1px solid ${G.bdr};background:${G.card};color:${G.dim};font-family:'Syne',sans-serif;cursor:pointer;transition:all .15s;min-height:64px}
.cur-btn:active{transform:scale(.98)}
.cur-btn.on{border-color:${G.blu};background:rgba(0,212,255,.1);color:${G.txt}}
.cur-btn-sym{font-family:'Orbitron',monospace;font-size:18px;font-weight:900;color:${G.txt}}
.cur-btn-code{font-size:11px;font-weight:700;letter-spacing:.08em}
.cur-btn-name{font-size:10px;color:${G.dim};line-height:1.2;text-align:center}
.cur-btn.on .cur-btn-code{color:${G.blu}}
/* v1.7.0 onboard step 3 — demo data prompt */
.ob-demo-list{width:100%;max-width:320px;background:${G.card};border:1px solid ${G.bdr};border-radius:12px;padding:14px 16px;margin-bottom:14px}
.ob-demo-row{display:flex;align-items:center;gap:8px;padding:6px 0;font-family:'Syne',sans-serif;font-size:13px;color:${G.txt}}
.ob-demo-bullet{color:${G.blu};font-weight:900}
.ob-demo-note{width:100%;max-width:320px;font-size:11px;color:${G.dim};text-align:center;margin-bottom:14px;padding:0 8px;line-height:1.5}
.cur-select{width:100%;padding:11px 12px;border-radius:10px;border:1px solid ${G.bdr};background:${G.card};color:${G.txt};font-family:'Syne',sans-serif;font-size:13px;font-weight:600;cursor:pointer;appearance:none;background-image:linear-gradient(45deg,transparent 50%,${G.dim} 50%),linear-gradient(135deg,${G.dim} 50%,transparent 50%);background-position:calc(100% - 18px) 50%,calc(100% - 13px) 50%;background-size:5px 5px;background-repeat:no-repeat;padding-right:34px}
.set-section{margin-bottom:20px}
.set-section-title{font-size:9px;font-weight:700;color:${G.dim};letter-spacing:.12em;text-transform:uppercase;padding:0 4px;margin-bottom:8px}
.set-row{display:flex;align-items:center;background:${G.card};border:1px solid ${G.bdr};border-radius:12px;padding:14px;margin-bottom:6px;cursor:pointer;transition:border-color .15s}
.set-row:active{border-color:${G.blu}}
.set-row-ico{font-size:20px;flex-shrink:0;margin-right:12px}
.set-row-body{flex:1}
.set-row-title{font-size:14px;font-weight:600}
.set-row-desc{font-size:11px;color:${G.dim};margin-top:2px}
.set-row-arrow{color:${G.dim};font-size:14px}
.set-badge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:6px;background:rgba(0,212,255,.12);color:${G.blu}}
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

/* v1.3.0 — Barcode scanner */
.rscan{flex-shrink:0;width:38px;height:38px;border:1px solid ${G.blu};border-radius:9px;background:rgba(0,212,255,.08);color:${G.blu};font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;transition:transform .12s,background .12s}
.rscan:active{transform:scale(.92);background:rgba(0,212,255,.2)}
/* v1.4.0 — Quick add accordion */
.acc-btn{width:100%;padding:11px 14px;margin:6px 0 12px;border:1px dashed ${G.bdr};border-radius:10px;background:transparent;color:${G.dim};font-family:'Syne',sans-serif;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:color .15s,border-color .15s,background .15s}
.acc-btn:hover,.acc-btn:active{color:${G.blu};border-color:${G.blu};background:rgba(0,212,255,.04)}
.acc-body{animation:fadeIn .2s ease}
.fhnt{font-size:10px;color:${G.dim};margin-top:4px;line-height:1.4}
.bs-ovr{position:fixed;inset:0;background:#000;z-index:199999;display:flex;flex-direction:column;animation:fadeIn .18s ease;overscroll-behavior:contain}
.bs-hdr{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:max(12px,env(safe-area-inset-top,0px)) 14px 10px;background:${G.bg};border-bottom:1px solid ${G.bdr};padding-left:max(14px,env(safe-area-inset-left,0px));padding-right:max(14px,env(safe-area-inset-right,0px))}
.bs-ttl{font-family:'Orbitron',monospace;font-size:12px;font-weight:700;color:${G.blu};letter-spacing:.06em;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bs-x{flex-shrink:0;width:38px;height:38px;border-radius:50%;border:1px solid ${G.bdr};background:${G.card};color:${G.txt};font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1}
.bs-x:active{opacity:.7}
.bs-vid{flex:1;min-height:200px;position:relative;background:#000;overflow:hidden}
.bs-vid video{width:100%;height:100%;object-fit:cover;display:block}
.bs-frm{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:78%;max-width:340px;aspect-ratio:16/8;border:2px solid ${G.blu};border-radius:14px;box-shadow:0 0 0 9999px rgba(0,0,0,.45);pointer-events:none}
.bs-frm::before,.bs-frm::after{content:'';position:absolute;width:22px;height:22px;border:3px solid ${G.blu};pointer-events:none}
.bs-frm::before{top:-3px;left:-3px;border-right:none;border-bottom:none;border-radius:14px 0 0 0}
.bs-frm::after{bottom:-3px;right:-3px;border-left:none;border-top:none;border-radius:0 0 14px 0}
.bs-laser{position:absolute;left:6%;right:6%;top:50%;height:2px;background:linear-gradient(90deg,transparent,${G.blu},transparent);box-shadow:0 0 12px ${G.blu};animation:bsLaser 1.6s ease-in-out infinite;pointer-events:none}
@keyframes bsLaser{0%,100%{transform:translateY(-32px);opacity:.3}50%{transform:translateY(32px);opacity:1}}
.bs-hint{position:absolute;left:0;right:0;bottom:14px;text-align:center;font-size:12px;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.95);padding:0 18px;pointer-events:none;font-weight:600}
.bs-pn{padding:14px 16px max(calc(env(safe-area-inset-bottom,0px) + 16px), 80px);background:${G.card2};border-top:1px solid ${G.bdr};max-height:60dvh;overflow-y:auto;-webkit-overflow-scrolling:touch}
.bs-st{display:flex;align-items:center;gap:11px;padding:11px 12px;background:${G.bg};border:1px solid ${G.bdr};border-radius:10px;margin-bottom:10px}
.bs-spin{flex-shrink:0;display:inline-block;font-size:18px;animation:spin .8s linear infinite}
.bs-stxt{flex:1;min-width:0}
.bs-stitle{font-size:13px;font-weight:700;color:${G.txt};white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bs-sdesc{font-size:11px;color:${G.dim};margin-top:2px;word-break:break-all}
.bs-cached{display:inline-block;font-size:10px;font-weight:700;color:${G.grn};margin-left:6px;padding:1px 5px;border-radius:4px;background:rgba(57,255,110,.1);vertical-align:middle}
.bs-err{padding:13px 14px;background:rgba(255,77,109,.07);border:1px solid rgba(255,77,109,.3);border-radius:10px;margin-bottom:10px}
.bs-err.warn{background:rgba(255,159,28,.07);border-color:rgba(255,159,28,.3)}
.bs-err-h{font-size:13px;font-weight:700;color:${G.red};margin-bottom:4px}
.bs-err.warn .bs-err-h{color:${G.org}}
.bs-err-d{font-size:11px;color:${G.dim};line-height:1.5}
.bs-mlbl{font-size:9px;font-weight:700;color:${G.dim};letter-spacing:.1em;text-transform:uppercase;margin:14px 0 6px}
.bs-mrow{display:flex;gap:6px}
.bs-mrow input{flex:1;min-width:0;background:${G.bg};border:1px solid ${G.bdr};border-radius:9px;padding:10px 11px;color:${G.txt};font-family:'Syne',sans-serif;font-size:16px;outline:none;-webkit-appearance:none;letter-spacing:.05em}
.bs-mrow input:focus{border-color:${G.blu}}
.bs-mrow button{flex-shrink:0;padding:0 14px;border:1px solid ${G.blu};border-radius:9px;background:rgba(0,212,255,.1);color:${G.blu};font-family:'Syne',sans-serif;font-size:13px;font-weight:700;cursor:pointer}
.bs-mrow button:active{opacity:.7}
.bs-mrow button:disabled{opacity:.4;cursor:not-allowed}
.bs-actrow{display:flex;gap:8px;margin-top:8px}
.bs-actrow button{flex:1;padding:10px;border-radius:9px;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;cursor:pointer}
.bs-retry{border:1px solid ${G.blu};background:rgba(0,212,255,.1);color:${G.blu}}
.bs-retry:active{opacity:.7}
.bs-results-h{font-size:9px;font-weight:700;color:${G.dim};letter-spacing:.1em;text-transform:uppercase;margin:14px 0 6px}

/* v1.5.0 — Hamburger button */
/* v1.13.2 — A1 fix: bumped hamburger 44→48 to exactly hit Material 48dp tap target. */
.hmb{flex-shrink:0;width:48px;height:48px;border:1px solid ${G.bdr};border-radius:10px;background:${G.card};color:${G.txt};font-size:22px;font-weight:400;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;padding:0;transition:background .15s;position:relative}
/* v1.8.0 — red dot trigger on hamburger when any menu section has unseen content */
.hmb-pulse{border-color:rgba(255,77,109,.4)}
.hmb-dot{position:absolute;top:8px;right:8px;width:9px;height:9px;border-radius:50%;background:${G.red};box-shadow:0 0 0 2px ${G.card},0 0 8px rgba(255,77,109,.6);animation:hmbDotPulse 2s ease-in-out infinite}
@keyframes hmbDotPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.18);opacity:.85}}
.hmb:active{background:${G.card2};opacity:.8}

/* v1.5.0 — Hamburger menu drawer (bottom sheet style) */
.menu-ovr{align-items:flex-end}
.menu-pn{width:100%;background:${G.card2};border-top:1px solid ${G.bdr};border-radius:20px 20px 0 0;padding:18px 16px max(calc(env(safe-area-inset-bottom,0px) + 24px), 80px);max-height:90dvh;overflow-y:auto;-webkit-overflow-scrolling:touch;animation:slideUp .22s ease}
.menu-hdr{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px}
.menu-row{width:100%;display:flex;align-items:center;gap:14px;padding:14px 14px;background:${G.bg};border:1px solid ${G.bdr};border-radius:12px;cursor:pointer;font-family:'Syne',sans-serif;text-align:left;margin-bottom:8px;transition:border-color .15s,background .15s}
.menu-row:hover,.menu-row:active{border-color:${G.blu};background:rgba(0,212,255,.04)}
.menu-ico{font-size:24px;flex-shrink:0;width:32px;text-align:center;line-height:1;position:relative;display:inline-block}
/* v1.8.0 — per-row red dot in hamburger menu (positioned over the icon) */
.menu-row-dot{position:absolute;top:-2px;right:-4px;width:9px;height:9px;border-radius:50%;background:${G.red};box-shadow:0 0 0 2px ${G.bg}}
.menu-body{flex:1;min-width:0}
.menu-title{font-size:14px;font-weight:700;color:${G.txt};margin-bottom:2px}
.menu-desc{font-size:11px;color:${G.dim};line-height:1.4}
.menu-badge{flex-shrink:0;font-size:11px;font-weight:700;color:${G.blu};padding:3px 8px;border-radius:10px;background:rgba(0,212,255,.12);font-family:'Orbitron',monospace;letter-spacing:.04em}
.menu-arrow{flex-shrink:0;font-size:20px;color:${G.dim};margin-left:4px}

/* v1.5.0 — Achievements grid */
.ach-pn{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:14px 16px max(calc(env(safe-area-inset-bottom,0px) + 24px), 80px)}
.ach-sub{font-size:12px;color:${G.dim};margin-bottom:14px;padding:10px 12px;background:${G.bg};border:1px solid ${G.bdr};border-radius:10px;text-align:center;font-family:'Orbitron',monospace;letter-spacing:.04em}
.ach-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.ach-card{padding:14px 12px;border:1px solid ${G.bdr};border-radius:12px;background:${G.bg};opacity:.55;transition:opacity .2s,border-color .2s}
.ach-card.ach-on{opacity:1;border-color:${G.grn};background:rgba(57,255,110,.05)}
.ach-card.ach-rare.ach-on{border-color:${G.gld};background:rgba(255,209,102,.06);box-shadow:0 0 0 1px rgba(255,209,102,.2)}
.ach-ico{font-size:32px;text-align:center;margin-bottom:6px;filter:grayscale(.4)}
.ach-card.ach-on .ach-ico{filter:none}
.ach-title{font-size:12px;font-weight:700;color:${G.txt};text-align:center;margin-bottom:3px;line-height:1.25}
.ach-desc{font-size:10px;color:${G.dim};text-align:center;line-height:1.35;min-height:28px}
.ach-bar{height:4px;background:${G.bdr};border-radius:2px;overflow:hidden;margin:8px 0 4px}
.ach-bar-fill{height:100%;background:${G.blu};transition:width .3s ease}
.ach-progress{font-size:10px;font-weight:600;color:${G.dim};text-align:center;font-family:'Orbitron',monospace;letter-spacing:.04em}

/* v1.5.0 — Goals manager + Home card */
.goals-h{font-size:11px;font-weight:700;color:${G.dim};letter-spacing:.08em;text-transform:uppercase;margin:8px 0 8px}
.goals-empty{padding:24px 16px;text-align:center;color:${G.dim}}
.goals-empty-t{font-size:13px;font-weight:700;color:${G.txt};margin-bottom:4px}
.goals-empty-h{font-size:11px;color:${G.dim}}
.goal-card{background:${G.bg};border:1px solid ${G.bdr};border-radius:11px;padding:11px 12px;margin-bottom:8px}
.goal-card-done{opacity:.6;background:rgba(57,255,110,.04);border-color:rgba(57,255,110,.2)}
.goal-row{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.goal-card-done .goal-row{margin-bottom:0}
.goal-ico{font-size:22px;flex-shrink:0;width:28px;text-align:center;line-height:1}
.goal-body{flex:1;min-width:0}
.goal-title{font-size:13px;font-weight:600;color:${G.txt};line-height:1.3}
.goal-meta{font-size:10px;color:${G.dim};margin-top:2px}
.goal-del{flex-shrink:0;width:28px;height:28px;border:1px solid ${G.bdr};border-radius:7px;background:transparent;color:${G.dim};font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1}
.goal-del:hover,.goal-del:active{color:${G.red};border-color:rgba(255,77,109,.4)}
.goal-bar{height:5px;background:${G.bdr};border-radius:3px;overflow:hidden}
.goal-bar-fill{height:100%;background:linear-gradient(90deg,${G.blu},${G.grn});transition:width .3s ease}
.goal-tpl{display:flex;align-items:center;gap:11px;width:100%;padding:12px 14px;border:1px solid ${G.bdr};border-radius:10px;background:${G.bg};color:${G.txt};font-family:'Syne',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:border-color .15s,background .15s}
.goal-tpl:hover,.goal-tpl:active{border-color:${G.blu};background:rgba(0,212,255,.05)}
/* Home card */
.goal-home{padding:12px 14px;background:${G.card};border:1px solid ${G.bdr};border-radius:14px;margin-bottom:14px;cursor:pointer;transition:border-color .15s}
.goal-home:hover,.goal-home:active{border-color:${G.blu}}
.goal-home-h{font-size:11px;font-weight:700;color:${G.dim};letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px}
.goal-home-empty{display:flex;align-items:center;gap:11px;padding:14px;background:${G.card};border:1px dashed ${G.bdr};border-radius:14px;margin-bottom:14px;cursor:pointer;transition:border-color .15s}
.goal-home-empty:hover,.goal-home-empty:active{border-color:${G.blu};border-style:solid}
.goal-home-empty .goal-title{font-size:13px}
.goal-home-empty .goal-meta{font-size:11px}
.goal-mini{margin-bottom:8px}
.goal-mini:last-child{margin-bottom:0}
.goal-mini-row{display:flex;align-items:center;gap:9px;margin-bottom:5px}
.goal-mini-title{font-size:12px;font-weight:600;color:${G.txt};line-height:1.3}
.goal-mini-meta{font-size:10px;color:${G.dim};font-family:'Orbitron',monospace;letter-spacing:.04em}

/* v1.5.0 — Year-in-Review */
.wr-pn{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 16px max(calc(env(safe-area-inset-bottom,0px) + 24px), 80px)}
.wr-years{display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap}
.wr-years-lbl{font-size:10px;font-weight:700;color:${G.dim};letter-spacing:.08em;text-transform:uppercase;margin-right:2px}
.wr-year{padding:6px 12px;border:1px solid ${G.bdr};border-radius:16px;background:${G.card};color:${G.dim};font-family:'Orbitron',monospace;font-size:11px;font-weight:700;cursor:pointer;transition:all .15s}
.wr-year.on{background:${G.blu};color:#000;border-color:${G.blu}}
.wr-sub{font-size:12px;color:${G.dim};text-align:center;margin-bottom:14px}
.wr-hero{padding:24px 16px;border-radius:16px;background:linear-gradient(135deg,rgba(0,212,255,.18),rgba(167,139,250,.18));border:1px solid rgba(0,212,255,.3);text-align:center;margin-bottom:12px}
.wr-hero-num{font-family:'Orbitron',monospace;font-size:56px;font-weight:900;color:${G.blu};line-height:1;letter-spacing:-.02em;text-shadow:0 0 28px rgba(0,212,255,.4)}
.wr-hero-lbl{font-size:14px;color:${G.txt};margin-top:8px;text-transform:uppercase;letter-spacing:.1em;font-weight:700}
.wr-hero-sub{font-size:11px;color:${G.dim};margin-top:4px}
.wr-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}
.wr-stat{padding:14px 12px;background:${G.card};border:1px solid ${G.bdr};border-radius:12px;text-align:center}
.wr-stat-num{font-family:'Orbitron',monospace;font-size:24px;font-weight:900;color:${G.txt};line-height:1.1}
.wr-stat-lbl{font-size:10px;color:${G.dim};margin-top:4px;text-transform:uppercase;letter-spacing:.06em;font-weight:700;line-height:1.3}
.wr-stat-sub{font-size:10px;color:${G.dim};margin-top:4px;font-family:'Orbitron',monospace;letter-spacing:.04em}
.wr-card{padding:14px;background:${G.card};border:1px solid ${G.bdr};border-radius:14px;margin-bottom:12px}
.wr-card-h{font-size:12px;font-weight:700;color:${G.pur};letter-spacing:.06em;text-transform:uppercase;margin-bottom:10px}
.wr-row{display:flex;align-items:center;gap:11px;padding:8px 0}
.wr-row:not(:last-child){border-bottom:1px solid ${G.bdr}}
.wr-rank{flex-shrink:0;width:24px;font-family:'Orbitron',monospace;font-size:14px;font-weight:900;color:${G.blu};letter-spacing:-.02em}
.wr-cov{width:42px;height:42px;border-radius:8px;object-fit:cover;flex-shrink:0;background:${G.bg}}
.wr-cov0{width:42px;height:42px;border-radius:8px;background:${G.bg};display:flex;align-items:center;justify-content:center;font-family:'Orbitron',monospace;font-size:12px;font-weight:900;color:${G.blu};flex-shrink:0}
.wr-row-body{flex:1;min-width:0}
.wr-row-title{font-size:13px;font-weight:600;color:${G.txt};white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wr-row-meta{font-size:11px;color:${G.dim};margin-top:2px}
.wr-genre-name{font-family:'Orbitron',monospace;font-size:24px;font-weight:900;color:${G.gld};text-align:center;letter-spacing:-.02em}
.wr-genre-meta{font-size:11px;color:${G.dim};text-align:center;margin-top:4px}
.wr-share-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:18px;padding:14px;background:linear-gradient(135deg,${G.blu},${G.pur});border:none;border-radius:14px;color:#fff;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;cursor:pointer;letter-spacing:.2px;box-shadow:0 4px 20px rgba(0,212,255,.3)}
.wr-share-btn:active{transform:scale(.98);box-shadow:0 2px 12px rgba(0,212,255,.25)}
/* v1.9.0 — Recommendations engine UI */
.rec-home-card{display:flex;align-items:center;gap:12px;padding:14px 16px;margin-top:14px;background:linear-gradient(135deg,rgba(167,139,250,.10),rgba(0,212,255,.06));border:1px solid rgba(167,139,250,.3);border-radius:14px;cursor:pointer;transition:transform .15s,border-color .15s}
.rec-home-card:active{transform:scale(.99)}
.rec-home-ico{font-size:24px;flex-shrink:0;width:36px;text-align:center;filter:drop-shadow(0 0 10px rgba(167,139,250,.5))}
.rec-home-body{flex:1;min-width:0}
.rec-home-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:${G.txt};line-height:1.2}
.rec-home-sub{font-size:11px;color:${G.dim};margin-top:3px;line-height:1.4}
.rec-home-arrow{flex-shrink:0;font-size:18px;color:${G.pur};font-weight:300}
.rec-pn{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:14px 16px 28px}
.rec-tabs{display:flex;gap:6px;padding:4px;background:${G.card};border:1px solid ${G.bdr};border-radius:11px;margin-bottom:16px}
.rec-tab{flex:1;padding:9px 8px;border:none;background:transparent;color:${G.dim};font-family:'Syne',sans-serif;font-size:12px;font-weight:600;border-radius:8px;cursor:pointer;transition:all .15s}
.rec-tab.on{background:${G.card2};color:${G.txt};box-shadow:0 1px 3px rgba(0,0,0,.4)}
.rec-loading{display:flex;flex-direction:column;align-items:center;gap:14px;padding:48px 20px;color:${G.dim};font-family:'Syne',sans-serif;font-size:13px}
.rec-spinner{width:32px;height:32px;border:3px solid ${G.bdr};border-top-color:${G.blu};border-radius:50%;animation:recSpin .8s linear infinite}
@keyframes recSpin{to{transform:rotate(360deg)}}
.rec-empty{display:flex;flex-direction:column;align-items:center;text-align:center;padding:48px 20px;gap:8px}
.rec-empty .eic{font-size:42px;margin-bottom:4px;opacity:.85}
.rec-empty .ett{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:${G.txt}}
.rec-empty .ess{font-size:12px;color:${G.dim};line-height:1.5;max-width:280px}
.rec-retry{margin-top:12px;padding:10px 18px;background:${G.card};border:1px solid ${G.bdr};border-radius:10px;color:${G.txt};font-family:'Syne',sans-serif;font-size:12px;font-weight:600;cursor:pointer}
.rec-retry:active{transform:scale(.97)}
.rec-grid{display:flex;flex-direction:column;gap:10px}
.rec-card{display:flex;gap:12px;padding:10px;background:${G.card};border:1px solid ${G.bdr};border-radius:13px;align-items:flex-start}
.rec-cover{width:60px;height:84px;flex-shrink:0;border-radius:8px;background-size:cover;background-position:center;background-color:${G.card2}}
.rec-cover0{width:60px;height:84px;flex-shrink:0;border-radius:8px;background:${G.card2};display:flex;align-items:center;justify-content:center;font-family:'Orbitron',monospace;font-size:18px;font-weight:900;color:${G.pur}}
.rec-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.rec-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:${G.txt};line-height:1.25;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.rec-meta{font-size:11px;color:${G.dim};line-height:1.3}
.rec-reason{font-size:10.5px;color:${G.pur};font-style:italic;line-height:1.4;margin-top:2px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.rec-reason-more{font-style:normal;font-weight:700;color:${G.dim};margin-left:4px}
.rec-add{align-self:flex-start;margin-top:6px;padding:7px 12px;background:rgba(0,212,255,.10);border:1px solid rgba(0,212,255,.3);border-radius:8px;color:${G.blu};font-family:'Syne',sans-serif;font-size:11px;font-weight:700;cursor:pointer;letter-spacing:.04em}
.rec-add:active{transform:scale(.97);background:rgba(0,212,255,.18)}
.rec-explore{display:block;text-align:center;margin-top:18px;padding:11px;color:${G.dim};font-family:'Syne',sans-serif;font-size:12px;font-weight:600;text-decoration:none;border-top:1px solid ${G.bdr};transition:color .15s}
.rec-explore:active{color:${G.txt}}
/* v1.11.1 — Wipe-all-data confirm modal + danger row styling */
.set-row-danger{border-color:rgba(255,77,109,.25)}
.set-row-danger .set-row-title{color:${G.red}}
.wipe-box{max-width:340px}
.wipe-typeprompt{font-size:12px;color:${G.dim};margin:14px 0 8px;text-align:left;line-height:1.5}
.wipe-input{width:100%;padding:11px 12px;border:1px solid ${G.bdr};border-radius:10px;background:${G.bg};color:${G.txt};font-family:'Orbitron',monospace;font-size:14px;font-weight:700;letter-spacing:.12em;text-align:center;text-transform:uppercase;margin-bottom:14px;outline:none}
.wipe-input:focus{border-color:${G.red};box-shadow:0 0 0 3px rgba(255,77,109,.15)}
.wipe-yes.disabled{background:${G.bdr};color:${G.dim};cursor:not-allowed;opacity:.6}
.wipe-yes.disabled:active{transform:none}
/* v1.13.1 — Refresh-from-RAWG button (Modal edit only) */
.rawg-refresh{margin-top:8px;width:100%;padding:10px 12px;background:rgba(0,212,255,.08);border:1px solid rgba(0,212,255,.25);border-radius:9px;color:${G.blu};font-family:'Syne',sans-serif;font-size:12px;font-weight:700;letter-spacing:.04em;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .15s}
.rawg-refresh:active{transform:scale(.99);background:rgba(0,212,255,.16)}
.rawg-refresh:disabled{opacity:.6;cursor:not-allowed}
.rawg-refresh:disabled:active{transform:none}
.rawg-refresh-spin{width:13px;height:13px;border:2px solid rgba(0,212,255,.3);border-top-color:${G.blu};border-radius:50%;animation:spin .8s linear infinite}

/* v1.13.9 — Landscape on phones: portrait .hdr (status-bar inset + 44 + ~46 tabs + 12 + 14 ≈ 130-180px)
   eats ~50% of a 375h screen, leaving the scroll surface tiny and effectively useless. Compress
   the top inset and gaps in landscape so .scr/.lst gets a usable share of the viewport. Threshold
   max-height:500px catches typical phone landscape (375-414h) without affecting tablets. */
@media (orientation: landscape) and (max-height: 500px) {
  .hdr{padding-top:calc(env(safe-area-inset-top,0px) + 8px);padding-bottom:6px}
  .htop{margin-bottom:8px}
  .tabs{padding:2px}
  .tab{min-height:36px;padding:6px 2px}
  .lico{width:28px;height:28px;font-size:16px}
  .lnm{font-size:13px}
  .lsb{display:none}
  .abtn{min-height:36px;padding:8px 12px;font-size:13px}
  .hmb{min-height:36px;min-width:36px}
}
`;
