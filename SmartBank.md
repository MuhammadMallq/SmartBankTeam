# SmartBank (Core) — Tugas Besar RPL 2

**Dosen:** M. Yusril Helmi Setyawan, S.Kom., M.Kom.

---

## Deskripsi Aplikasi

SmartBank adalah inti sistem ekonomi yang menjadi satu-satunya otoritas untuk seluruh transaksi keuangan. Semua pembayaran dari aplikasi lain harus diproses melalui SmartBank. Sistem ini mengelola saldo, transfer, pembayaran, pajak/fee, pinjaman, dan pencatatan ledger sebagai **single source of truth**.

| Aspek | Keterangan |
|---|---|
| **Peran dalam Ekosistem** | Regulator & payment processor; pengendali money flow dan money supply |
| **Input Utama** | `payment_request` (from_app, from_user, to_user/service, amount, metadata), `loan_request` |
| **Output Utama** | Status transaksi, bukti pembayaran, update saldo, ledger entry |
| **Interaksi** | Menerima request dari Marketplace, POS, SupplierHub, LogistiKita via API Gateway; menyediakan data ke UMKM Insight (read-only) |
| **Batasan Scope** | Tidak mengelola katalog produk, stok, atau pengiriman — hanya keuangan dan ledger |

---

## Kebutuhan Fungsional

### 1. Registrasi & Login User

**Deskripsi:** User dapat membuat akun dan login menggunakan JWT authentication.

- **Input:** `user_id`, parameter terkait registrasi & login
- **Proses:** Validasi input → proses registrasi/login → simpan hasil
- **Output:** Status + data hasil registrasi/login
- **Endpoint:** `POST /smartbank/registrasi_&_login_user`
- **Ketentuan:** Gunakan MVC / Clean Code, validasi semua input, gunakan JSON

---

### 2. Manajemen Saldo

**Deskripsi:** Menampilkan saldo dan riwayat transaksi.

- **Input:** `user_id`, parameter terkait manajemen saldo
- **Proses:** Validasi input → ambil data saldo & riwayat → simpan hasil
- **Output:** Status + data saldo & riwayat transaksi
- **Endpoint:** `GET /smartbank/manajemen_saldo`
- **Ketentuan:** Gunakan MVC / Clean Code, validasi semua input, gunakan JSON

---

### 3. Transfer Antar User

**Deskripsi:** Transfer saldo antar user dalam sistem.

- **Input:** `user_id`, parameter terkait transfer antar user
- **Proses:** Validasi input → proses transfer (debit/kredit) → simpan hasil
- **Output:** Status + data hasil transfer
- **Endpoint:** `POST /smartbank/transfer_antar_user`
- **Ketentuan:** Gunakan MVC / Clean Code, validasi semua input, wajib integrasi SmartBank, gunakan JSON

---

### 4. Pembayaran Transaksi

**Deskripsi:** Memproses pembayaran dari semua aplikasi dalam ekosistem.

- **Input:** `user_id`, parameter terkait pembayaran transaksi
- **Proses:** Validasi input → proses debit/kredit → distribusi dana → simpan hasil
- **Output:** Status + bukti pembayaran
- **Endpoint:** `POST /smartbank/pembayaran_transaksi`
- **Ketentuan:** Gunakan MVC / Clean Code, validasi semua input, wajib integrasi SmartBank, gunakan JSON

---

### 5. Pinjaman (Loan)

**Deskripsi:** User dapat mengajukan pinjaman ke sistem bank.

- **Input:** `user_id`, parameter terkait pinjaman
- **Proses:** Validasi input → cek limit pinjaman → proses pencairan → simpan hasil
- **Output:** Status + data hasil pinjaman
- **Endpoint:** `POST /smartbank/pinjaman_(loan)`
- **Ketentuan:** Gunakan MVC / Clean Code, validasi semua input, wajib integrasi SmartBank, gunakan JSON

---

### 6. Pajak & Biaya

**Deskripsi:** Memotong pajak dari setiap transaksi secara otomatis.

- **Input:** `user_id`, parameter terkait pajak & biaya
- **Proses:** Validasi input → hitung & potong pajak → simpan hasil
- **Output:** Status + data potongan pajak
- **Endpoint:** `POST /smartbank/pajak_&_biaya`
- **Ketentuan:** Gunakan MVC / Clean Code, validasi semua input, wajib integrasi SmartBank, gunakan JSON

---

