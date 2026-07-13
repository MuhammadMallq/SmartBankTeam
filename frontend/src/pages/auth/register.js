import '../../styles/auth.css';
import { ICONS, showToast } from '../../utils/ui-core.js';

let currentStep = 1;
const formData = {
  tier: 'Bronze',
  name: '',
  email: '',
  password: '',
  phone: '',
  nik: ''
};

function renderRegisterPage() {
  let content = '';

  if (currentStep === 1) {
    content = `
      <div class="auth-header">
        <div class="auth-logo-large">${ICONS.bank}</div>
        <h1>Langkah 1: Pilih Jenis Tabungan</h1>
        <p>Pilih tier rekening SmartBank yang paling sesuai dengan kebutuhan finansial Anda.</p>
      </div>
      <div class="tier-selection" style="display: flex; gap: 1rem; margin-bottom: 2rem;">
        <div class="tier-card ${formData.tier === 'Bronze' ? 'selected' : ''}" onclick="selectTier('Bronze')" style="flex:1; border: 2px solid ${formData.tier === 'Bronze' ? '#D4AF37' : '#e2e8f0'}; padding: 1rem; border-radius: 12px; cursor: pointer; text-align: center; transition: 0.3s; background: ${formData.tier === 'Bronze' ? '#fffbeb' : '#fff'};">
          <h3 style="color:#b45309; margin:0 0 5px 0;">Bronze</h3>
          <p style="font-size: 12px; margin: 0; color:#64748b;">Bebas Biaya Admin. Limit kecil.</p>
        </div>
        <div class="tier-card ${formData.tier === 'Silver' ? 'selected' : ''}" onclick="selectTier('Silver')" style="flex:1; border: 2px solid ${formData.tier === 'Silver' ? '#D4AF37' : '#e2e8f0'}; padding: 1rem; border-radius: 12px; cursor: pointer; text-align: center; transition: 0.3s; background: ${formData.tier === 'Silver' ? '#fffbeb' : '#fff'};">
          <h3 style="color:#64748b; margin:0 0 5px 0;">Silver</h3>
          <p style="font-size: 12px; margin: 0; color:#64748b;">Biaya Standar. Limit menengah.</p>
        </div>
        <div class="tier-card ${formData.tier === 'Gold' ? 'selected' : ''}" onclick="selectTier('Gold')" style="flex:1; border: 2px solid ${formData.tier === 'Gold' ? '#D4AF37' : '#e2e8f0'}; padding: 1rem; border-radius: 12px; cursor: pointer; text-align: center; transition: 0.3s; background: ${formData.tier === 'Gold' ? '#fffbeb' : '#fff'};">
          <h3 style="color:#eab308; margin:0 0 5px 0;">Gold</h3>
          <p style="font-size: 12px; margin: 0; color:#64748b;">Premium Service. Limit maksimal.</p>
        </div>
      </div>
      <div class="auth-form">
        <button onclick="nextStep(2)">Lanjutkan</button>
      </div>
    `;
  } else if (currentStep === 2) {
    content = `
      <div class="auth-header">
        <div class="auth-logo-large">${ICONS.bank}</div>
        <h1>Langkah 2: Data Diri (e-KYC)</h1>
        <p>Mohon isi identitas Anda sesuai KTP untuk keamanan akun.</p>
      </div>
      <form class="auth-form" id="registerFormDetails">
        <div class="form-group">
          <label>Nama Lengkap (Sesuai KTP)</label>
          <input type="text" id="name" required value="${formData.name}" />
        </div>
        <div class="form-group">
          <label>Nomor Induk Kependudukan (NIK)</label>
          <input type="text" id="nik" required value="${formData.nik}" maxlength="16" />
        </div>
        <div class="form-group">
          <label>Nomor Telepon / WhatsApp</label>
          <input type="text" id="phone" required value="${formData.phone}" />
        </div>
        <button type="submit">Lanjutkan</button>
      </form>
      <div class="auth-footer" style="margin-top: 15px;">
        <a href="javascript:void(0)" onclick="nextStep(1)" style="color: #64748b; font-weight: 500;">← Kembali</a>
      </div>
    `;
  } else if (currentStep === 3) {
    content = `
      <div class="auth-header">
        <div class="auth-logo-large">${ICONS.bank}</div>
        <h1>Langkah 3: Keamanan Akun</h1>
        <p>Buat email dan password untuk login ke aplikasi SmartBank Anda.</p>
      </div>
      <form class="auth-form" id="registerFormSecurity">
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" id="email" required value="${formData.email}" />
        </div>
        <div class="form-group">
          <label>Password Akun</label>
          <input type="password" id="password" required />
        </div>
        <button type="submit">Selesaikan Pendaftaran</button>
      </form>
      <div class="auth-footer" style="margin-top: 15px;">
        <a href="javascript:void(0)" onclick="nextStep(2)" style="color: #64748b; font-weight: 500;">← Kembali</a>
      </div>
    `;
  } else if (currentStep === 4) {
    // Assuming submitRegistration stored the generated account in formData.account
    const accNo = formData.account ? formData.account.account_no : 'Terbaru Anda';
    content = `
      <div class="auth-header">
        <div class="auth-logo-large" style="color: #0d9488;">✓</div>
        <h1>Pendaftaran Berhasil!</h1>
        <p style="color: #b45309; background: #fef3c7; padding: 1rem; border-radius: 8px; margin-top: 1rem; border: 1px solid #fde68a;">
          Status Akun: <b>Menunggu Setoran</b><br>
          Nomor Rekening: <b>${accNo}</b><br><br>
          Silakan datang ke Teller cabang terdekat kami dan berikan nomor rekening di atas beserta uang tunai <b>minimal Rp 50.000</b> untuk mengaktifkan tabungan ini.
        </p>
      </div>
      <div class="auth-form" style="margin-top: 2rem;">
        <button onclick="window.location.href='/login.html'">Kembali ke Halaman Login</button>
      </div>
    `;
  }

  document.querySelector('#app-auth').innerHTML = `
  <div class="auth-wrapper register-theme">
    <div class="auth-hero">
      <div class="hero-content">
        <div class="hero-glass-card">
          <h2>Masa Depan Finansial</h2>
          <p>Mulai perjalanan perbankan digital Anda hari ini. Aman, cepat, dan transparan untuk semua nasabah.</p>
          <div style="margin-top:20px; font-size:12px; opacity:0.8;">Langkah ${currentStep} dari 3</div>
        </div>
      </div>
    </div>
    
    <div class="auth-form-side">
      <a href="/" class="back-home-btn">← Kembali ke Beranda</a>
      <div class="auth-container">
        ${content}
        ${currentStep === 1 ? `<div class="form-separator"><span>OR</span></div><div class="auth-footer"><p>Sudah memiliki akses? <a href="/login.html">Login di sini</a></p></div>` : ''}
      </div>
    </div>
  </div>`;

  // Attach events
  if (currentStep === 2) {
    document.getElementById('registerFormDetails').addEventListener('submit', (e) => {
      e.preventDefault();
      formData.name = document.getElementById('name').value;
      formData.nik = document.getElementById('nik').value;
      formData.phone = document.getElementById('phone').value;
      nextStep(3);
    });
  } else if (currentStep === 3) {
    document.getElementById('registerFormSecurity').addEventListener('submit', async (e) => {
      e.preventDefault();
      formData.email = document.getElementById('email').value;
      formData.password = document.getElementById('password').value;
      await submitRegistration();
    });
  }
}

window.selectTier = function(tier) {
  formData.tier = tier;
  renderRegisterPage();
}

window.nextStep = function(step) {
  currentStep = step;
  renderRegisterPage();
}

async function submitRegistration() {
  try {
    const res = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!res.ok) {
      const err = await res.json();
      showToast(err.error || 'Gagal mendaftar', 'error');
      return;
    }

    const data = await res.json();
    console.log(data); // The backend returns user, account, and message
    
    // Save account data to show the account number on success screen
    formData.account = data.account;
    
    // Move to success step
    nextStep(4);

  } catch (err) {
    showToast('Koneksi ke server gagal!', 'error');
  }
}

renderRegisterPage();
