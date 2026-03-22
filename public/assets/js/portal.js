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

  container.innerHTML = purchases.map(p => `
    <div class="product-card">
      <div class="product-title">${escapeHTML(p.product_name)}</div>
      <div class="product-meta">Purchased: ${new Date(p.purchased_at).toLocaleDateString()}</div>
      ${p.access_link 
        ? `<a href="${escapeHTML(p.access_link)}" target="_blank" class="btn btn-dark w-full" style="text-align:center;">Access Content</a>` 
        : `<p style="color: #f59e0b; font-size: 0.875rem;">Processing Access...</p>`
      }
    </div>
  `).join('');
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
