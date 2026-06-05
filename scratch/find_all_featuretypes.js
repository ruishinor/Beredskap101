import fs from 'node:fs';

async function main() {
  try {
    const res = await fetch('https://wfs.geonorge.no/skwms1/wfs.tilfluktsrom_offentlige?request=GetCapabilities&service=WFS');
    const xml = await res.text();
    fs.writeFileSync('c:/00 DEV/In Progress/beredskap101-app/scratch/capabilities.xml', xml);
    
    // Search for <Name> within <FeatureType>
    const featureTypeRegex = /<FeatureType>([\s\S]*?)<\/FeatureType>/gi;
    let match;
    console.log('--- FeatureTypes Found ---');
    while ((match = featureTypeRegex.exec(xml)) !== null) {
      const content = match[1];
      const nameMatch = /<Name>([^<]+)<\/Name>/i.exec(content);
      const titleMatch = /<Title>([^<]+)<\/Title>/i.exec(content);
      console.log(`Name: ${nameMatch ? nameMatch[1] : 'unknown'}, Title: ${titleMatch ? titleMatch[1] : 'unknown'}`);
    }
  } catch (err) {
    console.error(err);
  }
}
main();
