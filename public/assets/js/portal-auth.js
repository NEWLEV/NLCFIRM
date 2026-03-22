document.addEventListener('DOMContentLoaded', () => {
    // Redirect if already authenticated as a client
    const token = localStorage.getItem('nlc_client_token');
    if (token) {
      window.location.href = '/portal.html';
      return;
    }
  
    const loginForm = document.getElementById('form-login');
    const registerForm = document.getElementById('form-register');
    const errorBox = document.getElementById('auth-error');
    const successBox = document.getElementById('auth-success');
    
    function showError(msg) {
      errorBox.textContent = msg;
      errorBox.style.display = 'block';
      successBox.style.display = 'none';
    }
    function showSuccess(msg) {
      successBox.textContent = msg;
      successBox.style.display = 'block';
      errorBox.style.display = 'none';
    }
  
    // ─── LOGIN ──────────────────────────────────────────────
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorBox.style.display = 'none';
        
        const btn = document.getElementById('btn-login');
        const originalText = btn.textContent;
        btn.textContent = 'Authenticating...';
        btn.disabled = true;
  
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
  
        try {
          const res = await fetch('/api/client/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const data = await res.json();
  
          if (res.ok) {
            localStorage.setItem('nlc_client_token', data.token);
            localStorage.setItem('nlc_client_user', JSON.stringify(data.client));
            window.location.href = '/portal.html';
          } else {
            showError(data.error || data.errors?.[0]?.msg || 'Login failed.');
            btn.textContent = originalText;
            btn.disabled = false;
          }
        } catch (err) {
          showError('Connection error resolving to the server.');
          btn.textContent = originalText;
          btn.disabled = false;
        }
      });
    }
  
    // ─── REGISTER ───────────────────────────────────────────
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorBox.style.display = 'none';
        
        const btn = document.getElementById('btn-register');
        const originalText = btn.textContent;
        btn.textContent = 'Creating Account...';
        btn.disabled = true;
  
        const firstName = document.getElementById('reg-first').value.trim();
        const lastName = document.getElementById('reg-last').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const company = document.getElementById('reg-company').value.trim();
        const password = document.getElementById('reg-password').value;
  
        try {
          const res = await fetch('/api/client/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, email, company, password })
          });
          const data = await res.json();
  
          if (res.ok) {
            showSuccess('Account created successfully. Logging you in...');
            localStorage.setItem('nlc_client_token', data.token);
            localStorage.setItem('nlc_client_user', JSON.stringify(data.client));
            setTimeout(() => {
              window.location.href = '/portal.html';
            }, 1000);
          } else {
            showError(data.error || data.errors?.[0]?.msg || 'Registration failed.');
            btn.textContent = originalText;
            btn.disabled = false;
          }
        } catch (err) {
          showError('Connection error resolving to the server.');
          btn.textContent = originalText;
          btn.disabled = false;
        }
      });
    }
  });