### 7. Ledger Transaksi

**Deskripsi:** Mencatat seluruh transaksi sebagai single source of truth.

- **Input:** `user_id`, parameter terkait ledger transaksi
- **Proses:** Validasi input → catat entri ledger → simpan hasil
- **Output:** Status + ledger entry
- **Endpoint:** `GET /smartbank/ledger_transaksi`
- **Ketentuan:** Gunakan MVC / Clean Code, validasi semua input, gunakan JSON

---

### 8. Biaya Layanan Bank

**Deskripsi:** Potongan biaya untuk setiap transaksi sebagai fee bank.

- **Input:** `user_id`, parameter terkait biaya layanan bank
- **Proses:** Validasi input → hitung & potong fee bank → simpan hasil
- **Output:** Status + data potongan fee bank
- **Endpoint:** `POST /smartbank/biaya_layanan_bank`
- **Ketentuan:** Gunakan MVC / Clean Code, validasi semua input, wajib integrasi SmartBank, gunakan JSON

---

## Aturan Keuangan SmartBank

| No | Aturan | Nilai | Deskripsi |
|---|---|---|---|
| 1 | Total Money Supply | 1.000.000.000 | Batas maksimal uang dalam sistem |
| 2 | Saldo Awal User | 50.000 | Saldo awal tiap user |
| 3 | Distribusi Awal ke User | ≤ 2% dari total supply | Sebagian kecil uang beredar di awal |
| 4 | Bank Reserve | ≥ 98% | Sisa uang disimpan di SmartBank |
| 5 | Fee Bank | 1% | Biaya transaksi SmartBank |
| 6 | Pajak Sistem | 2% | Potongan tambahan per transaksi (money sink) |
| 7 | Bunga Pinjaman | 10% | Bunga loan dari bank |
| 8 | Limit Pinjaman | 100.000/user | Batas maksimal pinjaman per user |
| 9 | Cooldown Transaksi | 10–30 detik | Jeda antar transaksi |
| 10 | Max Transaksi Harian | 10 transaksi | Batas aktivitas per user per hari |
| 11 | Stimulus Bank | 5.000/minggu (opsional) | Insentif ekonomi, mencegah deflasi |
| 12 | Distribusi Uang | Mingguan | Penambahan uang terkontrol |

---

## Aturan Pengerjaan (Relevan untuk SmartBank)

1. **SmartBank sebagai pusat kontrol** — Semua transaksi keuangan hanya diproses oleh SmartBank. Aplikasi lain tidak boleh mengubah saldo secara langsung.
2. **Alur = Input → Proses → Output** — Semua fitur harus mengikuti pola IPO.
3. **Semua output transaksi = payment request** — Setiap transaksi menghasilkan request ke SmartBank.
4. **Wajib melalui API Gateway** — Semua komunikasi antar aplikasi harus melalui gateway.
5. **Validasi & Logging wajib** — Setiap request harus divalidasi (JWT) dan dicatat.
6. **Tidak ada uang dibuat bebas** — Saldo hanya berubah lewat SmartBank.
7. **Semua layanan berbayar** — Setiap fitur memiliki fee atau biaya layanan.
8. **Setiap endpoint = kontrak sistem** — Endpoint API harus jelas dan konsisten.

---

## Dokumentasi yang Harus Dibuat

| No | Bagian Dokumen | Isi |
|---|---|---|
| 1 | Deskripsi Aplikasi | Tujuan aplikasi, peran dalam ekosistem, stakeholder |
| 2 | Use Case / Fitur Utama | Daftar 8 fitur SmartBank sesuai pembagian tugas |
| 3 | Diagram Arsitektur | Diagram alur sistem (block/graphviz) |
| 4 | Flow Proses (IPO) | Input-Proses-Output tiap fitur utama |
| 5 | API Endpoint | Daftar endpoint (method, URL, request, response) |
| 6 | Integrasi SmartBank | Bagaimana semua aplikasi terhubung ke SmartBank |
| 7 | Desain Database | Tabel utama + relasi sederhana |
| 8 | Mekanisme Transaksi | Alur pembayaran, fee, dan pajak |
| 9 | UI Sederhana | Mockup atau screenshot tampilan utama |
| 10 | Skenario Pengujian | Test case (input vs expected output) |
| 11 | Kendala & Solusi | Masalah yang dihadapi dan cara mengatasinya |
| 12 | Dokumentasi Tim | Pembagian tugas anggota kelompok |