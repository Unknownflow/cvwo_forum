package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/cvwo_assignment/backend/internal/database"
	"github.com/cvwo_assignment/backend/internal/router"
	"github.com/joho/godotenv"
)

func main() {
	// load environment variables on startup
	err := godotenv.Load("../.env")
	if err != nil {
		fmt.Println("Error loading .env file")
	}

	database.InitDB()
	db, err := database.GetDB()
	if err != nil {
		log.Fatal("Error loading database")
		return
	}

	// Run migrations
	if err := database.RunMigrations(db.Conn); err != nil {
		log.Fatal("failed to run migrations: %w", err)
		return
	}

	// Set up router
	r := router.Setup(db.Conn)

	fmt.Print("Listening on port 8000 at http://localhost:8000!")

	log.Fatalln(http.ListenAndServe(":8000", r))
}
