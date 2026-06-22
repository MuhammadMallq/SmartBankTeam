# Laporan Kendala dan Solusi (SmartBank)

Dokumen ini berisi rangkuman kendala teknis dan logis yang dihadapi selama proses pengembangan sistem backend dan frontend **SmartBank** (Tugas Besar RPL 2), beserta solusi yang telah diimplementasikan untuk mengatasinya.

---

## 1. Migrasi Arsitektur Backend dan Konfigurasi Database
**Kendala:**
Pada tahap awal, aplikasi masih menggunakan data statis berbasis file JSON (*dummy data*). Hal ini menyulitkan pengelolaan *state*, relasi data yang kompleks (seperti riwayat transaksi dan *ledger*), serta tidak memenuhi standar aplikasi skala produksi. Transisi menuju sistem berbasis database relasional dengan tetap menjaga kestabilan *endpoint* yang sudah ada menjadi tantangan tersendiri.

**Solusi:**
Melakukan perombakan (*refactoring*) arsitektur backend dengan menggunakan framework **Go Fiber** agar lebih efisien dan terstruktur (*Clean Code/MVC*). Sistem kemudian diintegrasikan dengan database persisten (PostgreSQL/MySQL) menggunakan ORM untuk mengelola manipulasi data. Seluruh *endpoint* fetching data (seperti manajemen saldo dan dashboard) diubah untuk mengambil data mutakhir langsung dari database, sehingga menghilangkan *hardcoded stubs*.

---

## 2. Implementasi Role-Based Access Control (RBAC) dan Keamanan JWT
**Kendala:**
Ditemukan isu kritis pada middleware otorisasi (*JWT Role Authorization*). Sistem gagal melakukan validasi tingkatan peran (*role*), di mana sebuah *token* yang digenerate untuk akun dengan *role* `user` biasa masih bisa mengakses *endpoint* terbatas yang diperuntukkan bagi peran administratif (seperti Admin, Teller, atau Manager).

**Solusi:**
Melakukan penelusuran (*troubleshooting*) mendalam terhadap logika pada `middleware.JWTProtected`. Memperbaiki alur ekstraksi klaim (*claims*) dari JWT dan menambahkan validasi peran yang ketat. Jika peran pengguna yang terkandung di dalam *token* tidak sesuai dengan *role* yang disyaratkan oleh sebuah rute (misalnya `/admin/*`), maka permintaan akan langsung ditolak dengan status HTTP 403 (Forbidden) atau HTTP 401 (Unauthorized).

---

## 3. Pengujian Terintegrasi (API Endpoint Testing)
**Kendala:**
Aplikasi SmartBank memiliki proses bisnis yang sangat ketat (kewajiban pemotongan pajak, biaya layanan, dan pencatatan *ledger* sebagai *single source of truth*). Memverifikasi fungsionalitas, akurasi kalkulasi, dan keamanan dari berbagai *endpoint* ini secara manual sangat rawan *human-error* dan memakan banyak waktu.

**Solusi:**
Melakukan otomasi pengujian menggunakan **Postman**. Tim menyusun *Postman Collection* (`SmartBank_Postman_Collection.json`) yang komprehensif, mencakup *test suites* mulai dari proses Autentikasi (Registrasi & Login), Manajemen Saldo, Transfer, hingga Pajak dan Pinjaman. Pengujian difokuskan pada pemastian respons HTTP (*status code*), keabsahan token JWT pada *header*, serta integritas payload respons JSON.

---

## 4. Implementasi Dokumentasi API Berbasis Swagger
**Kendala:**
Karena SmartBank difungsikan sebagai API Gateway / Payment Processor untuk berbagai layanan dalam ekosistem (Marketplace, POS, dsb.), ketiadaan dokumentasi API yang interaktif menyulitkan proses integrasi eksternal. Tantangannya adalah mengonfigurasi anotasi pada sintaks Go secara presisi agar Swagger dapat mendeteksi struktur *request*, *response*, dan kebutuhan otorisasi (Bearer Token).

**Solusi:**
Menginstal dependensi *swag* untuk Go Fiber. Menyisipkan komentar anotasi metadata (metode HTTP, deskripsi, *params*, dan model *response*) pada file `main.go`, `router.go`, serta masing-masing *controller/handler*. Setelah itu, menjalankan perintah `swag init` untuk men-generate pustaka dokumentasi secara otomatis dan mengeksposnya melalui rute Swagger UI yang dapat diakses langsung via *browser*.

---

## 5. Penyelarasan Fungsionalitas dan Tampilan Frontend
**Kendala:**
Ada kebutuhan untuk mengubah antarmuka dasbor Admin menjadi lebih modern (*high-tech*) untuk menonjolkan peran sentralnya sebagai pemantau sistem, sekaligus membenahi beberapa fitur *routing* dan penanganan *error* di sisi antarmuka klien (seperti merespons *error* "Akun Anda bukan admin" dan restrukturisasi laman profil/ganti password).

**Solusi:**
Mengimplementasikan *Color Palette* dan panduan UI (*styling* modern) yang baru, serta merapikan komponen dasbor manajer dan login. Fitur ganti *password* dievaluasi ulang (dan dihapus/dimodifikasi sesuai kebutuhan terbaru), serta menambahkan logika *conditional rendering* di sisi klien untuk menangkap respons *error* dari *backend* dan menampilkannya sebagai pesan *alert/feedback* yang *user-friendly*.
