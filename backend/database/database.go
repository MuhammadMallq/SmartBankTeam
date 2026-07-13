package database

import (
	"log"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"smartbank-backend/models"
	
	"github.com/joho/godotenv"
)

var DB *gorm.DB

func ConnectDB() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: Error loading .env file, relying on environment variables")
	}

	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		// Fallback for development if env is missing
		dsn = "root:@tcp(127.0.0.1:3306)/smartbank1?charset=utf8mb4&parseTime=True&loc=Local"
	}

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database. \n", err)
	}

	log.Println("connected")
	db.Logger = db.Logger.LogMode(1) // Info level
	log.Println("running migrations")
	db.AutoMigrate(
		&models.User{},
		&models.Ledger{},
		&models.BankFee{},
		&models.News{},
		&models.Loan{},
		&models.Installment{},
		&models.BillPayment{},
		// New operational models
		&models.ServiceTicket{},
		&models.QueueItem{},
		&models.TellerSession{},
		&models.SystemPolicy{},
		&models.CustomerAccount{},
	)

	DB = db
}
