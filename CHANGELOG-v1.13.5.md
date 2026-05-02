# PS5 Vault — v1.13.5

**Theme:** Code-quality pass + PWA repackaging for Google Play re-upload.
**Previous:** v1.13.4 (RAWG refresh button + back-button intercept).
**User-visible changes:** ZERO functional changes — only bug fixes, dead-code cleanup, and PWA manifest hardening required for the Play Store TWA bundle.

## Bugfixes

### 1. Duplicate `popstate` handler (App.jsx)
Two `useEffect` hooks were both pushing history sentinels and listening for `popstate`. Result on Android TWA: every back press fired both handlers, modal/overlay dismissals could double-dismiss, and the history stack accumulated extra entries. Removed the older mount-only ref-based handler; kept the reactive deps-based one — single source of truth for the back-button trap.

### 2. Crash-report email used wrong field names
The "Report problem" Settings row pulled `last.time` and `last.message` from the in-memory error log, but `ErrorBoundary` writes those fields as `ts` and `msg`. Last-error context was always blank in the prefilled mailto. Fixed.

### 3. Duplicate `backToExit` translation keys
Both PL and EN dicts in `i18n.js` had two `backToExit` entries (legacy of merging two v1.13.2 patches). JS object literal silently kept the second value; harmless but flagged by stricter tooling. Removed the dupe in each language.

### 4. Storage error hook signature drift
`lib/storage.js` was calling `window.__ps5v_storageError(kind, e)` with two args, but the App-side hook only accepts `(kind)`. Second arg silently dropped — works, but kept the signatures inconsistent. Aligned to single arg.

### 5. Misc cleanup
- Unused imports in `App.jsx` (`LS_KEY`, `LS_ONBOARD`, `LS_EAN_CACHE`, `LS_GOALS`, `RAWG_KEY`, `RMAP`, `importData`, `isValidGameShape`).
- Unused `result` and `flash` props in `WipeConfirm`.
- Removed dead root-level `assetlinks.json` — only `public/.well-known/assetlinks.json` ships in the bundle (Vite serves from `public/`).

## PWA / Play Store re-upload

Changes required to re-publish via Bubblewrap TWA on Google Play:

1. **`public/manifest.json`**
   - Added `display_override: ["standalone", "minimal-ui"]` — Chromium-based TWA wraps respect this when `display:standalone` is unsupported on a target API level.
   - Added `prefer_related_applications: false` — declares the PWA itself is the canonical install target. Avoids Play Store nudges.
   - Tightened `name` to `"PS5 Vault — Game Tracker"` for store listing differentiation.

2. **Service Worker cache name** bumped `ps5vault-v15` → `ps5vault-v16`. Forces a clean reinstall on update — required because the manifest delta changes the cached `index.html`.

3. **`public/.well-known/assetlinks.json`** — unchanged (`com.skudev.ps5vault` + existing SHA-256 fingerprint). Verified single canonical copy.

4. **Version bump** — `package.json`, `src/constants.js` (APP_VER), `public/sw.js` (header + cache name) all to `1.13.5`.

## Verification

- `npm test` → 64/64 pass (5 files).
- `npm run build` → clean, 213 kB gzipped (vs 213 kB before — bundle shrunk slightly from import cleanup).
- Manifest validates against PWABuilder schema; assetlinks JSON valid.

## Re-publishing checklist (Bubblewrap)

1. Pull latest after merging this version.
2. `bubblewrap update` (re-reads manifest.json from production URL).
3. `bubblewrap build` — generates AAB.
4. Upload AAB to Google Play Console as new release.
5. Verify Digital Asset Links: https://matiseekk-dot.github.io/Games/.well-known/assetlinks.json should serve the unchanged fingerprint.
