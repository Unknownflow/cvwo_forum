package database

import (
	"fmt"
	"os"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

const (
	port = 5432
)

type Database struct {
	Conn *sqlx.DB
}

func GetDB() (*Database, error) {
	host := os.Getenv("DB_HOST")
	user := os.Getenv("DB_USER")
	dbname := os.Getenv("DB_NAME")
	password := os.Getenv("DB_PASSWORD")

	// Connect to PostgresSQL db
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname)
	db, err := sqlx.Connect("postgres", psqlInfo)

	if err != nil {
		return nil, fmt.Errorf("error opening database, %w", err)
	}

	return &Database{Conn: db}, nil
}

func (d *Database) Close() error {
	return d.Conn.Close()
}
