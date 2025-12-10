package database

import (
	"fmt"
	"log"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

var schema = `
CREATE TABLE IF NOT EXISTS topic
(
	id SERIAL PRIMARY KEY,
	title TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS post
(
	id SERIAL PRIMARY KEY,
	body TEXT NOT NULL, 
	author TEXT, 
	created_at TIMESTAMPTZ,
	topic_id INT NOT NULL,
	FOREIGN KEY (topic_id) REFERENCES topic(id)
);

CREATE TABLE IF NOT EXISTS comment
(
	id SERIAL PRIMARY KEY,
	body TEXT NOT NULL,
	author TEXT,
	created_at TIMESTAMPTZ,
	post_id INT NOT NULL,
	FOREIGN KEY (post_id) REFERENCES post(id)
);
`

const (
	host     = "localhost"
	port     = 5432
	user     = "postgres"
	password = "password"
	dbname   = "db"
)

type Database struct {
}

func GetDB() (*Database, error) {
	// Connect to PostgresSQL db
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname)
	db, err := sqlx.Connect("postgres", psqlInfo)
	if err != nil {
		log.Fatalln(err)
	}
	defer db.Close()

	// execute database schema
	db.MustExec(schema)

	// sample insert sql code
	// tx := db.MustBegin()
	// tx.MustExec("INSERT INTO comment (body, author, timestamp) VALUES ($1, $2, $3)", "body 1", "john", "10am")
	// tx.Commit()

	// Test connection to db
	if err := db.Ping(); err != nil {
		log.Fatal(err)
	} else {
		log.Println("Successfully connected")
	}

	return &Database{}, nil
}
