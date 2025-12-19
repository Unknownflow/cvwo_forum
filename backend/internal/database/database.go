package database

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type Database struct {
	Conn *sqlx.DB
}

var database Database

func InitDB() error {
	host := os.Getenv("DB_HOST")
	user := os.Getenv("DB_USER")
	dbname := os.Getenv("DB_NAME")
	password := os.Getenv("DB_PASSWORD")
	port, err := strconv.Atoi(os.Getenv("DB_PORT"))

	if err != nil {
		return err
	}

	// Connect to PostgresSQL db
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname)
	db, err := sqlx.Connect("postgres", psqlInfo)

	if err != nil {
		return err
	}

	// Connection pool configuration
	db.SetMaxOpenConns(25)                 // Max open connections
	db.SetMaxIdleConns(5)                  // Max idle connections
	db.SetConnMaxLifetime(5 * time.Minute) // Max connection lifetime
	db.SetConnMaxIdleTime(1 * time.Minute) // Max idle time

	// Verify connection
	if err := db.Ping(); err != nil {
		return err
	}
	database.Conn = db

	return nil
}

func GetDB() (*Database, error) {
	if database.Conn == nil {
		return nil, errors.New("database not initialised")
	}
	return &database, nil
}

func (d *Database) Close() error {
	return d.Conn.Close()
}
