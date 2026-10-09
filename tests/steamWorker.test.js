// v1.22.0 - Steam library by nickname through the Worker
import { describe, it, expect, afterEach, vi } from 'vitest';
import worker, { parseSteamInput } from '../worker/src/index.js';

afterEach(() => vi.unstubAllGlobals());
const ID = '76561197960287930';
const env = { STEAM_API_KEY: 'k' };
const get = id => worker.fetch(new Request('https://w.dev/steam?id=' + encodeURIComponent(id)), env);

function fakeSteam({ vanity = { success: 1, steamid: ID }, owned }) {
  const fn = vi.fn(async url => {
    if (String(url).includes('ResolveVanityURL')) return new Response(JSON.stringify({ response: vanity }));
    if (String(url).includes('GetOwnedGames')) return new Response(JSON.stringify({ response: owned }));
    throw new Error('unexpected ' + url);
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

describe('parseSteamInput', () => {
  it('reads nicknames, profile links and SteamID64', () => {
    expect(parseSteamInput(' gaben ')).toEqual({ vanity: 'gaben' });
    expect(parseSteamInput('https://steamcommunity.com/id/gaben/')).toEqual({ vanity: 'gaben' });
    expect(parseSteamInput('steamcommunity.com/profiles/' + ID + '/games')).toEqual({ steamid: ID });
    expect(parseSteamInput(ID)).toEqual({ steamid: ID });
    expect(parseSteamInput('a b')).toBe(null);
    expect(parseSteamInput('')).toBe(null);
  });
});

describe('GET /steam', () => {
  it('resolves a nickname and returns the games', async () => {
    const fn = fakeSteam({ owned: { game_count: 1, games: [{ appid: 10, name: 'Counter-Strike', playtime_forever: 120, rtime_last_played: 1700000000 }] } });
    const res = await get('gaben');
    expect(res.status).toBe(200);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://matiseekk-dot.github.io');
    expect(await res.json()).toEqual({ steamid: ID, games: [{ appid: 10, name: 'Counter-Strike', playtime_forever: 120, last_played: 1700000000 }] });
    expect(String(fn.mock.calls[1][0])).toContain('steamid=' + ID);
  });
  it('404 for an unknown nickname, 403 for a private library, 400 for junk', async () => {
    fakeSteam({ vanity: { success: 42 } });
    expect((await get('nobody_here')).status).toBe(404);
    fakeSteam({ owned: {} });
    expect((await get(ID)).status).toBe(403);
    expect((await get('<script>')).status).toBe(400);
  });
  it('503 until the Steam key is set', async () => {
    const res = await worker.fetch(new Request('https://w.dev/steam?id=gaben'), {});
    expect(res.status).toBe(503);
  });
});
