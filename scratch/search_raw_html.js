import fs from 'node:fs';

const html = fs.readFileSync('c:/00 DEV/In Progress/beredskap101-app/scratch/raw.html', 'utf8');

// Find all matches for "initMap" or "findNearestBtn" or "map" in the whole HTML
const searchTerms = ['initMap', 'findNearestBtn', 'google.maps', 'Marker'];

for (const term of searchTerms) {
  let idx = 0;
  console.log(`\n=== Searching for "${term}" ===`);
  while ((idx = html.indexOf(term, idx)) !== -1) {
    const start = Math.max(0, idx - 150);
    const end = Math.min(html.length, idx + term.length + 150);
    console.log(`Match at index ${idx}:`);
    console.log(html.substring(start, end).replace(/\r?\n/g, ' '));
    console.log('-'.repeat(40));
    idx += term.length;
  }
}
