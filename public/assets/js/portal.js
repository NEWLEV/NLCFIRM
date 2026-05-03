document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('nlc_client_token');
  const userObj = localStorage.getItem('nlc_client_user');

  if (!token) {
    window.location.href = '/portal-login.html';
    return;
  }

  let user = {};
  try {
    user = JSON.parse(userObj);
    const greeting = document.getElementById('user-greeting');
    if (greeting) greeting.textContent = `Welcome, ${user.firstName || 'Client'}`;
  } catch (e) {
    console.error('Failed to parse user', e);
  }

  // Fetch Dashboard Data
  fetchContainerData('/api/client/purchases', 'purchases-container', renderPurchases);
  fetchContainerData('/api/client/profile', null, renderProfile);
  fetchContainerData('/api/client/courses', 'courses-container', renderCourses);

  // Handle URL hash navigation (e.g., /portal.html#library, /portal.html#courses)
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const link = document.querySelector('[onclick*="' + hash + '"]');
    if (link) link.click();
  }
});

async function fetchContainerData(endpoint, containerId, renderCallback) {
  const token = localStorage.getItem('nlc_client_token');
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401 || response.status === 403) {
      logout();
      return;
    }

    const data = await response.json();
    renderCallback(data, containerId);

  } catch (err) {
    console.error(`Error fetching ${endpoint}:`, err);
    if (containerId) {
      document.getElementById(containerId).innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">⚠️</span>
          <p class="empty-text">Connection error. We couldn't load your data right now.</p>
          <button class="btn btn-outline btn-sm" onclick="location.reload()">Retry Connection</button>
        </div>
      `;
    }
  }
}

function renderPurchases(data, containerId) {
  const container = document.getElementById(containerId);
  const purchases = data.purchases || [];

  if (purchases.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📂</span>
        <p class="empty-text">You don't have any tools or content yet.</p>
        <a href="/index.html#instant-tools" class="btn btn-gold">Browse Instant Tools</a>
      </div>
    `;
    return;
  }

  container.innerHTML = purchases.map(p => {
    const type = p.product_id && (p.product_id.includes('bha') || p.product_id.includes('frs')) ? 'assessment'
      : p.product_id && p.product_id.includes('cert') ? 'course' : 'download';
    const typeLabel = { assessment:'🧭 Assessment Tool', course:'🎓 Course Access', download:'📥 Download Ready' }[type] || '📦 Product';
    
    return `
    <div class="product-card anim">
      <span class="product-tag">${typeLabel}</span>
      <div class="product-name">${escapeHTML(p.product_name)}</div>
      <div class="product-date">Purchased: ${new Date(p.purchased_at).toLocaleDateString()}</div>
      ${p.access_link 
        ? `<a href="${escapeHTML(p.access_link)}" class="btn btn-gold w-full">Access Now →</a>` 
        : `<div class="u-text-gold u-font-size-0-8 u-font-weight-600">⚙️ Provisioning Access...</div>`
      }
    </div>`;
  }).join('');
}

function renderProfile(data) {
  if (data.client) {
    const nameEl = document.getElementById('profile-name');
    const emailEl = document.getElementById('profile-email');
    const companyEl = document.getElementById('profile-company');
    
    if (nameEl) nameEl.textContent = `${data.client.first_name} ${data.client.last_name}`;
    if (emailEl) emailEl.textContent = data.client.email;
    if (companyEl) companyEl.textContent = data.client.company || 'N/A';
  }
}

function logout() {
  localStorage.removeItem('nlc_client_token');
  localStorage.removeItem('nlc_client_user');
  window.location.href = '/portal-login.html';
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

function renderCourses(data, containerId) {
  const container = document.getElementById(containerId);
  const courses = data.courses || [];

  if (courses.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🎓</span>
        <p class="empty-text">You haven't enrolled in any certification programs yet.</p>
        <a href="/#services" class="btn btn-gold">Browse Courses</a>
      </div>`;
    return;
  }

  container.innerHTML = courses.map(c => {
    const progress = c.progress || {};
    const allModules = ['m1','m2','m3','m4','m5','m6'];
    const completedCount = allModules.filter(m => progress[m] && progress[m].completed).length;
    const pct = Math.round((completedCount / allModules.length) * 100);
    const isComplete = completedCount === allModules.length;
    
    return `
    <div class="product-card anim">
      <span class="product-tag">🎓 Certification Course</span>
      <div class="product-name">${escapeHTML(c.name)}</div>
      <div class="product-date">Enrolled: ${new Date(c.enrolled_at).toLocaleDateString()}</div>
      
      <div class="progress-container">
        <div class="progress-label">
          <span>${completedCount} of 6 modules complete</span>
          <span class="u-text-gold u-font-weight-700">${pct}%</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width:${pct}%; background: ${pct >= 100 ? 'var(--success-text, #5ad19b)' : 'var(--gold)'};"></div>
        </div>
      </div>

      ${isComplete 
        ? `<a href="/courses/healthcare-compliance-certification.html" class="btn btn-gold w-full">🏆 View Certificate</a>`
        : `<a href="/courses/healthcare-compliance-certification.html" class="btn btn-outline w-full">${pct > 0 ? 'Continue Course →' : 'Start Course →'}</a>`
      }
    </div>`;
  }).join('');
}
