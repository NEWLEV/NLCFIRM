const fs = require('fs');
const path = 'public/assets/css/styles.css';
let content = fs.readFileSync(path, 'utf8');

// Remove the corrupted line at the end
content = content.replace(/@ m e d i a[\s\S]*$/, '');
content = content.trim();

// Append the missing sections
const toAppend = `

/* Comparison Table */
.compare-table-container {
  overflow-x: auto;
  margin-top: 2rem;
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.compare-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-card);
  font-size: 0.95rem;
}

.compare-table th,
.compare-table td {
  padding: 1.2rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.compare-table th {
  background: rgba(255, 255, 255, 0.02);
  color: var(--gold);
  font-family: var(--font-display);
  font-weight: 600;
}

.compare-table td {
  color: var(--text-dim);
}

.compare-table tr:hover td {
  background: rgba(255, 255, 255, 0.01);
  color: var(--text) !important;
}

.compare-table tr:last-child td {
  border-bottom: none;
}

.compare-table .nlc-col {
  background: rgba(201, 168, 76, 0.04);
  color: var(--text);
}

.compare-table th.nlc-col {
  background: rgba(201, 168, 76, 0.08);
  border-bottom: 2px solid var(--gold);
}

.compare-table tr:last-child .nlc-col {
  background: rgba(201, 168, 76, 0.08);
  color: var(--gold);
  font-weight: 700;
}

.compare-table .check { color: var(--success); font-weight: bold; }
.compare-table .cross { color: var(--danger); opacity: 0.7; }

/* Lead Magnet */
.lead-magnet-form {
  display: flex;
  gap: 0.5rem;
  max-width: 400px;
  margin-bottom: 1rem;
}

.lead-magnet-input {
  flex: 1;
  padding: 0.8rem;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
}

.lead-magnet-img-container {
  text-align: center;
}

.lead-magnet-img {
  max-width: 250px;
  opacity: 0.8;
  margin: 0 auto;
  filter: grayscale(1) brightness(1.5);
}

/* Pricing Cards */
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

fs.writeFileSync(path, content + toAppend, 'utf8');
console.log('Successfully restored and fixed CSS.');
