// v1.15.2 — Wrapped share image generator.
// Renders a 1080×1920 (9:16, Instagram Story / TikTok) PNG summarizing the user's
// year recap. Pure Canvas 2D, no DOM rasterization (html2canvas was considered and
// rejected: 60 KB extra bundle for one screen, plus rendering quirks with our flex
// layouts). The drawback: we re-implement the layout in canvas calls — that's fine
// because the share image is a fixed-format poster, not a live rendering of the UI.
//
// Design tone matches PS5 Vault brand:
//   - Background: deep blue-black gradient (G.bg → midnight blue)
//   - Accent: Orbitron font for headers, Syne for body (web fonts must be ready
//     before rendering — we await document.fonts.ready)
//   - Hero stat is the headline number (most-played hours), with secondary stats
//     in a 3-column row underneath
//
// Returns a Promise<Blob> (image/png). Caller pipes into shareFile().

import { hoursWord, gamesWord, platynaWord } from './format.js';

// Brand colors duplicated here (avoids importing the full G object — small win,
// but keeps this module self-contained and free to be tree-shaken if someone strips
// the share feature later).
const COL = {
  bg1:'#080B14',
  bg2:'#0D1733',
  card:'#0D1120',
  bdr:'#1E2A42',
  txt:'#E8EDF8',
  dim:'#7B8AAD',
  blu:'#00D4FF',
  blu2:'#0060FF',
  pur:'#A78BFA',
  grn:'#39FF6E',
  gld:'#FFD166',
  org:'#FF9F1C',
};

// Fixed canvas size — 9:16 portrait, native Story / Reels resolution.
const W = 1080;
const H = 1920;

// Wait for both Orbitron weights (700, 900) and Syne (400, 700) to actually load.
// document.fonts.ready resolves once all CSS-declared @font-face rules finish loading,
// which is what we need before measureText / fillText pick them up. ~150ms first time,
// instant on subsequent calls.
async function ensureFonts() {
  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
      // Belt + suspenders — explicit load() for the specific weights we'll draw.
      // load() is a no-op if already loaded; on cold start it awaits the actual fetch.
      await Promise.all([
        document.fonts.load("900 96px 'Orbitron'"),
        document.fonts.load("700 60px 'Orbitron'"),
        document.fonts.load("700 36px 'Syne'"),
        document.fonts.load("400 28px 'Syne'"),
      ]);
    }
  } catch { /* font load errors fall through to system-font rendering */ }
}

