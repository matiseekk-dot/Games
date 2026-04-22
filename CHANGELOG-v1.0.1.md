# PS5 Vault — v1.0.1 Changelog

**Release target:** halfway update during closed testing (~26.04.2026)
**Previous version:** 1.0.0

## 🐛 Bug fixes

### #B01 — Export file name on Android (TWA)
- **Before:** file saved as `download.json` or `data.json` on Android, despite code setting correct name
- **Cause:** Android TWA ignores `a.download` attribute when `<a>` element is not in DOM
- **Fix:** append `<a>` to `document.body` before click, remove after, revoke blob URL
- **File name:** now `PS5Vault_Backup_YYYY-MM-DD.json` (was `ps5vault-backup-YYYY-MM-DD.json`)
- **Bonus:** flash toast "✓ Backup zapisany" after export (confirmation feedback)

### #B02 — RAWG search flicker + race condition
- **Before:** old search results (e.g. "Elden Ring") stayed visible when user typed new query (e.g. "God of War")
- **Cause:** `setRes([])` only called when input was empty, not on every new query. Also: no guard against out-of-order async responses
- **Fix:** clear results immediately on every keystroke + request ID guard (`reqId.current`) ignores stale responses
- **Bonus:** "Searching..." loading state in dropdown while waiting for results

## 💡 UX improvements

### #F01 — Finance tab info banner
- **Before:** testers confused where financial data came from (suspected API)
- **Fix:** inline banner above KPI grid explaining "Financial data comes from prices you entered manually"
- Visible in both populated and empty state (most important when empty to set expectations)

### Currency consistency
- **Before:** `pln()` helper returned `$XXX` for EN language, `XXX zł` for PL — inconsistent with PL pricing model (product sold in PLN, app for Polish market)
- **Fix:** currency always displayed in `zł` regardless of UI language. Fixed 3 inline `$/h` conditionals and 2 EN label strings

### Onboarding CTA
- **Before:** final onboarding button "GET STARTED →" dropped user into empty Home screen — classic drop-off point
- **Fix:** primary CTA now "+ ADD FIRST GAME" opens Add Game modal directly; secondary text link "Skip, I'll add later" for users who want to explore first
- **Expected impact:** significant reduction in D1 churn (largest single UX drop-off identified in product audit)

## 🔒 Security / Hygiene

### RAWG API key → environment variables
- **Before:** `RAWG_KEY` hardcoded in `src/App.jsx:4`, visible in Git history
- **Fix:** now reads from `import.meta.env.VITE_RAWG_KEY`, fallback to hardcoded for backward compat
- Added `.env.example` with instructions
- Added `.env`, `.env.local`, `.env.production` to `.gitignore`
- **GitHub Actions:** add repository secret `VITE_RAWG_KEY` before next deploy, otherwise build uses fallback

### ErrorBoundary wrapper (`src/main.jsx`)
- **Before:** any thrown error in React tree = white screen, no recovery
- **Fix:** full-app ErrorBoundary with bilingual fallback UI (PL/EN), "Try again" (soft reset) and "Reload app" (hard reload) actions
- Errors logged to `localStorage.ps5vault_error_log` (last 10 entries) for future telemetry
- Shows error count — if user hits 2+ errors in session, UI suggests reporting via feedback

## 🔧 Tech debt

### Service Worker cache bump: `ps5vault-v5` → `ps5vault-v6`
- **Critical:** without this bump, testers stuck on v1.0.0 in cache would not receive the update
- Old cache `ps5vault-v5` explicitly deleted on activation (was already in SW logic)

### Version bump
- `package.json` → 1.0.1

---

## Deployment checklist

1. ✅ Extract `ps5vault-v1.0.1.zip` into repo (replace `ps5-vault/` folder)
2. ⬜ **Add GitHub repository secret** `VITE_RAWG_KEY` with value `0c13edec026d489a97cc183170d796fd` (or generate new key at rawg.io/apidocs)
3. ⬜ Update `.github/workflows/deploy.yml` to pass env var to build step (see workflow section below)
4. ⬜ Commit + push (GitHub Actions auto-deploys)
5. ⬜ Wait ~2-3 min for deploy
6. ⬜ Verify at `matiseekk-dot.github.io/Games/` — hard refresh (Cmd/Ctrl+Shift+R) to bypass local cache
7. ⬜ Check DevTools → Application → Service Worker shows `ps5vault-v6` cache
8. ⬜ Test: export a backup → verify filename `PS5Vault_Backup_2026-04-XX.json` + toast appears
9. ⬜ Test: fresh onboarding (clear localStorage) → "+ ADD FIRST GAME" opens modal
10. ⬜ Test: RAWG search → type "elden" then "god" → old results clear immediately

## GitHub Actions workflow update

If your current `.github/workflows/deploy.yml` doesn't pass env vars, add this env block to the build step:

```yaml
- name: Build
  run: npm run build
  env:
    VITE_RAWG_KEY: ${{ secrets.VITE_RAWG_KEY }}
```

If you skip steps 2-3, the app will still work — it uses the hardcoded fallback key. But your key stays in future Git history commits, which is what we're trying to avoid.

## Testing notes

- **Build verified:** `npm run build` passes, 829 modules, no syntax errors
- **Bundle size:** 619KB raw / 177KB gzipped (unchanged from v1.0.0 — no new deps)
- **Backward compat:** existing localStorage data works without migration (no schema changes)
- **NOT tested live on Android TWA:** #B01 fix is based on known Android behavior but requires tester verification on closed testing track

## What's NOT in this release (deferred to v1.1)

- Hours formatting `2h 54min` instead of `2.9h` (#B03) — deferred to v1.1 block "Time Tracking Insights" to go together with session history + pause timer
- Session history save (#B04) — blocker for time stats, v1.1
- Weekly/monthly/daily play stats (#F07) — v1.1
- Pause in session timer (#F08) — v1.1
- Full App.jsx refactor into components — v2.0 tech debt
