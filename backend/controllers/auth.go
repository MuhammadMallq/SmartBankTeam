package controllers

import (
	"fmt"
	"math/rand"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"smartbank-backend/database"
	"smartbank-backend/models"
)

// LoginReq represents the login request body
type LoginReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// RegisterReq represents the registration request body
type RegisterReq struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Phone    string `json:"phone"`
	NIK      string `json:"nik"`
	Tier     string `json:"tier"`
}

// @Summary Register a new user
// @Description Register a new user with email and password
// @Tags Auth
// @Accept json
// @Produce json
// @Param body body controllers.RegisterReq true "Registration Details"
// @Success 200 {object} models.User
// @Failure 400 {object} map[string]string
// @Router /api/register [post]
func Register(c *fiber.Ctx) error {
	var body RegisterReq
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid payload"})
	}

	var count int64
	database.DB.Model(&models.User{}).Where("email = ?", body.Email).Count(&count)
	if count > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Email already registered"})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to hash password"})
	}

	newId := "USR-" + uuid.New().String()[:8]
	tier := body.Tier
	if tier == "" {
		tier = "Bronze" // Default fallback
	}

	newUser := models.User{
		ID:       newId,
		Name:     body.Name,
		Email:    body.Email,
		Password: string(hashedPassword),
		Role:     "user",
		Initial:  string(body.Name[0]),
		Color:    "#0d9488",
		Balance:  0, // No welcome bonus, start at 0
		Status:   "pending_deposit",
		Tier:     tier,
		Phone:    body.Phone,
		NIK:      body.NIK,
	}
	database.DB.Create(&newUser)

	// Create a Customer Account automatically so Teller can deposit into it
	newAccountNo := fmt.Sprintf("100%d", rand.Intn(9000000)+1000000)
	
	newAccount := models.CustomerAccount{
		AccountNo:  newAccountNo,
		CustomerID: newId,
		Product:    "Tabungan Smart " + tier,
		Type:       "TABUNGAN",
		Balance:    0,
		Status:     "AKTIF",
		OpenedAt:   time.Now(),
		Branch:     "KCP Utama",
	}
	database.DB.Create(&newAccount)
	
	// Don't return the hashed password
	newUser.Password = ""
	
	return c.JSON(fiber.Map{
		"user": newUser,
		"account": newAccount,
		"message": "Pendaftaran berhasil. Silakan lakukan setoran awal di Teller minimal Rp 50.000 untuk mengaktifkan akun Anda.",
	})
}

// @Summary Login user
// @Description Login and receive a JWT token
// @Tags Auth
// @Accept json
// @Produce json
// @Param body body controllers.LoginReq true "Login Credentials"
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]string
// @Router /api/login [post]
func Login(c *fiber.Ctx) error {
	var body LoginReq
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid payload"})
	}

	var user models.User
	if err := database.DB.Where("email = ?", body.Email).First(&user).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password)); err != nil {
		// As a fallback for existing unhashed seeded users, we check plaintext. In production this should be removed after migration.
		if user.Password != body.Password {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
		}
	}

	if user.Status == "suspended" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Account suspended"})
	}

	// Generate JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"role":    user.Role,
		"exp":     time.Now().Add(time.Hour * 24).Unix(), // 24 hours expiration
	})

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "super_secret_key_smartbank_2026"
	}
	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to generate token"})
	}

	user.Password = "" // Don't send back password

	return c.JSON(fiber.Map{
		"token": tokenString,
		"user":  user,
	})
}
