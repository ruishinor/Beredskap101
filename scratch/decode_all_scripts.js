import fs from 'node:fs';

const html = fs.readFileSync('c:/00 DEV/In Progress/beredskap101-app/scratch/raw.html', 'utf8');

const regex = /src="data:text\/javascript,([^"]+)"/gi;
let match;
let count = 0;
while ((match = regex.exec(html)) !== null) {
  const decoded = decodeURIComponent(match[1]);
  if (decoded.includes('map') || decoded.includes('findNearestBtn') || decoded.includes('shelters')) {
    fs.writeFileSync('c:/00 DEV/In Progress/beredskap101-app/scratch/shelter_map_decoded.js', decoded);
    console.log(`Match #${++count} containing map keywords found and written to scratch/shelter_map_decoded.js`);
  }
}
