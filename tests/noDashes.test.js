// House style: no em dashes (U+2014) or en dashes (U+2013) anywhere in the app's
// source or shipped pages: UI strings, comments, privacy policy. Rephrase with a comma,
// colon or period instead. Code that must *match* those characters (e.g. the barcode
// title cleanup) writes them as – / — escapes.
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '..');
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}
const files = [
  ...walk(path.join(root, 'src')),
  path.join(root, 'public/sw.js'),
  path.join(root, 'public/privacy.html'),
  path.join(root, 'index.html'),
  ...walk(path.join(root, 'worker/src')),
];

describe('no em/en dashes in shipped source', () => {
  it.each(files.map(f => [path.relative(root, f), f]))('%s', (_, f) => {
    const text = fs.readFileSync(f, 'utf8');
    const hits = [...text.matchAll(/[–—]/g)].map(m => {
      const line = text.slice(0, m.index).split('\n').length;
      return `line ${line}: ${text.slice(Math.max(0, m.index - 30), m.index + 20).replace(/\s+/g, ' ')}`;
    });
    expect(hits).toEqual([]);
  });
});
