import fs from 'node:fs';

const html = fs.readFileSync('c:/00 DEV/In Progress/beredskap101-app/scratch/raw.html', 'utf8');

// regex to find all <script> tags and print their attributes
const scriptTagRegex = /<script\b([^>]*)>/gi;
let match;
while ((match = scriptTagRegex.exec(html)) !== null) {
  const attrs = match[1];
  console.log('Script tag attributes:', attrs.trim());
}
