const fs = require('fs');
const path = 'public/assets/css/styles.css';
let content = fs.readFileSync(path, 'utf8');
let lines = content.split('\n');
// Find the first line that starts with "@ m e d i a"
let index = lines.findIndex(l => l.includes('@ m e d i a'));
if (index !== -1) {
    console.log('Removing lines from index', index);
    lines = lines.slice(0, index);
}
fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Fixed CSS file.');
