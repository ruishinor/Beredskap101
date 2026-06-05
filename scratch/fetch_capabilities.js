async function main() {
  try {
    const res = await fetch('https://wfs.geonorge.no/skwms1/wfs.tilfluktsrom_offentlige?request=GetCapabilities&service=WFS');
    const xml = await res.text();
    const match = /<FeatureType>[\s\S]*?<Name>([^<]+)<\/Name>/i.exec(xml);
    if (match) {
      console.log('Found TypeName:', match[1]);
    } else {
      console.log('Could not find FeatureType Name. XML snippet:');
      console.log(xml.substring(0, 1000));
    }
  } catch (err) {
    console.error(err);
  }
}
main();
