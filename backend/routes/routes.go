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
	app.Get("/api/public/stats", controllers.GetPublicStats)
	
	// API Gateway for other applications
	app.Post("/api/gateway/payment", controllers.ProcessExternalPayment)

	// Protected routes
	api := app.Group("/api", middleware.Protected())
	
	api.Get("/dashboard/data", controllers.GetDashboardData)
	api.Post("/transfer", controllers.Transfer)
	api.Post("/loans", controllers.CreateLoan)
	api.Post("/loans/pay", controllers.PayInstallment)
	api.Post("/payments", controllers.PayBill)

	// Ops/Teller/CS endpoints
	api.Get("/ops/queue", controllers.GetQueue)
	api.Post("/ops/queue", controllers.AddQueue)
	api.Put("/ops/queue/:id", controllers.UpdateQueue)

	api.Get("/ops/tickets", controllers.GetTickets)
	api.Post("/ops/tickets", controllers.CreateTicket)
	api.Put("/ops/tickets/:id", controllers.UpdateTicket)

	api.Get("/ops/customer/:id", controllers.GetCustomerDetail)
	api.Get("/ops/account/:accNo", controllers.GetAccount)
	api.Post("/ops/account", controllers.CreateAccount)

	api.Post("/ops/deposit", controllers.CashDeposit)
	api.Post("/ops/withdraw", controllers.CashWithdrawal)

	// Admin protected routes (In production, you'd add role checks here)
	admin := api.Group("/admin")
	admin.Get("/users", controllers.GetAllUsers)
	admin.Get("/ledgers", controllers.GetAllLedgers)
	admin.Get("/fees", controllers.GetAllFees)
	admin.Get("/stats", controllers.GetAdminStats)
	admin.Put("/users/:id/role", controllers.UpdateUserRole)
	admin.Put("/users/:id/status", controllers.UpdateUserStatus)
	admin.Post("/users", controllers.CreateAdminUser)
	admin.Get("/policy", controllers.GetPolicies)
	admin.Put("/policy", controllers.UpdatePolicies)
	admin.Get("/accounts", controllers.GetAllAccounts)
}
