const fs = require('fs');
const path = 'public/assets/css/styles.css';
let content = fs.readFileSync(path, 'utf8');

const anchor = '.u-mt-1 { margin-top: 1rem !important; }';
const index = content.indexOf(anchor);

if (index !== -1) {
    console.log('Found anchor at', index);
    // Keep everything up to the anchor + the anchor itself
    let cleanContent = content.substring(0, index + anchor.length);
    
    // Add the missing sections properly
    cleanContent += `\n\n@media (max-width: 960px) {
  .footer-main { padding: 3rem 1.5rem; }
  .footer-grid-4col { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 600px) {
  .footer-grid-4col { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-delay: -1ms !important;
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    background-attachment: initial !important;
    scroll-behavior: auto !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
  }
}\n`;
    
    fs.writeFileSync(path, cleanContent, 'utf8');
    console.log('CSS file cleaned and updated.');
} else {
    console.error('Anchor not found!');
}
