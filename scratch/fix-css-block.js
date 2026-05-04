const fs = require('fs');
const path = 'public/assets/css/styles.css';
let content = fs.readFileSync(path, 'utf8');

const startStr = '@media (max-width: 600px) {';
const endStr = '/* Comparison Table */';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
    console.log('Found block to replace.');
    let newBlock = `@media (max-width: 600px) {
  .footer-grid-4col { grid-template-columns: 1fr; }
}

`;
    let result = content.substring(0, startIndex) + newBlock + content.substring(endIndex);
    fs.writeFileSync(path, result, 'utf8');
    console.log('CSS block replaced successfully.');
} else {
    console.log('Could not find start/end markers.', startIndex, endIndex);
}
