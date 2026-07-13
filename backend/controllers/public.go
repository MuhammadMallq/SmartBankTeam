package controllers

import (
	"github.com/gofiber/fiber/v2"
	"smartbank-backend/database"
	"smartbank-backend/models"
)

// @Summary Get Public Stats
// @Description Fetch overall statistics for the landing page
// @Tags Public
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /api/public/stats [get]
func GetPublicStats(c *fiber.Ctx) error {
	var totalUsers int64
	database.DB.Model(&models.User{}).Where("role IN ?", []string{"user", "contact"}).Count(&totalUsers)

	var totalBalance float64
	database.DB.Model(&models.User{}).Where("role IN ?", []string{"user", "contact"}).Select("COALESCE(SUM(balance),0)").Scan(&totalBalance)

	return c.JSON(fiber.Map{
		"totalUsers":   totalUsers,
		"totalBalance": totalBalance,
	})
}
