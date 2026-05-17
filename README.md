# Trolley — Grocery Price Scraper

Scrapes weekly specials from Woolworths, Coles, and Aldi and saves them to `products.json`, which the app reads automatically.

---

## Quick start

```bash
# Install dependencies (auto-installs on first run)
node scraper.js
```

---

## Files

| File | Purpose |
|------|---------|
| `scraper.js` | Main scraper — fetches prices from all three stores |
| `scheduler.js` | Runs the scraper on a cron schedule (Tue & Wed 6am AEST) |
| `products.json` | Output file read by the app |
| `scrape-log.txt` | Timestamped log of every run (created automatically) |
| `.github/workflows/scrape.yml` | GitHub Action that runs the scraper and commits results |

---

## Running manually

```bash
node scraper.js
```

Scrapes Woolworths, Coles, and Aldi in sequence. Saves results to `products.json`. If any single store fails, the others still save. If all stores return zero products, the existing `products.json` is left untouched.

---

## Running the scheduler

```bash
node scheduler.js
```

Keeps a process running that fires the scraper every Tuesday and Wednesday at 6am AEST (when Woolworths and Coles drop their weekly specials). Pass `--now` to also run immediately on startup:

```bash
node scheduler.js --now
```

The scheduler auto-detects whether your system is in UTC or AEST and adjusts cron expressions accordingly.

---

## GitHub Action

`.github/workflows/scrape.yml` runs on GitHub's servers automatically.

**Schedule:** Tuesday and Wednesday at 6am AEST (Monday/Tuesday 8pm UTC)

**What it does:**
1. Checks out the repo
2. Installs Node + Puppeteer dependencies
3. Runs `scraper.js`
4. Commits the updated `products.json` back to `main` if anything changed

This means the app always has fresh prices without any manual work — push the workflow file and GitHub handles the rest.

**Trigger manually:**  
Go to Actions → "Scrape Grocery Prices" → Run workflow.

---

## How the app reads prices

`index.html` calls `fetch('products.json')` on load. If the file exists and has products, the deals page shows live scraped prices with a "Live prices" badge and "Updated X hours ago" text. If the fetch fails (e.g. running locally without a server), it silently falls back to the built-in demo data.

---

## Adding a new store

1. In `scraper.js`, add a new async function following the pattern of `scrapeWoolworths`:

```js
async function scrapeNewStore(browser) {
  const BASE = 'https://www.newstore.com.au';
  const URL = `${BASE}/specials`;
  const products = [];

  const ok = await isAllowed(BASE, '/specials');
  if (!ok) return products;

  const page = await getPage(browser, URL);
  // ... wait for selectors, parse with cheerio, push to products[]
  await page.close();
  return products;
}
```

2. Call it in `main()` alongside the existing stores.

3. Add its products to `buildOutput()` and update the summary counts.

4. Add a badge style in `index.html` if the store needs a new colour.

---

## Anti-detection

- Rotates between 8 real browser user agents
- Adds 1.5–4 second random delays between requests
- Respects `robots.txt` — skips any path marked disallowed
- Caps at 100 products per store per run
- Blocks font/media/stylesheet requests to reduce fingerprint

---

## Troubleshooting

**Zero products / fewer than 20 products:**  
The site structure may have changed. Open `scrape-log.txt` and look for the tile count line (e.g. `Woolworths: found 0 tile elements`). Update the CSS selectors in the relevant scrape function to match the current markup.

**Puppeteer won't launch on Linux:**  
The GitHub Action installs the required system libraries automatically. For local Linux installs, run:
```bash
sudo apt-get install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 libpango-1.0-0 libpangocairo-1.0-0
```

**products.json not updating in the app:**  
The app uses `fetch()` which requires a web server — it won't work over `file://` in most browsers. Serve the app with:
```bash
npx serve .
# or
python3 -m http.server 8080
```
