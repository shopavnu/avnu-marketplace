package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	// Set Gin to release mode in production
	if os.Getenv("ENV") == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// API Routes
	v1 := r.Group("/api/v1")
	{
		// Products
		v1.GET("/products", func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "Products endpoint"})
		})

		// Brands
		v1.GET("/brands", func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "Brands endpoint"})
		})

		// Users
		v1.GET("/users", func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "Users endpoint"})
		})

		// Auth
		auth := v1.Group("/auth")
		{
			auth.POST("/login", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "Login endpoint"})
			})
			auth.POST("/register", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "Register endpoint"})
			})
		}

		// Orders
		v1.GET("/orders", func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "Orders endpoint"})
		})
	}

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "healthy",
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
