// scheduler.js — Trolley scraper scheduler
// Run: node scheduler.js
// Scrapes every Tuesday and Wednesday at 6am AEST (when Woolworths & Coles drop new specials)

const { execSync } = require('child_process');

try {
  require.resolve('node-cron');
} catch {
  console.log('Installing node-cron…');
  execSync('npm install node-cron', { stdio: 'inherit' });
}

const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const LOG_FILE = path.join(__dirname, 'scrape-log.txt');

function log(msg) {
  const line = `[${new Date().toISOString()}] [scheduler] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

function runScraper() {
  log('Starting scheduled scrape…');
  const result = spawnSync('node', [path.join(__dirname, 'scraper.js')], {
    stdio: 'inherit',
    cwd: __dirname,
  });

  if (result.status !== 0) {
    log(`ERROR: scraper.js exited with code ${result.status}`);
    return;
  }

  // Read the result to check product count
  try {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'products.json'), 'utf8'));
    const total = data.summary?.totalProducts || 0;
    log(`Scrape complete — ${total} products`);

    if (total < 20) {
      log('ALERT: Low product count — scraper may be blocked. Check scrape-log.txt and review site selectors.');
      console.warn('\n⚠️  ALERT: Scrape returned fewer than 20 products. Likely blocked or site structure changed.\n');
    }
  } catch {
    log('Could not read products.json after scrape');
  }
}

log('Trolley scheduler started');
log('Schedule: Tuesday 06:00 AEST, Wednesday 06:00 AEST');

// Tuesday 6am AEST (UTC+10) = Monday 20:00 UTC
// node-cron uses local system time — adjust if server runs in UTC
// If running on a UTC server, use: '0 20 * * 1' for Tue AEST, '0 20 * * 2' for Wed AEST
// If running on a machine set to AEST, use: '0 6 * * 2' and '0 6 * * 3'

const TZ = process.env.TZ || Intl.DateTimeFormat().resolvedOptions().timeZone;
log(`System timezone: ${TZ}`);

// Detect if we're UTC and adjust accordingly
const isUTC = TZ === 'UTC' || TZ === 'Etc/UTC';
const tuesdayCron  = isUTC ? '0 20 * * 1' : '0 6 * * 2'; // Mon 20:00 UTC = Tue 06:00 AEST
const wednesdayCron = isUTC ? '0 20 * * 2' : '0 6 * * 3'; // Tue 20:00 UTC = Wed 06:00 AEST

cron.schedule(tuesdayCron, () => {
  log('Tuesday run triggered');
  runScraper();
});

cron.schedule(wednesdayCron, () => {
  log('Wednesday backup run triggered');
  runScraper();
});

log(`Cron expressions: "${tuesdayCron}" and "${wednesdayCron}"`);
log('Scheduler running — press Ctrl+C to stop');

// Also run immediately on startup if --now flag is passed
if (process.argv.includes('--now')) {
  log('--now flag detected, running scraper immediately');
  runScraper();
}
