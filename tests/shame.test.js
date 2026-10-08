import { describe, it, expect } from 'vitest';
import { computeShamePile } from '../src/lib/shame.js';

const NOW = Date.parse('2026-10-20T12:00:00Z');
const ago = d => new Date(NOW - d * 864e5).toISOString();

const games = [
  { id: 'a', title: 'Elden Ring', status: 'planuje', hours: 0, priceBought: '199.99', targetHours: 60, addedAt: ago(400), cover: 'e.jpg', source: 'owned' },
  { id: 'b', title: 'Stray', status: 'planuje', hours: '', priceBought: '', targetHours: 6, addedAt: ago(30), cover: 's.jpg', source: 'psplus' },
  { id: 'c', title: 'Hades', status: 'gram', hours: 12, priceBought: '80', addedAt: ago(500), source: 'owned' },
  { id: 'd', title: 'Celeste', status: 'ukonczone', hours: 0, priceBought: '50', addedAt: ago(600), source: 'owned' },
  { id: 'e', title: 'GTA VI', status: 'planuje', hours: 0, priceBought: '349', releaseDate: '2027-05-26', addedAt: ago(700), source: 'owned' },
  { id: 'f', title: 'Ghost of Yotei', status: 'planuje', hours: 0, priceBought: '299', preOrdered: true, addedAt: ago(800), source: 'owned' },
  { id: 'g', title: 'Demo', status: 'planuje', hours: 0, priceBought: '999', addedAt: ago(900), _demo: true },
  { id: 'h', title: 'Astro Bot', status: 'porzucone', hours: 0, priceBought: '250', extraSpend: '20', addedAt: ago(10), source: 'owned' },
  { id: 'i', title: 'Returnal', status: 'gram', hours: 0, priceBought: '120', extraSpend: '30', targetHours: 25.4, addedAt: ago(100), cover: 'r.jpg', source: 'owned' },
];

describe('pile of shame (v1.20.1)', () => {
  it('counts only started-never, released, non-demo games', () => {
    const p = computeShamePile(games, NOW);
    expect(p.count).toBe(3); // Elden Ring, Stray, Returnal
    expect(p.value).toBe(350); // 199.99 + 120 + 30, subscription Stray adds nothing
    expect(p.hours).toBe(91);
  });

  it('names the game waiting longest and shows the priciest covers first', () => {
    const p = computeShamePile(games, NOW);
    expect(p.oldestTitle).toBe('Elden Ring');
    expect(p.oldestDays).toBe(400);
    expect(p.covers.map(c => c.title)).toEqual(['Elden Ring', 'Returnal', 'Stray']);
  });

  it('is empty for an empty or fully played collection', () => {
    expect(computeShamePile([], NOW)).toMatchObject({ count: 0, value: 0, hours: 0, oldestTitle: '' });
  });
});
