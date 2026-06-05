import fs from 'node:fs';

async function main() {
  try {
    console.log('Fetching WFS features...');
    const url = 'https://wfs.geonorge.no/skwms1/wfs.tilfluktsrom_offentlige?service=WFS&version=2.0.0&request=GetFeature&typeNames=app:Tilfluktsrom';
    const res = await fetch(url);
    const text = await res.text();
    fs.writeFileSync('c:/00 DEV/In Progress/beredskap101-app/scratch/wfs_features.xml', text);
    console.log('WFS features XML written, size:', text.length);
  } catch (err) {
    console.error(err);
  }
}
main();
