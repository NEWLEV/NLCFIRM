const fs = require('fs');
const path = 'public/assets/css/styles.css';
let content = fs.readFileSync(path, 'utf8');
let lines = content.split('\n');

// Use regex to find a line that has '@' followed by 'm' with space, etc.
let index = lines.findIndex(l => /@\s+m\s+e\s+d\s+i\s+a/.test(l));

if (index !== -1) {
    console.log('Removing corrupted line at', index + 1);
    lines.splice(index, 1);
    fs.writeFileSync(path, lines.join('\n'), 'utf8');
    console.log('Corrupted line removed.');
} else {
    console.log('Corrupted line not found with regex.');
}
