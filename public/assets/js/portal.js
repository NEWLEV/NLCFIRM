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
    document.getElementById('user-greeting').textContent = `Welcome, ${user.firstName || 'Client'}`;
  } catch (e) {
    console.error('Failed to parse user', e);
  }

  // Fetch Dashboard Data
  fetchContainerData('/api/client/purchases', 'purchases-container', renderPurchases);
  fetchContainerData('/api/client/profile', null, renderProfile);
  fetchContainerData('/api/client/courses', 'courses-container', renderCourses);

  // Handle URL hash navigation (e.g., /portal.html#courses)
  if (window.location.hash === '#courses') {
    const link = document.querySelector('[onclick*="courses"]');
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
      document.getElementById(containerId).innerHTML = '<p style="color:red;">Error loading data.</p>';
    }
  }
}

function renderPurchases(data, containerId) {
  const container = document.getElementById(containerId);
  const purchases = data.purchases || [];

  if (purchases.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: #fff; border-radius: 8px; border: 1px dashed #cbd5e1;">
        <p style="color: var(--color-slate); margin-bottom: 1rem;">You don't have any tools or content yet.</p>
        <a href="/index.html#instant-tools" class="btn btn-gold">Browse Instant Tools</a>
      </div>
    `;
    return;
  }

  container.innerHTML = '<div class="card-grid">' + purchases.map(p => {
    const type = p.product_id && (p.product_id.includes('bha') || p.product_id.includes('frs')) ? 'assessment'
      : p.product_id && p.product_id.includes('cert') ? 'course' : 'download';
    const typeLabel = { assessment:'🧭 Assessment Tool', course:'🎓 Course Access', download:'📥 Download Ready' }[type] || '📦 Product';
    const typeColor = { assessment:'#1d4ed8', course:'#065f46', download:'#7c3aed' }[type] || '#333';
    return `
    <div class="product-card">
      <div style="font-size:0.7rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${typeColor};margin-bottom:0.5rem;">${typeLabel}</div>
      <div class="product-title">${escapeHTML(p.product_name)}</div>
      <div class="product-meta">Purchased: ${new Date(p.purchased_at).toLocaleDateString()}</div>
      ${p.access_link 
        ? `<a href="${escapeHTML(p.access_link)}" class="btn btn-dark w-full" style="text-align:center;display:block;">Access Now →</a>` 
        : `<p style="color: #f59e0b; font-size: 0.875rem;">Processing Access...</p>`
      }
    </div>`;
  }).join('') + '</div>';
}

function renderProfile(data) {
  if (data.client) {
    document.getElementById('profile-name').textContent = `${data.client.first_name} ${data.client.last_name}`;
    document.getElementById('profile-email').textContent = data.client.email;
    document.getElementById('profile-company').textContent = data.client.company || 'N/A';
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
      <div style="text-align:center;padding:3rem;background:#fff;border-radius:8px;border:1px dashed #cbd5e1;">
        <p style="color:var(--color-slate);margin-bottom:1rem;">You haven't enrolled in any courses yet.</p>
        <a href="/#services" class="btn btn-gold">Browse Certification Programs</a>
      </div>`;
    return;
  }

  container.innerHTML = '<div class="card-grid">' + courses.map(c => {
    const progress = c.progress || {};
    const allModules = ['m1','m2','m3','m4','m5','m6'];
    const completedCount = allModules.filter(m => progress[m] && progress[m].completed).length;
    const pct = Math.round((completedCount / allModules.length) * 100);
    const isComplete = completedCount === allModules.length;
    const pctColor = pct >= 100 ? '#22c55e' : pct > 0 ? '#b8860b' : '#cbd5e1';
    return `
    <div class="product-card" style="border-top:3px solid ${pctColor};">
      <div style="font-size:0.7rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#065f46;margin-bottom:0.5rem;">🎓 Certification Course</div>
      <div class="product-title">${escapeHTML(c.name)}</div>
      <div class="product-meta">Enrolled: ${new Date(c.enrolled_at).toLocaleDateString()}</div>
      <div style="margin-bottom:1rem;">
        <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--color-slate);margin-bottom:0.3rem;">
          <span>${completedCount} of 6 modules complete</span>
          <span style="font-weight:700;color:${pctColor}">${pct}%</span>
        </div>
        <div style="height:6px;background:#f1f5f9;border-radius:3px;">
          <div style="height:6px;width:${pct}%;background:${pctColor};border-radius:3px;transition:width 0.5s;"></div>
        </div>
      </div>
      ${isComplete 
        ? `<a href="/courses/healthcare-compliance-certification.html" class="btn btn-gold w-full" style="text-align:center;display:block;">🏆 View Certificate</a>`
        : `<a href="/courses/healthcare-compliance-certification.html" class="btn btn-dark w-full" style="text-align:center;display:block;">${pct > 0 ? 'Continue Course →' : 'Start Course →'}</a>`
      }
    </div>`;
  }).join('') + '</div>';
}
