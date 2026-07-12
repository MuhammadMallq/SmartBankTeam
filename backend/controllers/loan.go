package controllers

import (
	"fmt"
	"math"
	"math/rand"
	"time"

	"github.com/gofiber/fiber/v2"
	"smartbank-backend/database"
	"smartbank-backend/models"
)

type LoanRequest struct {
	Amount       float64 `json:"amount"`
	Tenor        int     `json:"tenor"`
	InterestRate float64 `json:"interestRate"`
}

type PayInstallmentRequest struct {
	InstallmentID string `json:"installmentId"`
}

func CreateLoan(c *fiber.Ctx) error {
	reqUserId := c.Locals("user_id").(string)

	var req LoanRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if req.Amount <= 0 || req.Tenor <= 0 || req.InterestRate <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid loan parameters"})
	}

	monthlyRate := req.InterestRate / 100 / 12
	monthlyPayment := req.Amount * (monthlyRate * math.Pow(1+monthlyRate, float64(req.Tenor))) / (math.Pow(1+monthlyRate, float64(req.Tenor)) - 1)

	loanID := fmt.Sprintf("LN-%d-%03d", time.Now().Year(), rand.Intn(1000))
	
	now := time.Now()
	nextPayment := now.AddDate(0, 1, 0)
	dueDate := now.AddDate(0, req.Tenor, 0)

	loan := models.Loan{
		ID:             loanID,
		UserID:         reqUserId,
		Amount:         req.Amount,
		Remaining:      req.Amount,
		Paid:           0,
		InterestRate:   req.InterestRate,
		Tenor:          req.Tenor,
		MonthlyPayment: monthlyPayment,
		StartDate:      now,
		DueDate:        dueDate,
		NextPayment:    nextPayment,
		Status:         "ACTIVE",
	}

	var installments []models.Installment
	balance := req.Amount

	for i := 1; i <= req.Tenor; i++ {
		interest := balance * monthlyRate
		principal := monthlyPayment - interest
		balance -= principal

		inst := models.Installment{
			ID:        fmt.Sprintf("INST-%s-%d", loanID, i),
			LoanID:    loanID,
			No:        i,
			Date:      now.AddDate(0, i, 0),
			Principal: principal,
			Interest:  interest,
			Total:     monthlyPayment,
			Balance:   math.Max(0, balance),
			Status:    "UPCOMING",
		}
		installments = append(installments, inst)
	}

	tx := database.DB.Begin()

	if err := tx.Create(&loan).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create loan"})
	}

	for _, inst := range installments {
		if err := tx.Create(&inst).Error; err != nil {
			tx.Rollback()
			return c.Status(500).JSON(fiber.Map{"error": "Failed to create installments"})
		}
	}

	var user models.User
	if err := tx.First(&user, "id = ?", reqUserId).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Failed to find user"})
	}

	balanceBefore := user.Balance
	adminFee := req.Amount * 0.01
	disbursed := req.Amount - adminFee
	user.Balance += disbursed

	if err := tx.Save(&user).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update user balance"})
	}

	ledgerID := fmt.Sprintf("TRX-LN-%d", time.Now().Unix())
	ledger := models.Ledger{
		ID:             ledgerID,
		Timestamp:      time.Now(),
		Type:           "LOAN_DISBURSEMENT",
		Description:    "Pencairan Pinjaman " + loanID,
		App:            "SmartBank Core",
		FromUser:       "SYSTEM",
		ToUser:         reqUserId,
		Amount:         req.Amount,
		FeeBank:        adminFee,
		FeePajak:       0,
		TotalDeduction: req.Amount,
		BalanceBefore:  balanceBefore,
		BalanceAfter:   user.Balance,
		Status:         "SUCCESS",
	}

	if err := tx.Create(&ledger).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create ledger"})
	}

	fee := models.BankFee{
		ID:                fmt.Sprintf("FEE-%d", time.Now().Unix()),
		LedgerRef:         ledgerID,
		Description:       "Biaya Admin Pinjaman " + loanID,
		Type:              "LOAN_DISBURSEMENT",
		TransactionAmount: req.Amount,
		FeeAmount:         adminFee,
		TaxAmount:         0,
		TotalCharge:       adminFee,
		Timestamp:         time.Now(),
		Status:            "COLLECTED",
	}
	tx.Create(&fee)

	tx.Commit()

	return c.JSON(fiber.Map{"message": "Loan created successfully", "loan": loan})
}

func PayInstallment(c *fiber.Ctx) error {
	reqUserId := c.Locals("user_id").(string)

	var req PayInstallmentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	tx := database.DB.Begin()

	var inst models.Installment
	if err := tx.First(&inst, "id = ?", req.InstallmentID).Error; err != nil {
		tx.Rollback()
		return c.Status(404).JSON(fiber.Map{"error": "Installment not found"})
	}

	if inst.Status == "PAID" {
		tx.Rollback()
		return c.Status(400).JSON(fiber.Map{"error": "Installment already paid"})
	}

	var loan models.Loan
	if err := tx.First(&loan, "id = ?", inst.LoanID).Error; err != nil {
		tx.Rollback()
		return c.Status(404).JSON(fiber.Map{"error": "Loan not found"})
	}

	if loan.UserID != reqUserId {
		tx.Rollback()
		return c.Status(403).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var user models.User
	if err := tx.First(&user, "id = ?", reqUserId).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Failed to find user"})
	}

	if user.Balance < inst.Total {
		tx.Rollback()
		return c.Status(400).JSON(fiber.Map{"error": "Insufficient balance"})
	}

	inst.Status = "PAID"
	if err := tx.Save(&inst).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update installment"})
	}

	loan.Remaining -= inst.Principal
	loan.Paid += inst.Principal
	if loan.Remaining <= 0.01 {
		loan.Status = "COMPLETED"
	}
	
	var nextInst models.Installment
	if err := tx.Where("loan_id = ? AND status = ?", loan.ID, "UPCOMING").Order("no asc").First(&nextInst).Error; err == nil {
		loan.NextPayment = nextInst.Date
	}
	
	if err := tx.Save(&loan).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update loan"})
	}

	balanceBefore := user.Balance
	user.Balance -= inst.Total
	if err := tx.Save(&user).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update user balance"})
	}

	ledgerID := fmt.Sprintf("TRX-RP-%d", time.Now().Unix())
	ledger := models.Ledger{
		ID:             ledgerID,
		Timestamp:      time.Now(),
		Type:           "LOAN_REPAYMENT",
		Description:    fmt.Sprintf("Pembayaran Cicilan ke-%d Pinjaman %s", inst.No, loan.ID),
		App:            "SmartBank Core",
		FromUser:       reqUserId,
		ToUser:         "SYSTEM",
		Amount:         inst.Total,
		FeeBank:        0,
		FeePajak:       0,
		TotalDeduction: inst.Total,
		BalanceBefore:  balanceBefore,
		BalanceAfter:   user.Balance,
		Status:         "SUCCESS",
	}

	if err := tx.Create(&ledger).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create ledger"})
	}

	tx.Commit()

	return c.JSON(fiber.Map{"message": "Installment paid successfully"})
}
