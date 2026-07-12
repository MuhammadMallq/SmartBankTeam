package controllers

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	
	"smartbank-backend/database"
	"smartbank-backend/models"
)

// TransferReq represents the transfer request body
type TransferReq struct {
	Amount float64 `json:"amount"`
	ToUser string  `json:"to_user"`
	ToName string  `json:"to_name"`
}

// @Summary Transfer Money
// @Description Transfer money from logged-in user to another user
// @Tags Transactions
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param body body controllers.TransferReq true "Transfer Details"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /api/transfer [post]
func Transfer(c *fiber.Ctx) error {
	var req TransferReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	fromUser := c.Locals("user_id").(string)

	if req.Amount <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Amount must be greater than zero"})
	}

	if fromUser == req.ToUser {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot transfer to yourself"})
	}

	// Calculate fees (3%)
	feeBank := req.Amount * 0.03
	totalDeduction := req.Amount + feeBank

	// Start Database Transaction
	tx := database.DB.Begin()
	if tx.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to initiate transaction"})
	}

	// Lock sender record to prevent race conditions (Pessimistic Locking)
	var sender models.User
	if err := tx.Set("gorm:query_option", "FOR UPDATE").Where("id = ?", fromUser).First(&sender).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Sender not found"})
	}

	// Check sufficient balance
	if sender.Balance < totalDeduction {
		tx.Rollback()
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Insufficient balance"})
	}

	// Deduct sender balance
	if err := tx.Model(&sender).Update("balance", sender.Balance - totalDeduction).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update sender balance"})
	}

	// Update recipient balance
	var recipient models.User
	if err := tx.Where("id = ?", req.ToUser).First(&recipient).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Recipient not found"})
	}
	if err := tx.Model(&recipient).Update("balance", recipient.Balance + req.Amount).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update recipient balance"})
	}

	// Create ledger record
	ledgerID := "TRF-" + uuid.New().String()[:8]
	ledger := models.Ledger{
		ID:             ledgerID,
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
	if err := tx.Create(&ledger).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create ledger record"})
	}

	// Create bank fee record
	fee := models.BankFee{
		ID:                "FEE-" + uuid.New().String()[:8],
		LedgerRef:         ledger.ID,
		Timestamp:         time.Now(),
		Description:       "Transfer Fee",
		Type:              "TRANSFER_OUT",
		TransactionAmount: req.Amount,
		FeeAmount:         feeBank,
		TotalCharge:       feeBank,
		Status:            "COLLECTED",
	}
	if err := tx.Create(&fee).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create fee record"})
	}

	// Commit Transaction
	if err := tx.Commit().Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Transaction failed"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": fmt.Sprintf("Transferred %.2f to %s", req.Amount, req.ToName)})
}
