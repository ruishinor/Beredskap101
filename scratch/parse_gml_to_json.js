import fs from 'node:fs';

const xml = fs.readFileSync('c:/00 DEV/In Progress/beredskap101-app/scratch/wfs_features_4326.xml', 'utf8');

const regex = /<app:Tilfluktsrom[^>]*>([\s\S]*?)<\/app:Tilfluktsrom>/gi;
let match;
const shelters = [];

while ((match = regex.exec(xml)) !== null) {
  const content = match[1];
  
  const romnrMatch = /<app:romnr>([^<]+)<\/app:romnr>/i.exec(content);
  const plasserMatch = /<app:plasser>([^<]+)<\/app:plasser>/i.exec(content);
  const adresseMatch = /<app:adresse>([^<]+)<\/app:adresse>/i.exec(content);
  const posMatch = /<gml:pos>([^<]+)<\/gml:pos>/i.exec(content);
  
  if (posMatch) {
    const coords = posMatch[1].trim().split(/\s+/);
    if (coords.length === 2) {
      const lat = parseFloat(coords[0]);
      const lng = parseFloat(coords[1]);
      
      shelters.push({
        romnr: romnrMatch ? romnrMatch[1].trim() : 'Ukjent',
        plasser: plasserMatch ? parseInt(plasserMatch[1].trim(), 10) : 0,
        adresse: adresseMatch ? adresseMatch[1].trim() : 'Ukjent adresse',
        lat,
        lng
      });
    }
  }
}

fs.writeFileSync('c:/00 DEV/In Progress/beredskap101-app/src/data/shelters.json', JSON.stringify(shelters, null, 2));
console.log(`Parsed ${shelters.length} public shelters and saved to src/data/shelters.json`);
