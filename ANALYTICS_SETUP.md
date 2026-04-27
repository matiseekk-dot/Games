# Cloudflare Web Analytics — Setup Manual

This file documents how to wire up Cloudflare Web Analytics for the deployed PS5 Vault site at `https://matiseekk-dot.github.io/Games/`.

## What you get

Free, cookieless, no-PII analytics for your deployed PWA:

- Pageviews per day (total + unique visitors)
- Country breakdown (where visitors come from)
- Browser + OS breakdown
- Referrer breakdown (Google, direct, social media, etc.)
- Page-level breakdown (which paths get traffic)
- Optional: Core Web Vitals (LCP, FID, CLS — performance metrics)

What you do NOT get (these need Plausible / GA / similar):
- Custom events (e.g. "user clicked Recommendations", "barcode scanned")
- Funnel analysis (onboarding → first game → second session)
- User cohort retention (D1, D7, D30 curves)

For pre-launch and launch-week metrics, what CF Web Analytics gives is **enough**. Add custom events later if you need drilldown.

## Why this is privacy-compliant

Cloudflare Web Analytics is **cookieless by design**:
- No cookies set
- No fingerprinting
- No cross-site tracking
- No PII collected (no IP storage past initial request, no user ID)
- GDPR/CCPA/UK-DPA compliant out of the box

Your privacy policy can stay honest:

> "The PS5 Vault application does not collect any user data — everything stays in your browser's localStorage. The web hosting (`matiseekk-dot.github.io/Games/`) uses Cloudflare Web Analytics to count anonymous pageviews. No cookies, no personal identification, no cross-site tracking."

Add this paragraph to `public/privacy.html` before launch (separate manual edit).

## Setup — 5 steps, ~5 minutes

### Step 1 — Sign up / sign in to Cloudflare

Go to <https://dash.cloudflare.com> and create an account or sign in.

**No domain required.** Web Analytics works on any domain, including GitHub Pages — you don't need to use Cloudflare DNS or CDN.

### Step 2 — Add a site to Web Analytics

In the Cloudflare dashboard left sidebar:

1. Find **Analytics & Logs** → click **Web Analytics**
2. (If first time) Click **Add a site**
3. Choose **Manual setup with JS snippet** (NOT "Automatic via Cloudflare proxy" — we don't proxy through CF)
4. Hostname: `matiseekk-dot.github.io`
5. Click **Done**

Cloudflare generates a token (looks like `1a2b3c4d5e6f...` 32-char hex string).

### Step 3 — Copy the token

After creating the site, CF shows you a snippet that looks like this:

```html
<script defer src='https://static.cloudflareinsights.com/beacon.min.js'
        data-cf-beacon='{"token": "YOUR_REAL_TOKEN_HERE"}'></script>
```

**Only copy the token** (the value of `"token"`), not the whole snippet — the snippet is already in `index.html` with placeholder.

### Step 4 — Replace placeholder in `index.html`

Open `index.html` (root of repo) and find:

```html
data-cf-beacon='{"token": "INSERT_CLOUDFLARE_TOKEN_HERE", "spa": true}'
```

Replace `INSERT_CLOUDFLARE_TOKEN_HERE` with the token from Step 3:

```html
data-cf-beacon='{"token": "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p", "spa": true}'
```

Note: **leave `"spa": true` as-is**. It tells CF to track virtual pageviews if app ever uses client-side routing (currently doesn't, but harmless to have on).

The token is **public by design** — it's safe to commit to git. Different from secret API keys; this just identifies the site to CF.

### Step 5 — Commit and deploy

```bash
git add index.html
git commit -m "wire: Cloudflare Web Analytics token"
git push
```

GitHub Actions auto-deploys (~50s). Wait for the green check.

### Step 6 — Verify

After deploy completes:

1. Open `https://matiseekk-dot.github.io/Games/` in browser
2. DevTools → **Network** tab → filter by "beacon"
3. You should see a request to `https://static.cloudflareinsights.com/beacon.min.js` returning **200 OK**
4. After 1-2 minutes, refresh the CF Web Analytics dashboard — you should see **1 pageview** logged
5. If you see "No data yet" after 5 minutes, check the Network tab again — if beacon returns **403** or **400**, the token is wrong (typo when pasting)

## Optional: enable Core Web Vitals tracking

The base config we have shows pageviews + visitors. For also measuring page performance (LCP, FID, CLS — useful for diagnosing slow loads on real devices):

In CF dashboard → your site → **Settings** → enable **Web Vitals tracking**. No code change needed; the same beacon collects this when toggled.

This is optional and can be done anytime post-launch.

## Troubleshooting

**Browser shows beacon request but CF dashboard shows no data**
- Wait 5 minutes after first visit (CF batches data)
- Verify the hostname in CF dashboard matches the deployed URL exactly
- Check Network tab beacon response — 403 or 400 = wrong token

**uBlock Origin / Privacy Badger blocks the beacon**
- This is expected behavior; ~5-15% of users have ad blockers
- Your dashboard will undercount by that fraction
- Don't try to bypass — that breaks user trust

**Token leaked in git history**
- It's fine. Web Analytics tokens are public-by-design (different from API keys)
- Anyone who has the token can spoof pageviews to your dashboard, but: (a) CF rate-limits and detects spam, (b) the worst case is junk data, not data theft
- You CAN regenerate the token if you want — CF dashboard → site → Settings → Reset token

## What to monitor in launch week

Day 1:
- Total pageviews (sanity check: are people actually visiting?)
- Geographic breakdown (where's the audience?)
- Referrer breakdown (organic search? Reddit? PS5 forums? Direct typing?)

Day 2-7:
- Returning visitors % (seed of retention — is anyone coming back at all?)
- Top page paths (just `/` vs `/privacy.html` etc.)
- Browser breakdown (Chrome dominant? Many Safari → iOS users?)

After 7 days you'll have enough baseline data to decide whether you need Plausible or another tool with custom events.

## Removing Cloudflare Analytics later

If you decide to remove it (e.g. switching to Plausible):

1. Delete the `<script>` block at the bottom of `index.html` (lines marked `v1.12.0`)
2. Optional: delete the site from CF Web Analytics dashboard (otherwise it just sits there with no incoming beacons)
3. Update privacy policy to remove the analytics paragraph
4. Commit + deploy

No data migration needed since CF Web Analytics doesn't store individual user data.
