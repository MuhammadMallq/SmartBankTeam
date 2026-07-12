package controllers

import (
	"github.com/gofiber/fiber/v2"
	"smartbank-backend/database"
	"smartbank-backend/models"
)

// Admin API endpoints keeping existing functionality

// @Summary Get All Users
// @Description Fetch all users (Admin only)
// @Tags Admin
// @Accept json
// @Produce json
// @Success 200 {array} models.User
// @Router /api/admin/users [get]
func GetAllUsers(c *fiber.Ctx) error {
	var users []models.User
	database.DB.Find(&users)
	return c.JSON(users)
}

// @Summary Get All Ledgers
// @Description Fetch all ledger records (Admin only)
// @Tags Admin
// @Accept json
// @Produce json
// @Success 200 {array} models.Ledger
// @Router /api/admin/ledgers [get]
func GetAllLedgers(c *fiber.Ctx) error {
	var ledgers []models.Ledger
	database.DB.Order("timestamp desc").Find(&ledgers)
	return c.JSON(ledgers)
}

// @Summary Get All Bank Fees
// @Description Fetch all bank fees (Admin only)
// @Tags Admin
// @Accept json
// @Produce json
// @Success 200 {array} models.BankFee
// @Router /api/admin/fees [get]
func GetAllFees(c *fiber.Ctx) error {
	var fees []models.BankFee
	database.DB.Find(&fees)
	return c.JSON(fees)
}

// @Summary Get Admin Stats
// @Description Fetch overall statistics
// @Tags Admin
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /api/admin/stats [get]
func GetAdminStats(c *fiber.Ctx) error {
	var totalUsers int64
	database.DB.Model(&models.User{}).Where("role IN ?", []string{"user", "contact"}).Count(&totalUsers)

	var totalBalance float64
	database.DB.Model(&models.User{}).Where("role IN ?", []string{"user", "contact"}).Select("COALESCE(SUM(balance),0)").Scan(&totalBalance)

	var totalTransactions int64
	database.DB.Model(&models.Ledger{}).Count(&totalTransactions)

	var totalFees float64
	database.DB.Model(&models.BankFee{}).Select("COALESCE(SUM(fee_amount),0)").Scan(&totalFees)

	return c.JSON(fiber.Map{
		"totalUsers":        totalUsers,
		"totalBalance":      totalBalance,
		"totalTransactions": totalTransactions,
		"totalFeesCollected": totalFees,
	})
}

// @Summary Get All News
// @Description Fetch all news articles
// @Tags Public
// @Accept json
// @Produce json
// @Success 200 {array} models.News
// @Router /api/news [get]
func GetAllNews(c *fiber.Ctx) error {
	var news []models.News
	database.DB.Order("timestamp desc").Find(&news)
	return c.JSON(news)
}
