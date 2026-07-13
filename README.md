# SmartBank Application

## 1. Pengenalan
Proyek **SmartBankTeam** adalah aplikasi perbankan digital yang mensimulasikan fitur-fitur perbankan komersial seperti transfer dana, pembayaran tagihan (bill payment), sistem pinjaman, hingga layanan operasional perbankan (CS dan Teller).

---

## 2. Arsitektur Proyek (Frontend & Backend)
Sistem ini menggunakan arsitektur *Client-Server* yang memisahkan proyek menjadi dua bagian utama:

### Frontend (FE)
- **Fungsi:** Berperan sebagai antarmuka pengguna (User Interface). Bagian ini adalah aplikasi visual yang langsung berinteraksi dengan nasabah maupun staf bank.
- **Isi & Teknologi:** Dibangun menggunakan teknologi web modern (HTML, CSS, JS / Framework khusus) yang bertugas meminta data dan mengirim instruksi ke Backend melalui jalur *HTTP Request*.
- **Kegunaan:** Menampilkan informasi saldo yang *user-friendly*, memfasilitasi navigasi halaman dashboard, menampilkan riwayat transaksi, serta menampung inputan pengguna saat melakukan transfer atau pengaduan masalah.

### Backend (BE)
- **Fungsi:** Bertindak sebagai mesin penggerak utama (*core banking system*) di belakang layar. Backend merahasiakan dan memproses semua logika bisnis, perhitung finansial, serta sistem keamanan.
- **Isi & Teknologi:** Dibangun menggunakan bahasa pemrograman **Go (Golang)** dengan bantuan *framework* **Fiber**. Di dalamnya terdapat konfigurasi koneksi *database*, pengaturan *routes* API, dan mekanisme pengamanan (CORS, JWT/Autentikasi).
- **Kegunaan:** Menerima *request* dari Frontend, mengeksekusi aturan bisnis (seperti memotong 3% *fee* transfer), memastikan saldo nasabah cukup, dan menyimpan perubahan secara permanen ke Database tanpa terjadi tumpang tindih data (*race condition*).

---

## 3. Struktur Database
Aplikasi menggunakan Relational Database yang dikonfigurasi melalui ORM (GORM). Beberapa struktur tabel utamanya meliputi:

- **Tabel `User`**: Menyimpan kredensial login (Email, Password), profil, dan *role* (seperti `user`, `admin`, `teller`). Tabel ini sangat krusial karena atribut **`Balance`** (saldo utama nasabah) disimpan langsung di sini dan selalu di-update setiap terjadi transaksi.
- **Tabel `Ledger`**: Berperan sebagai buku mutasi (histori transaksi). Menyimpan log pergerakan uang (`Type`, `Amount`, `FeeBank`, dll), mencatat ID pengirim dan penerima, serta status saldo sebelum dan sesudah transaksi (`BalanceBefore`, `BalanceAfter`).
- **Tabel `BankFee`**: Khusus mencatat pemasukan yang diperoleh bank dari berbagai layanan, seperti potongan *fee* transfer (3%) dan *admin fee* pembayaran tagihan.
- **Tabel `Loan` & `Installment`**: Digunakan untuk mengelola pinjaman nasabah beserta detil jadwal dan riwayat cicilan bulanan.
- **Tabel Operasional (`ServiceTicket`, `QueueItem`, `TellerSession`)**: Mengelola antrean, tiket *Customer Service*, serta sesi pembukuan laci kas teller.

---

## 4. Dokumentasi API (Swagger)
Proyek ini dilengkapi dengan dokumentasi REST API interaktif yang otomatis dibuat menggunakan Swagger. 
Pastikan backend berjalan (port default: 3000), lalu akses URL dokumentasi berikut di browser:

🔗 **http://localhost:3000/swagger/**

Melalui Swagger, pengembang tim Frontend bisa langsung mencoba API *(Transfer, Auth, Payment)* tanpa menggunakan aplikasi pihak ketiga seperti Postman.

---

## 5. Variasi Temuan Masalah Kode di SOLID
Berdasarkan penelusuran arsitektur kode pada Backend (khususnya *controllers* seperti `transaction.go` dan `payment.go`), ditemukan beberapa gaya penulisan yang menyalahi **Prinsip SOLID**:

### A. Pelanggaran *Single Responsibility Principle* (SRP)
- **Temuan:** Sebuah fungsi *controller* (misal: fungsi `Transfer`) menangani terlalu banyak jenis tugas sekaligus. Fungsi tersebut bertugas melakukan parsing HTTP Request, menghitung *fee* bank (*business logic*), menembak perintah SQL/ORM langsung ke database, mengatur transaksi *Locking*, hingga membuat objek JSON untuk dikirim kembali.
- **Dampak:** *Controller* menjadi sangat gemuk (*fat controller*) dan berisiko saat ada perbaikan kode. 
- **Saran:** Logika perhitungan (kalkulasi *fee*, validasi limit) harus dipisah ke file *Service*, sedangkan interaksi DB dipisah ke *Repository/Model*. *Controller* cukup bertugas membalas HTTP Response saja.

### B. Pelanggaran *Dependency Inversion Principle* (DIP)
- **Temuan:** Di dalam *controller*, kode secara *hardcode* bergantung kepada implementasi konkrit koneksi Database global, yaitu pemanggilan langsung ke `database.DB.Begin()`. 
- **Dampak:** Tidak memungkinkan untuk melakukan **Unit Testing** pada *controller* secara terisolasi tanpa benar-benar menembak ke *database* fisik.
- **Saran:** Pemanggilan *database* harusnya di-injeksi menggunakan mekanisme *Dependency Injection* atau berwujud *Interface*, agar mudah disuntikkan objek tiruan (*Mock Database*) ketika masa pengujian/testing.

### C. Potensi Pelanggaran *Open/Closed Principle* (OCP)
- **Temuan:** Pada fitur pembayaran tagihan (di `payment.go`), penentuan biaya admin (*admin fee*) dan logika kategorinya masih berdekatan dengan *flow* utama. Jika nantinya bank bekerjasama dengan banyak pihak penagih baru (PLN, PDAM, Tiket Pesawat) yang aturannya bermacam-macam, developer akan terus merombak file/blok tersebut dengan `if-else` bertingkat.
- **Saran:** Modul tagihan sebaiknya terbuka untuk di-*extend* (ditambah tipe *biller* baru) tetapi tertutup untuk modifikasi (*closed for modification*) dari proses bayar utamanya, misalnya dengan menggunakan *Strategy Design Pattern*.
