package main

import (
	"fmt"
	"log"
	"time"
	"smartbank-backend/database"
	"smartbank-backend/models"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

type DashboardData struct {
	User      models.User       `json:"user"`
	Admin     models.User       `json:"admin"`
	Manager   models.User       `json:"manager"`
	Teller    models.User       `json:"teller"`
	Operator  models.User       `json:"operator"`
	Contacts  []models.User     `json:"contacts"`
	Dashboard map[string]interface{} `json:"dashboard"`
	Ledger    []models.Ledger   `json:"ledger"`
	BankFees  map[string]interface{} `json:"bankFees"`
	News      []models.News     `json:"news"`
}

func main() {
	database.ConnectDB()
	database.DB.Exec("UPDATE users SET balance = balance + 50000 WHERE role IN ('user', 'contact') AND balance <= 0")
	seedNews()
	seedHighAssetUsers()

	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	app.Get("/api/dashboard/data", func(c *fiber.Ctx) error {
		var users []models.User
		database.DB.Find(&users)

		var data DashboardData
		data.Contacts = []models.User{}

		reqUserId := c.Query("userId", "USR-00142")

		for _, u := range users {
			switch u.Role {
			case "admin":
				data.Admin = u
			case "manager":
				data.Manager = u
			case "teller":
				data.Teller = u
			case "operator":
				data.Operator = u
			}
			
			if u.ID == reqUserId {
				data.User = u
			} else if u.Role == "contact" || u.Role == "user" {
				data.Contacts = append(data.Contacts, u)
			}
		}

		var ledgers []models.Ledger
		database.DB.Find(&ledgers)
		data.Ledger = ledgers

		var fees []models.BankFee
		database.DB.Find(&fees)

		// Calculate daily usage, income, expense, and history from ledgers
		usedTx := 0
		income := 0.0
		expense := 0.0
		history := []map[string]interface{}{}
		
		for i := len(ledgers) - 1; i >= 0; i-- {
			l := ledgers[i]
			isParticipant := false
			amountDisplay := 0.0

			if l.ToUser == data.User.ID {
				income += l.Amount
				amountDisplay = l.Amount
				isParticipant = true
			}
			if l.FromUser == data.User.ID {
				expense += l.TotalDeduction
				amountDisplay = -l.TotalDeduction
				isParticipant = true
				if l.Timestamp.Day() == time.Now().Day() {
					usedTx++
				}
			}

			if isParticipant {
				// formatted time
				tStr := l.Timestamp.Format("15:04")
				if l.Timestamp.IsZero() {
					tStr = "00:00"
				}
				history = append(history, map[string]interface{}{
					"id":     l.ID,
					"title":  l.Description,
					"app":    l.App,
					"time":   tStr,
					"status": l.Status,
					"amount": amountDisplay,
				})
			}
		}

		// Create dashboard stub
		data.Dashboard = map[string]interface{}{
			"balance": data.User.Balance,
			"dailyTransactions": map[string]interface{}{
				"used": usedTx, "max": 10, "remaining": 10 - usedTx,
			},
			"activeLoan": map[string]interface{}{
				"amount": income, "info": "Total Pemasukan",
			},
			"monthlyFee": map[string]interface{}{
				"amount": expense, "info": "Total Pengeluaran",
			},
			"history": history,
		}

		// Create bankfees stub
		data.BankFees = map[string]interface{}{
			"totalFeeCollected": 2060,
			"totalTaxCollected": 2900,
			"totalCollected":    4960,
			"feeRate":           0.01,
			"taxRate":           0.02,
			"transactionsCharged": 14,
			"entries": fees,
		}

		// Fetch News
		var news []models.News
		database.DB.Order("timestamp desc").Find(&news)
		data.News = news

		return c.JSON(data)
	})

	app.Post("/api/transfer", func(c *fiber.Ctx) error {
		var req struct {
			Amount float64 `json:"amount"`
			ToUser string  `json:"to_user"`
			FromUser string `json:"from_user"`
			ToName string `json:"to_name"`
		}
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
		}

		// Calculate fees (3%)
		feeBank := req.Amount * 0.03
		totalDeduction := req.Amount + feeBank
		fromUser := req.FromUser
		if fromUser == "" {
			fromUser = "USR-00142"
		}

		// Create ledger record
		ledger := models.Ledger{
			ID:             fmt.Sprintf("TRF-%d", time.Now().Unix()%1000000),
			Timestamp:      time.Now(),
			Type:           "TRANSFER_OUT",
			Description:    "Transfer ke " + req.ToName,
			App:            "SmartBank",
			FromUser:       fromUser,
			ToUser:         req.ToUser,
			Amount:         req.Amount,
			FeeBank:        feeBank,
			TotalDeduction: totalDeduction,
			Status:         "SUCCESS",
		}
		database.DB.Create(&ledger)

		// Create bank fee record
		fee := models.BankFee{
			ID:                fmt.Sprintf("FEE-%d", time.Now().Unix()%1000000),
			LedgerRef:         ledger.ID,
			Timestamp:         time.Now(),
			Description:       "Transfer Fee",
			Type:              "TRANSFER_OUT",
			TransactionAmount: req.Amount,
			FeeAmount:         feeBank,
			TotalCharge:       feeBank,
			Status:            "COLLECTED",
		}
		database.DB.Create(&fee)

		// Deduct user balance and add to recipient
		database.DB.Exec("UPDATE users SET balance = balance - ? WHERE id = ?", totalDeduction, fromUser)
		database.DB.Exec("UPDATE users SET balance = balance + ? WHERE id = ?", req.Amount, req.ToUser)

		return c.JSON(fiber.Map{"status": "success"})
	})

	// ===== ADMIN API ENDPOINTS =====

	// Get all users from DB
	app.Get("/api/admin/users", func(c *fiber.Ctx) error {
		var users []models.User
		database.DB.Find(&users)
		return c.JSON(users)
	})

	// Get all ledger entries from DB
	app.Get("/api/admin/ledgers", func(c *fiber.Ctx) error {
		var ledgers []models.Ledger
		database.DB.Order("timestamp desc").Find(&ledgers)
		return c.JSON(ledgers)
	})

	// Get all bank fees from DB
	app.Get("/api/admin/fees", func(c *fiber.Ctx) error {
		var fees []models.BankFee
		database.DB.Find(&fees)
		return c.JSON(fees)
	})

	// Get admin dashboard stats
	app.Get("/api/admin/stats", func(c *fiber.Ctx) error {
		var totalUsers int64
		database.DB.Model(&models.User{}).Where("role IN ?", []string{"user", "contact"}).Count(&totalUsers)

		var totalBalance float64
		database.DB.Model(&models.User{}).Where("role IN ?", []string{"user", "contact"}).Select("COALESCE(SUM(balance),0)").Scan(&totalBalance)

		var totalTransactions int64
		database.DB.Model(&models.Ledger{}).Count(&totalTransactions)

		var totalFees float64
		database.DB.Model(&models.BankFee{}).Select("COALESCE(SUM(fee_amount),0)").Scan(&totalFees)

		return c.JSON(fiber.Map{
			"totalUsers":        totalUsers,
			"totalBalance":      totalBalance,
			"totalTransactions": totalTransactions,
			"totalFeesCollected": totalFees,
		})
	})
	// Get all news
	app.Get("/api/news", func(c *fiber.Ctx) error {
		var news []models.News
		database.DB.Order("timestamp desc").Find(&news)
		return c.JSON(news)
	})

	// Update user role
	app.Put("/api/admin/users/:id/role", func(c *fiber.Ctx) error {
		userId := c.Params("id")
		var body struct {
			Role string `json:"role"`
		}
		if err := c.BodyParser(&body); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
		}
		result := database.DB.Model(&models.User{}).Where("id = ?", userId).Update("role", body.Role)
		if result.RowsAffected == 0 {
			return c.Status(404).JSON(fiber.Map{"error": "User not found"})
		}
		return c.JSON(fiber.Map{"status": "success"})
	})

	// Toggle user status (verified / suspended)
	app.Put("/api/admin/users/:id/status", func(c *fiber.Ctx) error {
		userId := c.Params("id")
		var user models.User
		if err := database.DB.First(&user, "id = ?", userId).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "User not found"})
		}
		newStatus := "suspended"
		if user.Status == "suspended" {
			newStatus = "verified"
		}
		database.DB.Model(&user).Update("status", newStatus)
		return c.JSON(fiber.Map{"status": "success", "new_status": newStatus})
	})

	// Create new user (admin registration)
	app.Post("/api/admin/users", func(c *fiber.Ctx) error {
		var body struct {
			Name     string `json:"name"`
			Email    string `json:"email"`
			Password string `json:"password"`
			Role     string `json:"role"`
		}
		if err := c.BodyParser(&body); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
		}
		newId := fmt.Sprintf("USR-%d", time.Now().Unix()%100000)
		newUser := models.User{
			ID:       newId,
			Name:     body.Name,
			Email:    body.Email,
			Password: body.Password,
			Role:     body.Role,
			Balance:  50000,
			Status:   "verified",
		}
		database.DB.Create(&newUser)
		return c.JSON(newUser)
	})

	// Public Register
	app.Post("/api/register", func(c *fiber.Ctx) error {
		var body struct {
			Name     string `json:"name"`
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if err := c.BodyParser(&body); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid payload"})
		}
		
		// Check if email exists
		var count int64
		database.DB.Model(&models.User{}).Where("email = ?", body.Email).Count(&count)
		if count > 0 {
			return c.Status(400).JSON(fiber.Map{"error": "Email already registered"})
		}

		newId := fmt.Sprintf("USR-%d", time.Now().Unix()%100000)
		newUser := models.User{
			ID:       newId,
			Name:     body.Name,
			Email:    body.Email,
			Password: body.Password,
			Role:     "user",
			Balance:  50000, // Welcome bonus
			Status:   "verified",
		}
		database.DB.Create(&newUser)
		return c.JSON(newUser)
	})

	// Public Login
	app.Post("/api/login", func(c *fiber.Ctx) error {
		var body struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if err := c.BodyParser(&body); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid payload"})
		}

		var user models.User
		if err := database.DB.Where("email = ? AND password = ?", body.Email, body.Password).First(&user).Error; err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "Invalid credentials"})
		}

		if user.Status == "suspended" {
			return c.Status(403).JSON(fiber.Map{"error": "Account suspended"})
		}

		return c.JSON(user)
	})

	log.Fatal(app.Listen(":3000"))
}

func seedNews() {
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

	for _, n := range nasabah {
		database.DB.Create(&n)
	}
}
