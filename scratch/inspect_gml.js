import fs from 'node:fs';

const xml = fs.readFileSync('c:/00 DEV/In Progress/beredskap101-app/scratch/wfs_features_4326.xml', 'utf8');

// Find first occurrence of app:Tilfluktsrom
const idx = xml.indexOf('<app:Tilfluktsrom');
if (idx !== -1) {
  const endIdx = xml.indexOf('</app:Tilfluktsrom>', idx);
  console.log(xml.substring(idx, endIdx + 19));
} else {
  console.log('app:Tilfluktsrom tag not found');
  console.log('XML snippet:');
  console.log(xml.substring(0, 2000));
}
