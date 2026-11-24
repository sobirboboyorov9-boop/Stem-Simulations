import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';

const TARGET_DIR = path.resolve(process.cwd(), 'public/simulations/phet-sims');

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

async function main() {
  console.log('Fetching file list from GitHub repository...');
  const res = await fetch('https://api.github.com/repos/sobirboboyorov9-boop/LearnLab/contents/artifacts/learnlab/public/simulations/phet-sims');
  if (!res.ok) {
    throw new Error(`Failed to fetch file list: ${res.status} ${res.statusText}`);
  }

  const items = await res.json();
  const files = items.filter(item => item.type === 'file' && item.name.endsWith('.html'));

  console.log(`Found ${files.length} simulation HTML files to download into ${TARGET_DIR}`);

  // Download with concurrency limit of 6
  const CONCURRENCY = 6;
  let completed = 0;
  let skipped = 0;
  let failed = 0;

  async function downloadFile(file) {
    const filePath = path.join(TARGET_DIR, file.name);
    
    // If file exists and size matches within 100 bytes, skip
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      if (stat.size > 100000 && Math.abs(stat.size - file.size) < 1000) {
        skipped++;
        return;
      }
    }

    const rawUrl = `https://raw.githubusercontent.com/sobirboboyorov9-boop/LearnLab/main/artifacts/learnlab/public/simulations/phet-sims/${file.name}`;
    try {
      const response = await fetch(rawUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const fileStream = fs.createWriteStream(filePath);
      await pipeline(Readable.fromWeb(response.body), fileStream);
      completed++;
      if (completed % 10 === 0 || completed === files.length) {
        console.log(`[${completed + skipped}/${files.length}] Downloaded ${file.name} (${Math.round(file.size / 1024)} KB)`);
      }
    } catch (err) {
      console.error(`Failed to download ${file.name}:`, err.message);
      failed++;
    }
  }

  // Pool runner
  const queue = [...files];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length > 0) {
      const file = queue.shift();
      if (file) {
        await downloadFile(file);
      }
    }
  });

  await Promise.all(workers);

  console.log(`\nDownload completed: ${completed} downloaded, ${skipped} skipped (already cached), ${failed} failed.`);
  
  const savedFiles = fs.readdirSync(TARGET_DIR);
  console.log(`Total files in ${TARGET_DIR}: ${savedFiles.length}`);
}

main().catch(err => {
  console.error('Fatal error in downloader:', err);
  process.exit(1);
});
