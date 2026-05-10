import { describe, it, expect } from 'vitest';
import { parsePlaynitePaste } from '../src/lib/playnite-import.js';

// Realistic Playnite Library Exporter JSON output (PascalCase native shape)
const PLAYNITE_NATIVE = JSON.stringify([
  {
    Id: 'guid-1',
    Name: 'The Witcher 3: Wild Hunt',
    Source: { Name: 'Steam' },
    Platforms: [{ Name: 'PC' }],
    Playtime: 360000,         // 100 hours in seconds
    LastActivity: '2024-12-15T18:30:00Z',
    CompletionStatus: { Name: 'Beaten' },
  },
  {
    Id: 'guid-2',
    Name: 'God of War Ragnarök',
    Source: { Name: 'PlayStation' },
    Platforms: [{ Name: 'PlayStation 5' }],
    Playtime: 144000,         // 40 hours
    LastActivity: '2025-04-01T12:00:00Z',
    CompletionStatus: { Name: 'Completed' },
  },
  {
    Id: 'guid-3',
    Name: 'Halo Infinite',
    Source: { Name: 'Xbox' },
    Platforms: [{ Name: 'Xbox Series X/S' }],
    Playtime: 7200,           // 2 hours
    LastActivity: null,
    CompletionStatus: { Name: 'Plan to Play' },
  },
  {
    Id: 'guid-4',
    Name: 'Cyberpunk 2077',
    Source: { Name: 'GOG' },
    Platforms: [{ Name: 'PC' }],
    Playtime: 18000,          // 5 hours
    LastActivity: '2023-08-20T20:00:00Z',
    CompletionStatus: { Name: 'Abandoned' },
  },
]);

// Custom-exporter shape (camelCase, flatter)
const PLAYNITE_CAMELCASE = JSON.stringify([
  {
    name: 'Hades',
    source: 'Steam',
    platform: 'PC',
    playtime: 72000,         // 20 hours
    completionStatus: 'Playing',
  },
  {
    name: 'Stardew Valley',
    source: 'Steam',
    platform: 'PC',
    playtime: 540000,        // 150 hours
    completionStatus: 'Played',
  },
]);

const WRAPPED = JSON.stringify({
  games: [
    { Name: 'Game A', Playtime: 3600, CompletionStatus: { Name: 'Beaten' } },
    { Name: 'Game B', Playtime: 7200, CompletionStatus: { Name: 'Playing' } },
  ],
});

describe('parsePlaynitePaste', () => {
  describe('Native PascalCase format (Library Exporter default)', () => {
    it('detects format and parses array', () => {
      const r = parsePlaynitePaste(PLAYNITE_NATIVE);
      expect(r.format).toBe('playnite-json');
      expect(r.count).toBe(4);
    });

    it('extracts titles', () => {
      const r = parsePlaynitePaste(PLAYNITE_NATIVE);
      expect(r.rows.map(g => g.title)).toEqual([
        'The Witcher 3: Wild Hunt',
        'God of War Ragnarök',
        'Halo Infinite',
        'Cyberpunk 2077',
      ]);
    });

    it('converts playtime seconds → fractional hours', () => {
      const r = parsePlaynitePaste(PLAYNITE_NATIVE);
      expect(r.rows[0].hours).toBe(100);   // 360000s = 100h
      expect(r.rows[1].hours).toBe(40);    // 144000s = 40h
      expect(r.rows[2].hours).toBe(2);     // 7200s = 2h
      expect(r.rows[3].hours).toBe(5);     // 18000s = 5h
    });

    it('maps Source/Platform to our enum', () => {
      const r = parsePlaynitePaste(PLAYNITE_NATIVE);
      expect(r.rows[0].platform).toBe('PC');                  // Steam → PC
      expect(r.rows[1].platform).toBe('PS5');                 // PlayStation 5 → PS5
      expect(r.rows[2].platform).toBe('Xbox Series X/S');
      expect(r.rows[3].platform).toBe('PC');                  // GOG → PC
    });

    it('maps CompletionStatus → our status (explicitStatus)', () => {
      const r = parsePlaynitePaste(PLAYNITE_NATIVE);
      expect(r.rows[0].explicitStatus).toBe('ukonczone');     // Beaten
      expect(r.rows[1].explicitStatus).toBe('ukonczone');     // Completed
      expect(r.rows[2].explicitStatus).toBe('planuje');       // Plan to Play
      expect(r.rows[3].explicitStatus).toBe('porzucone');     // Abandoned
    });

    it('preserves lastPlayed (null if missing)', () => {
      const r = parsePlaynitePaste(PLAYNITE_NATIVE);
      expect(r.rows[0].lastPlayed).toBe('2024-12-15T18:30:00Z');
      expect(r.rows[2].lastPlayed).toBe(null);
    });
  });

  describe('CamelCase / custom exporter shape', () => {
    it('parses camelCase fields', () => {
      const r = parsePlaynitePaste(PLAYNITE_CAMELCASE);
      expect(r.format).toBe('playnite-json');
      expect(r.count).toBe(2);
      expect(r.rows[0].title).toBe('Hades');
      expect(r.rows[0].hours).toBe(20);
      expect(r.rows[0].explicitStatus).toBe('gram');          // Playing
      expect(r.rows[1].explicitStatus).toBe('gram');          // Played
    });
  });

  describe('Wrapped object format', () => {
    it('handles { games: [...] } wrapper', () => {
      const r = parsePlaynitePaste(WRAPPED);
      expect(r.format).toBe('playnite-json');
      expect(r.count).toBe(2);
      expect(r.rows[0].title).toBe('Game A');
      expect(r.rows[0].explicitStatus).toBe('ukonczone');
    });
  });

  describe('error cases', () => {
    it('rejects empty input', () => {
      expect(parsePlaynitePaste('').count).toBe(0);
      expect(parsePlaynitePaste(null).count).toBe(0);
    });

    it('emits debug info on malformed JSON', () => {
      const r = parsePlaynitePaste('not valid json {');
      expect(r.format).toBe('unknown');
      expect(r.count).toBe(0);
      expect(r.debug).toBeTruthy();
      expect(r.debug.parseError).toBeTruthy();
    });

    it('emits debug on JSON without games array', () => {
      const r = parsePlaynitePaste('{"foo":"bar"}');
      expect(r.format).toBe('unknown');
      expect(r.count).toBe(0);
      expect(r.debug).toBeTruthy();
    });

    it('skips entries without title', () => {
      const json = JSON.stringify([
        { Name: 'Valid Game', Playtime: 3600 },
        { Playtime: 7200 },                    // no name → skipped
        { Name: '', Playtime: 1000 },          // empty name → skipped
        { Name: 'Another', Playtime: 0 },
      ]);
      const r = parsePlaynitePaste(json);
      expect(r.count).toBe(2);
      expect(r.rows.map(g => g.title)).toEqual(['Valid Game', 'Another']);
    });
  });
});
