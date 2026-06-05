import fs from 'node:fs';

async function main() {
  try {
    const res = await fetch('https://www.beredskapslager.no/tilfluktsrom-kart-og-informasjon/');
    const html = await res.text();
    fs.writeFileSync('c:/00 DEV/In Progress/beredskap101-app/scratch/raw.html', html);
    console.log('HTML written successfully, length:', html.length);
    
    // Find all script tags
    const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    let count = 0;
    while ((match = scriptRegex.exec(html)) !== null) {
      const scriptContent = match[1];
      const scriptTag = match[0];
      if (scriptContent.includes('map') || scriptTag.includes('maps.googleapis') || scriptContent.includes('findNearestBtn')) {
        console.log(`--- Script #${++count} ---`);
        console.log('Tag:', scriptTag.substring(0, scriptTag.indexOf('>') + 1));
        console.log(scriptContent.substring(0, 1000)); // Print first 1000 chars
        if (scriptContent.length > 1000) console.log('...TRUNCATED...');
      }
    }
  } catch (err) {
    console.error(err);
  }
}

main();
