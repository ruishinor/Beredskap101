import fs from 'node:fs';

const lines = fs.readFileSync('c:/00 DEV/In Progress/beredskap101-app/src/App.tsx', 'utf8').split('\n');

lines.forEach((line, index) => {
  if (line.includes("activeTab === 'checklists'") || line.includes("activeTab === 'glossary'") || line.includes("activeTab === 'manual'")) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
