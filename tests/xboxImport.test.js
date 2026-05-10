import { describe, it, expect } from 'vitest';
import { parseXboxPaste } from '../src/lib/xbox-import.js';

const TA_CSV = `Game,Platform,Gamerscore,Achievements,Time Played,Completion
"Halo Infinite","Xbox Series X",1500,"50/120","42h 30m","42%"
"Forza Horizon 5","Xbox Series X|S",2000,"100/100","85h","100%"
"Sea of Thieves","Xbox One",1200,"60/200","120h 15m","30%"
"Microsoft Flight Simulator","PC",800,"20/45","60h","44%"`;

const TA_CSV_MIN = `Game,Platform,Time Played
"Forza",Xbox Series X,30h
"Halo",Xbox One,15h`;

const PLAINTEXT = `Halo Infinite
Forza Horizon 5
Gears 5`;

describe('parseXboxPaste', () => {
  it('parses TrueAchievements CSV with full columns', () => {
    const r = parseXboxPaste(TA_CSV);
    expect(r.format).toBe('csv');
    expect(r.count).toBe(4);
    expect(r.rows[0].title).toBe('Halo Infinite');
    expect(r.rows[0].platform).toBe('Xbox Series X/S');
    expect(r.rows[0].hours).toBe(42.5);  // 42h 30m → 42.5
    expect(r.rows[0].completionPct).toBe(42);
  });

  it('handles "12h" / "12h 30m" / "1234m" / plain int hour formats', () => {
    const r = parseXboxPaste(TA_CSV);
    const hours = r.rows.map(x => x.hours);
    expect(hours[0]).toBe(42.5);   // "42h 30m"
    expect(hours[1]).toBe(85);     // "85h"
    expect(hours[2]).toBe(120.25); // "120h 15m"
    expect(hours[3]).toBe(60);     // "60h"
  });

  it('normalizes Xbox platform variants to enum', () => {
    const r = parseXboxPaste(TA_CSV);
    expect(r.rows[0].platform).toBe('Xbox Series X/S');     // "Xbox Series X"
    expect(r.rows[1].platform).toBe('Xbox Series X/S');     // "Xbox Series X|S"
    expect(r.rows[2].platform).toBe('Xbox One');            // "Xbox One"
    expect(r.rows[3].platform).toBe('PC');                  // "PC"
  });

  it('parses minimal CSV (Game/Platform/Time)', () => {
    const r = parseXboxPaste(TA_CSV_MIN);
    expect(r.count).toBe(2);
    expect(r.rows[0].title).toBe('Forza');
    expect(r.rows[0].hours).toBe(30);
    expect(r.rows[0].completionPct).toBe(null);
  });

  it('falls back to plaintext when no CSV header detected', () => {
    const r = parseXboxPaste(PLAINTEXT);
    expect(r.format).toBe('plaintext');
    expect(r.count).toBe(3);
    expect(r.rows[0].title).toBe('Halo Infinite');
    expect(r.rows[0].platform).toBe('Xbox Series X/S');
  });

  it('rejects empty/null', () => {
    expect(parseXboxPaste('').count).toBe(0);
    expect(parseXboxPaste(null).count).toBe(0);
  });

  it('skips rows without title', () => {
    const csv = 'Game,Time Played\n"A","10h"\n,"5h"\n"C","8h"';
    const r = parseXboxPaste(csv);
    expect(r.count).toBe(2);
    expect(r.rows.map(x => x.title)).toEqual(['A', 'C']);
  });

  // v1.16.3 — robustness improvements (BOM / ; delimiter / localized headers / col-guess fallback)
  it('strips UTF-8 BOM from header', () => {
    const csv = '﻿Game,Platform,Time Played\n"Halo","Xbox One","10h"';
    const r = parseXboxPaste(csv);
    expect(r.count).toBe(1);
    expect(r.rows[0].title).toBe('Halo');
  });

  it('handles semicolon delimiter (EU Excel re-export)', () => {
    const csv = 'Game;Platform;Time Played\n"Halo Infinite";"Xbox Series X";"42h"';
    const r = parseXboxPaste(csv);
    expect(r.count).toBe(1);
    expect(r.rows[0].title).toBe('Halo Infinite');
    expect(r.rows[0].hours).toBe(42);
  });

  it('handles tab delimiter (TSV)', () => {
    const csv = 'Game\tPlatform\tTime Played\nHalo\tXbox One\t10h';
    const r = parseXboxPaste(csv);
    expect(r.count).toBe(1);
    expect(r.rows[0].title).toBe('Halo');
  });

  it('matches localized headers (PL: Gra/Czas gry)', () => {
    const csv = 'Gra,Platforma,Czas gry\n"Halo","Xbox One","10h"';
    const r = parseXboxPaste(csv);
    expect(r.count).toBe(1);
    expect(r.rows[0].title).toBe('Halo');
    expect(r.rows[0].hours).toBe(10);
  });

  it('matches Spanish headers (Juego/Plataforma/Horas)', () => {
    const csv = 'Juego,Plataforma,Horas\n"Halo","Xbox One","10"';
    const r = parseXboxPaste(csv);
    expect(r.count).toBe(1);
    expect(r.rows[0].title).toBe('Halo');
  });

  it('substring-matches "Game Title" → title column', () => {
    const csv = 'Game Title,Platform,Hours\n"Forza","Xbox","20"';
    const r = parseXboxPaste(csv);
    expect(r.count).toBe(1);
    expect(r.rows[0].title).toBe('Forza');
  });

  it('falls back to column-guess on unknown headers (multi-col, multi-row)', () => {
    // No standard header alias, but col 0 looks like text titles
    const csv = 'Item,Score,Date\n"Halo Infinite",1500,2023-01-15\n"Forza",2000,2023-06-20\n"Sea of Thieves",1200,2024-01-01';
    const r = parseXboxPaste(csv);
    expect(r.format).toBe('csv-guessed');
    expect(r.count).toBe(3);
    expect(r.rows[0].title).toBe('Halo Infinite');
  });

  it('emits debug info on full failure (binary file detection)', () => {
    // Simulate xlsx file content — null bytes + binary signature
    const binary = '\x00\x01\x02PK\x03\x04xlsxgarbage';
    const r = parseXboxPaste(binary);
    expect(r.count).toBe(0);
    expect(r.debug).toBeTruthy();
    expect(r.debug.looksLikeBinary).toBe(true);
  });

  // v1.16.12 — Sidebar recommended-games pollution: owned games have hours+%
  // but sidebar entries only have a fraction. Stricter filter (≥2 signals)
  // should drop sidebar entries.
  it('filters out sidebar recommended games (only fraction, no hours/percent)', () => {
    // 3 owned games with full data, then 5 "recommended" sidebar entries with
    // only trophy fractions (no hours, no percent, no date)
    const paste = `Halo Infinite
Xbox Series X
50/120
42h 30m
42%
Forza Horizon 5
Xbox Series X|S
100/100
85h
100%
Sea of Thieves
Xbox One
60/200
120h 15m
30%
Cyberpunk 2077
Xbox Series X
0/45
0h
0%
Stalker 2
Xbox Series X
0/52
0h
0%`;
    const r = parseXboxPaste(paste);
    expect(r.count).toBe(5);  // 3 played + 2 owned-not-played, all have ≥2 signals
    expect(r.rows.map(x => x.title)).toEqual([
      'Halo Infinite', 'Forza Horizon 5', 'Sea of Thieves', 'Cyberpunk 2077', 'Stalker 2'
    ]);
  });

  // v1.16.9 — iOS Safari clipboard format (cell-per-line, no delimiters)
  it('parses iOS Safari "one cell per line" plaintext (5-col TA pattern)', () => {
    const safariPaste = `Halo Infinite
Xbox Series X
50/120
42h 30m
42%
Forza Horizon 5
Xbox Series X|S
100/100
85h
100%
Sea of Thieves
Xbox One
60/200
120h 15m
30%
Microsoft Flight Simulator
PC
20/45
60h
44%`;
    const r = parseXboxPaste(safariPaste);
    expect(r.format).toBe('plaintext-table');
    expect(r.count).toBe(4);
    expect(r.rows[0].title).toBe('Halo Infinite');
    expect(r.rows[1].title).toBe('Forza Horizon 5');
    expect(r.rows[0].hours).toBe(42.5); // "42h 30m" parsed
    expect(r.rows[0].completionPct).toBe(42);
    expect(r.rows[3].platform).toBe('PC');
  });
});