// Helpers
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Wrap text within maxWidth, returns array of lines. Greedy — splits on spaces only.
function wrapText(ctx, text, maxWidth) {
  const words = (text || '').split(/\s+/);
  const lines = [];
  let current = '';
  for (const w of words) {
    const test = current ? current + ' ' + w : w;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Optional: load top-game cover into an HTMLImageElement. Skipped silently on CORS
// failure (some RAWG image hosts don't set CORS) — share image just won't have a cover
// in that case. Returns null on any failure.
async function loadCover(url) {
  if (!url) return null;
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    return await new Promise((resolve) => {
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
      // Hard timeout — if the network stalls, don't hold up the whole share flow
      setTimeout(() => resolve(null), 4000);
    });
  } catch {
    return null;
  }
}

// Main entry. Returns Blob on success, null on hard failure (canvas not supported,
// or canvas.toBlob unavailable). Caller toasts an error in the null case.
export async function buildWrappedImage(review, year, lang) {
  if (!review) return null;
  await ensureFonts();

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // ── Background gradient ────────────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, COL.bg1);
  bg.addColorStop(0.6, '#0A1230');
  bg.addColorStop(1, '#040611');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle accent glow top-left
  const glow = ctx.createRadialGradient(120, 200, 60, 120, 200, 700);
  glow.addColorStop(0, 'rgba(0,212,255,0.18)');
  glow.addColorStop(1, 'rgba(0,212,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  // Bottom-right purple wash
  const glow2 = ctx.createRadialGradient(W - 200, H - 300, 100, W - 200, H - 300, 800);
  glow2.addColorStop(0, 'rgba(167,139,250,0.14)');
  glow2.addColorStop(1, 'rgba(167,139,250,0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  // ── Top: brand mark + year ─────────────────────────────────────────────────
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // "PS5 VAULT" in Orbitron
  ctx.font = "900 64px 'Orbitron', Arial, sans-serif";
  ctx.fillStyle = COL.blu;
  ctx.fillText('PS5 VAULT', W / 2, 130);

  // i18n title — language-aware
  ctx.font = "700 38px 'Syne', Arial, sans-serif";
  ctx.fillStyle = COL.dim;
  const titleByLang = { pl: `MÓJ ${year} W GRACH`, en: `MY ${year} IN GAMES`, es: `MI ${year} EN JUEGOS` };
  ctx.fillText(titleByLang[lang] || titleByLang.en, W / 2, 200);

  // ── Hero number: total hours ───────────────────────────────────────────────
  // Big Orbitron 192px — anchor visual.
  const heroY = 380;
  ctx.font = "900 220px 'Orbitron', Arial, sans-serif";
  // Gradient fill on the hero number
  const heroGrad = ctx.createLinearGradient(0, heroY - 100, 0, heroY + 100);
  heroGrad.addColorStop(0, COL.blu);
  heroGrad.addColorStop(1, COL.blu2);
  ctx.fillStyle = heroGrad;
  ctx.fillText(String(review.totalHours || 0), W / 2, heroY);

  // Hero label
  ctx.font = "700 36px 'Syne', Arial, sans-serif";
  ctx.fillStyle = COL.txt;
  const hourWord = hoursWord(review.totalHours || 0, lang).toUpperCase();
  const heroLabelByLang = {
    pl: `${hourWord} GRANIA`,
    en: `${hourWord} PLAYED`,
    es: `${hourWord} JUGADAS`,
  };
  ctx.fillText(heroLabelByLang[lang] || heroLabelByLang.en, W / 2, heroY + 140);

  // ── 3-column secondary stats ───────────────────────────────────────────────
  const colY = 720;
  const colSpacing = W / 3;
  const cols = [
    { value: review.gamesAdded || 0,     label: lang === 'pl' ? 'DODANYCH' : lang === 'es' ? 'AÑADIDOS' : 'ADDED', color: COL.pur },
    { value: review.gamesCompleted || 0, label: lang === 'pl' ? 'UKOŃCZONYCH' : lang === 'es' ? 'COMPLETADOS' : 'COMPLETED', color: COL.grn },
    { value: review.platinums || 0,      label: lang === 'pl' ? 'PLATYN' : lang === 'es' ? 'PLATINOS' : 'PLATINUMS', color: COL.gld },
  ];
  cols.forEach((c, i) => {
    const cx = colSpacing * i + colSpacing / 2;
    ctx.font = "900 110px 'Orbitron', Arial, sans-serif";
    ctx.fillStyle = c.color;
    ctx.fillText(String(c.value), cx, colY);
    ctx.font = "700 22px 'Syne', Arial, sans-serif";
    ctx.fillStyle = COL.dim;
    ctx.fillText(c.label, cx, colY + 80);
  });

  // ── Top played card ────────────────────────────────────────────────────────
  const cardY = 920;
  const cardH = 360;
  const cardX = 80;
  const cardW = W - 160;
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  roundRect(ctx, cardX, cardY, cardW, cardH, 24);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,212,255,0.28)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.font = "700 24px 'Syne', Arial, sans-serif";
  ctx.fillStyle = COL.dim;
  const topPlayedLabel = lang === 'pl' ? '🏆 NAJWIĘCEJ GRANE' : lang === 'es' ? '🏆 MÁS JUGADO' : '🏆 MOST PLAYED';
  ctx.fillText(topPlayedLabel, cardX + 32, cardY + 50);

  const top = review.topPlayed && review.topPlayed[0];
  if (top && top.game) {
    const cover = await loadCover(top.game.cover);
    let textX = cardX + 32;
    const coverSize = 180;
    if (cover) {
      // Draw cover thumbnail (rounded)
      ctx.save();
      roundRect(ctx, cardX + 32, cardY + 90, coverSize, coverSize * 1.1, 16);
      ctx.clip();
      ctx.drawImage(cover, cardX + 32, cardY + 90, coverSize, coverSize * 1.1);
      ctx.restore();
      textX = cardX + 32 + coverSize + 28;
    }
    ctx.font = "900 44px 'Syne', Arial, sans-serif";
    ctx.fillStyle = COL.txt;
    const titleLines = wrapText(ctx, top.game.title || '', cardW - (textX - cardX) - 32);
    titleLines.slice(0, 2).forEach((line, idx) => {
      ctx.fillText(line, textX, cardY + 140 + idx * 52);
    });
    ctx.font = "700 30px 'Orbitron', Arial, sans-serif";
    ctx.fillStyle = COL.blu;
    const hrsLabel = lang === 'pl' ? `${Math.round(top.hours)} h` : lang === 'es' ? `${Math.round(top.hours)} h` : `${Math.round(top.hours)} h`;
    ctx.fillText(hrsLabel, textX, cardY + cardH - 60);
  } else {
    ctx.font = "700 32px 'Syne', Arial, sans-serif";
    ctx.fillStyle = COL.dim;
    ctx.fillText('—', cardX + 32, cardY + 200);
  }

  // ── Top genre badge (smaller, pill) ────────────────────────────────────────
  const genreY = 1340;
  if (review.topGenre && review.topGenre.name) {
    ctx.textAlign = 'center';
    const pillText = `🎮  ${review.topGenre.name.toUpperCase()}  ·  ${review.topGenre.hours}h`;
    ctx.font = "700 30px 'Syne', Arial, sans-serif";
    const pillW = ctx.measureText(pillText).width + 80;
    const pillH = 70;
    const pillX = (W - pillW) / 2;
    ctx.fillStyle = 'rgba(167,139,250,0.18)';
    roundRect(ctx, pillX, genreY, pillW, pillH, pillH / 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(167,139,250,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = COL.pur;
    ctx.fillText(pillText, W / 2, genreY + pillH / 2 + 2);
  }

  // ── Active days + longest streak (small row) ───────────────────────────────
  const rowY = 1480;
  const rowItems = [
    { value: `${review.activeDays || 0}`, label: lang === 'pl' ? 'AKTYWNYCH DNI' : lang === 'es' ? 'DÍAS ACTIVOS' : 'ACTIVE DAYS' },
    { value: `${review.longestStreak || 0}`, label: lang === 'pl' ? 'NAJDŁUŻSZA SERIA' : lang === 'es' ? 'RACHA MÁS LARGA' : 'LONGEST STREAK' },
  ];
  rowItems.forEach((it, i) => {
    const cx = (W / rowItems.length) * i + (W / rowItems.length) / 2;
    ctx.font = "900 64px 'Orbitron', Arial, sans-serif";
    ctx.fillStyle = COL.org;
    ctx.fillText(it.value, cx, rowY);
    ctx.font = "700 20px 'Syne', Arial, sans-serif";
    ctx.fillStyle = COL.dim;
    ctx.fillText(it.label, cx, rowY + 56);
  });

  // ── Footer / branding ──────────────────────────────────────────────────────
  ctx.textAlign = 'center';
  ctx.font = "400 24px 'Syne', Arial, sans-serif";
  ctx.fillStyle = COL.dim;
  const footerByLang = {
    pl: 'matiseekk-dot.github.io/Games',
    en: 'matiseekk-dot.github.io/Games',
    es: 'matiseekk-dot.github.io/Games',
  };
  ctx.fillText(footerByLang[lang] || footerByLang.en, W / 2, H - 110);

  ctx.font = "700 28px 'Orbitron', Arial, sans-serif";
  ctx.fillStyle = COL.blu;
  ctx.fillText('PS5 VAULT', W / 2, H - 60);

  // ── Convert to blob ────────────────────────────────────────────────────────
  return await new Promise((resolve) => {
    if (canvas.toBlob) {
      canvas.toBlob((b) => resolve(b), 'image/png', 0.95);
    } else {
      // Fallback for very old canvases — convert dataURL → blob manually
      try {
        const dataUrl = canvas.toDataURL('image/png');
        const byteString = atob(dataUrl.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
        resolve(new Blob([ab], { type: 'image/png' }));
      } catch {
        resolve(null);
      }
    }
  });
}
