# Outlook Promo Cleaner

Bulk-deletes credit card / banking promotional emails from your personal Outlook inbox using Microsoft Graph API.

---

## Prerequisites

- Node.js v18+
- A personal Microsoft / Outlook account

---

## Step 1 — Azure App Registration (one time, ~5 mins)

1. Go to: https://portal.azure.com
2. Sign in with **your personal Microsoft account** (same one as Outlook)
3. Search for **"App registrations"** → Click **New registration**
4. Fill in:
   - **Name**: `outlook-cleaner` (anything you like)
   - **Supported account types**: Select **"Personal Microsoft accounts only"**
   - **Redirect URI**: Leave blank for now
5. Click **Register**
6. Copy the **Application (client) ID** — you'll need this next

---

## Step 2 — Enable the right API permissions

1. In your app page, go to **API permissions** → **Add a permission**
2. Choose **Microsoft Graph** → **Delegated permissions**
3. Search and add: `Mail.ReadWrite`
4. Click **Grant admin consent** (for personal accounts this auto-approves)

---

## Step 3 — Configure the script

Open `src/config.ts` and paste your Client ID:

```ts
azure: {
  clientId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",  // ← paste here
  tenantId: "consumers",   // keep as-is for personal accounts
}
```

Also add any extra sender domains or keywords you want to target in the same file.

---

## Step 4 — Install and build

```bash
npm install
npm run build
```

---

## Step 5 — Run

### Dry run first (safe — shows what WOULD be deleted, deletes nothing)
```bash
npm run dry-run
```

### Actually delete (permanent, cannot be undone)
```bash
npm run delete
```

On first run, you'll be shown a URL + a short code. Open the URL in your browser, enter the code, and sign in with your Microsoft account. After that, your token is cached — no need to sign in again for ~1 hour.

---

## Adding more filters

Edit `src/config.ts`:

```ts
senderDomains: [
  "hdfcbank.com",
  "paytmbank.com",       // ← add here
],

subjectKeywords: [
  "offer",
  "statement ready",     // ← add here
],
```

Then rebuild:
```bash
npm run build
```

---

## Notes

- Graph API throttles personal accounts to ~4 deletes/sec. For 500 emails that's ~2 mins.
- Token is cached in `.token_cache.json` — don't commit this file.
- `.token_cache.json` is gitignored automatically if you init a git repo.
 
 ### In action
 
 <video src="removal.mov" controls="controls" width="100%" autoplay loop title="Promo Cleaner Demo">
   <a href="removal.mov">Click here to view the video</a>
 </video>

