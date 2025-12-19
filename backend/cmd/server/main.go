package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/cvwo_assignment/backend/internal/database"
	"github.com/cvwo_assignment/backend/internal/router"
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
	title TEXT NOT NULL,
	author TEXT NOT NULL,
	FOREIGN KEY (author) REFERENCES users(username) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS posts
(
	id SERIAL PRIMARY KEY,
	header TEXT NOT NULL,
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

CREATE TABLE IF NOT EXISTS refresh_tokens 
(
	id SERIAL PRIMARY KEY,
	username TEXT NOT NULL,
	token VARCHAR(255) NOT NULL UNIQUE,
	expires_at TIMESTAMP NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	is_revoked BOOLEAN DEFAULT FALSE,
	FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);
`

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

	r := router.Setup(db.Conn)

	// execute database schema
	db.Conn.MustExec(schema)

	fmt.Print("Listening on port 8000 at http://localhost:8000!")

	log.Fatalln(http.ListenAndServe(":8000", r))
}
