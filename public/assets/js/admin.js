/* ═══════════════════════════════════════════════════════
   NLCFirm.com — admin.js
   Admin Dashboard Logic — Full CMS (CSP Compliant & Refactored)
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── AUTH CHECK ─────────────────────────────────────
  const token = sessionStorage.getItem('nlc_token');
  const user = JSON.parse(sessionStorage.getItem('nlc_user') || '{}');

  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  // ─── STATE ──────────────────────────────────────────
  var currentTab = 'dashboard';
  var searchDebounceTimer = null;

  // ─── INITIALIZATION ─────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    setupUserDisplay();
    setupEventListeners();
    loadDashboard(); // Initial load
  });

  function setupUserDisplay() {
    var emailEl = document.getElementById('admin-email');
    if (emailEl) emailEl.textContent = user.displayName || user.email || 'Admin';

    var roleEl = document.getElementById('admin-role-badge');
    if (roleEl) {
      roleEl.textContent = user.role === 'super_admin' ? 'Super Admin' : 'Admin';
      roleEl.classList.add(user.role);
    }

    if (user.role === 'super_admin') {
      document.querySelectorAll('#nav-users, #nav-audit').forEach(el => el.classList.remove('u-hidden'));
    }

    // Prefill profile
    var profileName = document.getElementById('profile-name');
    var profileEmail = document.getElementById('profile-email');
    var profileRole = document.getElementById('profile-role');
    if (profileName) profileName.value = user.displayName || '';
    if (profileEmail) profileEmail.value = user.email || '';
    if (profileRole) profileRole.value = user.role === 'super_admin' ? 'Super Admin' : 'Admin';
  }

  function setupEventListeners() {
    // Sidebar Navigation
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.addEventListener('click', function () {
        switchTab(this.dataset.tab);
      });
    });

    // Logout
    var logoutBtn = document.querySelector('button[onclick="logout()"], .admin-header-right .btn-outline');
    if (logoutBtn) {
      logoutBtn.removeAttribute('onclick');
      logoutBtn.addEventListener('click', logout);
    }

    // Search & Filters
    var searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', debounceSearch);
    }
    var statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', loadSubmissions);
    }
    var serviceCatFilter = document.getElementById('service-category-filter');
    if (serviceCatFilter) {
      serviceCatFilter.addEventListener('change', loadServices);
    }

    // Modal & Drawer Close
    document.querySelectorAll('.modal-close, .admin-modal-overlay, .detail-drawer-overlay').forEach(el => {
      el.addEventListener('click', function (e) {
        if (e.target === this || this.classList.contains('modal-close')) {
          closeAdminModal();
          closeDetailDrawer();
        }
      });
    });

    // Form Submissions (Event Delegation)
    document.addEventListener('submit', function (e) {
      var id = e.target.id;
      if (id === 'service-form') { e.preventDefault(); /* handled in modal setup */ }
      if (id === 'site-settings-form') { e.preventDefault(); saveSiteSettings(e); }
      // Profile & Password forms are in My Account tab
      if (e.target.closest('#tab-settings')) {
        // These are static forms, can bind directly
      }
    });

    // Profile & Password forms
    var profileForm = document.querySelector('#tab-settings form:first-of-type');
    if (profileForm) profileForm.addEventListener('submit', updateProfile);

    var passwordForm = document.querySelector('#tab-settings form:last-of-type');
    if (passwordForm) passwordForm.addEventListener('submit', changePassword);

    // Global Click Delegation for Dynamic Buttons
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;

      // Tab Buttons (Refresh / Add)
      if (btn.textContent.includes('Refresh')) {
        if (currentTab === 'submissions') loadSubmissions();
        if (currentTab === 'exit-leads') loadExitLeads();
      }
      if (btn.textContent.includes('Export CSV')) {
        if (currentTab === 'submissions') exportCSV();
        if (currentTab === 'exit-leads') exportLeadsCSV();
      }
      if (btn.textContent.includes('+ Add Service')) openServiceModal();
      if (btn.textContent.includes('+ Add Testimonial')) openTestimonialModal();
      if (btn.textContent.includes('+ Add FAQ')) openFAQModal();
      if (btn.textContent.includes('+ Add User')) openUserModal();
      if (btn.textContent === 'Grant Access' && !btn.dataset.id) openGrantAccessModal();

      // Row Actions (Clients table handled via delegation if needed, or re-setup in loadClients)
    });
  }

  // ─── API HELPER ─────────────────────────────────────
  function api(url, options) {
    return fetch(url, Object.assign({
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
    }, options || {})).then(function (res) {
      if (res.status === 401 || res.status === 403) {
        sessionStorage.clear();
        window.location.href = '/login.html';
        throw new Error('Session expired');
      }
      return res;
    });
  }

  // ─── TOAST ──────────────────────────────────────────
  function showToast(message, type) {
    var existing = document.querySelector('.admin-toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.className = 'admin-toast ' + (type || 'success');
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add('show'); });
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { toast.remove(); }, 300);
    }, 3000);
  }

  // ─── TABS ──────────────────────────────────────────
  function switchTab(tabName) {
    currentTab = tabName;
    document.querySelectorAll('.sidebar-link').forEach(function (t) {
      t.classList.toggle('active', t.dataset.tab === tabName);
    });
    document.querySelectorAll('.tab-content').forEach(function (c) {
      c.classList.toggle('active', c.id === 'tab-' + tabName || (c.id === tabName && !c.id.startsWith('tab-')));
      // Handle special case where some IDs are just names
      if (c.id === tabName) c.style.display = 'block';
      else if (c.id === 'tab-' + tabName) c.style.display = '';
      else if (c.classList.contains('active')) c.style.display = '';
      else c.style.display = 'none';
    });

    // Fix for mixed section/div tabs
    document.querySelectorAll('.tab-content').forEach(el => {
      if (el.id === 'tab-' + tabName || el.id === tabName) {
        el.style.display = 'block';
        el.classList.add('active');
      } else {
        el.style.display = 'none';
        el.classList.remove('active');
      }
    });

    try {
      if (typeof tabLoaders[tabName] === 'function') {
        tabLoaders[tabName]();
      }
    } catch (err) {
      console.error('Error loading tab ' + tabName + ':', err);
    }
  }

  const tabLoaders = {
    'dashboard': loadDashboard,
    'submissions': loadSubmissions,
    'exit-leads': loadExitLeads,
    'services': loadServices,
    'testimonials': loadTestimonials,
    'faq': loadFAQ,
    'site-settings': loadSiteSettings,
    'chat-logs': loadChatSessions,
    'clients': loadClients,
    'users': loadUsers,
    'audit-log': loadAuditLog,
    'settings': function() { /* Profile tab loaded via setupEventListeners */ }
  };

  // ═══════════════════════════════════════════════════════
  //  DASHBOARD
  // ═══════════════════════════════════════════════════════

  function loadDashboard() {
    api('/api/dashboard')
      .then(r => r.ok ? r.json() : r.json().then(e => { throw e; }))
      .then(function (data) {
        setText('stat-total', data.totalSubmissions);
        setText('stat-30d', data.last30Days);
        setText('stat-leads', data.totalExitLeads);
        setText('stat-chats', data.totalChatSessions);

        var breakdown = document.getElementById('status-breakdown');
        if (breakdown) {
          breakdown.innerHTML = (data.byStatus || []).map(function (s) {
            return '<div class="status-row"><span class="status-row-label">' + escapeHtml(s.status) +
                   '</span><span class="status-row-value">' + s.count + '</span></div>';
          }).join('') || '<div class="status-row"><span class="status-row-label">No data yet</span></div>';
        }

        var activityFeed = document.getElementById('recent-activity');
        if (activityFeed && data.recentActivity) {
          activityFeed.innerHTML = data.recentActivity.slice(0, 10).map(function (a) {
            return '<div class="activity-item"><span class="activity-action">' +
                   escapeHtml(a.user_email || 'system') + ' — ' + escapeHtml(a.action) +
                   '</span><span class="activity-time">' + formatDate(a.created_at) + '</span></div>';
          }).join('') || '<div class="activity-item">No activity yet</div>';
        }

        var recentBody = document.getElementById('recent-submissions-body');
        if (recentBody && data.recent) {
          recentBody.innerHTML = data.recent.map(function (s) {
            return '<tr>' +
              '<td>' + escapeHtml(s.first_name) + ' ' + escapeHtml(s.last_name) + '</td>' +
              '<td class="email-cell">' + escapeHtml(s.email) + '</td>' +
              '<td>' + escapeHtml(s.service_type || '—') + '</td>' +
              '<td><span class="status-badge status-' + s.status + '">' + s.status + '</span></td>' +
              '<td>' + formatDate(s.created_at) + '</td></tr>';
          }).join('');
        }
      }).catch(function (e) { console.error('Dashboard error:', e); });
  }

  // ═══════════════════════════════════════════════════════
  //  SUBMISSIONS
  // ═══════════════════════════════════════════════════════

  function loadSubmissions() {
    var search = document.getElementById('search-input').value.trim();
    var status = document.getElementById('status-filter').value;
    var params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status !== 'all') params.set('status', status);
    params.set('limit', '100');

    api('/api/submissions?' + params.toString()).then(r => r.json()).then(function (data) {
      var tbody = document.getElementById('submissions-body');
      var emptyEl = document.getElementById('submissions-empty');
      var tableEl = document.getElementById('submissions-table-container');

      if (!data.submissions || data.submissions.length === 0) {
        if(emptyEl) emptyEl.hidden = false;
        if(tableEl) tableEl.hidden = true;
        return;
      }

      if(emptyEl) emptyEl.hidden = true;
      if(tableEl) tableEl.hidden = false;
      tbody.innerHTML = data.submissions.map(function (s) {
        return '<tr class="clickable-row" data-id="' + s.id + '">' +
          '<td>' + s.id + '</td>' +
          '<td>' + escapeHtml(s.first_name) + ' ' + escapeHtml(s.last_name) + '</td>' +
          '<td class="email-cell">' + escapeHtml(s.email) + '</td>' +
          '<td>' + escapeHtml(s.organization || '—') + '</td>' +
          '<td>' + escapeHtml(s.service_type || '—') + '</td>' +
          '<td><span class="status-badge status-' + s.status + '">' + s.status + '</span></td>' +
          '<td>' + formatDate(s.created_at) + '</td>' +
          '<td>' +
            '<select class="status-select" data-id="' + s.id + '">' +
              statusOption('new', s.status) +
              statusOption('contacted', s.status) +
              statusOption('qualified', s.status) +
              statusOption('closed-won', s.status) +
              statusOption('closed-lost', s.status) +
            '</select>' +
          '</td></tr>';
      }).join('');

      // Bind events to new rows
      tbody.querySelectorAll('.clickable-row td:not(:last-child)').forEach(td => {
        td.addEventListener('click', function() {
          viewSubmission(this.parentElement.dataset.id);
        });
      });
      tbody.querySelectorAll('.status-select').forEach(sel => {
        sel.addEventListener('change', function() {
          updateStatus(this.dataset.id, this.value);
        });
      });
    }).catch(function (e) { console.error('Load error:', e); });
  }

  function viewSubmission(id) {
    api('/api/submissions/' + id).then(r => r.json()).then(function (data) {
      var s = data.submission;
      var body = document.getElementById('detail-drawer-body');
      body.innerHTML =
        detailField('Name', escapeHtml(s.first_name) + ' ' + escapeHtml(s.last_name)) +
        detailField('Email', '<a href="mailto:' + escapeHtml(s.email) + '">' + escapeHtml(s.email) + '</a>') +
        detailField('Organization', escapeHtml(s.organization || '—')) +
        detailField('Org Size', escapeHtml(s.org_size || '—')) +
        detailField('Industry', escapeHtml(s.industry || '—')) +
        detailField('Service', escapeHtml(s.service_type || '—')) +
        detailField('Contact Method', escapeHtml(s.contact_method || 'Email')) +
        detailField('Message', escapeHtml(s.message || '—')) +
        detailField('Status', '<span class="status-badge status-' + s.status + '">' + s.status + '</span>') +
        detailField('Submitted', formatDateTime(s.created_at)) +
        '<div class="form-field" style="margin-top:1.5rem"><label for="detail-notes">Admin Notes</label>' +
        '<textarea id="detail-notes" rows="3" placeholder="Add internal notes...">' + escapeHtml(s.admin_notes || '') + '</textarea></div>' +
        '<div class="drawer-actions">' +
          '<button class="btn btn-gold btn-save-notes" data-id="' + s.id + '">Save Notes</button>' +
          '<button class="btn btn-danger btn-sm btn-delete-sub" data-id="' + s.id + '" style="margin-left:0.5rem">Delete</button>' +
        '</div>';
      
      body.querySelector('.btn-save-notes').addEventListener('click', function() { saveSubmissionNotes(this.dataset.id); });
      body.querySelector('.btn-delete-sub').addEventListener('click', function() { deleteSubmission(this.dataset.id); });

      document.getElementById('detail-drawer').classList.add('open');
    });
  }

  function updateStatus(id, status) {
    api('/api/submissions/' + id, {
      method: 'PATCH',
      body: JSON.stringify({ status: status }),
    }).then(function (res) {
      if (res.ok) { showToast('Status updated'); loadSubmissions(); loadDashboard(); }
    }).catch(function (e) { console.error('Update error:', e); });
  }

  function saveSubmissionNotes(id) {
    var notes = document.getElementById('detail-notes').value;
    api('/api/submissions/' + id, {
      method: 'PATCH',
      body: JSON.stringify({ admin_notes: notes }),
    }).then(function (res) {
      if (res.ok) showToast('Notes saved');
    });
  }

  function deleteSubmission(id) {
    if (!confirm('Delete this submission? This cannot be undone.')) return;
    api('/api/submissions/' + id, { method: 'DELETE' }).then(function (res) {
      if (res.ok) { showToast('Submission deleted'); closeDetailDrawer(); loadSubmissions(); loadDashboard(); }
    });
  }

  // ─── EXIT LEADS ────────────────────────────────────
  function loadExitLeads() {
    api('/api/exit-leads').then(r => r.json()).then(function (data) {
      var tbody = document.getElementById('leads-body');
      var emptyEl = document.getElementById('leads-empty');
      var tableEl = document.getElementById('leads-table-container');

      if (!data.leads || data.leads.length === 0) {
        if(emptyEl) emptyEl.hidden = false;
        if(tableEl) tableEl.hidden = true;
        return;
      }

      if(emptyEl) emptyEl.hidden = true;
      if(tableEl) tableEl.hidden = false;
      tbody.innerHTML = data.leads.map(function (l) {
        return '<tr><td>' + l.id + '</td><td class="email-cell">' + escapeHtml(l.email) +
               '</td><td>' + formatDate(l.created_at) +
               '</td><td><button class="btn btn-danger btn-xs btn-delete-lead" data-id="' + l.id + '">✕</button></td></tr>';
      }).join('');

      tbody.querySelectorAll('.btn-delete-lead').forEach(btn => {
        btn.addEventListener('click', function() { deleteLead(this.dataset.id); });
      });
    }).catch(function (e) { console.error('Load leads error:', e); });
  }

  function deleteLead(id) {
    if (!confirm('Delete this lead?')) return;
    api('/api/exit-leads/' + id, { method: 'DELETE' }).then(function (res) {
      if (res.ok) { showToast('Lead deleted'); loadExitLeads(); }
    });
  }

  // ─── SERVICES ──────────────────────────────────────
  function loadServices() {
    var category = document.getElementById('service-category-filter').value;
    var params = category ? '?category=' + encodeURIComponent(category) : '';
    api('/api/services' + params).then(r => r.json()).then(function (data) {
      var container = document.getElementById('services-list-container');
      if (!data.services || data.services.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🏷️</div><div class="empty-state-text">No services yet. Click "+ Add Service" to create one.</div></div>';
        return;
      }
      container.innerHTML = data.services.map(function (s) {
        var tags = [];
        try { tags = JSON.parse(s.tags || '[]'); } catch (e) {}
        return '<div class="cms-card' + (s.is_visible ? '' : ' cms-card-hidden') + '">' +
          '<div class="cms-card-header">' +
            '<div><div class="cms-card-title">' + escapeHtml(s.name) + '</div>' +
            '<div class="cms-card-subtitle"><span class="cms-category-label">' + escapeHtml(s.category) + '</span></div></div>' +
            '<div style="display:flex;align-items:center;gap:0.5rem">' +
              '<span style="font-size:0.7rem;color:var(--text-muted)">' + (s.is_visible ? 'Visible' : 'Hidden') + '</span>' +
              '<label class="toggle-switch"><input type="checkbox" class="service-toggle" data-id="' + s.id + '"' + (s.is_visible ? ' checked' : '') +
              '><span class="toggle-switch-slider"></span></label>' +
            '</div>' +
          '</div>' +
          '<div class="cms-card-body">' + escapeHtml(s.description) + '</div>' +
          '<div class="cms-card-footer">' +
            '<span style="font-weight:600;color:var(--gold)">' + escapeHtml(s.price) + '</span>' +
            '<span class="cms-card-meta">' + escapeHtml(s.price_unit) + '</span>' +
            (tags.length ? tags.map(function (t) { return '<span class="cms-category-label">' + escapeHtml(t) + '</span>'; }).join('') : '') +
            '<div class="cms-card-actions">' +
              '<button class="btn btn-outline btn-xs btn-edit-service" data-id="' + s.id + '">Edit</button>' +
              '<button class="btn btn-danger btn-xs btn-delete-service" data-id="' + s.id + '">Delete</button>' +
            '</div>' +
          '</div></div>';
      }).join('');

      container.querySelectorAll('.service-toggle').forEach(chk => {
        chk.addEventListener('change', function() { toggleServiceVisibility(this.dataset.id, this.checked); });
      });
      container.querySelectorAll('.btn-edit-service').forEach(btn => {
        btn.addEventListener('click', function() { editService(Number(this.dataset.id)); });
      });
      container.querySelectorAll('.btn-delete-service').forEach(btn => {
        btn.addEventListener('click', function() { deleteService(this.dataset.id); });
      });
    });
  }

  function toggleServiceVisibility(id, visible) {
    api('/api/services/' + id, {
      method: 'PATCH',
      body: JSON.stringify({ is_visible: visible ? 1 : 0 }),
    }).then(function (res) {
      if (res.ok) showToast(visible ? 'Service visible' : 'Service hidden');
    });
  }

  function openServiceModal(prefill) {
    var d = prefill || {};
    setText('admin-modal-title', d.id ? 'Edit Service' : 'Add Service');
    var body = document.getElementById('admin-modal-body');
    body.innerHTML =
      '<form id="service-form">' +
      formField('srv-category', 'Category', 'select', d.category || '', [
        'Healthcare-Specific Consulting', 'Compliance & Risk Management', 'Operations & Process',
        'Technology & AI', 'HR & Workforce', 'Marketing & Growth'
      ]) +
      formField('srv-name', 'Service Name', 'text', d.name || '') +
      formField('srv-desc', 'Description', 'textarea', d.description || '') +
      formField('srv-price', 'Price (e.g. $1,200)', 'text', d.price || '') +
      formField('srv-unit', 'Price Unit', 'select', d.price_unit || 'one-time', [
        'one-time', '/ month', '/ quarter', 'per provider', 'per cycle', 'per site', 'project', 'package', '+ % of savings'
      ]) +
      formField('srv-order', 'Sort Order', 'number', d.sort_order || 0) +
      '<div class="form-field"><label>Service Icon / Image</label>' +
      '<div style="display:flex;gap:0.5rem">' +
      '<input type="text" id="srv-icon-url" value="' + escapeHtml(d.icon_url || '') + '" placeholder="URL or upload →" style="flex:1">' +
      '<input type="file" id="srv-icon-file" style="display:none">' +
      '<button type="button" class="btn btn-outline btn-sm btn-upload">Upload</button>' +
      '</div></div>' +
      '<button type="submit" class="btn btn-gold full-width">' + (d.id ? 'Update Service' : 'Create Service') + '</button></form>';
    
    body.querySelector('#service-form').addEventListener('submit', function(e) {
      e.preventDefault();
      saveService(d.id);
    });
    body.querySelector('.btn-upload').addEventListener('click', function() {
      document.getElementById('srv-icon-file').click();
    });
    body.querySelector('#srv-icon-file').addEventListener('change', function() {
      handleFileUpload('srv-icon-file', 'srv-icon-url');
    });

    document.getElementById('admin-modal').classList.add('open');
  }

  function saveService(id) {
    var payload = {
      category: document.getElementById('srv-category').value,
      name: document.getElementById('srv-name').value,
      description: document.getElementById('srv-desc').value,
      price: document.getElementById('srv-price').value,
      price_unit: document.getElementById('srv-unit').value,
      sort_order: Number(document.getElementById('srv-order').value) || 0,
      icon_url: document.getElementById('srv-icon-url').value,
    };
    var method = id ? 'PATCH' : 'POST';
    var url = id ? '/api/services/' + id : '/api/services';
    api(url, { method: method, body: JSON.stringify(payload) }).then(function (res) {
      if (res.ok) { showToast(id ? 'Service updated' : 'Service created'); closeAdminModal(); loadServices(); }
      else res.json().then(function (d) { alert(d.error || d.errors?.[0]?.msg || 'Error'); });
    });
  }

  function editService(id) {
    api('/api/services').then(r => r.json()).then(function (data) {
      var s = data.services.find(function (x) { return x.id === id; });
      if (s) openServiceModal(s);
    });
  }

  function deleteService(id) {
    if (!confirm('Delete this service?')) return;
    api('/api/services/' + id, { method: 'DELETE' }).then(function (res) {
      if (res.ok) { showToast('Service deleted'); loadServices(); }
    });
  }

  // ─── TESTIMONIALS ──────────────────────────────────
  function loadTestimonials() {
    api('/api/testimonials').then(r => r.json()).then(function (data) {
      var container = document.getElementById('testimonials-list-container');
      if (!data.testimonials || data.testimonials.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⭐</div><div class="empty-state-text">No testimonials yet.</div></div>';
        return;
      }
      container.innerHTML = data.testimonials.map(function (t) {
        return '<div class="cms-card' + (t.is_visible ? '' : ' cms-card-hidden') + '">' +
          '<div class="cms-card-header">' +
            '<div class="cms-card-title">"' + escapeHtml(t.quote.substring(0, 80)) + '..."</div>' +
            '<div style="display:flex;align-items:center;gap:0.5rem">' +
              '<label class="toggle-switch"><input type="checkbox" class="toggle-test" data-id="' + t.id + '"' + (t.is_visible ? ' checked' : '') +
              '><span class="toggle-switch-slider"></span></label>' +
            '</div>' +
          '</div>' +
          '<div class="cms-card-body">' + escapeHtml(t.quote) + '</div>' +
          '<div class="cms-card-footer">' +
            '<span style="color:var(--gold)">★'.repeat(t.rating) + '</span>' +
            '<span class="cms-card-meta">' + escapeHtml(t.author_name) + ' · ' + escapeHtml(t.author_role) + '</span>' +
            '<div class="cms-card-actions">' +
              '<button class="btn btn-outline btn-xs btn-edit-test" data-id="' + t.id + '">Edit</button>' +
              '<button class="btn btn-danger btn-xs btn-delete-test" data-id="' + t.id + '">Delete</button>' +
            '</div>' +
          '</div></div>';
      }).join('');

      container.querySelectorAll('.toggle-test').forEach(chk => {
        chk.addEventListener('change', function() { toggleTestimonialVis(this.dataset.id, this.checked); });
      });
      container.querySelectorAll('.btn-edit-test').forEach(btn => {
        btn.addEventListener('click', function() { editTestimonial(Number(this.dataset.id)); });
      });
      container.querySelectorAll('.btn-delete-test').forEach(btn => {
        btn.addEventListener('click', function() { deleteTestimonial(this.dataset.id); });
      });
    });
  }

  function toggleTestimonialVis(id, visible) {
    api('/api/testimonials/' + id, { method: 'PATCH', body: JSON.stringify({ is_visible: visible ? 1 : 0 }) })
      .then(function (res) { if (res.ok) showToast(visible ? 'Testimonial visible' : 'Testimonial hidden'); });
  }

  function openTestimonialModal(prefill) {
    var d = prefill || {};
    setText('admin-modal-title', d.id ? 'Edit Testimonial' : 'Add Testimonial');
    var body = document.getElementById('admin-modal-body');
    body.innerHTML =
      '<form id="testimonial-form">' +
      formField('tm-quote', 'Quote', 'textarea', d.quote || '') +
      formField('tm-name', 'Author Name', 'text', d.author_name || '') +
      formField('tm-role', 'Author Role/Company', 'text', d.author_role || '') +
      formField('tm-initials', 'Initials (auto if empty)', 'text', d.author_initials || '') +
      formField('tm-rating', 'Rating (1-5)', 'number', d.rating || 5) +
      formField('tm-order', 'Sort Order', 'number', d.sort_order || 0) +
      '<button type="submit" class="btn btn-gold full-width">' + (d.id ? 'Update' : 'Create') + '</button></form>';
    
    body.querySelector('#testimonial-form').addEventListener('submit', function(e) {
      e.preventDefault();
      saveTestimonial(d.id);
    });
    document.getElementById('admin-modal').classList.add('open');
  }

  function saveTestimonial(id) {
    var payload = {
      quote: document.getElementById('tm-quote').value,
      author_name: document.getElementById('tm-name').value,
      author_role: document.getElementById('tm-role').value,
      author_initials: document.getElementById('tm-initials').value,
      rating: Number(document.getElementById('tm-rating').value) || 5,
      sort_order: Number(document.getElementById('tm-order').value) || 0,
    };
    api(id ? '/api/testimonials/' + id : '/api/testimonials', {
      method: id ? 'PATCH' : 'POST',
      body: JSON.stringify(payload),
    }).then(function (res) {
      if (res.ok) { showToast(id ? 'Testimonial updated' : 'Testimonial created'); closeAdminModal(); loadTestimonials(); }
      else res.json().then(function (d) { alert(d.error || d.errors?.[0]?.msg || 'Error'); });
    });
  }

  function editTestimonial(id) {
    api('/api/testimonials').then(r => r.json()).then(function (data) {
      var t = data.testimonials.find(function (x) { return x.id === id; });
      if (t) openTestimonialModal(t);
    });
  }

  function deleteTestimonial(id) {
    if (!confirm('Delete this testimonial?')) return;
    api('/api/testimonials/' + id, { method: 'DELETE' }).then(function (res) {
      if (res.ok) { showToast('Testimonial deleted'); loadTestimonials(); }
    });
  }

  // ─── FAQ ───────────────────────────────────────────
  function loadFAQ() {
    api('/api/faq').then(r => r.json()).then(function (data) {
      var container = document.getElementById('faq-list-container');
      if (!data.faq || data.faq.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">❓</div><div class="empty-state-text">No FAQ items yet.</div></div>';
        return;
      }
      container.innerHTML = data.faq.map(function (f) {
        return '<div class="cms-card' + (f.is_visible ? '' : ' cms-card-hidden') + '">' +
          '<div class="cms-card-header">' +
            '<div class="cms-card-title">' + escapeHtml(f.question) + '</div>' +
            '<label class="toggle-switch"><input type="checkbox" class="toggle-faq" data-id="' + f.id + '"' + (f.is_visible ? ' checked' : '') +
            '><span class="toggle-switch-slider"></span></label>' +
          '</div>' +
          '<div class="cms-card-body">' + escapeHtml(f.answer) + '</div>' +
          '<div class="cms-card-footer">' +
            '<span class="cms-card-meta">Order: ' + f.sort_order + '</span>' +
            '<div class="cms-card-actions">' +
              '<button class="btn btn-outline btn-xs btn-edit-faq" data-id="' + f.id + '">Edit</button>' +
              '<button class="btn btn-danger btn-xs btn-delete-faq" data-id="' + f.id + '">Delete</button>' +
            '</div>' +
          '</div></div>';
      }).join('');

      container.querySelectorAll('.toggle-faq').forEach(chk => {
        chk.addEventListener('change', function() { toggleFAQVis(this.dataset.id, this.checked); });
      });
      container.querySelectorAll('.btn-edit-faq').forEach(btn => {
        btn.addEventListener('click', function() { editFAQ(Number(this.dataset.id)); });
      });
      container.querySelectorAll('.btn-delete-faq').forEach(btn => {
        btn.addEventListener('click', function() { deleteFAQ(this.dataset.id); });
      });
    });
  }

  function toggleFAQVis(id, visible) {
    api('/api/faq/' + id, { method: 'PATCH', body: JSON.stringify({ is_visible: visible ? 1 : 0 }) })
      .then(function (res) { if (res.ok) showToast(visible ? 'FAQ visible' : 'FAQ hidden'); });
  }

  function openFAQModal(prefill) {
    var d = prefill || {};
    setText('admin-modal-title', d.id ? 'Edit FAQ' : 'Add FAQ');
    var body = document.getElementById('admin-modal-body');
    body.innerHTML =
      '<form id="faq-form">' +
      formField('faq-q', 'Question', 'text', d.question || '') +
      formField('faq-a', 'Answer', 'textarea', d.answer || '') +
      formField('faq-order', 'Sort Order', 'number', d.sort_order || 0) +
      '<button type="submit" class="btn btn-gold full-width">' + (d.id ? 'Update' : 'Create') + '</button></form>';
    
    body.querySelector('#faq-form').addEventListener('submit', function(e) { e.preventDefault(); saveFAQ(d.id); });
    document.getElementById('admin-modal').classList.add('open');
  }

  function saveFAQ(id) {
    var payload = {
      question: document.getElementById('faq-q').value,
      answer: document.getElementById('faq-a').value,
      sort_order: Number(document.getElementById('faq-order').value) || 0,
    };
    api(id ? '/api/faq/' + id : '/api/faq', {
      method: id ? 'PATCH' : 'POST',
      body: JSON.stringify(payload),
    }).then(function (res) {
      if (res.ok) { showToast(id ? 'FAQ updated' : 'FAQ created'); closeAdminModal(); loadFAQ(); }
      else res.json().then(function (d) { alert(d.error || d.errors?.[0]?.msg || 'Error'); });
    });
  }

  function editFAQ(id) {
    api('/api/faq').then(r => r.json()).then(function (data) {
      var f = data.faq.find(function (x) { return x.id === id; });
      if (f) openFAQModal(f);
    });
  }

  function deleteFAQ(id) {
    if (!confirm('Delete this FAQ?')) return;
    api('/api/faq/' + id, { method: 'DELETE' }).then(function (res) {
      if (res.ok) { showToast('FAQ deleted'); loadFAQ(); }
    });
  }

  // ─── SITE SETTINGS ─────────────────────────────────
  function loadSiteSettings() {
    api('/api/settings').then(r => r.json()).then(function (data) {
      var container = document.getElementById('settings-form-container');
      if (!data.settings || data.settings.length === 0) {
        container.innerHTML = '<div class="empty-state">No site settings configured.</div>';
        return;
      }
      var categories = {};
      data.settings.forEach(function (s) {
        if (!categories[s.category]) categories[s.category] = [];
        categories[s.category].push(s);
      });
      var html = '<form id="site-settings-form">';
      Object.keys(categories).forEach(function (cat) {
        html += '<div class="settings-category"><div class="settings-category-title">' + escapeHtml(cat) + '</div>';
        categories[cat].forEach(function (s) {
          if (s.field_type === 'textarea') {
            html += '<div class="form-field"><label for="setting-' + s.key + '">' + escapeHtml(s.label) + '</label>' +
                    '<textarea id="setting-' + s.key + '" data-key="' + s.key + '">' + escapeHtml(s.value) + '</textarea></div>';
          } else {
            html += '<div class="form-field"><label for="setting-' + s.key + '">' + escapeHtml(s.label) + '</label>' +
                    '<input type="text" id="setting-' + s.key + '" data-key="' + s.key + '" value="' + escapeHtml(s.value) + '"></div>';
          }
        });
        html += '</div>';
      });
      html += '<button type="submit" class="btn btn-gold">Save All Settings</button></form>';
      container.innerHTML = html;
      container.querySelector('#site-settings-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveSiteSettings(e);
      });
    });
  }

  function saveSiteSettings(e) {
    var fields = document.querySelectorAll('#site-settings-form [data-key]');
    var updates = [];
    fields.forEach(function (f) { updates.push({ key: f.dataset.key, value: f.value }); });
    api('/api/settings', { method: 'PATCH', body: JSON.stringify({ updates: updates }) }).then(function (res) {
      if (res.ok) showToast('Settings saved!');
      else showToast('Error saving settings', 'error');
    });
  }

  // ─── CHAT LOGS ────────────────────────────────────
  function loadChatSessions() {
    api('/api/chat-sessions').then(r => r.json()).then(function (data) {
      var list = document.getElementById('chat-sessions-list');
      if (!data.sessions || data.sessions.length === 0) {
        list.innerHTML = '<div class="empty-state" style="padding:2rem"><div class="empty-state-text">No chat sessions yet.</div></div>';
        return;
      }
      list.innerHTML = data.sessions.map(function (s) {
        return '<li class="chat-session-item" data-id="' + escapeHtml(s.session_id) + '">' +
          '<div class="chat-session-id">' + escapeHtml(s.session_id) + '</div>' +
          '<div class="chat-session-meta"><span>' + s.message_count + ' msgs</span><span>' + formatDate(s.started_at) + '</span></div>' +
          '</li>';
      }).join('');

      list.querySelectorAll('.chat-session-item').forEach(item => {
        item.addEventListener('click', function() { viewChatSession(this.dataset.id, this); });
      });
    });
  }

  function viewChatSession(sessionId, el) {
    document.querySelectorAll('.chat-session-item').forEach(function (i) { i.classList.remove('active'); });
    if (el) el.classList.add('active');
    api('/api/chat-sessions/' + encodeURIComponent(sessionId)).then(r => r.json()).then(function (data) {
      var container = document.getElementById('chat-messages-container');
      if (!data.messages || data.messages.length === 0) {
        container.innerHTML = '<div class="empty-state">No messages.</div>';
        return;
      }
      container.innerHTML = data.messages.map(function (m) {
        return '<div class="chat-detail-msg ' + m.role + '">' + escapeHtml(m.message) +
               '<div class="chat-detail-time">' + formatDateTime(m.created_at) + '</div></div>';
      }).join('');
    });
  }

  // ─── CLIENTS ──────────────────────────────────────
  function loadClients() {
    api('/api/admin/clients').then(r => r.json()).then(function (data) {
      var tbody = document.getElementById('clients-tbody');
      tbody.innerHTML = (data.clients || []).map(function (c) {
        return '<tr>' +
          '<td>' + c.id + '</td>' +
          '<td>' + escapeHtml(c.first_name + ' ' + c.last_name) + '</td>' +
          '<td>' + escapeHtml(c.email) + '</td>' +
          '<td>' + escapeHtml(c.company || '—') + '</td>' +
          '<td>' + c.total_purchases + ' items</td>' +
          '<td>' + formatDate(c.created_at) + '</td>' +
          '<td class="actions-cell">' +
            '<button class="btn btn-outline btn-xs btn-grant-direct" data-id="' + c.id + '">Grant Access</button>' +
          '</td>' +
          '</tr>';
      }).join('') || '<tr><td colspan="7" style="text-align:center;">No clients registered yet.</td></tr>';

      tbody.querySelectorAll('.btn-grant-direct').forEach(btn => {
        btn.addEventListener('click', function() { openGrantAccessModal(this.dataset.id); });
      });
    });
  }

  function openGrantAccessModal(clientId) {
    setText('admin-modal-title', 'Grant Product Access');
    var body = document.getElementById('admin-modal-body');
    body.innerHTML = 
      '<form id="grant-access-form">' +
        formField('ga-client-id', 'Client ID', 'text', clientId || '') +
        formField('ga-product-name', 'Product Name', 'text', '') +
        '<div class="form-field"><label>Product File</label>' +
          '<input type="file" id="ga-file" required>' +
        '</div>' +
        '<div class="form-field">' +
          '<label for="ga-notes">Notes</label>' +
          '<textarea id="ga-notes" rows="2"></textarea>' +
        '</div>' +
        '<button type="submit" class="btn btn-gold full-width">Grant Access & Upload</button>' +
      '</form>';

    body.querySelector('#grant-access-form').addEventListener('submit', function(e) {
      e.preventDefault();
      grantAccess();
    });

    document.getElementById('admin-modal').classList.add('open');
  }

  function grantAccess() {
    var clientId = document.getElementById('ga-client-id').value;
    var productName = document.getElementById('ga-product-name').value;
    var fileInput = document.getElementById('ga-file');
    var notes = document.getElementById('ga-notes').value;

    if (!clientId || !productName || !fileInput.files[0]) {
      alert('Missing required fields');
      return;
    }

    var formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('clientId', clientId);
    formData.append('productName', productName);
    formData.append('notes', notes);

    fetch('/api/admin/grant-access', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: formData
    }).then(r => r.json()).then(data => {
      if (data.id) {
        showToast('Access granted successfully');
        closeAdminModal();
        if (currentTab === 'clients') loadClients();
      } else {
        alert(data.error || 'Failed to grant access');
      }
    });
  }

  // ─── USERS ────────────────────────────────────────
  function loadUsers() {
    if (user.role !== 'super_admin') return;
    api('/auth/users').then(r => r.json()).then(function (data) {
      var container = document.getElementById('users-list-container');
      container.innerHTML = data.users.map(function (u) {
        var isSelf = u.id === user.id;
        return '<div class="user-card' + (u.is_active ? '' : ' user-card-inactive') + '">' +
          '<div class="user-info">' +
            '<div class="user-email">' + escapeHtml(u.display_name || u.email) + '</div>' +
            '<div class="user-meta">' +
              '<span>' + escapeHtml(u.email) + '</span>' +
              '<span class="admin-role-badge ' + u.role + '">' + (u.role === 'super_admin' ? 'Super Admin' : 'Admin') + '</span>' +
              '<span>' + (u.is_active ? '✅ Active' : '🚫 Inactive') + '</span>' +
              '<span>Last login: ' + (u.last_login ? formatDate(u.last_login) : 'Never') + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="user-actions">' +
            (isSelf ? '<span style="font-size:0.7rem;color:var(--text-muted)">You</span>' :
              '<button class="btn btn-outline btn-xs btn-edit-user" data-id="' + u.id + '">Edit</button> ' +
              '<button class="btn btn-outline btn-xs btn-toggle-user" data-id="' + u.id + '" data-active="' + u.is_active + '">' +
                (u.is_active ? 'Deactivate' : 'Activate') + '</button>') +
          '</div></div>';
      }).join('');
      container.querySelectorAll('.btn-toggle-user').forEach(btn => {
        btn.addEventListener('click', function() {
          toggleUserActive(this.dataset.id, this.dataset.active === 'false');
        });
      });
      container.querySelectorAll('.btn-edit-user').forEach(btn => {
        btn.addEventListener('click', function() {
          editUser(Number(this.dataset.id));
        });
      });
    }).catch(function () {
      document.getElementById('users-list-container').innerHTML = '<div class="empty-state">Access denied or error loading users.</div>';
    });
  }

  function toggleUserActive(id, activate) {
    if (!confirm(activate ? 'Activate this user?' : 'Deactivate this user?')) return;
    api('/auth/users/' + id, { method: 'PATCH', body: JSON.stringify({ is_active: activate }) }).then(function (res) {
      if (res.ok) { showToast(activate ? 'User activated' : 'User deactivated'); loadUsers(); }
    });
  }

  function editUser(id) {
    api('/auth/users').then(r => r.json()).then(function (data) {
      var u = data.users.find(function (x) { return x.id === id; });
      if (u) openEditUserModal(u);
    });
  }

  function openEditUserModal(d) {
    setText('admin-modal-title', 'Edit Admin User');
    var body = document.getElementById('admin-modal-body');
    body.innerHTML =
      '<form id="edit-user-form">' +
      formField('edit-user-name', 'Display Name', 'text', d.display_name || d.email) +
      formField('edit-user-role', 'Role', 'select', d.role, ['admin', 'super_admin']) +
      '<button type="submit" class="btn btn-gold full-width">Update User</button></form>';
    
    body.querySelector('#edit-user-form').addEventListener('submit', function(e) { 
      e.preventDefault(); 
      updateUser(d.id); 
    });
    document.getElementById('admin-modal').classList.add('open');
  }

  function updateUser(id) {
    var payload = {
      displayName: document.getElementById('edit-user-name').value,
      role: document.getElementById('edit-user-role').value,
    };
    api('/auth/users/' + id, { method: 'PATCH', body: JSON.stringify(payload) }).then(function (res) {
      if (res.ok) { showToast('User updated'); closeAdminModal(); loadUsers(); }
      else res.json().then(function (d) { alert(d.error || d.errors?.[0]?.msg || 'Error'); });
    });
  }

  function openUserModal() {
    setText('admin-modal-title', 'Create Admin User');
    var body = document.getElementById('admin-modal-body');
    body.innerHTML =
      '<form id="create-user-form">' +
      formField('new-user-email', 'Email', 'email', '') +
      formField('new-user-name', 'Display Name', 'text', '') +
      formField('new-user-pw', 'Password', 'password', '') +
      formField('new-user-role', 'Role', 'select', 'admin', ['admin', 'super_admin']) +
      '<button type="submit" class="btn btn-gold full-width">Create User</button></form>';
    
    body.querySelector('#create-user-form').addEventListener('submit', function(e) { e.preventDefault(); createUser(); });
    document.getElementById('admin-modal').classList.add('open');
  }

  function createUser() {
    var payload = {
      email: document.getElementById('new-user-email').value,
      displayName: document.getElementById('new-user-name').value,
      password: document.getElementById('new-user-pw').value,
      role: document.getElementById('new-user-role').value,
    };
    api('/auth/users', { method: 'POST', body: JSON.stringify(payload) }).then(function (res) {
      if (res.ok) { showToast('User created'); closeAdminModal(); loadUsers(); }
      else res.json().then(function (d) { alert(d.error || d.errors?.[0]?.msg || 'Error'); });
    });
  }

  // ─── AUDIT LOG ─────────────────────────────────────
  function loadAuditLog() {
    if (user.role !== 'super_admin') return;
    api('/api/audit-log').then(r => r.json()).then(function (data) {
      var container = document.getElementById('audit-log-container');
      if (!data.logs || data.logs.length === 0) {
        container.innerHTML = '<div class="empty-state">No audit log entries yet.</div>';
        return;
      }
      container.innerHTML = '<div class="audit-row" style="font-weight:600;color:var(--gold);font-size:0.65rem">' +
        '<div>TIMESTAMP</div><div>USER</div><div>ACTION</div><div>ENTITY</div></div>' +
        data.logs.map(function (l) {
          return '<div class="audit-row">' +
            '<div class="audit-time">' + formatDateTime(l.created_at) + '</div>' +
            '<div class="audit-user">' + escapeHtml(l.user_email || '—') + '</div>' +
            '<div class="audit-action">' + escapeHtml(l.action) + (l.details ? ' — ' + escapeHtml(l.details.substring(0, 60)) : '') + '</div>' +
            '<div class="audit-entity">' + (l.entity_type ? escapeHtml(l.entity_type) + '#' + (l.entity_id || '') : '—') + '</div>' +
            '</div>';
        }).join('');
    });
  }

  // ─── ACCOUNT ───────────────────────────────────────
  function updateProfile(e) {
    if(e) e.preventDefault();
    var msgEl = document.getElementById('profile-msg');
    var displayName = document.getElementById('profile-name').value.trim();
    api('/auth/update-profile', {
      method: 'POST',
      body: JSON.stringify({ displayName: displayName }),
    }).then(r => r.json().then(d => ({ ok: r.ok, data: d }))).then(function (result) {
      if (result.ok) {
        msgEl.className = 'settings-msg success';
        msgEl.textContent = 'Profile updated!';
        user.displayName = displayName;
        sessionStorage.setItem('nlc_user', JSON.stringify(user));
        var emailEl = document.getElementById('admin-email');
        if (emailEl) emailEl.textContent = displayName || user.email;
      } else {
        msgEl.className = 'settings-msg error';
        msgEl.textContent = result.data.error || 'Failed to update.';
      }
      msgEl.hidden = false;
    });
  }

  function changePassword(e) {
    if(e) e.preventDefault();
    var msgEl = document.getElementById('settings-msg');
    var currentPassword = document.getElementById('current-pw').value;
    var newPassword = document.getElementById('new-pw').value;
    var confirmPassword = document.getElementById('confirm-pw').value;

    if (newPassword !== confirmPassword) {
      msgEl.className = 'settings-msg error';
      msgEl.textContent = 'New passwords do not match.';
      msgEl.hidden = false;
      return;
    }

    api('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword: currentPassword, newPassword: newPassword }),
    }).then(r => r.json().then(d => ({ ok: r.ok, data: d }))).then(function (result) {
      if (result.ok) {
        msgEl.className = 'settings-msg success';
        msgEl.textContent = 'Password updated successfully!';
        document.getElementById('current-pw').value = '';
        document.getElementById('new-pw').value = '';
        document.getElementById('confirm-pw').value = '';
      } else {
        msgEl.className = 'settings-msg error';
        msgEl.textContent = result.data.error || result.data.errors?.[0]?.msg || 'Failed to update password.';
      }
      msgEl.hidden = false;
    });
  }

  // ─── EXPORT ────────────────────────────────────────
  function exportCSV() {
    api('/api/export/submissions').then(r => r.blob()).then(function (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'nlc-submissions.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  }

  function exportLeadsCSV() {
    api('/api/export/leads').then(r => r.blob()).then(function (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'nlc-exit-leads.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  }

  function logout() {
    sessionStorage.clear();
    window.location.href = '/login.html';
  }

  // ─── HELPERS ───────────────────────────────────────
  function debounceSearch() {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(loadSubmissions, 400);
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text !== undefined && text !== null ? text : '—';
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString();
  }

  function formatDateTime(d) {
    if (!d) return '—';
    return new Date(d).toLocaleString();
  }

  function statusOption(val, current) {
    return '<option value="' + val + '"' + (val === current ? ' selected' : '') + '>' + val.toUpperCase() + '</option>';
  }

  function detailField(label, value) {
    return '<div class="detail-field"><div class="detail-label">' + label + '</div><div class="detail-value">' + value + '</div></div>';
  }

  function formField(id, label, type, value, options) {
    var html = '<div class="form-field"><label for="' + id + '">' + label + '</label>';
    if (type === 'textarea') {
      html += '<textarea id="' + id + '" required>' + escapeHtml(value) + '</textarea>';
    } else if (type === 'select') {
      html += '<select id="' + id + '" required>';
      options.forEach(function (o) {
        html += '<option value="' + o + '"' + (o === value ? ' selected' : '') + '>' + o + '</option>';
      });
      html += '</select>';
    } else {
      html += '<input type="' + type + '" id="' + id + '" value="' + escapeHtml(value) + '" required>';
    }
    html += '</div>';
    return html;
  }

  // ═══════════════════════════════════════════════════════
  //  WEBSITE CONTROLS
  // ═══════════════════════════════════════════════════════

  function loadWebsiteControls() {
    api('/api/settings').then(r => r.json()).then(function (data) {
      if (!data.settings) return;
      const s = {};
      data.settings.forEach(item => { s[item.key] = item.value; });

      // Banner
      const bannerEnabled = document.getElementById('banner-enabled');
      if (bannerEnabled) bannerEnabled.checked = s['banner_enabled'] === '1';
      const bannerText = document.getElementById('banner-text');
      if (bannerText) bannerText.value = s['banner_text'] || '';
      const bannerLink = document.getElementById('banner-link-url');
      if (bannerLink) bannerLink.value = s['banner_link'] || '';
      const bannerColor = document.getElementById('banner-color');
      if (bannerColor) bannerColor.value = s['banner_color'] || '#c9a84c';

      // Hero
      const heroHeadline = document.getElementById('hero-headline');
      if (heroHeadline) heroHeadline.value = s['hero_title'] || '';
      const heroSubtext = document.getElementById('hero-subtext');
      if (heroSubtext) heroSubtext.value = s['hero_subtitle'] || '';

      // Contact
      const contactPhone = document.getElementById('contact-phone');
      if (contactPhone) contactPhone.value = s['company_phone'] || '';
      const contactEmail = document.getElementById('contact-email');
      if (contactEmail) contactEmail.value = s['company_email'] || '';

      // Library
      const libGated = document.getElementById('library-gated');
      if (libGated) libGated.checked = s['library_gated'] === '1';
      const libStatus = document.getElementById('library-access-status');
      if (libStatus) {
        const isGated = s['library_gated'] === '1';
        libStatus.textContent = isGated ? 'Gated (Login Required)' : 'Public (No Login Required)';
        libStatus.style.color = isGated ? '#f59e0b' : '#5ad19b';
      }
    });
  }

  function saveAnnouncementBanner() {
    const updates = [
      { key: 'banner_enabled', value: document.getElementById('banner-enabled').checked ? '1' : '0' },
      { key: 'banner_text', value: document.getElementById('banner-text').value },
      { key: 'banner_link', value: document.getElementById('banner-link-url').value },
      { key: 'banner_color', value: document.getElementById('banner-color').value }
    ];
    api('/api/settings', {
      method: 'PATCH',
      body: JSON.stringify({ updates: updates })
    }).then(r => {
      if (r.ok) {
        showToast('Banner settings saved');
        document.getElementById('banner-saved-msg').style.display = 'block';
      }
    });
  }

  function saveHeroContent() {
    const updates = [
      { key: 'hero_title', value: document.getElementById('hero-headline').value },
      { key: 'hero_subtitle', value: document.getElementById('hero-subtext').value }
    ];
    api('/api/settings', {
      method: 'PATCH',
      body: JSON.stringify({ updates: updates })
    }).then(r => {
      if (r.ok) {
        showToast('Hero content saved');
        document.getElementById('hero-saved-msg').style.display = 'block';
      }
    });
  }

  function saveContactInfo() {
    const updates = [
      { key: 'company_phone', value: document.getElementById('contact-phone').value },
      { key: 'company_email', value: document.getElementById('contact-email').value }
    ];
    api('/api/settings', {
      method: 'PATCH',
      body: JSON.stringify({ updates: updates })
    }).then(r => {
      if (r.ok) {
        showToast('Contact info saved');
        document.getElementById('contact-saved-msg').style.display = 'block';
      }
    });
  }

  function saveLibraryAccess() {
    const gated = document.getElementById('library-gated').checked;
    const updates = [
      { key: 'library_gated', value: gated ? '1' : '0' }
    ];
    api('/api/settings', {
      method: 'PATCH',
      body: JSON.stringify({ updates: updates })
    }).then(r => {
      if (r.ok) {
        const libStatus = document.getElementById('library-access-status');
        libStatus.textContent = gated ? 'Gated (Login Required)' : 'Public (No Login Required)';
        libStatus.style.color = gated ? '#f59e0b' : '#5ad19b';
        showToast('Library access updated');
        document.getElementById('library-saved-msg').style.display = 'block';
      }
    });
  }

  // To maintain compatibility with dynamic HTML if needed
  window.saveAnnouncementBanner = saveAnnouncementBanner;
  window.saveHeroContent = saveHeroContent;
  window.saveContactInfo = saveContactInfo;
  window.saveLibraryAccess = saveLibraryAccess;
  window.logout = logout;
  window.openGrantAccessModal = openGrantAccessModal;

  // Update loaders
  tabLoaders['website-controls'] = loadWebsiteControls;

})();
