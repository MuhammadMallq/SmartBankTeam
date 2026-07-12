package controllers

import (
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
	newUser := models.User{
		ID:       newId,
		Name:     body.Name,
		Email:    body.Email,
		Password: string(hashedPassword),
		Role:     "user",
		Balance:  50000, // Welcome bonus
		Status:   "verified",
	}
	database.DB.Create(&newUser)
	
	// Don't return the hashed password
	newUser.Password = ""
	
	return c.JSON(newUser)
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
