package controllers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"smartbank-backend/database"
	"smartbank-backend/models"
)

// DashboardData represents the response for the dashboard endpoint
type DashboardData struct {
	User      models.User            `json:"user"`
	Admin     models.User            `json:"admin"`
	Manager   models.User            `json:"manager"`
	Teller    models.User            `json:"teller"`
	Operator  models.User            `json:"operator"`
	Contacts  []models.User          `json:"contacts"`
	Dashboard map[string]interface{} `json:"dashboard"`
	Ledger    []models.Ledger        `json:"ledger"`
	BankFees  map[string]interface{} `json:"bankFees"`
	News      []models.News          `json:"news"`
	Loans     map[string]interface{} `json:"loans"`
	Payments  []models.BillPayment   `json:"payments"`
}

// @Summary Get Dashboard Data
// @Description Get comprehensive data for the user dashboard based on JWT
// @Tags Dashboard
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Success 200 {object} controllers.DashboardData
// @Failure 401 {object} map[string]string
// @Router /api/dashboard/data [get]
func GetDashboardData(c *fiber.Ctx) error {
	// Extract user_id from context (set by Auth middleware)
	reqUserId := c.Locals("user_id").(string)

	var users []models.User
	// For production, maybe don't fetch ALL users. This is just keeping the current structure but fixing IDOR.
	database.DB.Select("id", "name", "email", "role", "initial", "color", "balance", "status").Find(&users)

	var data DashboardData
	data.Contacts = []models.User{}

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
	// Only fetch ledger where user is involved
	database.DB.Where("from_user = ? OR to_user = ?", reqUserId, reqUserId).Order("timestamp desc").Find(&ledgers)
	data.Ledger = ledgers

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
			if l.Timestamp.Day() == time.Now().Day() && l.Timestamp.Month() == time.Now().Month() && l.Timestamp.Year() == time.Now().Year() {
				usedTx++
			}
		}

		if isParticipant {
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

	var fees []models.BankFee
	// Just getting count for bank fees overview
	database.DB.Limit(5).Find(&fees) // only a subset or mock
	data.BankFees = map[string]interface{}{
		"totalFeeCollected": 0,
		"totalTaxCollected": 0,
		"totalCollected":    0,
		"feeRate":           0.01,
		"taxRate":           0.02,
		"transactionsCharged": 0,
		"entries": fees,
	}

	// Fetch News
	var news []models.News
	database.DB.Order("timestamp desc").Find(&news)
	data.News = news

	// Fetch Loans
	var activeLoan models.Loan
	var loanHistory []models.Loan
	
	// Find active loan
	database.DB.Preload("Installments").Where("user_id = ? AND status = ?", reqUserId, "ACTIVE").First(&activeLoan)
	// Find completed loans
	database.DB.Where("user_id = ? AND status = ?", reqUserId, "COMPLETED").Order("start_date desc").Find(&loanHistory)
	
	emptyLoan := map[string]interface{}{
		"id": "-",
		"amount": 0,
		"remaining": 0,
		"paid": 0,
		"interestRate": 0,
		"tenor": 0,
		"monthlyPayment": 0,
		"startDate": "-",
		"dueDate": "-",
		"nextPayment": "-",
		"status": "NONE",
		"installments": []interface{}{},
	}
	
	data.Loans = map[string]interface{}{
		"activeLoan": emptyLoan,
		"history":    loanHistory,
	}
	
	if activeLoan.ID != "" {
		data.Loans["activeLoan"] = activeLoan
	}
	
	// Fetch Payments
	var payments []models.BillPayment
	database.DB.Where("user_id = ?", reqUserId).Order("timestamp desc").Find(&payments)
	data.Payments = payments

	return c.JSON(data)
}
