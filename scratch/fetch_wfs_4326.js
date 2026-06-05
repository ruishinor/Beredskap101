import fs from 'node:fs';

async function main() {
  try {
    console.log('Fetching WFS features in EPSG:4326...');
    const url = 'https://wfs.geonorge.no/skwms1/wfs.tilfluktsrom_offentlige?service=WFS&version=2.0.0&request=GetFeature&typeNames=app:Tilfluktsrom&srsName=urn:ogc:def:crs:EPSG::4326';
    const res = await fetch(url);
    const text = await res.text();
    fs.writeFileSync('c:/00 DEV/In Progress/beredskap101-app/scratch/wfs_features_4326.xml', text);
    console.log('WFS features in EPSG:4326 written, size:', text.length);
  } catch (err) {
    console.error(err);
  }
}
main();
