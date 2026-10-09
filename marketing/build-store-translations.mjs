// marketing/build-store-translations.mjs
// One file with the store listing in all 7 languages, for Play Console:
// Store presence → Main store listing → Manage translations → Import translations with AI.
// Run: node marketing/build-store-translations.mjs
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { LISTING } from './listing.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const LOCALE = { pl: 'pl-PL', en: 'en-US', es: 'es-ES', de: 'de-DE', fr: 'fr-FR', it: 'it-IT', pt: 'pt-BR' }
const LANG_NAME = { pl: 'Polish', en: 'English (United States)', es: 'Spanish (Spain)', de: 'German', fr: 'French (France)', it: 'Italian', pt: 'Portuguese (Brazil)' }

let out = 'PS5 Vault (com.skudev.ps5vault): Google Play store listing translations\n'
out += 'Each section is one language. Fields: App name, Short description, Full description.\n'
for (const [lang, L] of Object.entries(LISTING)) {
  out += `\n==================================================\n`
  out += `LANGUAGE: ${LANG_NAME[lang]} (${LOCALE[lang]})\n`
  out += `==================================================\n\n`
  out += `App name:\n${L.title}\n\n`
  out += `Short description:\n${L.short}\n\n`
  out += `Full description:\n${L.full}\n`
}
const file = path.join(ROOT, 'marketing', 'store', 'PS5Vault-tlumaczenia-sklep.txt')
fs.writeFileSync(file, out)
console.log(path.relative(ROOT, file), out.length, 'znaków')
