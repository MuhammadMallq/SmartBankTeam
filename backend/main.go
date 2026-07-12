package main

import (
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/swagger"
	"golang.org/x/crypto/bcrypt"

	"smartbank-backend/database"
	"smartbank-backend/models"
	"smartbank-backend/routes"

	_ "smartbank-backend/docs" // Import swagger docs
)

// @title SmartBank API
// @version 1.0
// @description REST API for SmartBank Application
// @host localhost:3000
// @BasePath /
// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name Authorization
func main() {
	database.ConnectDB()

	// Seed data
	seedNews()
	seedHighAssetUsers()

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*", // In production, this should be specific origins
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	// Swagger route
	app.Get("/swagger/*", swagger.HandlerDefault)

	// Setup Routes
	routes.SetupRoutes(app)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(app.Listen(":" + port))
}

func seedNews() {
	var count int64
	database.DB.Model(&models.News{}).Count(&count)
	if count > 0 {
		return // only seed if empty
	}

	database.DB.Exec("DELETE FROM news")
	database.DB.Create(&models.News{
		ID:        "NEWS-01",
		Title:     "Rupiah Melemah, Pabrik Tahu di Cianjur Mulai Berguguran",
		Summary:   "Pelemahan nilai tukar rupiah terhadap dolar AS berdampak langsung pada industri kecil. Pabrik tahu di Cianjur mulai gulung tikar akibat harga kedelai impor melonjak.",
		Source:    "detikJabar",
		Url:       "https://www.detik.com/jabar/bisnis/d-8521644/rupiah-melemah-pabrik-tahu-di-cianjur-mulai-berguguran",
		Timestamp: time.Now(),
	})
	database.DB.Create(&models.News{
		ID:        "NEWS-02",
		Title:     "Benarkah RI Menuju Krisis Seperti 1998?",
		Summary:   "Pelemahan rupiah memicu kekhawatiran publik akan krisis ekonomi. Ekonom menganalisis perbedaan kondisi saat ini dengan krisis moneter 1998.",
		Source:    "detikFinance",
		Url:       "https://finance.detik.com/berita-ekonomi-bisnis/d-8520483/benarkah-ri-menuju-krisis-seperti-1998",
		Timestamp: time.Now().Add(-2 * time.Hour),
	})
	database.DB.Create(&models.News{
		ID:        "NEWS-03",
		Title:     "Hasil Koordinasi Pemerintah-BI-DPR agar Rupiah Kuat Lagi",
		Summary:   "Pemerintah, Bank Indonesia, dan DPR menggelar rapat koordinasi untuk membahas langkah-langkah strategis memperkuat nilai tukar rupiah.",
		Source:    "detikNews",
		Url:       "https://news.detik.com/berita/d-8520993/hasil-koordinasi-pemerintah-bi-dpr-agar-rupiah-kuat-lagi",
		Timestamp: time.Now().Add(-5 * time.Hour),
	})
	database.DB.Create(&models.News{
		ID:        "NEWS-04",
		Title:     "Begini Janji Purbaya ke Penjual Tahu-Tempe yang Terdampak Dolar",
		Summary:   "Menteri Keuangan Purbaya Yudhi Sadewa memberikan janji kepada para pelaku UMKM tahu dan tempe yang terdampak penguatan dolar AS.",
		Source:    "detikFinance",
		Url:       "https://finance.detik.com/bursa-dan-valas/d-8520644/begini-janji-purbaya-ke-penjual-tahu-tempe-yang-terdampak-penguatan-dolar-as",
		Timestamp: time.Now().Add(-12 * time.Hour),
	})
	database.DB.Create(&models.News{
		ID:        "NEWS-05",
		Title:     "Larang Transaksi Pakai USD di Pelabuhan, Purbaya: Kita Cinta Rupiah",
		Summary:   "Pemerintah melarang penggunaan dolar AS dalam transaksi di pelabuhan domestik sebagai langkah memperkuat kedaulatan mata uang rupiah.",
		Source:    "detikKalimantan",
		Url:       "https://www.detik.com/kalimantan/bisnis/d-8520708/larang-transaksi-pakai-usd-di-pelabuhan-purbaya-kita-cinta-rupiah",
		Timestamp: time.Now().Add(-24 * time.Hour),
	})
	database.DB.Create(&models.News{
		ID:        "NEWS-06",
		Title:     "Harga Kedelai Melonjak, Polres Cianjur Awasi Penimbunan",
		Summary:   "Menyusul pelemahan rupiah, harga kedelai melonjak tajam. Polres Cianjur turun tangan mengawasi potensi penimbunan bahan baku tahu dan tempe.",
		Source:    "detikJabar",
		Url:       "https://www.detik.com/jabar/hukum-dan-kriminal/d-8521677/harga-kedelai-melonjak-polres-cianjur-awasi-penimbunan",
		Timestamp: time.Now().Add(-48 * time.Hour),
	})
}

