package repository

import (
	"database/sql"
	"fmt"

	"github.com/jmoiron/sqlx"
)

type UserRepository interface {
	GetUserIDByUsername(username string) (int, error)
}

type userRepository struct {
	db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) GetUserIDByUsername(username string) (int, error) {
	var userID int
	query := `SELECT id FROM users WHERE username = $1`

	err := r.db.Get(&userID, query, username)
	if err == sql.ErrNoRows {
		return 0, fmt.Errorf("user not found: %s", username)
	}
	if err != nil {
		return 0, fmt.Errorf("database error: %w", err)
	}

	return userID, nil
}
