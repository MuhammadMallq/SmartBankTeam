import './auth.css';

const bankSvg = `
<svg class="bank-icon" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24">
  <path fill="#2563eb" d="M12,1L0,7V9H24V7L12,1M2,11H5V20H2V11M9,11H12V20H9V11M16,11H19V20H16V11M0,22H24V24H0V22Z"/>
</svg>
`;

document.querySelector('#app-auth').innerHTML = `
  <div class="auth-wrapper">
    <div class="auth-hero">
      <div class="hero-content">
        <div class="hero-glass-card">
          <h2>Standard Global Keuangan</h2>
          <p>Memfasilitasi seluruh transaksi digital di ekosistem SmartBank secara aman, instan, dan terpusat sebagai "Single Source of Truth".</p>
        </div>
      </div>
    </div>
    
    <div class="auth-form-side">
      <div class="auth-container">
        <div class="auth-header">
          ${bankSvg}
          <h1>SmartBank</h1>
          <p>Otoritas perbankan utama Anda. <br/>Silakan masukan kredensial untuk melanjutkan.</p>
        </div>
        <form class="auth-form" id="loginForm">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" name="email" required autocomplete="email" placeholder="budi@smartbank.local" />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required autocomplete="current-password" placeholder="••••••••••••" />
          </div>
          <button type="submit">Log in to Dashboard</button>
        </form>
        <div class="form-separator"><span>OR</span></div>
        <div class="auth-footer">
          <p>Belum terdaftar di ekosistem? <a href="/register.html">Registrasi sekarang</a></p>
        </div>
      </div>
    </div>
  </div>
`;

let correctEmail = "";
let correctPassword = "";

fetch('/dummy_data.json')
  .then(res => res.json())
  .then(data => {
    correctEmail = data.user.email;
    correctPassword = data.user.password;
    document.getElementById('email').value = correctEmail;
    document.getElementById('password').value = correctPassword;
  })
  .catch(err => console.error("Could not load dummy data:", err));

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? '✅' : '❌';
  toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${message}</span>`;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  if (email === correctEmail && password === correctPassword) {
    showToast('Login berhasil! Mengalihkan ke dashboard...', 'success');
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 1500);
  } else {
    showToast('Kredensial salah! Akses ditolak.', 'error');
  }
});
