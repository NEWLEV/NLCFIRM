# NLC Digital Product Catalog — Launch Checklist
**Plan:** Cross-Sector Self-Guided Digital Product Launch Plan v1.0
**Date:** May 2026
**Status:** Implementation Complete — Pre-Launch Verification Required

---

## PHASE 1 — Files Created ✅

All files generated and in place. Verify each exists:

### Data Layer
- [x] `public/products/data/products-data.js` — 32 products, 13 sectors, 4 bundles (single source of truth)
- [x] `public/products/data/sectors.json` — Sector metadata for Antigravity data model
- [x] `public/products/data/bundles.json` — Bundle definitions for Antigravity

### Catalog Pages
- [x] `public/products/index.html` — Browse-all catalog with JS filtering, search, sort
- [x] `public/products/detail.html` — Universal product detail page (reads `?sku=` param)

### Sector Pages (13)
- [x] `public/products/healthcare/index.html`
- [x] `public/products/legal/index.html`
- [x] `public/products/real-estate/index.html`
- [x] `public/products/professional-services/index.html`
- [x] `public/products/retail/index.html`
- [x] `public/products/restaurants/index.html`
- [x] `public/products/construction/index.html`
- [x] `public/products/nonprofit/index.html`
- [x] `public/products/financial-services/index.html`
- [x] `public/products/education/index.html`
- [x] `public/products/technology/index.html`
- [x] `public/products/manufacturing/index.html`
- [x] `public/products/government-contracting/index.html`

### CSS & Nav
- [x] `public/assets/css/styles.css` — Product catalog CSS appended (mega-nav, catalog, product cards, detail page, checkout modal, responsive)
- [x] `public/index.html` — "Products" mega-dropdown added to nav; mobile drawer updated

---

## PHASE 2 — Checkout Configuration 🔧 REQUIRED BEFORE GO-LIVE

### 2.1 PayPal Merchant ID
- [ ] Replace `YOUR_PAYPAL_CLIENT_ID` in `public/products/detail.html` (line ~130) with your live PayPal SDK client-id
  - Format: `<script src="https://www.paypal.com/sdk/js?client-id=LIVE_CLIENT_ID&currency=USD"></script>`
  - Find in: PayPal Developer Dashboard → My Apps → Live → Client ID
- [ ] Verify `/api/payments/verify` endpoint is live and creates portal accounts on successful payment
- [ ] Test checkout flow end-to-end with a real PayPal transaction (use a low-price test product first)
- [ ] Confirm post-purchase email is triggered with download link or portal login instructions

### 2.2 Product Download Files
- [ ] For each paid product, create the actual downloadable file (Excel/PDF/Word) and store it in `/public/downloads/[product-slug]/`
- [ ] Update `/api/payments/verify` to serve the correct file path per `productID` in the request body
- [ ] Suggested mapping: `productID` (SKU, e.g. `NLC-HC-001`) → download path `/downloads/medical-practice-revenue-recovery-plan/`

---

## PHASE 3 — SEO & Metadata 🔧 RECOMMENDED BEFORE GO-LIVE

- [ ] Verify `<title>` and `<meta name="description">` render correctly on `detail.html` for each SKU
  - Test: Open `/products/detail.html?sku=NLC-HC-001` → check browser tab title
