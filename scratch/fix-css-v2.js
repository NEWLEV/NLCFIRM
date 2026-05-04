const fs = require('fs');
const path = 'public/assets/css/styles.css';
let content = fs.readFileSync(path, 'utf8');
// Use regex to find and remove anything that looks like that corrupted line
// It starts with "@ m e d i a"
content = content.replace(/@ m e d i a[\s\S]*$/, '');
fs.writeFileSync(path, content.trim(), 'utf8');
console.log('Cleaned up CSS file.');
