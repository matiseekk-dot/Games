// v1.20.1 - "Pile of shame" share image: 1080x1920 (Story format) like the Year in Review
// poster, drawn with Canvas 2D. A literal pile of the user's unplayed games (covers as
// stacked game boxes), the money it cost, how long it would take to play and which game
// has waited longest. The footer points to PS5 Vault on Google Play, so every share is
// also an ad for the app.
import { ensureFonts, roundRect, loadCover, COL } from './wrapped-image.js';
import { pln, gamesWord } from './format.js';
import { t } from '../i18n.js';

const W = 1080;
const H = 1920;

// Draw an image scaled to cover the box (like CSS background-size: cover)
function drawCover(ctx, img, x, y, w, h) {
  const r = Math.max(w / img.width, h / img.height);
  const sw = w / r, sh = h / r;
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
}

function fitFont(ctx, text, weight, family, maxPx, maxWidth) {
  let px = maxPx;
  do { ctx.font = `${weight} ${px}px ${family}`; px -= 6; } while (ctx.measureText(text).width > maxWidth && px > 40);
}

function ellipsize(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let s = text;
  while (s.length > 1 && ctx.measureText(s + '...').width > maxWidth) s = s.slice(0, -1);
  return s.trimEnd() + '...';
}

export async function buildShameImage(pile, lang) {
  if (!pile || !pile.count) return null;
  await ensureFonts();
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const ORB = "'Orbitron', Arial, sans-serif";
  const SYNE = "'Syne', Arial, sans-serif";

  // Background: same deep blue as the app, with a warm "shame" glow behind the pile
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, COL.bg1);
  bg.addColorStop(0.6, '#140F24');
  bg.addColorStop(1, '#040611');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 1080, 80, W / 2, 1080, 760);
  glow.addColorStop(0, 'rgba(255,159,28,0.20)');
  glow.addColorStop(1, 'rgba(255,159,28,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 64px ${ORB}`;
  ctx.fillStyle = COL.blu;
  ctx.fillText('PS5 VAULT', W / 2, 130);
  ctx.font = `700 40px ${SYNE}`;
  ctx.fillStyle = COL.txt;
  ctx.fillText(t(lang, 'shameImgTitle'), W / 2, 205);

  // Hero: the money, or the count when no prices were entered
  const hero = pile.value > 0 ? pln(pile.value, lang) : String(pile.count);
  fitFont(ctx, hero, 900, ORB, 170, 960);
  const heroGrad = ctx.createLinearGradient(0, 300, 0, 460);
  heroGrad.addColorStop(0, COL.gld);
  heroGrad.addColorStop(1, COL.org);
  ctx.fillStyle = heroGrad;
  ctx.fillText(hero, W / 2, 380);
  ctx.font = `700 36px ${SYNE}`;
  ctx.fillStyle = COL.dim;
  ctx.fillText(pile.value > 0 ? t(lang, 'shameImgValueLabel') : gamesWord(pile.count, lang).toUpperCase() + ' ' + t(lang, 'shameImgCountLabel'), W / 2, 500);

  // The pile: game boxes stacked bottom-up, slightly crooked
  const boxes = pile.covers.slice(0, 6);
  const imgs = await Promise.all(boxes.map(b => loadCover(b.cover)));
  const BW = 760, BH = 150, STEP = 112;
  // centre the pile between the hero label (y 520) and the stats row (y 1500)
  const pileH = (Math.max(boxes.length, 1) - 1) * STEP + BH;
  const bottomTop = Math.round(1020 + pileH / 2 - BH);
  const tilt = [-2.2, 1.6, -1.1, 2.4, -1.8, 1.0];
  const shift = [-24, 22, -8, 30, -20, 8];
  for (let i = 0; i < boxes.length; i++) {
    const cx = W / 2 + shift[i];
    const cy = bottomTop - i * STEP + BH / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((tilt[i] * Math.PI) / 180);
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 10;
    roundRect(ctx, -BW / 2, -BH / 2, BW, BH, 18);
    ctx.fillStyle = COL.card;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.save();
    roundRect(ctx, -BW / 2, -BH / 2, BW, BH, 18);
    ctx.clip();
    if (imgs[i]) {
      try { drawCover(ctx, imgs[i], -BW / 2, -BH / 2, BW, BH); } catch { /* tainted or broken image: plain box */ }
    } else {
      const g = ctx.createLinearGradient(-BW / 2, 0, BW / 2, 0);
      g.addColorStop(0, '#1B2340');
      g.addColorStop(1, '#2A1B40');
      ctx.fillStyle = g;
      ctx.fillRect(-BW / 2, -BH / 2, BW, BH);
    }
    // darken the lower part so the title reads; the top strip is hidden by the next box
    const shade = ctx.createLinearGradient(0, -BH / 2, 0, BH / 2);
    shade.addColorStop(0, 'rgba(4,6,17,0.05)');
    shade.addColorStop(1, 'rgba(4,6,17,0.85)');
    ctx.fillStyle = shade;
    ctx.fillRect(-BW / 2, -BH / 2, BW, BH);
    ctx.restore();
    roundRect(ctx, -BW / 2, -BH / 2, BW, BH, 18);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.stroke();
    ctx.textAlign = 'left';
    ctx.font = `700 34px ${SYNE}`;
    ctx.fillStyle = COL.txt;
    ctx.fillText(ellipsize(ctx, boxes[i].title || '', BW - 60), -BW / 2 + 30, 34);
    ctx.restore();
  }
  ctx.textAlign = 'center';
  if (pile.count > boxes.length) {
    ctx.font = `700 30px ${SYNE}`;
    ctx.fillStyle = COL.dim;
    ctx.fillText(t(lang, 'shameImgMore', { n: pile.count - boxes.length }), W / 2, bottomTop - boxes.length * STEP + 40);
  }

  // Stats row
  const stats = [{ v: String(pile.count), l: gamesWord(pile.count, lang).toUpperCase() }];
  if (pile.hours > 0) stats.push({ v: '~' + pile.hours, l: t(lang, 'shameImgHours') });
  if (pile.oldestDays > 0) stats.push({ v: String(pile.oldestDays), l: t(lang, 'shameImgDays') });
  const colW = W / stats.length;
  stats.forEach((s, i) => {
    const x = colW * i + colW / 2;
    ctx.font = `900 72px ${ORB}`;
    ctx.fillStyle = i === 0 ? COL.org : i === 1 ? COL.blu : COL.pur;
    ctx.fillText(s.v, x, 1560);
    ctx.font = `700 26px ${SYNE}`;
    ctx.fillStyle = COL.dim;
    ctx.fillText(s.l, x, 1625);
  });

  if (pile.oldestTitle) {
    ctx.font = `400 30px ${SYNE}`;
    ctx.fillStyle = COL.txt;
    ctx.fillText(ellipsize(ctx, t(lang, 'shameImgOldest', { title: pile.oldestTitle }), 960), W / 2, 1715);
  }

  ctx.font = `700 30px ${SYNE}`;
  ctx.fillStyle = COL.gld;
  ctx.fillText(t(lang, 'shameImgFooter'), W / 2, H - 120);
  ctx.font = `700 28px ${ORB}`;
  ctx.fillStyle = COL.blu;
  ctx.fillText('PS5 VAULT · GOOGLE PLAY', W / 2, H - 66);

  return await new Promise(resolve => {
    try { canvas.toBlob(b => resolve(b), 'image/png', 0.95); } catch { resolve(null); }
  });
}
