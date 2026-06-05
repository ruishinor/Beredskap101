import fs from 'node:fs';

const html = fs.readFileSync('c:/00 DEV/In Progress/beredskap101-app/scratch/raw.html', 'utf8');

// Regex to find src="data:text/javascript,..."
const regex = /src="data:text\/javascript,([^"]+)"/i;
const match = regex.exec(html);

if (match) {
  const encoded = match[1];
  const decoded = decodeURIComponent(encoded);
  fs.writeFileSync('c:/00 DEV/In Progress/beredskap101-app/scratch/shelter_map_decoded.js', decoded);
  console.log('Decoded script written to scratch/shelter_map_decoded.js');
} else {
  console.log('Could not find data:text/javascript script tag');
}
