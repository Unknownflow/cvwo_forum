package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"os"
	"strings"

	"github.com/CVWO/sample-go-app/internal/models"
	"github.com/jmoiron/sqlx"
)

type AuthRepository interface {
	ValidateUser(userReq models.UserRequest) (bool, error)
	SaveUser(user models.User) (models.User, error)
	GetPassword(userReq models.UserRequest) string
}

type authRepository struct {
	db *sqlx.DB
}

func NewAuthRepository(db *sqlx.DB) AuthRepository {
	return &authRepository{db: db}
}

func (r *authRepository) ValidateUser(userReq models.UserRequest) (bool, error) {
	// Check if name is empty
	if strings.TrimSpace(userReq.Username) == "" {
		return false, errors.New("username is required")
	}

	// Check if password is empty
	if strings.TrimSpace(userReq.Password) == "" {
		return false, errors.New("password is required")
	}

	query := `SELECT username FROM users WHERE username = $1`
	var existingUsername string
	err := r.db.QueryRow(query, userReq.Username).Scan(&existingUsername)

	if err == nil {
		// User was found - username exists
		return false, errors.New("username already exists")
	}

	if err != sql.ErrNoRows {
		// Some other database error occurred
		return false, fmt.Errorf("database error: %w", err)
	}

	return true, nil
}

func (r *authRepository) SaveUser(user models.User) (models.User, error) {
	user.Role = os.Getenv("DB_DEFAULT_ROLE")
	query := `INSERT INTO users (username, password, role)
			  VALUES (:username, :password, :role)`

	tx := r.db.MustBegin()
	_, err := tx.NamedExec(query, user)

	if err != nil {
		tx.Rollback()
		return models.User{}, fmt.Errorf("failed to insert user: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return models.User{}, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return user, nil
}

func (r *authRepository) GetPassword(userReq models.UserRequest) string {
	var origPassword string
	query := `SELECT password FROM users WHERE username = $1`
	r.db.QueryRow(query, userReq.Username).Scan(&origPassword)
	return origPassword
}
