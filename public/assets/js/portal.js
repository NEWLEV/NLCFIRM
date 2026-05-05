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
    
    // Add admin badge if applicable
    if (user.role === 'admin' || user.role === 'super_admin') {
      const badgeContainer = document.getElementById('user-badge-container');
      if (badgeContainer) {
        badgeContainer.innerHTML = `<span style="background:var(--gold);color:#0a0c10;padding:2px 8px;border-radius:4px;font-size:0.65rem;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;">${user.role.replace('_', ' ')}</span>`;
      }
    }
  } catch (e) {
    console.error('Failed to parse user', e);
  }

  // Fetch Dashboard Data
  fetchContainerData('/api/client/purchases', 'purchases-container', renderPurchases);
  fetchContainerData('/api/client/profile', null, renderProfile);
  fetchContainerData('/api/client/courses', 'courses-container', renderCourses);
  fetchContainerData('/api/client/subscriptions', 'subscriptions-container', renderSubscriptions);

  // Handle URL hash navigation (e.g., /portal.html#library, /portal.html#courses)
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const link = document.querySelector('[onclick*="' + hash + '"]');
    if (link) link.click();
  }

  // Append auth token to secure download links (using event delegation for dynamic links)
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="/downloads/"]');
    if (link) {
      e.preventDefault();
      const href = link.getAttribute('href');
      const sep = href.includes('?') ? '&' : '?';
      window.location.href = href + sep + 'auth=' + encodeURIComponent(token);
    }
  });
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
    const phoneEl = document.getElementById('profile-phone');
    
    if (nameEl) nameEl.textContent = `${data.client.first_name} ${data.client.last_name}`;
    if (emailEl) emailEl.textContent = data.client.email;
    if (companyEl) companyEl.textContent = data.client.company || 'N/A';
    if (phoneEl) phoneEl.textContent = data.client.phone || 'N/A';

    // Populate Edit Form
    const editFirstName = document.getElementById('edit-first-name');
    const editLastName = document.getElementById('edit-last-name');
    const editCompany = document.getElementById('edit-company');
    const editPhone = document.getElementById('edit-phone');

    if (editFirstName) editFirstName.value = data.client.first_name || '';
    if (editLastName) editLastName.value = data.client.last_name || '';
    if (editCompany) editCompany.value = data.client.company || '';
    if (editPhone) editPhone.value = data.client.phone || '';
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

function renderSubscriptions(data, containerId) {
  const container = document.getElementById(containerId);
  const subscriptions = data.subscriptions || [];

  if (subscriptions.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">💳</span>
        <p class="empty-text">You have no active subscriptions or retainers.</p>
        <a href="/#plans" class="btn btn-gold">Explore Retainer Plans</a>
      </div>`;
    return;
  }

  container.innerHTML = subscriptions.map(s => {
    const statusColor = s.status === 'active' ? 'var(--success-text, #5ad19b)' : 'var(--text-muted)';
    return `
    <div class="product-card anim">
      <span class="product-tag">🔁 Subscription · ${escapeHTML(s.plan_name || 'Service')}</span>
      <div class="product-name">${escapeHTML(s.plan_name || 'Ongoing Retainer')}</div>
      <div class="product-date">Started: ${new Date(s.created_at).toLocaleDateString()}</div>
      
      <div class="u-margin-bottom-1-5">
        <div class="u-font-size-0-8 u-text-dim u-margin-bottom-0-5">Status: <span style="color:${statusColor};font-weight:600;text-transform:capitalize;">${escapeHTML(s.status)}</span></div>
        <div class="u-font-size-0-8 u-text-dim">Next Billing: ${s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : 'N/A'}</div>
      </div>
      
      <button class="btn btn-outline w-full" onclick="alert('To modify your subscription, please contact your account manager directly.')">Manage Plan</button>
    </div>`;
  }).join('');
}

function toggleProfileEdit(show) {
  const displayMode = document.getElementById('profile-display-mode');
  const editForm = document.getElementById('profile-edit-form');
  const msg = document.getElementById('profile-edit-msg');

  if (show) {
    displayMode.style.display = 'none';
    editForm.classList.remove('u-display-none-important');
    editForm.style.display = 'block';
    if (msg) msg.textContent = '';
  } else {
    editForm.style.display = 'none';
    editForm.classList.add('u-display-none-important');
    displayMode.style.display = 'block';
  }
}

async function handleProfileUpdate(e) {
  e.preventDefault();
  const token = localStorage.getItem('nlc_client_token');
  const msg = document.getElementById('profile-edit-msg');
  const btn = document.getElementById('profile-save-btn');
  
  const payload = {
    firstName: document.getElementById('edit-first-name').value.trim(),
    lastName: document.getElementById('edit-last-name').value.trim(),
    company: document.getElementById('edit-company').value.trim(),
    phone: document.getElementById('edit-phone').value.trim()
  };

  btn.disabled = true;
  btn.textContent = 'Saving...';
  msg.textContent = '';

  try {
    const response = await fetch('/api/client/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      msg.innerHTML = '<span style="color:var(--success-text, #5ad19b);">Profile updated successfully!</span>';
      
      // Update local storage user name
      const userObj = localStorage.getItem('nlc_client_user');
      if (userObj) {
        const user = JSON.parse(userObj);
        user.firstName = payload.firstName;
        user.lastName = payload.lastName;
        localStorage.setItem('nlc_client_user', JSON.stringify(user));
        const greeting = document.getElementById('user-greeting');
        if (greeting) greeting.textContent = `Welcome, ${user.firstName}`;
      }

      // Re-fetch profile to update display
      fetchContainerData('/api/client/profile', null, renderProfile);
      
      setTimeout(() => {
        toggleProfileEdit(false);
      }, 1500);
    } else {
      const data = await response.json();
      msg.innerHTML = `<span style="color:var(--error-text, #ff6b6b);">${data.error || 'Update failed'}</span>`;
    }
  } catch (err) {
    console.error('Profile update error:', err);
    msg.innerHTML = '<span style="color:var(--error-text, #ff6b6b);">Connection error. Try again.</span>';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Changes';
  }
}
