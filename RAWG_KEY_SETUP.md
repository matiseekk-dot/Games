# RAWG Key Rotation — Manual Steps

This file documents how to rotate the RAWG API key embedded in PS5 Vault.

## Why rotation matters

The RAWG key (currently `0c13edec...`) is hardcoded as a fallback in `src/constants.js` and **visible in any compiled bundle**. Anyone who inspects the deployed `index-*.js` can extract and reuse it. While free tier (20000 requests/month) means abuse won't cost real money, a malicious user could exhaust the quota and break recommendations/search for legitimate users.

After rotation:
- New key lives in **GitHub repository secret** (`RAWG_KEY`), never committed to source.
- Build pipeline injects it as `VITE_RAWG_KEY` env var → Vite bundles it during compile.
- Old key gets revoked on rawg.io → any scraper using the leaked key gets 401s.

## One-time setup (do this once, ~10 minutes)

### Step 1 — Get a new RAWG API key

1. Go to <https://rawg.io/apidocs> and sign in (or create an account).
2. Click **"Get API Key"** if you don't have one yet.
3. If you already have one, the dashboard shows it — note this is the **same** key currently hardcoded in `constants.js`. You need to **request a NEW one**:
   - There's no rotation UI directly. Workaround: contact RAWG support (`api@rawg.io`) and ask for key rotation, OR sign up with a different email and use that account's key.
   - For personal projects, simpler path: just generate a new key on a fresh account (separate email) and treat the old account as deprecated.
4. Copy the new key — you'll paste it as a GitHub secret in Step 2.

### Step 2 — Add the key as a GitHub repository secret

1. Go to your repo on GitHub: <https://github.com/matiseekk-dot/Games>
2. **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
3. Name: `RAWG_KEY` (exact spelling, case-sensitive)
4. Value: paste the new RAWG key (no quotes, no spaces)
5. Click **Add secret**

### Step 3 — Remove the fallback from `constants.js` (optional but recommended)

Once you've confirmed the secret works, remove the hardcoded fallback so the bundle has no embedded key at all. Edit `src/constants.js`:

```diff
- export const RAWG_KEY = import.meta.env.VITE_RAWG_KEY || '0c13edec026d489a97cc183170d796fd';
+ export const RAWG_KEY = import.meta.env.VITE_RAWG_KEY || '';
```

This means: if the GH secret is missing, the bundle ships with empty key → RAWG API calls fail gracefully (search returns `[]`, recommendations show empty state). Better than leaking key.

**Don't remove the fallback yet** if you can't immediately verify the deploy works — the fallback prevents an empty bundle from shipping if the secret is misconfigured.

### Step 4 — Trigger a deploy

Push any commit to `main` (e.g. an empty commit) or trigger the workflow manually:

```bash
git commit --allow-empty -m "Rotate RAWG key"
git push
```

Or in GitHub UI: **Actions** → **Deploy to GitHub Pages** → **Run workflow** → **main** → **Run workflow**.

### Step 5 — Verify the new key is in the deployed bundle

After deploy completes (~2 min):

1. Open <https://matiseekk-dot.github.io/Games/> in incognito.
2. DevTools → **Network** → filter by "index" → find the JS bundle (e.g. `index-XYZ123.js`).
3. View source / Search the bundle for the **first 10 chars** of your new key (e.g. `ab12cd34ef`).
4. ✓ If found — rotation worked. New key is live.
5. ✗ If you see the OLD key (`0c13edec`) — secret didn't propagate. Check that `RAWG_KEY` secret name is exact, and re-trigger the deploy.

### Step 6 — Revoke the old key on rawg.io

Once Step 5 confirms the new key is live, revoke the old one. As of this writing rawg.io doesn't have a self-service revoke UI — email `api@rawg.io` and ask them to revoke key `0c13edec026d489a97cc183170d796fd`.

If they don't respond / can't revoke: at minimum the old key is no longer in any new builds. Existing users with the old bundle in their browser cache will keep using the old key for ~30-60 days until cache expires (SW cache strategy is network-first, so they'll get the new bundle on next online visit).

## Local dev workflow

For local `npm run dev`, the key isn't injected from GH Actions. Two options:

**Option A: `.env.local`** (recommended)
1. Copy `.env.example` → `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Edit `.env.local`:
   ```
   VITE_RAWG_KEY=your_actual_key_here
   ```
3. `.env.local` is in `.gitignore` — won't be committed. Vite picks it up automatically.

**Option B: Use the fallback**
If you don't create `.env.local`, the hardcoded fallback in `constants.js` kicks in (same key as before rotation). Fine for local development, problematic for production.

## Future rotations (every 6 months — recommended cadence)

Once setup is done, rotation is just:

1. Generate new key on rawg.io (or use existing alt account)
2. GitHub Settings → Secrets → edit `RAWG_KEY` → paste new value
3. Push empty commit to trigger redeploy
4. Verify in deployed bundle (Step 5 above)
5. Email rawg.io to revoke previous key

Total time: ~5 minutes per rotation.

## Verification checklist

- [ ] `RAWG_KEY` secret exists in GitHub repo settings
- [ ] `.github/workflows/deploy.yml` has `VITE_RAWG_KEY: ${{ secrets.RAWG_KEY }}` in build step env
- [ ] `src/constants.js` reads `import.meta.env.VITE_RAWG_KEY` (already done as of v1.10.x)
- [ ] `.env.local` in `.gitignore` (already done)
- [ ] Local dev has `.env.local` with valid key
- [ ] Deployed bundle contains new key, not fallback (Step 5 verification)
- [ ] (Optional, recommended) Fallback removed from `constants.js` after first successful deploy
- [ ] Old key revoked on rawg.io
