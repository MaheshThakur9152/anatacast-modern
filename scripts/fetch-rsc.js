import https from 'https';
import fs from 'fs';
import path from 'path';

const ROUTES = ['', 'about', 'capabilities', 'process', 'products', 'industries', 'contact'];
const BASE_URL = 'https://ananta-cast-website-design.vercel.app';

fs.mkdirSync('reference-audit/raw', { recursive: true });

function fetchUrl(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  for (const r of ROUTES) {
    const name = r || 'home';
    console.log(`Fetching HTML and RSC for: ${name}`);
    const html = await fetchUrl(`${BASE_URL}/${r}`);
    fs.writeFileSync(`reference-audit/raw/${name}.html`, html);

    const rsc = await fetchUrl(`${BASE_URL}/${r}`, { 'RSC': '1' });
    fs.writeFileSync(`reference-audit/raw/${name}.rsc.txt`, rsc);
  }
  console.log('All raw HTML and RSC files saved to reference-audit/raw/');
}

main().catch(console.error);
