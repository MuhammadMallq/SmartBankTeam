import { formatRp } from '../../utils/helpers.js';

/* ─── Global State Accessors ────────────────────────────────────────────────── */
let isCooldown = false;
let selectedContact = null;

/* ─── Modal Management ─────────────────────────────────────────────────────── */
export function openModal(id) {
  document.getElementById(id)?.classList.add('active');
}

export function closeModal(id) {
  document.getElementById(id)?.classList.remove('active');
  if (id === 'modal-transfer') {
    goToStep(1);
    selectedContact = null;
    document.querySelectorAll('.contact-chip').forEach(el => el.classList.remove('selected'));
    const next = document.getElementById('trf-step1-next');
    if (next) next.disabled = true;
  }
}

/* ─── Transfer Flow ─────────────────────────────────────────────────────────── */
export function goToStep(step) {
  const s1 = document.getElementById('trf-step1');
  const s2 = document.getElementById('trf-step2');
  if (s1) s1.style.display = step === 1 ? 'block' : 'none';
  if (s2) s2.style.display = step === 2 ? 'block' : 'none';

  if (step === 2 && selectedContact) {
    document.getElementById('trf-selected-name').textContent = selectedContact.name;
    document.getElementById('trf-selected-id').textContent = selectedContact.id;
    const initial = document.getElementById('trf-selected-initial');
    initial.textContent = selectedContact.initial;
    initial.style.background = selectedContact.color;
    
    const amountInput = document.getElementById('trf_amount');
    amountInput.value = '';
    updateFeeInfo();
  }
}

export function updateFeeInfo() {
  const amount = parseFloat(document.getElementById('trf_amount')?.value || 0);
  const fee = amount * 0.03;
  const feeInfo = document.getElementById('trf_fee_info');
  const totalInfo = document.getElementById('trf_total_info');
  if (feeInfo) feeInfo.textContent = formatRp(fee);
  if (totalInfo) totalInfo.textContent = formatRp(amount + fee);
}

export function selectContact(id, appState) {
  selectedContact = appState.contacts.find(c => c.id === id);
  if (!selectedContact) return;
  document.querySelectorAll('.contact-chip').forEach(el => el.classList.remove('selected'));
  document.querySelector(`.contact-chip[data-id="${id}"]`)?.classList.add('selected');
  const nextBtn = document.getElementById('trf-step1-next');
  if (nextBtn) nextBtn.disabled = false;
}

export async function processTransfer(event, appState, renderApp) {
  event.preventDefault();
  if (isCooldown) {
    showToastModal('Cooldown aktif. Harap tunggu 10 detik sebelum transfer berikutnya.', 'warning');
    return;
  }
  if (!selectedContact) {
    showToastModal('Pilih penerima terlebih dahulu.', 'error');
    return;
  }
  const amount = parseFloat(document.getElementById('trf_amount').value);
  if (!amount || amount < 1000) {
    showToastModal('Nominal transfer minimal Rp 1.000.', 'error');
    return;
  }
  const totalFee = amount * 0.03;
  const totalDeduction = amount + totalFee;
  if (totalDeduction > appState.dashboard.balance) {
    showToastModal('Saldo tidak mencukupi untuk melakukan transfer ini.', 'error');
    return;
  }
  if (appState.dashboard.dailyTransactions.used >= appState.dashboard.dailyTransactions.max) {
    showToastModal('Batas transaksi harian (10x) telah tercapai!', 'error');
    return;
  }

  // Call the Backend API
  try {
    const btn = document.getElementById('trf-step2-btn');
    if (btn) btn.disabled = true;

    const req = await fetch('http://localhost:3000/api/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amount,
        to_user: selectedContact.id,
        to_name: selectedContact.name,
        from_user: appState.user.id
      })
    });
    
    if (!req.ok) throw new Error('Transfer failed');

    // Refetch the data to get updated balance and history
    let fetchUrl = 'http://localhost:3000/api/dashboard/data';
    const storedUserStr = localStorage.getItem('currentUser');
    if (storedUserStr) {
      const storedUser = JSON.parse(storedUserStr);
      fetchUrl += '?userId=' + storedUser.id;
    }
    const res = await fetch(fetchUrl);
    const newData = await res.json();
    
    // Update local appState with new values
    appState.dashboard = newData.dashboard;
    appState.user = newData.user;
    appState.ledger = newData.ledger;

    isCooldown = true;
    setTimeout(() => { isCooldown = false; }, 10000);
    const sentName = selectedContact.name;
    closeModal('modal-transfer');
    selectedContact = null;
    renderApp();
    showPageToast(`✓ Transfer ke ${sentName} berhasil!`);
  } catch (err) {
    showToastModal('Gagal memproses transfer ke server.', 'error');
  } finally {
    const btn = document.getElementById('trf-step2-btn');
    if (btn) btn.disabled = false;
  }
}

/* ─── Feedback & Toasts ────────────────────────────────────────────────────── */
export function showToastModal(msg, type = 'info') {
  const existing = document.getElementById('modal-toast');
  if (existing) existing.remove();
  const colors = { error: '#dc2626', warning: '#b45309', info: '#2563eb' };
  const el = document.createElement('div');
  el.id = 'modal-toast';
  el.style.cssText = `background:${colors[type]}15;border:1px solid ${colors[type]}40;color:${colors[type]};padding:10px 14px;border-radius:8px;font-size:13px;font-weight:500;margin-bottom:12px;`;
  el.textContent = msg;
  const form = document.getElementById('form-trf');
  if (form) form.prepend(el);
  setTimeout(() => el.remove(), 3000);
}

export function showPageToast(msg) {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;bottom:28px;right:28px;background:#0f172a;color:white;padding:14px 20px;border-radius:12px;font-size:14px;font-weight:500;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.2);animation:slideUp 0.3s ease;';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

/* ─── Event Binding ────────────────────────────────────────────────────────── */
export function bindCommonEvents(navigateTo, appState, renderApp) {
  // Navigation Links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.getAttribute('data-page'));
    });
  });

  // Logout Flow
  document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal('modal-logout');
  });
  document.getElementById('cancel-logout')?.addEventListener('click', () => closeModal('modal-logout'));
  document.getElementById('confirm-logout')?.addEventListener('click', (e) => {
    e.target.textContent = 'Memutus koneksi...';
    e.target.style.opacity = '0.7';
    localStorage.removeItem('currentUser');
    setTimeout(() => { window.location.href = '/'; }, 800);
  });
}

export function bindDashboardEvents(appState, renderApp) {
  // Transfer Modal Open
  document.querySelectorAll('.action-transfer').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('modal-transfer');
    });
  });

  // Modal Close
  document.getElementById('close-modal-trf')?.addEventListener('click', () => closeModal('modal-transfer'));

  // Transfer Steps
  document.querySelectorAll('[data-action="select-contact"]').forEach(chip => {
    chip.addEventListener('click', () => selectContact(chip.getAttribute('data-id'), appState));
  });

  document.getElementById('trf-step1-next')?.addEventListener('click', () => goToStep(2));
  document.getElementById('trf-back-step1')?.addEventListener('click', () => goToStep(1));

  // Form Interactions
  document.getElementById('form-trf')?.addEventListener('submit', (e) => processTransfer(e, appState, renderApp));
  document.getElementById('trf_amount')?.addEventListener('input', updateFeeInfo);

  document.querySelectorAll('.preset-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const amtEl = document.getElementById('trf_amount');
      if (amtEl) {
        amtEl.value = pill.getAttribute('data-amount');
        updateFeeInfo();
      }
    });
  });
}
