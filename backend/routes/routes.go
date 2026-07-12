package routes

import (
	"github.com/gofiber/fiber/v2"
	"smartbank-backend/controllers"
	"smartbank-backend/middleware"
)

func SetupRoutes(app *fiber.App) {
	// Public routes
	app.Post("/api/login", controllers.Login)
	app.Post("/api/register", controllers.Register)
	app.Get("/api/news", controllers.GetAllNews)

	// Protected routes
	api := app.Group("/api", middleware.Protected())
	
	api.Get("/dashboard/data", controllers.GetDashboardData)
	api.Post("/transfer", controllers.Transfer)
	api.Post("/loans", controllers.CreateLoan)
	api.Post("/loans/pay", controllers.PayInstallment)
	api.Post("/payments", controllers.PayBill)

	// Admin protected routes (In production, you'd add role checks here)
	admin := api.Group("/admin")
	admin.Get("/users", controllers.GetAllUsers)
	admin.Get("/ledgers", controllers.GetAllLedgers)
	admin.Get("/fees", controllers.GetAllFees)
	admin.Get("/stats", controllers.GetAdminStats)
}
