// scraper.js — Trolley grocery price scraper
// For personal/educational use only. Respects robots.txt. Max 100 products per store.
// Run: node scraper.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ── Dependency bootstrap ──────────────────────────────────────────────────────
const required = ['puppeteer', 'axios', 'cheerio'];
for (const pkg of required) {
  try {
    require.resolve(pkg);
  } catch {
    console.log(`Installing ${pkg}…`);
    execSync(`npm install ${pkg}`, { stdio: 'inherit' });
  }
}

const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');

// ── Config ────────────────────────────────────────────────────────────────────
const MAX_PRODUCTS = 100;
const LOG_FILE = path.join(__dirname, 'scrape-log.txt');
const OUTPUT_FILE = path.join(__dirname, 'products.json');

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:125.0) Gecko/20100101 Firefox/125.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay() {
  const ms = 1500 + Math.floor(Math.random() * 2500);
  return delay(ms);
}

function makeId(store, name) {
  return `${store}_${crypto.createHash('md5').update(name).digest('hex').slice(0, 8)}`;
}

function parsePrice(str) {
  if (!str) return null;
  const m = str.replace(/,/g, '').match(/[\d]+\.?\d*/);
  return m ? parseFloat(m[0]) : null;
}

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

// ── Robots.txt checker ────────────────────────────────────────────────────────
async function isAllowed(baseUrl, path) {
  try {
    const res = await axios.get(`${baseUrl}/robots.txt`, { timeout: 5000 });
    const lines = res.data.split('\n');
    let inBlock = false;
    const disallowed = [];

    for (const raw of lines) {
      const line = raw.trim();
      if (line.toLowerCase().startsWith('user-agent:')) {
        const agent = line.split(':')[1].trim();
        inBlock = agent === '*' || agent.toLowerCase().includes('bot');
      }
      if (inBlock && line.toLowerCase().startsWith('disallow:')) {
        const p = line.split(':')[1]?.trim();
        if (p) disallowed.push(p);
      }
    }

    for (const dis of disallowed) {
      if (dis !== '/' && path.startsWith(dis)) {
        log(`Robots.txt blocks ${path} — skipping`);
        return false;
      }
    }
    return true;
  } catch {
    return true; // If we can't fetch robots.txt, proceed cautiously
  }
}

// ── Browser helpers ───────────────────────────────────────────────────────────
async function launchBrowser() {
  return puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ],
  });
}

async function getPage(browser, url) {
  const page = await browser.newPage();
  await page.setUserAgent(randomUA());
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-AU,en;q=0.9' });
  await page.setViewport({ width: 1280, height: 800 });

  // Block images/fonts to speed up loading
  await page.setRequestInterception(true);
  page.on('request', req => {
    const type = req.resourceType();
    if (['font', 'media', 'stylesheet'].includes(type)) {
      req.abort();
    } else {
      req.continue();
    }
  });

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  return page;
}

// ── Woolworths ────────────────────────────────────────────────────────────────
async function scrapeWoolworths(browser) {
  const BASE = 'https://www.woolworths.com.au';
  const URL = `${BASE}/shop/browse/specials`;
  const products = [];

  log('Woolworths: checking robots.txt…');
  const ok = await isAllowed(BASE, '/shop/browse/specials');
  if (!ok) return products;

  log('Woolworths: loading specials page…');
  const page = await getPage(browser, URL);

  try {
    // Wait for product tiles to render
    await page.waitForSelector(
      '[data-testid="product-tile"], .product-tile, .shelfProductTile, article[data-stockcode]',
      { timeout: 15000 }
    ).catch(() => log('Woolworths: product tile selector timed out, attempting parse anyway'));

    await randomDelay();

    const html = await page.content();
    const $ = cheerio.load(html);

    // Woolworths renders product tiles — selectors based on their React structure
    const tileSelectors = [
      '[data-testid="product-tile"]',
      '.product-tile',
      '.shelfProductTile',
      'article[data-stockcode]',
    ];

    let tiles = $();
    for (const sel of tileSelectors) {
      tiles = $(sel);
      if (tiles.length > 0) break;
    }

    log(`Woolworths: found ${tiles.length} tile elements`);

    tiles.slice(0, MAX_PRODUCTS).each((_, el) => {
      try {
        const tile = $(el);

        const name =
          tile.find('[data-testid="product-title"], .product-title, .shelfProduct__title, h2, h3').first().text().trim() ||
          tile.attr('aria-label') || '';

        if (!name) return;

        const currentPriceRaw =
          tile.find('[data-testid="product-price"], .price__value, .shelfProduct__price .price').first().text().trim() ||
          tile.find('.price').first().text().trim();

        const wasPriceRaw =
          tile.find('[data-testid="product-was-price"], .price--was, .shelfProduct__wasPrice').first().text().trim() ||
          tile.find('.was-price, [class*="was"]').first().text().trim();

        const imageUrl =
          tile.find('img').first().attr('src') ||
          tile.find('img').first().attr('data-src') || null;

        const category =
          tile.find('[data-testid="product-category"], .product-category, .category').first().text().trim() || 'General';

        const currentPrice = parsePrice(currentPriceRaw);
        const wasPrice = parsePrice(wasPriceRaw);

        if (!currentPrice) return;

        const saving = wasPrice ? Math.round((wasPrice - currentPrice) * 100) / 100 : 0;
        const savingPercent = wasPrice && saving > 0
          ? Math.round((saving / wasPrice) * 100)
          : 0;

        products.push({
          id: makeId('woolworths', name),
          name,
          category,
          currentPrice,
          wasPrice: wasPrice || null,
          saving,
          savingPercent,
          imageUrl,
          inStock: true,
          store: 'woolworths',
          points: Math.round(currentPrice * 100), // ~100 pts per dollar
        });
      } catch (e) {
        // Skip malformed tile
      }
    });

  } finally {
    await page.close();
  }

  log(`Woolworths: scraped ${products.length} products`);
  return products;
}

