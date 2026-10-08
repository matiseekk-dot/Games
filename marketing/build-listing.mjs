// marketing/build-listing.mjs
// Składa PLAY_STORE_LISTING.md z tekstów w marketing/listing.mjs.
// Run: node marketing/build-listing.mjs
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { LISTING, LIMITS } from './listing.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const len = s => [...s].length
const block = s => '```\n' + s + '\n```'

let md = fs.readFileSync(path.join(ROOT, 'marketing', 'listing-head.md'), 'utf8')
for (const [, L] of Object.entries(LISTING)) {
  md += `\n---\n\n## ${L.name}\n\n`
  md += `**Nazwa aplikacji** (${len(L.title)}/${LIMITS.title})\n\n${block(L.title)}\n\n`
  md += `**Krótki opis** (${len(L.short)}/${LIMITS.short})\n\n${block(L.short)}\n\n`
  md += `**Pełny opis** (${len(L.full)}/${LIMITS.full})\n\n${block(L.full)}\n\n`
  md += `**Co nowego w tej wersji** (${len(L.whatsNew)}/${LIMITS.whatsNew})\n\n${block(L.whatsNew)}\n`
}
md += '\n' + fs.readFileSync(path.join(ROOT, 'marketing', 'listing-tail.md'), 'utf8')
fs.writeFileSync(path.join(ROOT, 'PLAY_STORE_LISTING.md'), md)
console.log('PLAY_STORE_LISTING.md:', md.length, 'znaków')
