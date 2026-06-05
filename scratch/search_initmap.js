import fs from 'node:fs';

const html = fs.readFileSync('c:/00 DEV/In Progress/beredskap101-app/scratch/raw.html', 'utf8');

const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  const scriptContent = match[1];
  const scriptTag = match[0];
  if (scriptContent.includes('initMap') || scriptContent.includes('findNearestBtn') || scriptContent.includes('tilfluktsrom')) {
    console.log(`--- Script containing keywords (#${++count}) ---`);
    console.log('Tag:', scriptTag.substring(0, scriptTag.indexOf('>') + 1));
    console.log(scriptContent);
    console.log('\n=======================================\n');
  }
}
