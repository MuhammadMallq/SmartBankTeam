package models

import "time"

type User struct {
	ID       string  `gorm:"primaryKey" json:"id"`
	Name     string  `json:"name"`
	Email    string  `json:"email"`
	Password string  `json:"password"`
	Role     string  `json:"role"` // "user", "admin", "manager", "teller", "operator"
	Initial  string  `json:"initial"`
	Color    string  `json:"color"`
	Balance  float64 `json:"balance"`
	Status   string  `json:"status" gorm:"default:verified"`
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
