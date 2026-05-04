const fs = require('fs');
const path = 'public/assets/css/styles.css';
let content = fs.readFileSync(path, 'utf8');

// Find the end of .compare-table td
const searchStr = '.compare-table td {';
const index = content.indexOf(searchStr);

if (index !== -1) {
    // Find the end of that block
    const blockEnd = content.indexOf('}', index);
    if (blockEnd !== -1) {
        // Cut everything after the closing brace
        let clean = content.substring(0, blockEnd + 1);
        
        // Append the rest correctly
        clean += `

.pricing-card {
  padding: 2rem;
  border-radius: var(--radius);
  text-align: center;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.pricing-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.pricing-card-elevated {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
}

.pricing-card-featured {
  background: var(--bg-card);
  border: 1px solid var(--gold);
  position: relative;
}

.pricing-card-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--gold);
  color: var(--bg);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 1rem;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pricing-card-title {
  color: var(--text);
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.pricing-card-desc {
  color: var(--text-dim);
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
  min-height: 40px;
}

.pricing-card-amount {
  font-family: var(--font-display);
  font-size: 2rem;
  color: var(--gold);
  margin-bottom: 1.5rem;
}

/* Exit Modal Overlay Fixes */
.exit-overlay-z {
  z-index: 900 !important;
}

.exit-modal-z {
  z-index: 901 !important;
  top: 20% !important;
}

.exit-modal-content {
  text-align: center;
  padding: 1rem;
}

.phi-note {
  font-size: 0.75rem;
  color: var(--danger);
  font-weight: 600;
  margin-top: 0.5rem;
  border: 1px solid var(--danger);
  padding: 0.3rem;
  border-radius: 4px;
  display: inline-block;
}

.u-mt-1 { margin-top: 1rem !important; }

@media (max-width: 960px) {
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
}
`;
        fs.writeFileSync(path, clean, 'utf8');
        console.log('Successfully reconstructed CSS footer.');
    }
} else {
    console.log('Could not find .compare-table td');
}