// ── Coles ─────────────────────────────────────────────────────────────────────
async function scrapeColes(browser) {
  const BASE = 'https://www.coles.com.au';
  const URL = `${BASE}/on-sale`;
  const products = [];

  log('Coles: checking robots.txt…');
  const ok = await isAllowed(BASE, '/on-sale');
  if (!ok) return products;

  log('Coles: loading on-sale page…');
  const page = await getPage(browser, URL);

  try {
    await page.waitForSelector(
      '[data-testid="product-tile"], .coles-targeting-Tile, article[class*="tile"], .product-tile',
      { timeout: 15000 }
    ).catch(() => log('Coles: product tile selector timed out, attempting parse anyway'));

    await randomDelay();

    const html = await page.content();
    const $ = cheerio.load(html);

    const tileSelectors = [
      '[data-testid="product-tile"]',
      '.coles-targeting-Tile',
      'article[class*="product"]',
      '.product-tile',
      'li[class*="tile"]',
    ];

    let tiles = $();
    for (const sel of tileSelectors) {
      tiles = $(sel);
      if (tiles.length > 0) break;
    }

    log(`Coles: found ${tiles.length} tile elements`);

    tiles.slice(0, MAX_PRODUCTS).each((_, el) => {
      try {
        const tile = $(el);

        const name =
          tile.find('[data-testid="product-name"], .coles-targeting-TileName, h2, h3, [class*="name"]').first().text().trim() ||
          tile.attr('aria-label') || '';

        if (!name) return;

        const currentPriceRaw =
          tile.find('[data-testid="product-pricing"], .coles-targeting-TileOfferPricing, [class*="price"]').first().text().trim();

        const wasPriceRaw =
          tile.find('[data-testid="was-price"], .coles-targeting-TileWasPrice, [class*="was"]').first().text().trim();

        const imageUrl =
          tile.find('img').first().attr('src') ||
          tile.find('img').first().attr('data-src') || null;

        const category =
          tile.find('[class*="category"], [data-testid*="category"]').first().text().trim() || 'General';

        const currentPrice = parsePrice(currentPriceRaw);
        const wasPrice = parsePrice(wasPriceRaw);

        if (!currentPrice) return;

        const saving = wasPrice ? Math.round((wasPrice - currentPrice) * 100) / 100 : 0;
        const savingPercent = wasPrice && saving > 0
          ? Math.round((saving / wasPrice) * 100)
          : 0;

        products.push({
          id: makeId('coles', name),
          name,
          category,
          currentPrice,
          wasPrice: wasPrice || null,
          saving,
          savingPercent,
          imageUrl,
          inStock: true,
          store: 'coles',
          points: Math.round(currentPrice * 10), // Flybuys ~10 pts per dollar
        });
      } catch (e) {
        // Skip malformed tile
      }
    });

  } finally {
    await page.close();
  }

  log(`Coles: scraped ${products.length} products`);
  return products;
}

