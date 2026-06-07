package database

import (
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"smartbank-backend/models"
)

var DB *gorm.DB

func ConnectDB() {
	dsn := "root:@tcp(127.0.0.1:3306)/smartbank1?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database. \n", err)
	}

	log.Println("connected")
	db.Logger = db.Logger.LogMode(1) // Info level
	log.Println("running migrations")
	db.AutoMigrate(&models.User{}, &models.Ledger{}, &models.BankFee{}, &models.News{})

	DB = db
}
