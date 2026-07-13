package models

import "time"

type User struct {
	ID       string  `gorm:"primaryKey" json:"id"`
	Name     string  `json:"name"`
	Email    string  `json:"email"`
	Password string  `json:"password"`
	Role     string  `json:"role"` // "user", "admin", "manager", "teller", "operator", "cs"
	Initial  string  `json:"initial"`
	Color    string  `json:"color"`
	Balance  float64 `json:"balance"`
	Status   string  `json:"status" gorm:"default:verified"`
	Tier     string  `json:"tier" gorm:"default:Bronze"`
	Phone    string  `json:"phone"`
	NIK      string  `json:"nik"`
}

type Ledger struct {
	ID             string    `gorm:"primaryKey" json:"id"`
	Timestamp      time.Time `json:"timestamp"`
	Type           string    `json:"type"`
	Description    string    `json:"description"`
	App            string    `json:"app"`
	FromUser       string    `json:"from_user"`
	ToUser         string    `json:"to_user"`
	Amount         float64   `json:"amount"`
	FeeBank        float64   `json:"fee_bank"`
	FeePajak       float64   `json:"fee_pajak"`
	TotalDeduction float64   `json:"total_deduction"`
	BalanceBefore  float64   `json:"balance_before"`
	BalanceAfter   float64   `json:"balance_after"`
	Status         string    `json:"status"`
}

type BankFee struct {
	ID                string    `gorm:"primaryKey" json:"id"`
	LedgerRef         string    `json:"ledger_ref"`
	Description       string    `json:"description"`
	Type              string    `json:"type"`
	TransactionAmount float64   `json:"transaction_amount"`
	FeeAmount         float64   `json:"fee_amount"`
	TaxAmount         float64   `json:"tax_amount"`
	TotalCharge       float64   `json:"total_charge"`
	Timestamp         time.Time `json:"timestamp"`
	Status            string    `json:"status"`
}

type News struct {
	ID        string    `json:"id" gorm:"primaryKey"`
	Title     string    `json:"title"`
	Summary   string    `json:"summary"`
	Source    string    `json:"source"`
	Url       string    `json:"url"`
	Timestamp time.Time `json:"timestamp"`
}

type Loan struct {
	ID             string        `gorm:"primaryKey" json:"id"`
	UserID         string        `json:"user_id"`
	Amount         float64       `json:"amount"`
	Remaining      float64       `json:"remaining"`
	Paid           float64       `json:"paid"`
	InterestRate   float64       `json:"interestRate"`
	Tenor          int           `json:"tenor"`
	MonthlyPayment float64       `json:"monthlyPayment"`
	StartDate      time.Time     `json:"startDate"`
	DueDate        time.Time     `json:"dueDate"`
	NextPayment    time.Time     `json:"nextPayment"`
	Status         string        `json:"status"`
	Installments   []Installment `gorm:"foreignKey:LoanID" json:"installments"`
}

type Installment struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	LoanID    string    `json:"loan_id"`
	No        int       `json:"no"`
	Date      time.Time `json:"date"`
	Principal float64   `json:"principal"`
	Interest  float64   `json:"interest"`
	Total     float64   `json:"total"`
	Balance   float64   `json:"balance"`
	Status    string    `json:"status"`
}

type BillPayment struct {
	ID         string    `gorm:"primaryKey" json:"id"`
	UserID     string    `json:"user_id"`
	Category   string    `json:"category"`
	Biller     string    `json:"biller"`
	CustomerID string    `json:"customer_id"`
	Period     string    `json:"period"`
	Amount     float64   `json:"amount"`
	Status     string    `json:"status"`
	Timestamp  time.Time `json:"timestamp"`
}

// ─── Operational Models (Teller, CS, Operator) ─────────────────────────

// ServiceTicket represents a customer service ticket
type ServiceTicket struct {
	ID         string    `gorm:"primaryKey" json:"id"`
	CustomerID string    `json:"customer_id"` // User ID of the customer
	AccountNo  string    `json:"account_no"`
	Category   string    `json:"category"`
	Subject    string    `json:"subject"`
	Priority   string    `json:"priority"` // NORMAL, HIGH
	Status     string    `json:"status"`   // OPEN, IN_PROGRESS, RESOLVED, CLOSED
	Note       string    `json:"note"`
	Officer    string    `json:"officer"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// QueueItem represents a service queue entry
type QueueItem struct {
	ID          string     `gorm:"primaryKey" json:"id"`
	Number      string     `json:"number"` // e.g. A001
	CustomerID  string     `json:"customer_id"`
	Service     string     `json:"service"`
	Status      string     `json:"status"` // WAITING, CALLED, SERVING, DONE
	Notes       string     `json:"notes"`
	Officer     string     `json:"officer"`
	CreatedAt   time.Time  `json:"created_at"`
	CalledAt    *time.Time `json:"called_at"`
	CompletedAt *time.Time `json:"completed_at"`
}

// TellerSession represents an active teller cash drawer session
type TellerSession struct {
	ID             string     `gorm:"primaryKey" json:"id"`
	TellerID       string     `json:"teller_id"`
	TellerName     string     `json:"teller_name"`
	DrawerOpening  float64    `json:"drawer_opening"`
	DrawerCash     float64    `json:"drawer_cash"`
	TotalDeposits  float64    `json:"total_deposits"`
	TotalWithdraws float64    `json:"total_withdrawals"`
	FeeCollected   float64    `json:"fee_collected"`
	TaxCollected   float64    `json:"tax_collected"`
	TxCount        int        `json:"tx_count"`
	OpenedAt       time.Time  `json:"opened_at"`
	ClosedAt       *time.Time `json:"closed_at"`
	Status         string     `json:"status"` // OPEN, CLOSED
}

// SystemPolicy stores configurable bank parameters
type SystemPolicy struct {
	ID           string  `gorm:"primaryKey" json:"id"`
	FeeRate      float64 `json:"fee_rate"`      // e.g. 1.0 = 1%
	TaxRate      float64 `json:"tax_rate"`      // e.g. 2.0 = 2%
	LoanInterest float64 `json:"loan_interest"` // e.g. 10 = 10%
	DailyLimit   int     `json:"daily_limit"`   // max transactions per day
}

// CustomerAccount represents a bank account (tabungan/giro/deposito)
// Separate from User because one customer can have multiple accounts
type CustomerAccount struct {
	AccountNo  string    `gorm:"primaryKey" json:"account_no"`
	CustomerID string    `json:"customer_id"` // references User.ID
	Product    string    `json:"product"`     // "Tabungan Smart", "Giro Usaha", etc
	Type       string    `json:"type"`        // TABUNGAN, GIRO, DEPOSITO
	Balance    float64   `json:"balance"`
	Status     string    `json:"status"` // AKTIF, BLOKIR, TUTUP
	OpenedAt   time.Time `json:"opened_at"`
	Branch     string    `json:"branch"`
}
