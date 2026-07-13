package controllers

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"smartbank-backend/database"
	"smartbank-backend/models"
)

// PaymentRequest represents a request from an external application
type PaymentRequest struct {
	BillerID    string  `json:"biller_id"`
	BillerName  string  `json:"biller_name"`
	CustomerID  string  `json:"customer_id"`
	Amount      float64 `json:"amount"`
	Description string  `json:"description"`
}

// @Summary External Payment Gateway
// @Description Process a payment request from an external application (e.g. e-commerce, food app)
// @Tags Gateway
// @Accept json
// @Produce json
// @Param body body PaymentRequest true "Payment Request"
// @Success 200 {object} map[string]interface{}
// @Router /api/gateway/payment [post]
func ProcessExternalPayment(c *fiber.Ctx) error {
	var req PaymentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	if req.Amount <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Amount must be greater than zero"})
	}

	// Start Database Transaction
	tx := database.DB.Begin()
	if tx.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to initiate transaction"})
	}

	// Find the customer (payer)
	var customer models.User
	if err := tx.Set("gorm:query_option", "FOR UPDATE").Where("id = ?", req.CustomerID).First(&customer).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Customer not found"})
	}

	// Check sufficient balance
	if customer.Balance < req.Amount {
		tx.Rollback()
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Insufficient balance"})
	}

	// Deduct customer balance
	if err := tx.Model(&customer).Update("balance", customer.Balance-req.Amount).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to deduct balance"})
	}

	// Record Ledger
	ledgerID := "PAY-" + uuid.New().String()[:8]
	ledger := models.Ledger{
		ID:             ledgerID,
		Timestamp:      time.Now(),
		Type:           "PAYMENT",
		Description:    fmt.Sprintf("Payment to %s: %s", req.BillerName, req.Description),
		App:            req.BillerName,
		FromUser:       req.CustomerID,
		ToUser:         req.BillerID,
		Amount:         req.Amount,
		FeeBank:        0, // Assume no fee for external gateway or configure as needed
		TotalDeduction: req.Amount,
		BalanceBefore:  customer.Balance,
		BalanceAfter:   customer.Balance - req.Amount,
		Status:         "SUCCESS",
	}

	if err := tx.Create(&ledger).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to record payment"})
	}

	// Commit Transaction
	if err := tx.Commit().Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Transaction failed"})
	}

	// Return success response to the external application
	return c.JSON(fiber.Map{
		"status":         "success",
		"transaction_id": ledger.ID,
		"message":        "Payment successful",
		"timestamp":      ledger.Timestamp,
		"receipt": fiber.Map{
			"biller":   req.BillerName,
			"customer": customer.Name,
			"amount":   req.Amount,
		},
	})
}