- [ ] Add `<link rel="canonical">` tag to `detail.html` (dynamic, based on SKU)
- [ ] Submit `/products/` to Google Search Console as a new URL path
- [ ] Create `sitemap-products.xml` listing all 32 product URLs (`/products/detail.html?sku=NLC-XX-XXX`) and all 13 sector URLs
- [ ] Add sitemap reference to `sitemap.xml` (or `robots.txt`)
- [ ] Add `application/ld+json` Product schema to `detail.html` for rich results:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "[product.name]",
    "description": "[product.metaDescription]",
    "offers": {
      "@type": "Offer",
      "price": "[product.price]",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  }
  ```

---

## PHASE 4 — Analytics & Tracking 🔧 RECOMMENDED

- [ ] Add `product_view` analytics event in `detail.html` on page load:
  ```javascript
  // Fire after product data loads
  gtag('event', 'view_item', {
    currency: 'USD',
    value: product.price,
    items: [{ item_id: product.sku, item_name: product.name, item_category: product.sector, price: product.price }]
  });
  ```
- [ ] Add `begin_checkout` event to the "Buy Now" button click handler
- [ ] Add `purchase` event in `/api/payments/verify` confirmation response or in the PayPal `onApprove` callback in `checkout.js`
- [ ] Verify GA4 or your analytics platform receives events for: `product_view`, `begin_checkout`, `purchase`
- [ ] Set up a GA4 funnel: Browse Catalog → View Product → Begin Checkout → Purchase

---

## PHASE 5 — Email / CRM Integration 🔧 RECOMMENDED

For each product purchase, trigger a 5-email upsell sequence (see Plan §7):

- [ ] Configure webhook on `/api/payments/verify` success to tag buyer in email platform with: `sector`, `sku`, `tier`
- [ ] Create 5-email sequences in your email platform for each of the 10 priority products:
  - Day 1: Delivery + first insight to look for
  - Day 3: Quick win (no pitch)
  - Day 7: Insight seed
  - Day 14: Social proof + soft CTA
  - Day 21: Direct offer (book a call)
- [ ] For the entry-tier products ($67), add a Day 45 email offering the next product in the sector cluster at a 15–20% discount
- [ ] Tag all product buyers with `nlc_product_buyer` for retargeting and exclusion from top-of-funnel campaigns

---

## PHASE 6 — Content & Product Files 🔧 REQUIRED

The following products need their actual downloadable files created (the catalog, pages, and checkout are live — the download files are the product):

### Priority 1 (Build First — highest conversion potential)
- [ ] **NLC-HC-001** Medical Practice 90-Day Revenue Recovery Plan — Excel workbook + PDF guide
- [ ] **NLC-LG-001** Law Firm Profitability Diagnostic — Excel workbook + dashboard
- [ ] **NLC-CN-001** Construction Project Profitability Tracker — Excel spreadsheet
- [ ] **NLC-CN-002** Trades Business Owner's Growth Blueprint — PDF workbook + Excel model
- [ ] **NLC-TK-001** SaaS Metrics Dashboard for Founders — Excel/Google Sheets dashboard
- [ ] **NLC-GC-001** Government Contract Bid Readiness Assessment — PDF assessment + Excel scorer
- [ ] **NLC-RH-001** Restaurant Prime Cost Controller — Excel weekly tracker
- [ ] **NLC-RE-001** Real Estate Investor Deal Analyzer — Excel DCF/NOI model
- [ ] **NLC-NP-002** Grant Readiness Self-Assessment — PDF assessment
- [ ] **NLC-PS-002** Marketing Agency Pricing & Scope Toolkit — Excel workbook + Word SOW template

### Priority 2 (Build Second)
- [ ] **NLC-HC-002** HIPAA Compliance Gap Assessment
- [ ] **NLC-FS-001** RIA Client Communication System
- [ ] **NLC-GC-002** CPSR / Compliance Audit Prep Toolkit

### Priority 3–4 (Complete Catalog)
- [ ] All remaining 19 SKUs (see Plan §10 Final SKU Sheet for full list)

---

## PHASE 7 — Navigation & Cross-Links 🔧 RECOMMENDED

- [ ] Update `/resources.html` — add "Paid Products" section linking to `/products/` catalog
- [ ] Update `/free-resources.html` — add sidebar or footer section: "Ready to go deeper? Browse paid frameworks →"
- [ ] Update footer across all site pages to include "Products" link pointing to `/products/`
- [ ] Update `/about.html` and `/case-studies.html` nav to include Products mega-dropdown
  - Note: Currently only `index.html` has been updated. Replicate the nav change to all other HTML pages on the site
- [ ] Add "From the Product Catalog" section to homepage between Plans and FAQ sections

---

## PHASE 8 — Functional Testing ✅ COMPLETE THIS BEFORE LAUNCH

### Browse-All Catalog (`/products/`)
- [ ] Page loads without errors
- [ ] All 32 product cards render correctly with name, sector badge, price, and format tags
- [ ] Sector filter chips work — clicking "Healthcare" shows only healthcare products
- [ ] Price tier filter works — clicking "Core" shows only $97–$127 products
- [ ] Combined filters work — Healthcare + Premium shows only NLC-HC-001 and NLC-HC-003
- [ ] Search works — typing "billing" surfaces relevant products
- [ ] Sort works — "Price: Low to High" reorders correctly
- [ ] "Clear filters" resets all filters
- [ ] URL updates when filters are applied (`/products/?sector=healthcare`)
- [ ] Bundle cards render at bottom of page
- [ ] Page is responsive at 1440px, 1024px, 768px, and 375px

### Product Detail (`/products/detail.html?sku=NLC-HC-001`)
- [ ] Correct product name, price, sector badge render
- [ ] Breadcrumb renders: Products › Healthcare & Medical Practices › Medical Practice 90-Day Revenue Recovery Plan
- [ ] Deliverables list renders in sidebar
- [ ] "Buy Now — $197" button appears and triggers checkout modal on click
- [ ] Problem statement, What's Inside sections, Who It's For, FAQ all render
- [ ] FAQ accordion expands/collapses on click
- [ ] Upsell box renders with correct scope name and price
- [ ] Related products appear in right sidebar
- [ ] 404 state appears for invalid SKU: `/products/detail.html?sku=INVALID`
- [ ] Page is responsive at mobile widths

### Sector Pages (`/products/healthcare/`)
- [ ] Hero renders with sector name, badge, description, and CTA buttons
- [ ] Only healthcare products appear in grid
- [ ] Format and tier filters work
- [ ] "← Browse all sectors" link returns to `/products/`
- [ ] Verify all 13 sector pages load without JS errors

### Navigation
- [ ] "Products ▾" appears in main nav on homepage
- [ ] Mega-dropdown appears on hover (desktop)
- [ ] All 13 sector links in mega-dropdown navigate correctly
- [ ] "Browse All Products →" link in mega-dropdown goes to `/products/`
- [ ] Mega-dropdown hidden on mobile (< 960px)
- [ ] "Products" appears in mobile drawer and links to `/products/`

### Checkout Flow
- [ ] "Buy Now" button opens PayPal checkout modal
- [ ] Modal shows correct product name and price
- [ ] PayPal buttons render inside modal (requires PayPal SDK with valid client-id)
- [ ] Closing modal (×) works
- [ ] After payment: portal account created, confirmation email sent, download accessible

---

## PHASE 9 — Server-Side Routing (Optional Enhancement)

The current implementation uses `/products/detail.html?sku=NLC-HC-001` for product URLs. For cleaner SEO URLs (`/products/healthcare/medical-practice-revenue-recovery-plan/`):

- [ ] Add Express route in server: `app.get('/products/:sector/:slug', (req, res) => res.sendFile('detail.html'))`
- [ ] Update `detail.html` JS to also read `window.location.pathname` for slug-based routing
- [ ] Create a `slug → sku` lookup in `products-data.js` (all products have `slug` field)
- [ ] Update all `<a href>` in product cards to use slug URLs instead of `?sku=` params
- [ ] Redirect old `?sku=` URLs to new slug URLs with 301

---

## PHASE 10 — Cleanup

- [ ] Delete `gen_sectors.py` from project root (temporary generator script, not needed in production)
- [ ] Add `gen_sectors.py` to `.gitignore` or delete before git commit

---

## Quick Validation Commands

```bash
# Verify all sector pages exist
ls public/products/*/index.html

# Count products in data file
grep -c '"sku":' public/products/data/products-data.js

# Verify no broken links to detail page
grep -r 'detail.html' public/products/ | head -20

# Check CSS was appended correctly
grep -c 'nav-mega' public/assets/css/styles.css
```

---

## Launch Sequence

1. Complete Phase 2 (PayPal client-id) — **required, site won't sell without this**
2. Build and upload at least the 10 Priority 1 product files (Phase 6)
3. Run Phase 8 functional tests
4. Update nav on remaining site pages (Phase 7)
5. Submit to Google Search Console (Phase 3)
6. Set up email sequences for Priority 1 SKUs (Phase 5)
7. Announce on LinkedIn using sequences from the Plan marketing kit

---

*Checklist generated by NLC Firm implementation — May 2026*
