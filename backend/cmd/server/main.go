package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/CVWO/sample-go-app/internal/database"
	"github.com/CVWO/sample-go-app/internal/router"
	"github.com/CVWO/sample-go-app/internal/routes"
	"github.com/joho/godotenv"
)

var schema = `
CREATE TABLE IF NOT EXISTS users
(
	username TEXT PRIMARY KEY,
	password TEXT NOT NULL,
	role TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS topics
(
	id SERIAL PRIMARY KEY,
	title TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS posts
(
	id SERIAL PRIMARY KEY,
	body TEXT NOT NULL, 
	author TEXT NOT NULL, 
	created_at TIMESTAMPTZ DEFAULT NOW(),
	topic_id INT NOT NULL,
	FOREIGN KEY (author) REFERENCES users(username) ON DELETE SET NULL,
	FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments
(
	id SERIAL PRIMARY KEY,
	body TEXT NOT NULL,
	author TEXT NOT NULL,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	post_id INT NOT NULL,
	FOREIGN KEY (author) REFERENCES users(username) ON DELETE SET NULL,
	FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
`

func main() {
	// load environment variables on startup
	err := godotenv.Load("../.env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	r := router.Setup()

	db, err := database.GetDB()
	if err != nil {
		log.Fatal("Error loading database")
		return
	}

	// execute database schema
	db.Conn.MustExec(schema)

	fmt.Print("Listening on port 8000 at http://localhost:8000!")

	// Middlewares
	// r.Use(middleware.Logger)

	r.Mount("/comments", routes.CommentRoutes())

	log.Fatalln(http.ListenAndServe(":8000", r))
}