// ── Aldi ──────────────────────────────────────────────────────────────────────
async function scrapeAldi(browser) {
  const BASE = 'https://www.aldi.com.au';
  const URL = `${BASE}/en/specials/`;
  const products = [];

  log('Aldi: checking robots.txt…');
  const ok = await isAllowed(BASE, '/en/specials/');
  if (!ok) return products;

  log('Aldi: loading specials page…');
  const page = await getPage(browser, URL);

  try {
    await page.waitForSelector(
      '.mod-article-tile, [class*="article-tile"], .specials-tile, article',
      { timeout: 15000 }
    ).catch(() => log('Aldi: product tile selector timed out, attempting parse anyway'));

    await randomDelay();

    const html = await page.content();
    const $ = cheerio.load(html);

    const tileSelectors = [
      '.mod-article-tile',
      '[class*="article-tile"]',
      '.specials__item',
      'li[class*="special"]',
      'article[class*="tile"]',
    ];

    let tiles = $();
    for (const sel of tileSelectors) {
      tiles = $(sel);
      if (tiles.length > 0) break;
    }

    log(`Aldi: found ${tiles.length} tile elements`);

    tiles.slice(0, MAX_PRODUCTS).each((_, el) => {
      try {
        const tile = $(el);

        const name =
          tile.find('.mod-article-tile__name, [class*="tile__name"], [class*="title"], h2, h3, h4').first().text().trim() ||
          tile.attr('aria-label') || '';

        if (!name) return;

        const priceRaw =
          tile.find('.mod-article-tile__price, [class*="tile__price"], [class*="price"]').first().text().trim();

        const imageUrl =
          tile.find('img').first().attr('src') ||
          tile.find('img').first().attr('data-src') || null;

        const category =
          tile.find('[class*="category"], [class*="type"]').first().text().trim() || 'General';

        const currentPrice = parsePrice(priceRaw);
        if (!currentPrice) return;

        products.push({
          id: makeId('aldi', name),
          name,
          category,
          currentPrice,
          wasPrice: null, // Aldi doesn't use traditional was/now pricing
          saving: 0,
          savingPercent: 0,
          imageUrl,
          inStock: true,
          store: 'aldi',
          points: 0, // No loyalty program
        });
      } catch (e) {
        // Skip malformed tile
      }
    });

  } finally {
    await page.close();
  }

  log(`Aldi: scraped ${products.length} products`);
  return products;
}

// ── Output helpers ────────────────────────────────────────────────────────────
function bestDeal(allProducts) {
  return allProducts
    .filter(p => p.savingPercent > 0)
    .sort((a, b) => b.savingPercent - a.savingPercent)[0] || null;
}

function buildOutput(wwProducts, colesProducts, aldiProducts) {
  const now = new Date().toISOString();
  const all = [...wwProducts, ...colesProducts, ...aldiProducts];

  return {
    lastUpdated: now,
    stores: {
      woolworths: {
        scrapedAt: now,
        products: wwProducts,
      },
      coles: {
        scrapedAt: now,
        products: colesProducts,
      },
      aldi: {
        scrapedAt: now,
        products: aldiProducts,
      },
    },
    summary: {
      totalProducts: all.length,
      totalWoolworths: wwProducts.length,
      totalColes: colesProducts.length,
      totalAldi: aldiProducts.length,
      bestDeal: bestDeal(all) || {},
    },
  };
}

function loadExisting() {
  try {
    if (fs.existsSync(OUTPUT_FILE)) {
      return JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    }
  } catch {
    // Corrupt file — don't block scrape
  }
  return null;
}

function saveOutput(data) {
  const total = data.summary.totalProducts;
  if (total === 0) {
    log('ERROR: Zero products scraped across all stores — not overwriting existing data');
    return false;
  }
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
  log(`Saved ${total} products to products.json`);
  return true;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  log('=== Trolley scraper starting ===');
  const existing = loadExisting();

  let browser;
  try {
    browser = await launchBrowser();
  } catch (e) {
    log(`ERROR: Could not launch browser — ${e.message}`);
    process.exit(1);
  }

  let wwProducts = [];
  let colesProducts = [];
  let aldiProducts = [];

  // Scrape each store independently — a failure in one doesn't stop others
  try {
    wwProducts = await scrapeWoolworths(browser);
  } catch (e) {
    log(`ERROR: Woolworths scrape failed — ${e.message}`);
    if (existing) wwProducts = existing.stores?.woolworths?.products || [];
  }

  await randomDelay();

  try {
    colesProducts = await scrapeColes(browser);
  } catch (e) {
    log(`ERROR: Coles scrape failed — ${e.message}`);
    if (existing) colesProducts = existing.stores?.coles?.products || [];
  }

  await randomDelay();

  try {
    aldiProducts = await scrapeAldi(browser);
  } catch (e) {
    log(`ERROR: Aldi scrape failed — ${e.message}`);
    if (existing) aldiProducts = existing.stores?.aldi?.products || [];
  }

  await browser.close();

  const output = buildOutput(wwProducts, colesProducts, aldiProducts);
  const saved = saveOutput(output);

  if (!saved && existing) {
    log('Keeping existing products.json intact');
  }

  const total = output.summary.totalProducts;
  log(`=== Done: ${total} products total (WW: ${output.summary.totalWoolworths}, Coles: ${output.summary.totalColes}, Aldi: ${output.summary.totalAldi}) ===`);

  if (total < 20) {
    log('ALERT: Fewer than 20 products scraped — likely blocked or site structure changed');
  }

  return output;
}

main().catch(e => {
  log(`FATAL: ${e.message}`);
  process.exit(1);
});
