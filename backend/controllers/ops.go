package controllers

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/gofiber/fiber/v2"
	"smartbank-backend/database"
	"smartbank-backend/models"
)

// ─── Queue Management ────────────────────────────────────────────────────────

func GetQueue(c *fiber.Ctx) error {
	var queue []models.QueueItem
	database.DB.Order("created_at asc").Find(&queue)
	return c.JSON(queue)
}

func AddQueue(c *fiber.Ctx) error {
	var req models.QueueItem
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	req.ID = fmt.Sprintf("Q-%d", time.Now().UnixNano())
	req.Number = fmt.Sprintf("A%03d", rand.Intn(999)+1) // simplistic generator
	req.Status = "WAITING"
	req.CreatedAt = time.Now()

	if err := database.DB.Create(&req).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(req)
}

func UpdateQueue(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		Status string `json:"status"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	updates := map[string]interface{}{"status": req.Status}
	now := time.Now()
	if req.Status == "CALLED" || req.Status == "SERVING" {
		updates["called_at"] = &now
	} else if req.Status == "DONE" {
		updates["completed_at"] = &now
	}

	if err := database.DB.Model(&models.QueueItem{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "Queue updated"})
}

// ─── Ticket Management ───────────────────────────────────────────────────────

func GetTickets(c *fiber.Ctx) error {
	var tickets []models.ServiceTicket
	database.DB.Order("created_at desc").Find(&tickets)
	return c.JSON(tickets)
}

func CreateTicket(c *fiber.Ctx) error {
	var req models.ServiceTicket
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	req.ID = fmt.Sprintf("TKT-%d", time.Now().UnixNano())
	req.Status = "OPEN"
	req.CreatedAt = time.Now()
	req.UpdatedAt = time.Now()

	if err := database.DB.Create(&req).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(req)
}

func UpdateTicket(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		Status string `json:"status"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	if err := database.DB.Model(&models.ServiceTicket{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":     req.Status,
		"updated_at": time.Now(),
	}).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "Ticket updated"})
}

// ─── Customer / Account Management ───────────────────────────────────────────

// Gets customer details and their accounts
func GetCustomerDetail(c *fiber.Ctx) error {
	id := c.Params("id")
	var user models.User
	if err := database.DB.Where("id = ?", id).First(&user).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Customer not found"})
	}

	var accounts []models.CustomerAccount
	database.DB.Where("customer_id = ?", id).Find(&accounts)

	// Since frontend expects accounts inside customer, let's build a map
	return c.JSON(fiber.Map{
		"customer": user,
		"accounts": accounts,
	})
}

// Creates an account for existing customer
func CreateAccount(c *fiber.Ctx) error {
	var req models.CustomerAccount
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	req.AccountNo = fmt.Sprintf("100%d", rand.Intn(9000000)+1000000)
	req.Status = "AKTIF"
	req.OpenedAt = time.Now()

	if err := database.DB.Create(&req).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(req)
}

// Check Balance by Account No
func GetAccount(c *fiber.Ctx) error {
	accountNo := c.Params("accNo")
	var account models.CustomerAccount
	if err := database.DB.Where("account_no = ?", accountNo).First(&account).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Account not found"})
	}

	var customer models.User
	database.DB.Where("id = ?", account.CustomerID).First(&customer)

	return c.JSON(fiber.Map{
		"account":  account,
		"customer": customer,
	})
}

// ─── Teller Operations (Deposit/Withdraw) ────────────────────────────────────

func CashDeposit(c *fiber.Ctx) error {
	var req struct {
		AccountNo string  `json:"account_no"`
		Amount    float64 `json:"amount"`
		Notes     string  `json:"notes"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	tx := database.DB.Begin()
	var account models.CustomerAccount
	if err := tx.Where("account_no = ?", req.AccountNo).First(&account).Error; err != nil {
		tx.Rollback()
		return c.Status(404).JSON(fiber.Map{"error": "Account not found"})
	}

	balanceBefore := account.Balance
	account.Balance += req.Amount
	if err := tx.Save(&account).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	// Update user global balance and activate if pending
	var user models.User
	var wasPending bool
	if err := tx.Where("id = ?", account.CustomerID).First(&user).Error; err == nil {
		if user.Status == "pending_deposit" && req.Amount >= 50000 {
			user.Status = "verified"
			wasPending = true
		}
		user.Balance += req.Amount
		tx.Save(&user)
	}

	ledger := models.Ledger{
		ID:            fmt.Sprintf("TRX-%d", time.Now().UnixNano()),
		Timestamp:     time.Now(),
		Type:          "CASH_DEPOSIT",
		Description:   req.Notes,
		App:           "TellerDesk",
		ToUser:        account.CustomerID, // Or account no
		Amount:        req.Amount,
		BalanceBefore: balanceBefore,
		BalanceAfter:  account.Balance,
		Status:        "SUCCESS",
	}
	tx.Create(&ledger)
	tx.Commit()

	return c.JSON(fiber.Map{"message": "Deposit successful", "new_balance": account.Balance, "activated": wasPending})
}

func CashWithdrawal(c *fiber.Ctx) error {
	var req struct {
		AccountNo string  `json:"account_no"`
		Amount    float64 `json:"amount"`
		Notes     string  `json:"notes"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	tx := database.DB.Begin()
	var account models.CustomerAccount
	if err := tx.Where("account_no = ?", req.AccountNo).First(&account).Error; err != nil {
		tx.Rollback()
		return c.Status(404).JSON(fiber.Map{"error": "Account not found"})
	}

	if account.Balance < req.Amount {
		tx.Rollback()
		return c.Status(400).JSON(fiber.Map{"error": "Insufficient balance"})
	}

	balanceBefore := account.Balance
	account.Balance -= req.Amount
	if err := tx.Save(&account).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	// Update user global balance
	var user models.User
	if err := tx.Where("id = ?", account.CustomerID).First(&user).Error; err == nil {
		user.Balance -= req.Amount
		tx.Save(&user)
	}

	ledger := models.Ledger{
		ID:            fmt.Sprintf("TRX-%d", time.Now().UnixNano()),
		Timestamp:     time.Now(),
		Type:          "CASH_WITHDRAWAL",
		Description:   req.Notes,
		App:           "TellerDesk",
		FromUser:      account.CustomerID,
		Amount:        req.Amount,
		BalanceBefore: balanceBefore,
		BalanceAfter:  account.Balance,
		Status:        "SUCCESS",
	}
	tx.Create(&ledger)
	tx.Commit()

	return c.JSON(fiber.Map{"message": "Withdrawal successful", "new_balance": account.Balance})
}

// ─── System Policy ───────────────────────────────────────────────────────────

func GetPolicies(c *fiber.Ctx) error {
	var policy models.SystemPolicy
	if err := database.DB.First(&policy).Error; err != nil {
		// Initialize default if not found
		policy = models.SystemPolicy{
			ID:           "POL-1",
			FeeRate:      1.0,
			TaxRate:      2.0,
			LoanInterest: 10.0,
			DailyLimit:   10,
		}
		database.DB.Create(&policy)
	}
	return c.JSON(policy)
}

func UpdatePolicies(c *fiber.Ctx) error {
	var req models.SystemPolicy
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	var policy models.SystemPolicy
	if err := database.DB.First(&policy).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Policy not found"})
	}

	policy.FeeRate = req.FeeRate
	policy.TaxRate = req.TaxRate
	policy.LoanInterest = req.LoanInterest
	policy.DailyLimit = req.DailyLimit

	if err := database.DB.Save(&policy).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Policies updated"})
}
