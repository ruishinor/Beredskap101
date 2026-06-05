import fs from 'node:fs';

const xml = fs.readFileSync('c:/00 DEV/In Progress/beredskap101-app/scratch/capabilities.xml', 'utf8');
const idx = xml.indexOf('<FeatureType>');
if (idx !== -1) {
  console.log(xml.substring(idx, idx + 2000));
} else {
  console.log('FeatureType tag not found in capabilities.xml');
}
