import { describe, it, expect } from 'vitest';
import { parsePsnProfilesPaste } from '../src/lib/psnprofiles-import.js';

// Sample CSV mimicking PSN-Profiles export. Header lowercase + quoted titles with commas.
const CSV_BASIC = `Game,Platform,Trophies,Hours,Progress
"God of War Ragnarök",PS5,36/36,18,100%
"Elden Ring","PS5,PS4",42/42,95,100%
"FC 25",PS5,12/45,42,27%`;

const CSV_NO_HOURS = `Title,Platform,Progress
"Bloodborne",PS4,100%
"Demon's Souls",PS5,80%`;

const CSV_HOURS_FORMATS = `Title,Hours
"A","12"
"B","12h"
"C","12h 30m"
"D","2.5"
"E",""
"F","-"
"G","N/A"`;

const CSV_TITLE_ONLY = `Title
"Spider-Man 2"
"GTA V"
"Ratchet"`;

describe('parsePsnProfilesPaste', () => {
  describe('CSV parsing', () => {
    it('parses basic PSN-Profiles export with title/platform/hours/progress', () => {
      const r = parsePsnProfilesPaste(CSV_BASIC);
      expect(r.format).toBe('csv');
      expect(r.count).toBe(3);
      expect(r.rows[0].title).toBe('God of War Ragnarök');
      expect(r.rows[0].platform).toBe('PS5');
      expect(r.rows[0].hours).toBe(18);
      expect(r.rows[0].completionPct).toBe(100);
    });

    it('handles quoted fields with embedded commas (PS5,PS4 → PS5 first)', () => {
      const r = parsePsnProfilesPaste(CSV_BASIC);
      expect(r.rows[1].title).toBe('Elden Ring');
      expect(r.rows[1].platform).toBe('PS5');  // first of "PS5,PS4"
    });

    it('partial match: only Title column is enough', () => {
      const r = parsePsnProfilesPaste(CSV_TITLE_ONLY);
      expect(r.count).toBe(3);
      expect(r.rows[0].title).toBe('Spider-Man 2');
      expect(r.rows[0].platform).toBe('PS5');  // default
      expect(r.rows[0].hours).toBe(0);
      expect(r.rows[0].completionPct).toBe(null);
    });

    it('parses % completion correctly (rounds to int)', () => {
      const csv = 'Title,Progress\n"A","92.7%"\n"B","100%"';
      const r = parsePsnProfilesPaste(csv);
      expect(r.rows[0].completionPct).toBe(93);
      expect(r.rows[1].completionPct).toBe(100);
    });

    it('rejects input without a Title column', () => {
      const csv = 'Platform,Hours\nPS5,10';
      const r = parsePsnProfilesPaste(csv);
      expect(r.count).toBe(0);
    });

    it('returns empty result on blank/null input', () => {
      expect(parsePsnProfilesPaste('').count).toBe(0);
      expect(parsePsnProfilesPaste(null).count).toBe(0);
      expect(parsePsnProfilesPaste(undefined).count).toBe(0);
    });

    it('skips empty lines', () => {
      const csv = 'Title\n"A"\n\n"B"\n\n';
      const r = parsePsnProfilesPaste(csv);
      expect(r.count).toBe(2);
    });
  });

  describe('hours format flexibility', () => {
    it('accepts plain integer / "12h" / "12h 30m" / decimal / blank / "-" / "N/A"', () => {
      const r = parsePsnProfilesPaste(CSV_HOURS_FORMATS);
      const hoursByTitle = Object.fromEntries(r.rows.map(x => [x.title, x.hours]));
      expect(hoursByTitle.A).toBe(12);
      expect(hoursByTitle.B).toBe(12);
      expect(hoursByTitle.C).toBe(12.5);
      expect(hoursByTitle.D).toBe(2.5);
      expect(hoursByTitle.E).toBe(0);
      expect(hoursByTitle.F).toBe(0);
      expect(hoursByTitle.G).toBe(0);
    });
  });

  describe('platform normalization', () => {
    it('maps PS5/PS4 to PS5/PS4, anything else to PS5 default or Other', () => {
      const csv = 'Title,Platform\n"A","PS5"\n"B","PS4"\n"C","PS3"\n"D","PSVita"\n"E",""';
      const r = parsePsnProfilesPaste(csv);
      const byT = Object.fromEntries(r.rows.map(x => [x.title, x.platform]));
      expect(byT.A).toBe('PS5');
      expect(byT.B).toBe('PS4');
      expect(byT.C).toBe('Other');   // PS3 → Other (not in PLATFORMS enum)
      expect(byT.D).toBe('Other');
      expect(byT.E).toBe('PS5');     // empty → default
    });
  });

  describe('JSON parsing (forward-compat)', () => {
    it('parses JSON array of game objects', () => {
      const json = JSON.stringify([
        { title: 'A', platform: 'PS5', hours: 10, completion: '50%' },
        { title: 'B', platform: 'PS4', hours: 20 },
      ]);
      const r = parsePsnProfilesPaste(json);
      expect(r.format).toBe('json');
      expect(r.count).toBe(2);
      expect(r.rows[0].completionPct).toBe(50);
      expect(r.rows[1].hours).toBe(20);
    });

    it('parses JSON object with games array', () => {
      const json = JSON.stringify({ games: [{ title: 'A' }, { title: 'B' }] });
      const r = parsePsnProfilesPaste(json);
      expect(r.format).toBe('json');
      expect(r.count).toBe(2);
    });
  });

  // v1.16.14 — PSN-Profiles native MyGameCollection export format (multi-line
  // per game, separated by tabs). User's actual paste from psnprofiles.com.
  describe('PSN-Profiles native multi-line export format', () => {
    const REAL_PSN_PASTE = `Crimson Desert
2 of 35 Trophies
3rd May 2026
PS5
E
RANK
0
0
2
3%

2.42%
\t
Peppa Pig: World Adventures
9 of 13 Trophies
24th April 2026
PS5
C
RANK
9
0
0
84%

73.15%
\t
Car Mechanic Simulator
0 of 37 Trophies
PS4
F
RANK
0
0
0
0%

2.03%
\t
Ghost of Tsushima
32 of 77 Trophies
17th February 2026
PS5PC
C
RANK
1
4
27
37%

40.25%
2.94%
\t`;

    it('detects native format and parses each game block', () => {
      const r = parsePsnProfilesPaste(REAL_PSN_PASTE);
      expect(r.format).toBe('psn-native');
      expect(r.count).toBe(4);
      expect(r.rows.map(g => g.title)).toEqual([
        'Crimson Desert', 'Peppa Pig: World Adventures',
        'Car Mechanic Simulator', 'Ghost of Tsushima',
      ]);
    });

    it('parses trophy fractions correctly', () => {
      const r = parsePsnProfilesPaste(REAL_PSN_PASTE);
      expect(r.rows[0].trophies).toBe('2/35');
      expect(r.rows[1].trophies).toBe('9/13');
      expect(r.rows[2].trophies).toBe('0/37');
      expect(r.rows[3].trophies).toBe('32/77');
    });

    it('parses completion %', () => {
      const r = parsePsnProfilesPaste(REAL_PSN_PASTE);
      expect(r.rows[0].completionPct).toBe(3);
      expect(r.rows[1].completionPct).toBe(84);
      expect(r.rows[2].completionPct).toBe(0);
      expect(r.rows[3].completionPct).toBe(37);
    });

    it('parses dates "3rd May 2026" → ISO', () => {
      const r = parsePsnProfilesPaste(REAL_PSN_PASTE);
      expect(r.rows[0].lastPlayed).toMatch(/^2026-05-03/);
      expect(r.rows[1].lastPlayed).toMatch(/^2026-04-24/);
      expect(r.rows[2].lastPlayed).toBe(null);  // unplayed game has no date
      expect(r.rows[3].lastPlayed).toMatch(/^2026-02-17/);
    });

    it('normalizes platform variants', () => {
      const r = parsePsnProfilesPaste(REAL_PSN_PASTE);
      expect(r.rows[0].platform).toBe('PS5');
      expect(r.rows[2].platform).toBe('PS4');
      expect(r.rows[3].platform).toBe('PS5');  // PS5PC → PS5 (first platform)
    });
  });

  describe('partial / dirty input', () => {
    it('skips rows without title', () => {
      const csv = 'Title,Hours\n"A","10"\n,"5"\n"C","8"';
      const r = parsePsnProfilesPaste(csv);
      expect(r.count).toBe(2);
      expect(r.rows.map(x => x.title)).toEqual(['A', 'C']);
    });

    it('keeps row even when hours/completion missing', () => {
      const r = parsePsnProfilesPaste(CSV_NO_HOURS);
      expect(r.count).toBe(2);
      expect(r.rows[0].hours).toBe(0);
      expect(r.rows[0].completionPct).toBe(100);
    });
  });
});
