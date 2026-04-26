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
          <h2>Bergabung dengan Sang Regulator</h2>
          <p>Membuka akun di SmartBank memberi Anda akses menjadi otoritas utama seluruh sirkulasi uang pada ekosistem platform digital.</p>
        </div>
      </div>
    </div>
    
    <div class="auth-form-side">
      <div class="auth-container">
        <div class="auth-header">
          ${bankSvg}
          <h1>SmartBank</h1>
          <p>Isi data diri Anda di bawah untuk mengaktivasi identitas Rekening Induk baru.</p>
        </div>
        <form class="auth-form" id="registerForm">
          <div class="form-group">
            <label for="fullname">Nama Identitas Lengkap</label>
            <input type="text" id="fullname" name="fullname" placeholder="Misal: Bapak Budi" required autocomplete="name" />
          </div>
          <div class="form-group">
            <label for="email">Alamat Email Tervalidasi</label>
            <input type="email" id="email" name="email" placeholder="contoh: budi@smartbank.local" required autocomplete="email" />
          </div>
          <div class="form-group">
            <label for="password">Kata Sandi (Kode Pin)</label>
            <input type="password" id="password" name="password" placeholder="Minimal kombinasi 8 Karakter..." required autocomplete="new-password" />
          </div>
          <button type="submit">Aktivasi Rekening</button>
        </form>
        <div class="form-separator"><span>OR</span></div>
        <div class="auth-footer">
          <p>Masih ingat dengan identitas lama? <a href="/">Login langsung</a></p>
        </div>
      </div>
    </div>
  </div>
`;

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

document.getElementById('registerForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const fullname = document.getElementById('fullname').value;
  const email = document.getElementById('email').value;
  
  // TODO: Add actual register logic connecting to Go/Express backend later
  console.log('Register attempt with', fullname, email);
  
  showToast('Rekening Anda telah berhasil dicetak! Mengalihkan ke ruang Logon...', 'success');
  
  setTimeout(() => {
    window.location.href = '/';
  }, 2200);
});
