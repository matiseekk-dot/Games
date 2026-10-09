// v1.22.0 - sync between phones through the Drive copy
import { describe, it, expect } from 'vitest';
import { stampChanges, removedIds, mergeLists, mergeSync, mergeTombstones } from '../src/lib/sync.js';

const g = (id, title, updatedAt, extra = {}) => ({ id, title, platform: 'PS5', updatedAt, ...extra });

describe('stampChanges', () => {
  it('stamps new and edited games, leaves the rest alone', () => {
    const a = g('a', 'A', '2026-01-01T00:00:00Z');
    const b = g('b', 'B', '2026-01-01T00:00:00Z');
    const prev = [a, b];
    const next = [a, { ...b, hours: 3 }, { id: 'c', title: 'C' }];
    const out = stampChanges(prev, next, 'NOW');
    expect(out[0]).toBe(a);
    expect(out[1].updatedAt).toBe('NOW');
    expect(out[2].updatedAt).toBe('NOW');
  });
  it('a game brought back by undo is newer than its tombstone', () => {
    const a = g('a', 'A', '2026-01-01T00:00:00Z');
    expect(stampChanges([], [a], 'NOW')[0].updatedAt).toBe('NOW');
  });
  it('lists removed ids', () => {
    expect(removedIds([g('a'), g('b')], [g('b')])).toEqual(['a']);
  });
});

describe('mergeLists', () => {
  it('newer edit wins, games from both phones are kept', () => {
    const local = [g('a', 'A', '2026-02-01T00:00:00Z', { hours: 1 }), g('b', 'B', '2026-01-01T00:00:00Z')];
    const remote = [g('a', 'A', '2026-03-01T00:00:00Z', { hours: 9 }), g('c', 'C', '2026-01-01T00:00:00Z')];
    const { list, changed } = mergeLists(local, remote, {});
    expect(changed).toBe(true);
    expect(list.map(x => x.id)).toEqual(['a', 'b', 'c']);
    expect(list[0].hours).toBe(9);
  });
  it('an older remote edit does not overwrite this phone', () => {
    const local = [g('a', 'A', '2026-03-01T00:00:00Z', { hours: 5 })];
    const { list, changed } = mergeLists(local, [g('a', 'A', '2026-01-01T00:00:00Z', { hours: 1 })], {});
    expect(changed).toBe(false);
    expect(list[0].hours).toBe(5);
  });
  it('a deletion on the other phone removes the game here, a later edit keeps it', () => {
    const local = [g('a', 'A', '2026-01-01T00:00:00Z'), g('b', 'B', '2026-05-01T00:00:00Z')];
    const tombs = { a: '2026-02-01T00:00:00Z', b: '2026-02-01T00:00:00Z' };
    const { list } = mergeLists(local, [], tombs);
    expect(list.map(x => x.id)).toEqual(['b']);
  });
  it('the same game added on two phones is kept once with the same id on both', () => {
    const p1 = mergeLists([g('x2', 'Elden Ring', '2026-01-01T00:00:00Z')], [g('x1', 'elden ring', '2026-01-02T00:00:00Z')], {}).list;
    const p2 = mergeLists([g('x1', 'Elden Ring', '2026-01-02T00:00:00Z')], [g('x2', 'Elden Ring', '2026-01-01T00:00:00Z')], {}).list;
    expect(p1.map(x => x.id)).toEqual(['x1']);
    expect(p2.map(x => x.id)).toEqual(['x1']);
  });
  it('same title on another platform stays a separate game', () => {
    const { list } = mergeLists([g('a', 'Hades', '2026-01-01T00:00:00Z')], [{ ...g('b', 'Hades', '2026-01-01T00:00:00Z'), platform: 'PC' }], {});
    expect(list).toHaveLength(2);
  });
});

describe('mergeSync', () => {
  it('merges games, wishlist and tombstones from an old backup without tombstones', () => {
    const m = mergeSync(
      { games: [g('a', 'A', '2026-01-01T00:00:00Z')], wishlist: [], tombstones: {}, wishTombstones: {} },
      { games: [g('b', 'B', '2026-01-01T00:00:00Z')], wishlist: [{ id: 'w', title: 'W', addedAt: '2026-01-01T00:00:00Z' }] },
      Date.parse('2026-06-01T00:00:00Z'),
    );
    expect(m.games.map(x => x.id)).toEqual(['a', 'b']);
    expect(m.wishlist.map(x => x.id)).toEqual(['w']);
    expect(m.gamesChanged && m.wishChanged).toBe(true);
  });
  it('drops tombstones older than half a year', () => {
    const now = Date.parse('2026-10-01T00:00:00Z');
    expect(mergeTombstones({ a: '2026-01-01T00:00:00Z' }, { b: '2026-09-01T00:00:00Z' }, now)).toEqual({ b: '2026-09-01T00:00:00Z' });
  });
});
