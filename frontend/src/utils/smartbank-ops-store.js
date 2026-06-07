const STORAGE_KEY = 'smartbank_ops_state_v2';
const CHANNEL_NAME = 'smartbank-ops-live';
const TAB_ID = `tab-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const listeners = new Set();
let channel = null;
let storageListenerBound = false;

export const TRANSFER_RATES = {
  fee: 0.01,
  tax: 0.02
};

function nowIso() {
  return new Date().toISOString();
}

function todayKey(dateValue = new Date()) {
  return new Date(dateValue).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
}

function todayCompact() {
  return todayKey().replaceAll('-', '');
}

function minutesAgo(minutes) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return window.localStorage;
}

function createSeedState() {
  return {
    meta: {
      version: 2,
      businessDate: todayKey(),
      lastUpdated: nowIso(),
      customerSeq: 6,
      accountSeq: 3006,
      transactionSeq: 1025,
      ticketSeq: 4,
      queueSeq: 4
    },
    customers: [
      {
        id: 'CST-001',
        nik: '3174051201900001',
        name: 'Budi Santoso',
        email: 'budi@smartbank.local',
        phone: '0812-7788-9900',
        address: 'Jl. Merdeka No. 12, Jakarta',
        segment: 'Prioritas',
        status: 'AKTIF',
        risk: 'LOW',
        joinedAt: '2024-03-12'
      },
      {
        id: 'CST-002',
        nik: '3174052302880002',
        name: 'Rina Wijaya',
        email: 'rina@smartbank.local',
        phone: '0813-2200-1100',
        address: 'Jl. Anggrek No. 8, Bekasi',
        segment: 'Retail',
        status: 'AKTIF',
        risk: 'LOW',
        joinedAt: '2023-11-04'
      },
      {
        id: 'CST-003',
        nik: '3273010703910003',
        name: 'Ahmad Fauzi',
        email: 'ahmad@smartbank.local',
        phone: '0821-4400-7788',
        address: 'Jl. Braga No. 40, Bandung',
        segment: 'UMKM',
        status: 'AKTIF',
        risk: 'MEDIUM',
        joinedAt: '2022-08-19'
      },
      {
        id: 'CST-004',
        nik: '3578021412950004',
        name: 'Siti Nurhaliza',
        email: 'siti@smartbank.local',
        phone: '0857-1122-3399',
        address: 'Jl. Pemuda No. 21, Surabaya',
        segment: 'Retail',
        status: 'AKTIF',
        risk: 'LOW',
        joinedAt: '2025-01-10'
      },
      {
        id: 'CST-005',
        nik: '3671051904870005',
        name: 'Maya Putri',
        email: 'maya@smartbank.local',
        phone: '0819-6633-2255',
        address: 'Jl. Serpong Raya No. 18, Tangerang',
        segment: 'Payroll',
        status: 'AKTIF',
        risk: 'LOW',
        joinedAt: '2024-06-28'
      },
      {
        id: 'CST-006',
        nik: '3372011111800006',
        name: 'Dedi Kurniawan',
        email: 'dedi@smartbank.local',
        phone: '0822-7711-4400',
        address: 'Jl. Slamet Riyadi No. 77, Solo',
        segment: 'UMKM',
        status: 'AKTIF',
        risk: 'MEDIUM',
        joinedAt: '2021-12-02'
      }
    ],
    accounts: [
      {
        accountNo: '1002003001',
        customerId: 'CST-001',
        product: 'Tabungan Smart',
        type: 'TABUNGAN',
        balance: 5450000,
        status: 'AKTIF',
        openedAt: '2024-03-12',
        branch: 'Jakarta Pusat'
      },
      {
        accountNo: '1002003101',
        customerId: 'CST-001',
        product: 'Deposito Berjangka',
        type: 'DEPOSITO',
        balance: 25000000,
        status: 'AKTIF',
        openedAt: '2024-08-01',
        branch: 'Jakarta Pusat'
      },
      {
        accountNo: '1002003002',
        customerId: 'CST-002',
        product: 'Tabungan Smart',
        type: 'TABUNGAN',
        balance: 8800000,
        status: 'AKTIF',
        openedAt: '2023-11-04',
        branch: 'Bekasi'
      },
      {
        accountNo: '1002003003',
        customerId: 'CST-003',
        product: 'Giro Usaha',
        type: 'GIRO',
        balance: 12750000,
        status: 'AKTIF',
        openedAt: '2022-08-19',
        branch: 'Bandung'
      },
      {
        accountNo: '1002003004',
        customerId: 'CST-004',
        product: 'Tabungan Smart',
        type: 'TABUNGAN',
        balance: 3250000,
        status: 'AKTIF',
        openedAt: '2025-01-10',
        branch: 'Surabaya'
      },
      {
        accountNo: '1002003005',
        customerId: 'CST-005',
        product: 'Tabungan Payroll',
        type: 'TABUNGAN',
        balance: 6925000,
        status: 'AKTIF',
        openedAt: '2024-06-28',
        branch: 'Tangerang'
      },
      {
        accountNo: '1002003006',
        customerId: 'CST-006',
        product: 'Tabungan Smart',
        type: 'TABUNGAN',
        balance: 950000,
        status: 'BLOKIR',
        openedAt: '2021-12-02',
        branch: 'Solo'
      }
    ],
    transactions: [
      {
        id: 'TRX-20260607-1025',
        reference: 'REF-20260607-1025',
        timestamp: minutesAgo(12),
        type: 'CASH_DEPOSIT',
        description: 'Setor tunai di teller',
        accountNo: '1002003001',
        customerId: 'CST-001',
        relatedAccountNo: null,
        amount: 500000,
        fee: 0,
        tax: 0,
        totalDebit: 0,
        direction: 'CREDIT',
        balanceBefore: 4950000,
        balanceAfter: 5450000,
        status: 'SUCCESS',
        channel: 'TELLER',
        officer: 'Bank Teller 01'
      },
      {
        id: 'TRX-20260607-1024',
        reference: 'REF-20260607-1024',
        timestamp: minutesAgo(24),
        type: 'CASH_WITHDRAWAL',
        description: 'Tarik tunai di teller',
        accountNo: '1002003004',
        customerId: 'CST-004',
        relatedAccountNo: null,
        amount: 750000,
        fee: 0,
        tax: 0,
        totalDebit: 750000,
        direction: 'DEBIT',
        balanceBefore: 4000000,
        balanceAfter: 3250000,
        status: 'SUCCESS',
        channel: 'TELLER',
        officer: 'Bank Teller 01'
      },
      {
        id: 'TRX-20260607-1023',
        reference: 'REF-20260607-1023',
        timestamp: minutesAgo(38),
        type: 'TRANSFER_OUT',
        description: 'Transfer teller ke 1002003002',
        accountNo: '1002003003',
        customerId: 'CST-003',
        relatedAccountNo: '1002003002',
        amount: 1000000,
        fee: 10000,
        tax: 20000,
        totalDebit: 1030000,
        direction: 'DEBIT',
        balanceBefore: 13780000,
        balanceAfter: 12750000,
        status: 'SUCCESS',
        channel: 'TELLER',
        officer: 'Bank Teller 01'
      },
      {
        id: 'TRX-20260607-1022',
        reference: 'REF-20260607-1023',
        timestamp: minutesAgo(38),
        type: 'TRANSFER_IN',
        description: 'Transfer teller dari 1002003003',
        accountNo: '1002003002',
        customerId: 'CST-002',
        relatedAccountNo: '1002003003',
        amount: 1000000,
        fee: 0,
        tax: 0,
        totalDebit: 0,
        direction: 'CREDIT',
        balanceBefore: 7800000,
        balanceAfter: 8800000,
        status: 'SUCCESS',
        channel: 'TELLER',
        officer: 'Bank Teller 01'
      },
      {
        id: 'TRX-20260607-1021',
        reference: 'REF-20260607-1021',
        timestamp: minutesAgo(55),
        type: 'SERVICE_ADJUSTMENT',
        description: 'Koreksi data nasabah oleh CS',
        accountNo: '1002003005',
        customerId: 'CST-005',
        relatedAccountNo: null,
        amount: 0,
        fee: 0,
        tax: 0,
        totalDebit: 0,
        direction: 'INFO',
        balanceBefore: 6925000,
        balanceAfter: 6925000,
        status: 'SUCCESS',
        channel: 'CUSTOMER_SERVICE',
        officer: 'CS Officer 01'
      }
    ],
    serviceTickets: [
      {
        id: 'TCK-001',
        customerId: 'CST-001',
        accountNo: '1002003001',
        category: 'Kartu ATM',
        priority: 'NORMAL',
        status: 'OPEN',
        note: 'Nasabah meminta penggantian kartu karena chip sulit dibaca.',
        createdAt: minutesAgo(70),
        updatedAt: minutesAgo(70),
        officer: 'CS Officer 01'
      },
      {
        id: 'TCK-002',
        customerId: 'CST-006',
        accountNo: '1002003006',
        category: 'Aktivasi Rekening',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        note: 'Rekening terblokir karena salah PIN berulang.',
        createdAt: minutesAgo(45),
        updatedAt: minutesAgo(18),
        officer: 'CS Officer 01'
      },
      {
        id: 'TCK-003',
        customerId: 'CST-003',
        accountNo: '1002003003',
        category: 'Mutasi Rekening',
        priority: 'NORMAL',
        status: 'DONE',
        note: 'Cetak mutasi untuk kebutuhan audit usaha.',
        createdAt: minutesAgo(140),
        updatedAt: minutesAgo(90),
        officer: 'CS Officer 01'
      }
    ],
    queue: [
      {
        id: 'QUE-001',
        number: 'A001',
        customerId: 'CST-006',
        service: 'Aktivasi Rekening',
        status: 'CALLED',
        notes: 'Bawa KTP asli dan buku tabungan.',
        createdAt: minutesAgo(32),
        calledAt: minutesAgo(10),
        completedAt: null
      },
      {
        id: 'QUE-002',
        number: 'A002',
        customerId: 'CST-002',
        service: 'Informasi Saldo',
        status: 'WAITING',
        notes: 'Minta cetak informasi tabungan.',
        createdAt: minutesAgo(22),
        calledAt: null,
        completedAt: null
      },
      {
        id: 'QUE-003',
        number: 'A003',
        customerId: 'CST-004',
        service: 'Keluhan Transaksi',
        status: 'WAITING',
        notes: 'Konfirmasi transaksi tarik tunai.',
        createdAt: minutesAgo(8),
        calledAt: null,
        completedAt: null
      }
    ],
    tellerSession: {
      id: 'SHIFT-20260607-01',
      tellerId: 'TLR-01',
      tellerName: 'Bank Teller 01',
      drawerOpening: 12500000,
      drawerCash: 12250000,
      openedAt: minutesAgo(180),
      status: 'OPEN'
    },
    bankIncome: {
      fees: 10000,
      taxes: 20000
    }
  };
}

function ensureState() {
  const storage = getStorage();
  if (!storage) return createSeedState();

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = createSeedState();
      storage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }

    const state = JSON.parse(raw);
    if (!state?.meta || state.meta.version !== 2) {
      const seeded = createSeedState();
      storage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }

    return state;
  } catch (error) {
    console.error('Failed to load SmartBank ops state:', error);
    const seeded = createSeedState();
    storage?.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function notifySubscribers(message) {
  listeners.forEach((listener) => listener(message));
}

function bindRealtimeListeners() {
  if (typeof window === 'undefined') return;

  if (!channel && 'BroadcastChannel' in window) {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event) => {
      if (event.data?.storageKey !== STORAGE_KEY || event.data?.source === TAB_ID) return;
      notifySubscribers(event.data);
    };
  }

  if (!storageListenerBound) {
    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEY) {
        notifySubscribers({ type: 'STORAGE_SYNC', source: 'storage', at: nowIso() });
      }
    });
    storageListenerBound = true;
  }
}

function persistState(state, eventType, payload = {}) {
  state.meta.lastUpdated = nowIso();
  const storage = getStorage();
  storage?.setItem(STORAGE_KEY, JSON.stringify(state));

  const message = {
    type: eventType,
    storageKey: STORAGE_KEY,
    source: TAB_ID,
    at: state.meta.lastUpdated,
    payload
  };

  notifySubscribers(message);
  channel?.postMessage(message);
}

function commit(eventType, mutator) {
  const state = ensureState();
  const result = mutator(state);
  persistState(state, eventType, result);
  return clone(result);
}

function requireText(value, label) {
  const normalized = String(value || '').trim();
  if (!normalized) throw new Error(`${label} wajib diisi.`);
  return normalized;
}

function normalizeAccountNo(value) {
  return String(value || '').replace(/\D/g, '');
}

function normalizeAmount(value, label = 'Nominal') {
  const amount = Math.round(Number(value));
  if (!Number.isFinite(amount) || amount <= 0) throw new Error(`${label} harus lebih dari 0.`);
  return amount;
}

function getCustomerById(state, customerId) {
  return state.customers.find((customer) => customer.id === customerId) || null;
}

function getAccountByNo(state, accountNo) {
  const normalized = normalizeAccountNo(accountNo);
  return state.accounts.find((account) => normalizeAccountNo(account.accountNo) === normalized) || null;
}

function getCustomerAccounts(state, customerId) {
  return state.accounts.filter((account) => account.customerId === customerId);
}

function hydrateCustomer(state, customer) {
  return {
    ...customer,
    accounts: getCustomerAccounts(state, customer.id)
  };
}

function hydrateAccount(state, account) {
  const customer = getCustomerById(state, account.customerId);
  return {
    account: { ...account },
    customer: customer ? { ...customer } : null,
    accounts: customer ? getCustomerAccounts(state, customer.id) : []
  };
}

function assertActiveAccount(account) {
  if (!account) throw new Error('Nomor rekening tidak ditemukan.');
  if (account.status !== 'AKTIF') {
    throw new Error(`Rekening ${account.accountNo} berstatus ${account.status}. Hubungi Customer Service.`);
  }
}

function nextTransactionId(state) {
  state.meta.transactionSeq += 1;
  return `TRX-${todayCompact()}-${String(state.meta.transactionSeq).padStart(4, '0')}`;
}

function nextReference(state) {
  return `REF-${todayCompact()}-${String(state.meta.transactionSeq + 1).padStart(4, '0')}`;
}

function nextAccountNo(state) {
  state.meta.accountSeq += 1;
  return `100200${String(state.meta.accountSeq).padStart(4, '0')}`;
}

function nextCustomerId(state) {
  state.meta.customerSeq += 1;
  return `CST-${String(state.meta.customerSeq).padStart(3, '0')}`;
}

function nextTicketId(state) {
  state.meta.ticketSeq += 1;
  return `TCK-${String(state.meta.ticketSeq).padStart(3, '0')}`;
}

function nextQueue(state) {
  state.meta.queueSeq += 1;
  return {
    id: `QUE-${String(state.meta.queueSeq).padStart(3, '0')}`,
    number: `A${String(state.meta.queueSeq).padStart(3, '0')}`
  };
}

function buildTransaction(state, fields) {
  const id = nextTransactionId(state);

  return {
    id,
    reference: fields.reference || id.replace('TRX', 'REF'),
    timestamp: nowIso(),
    status: 'SUCCESS',
    channel: 'TELLER',
    officer: 'Bank Teller 01',
    fee: 0,
    tax: 0,
    totalDebit: 0,
    relatedAccountNo: null,
    ...fields
  };
}

function sortedTransactions(transactions) {
  return [...transactions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function isToday(timestamp) {
  return todayKey(timestamp) === todayKey();
}

function sum(items, selector) {
  return items.reduce((total, item) => total + selector(item), 0);
}

function publicState(state = ensureState()) {
  return clone(state);
}

export function getOperationalState() {
  return publicState();
}

export function subscribeOperationalStore(listener) {
  bindRealtimeListeners();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetOperationalState() {
  const state = createSeedState();
  persistState(state, 'RESET', {});
  return publicState(state);
}

export function searchCustomers(query, stateArg = ensureState()) {
  const state = stateArg;
  const needle = String(query || '').trim().toLowerCase();
  const accountNeedle = normalizeAccountNo(query);

  if (!needle) return state.customers.map((customer) => hydrateCustomer(state, customer));

  return state.customers
    .filter((customer) => {
      const accounts = getCustomerAccounts(state, customer.id);
      return [
        customer.id,
        customer.nik,
        customer.name,
        customer.email,
        customer.phone,
        customer.segment
      ].some((field) => String(field).toLowerCase().includes(needle)) ||
        accounts.some((account) => normalizeAccountNo(account.accountNo).includes(accountNeedle));
    })
    .map((customer) => hydrateCustomer(state, customer));
}

export function lookupAccount(accountNo, stateArg = ensureState()) {
  const account = getAccountByNo(stateArg, accountNo);
  return account ? clone(hydrateAccount(stateArg, account)) : null;
}

export function resolveCustomerLookup(query, stateArg = ensureState()) {
  const account = getAccountByNo(stateArg, query);
  if (account) {
    return {
      matchType: 'ACCOUNT',
      selectedAccountNo: account.accountNo,
      customer: hydrateCustomer(stateArg, getCustomerById(stateArg, account.customerId))
    };
  }

  const matches = searchCustomers(query, stateArg);
  if (!matches.length) {
    return {
      matchType: 'NONE',
      selectedAccountNo: null,
      customer: null
    };
  }

  return {
    matchType: 'CUSTOMER',
    selectedAccountNo: matches[0].accounts[0]?.accountNo || null,
    customer: matches[0]
  };
}

export function getCustomerDetail(customerId, stateArg = ensureState()) {
  const customer = getCustomerById(stateArg, customerId);
  return customer ? clone(hydrateCustomer(stateArg, customer)) : null;
}

export function getLedgerForAccount(accountNo, limit = 8, stateArg = ensureState()) {
  const normalized = normalizeAccountNo(accountNo);
  return sortedTransactions(
    stateArg.transactions.filter((entry) => normalizeAccountNo(entry.accountNo) === normalized)
  ).slice(0, limit);
}

export function getRecentLedger(limit = 10, stateArg = ensureState()) {
  return sortedTransactions(stateArg.transactions).slice(0, limit);
}

export function getTickets(stateArg = ensureState()) {
  const state = stateArg;
  return sortedTransactions(state.serviceTickets.map((ticket) => ({
    ...ticket,
    timestamp: ticket.updatedAt,
    customer: getCustomerById(state, ticket.customerId)
  })));
}

export function getQueue(stateArg = ensureState()) {
  const state = stateArg;
  const order = { CALLED: 0, WAITING: 1, DONE: 2 };
  return [...state.queue]
    .sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9) || new Date(a.createdAt) - new Date(b.createdAt))
    .map((item) => ({
      ...item,
      customer: getCustomerById(state, item.customerId)
    }));
}

export function getTellerSummary(stateArg = ensureState()) {
  const state = stateArg;
  const todays = state.transactions.filter((entry) => isToday(entry.timestamp) && entry.channel === 'TELLER');
  const deposits = todays.filter((entry) => entry.type === 'CASH_DEPOSIT');
  const withdrawals = todays.filter((entry) => entry.type === 'CASH_WITHDRAWAL');
  const transfers = todays.filter((entry) => entry.type === 'TRANSFER_OUT');

  return {
    drawerCash: state.tellerSession.drawerCash,
    drawerOpening: state.tellerSession.drawerOpening,
    depositCount: deposits.length,
    withdrawalCount: withdrawals.length,
    transferCount: transfers.length,
    depositVolume: sum(deposits, (entry) => entry.amount),
    withdrawalVolume: sum(withdrawals, (entry) => entry.amount),
    transferVolume: sum(transfers, (entry) => entry.amount),
    feeCollected: state.bankIncome.fees,
    taxCollected: state.bankIncome.taxes,
    totalTransactions: deposits.length + withdrawals.length + transfers.length
  };
}

export function getCustomerServiceSummary(stateArg = ensureState()) {
  const state = stateArg;
  return {
    totalCustomers: state.customers.length,
    activeAccounts: state.accounts.filter((account) => account.status === 'AKTIF').length,
    waitingQueue: state.queue.filter((item) => item.status === 'WAITING').length,
    openTickets: state.serviceTickets.filter((ticket) => ticket.status !== 'DONE').length,
    totalSavings: sum(state.accounts.filter((account) => account.status === 'AKTIF'), (account) => account.balance),
    lastUpdated: state.meta.lastUpdated
  };
}

export function depositCash({ accountNo, amount, note = '', officer = 'Bank Teller 01' }) {
  return commit('CASH_DEPOSIT', (state) => {
    const account = getAccountByNo(state, accountNo);
    assertActiveAccount(account);

    const nominal = normalizeAmount(amount);
    const balanceBefore = account.balance;
    account.balance += nominal;
    state.tellerSession.drawerCash += nominal;

    const transaction = buildTransaction(state, {
      type: 'CASH_DEPOSIT',
      description: note || 'Setor tunai di teller',
      accountNo: account.accountNo,
      customerId: account.customerId,
      amount: nominal,
      direction: 'CREDIT',
      balanceBefore,
      balanceAfter: account.balance,
      officer
    });

    state.transactions.unshift(transaction);
    return {
      transaction,
      account: clone(account),
      customer: clone(getCustomerById(state, account.customerId))
    };
  });
}

export function withdrawCash({ accountNo, amount, note = '', officer = 'Bank Teller 01' }) {
  return commit('CASH_WITHDRAWAL', (state) => {
    const account = getAccountByNo(state, accountNo);
    assertActiveAccount(account);

    const nominal = normalizeAmount(amount);
    if (account.balance < nominal) throw new Error('Saldo rekening tidak mencukupi untuk penarikan.');
    if (state.tellerSession.drawerCash < nominal) throw new Error('Kas teller tidak mencukupi untuk penarikan ini.');

    const balanceBefore = account.balance;
    account.balance -= nominal;
    state.tellerSession.drawerCash -= nominal;

    const transaction = buildTransaction(state, {
      type: 'CASH_WITHDRAWAL',
      description: note || 'Tarik tunai di teller',
      accountNo: account.accountNo,
      customerId: account.customerId,
      amount: nominal,
      totalDebit: nominal,
      direction: 'DEBIT',
      balanceBefore,
      balanceAfter: account.balance,
      officer
    });

    state.transactions.unshift(transaction);
    return {
      transaction,
      account: clone(account),
      customer: clone(getCustomerById(state, account.customerId))
    };
  });
}

export function transferFunds({ sourceAccountNo, targetAccountNo, amount, note = '', officer = 'Bank Teller 01' }) {
  return commit('TRANSFER_FUNDS', (state) => {
    const source = getAccountByNo(state, sourceAccountNo);
    const target = getAccountByNo(state, targetAccountNo);
    assertActiveAccount(source);
    assertActiveAccount(target);

    if (source.accountNo === target.accountNo) throw new Error('Rekening pengirim dan penerima tidak boleh sama.');

    const nominal = normalizeAmount(amount);
    const fee = Math.round(nominal * TRANSFER_RATES.fee);
    const tax = Math.round(nominal * TRANSFER_RATES.tax);
    const totalDebit = nominal + fee + tax;

    if (source.balance < totalDebit) {
      throw new Error('Saldo pengirim tidak cukup setelah biaya bank dan pajak.');
    }

    const reference = nextReference(state);
    const sourceBefore = source.balance;
    const targetBefore = target.balance;

    source.balance -= totalDebit;
    target.balance += nominal;
    state.bankIncome.fees += fee;
    state.bankIncome.taxes += tax;

    const sourceTx = buildTransaction(state, {
      reference,
      type: 'TRANSFER_OUT',
      description: note || `Transfer teller ke ${target.accountNo}`,
      accountNo: source.accountNo,
      customerId: source.customerId,
      relatedAccountNo: target.accountNo,
      amount: nominal,
      fee,
      tax,
      totalDebit,
      direction: 'DEBIT',
      balanceBefore: sourceBefore,
      balanceAfter: source.balance,
      officer
    });

    const targetTx = buildTransaction(state, {
      reference,
      type: 'TRANSFER_IN',
      description: note || `Transfer teller dari ${source.accountNo}`,
      accountNo: target.accountNo,
      customerId: target.customerId,
      relatedAccountNo: source.accountNo,
      amount: nominal,
      fee: 0,
      tax: 0,
      totalDebit: 0,
      direction: 'CREDIT',
      balanceBefore: targetBefore,
      balanceAfter: target.balance,
      officer
    });

    state.transactions.unshift(targetTx);
    state.transactions.unshift(sourceTx);

    return {
      transaction: sourceTx,
      targetTransaction: targetTx,
      sourceAccount: clone(source),
      targetAccount: clone(target),
      sourceCustomer: clone(getCustomerById(state, source.customerId)),
      targetCustomer: clone(getCustomerById(state, target.customerId))
    };
  });
}

export function createCustomerWithAccount({
  name,
  email,
  phone,
  nik,
  address,
  product = 'Tabungan Smart',
  initialDeposit = 0,
  officer = 'CS Officer 01'
}) {
  return commit('CUSTOMER_CREATED', (state) => {
    const customerName = requireText(name, 'Nama nasabah');
    const customerId = nextCustomerId(state);
    const accountNo = nextAccountNo(state);
    const deposit = Math.max(0, Math.round(Number(initialDeposit) || 0));

    const customer = {
      id: customerId,
      nik: String(nik || `TEMP-${customerId}`).trim(),
      name: customerName,
      email: String(email || '').trim(),
      phone: String(phone || '').trim(),
      address: String(address || '').trim(),
      segment: 'Retail',
      status: 'AKTIF',
      risk: 'LOW',
      joinedAt: todayKey()
    };

    const account = {
      accountNo,
      customerId,
      product,
      type: product.toLowerCase().includes('giro') ? 'GIRO' : 'TABUNGAN',
      balance: deposit,
      status: 'AKTIF',
      openedAt: todayKey(),
      branch: 'Digital Branch'
    };

    state.customers.push(customer);
    state.accounts.push(account);

    if (deposit > 0) {
      state.transactions.unshift(buildTransaction(state, {
        type: 'ACCOUNT_OPENING_DEPOSIT',
        description: 'Setoran awal pembukaan rekening',
        accountNo,
        customerId,
        amount: deposit,
        direction: 'CREDIT',
        balanceBefore: 0,
        balanceAfter: deposit,
        channel: 'CUSTOMER_SERVICE',
        officer
      }));
    }

    return { customer, account };
  });
}

export function updateCustomerContact({ customerId, email, phone, address, officer = 'CS Officer 01' }) {
  return commit('CUSTOMER_UPDATED', (state) => {
    const customer = getCustomerById(state, customerId);
    if (!customer) throw new Error('Nasabah tidak ditemukan.');

    if (email !== undefined) customer.email = String(email || '').trim();
    if (phone !== undefined) customer.phone = String(phone || '').trim();
    if (address !== undefined) customer.address = String(address || '').trim();

    const primaryAccount = getCustomerAccounts(state, customerId)[0];
    if (primaryAccount) {
      state.transactions.unshift(buildTransaction(state, {
        type: 'SERVICE_ADJUSTMENT',
        description: 'Update data kontak nasabah',
        accountNo: primaryAccount.accountNo,
        customerId,
        amount: 0,
        direction: 'INFO',
        balanceBefore: primaryAccount.balance,
        balanceAfter: primaryAccount.balance,
        channel: 'CUSTOMER_SERVICE',
        officer
      }));
    }

    return { customer: clone(customer) };
  });
}

export function unlockAccount({ accountNo, officer = 'CS Officer 01' }) {
  return commit('ACCOUNT_UNLOCKED', (state) => {
    const account = getAccountByNo(state, accountNo);
    if (!account) throw new Error('Nomor rekening tidak ditemukan.');
    account.status = 'AKTIF';

    state.transactions.unshift(buildTransaction(state, {
      type: 'ACCOUNT_UNLOCK',
      description: 'Rekening diaktifkan kembali oleh Customer Service',
      accountNo: account.accountNo,
      customerId: account.customerId,
      amount: 0,
      direction: 'INFO',
      balanceBefore: account.balance,
      balanceAfter: account.balance,
      channel: 'CUSTOMER_SERVICE',
      officer
    }));

    return {
      account: clone(account),
      customer: clone(getCustomerById(state, account.customerId))
    };
  });
}

export function createServiceTicket({ customerId, accountNo, category, priority, note, officer = 'CS Officer 01' }) {
  return commit('TICKET_CREATED', (state) => {
    const customer = getCustomerById(state, customerId);
    if (!customer) throw new Error('Pilih nasabah terlebih dahulu.');

    const selectedAccount = accountNo ? getAccountByNo(state, accountNo) : getCustomerAccounts(state, customerId)[0];
    const ticket = {
      id: nextTicketId(state),
      customerId,
      accountNo: selectedAccount?.accountNo || null,
      category: requireText(category, 'Kategori tiket'),
      priority: priority || 'NORMAL',
      status: 'OPEN',
      note: requireText(note, 'Catatan tiket'),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      officer
    };

    state.serviceTickets.unshift(ticket);
    return { ticket };
  });
}

export function updateServiceTicketStatus(ticketId, status) {
  return commit('TICKET_UPDATED', (state) => {
    const ticket = state.serviceTickets.find((item) => item.id === ticketId);
    if (!ticket) throw new Error('Tiket tidak ditemukan.');
    ticket.status = status;
    ticket.updatedAt = nowIso();
    return { ticket: clone(ticket) };
  });
}

export function addQueueItem({ customerId, service, notes = '' }) {
  return commit('QUEUE_CREATED', (state) => {
    const customer = getCustomerById(state, customerId);
    if (!customer) throw new Error('Pilih nasabah terlebih dahulu.');

    const queueIdentity = nextQueue(state);
    const item = {
      ...queueIdentity,
      customerId,
      service: requireText(service, 'Jenis layanan'),
      status: 'WAITING',
      notes: String(notes || '').trim(),
      createdAt: nowIso(),
      calledAt: null,
      completedAt: null
    };

    state.queue.unshift(item);
    return { item };
  });
}

export function updateQueueStatus(queueId, status) {
  return commit('QUEUE_UPDATED', (state) => {
    const item = state.queue.find((queueItem) => queueItem.id === queueId);
    if (!item) throw new Error('Data antrean tidak ditemukan.');

    item.status = status;
    if (status === 'CALLED') item.calledAt = nowIso();
    if (status === 'DONE') item.completedAt = nowIso();

    return { item: clone(item) };
  });
}
