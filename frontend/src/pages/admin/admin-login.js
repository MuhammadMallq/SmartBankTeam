import './admin-auth.css';

// Set admin-body class to body
document.body.classList.add('admin-body');

const adminIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  <circle cx="12" cy="16" r="1"></circle>
</svg>
`;

document.querySelector('#app-auth').innerHTML = `
  <a href="/" class="back-home">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
    BACK TO CORE
  </a>

  <div class="admin-login-wrapper">
    <div class="admin-card">
      <div class="admin-header">
        <div class="admin-logo-wrapper">
          ${adminIcon}
        </div>
        <h1>SECURE CORE</h1>
        <p>Administrative Authority</p>
      </div>

      <div class="system-status">
        <div class="status-item">
          <span class="status-dot"></span>
          SYS_ACTIVE
        </div>
        <div class="status-item">
          SECURE_SSL: TRUE
        </div>
      </div>

      <form class="admin-form" id="adminLoginForm">
        <div class="form-group">
          <label>Admin Identifier</label>
          <input type="email" id="email" required autocomplete="email" placeholder="ADMIN_ID" />
        </div>
        <div class="form-group">
          <label>Security Key</label>
          <input type="password" id="password" required autocomplete="current-password" placeholder="••••••••" />
        </div>
        <button type="submit" class="admin-btn">Initiate Auth</button>
      </form>

      <div class="admin-footer">
        <p>Standard user? <a href="/login.html">Switch to Portal</a></p>
      </div>
    </div>
  </div>
`;

let correctEmail = "";
let correctPassword = "";

fetch('/dummy_data.json')
  .then(res => res.json())
  .then(data => {
    correctEmail = data.admin.email;
    correctPassword = data.admin.password;
    // Pre-fill for convenience
    document.getElementById('email').value = correctEmail;
    document.getElementById('password').value = correctPassword;
  })
  .catch(err => console.error("Could not load dummy data:", err));

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast admin-toast ${type}`;
  const icon = type === 'success' ? '✔' : '✘';
  toast.innerHTML = `<span>${icon} [${message.toUpperCase()}]</span>`;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  if (email === correctEmail && password === correctPassword) {
    showToast('Auth Success. Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = '/admin-dashboard.html';
    }, 1500);
  } else {
    showToast('Auth Denied. Invalid key.', 'error');
  }
});
