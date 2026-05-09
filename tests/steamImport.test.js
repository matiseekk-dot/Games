import { describe, it, expect } from 'vitest';
import { parseSteamPaste } from '../src/lib/steam-import.js';

const RG_GAMES_JS = `var rgGames = [{"appid":1245620,"name":"ELDEN RING","logo":"https://x","playtime_forever":5840,"last_played":1730000000},{"appid":2358720,"name":"Black Myth: Wukong","playtime_forever":1200},{"appid":730,"name":"Counter-Strike 2","playtime_forever":0}];`;

const RAW_JSON_ARRAY = `[{"name":"Hades","playtime_forever":2400},{"name":"Stardew Valley","playtime_forever":900}]`;

const JSON_OBJECT_FORM = `{"rgGames":[{"name":"Slay the Spire","playtime_forever":600}]}`;

const PLAINTEXT = `Cyberpunk 2077
Baldur's Gate 3
Hollow Knight`;

describe('parseSteamPaste', () => {
  it('parses var rgGames = [...] form (Steam page source)', () => {
    const r = parseSteamPaste(RG_GAMES_JS);
    expect(r.format).toBe('js');
    expect(r.count).toBe(3);
    expect(r.rows[0].title).toBe('ELDEN RING');
    expect(r.rows[0].platform).toBe('PC');
    expect(r.rows[0].hours).toBe(97.3);  // 5840 min / 60 = 97.3h
    expect(r.rows[1].hours).toBe(20);    // 1200 min = 20h
    expect(r.rows[2].hours).toBe(0);     // never played
  });

  it('converts last_played unix timestamp to ISO', () => {
    const r = parseSteamPaste(RG_GAMES_JS);
    expect(r.rows[0].lastPlayed).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(r.rows[1].lastPlayed).toBe(null);  // no last_played field
  });

  it('parses raw JSON array form', () => {
    const r = parseSteamPaste(RAW_JSON_ARRAY);
    expect(r.format).toBe('json-array');
    expect(r.count).toBe(2);
    expect(r.rows[0].title).toBe('Hades');
    expect(r.rows[0].hours).toBe(40);  // 2400/60
  });

  it('parses JSON object with rgGames key', () => {
    const r = parseSteamPaste(JSON_OBJECT_FORM);
    expect(r.format).toBe('json-object');
    expect(r.count).toBe(1);
    expect(r.rows[0].title).toBe('Slay the Spire');
  });

  it('parses plaintext newline-separated titles as last resort', () => {
    const r = parseSteamPaste(PLAINTEXT);
    expect(r.format).toBe('plaintext');
    expect(r.count).toBe(3);
    expect(r.rows[0].title).toBe('Cyberpunk 2077');
    expect(r.rows[0].platform).toBe('PC');
    expect(r.rows[0].hours).toBe(0);
  });

  it('rejects empty/null input', () => {
    expect(parseSteamPaste('').count).toBe(0);
    expect(parseSteamPaste(null).count).toBe(0);
  });

  it('rejects malformed JSON garbage as plaintext if it looks JSON-ish', () => {
    const r = parseSteamPaste('{"name":"A"\n"name":"B"');  // broken JSON, JSON-ish lines
    expect(r.format).toBe('unknown');
  });

  it('all rows default platform to PC', () => {
    const r = parseSteamPaste(RG_GAMES_JS);
    r.rows.forEach(row => expect(row.platform).toBe('PC'));
  });
});