func seedHighAssetUsers() {
	var count int64
	database.DB.Model(&models.User{}).Where("id LIKE 'NSB-%'").Count(&count)

	if count > 0 {
		return // sudah di-seed sebelumnya
	}

	nasabah := []models.User{
		{ID: "NSB-001", Name: "Hendra Wijaya", Email: "hendra.wijaya@gmail.com", Password: "pass001", Role: "user", Balance: 25000000, Status: "verified"},
		{ID: "NSB-002", Name: "Rina Kartika", Email: "rina.kartika@yahoo.com", Password: "pass002", Role: "user", Balance: 18500000, Status: "verified"},
		{ID: "NSB-003", Name: "Agus Prabowo", Email: "agus.prabowo@outlook.com", Password: "pass003", Role: "user", Balance: 12000000, Status: "verified"},
		{ID: "NSB-004", Name: "Dewi Lestari", Email: "dewi.lestari@gmail.com", Password: "pass004", Role: "user", Balance: 9750000, Status: "verified"},
		{ID: "NSB-005", Name: "Bambang Sutrisno", Email: "bambang.s@smartbank.id", Password: "pass005", Role: "user", Balance: 7500000, Status: "verified"},
		{ID: "NSB-006", Name: "Sari Rahmawati", Email: "sari.rahma@gmail.com", Password: "pass006", Role: "user", Balance: 6200000, Status: "verified"},
		{ID: "NSB-007", Name: "Joko Susanto", Email: "joko.susanto@yahoo.com", Password: "pass007", Role: "user", Balance: 5000000, Status: "verified"},
		{ID: "NSB-008", Name: "Anita Permata", Email: "anita.permata@outlook.com", Password: "pass008", Role: "user", Balance: 3800000, Status: "verified"},
		{ID: "NSB-009", Name: "Rizky Firmansyah", Email: "rizky.f@gmail.com", Password: "pass009", Role: "user", Balance: 2500000, Status: "verified"},
		{ID: "NSB-010", Name: "Putri Handayani", Email: "putri.h@smartbank.id", Password: "pass010", Role: "user", Balance: 1750000, Status: "verified"},
		{ID: "NSB-011", Name: "Wahyu Nugroho", Email: "wahyu.n@gmail.com", Password: "pass011", Role: "user", Balance: 1200000, Status: "verified"},
		{ID: "NSB-012", Name: "Mega Safitri", Email: "mega.safitri@yahoo.com", Password: "pass012", Role: "user", Balance: 950000, Status: "verified"},
		{ID: "NSB-013", Name: "Dian Prasetyo", Email: "dian.prasetyo@outlook.com", Password: "pass013", Role: "user", Balance: 750000, Status: "verified"},
		{ID: "NSB-014", Name: "Fajar Hidayat", Email: "fajar.h@gmail.com", Password: "pass014", Role: "user", Balance: 500000, Status: "verified"},
		{ID: "NSB-015", Name: "Lina Marlina", Email: "lina.marlina@smartbank.id", Password: "pass015", Role: "user", Balance: 350000, Status: "verified"},
		{ID: "NSB-016", Name: "Arief Rahman", Email: "arief.rahman@gmail.com", Password: "pass016", Role: "user", Balance: 250000, Status: "verified"},
		{ID: "NSB-017", Name: "Yuni Astuti", Email: "yuni.astuti@yahoo.com", Password: "pass017", Role: "user", Balance: 180000, Status: "verified"},
		{ID: "NSB-018", Name: "Eko Prasetya", Email: "eko.prasetya@outlook.com", Password: "pass018", Role: "user", Balance: 2200000, Status: "verified"},
		{ID: "NSB-019", Name: "Nadia Kumalasari", Email: "nadia.k@gmail.com", Password: "pass019", Role: "user", Balance: 1850000, Status: "verified"},
		{ID: "NSB-020", Name: "Taufik Ismail", Email: "taufik.ismail@smartbank.id", Password: "pass020", Role: "user", Balance: 3120000, Status: "verified"},
	}

	for i, n := range nasabah {
		hashed, _ := bcrypt.GenerateFromPassword([]byte(n.Password), bcrypt.DefaultCost)
		nasabah[i].Password = string(hashed)
		database.DB.Create(&nasabah[i])
	}
}
