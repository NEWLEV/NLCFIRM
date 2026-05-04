const fs = require('fs');
const path = 'public/assets/css/styles.css';
let content = fs.readFileSync(path, 'utf8');
let lines = content.split('\n');

// Find the line with the weird spaces
let index = lines.findIndex(l => l.includes('@ m e d i a'));

if (index !== -1) {
    console.log('Removing corrupted line at', index + 1);
    lines.splice(index, 1);
    fs.writeFileSync(path, lines.join('\n'), 'utf8');
    console.log('Corrupted line removed.');
} else {
    console.log('Corrupted line not found.');
}
