package controllers

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"smartbank-backend/database"
	"smartbank-backend/models"
)

type PayBillRequest struct {
	Category   string  `json:"category"`
	Biller     string  `json:"biller"`
	CustomerID string  `json:"customer_id"`
	Amount     float64 `json:"amount"`
}

func PayBill(c *fiber.Ctx) error {
	reqUserId := c.Locals("user_id").(string)

	var req PayBillRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if req.Amount <= 0 || req.Category == "" || req.Biller == "" || req.CustomerID == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid payment parameters"})
	}

	tx := database.DB.Begin()

	var user models.User
	if err := tx.First(&user, "id = ?", reqUserId).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Failed to find user"})
	}

	// Calculate total deduction including admin fee for bills
	adminFee := 2500.0 // Flat admin fee for bill payments
	totalDeduction := req.Amount + adminFee

	if user.Balance < totalDeduction {
		tx.Rollback()
		return c.Status(400).JSON(fiber.Map{"error": "Insufficient balance including admin fee"})
	}

	// Deduct balance
	balanceBefore := user.Balance
	user.Balance -= totalDeduction

	if err := tx.Save(&user).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update balance"})
	}

	now := time.Now()
	monthNames := []string{"Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"}
	period := fmt.Sprintf("%s %d", monthNames[now.Month()-1], now.Year())

	// Save Bill Payment
	payment := models.BillPayment{
		ID:         fmt.Sprintf("PAY-%d", time.Now().Unix()),
		UserID:     reqUserId,
		Category:   req.Category,
		Biller:     req.Biller,
		CustomerID: req.CustomerID,
		Period:     period,
		Amount:     req.Amount,
		Status:     "SUCCESS",
		Timestamp:  now,
	}

	if err := tx.Create(&payment).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Failed to record payment"})
	}

	// Ledger Entry
	ledgerID := fmt.Sprintf("TRX-PY-%d", time.Now().Unix())
	ledger := models.Ledger{
		ID:             ledgerID,
		Timestamp:      time.Now(),
		Type:           "PAYMENT",
		Description:    "Pembayaran " + req.Biller + " - " + req.CustomerID,
		App:            "SmartBank Bill",
		FromUser:       reqUserId,
		ToUser:         "SYSTEM",
		Amount:         req.Amount,
		FeeBank:        adminFee,
		FeePajak:       0,
		TotalDeduction: totalDeduction,
		BalanceBefore:  balanceBefore,
		BalanceAfter:   user.Balance,
		Status:         "SUCCESS",
	}

	if err := tx.Create(&ledger).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create ledger"})
	}

	// Bank Fee Entry
	fee := models.BankFee{
		ID:                fmt.Sprintf("FEE-%d", time.Now().Unix()),
		LedgerRef:         ledgerID,
		Description:       "Biaya Admin Pembayaran " + req.Category,
		Type:              "PAYMENT",
		TransactionAmount: req.Amount,
		FeeAmount:         adminFee,
		TaxAmount:         0,
		TotalCharge:       adminFee,
		Timestamp:         time.Now(),
		Status:            "COLLECTED",
	}
	tx.Create(&fee)

	tx.Commit()

	return c.JSON(fiber.Map{"message": "Payment successful", "payment": payment})
}
