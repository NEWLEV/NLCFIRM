/* ═══════════════════════════════════════════════════════
   NLCFirm.com — main.js
   New Level Consultants · Frontend Interactivity
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── CHAT SESSION ID ────────────────────────────────
  const chatSessionId = 'cs_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);

  // ─── SCROLL PROGRESS & NAV ──────────────────────────
  window.addEventListener('scroll', function () {
    const st = document.documentElement.scrollTop;
    const sh = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = document.getElementById('scroll-progress');
    const nav = document.getElementById('nav');
    const stickyCta = document.getElementById('sticky-cta');

    if (progress) progress.style.width = (st / sh * 100) + '%';
    if (nav) nav.classList.toggle('scrolled', st > 60);
    if (stickyCta) stickyCta.classList.toggle('visible', st > 800);
  });

  // ─── ANIMATED COUNTERS ──────────────────────────────
  var numObserver = new IntersectionObserver(function (entries, Object) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        numObserver.unobserve(el);
        var target = +el.dataset.count;
        var suffix = el.dataset.suffix || '';
        var current = 0;
        var step = target / 40;
        var timer = setInterval(function () {
          current += step;
          if (current >= target) { current = target; clearInterval(timer); }
          el.textContent = Math.round(current) + suffix;
        }, 30);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-num[data-count]').forEach(function (el) {
    numObserver.observe(el);
  });

  // ─── SCROLL ANIMATIONS ─────────────────────────────
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) entry.target.classList.add('in');
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.anim').forEach(function (el) {
    observer.observe(el);
  });

  // Hero cards: auto-add visible class
  document.querySelectorAll('.hero-card').forEach(function (card) {
    card.classList.add('visible');
  });

  // ─── MOBILE DRAWER ─────────────────────────────────
  window.toggleDrawer = function () {
    var h = document.getElementById('hamburger');
    var d = document.getElementById('mobile-drawer');
    var o = document.getElementById('drawer-overlay');
    if (h) h.classList.toggle('open');
    if (d) d.classList.toggle('open');
    if (o) o.classList.toggle('open');
  };

  // ─── BILLING TOGGLE ────────────────────────────────
  var prices = { starter: [797, 677], growth: [1497, 1272], enterprise: [2997, 2547] };
  var savingsText = {
    starter: 'Save ~$1,440/yr billed annually',
    growth: 'Save ~$2,700/yr billed annually',
    enterprise: 'Save ~$5,400/yr billed annually'
  };
  var annual = false;

  window.toggleBilling = function () {
    annual = !annual;
    var toggle = document.getElementById('billing-toggle');
    var badge = document.getElementById('save-badge');
    var lblM = document.getElementById('lbl-monthly');
    var lblA = document.getElementById('lbl-annual');
    if (toggle) { toggle.classList.toggle('on', annual); toggle.setAttribute('aria-checked', String(annual)); }
    if (badge) badge.classList.toggle('save-badge-dim', !annual);
    if (lblM) lblM.classList.toggle('active', !annual);
    if (lblA) lblA.classList.toggle('active', annual);
    var i = annual ? 1 : 0;
    setText('p-starter', prices.starter[i].toLocaleString());
    setText('p-growth', prices.growth[i].toLocaleString());
    setText('p-enterprise', prices.enterprise[i].toLocaleString());
    setText('note-starter', annual ? savingsText.starter : '\u00a0');
    setText('note-growth', annual ? savingsText.growth : '\u00a0');
    setText('note-enterprise', annual ? savingsText.enterprise : '\u00a0');
  };

  // ─── SERVICES CATEGORY TOGGLE ──────────────────────
  window.toggleCat = function (el) {
    var expanded = el.getAttribute('aria-expanded') === 'true';
    el.setAttribute('aria-expanded', String(!expanded));
    var content = el.nextElementSibling;
    if (content && content.classList.contains('cat-collapsible')) {
      content.classList.toggle('collapsed');
    }
  };

  // ─── FAQ ───────────────────────────────────────────
  window.toggleFAQ = function (el) {
    var item = el.parentElement;
    var isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(function (i) { i.classList.remove('open'); });
    if (!isOpen) item.classList.add('open');
  };

  // ─── ROI CALCULATOR ────────────────────────────────
  window.calcROI = function () {
    var emp = +document.getElementById('roi-emp').value;
    var comp = +document.getElementById('roi-comp').value;
    var hrs = +document.getElementById('roi-hrs').value;
    setText('roi-emp-val', emp);
    setText('roi-comp-val', '$' + comp.toLocaleString());
    setText('roi-hrs-val', hrs);
    var savingsAmt = Math.round((comp * 0.3 * 12) + (hrs * 45 * 52 * 0.4));
    setText('roi-total', '$' + savingsAmt.toLocaleString());
  };

  // ─── MODAL ─────────────────────────────────────────
  var modalData = {
    consult: ['Book a Free Discovery Call', 'A focused 20-min session with a senior consultant — no pressure, just clarity on your best next step.'],
    starter: ['Get Started — Starter Plan ($797/mo)', "We'll set up your onboarding and have you rolling within 3 business days."],
    growth: ['Get Started — Growth Plan ($1,497/mo)', 'Our most popular plan. Expect your kickoff call scheduled within 48 hours.'],
    enterprise: ['Enterprise Partnership Inquiry', "Tell us about your organization and we'll build a custom proposal within 3 business days."],
    hipaa: ['HIPAA Compliance Setup — $1,200', 'Full HIPAA program including policies, risk assessment, and training plan.'],
    'hipaa-ongoing': ['HIPAA Ongoing Monitoring — $497/month', 'Continuous compliance monitoring and annual risk analysis.'],
    ryan: ['Ryan White Reporting — $1,500', 'Expert preparation of your Ryan White Part A & EHE reports.'],
    bha: ['Business Health Assessment — $97', 'Complete the form to access your questionnaire and receive an instant PDF.'],
    'seo-audit': ['SEO Audit Report — $147', 'Enter your website URL and receive a comprehensive audit within 24 hours.'],
    frs: ['Financial Readiness Score — $127', 'Get your personalized financial readiness report instantly.'],
    bundle: ['All-in-One Tool Bundle — $347', 'Save $188. Get all 5 instant tools in one purchase.'],
    'hipaa-dl': ['HIPAA Checklist Package — $67', 'Instant download: 120+ action items, BAA template, and forms.'],
    'sop-dl': ['SOP Template Bundle — $97', 'Instant download: 15 templates in Word & Google Docs.'],
    'ai-content': ['AI Content Refresh Agent — $197/month', 'Monthly site scan with rewrite recommendations.'],
    cert: ['Healthcare Compliance Certification — $297', 'Self-paced. Immediate access. Certificate included.'],
    webinar: ['Monthly Compliance Webinar — $47/month', 'Live sessions + recordings. Cancel anytime.'],
    coaching: ['Executive Coaching — $597/month', 'Bi-weekly 1:1 sessions. Cancel anytime.']
  };

  var currentStep = 1;

  window.openModal = function (type) {
    var d = modalData[type] || ['Get in Touch', "Fill out the form and we'll be in touch within 1 business day."];
    setText('modal-title', d[0]);
    setText('modal-sub', d[1]);
    // Store the service type for submission
    document.getElementById('modal').dataset.serviceType = type;
    currentStep = 1;
    updateSteps();
    // Reset form
    ['f-first', 'f-last', 'f-email', 'f-org', 'f-msg'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.getElementById('modal').classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.nextStep = function (n) {
    // Validate current step before advancing
    if (n > currentStep) {
      if (currentStep === 1) {
        var first = document.getElementById('f-first').value.trim();
        var last = document.getElementById('f-last').value.trim();
        var email = document.getElementById('f-email').value.trim();
        if (!first || !last) { showFieldError('Please enter your first and last name.'); return; }
        if (!email || !email.includes('@')) { showFieldError('Please enter a valid email address.'); return; }
      }
    }
    currentStep = n;
    updateSteps();
  };

  function updateSteps() {
    document.querySelectorAll('.form-step').forEach(function (s, i) {
      s.classList.toggle('active', i === currentStep - 1);
    });
    document.querySelectorAll('.step-dot').forEach(function (d, i) {
      d.classList.toggle('active', i === currentStep - 1);
      d.classList.toggle('done', i < currentStep - 1);
    });
  }

  window.closeModalOverlay = function (e) {
    if (e.target.id === 'modal') closeModalDirect();
  };

  window.closeModalDirect = function () {
    document.getElementById('modal').classList.remove('open');
    document.body.style.overflow = '';
  };

  window.submitModal = async function () {
    var modal = document.getElementById('modal');
    var serviceType = modal.dataset.serviceType || '';
    var data = {
      firstName: document.getElementById('f-first').value.trim(),
      lastName: document.getElementById('f-last').value.trim(),
      email: document.getElementById('f-email').value.trim(),
      organization: document.getElementById('f-org').value.trim(),
      orgSize: document.getElementById('f-size').value,
      industry: document.getElementById('f-industry').value,
      message: document.getElementById('f-msg').value.trim(),
      contactMethod: document.getElementById('f-contact').value,
      serviceType: serviceType
    };

    // Final validation
    if (!data.firstName || !data.lastName || !data.email) {
      showFieldError('Please fill in all required fields.');
      return;
    }

    // Show loading state
    var submitBtn = document.querySelector('#form-step-3 .btn-gold');
    var origText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    try {
      var response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        // Show success state
        var modalContent = modal.querySelector('.modal');
        var oldContent = modalContent.innerHTML;
        modalContent.innerHTML = '<button class="modal-close" onclick="closeModalDirect()" aria-label="Close">&times;</button>' +
          '<div class="form-success">' +
          '<div class="form-success-icon">✓</div>' +
          '<div class="form-success-msg">Request Submitted!</div>' +
          '<div class="form-success-sub">We\'ll be in touch within 1 business day. Check your inbox for a confirmation.</div>' +
          '</div>';
        setTimeout(function () { modalContent.innerHTML = oldContent; closeModalDirect(); }, 4000);
      } else {
        var err = await response.json();
        showFieldError(err.errors ? err.errors[0].msg : 'Submission failed. Please try again.');
        submitBtn.textContent = origText;
        submitBtn.disabled = false;
      }
    } catch (e) {
      showFieldError('Connection error. Please try again.');
      submitBtn.textContent = origText;
      submitBtn.disabled = false;
    }
  };

  function showFieldError(msg) {
    // Simple alert for now — could be upgraded to inline error display
    alert(msg);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeModalDirect();
      closeExit();
    }
  });

  // ─── CHATBOT ───────────────────────────────────────
  var chatOpen = false;

  window.toggleChat = function () {
    chatOpen = !chatOpen;
    var win = document.getElementById('chatbot-window');
    var trigger = document.getElementById('chatbot-trigger');
    if (win) win.classList.toggle('open', chatOpen);
    if (trigger) trigger.textContent = chatOpen ? '✕' : '💬';
    if (chatOpen) document.getElementById('chat-input').focus();
    document.body.classList.toggle('chatbot-open', chatOpen);
  };

  var chatResponses = {
    pricing: 'Our retainer plans start at $797/mo (Starter), $1,497/mo (Growth), and $2,997/mo (Enterprise). Annual plans save 15%. We also have instant tools from $67-$197.',
    hipaa: 'Our HIPAA Compliance Program Setup is $1,200 (one-time) and covers policies, BAA templates, training plans, and risk assessment. Ongoing monitoring is $497/month.',
    services: 'We offer Healthcare Consulting, Compliance & Risk, Operations, Technology & AI, HR, and Marketing services. Browse the full catalog at transparent pricing — no discovery call needed.',
    plans: 'Starter ($797/mo): 2 sessions/month + compliance support. Growth ($1,497/mo): 4 sessions/month + dedicated advisor. Enterprise ($2,997/mo): Unlimited sessions + full advisory.',
    tools: 'We have instant tools: Business Health Assessment ($97), SEO Audit ($147), Financial Readiness Score ($127), HIPAA Checklist ($67), SOP Templates ($97), and AI Content Agent ($197/mo). Bundle all 5 for $347.',
    ai: 'Our AI Automation Strategy service ($2,800) identifies opportunities, selects tools, builds workflows, and trains your staff. We also offer AI Chatbot Setup for Healthcare ($1,900 + $197/mo).',
    consult: 'Book a free 20-minute discovery call! No sales pressure — just clarity on your best next step. Click "Get Started" in the top nav or type "book" to start.',
    book: 'Great! Let me open the booking form for you.',
    hello: 'Hello! 👋 How can I help you today? I can answer questions about our services, pricing, compliance, AI automation, or help you book a call.',
    default: "Thanks for your question! For detailed inquiries, I'd recommend booking a free 20-minute discovery call with one of our senior consultants. Would you like me to help you with that?"
  };

  window.sendChat = function () {
    var input = document.getElementById('chat-input');
    var msg = input.value.trim();
    if (!msg) return;
    appendChat(msg, 'user');
    logChat('user', msg);
    input.value = '';

    setTimeout(function () {
      var lower = msg.toLowerCase();
      var response = chatResponses.default;
      if (lower.includes('pric') || lower.includes('cost') || lower.includes('how much')) response = chatResponses.pricing;
      else if (lower.includes('hipaa') || lower.includes('compliance')) response = chatResponses.hipaa;
      else if (lower.includes('service')) response = chatResponses.services;
      else if (lower.includes('plan') || lower.includes('retainer')) response = chatResponses.plans;
      else if (lower.includes('tool') || lower.includes('instant') || lower.includes('download')) response = chatResponses.tools;
      else if (lower.includes('ai') || lower.includes('automat')) response = chatResponses.ai;
      else if (lower.includes('consult') || lower.includes('call') || lower.includes('free')) response = chatResponses.consult;
      else if (lower.includes('book') || lower.includes('start') || lower.includes('sign up')) {
        response = chatResponses.book;
        setTimeout(function () { openModal('consult'); }, 800);
      }
      else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) response = chatResponses.hello;
      appendChat(response, 'bot');
      logChat('bot', response);
    }, 600);
  };

  function appendChat(text, role) {
    var div = document.createElement('div');
    div.className = 'chat-msg ' + role;
    div.textContent = text;
    document.getElementById('chat-messages').appendChild(div);
    div.scrollIntoView({ behavior: 'smooth' });
  }

  function logChat(role, message) {
    fetch('/api/chat-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: chatSessionId, role: role, message: message })
    }).catch(function () { /* silent fail for logging */ });
  }

  // ─── SOCIAL PROOF TOASTS ───────────────────────────
  var toasts = [
    { avatar: 'SJ', text: '<strong>Sandra J.</strong> purchased Business Health Assessment', time: '2 minutes ago' },
    { avatar: 'MK', text: '<strong>Marcus K.</strong> enrolled in Growth Plan', time: '8 minutes ago' },
    { avatar: 'AP', text: '<strong>Amanda P.</strong> booked a Free Discovery Call', time: '14 minutes ago' },
    { avatar: 'DW', text: '<strong>Dr. Wilson</strong> purchased HIPAA Checklist Pack', time: '23 minutes ago' },
    { avatar: 'TR', text: '<strong>Tara R.</strong> subscribed to AI Content Agent', time: '31 minutes ago' }
  ];
  var toastIdx = 0;

  function showToast() {
    var t = toasts[toastIdx % toasts.length];
    var avatar = document.getElementById('toast-avatar');
    var text = document.getElementById('toast-text');
    var time = document.getElementById('toast-time');
    var el = document.getElementById('social-toast');
    if (avatar) avatar.textContent = t.avatar;
    if (text) text.innerHTML = t.text;
    if (time) time.textContent = t.time;
    if (el) {
      el.classList.add('show');
      setTimeout(function () { el.classList.remove('show'); }, 5000);
    }
    toastIdx++;
  }

  setTimeout(showToast, 8000);
  setInterval(showToast, 25000);

  // ─── EXIT INTENT ───────────────────────────────────
  var exitShown = false;

  document.addEventListener('mouseout', function (e) {
    if (e.clientY < 5 && !exitShown && !document.getElementById('modal').classList.contains('open')) {
      exitShown = true;
      document.getElementById('exit-overlay').classList.add('show');
    }
  });

  window.closeExit = function () {
    document.getElementById('exit-overlay').classList.remove('show');
  };

  window.submitExit = async function () {
    var email = document.getElementById('exit-email').value.trim();
    if (!email || !email.includes('@')) { alert('Please enter a valid email address.'); return; }

    try {
      var response = await fetch('/api/exit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      });

      if (response.ok) {
        alert('Check your inbox! Your HIPAA Quick-Start Checklist is on the way.');
        closeExit();
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch (e) {
      alert('Connection error. Please try again.');
    }
  };

  // ─── COOKIE CONSENT ────────────────────────────────
  if (!localStorage.getItem('cookieConsent')) {
    setTimeout(function () {
      var bar = document.getElementById('cookie-bar');
      if (bar) bar.classList.add('show');
    }, 2000);
  }

  window.acceptCookies = function () {
    localStorage.setItem('cookieConsent', 'accepted');
    document.getElementById('cookie-bar').classList.remove('show');
  };

  window.declineCookies = function () {
    localStorage.setItem('cookieConsent', 'declined');
    document.getElementById('cookie-bar').classList.remove('show');
  };

  // ─── DYNAMIC CONTENT ─────────────────────────────
  async function fetchDynamicContent() {
    try {
      // 1. Load Settings
      const settingsRes = await fetch('/api/settings');
      if (settingsRes.ok) {
        const { settings } = await settingsRes.json();
        const settingsMap = settings.reduce((acc, s) => { acc[s.key] = s.value; return acc; }, {});
        
        if (settingsMap.hero_eyebrow) setText('hero-eyebrow', settingsMap.hero_eyebrow);
        if (settingsMap.hero_title) setHTML('hero-title', settingsMap.hero_title);
        if (settingsMap.hero_subtitle) setText('hero-subtitle', settingsMap.hero_subtitle);
        if (settingsMap.footer_tagline) setText('footer-tagline', settingsMap.footer_tagline);
        if (settingsMap.cta_heading) setHTML('cta-heading', settingsMap.cta_heading);
        if (settingsMap.cta_body) setText('cta-body', settingsMap.cta_body);
        
        // Trust badges
        for (let i = 1; i <= 5; i++) {
          const val = settingsMap[`trust_badge_${i}`];
          if (val) {
            const el = document.getElementById(`trust-${i}`);
            // Keep icon if possible, or just replace text if it starts with emoji
            if (el) el.textContent = val;
          }
        }
      }

      // 2. Load Services
      const servicesRes = await fetch('/api/services');
      if (servicesRes.ok) {
        const { services } = await servicesRes.json();
        if (services && services.length > 0) {
          const container = document.getElementById('dynamic-services-container');
          const fallback = document.getElementById('static-services-fallback');
          if (container && fallback) {
            // Group by category
            const cats = services.reduce((acc, s) => {
              if (!acc[s.category]) acc[s.category] = [];
              acc[s.category].push(s);
              return acc;
            }, {});

            let html = '';
            for (const [catName, list] of Object.entries(cats)) {
              const icon = getCatIcon(catName);
              html += `<div class="service-cat anim">
                <div class="cat-header"><div class="cat-icon">${icon}</div><div class="cat-name">${catName}</div></div>
                <div class="services-list">`;
              
              list.forEach(s => {
                const tags = JSON.parse(s.tags || '[]');
                const tagsHtml = tags.map(t => `<span class="tag">${t}</span>`).join('');
                html += `<div class="service-item">
                  <div class="service-name">${s.name}</div>
                  <div class="service-desc">${s.description}</div>
                  <div class="service-footer">
                    <div class="service-price">${s.price} <small>${s.price_unit}</small></div>
                    <div class="tags">${tagsHtml}<button class="add-btn" onclick="openModal('${s.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}')">Inquire</button></div>
                  </div>
                </div>`;
              });
              
              html += `</div></div>`;
            }
            container.innerHTML = html;
            fallback.style.display = 'none';
          }
        }
      }

      // 3. Load Testimonials
      const testRes = await fetch('/api/testimonials');
      if (testRes.ok) {
        const { testimonials } = await testRes.json();
        if (testimonials && testimonials.length > 0) {
          const container = document.getElementById('testimonials-container');
          if (container) {
            container.innerHTML = testimonials.map(t => `
              <div class="tcard">
                <div class="tcard-stars">${'★'.repeat(t.rating)}${'☆'.repeat(5-t.rating)}</div>
                <div class="tcard-quote">"${t.quote}"</div>
                <div class="tcard-meta">
                  <div class="tcard-avatar">${t.author_initials || '??'}</div>
                  <div>
                    <div class="tcard-name">${t.author_name}</div>
                    <div class="tcard-role">${t.author_role}</div>
                  </div>
                </div>
              </div>
            `).join('');
          }
        }
      }

      // 4. Load FAQ
      const faqRes = await fetch('/api/faq');
      if (faqRes.ok) {
        const { faq } = await faqRes.json();
        if (faq && faq.length > 0) {
          const container = document.getElementById('faq-container');
          if (container) {
            container.innerHTML = faq.map(f => `
              <div class="faq-item">
                <div class="faq-q" onclick="toggleFAQ(this)">${f.question} <span class="faq-arrow">+</span></div>
                <div class="faq-a">${f.answer}</div>
              </div>
            `).join('');
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load dynamic content:', e);
    }
  }

  function getCatIcon(cat) {
    const map = {
      'Healthcare-Specific Consulting': '🏥',
      'Compliance & Risk Management': '⚖️',
      'Operations & Process': '⚙️',
      'Technology & AI': '💻',
      'HR & Workforce': '👥',
      'Marketing & Growth': '📈'
    };
    return map[cat] || '📋';
  }

  // Initial load
  fetchDynamicContent();

  // ─── HERO CANVAS PARTICLES ──────────────────────────
  (function initHeroCanvas() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var numParticles = 50;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (var i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 1
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(201, 168, 76, 0.25)';
        ctx.fill();

        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var dx = p.x - q.x;
          var dy = p.y - q.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = 'rgba(201, 168, 76, ' + (0.08 * (1 - dist / 120)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  })();

  // ─── SOLUTION FINDER QUIZ ─────────────────────────
  var quizAnswers = {};

  window.quizSelect = function (step, value) {
    quizAnswers['step' + step] = value;

    // Highlight selected option
    var stepEl = document.getElementById('quiz-step-' + step);
    if (stepEl) {
      stepEl.querySelectorAll('.quiz-option').forEach(function (btn) { btn.classList.remove('selected'); });
      event.currentTarget.classList.add('selected');
    }

    setTimeout(function () {
      if (step < 3) {
        // Advance to next step
        document.getElementById('quiz-step-' + step).classList.remove('active');
        document.getElementById('quiz-step-' + (step + 1)).classList.add('active');
        document.getElementById('quiz-progress-fill').style.width = ((step + 1) * 33) + '%';
      } else {
        // Show result
        showQuizResult();
      }
    }, 300);
  };

  function showQuizResult() {
    document.getElementById('quiz-step-3').classList.remove('active');
    document.getElementById('quiz-progress-fill').style.width = '100%';

    var org = quizAnswers.step1 || 'business';
    var challenge = quizAnswers.step2 || 'compliance';
    var budget = quizAnswers.step3 || 'growth';

    var recommendations = {
      // Budget: starter (under $200)
      'starter_compliance': { title: 'HIPAA Compliance Checklist Pack — $67', desc: 'Start with our most popular instant tool: 120+ action items, BAA templates, staff forms, and breach notification checklist. Implement immediately and know exactly where you stand.', cta: 'Buy Now — $67', action: function () { openCheckoutModal('hipaa-dl', 'HIPAA Compliance Checklist Pack', 67); } },
      'starter_operations': { title: 'SOP Template Bundle — $97', desc: '15 ready-to-use SOP templates covering HR, compliance, operations, and clinical workflows. Fully customizable in Word & Google Docs. Start organizing your operations today.', cta: 'Buy Now — $97', action: function () { openCheckoutModal('sop-dl', 'SOP Template Bundle', 97); } },
      'starter_growth': { title: 'Business Health Assessment — $97', desc: 'Scored assessment across 8 dimensions of your business. Receive an instant branded PDF report with a prioritized action plan. Most clients say it feels like a $5,000 deliverable.', cta: 'Buy Now — $97', action: function () { openCheckoutModal('bha', 'Business Health Assessment', 97); } },
      'starter_technology': { title: 'SEO Audit Report — $147', desc: 'Automated site crawl covering technical SEO, keyword gaps, backlink analysis, and competitor benchmarking. Branded PDF delivered within 24 hours.', cta: 'Buy Now — $147', action: function () { openCheckoutModal('seo-audit', 'SEO Audit Report', 147); } },

      // Budget: growth ($500–$1,500/mo)
      'growth_compliance': { title: 'Growth Retainer — $1,497/mo', desc: 'Our most popular plan. Full compliance program management, dedicated account manager, live KPI dashboard, and 4 consulting sessions per month. 98% of clients stay beyond their first year.', cta: 'Get Started', action: function () { openModal('growth'); } },
      'growth_operations': { title: 'Starter Retainer + Workflow Optimization', desc: 'Begin with our Starter Plan at $797/mo for strategic guidance, then add a Workflow Optimization project ($2,200) to rebuild inefficient processes. Combined: measurable ROI within 60 days.', cta: 'Get Started', action: function () { openModal('starter'); } },
      'growth_growth': { title: 'Growth Retainer — $1,497/mo', desc: 'Hands-on strategy, marketing guidance, and operations support with a named advisor. Includes quarterly business health assessments and staff training coordination.', cta: 'Get Started', action: function () { openModal('growth'); } },
      'growth_technology': { title: 'Growth Retainer + AI Setup', desc: 'Start with our Growth Plan ($1,497/mo) for strategic support, and add an AI Automation project ($2,800) to unlock efficiency gains. Clients report 30+ hours saved per month.', cta: 'Get Started', action: function () { openModal('growth'); } },

      // Budget: enterprise ($1,500+/mo)
      'enterprise_compliance': { title: 'Enterprise Partnership — $2,997/mo', desc: 'Comprehensive compliance management with unlimited consulting, 24/7 support, quarterly on-site visits, and enterprise-grade auditing. Purpose-built for multi-site organizations.', cta: 'Request Proposal', action: function () { openModal('enterprise'); } },
      'enterprise_operations': { title: 'Enterprise Partnership — $2,997/mo', desc: 'Full HR, operations, and technology advisory with custom reporting dashboards, grant writing support, and executive coaching. Your complete strategic partner.', cta: 'Request Proposal', action: function () { openModal('enterprise'); } },
      'enterprise_growth': { title: 'Enterprise Partnership — $2,997/mo', desc: 'Strategic acceleration with unlimited sessions, executive coaching, and full organizational support. Designed for organizations scaling aggressively.', cta: 'Request Proposal', action: function () { openModal('enterprise'); } },
      'enterprise_technology': { title: 'Enterprise Partnership + AI Suite', desc: 'Enterprise retainer ($2,997/mo) with AI chatbot setup, automation strategy, and cybersecurity assessment. The most comprehensive technology transformation package we offer.', cta: 'Request Proposal', action: function () { openModal('enterprise'); } },

      // Budget: project (one-time)
      'project_compliance': { title: 'HIPAA Compliance Program Setup — $1,200', desc: 'Complete HIPAA program with policies, BAA templates, workforce training plan, and risk assessment. Delivered in 30 days. No ongoing commitment required.', cta: 'Get Started', action: function () { openModal('hipaa'); } },
      'project_operations': { title: 'Workflow Optimization — $2,200', desc: 'We map, analyze, and rebuild your inefficient workflows to reduce waste and improve throughput. One-time project with lasting impact.', cta: 'Get Started', action: function () { openModal('workflow'); } },
      'project_growth': { title: 'SEO Audit + Business Health Assessment', desc: 'Get both our SEO Audit ($147) and Business Health Assessment ($97) — or grab the full bundle for $347 and save $188. Instant, actionable insights with zero commitment.', cta: 'Get the Bundle — $347', action: function () { openModal('bundle'); } },
      'project_technology': { title: 'AI Automation Strategy — $2,800', desc: 'Identify automation opportunities, select the right tools, build workflows, and train your staff. One project that transforms how your organization operates.', cta: 'Get Started', action: function () { openModal('ai'); } }
    };

    var key = budget + '_' + challenge;
    var rec = recommendations[key] || recommendations['growth_compliance'];

    // Customize for org type
    if (org === 'healthcare' && challenge === 'compliance') {
      rec = recommendations[budget + '_compliance'] || rec;
    }

    setText('quiz-result-title', rec.title);
    setText('quiz-result-desc', rec.desc);

    var ctaBtn = document.getElementById('quiz-result-cta');
    ctaBtn.textContent = rec.cta;
    ctaBtn.onclick = rec.action;

    var resultDiv = document.getElementById('quiz-result');
    resultDiv.style.display = '';
    resultDiv.classList.add('active');
  }

  window.resetQuiz = function () {
    quizAnswers = {};
    document.getElementById('quiz-result').classList.remove('active');
    document.getElementById('quiz-result').style.display = 'none';
    document.getElementById('quiz-step-1').classList.add('active');
    document.getElementById('quiz-progress-fill').style.width = '33%';
    document.querySelectorAll('.quiz-option.selected').forEach(function (btn) { btn.classList.remove('selected'); });
  };

  // ─── SERVICE FILTERING ────────────────────────────
  var activeFilters = { need: 'all', budget: 'all' };

  // Map categories to filter values
  var catNeedMap = {
    'Healthcare-Specific Consulting': 'healthcare',
    'Compliance & Risk Management': 'compliance',
    'Compliance &amp; Risk Management': 'compliance',
    'Operations & Process': 'operations',
    'Operations &amp; Process': 'operations',
    'Technology & AI': 'technology',
    'Technology &amp; AI': 'technology',
    'HR & Workforce': 'hr',
    'HR &amp; Workforce': 'hr',
    'Marketing & Growth': 'marketing',
    'Marketing &amp; Growth': 'marketing'
  };

  window.filterServices = function (type, value) {
    activeFilters[type] = value;

    // Update pill active states
    var container = document.getElementById('filter-' + type);
    if (container) {
      container.querySelectorAll('.filter-pill').forEach(function (pill) {
        pill.classList.toggle('active', pill.dataset.filter === value);
      });
    }

    applyFilters();
  };

  function applyFilters() {
    var cats = document.querySelectorAll('.service-cat');
    var visible = 0;

    cats.forEach(function (cat) {
      var catName = cat.querySelector('.cat-name');
      if (!catName) return;
      var catText = catName.textContent;
      var catNeed = catNeedMap[catText] || 'other';

      // Need filter
      var needPass = activeFilters.need === 'all' || catNeed === activeFilters.need;

      if (!needPass) {
        cat.classList.add('filter-hidden');
      } else {
        cat.classList.remove('filter-hidden');

        // Budget filter on individual items
        var items = cat.querySelectorAll('.service-item');
        var catItemsVisible = 0;
        items.forEach(function (item) {
          var priceEl = item.querySelector('.service-price');
          if (!priceEl) { item.classList.remove('filter-hidden'); catItemsVisible++; return; }
          var priceText = priceEl.textContent;
          var budgetPass = checkBudgetFilter(priceText, activeFilters.budget);

          if (budgetPass) {
            item.classList.remove('filter-hidden');
            catItemsVisible++;
          } else {
            item.classList.add('filter-hidden');
          }
        });

        if (catItemsVisible === 0) {
          cat.classList.add('filter-hidden');
        } else {
          visible += catItemsVisible;
        }
      }
    });

    var countEl = document.getElementById('filter-count');
    if (countEl) {
      if (activeFilters.need === 'all' && activeFilters.budget === 'all') {
        countEl.textContent = 'All';
      } else {
        countEl.textContent = visible;
      }
    }
  }

  function checkBudgetFilter(priceText, filter) {
    if (filter === 'all') return true;
    // Extract numeric price
    var match = priceText.replace(/,/g, '').match(/\$?([\d]+)/);
    if (!match) return true;
    var price = parseInt(match[1]);

    var isRecurring = priceText.includes('/mo') || priceText.includes('month');

    if (filter === 'recurring') return isRecurring;
    if (filter === 'under-1000') return price < 1000;
    if (filter === '1000-2500') return price >= 1000 && price <= 2500;
    if (filter === 'over-2500') return price > 2500;
    return true;
  }

  // ─── TESTIMONIAL MARQUEE DUPLICATION ──────────────
  (function duplicateMarquee() {
    var track = document.getElementById('marquee-track');
    if (!track) return;
    // Clone all children for seamless loop
    var children = Array.from(track.children);
    children.forEach(function (child) {
      track.appendChild(child.cloneNode(true));
    });
  })();

  // ─── CHATBOT QUICK REPLY ──────────────────────────
  window.quickReply = function (topic) {
    var msgs = {
      pricing: 'Tell me about your pricing',
      hipaa: 'I need help with HIPAA compliance',
      book: 'I want to book a call',
      tools: 'What instant tools do you offer?'
    };
    var msg = msgs[topic] || topic;

    // Remove quick reply pills after first use
    var pills = document.querySelector('.chat-quick-replies');
    if (pills) pills.style.display = 'none';

    appendChat(msg, 'user');
    logChat('user', msg);

    setTimeout(function () {
      var response = chatResponses[topic] || chatResponses.default;
      if (topic === 'book') {
        response = chatResponses.book;
        setTimeout(function () { openModal('consult'); }, 800);
      }
      appendChat(response, 'bot');
      logChat('bot', response);
    }, 600);
  };

  // ─── NEWSLETTER ───────────────────────────────────
  window.submitNewsletter = async function () {
    var emailInput = document.getElementById('newsletter-email');
    var email = emailInput.value.trim();
    if (!email || !email.includes('@')) {
      emailInput.style.borderColor = 'var(--danger)';
      emailInput.placeholder = 'Please enter a valid email';
      setTimeout(function () {
        emailInput.style.borderColor = '';
        emailInput.placeholder = 'Enter your email address';
      }, 3000);
      return;
    }

    try {
      // Use exit-lead endpoint as newsletter signup
      var response = await fetch('/api/exit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, source: 'newsletter' })
      });

      var form = document.getElementById('newsletter-form');
      if (response.ok) {
        form.innerHTML = '<div style="padding:1rem;text-align:center;color:var(--gold);font-weight:600;">✓ You\'re in! Check your inbox for a welcome email.</div>';
      } else {
        form.innerHTML = '<div style="padding:1rem;text-align:center;color:var(--danger);">Something went wrong. Please try again later.</div>';
      }
    } catch (e) {
      alert('Connection error. Please try again.');
    }
  };

  // ─── INLINE FORM VALIDATION ───────────────────────
  // Override showFieldError to use inline messages
  function showFieldError(msg) {
    // Find the active form step
    var activeStep = document.querySelector('.form-step.active');
    if (!activeStep) { alert(msg); return; }

    // Remove existing error
    var existing = activeStep.querySelector('.field-error.show');
    if (existing) existing.classList.remove('show');

    // Create or find error div
    var errorDiv = activeStep.querySelector('.field-error');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.className = 'field-error';
      activeStep.insertBefore(errorDiv, activeStep.querySelector('.btn, .form-nav'));
    }
    errorDiv.textContent = msg;
    errorDiv.classList.add('show');

    // Auto-hide after 4 seconds
    setTimeout(function () { errorDiv.classList.remove('show'); }, 4000);
  }

  // ─── UTILITY ───────────────────────────────────────
  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }
  function setHTML(id, html) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

})();
