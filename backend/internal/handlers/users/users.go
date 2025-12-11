package users

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/CVWO/sample-go-app/internal/database"
	"github.com/CVWO/sample-go-app/internal/models"
	"golang.org/x/crypto/bcrypt"
)

type CreateUserRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func HandleCreate(w http.ResponseWriter, req *http.Request, userReq CreateUserRequest) (*models.User, error) {
	// Validate user input
	if err := validateUser(userReq); err != nil {
		return nil, err
	}

	hashedPassword, err := hashPassword(userReq.Password)
	if err != nil {
		return nil, err
	}
	newUser := &models.User{
		Username: strings.TrimSpace(userReq.Username),
		Password: hashedPassword,
	}

	if err := saveUserToDB(newUser); err != nil {
		return nil, err
	}

	return newUser, nil
}

func HandleVerify(w http.ResponseWriter, req *http.Request, userReq CreateUserRequest) bool {
	db, err := database.GetDB()
	if err != nil {
		return false
	}

	query := `SELECT password FROM users WHERE username = $1`
	var origPassword string
	db.Conn.QueryRow(query, userReq.Username).Scan(&origPassword)
	return verifyPassword(userReq.Password, origPassword)
}

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func verifyPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func validateUser(userReq CreateUserRequest) error {
	// Check if name is empty
	if strings.TrimSpace(userReq.Username) == "" {
		return errors.New("username is required")
	}

	// Check if password is empty
	if strings.TrimSpace(userReq.Password) == "" {
		return errors.New("password is required")
	}

	db, err := database.GetDB()
	if err != nil {
		return errors.New("database is down")
	}

	query := `SELECT username FROM users WHERE username = $1`
	var existingUsername string
	err = db.Conn.QueryRow(query, userReq.Username).Scan(&existingUsername)

	if err == nil {
		// User was found - username exists
		return errors.New("username already exists")
	}

	if err != sql.ErrNoRows {
		// Some other database error occurred
		return fmt.Errorf("database error: %w", err)
	}

	// err == sql.ErrNoRows means username is unique - all good!
	return nil
}

func saveUserToDB(user *models.User) error {
	user.Role = os.Getenv("DB_DEFAULT_ROLE")
	query := `INSERT INTO users (username, password, role)
			  VALUES (:username, :password, :role)`
	db, err := database.GetDB()

	if err != nil {
		return err
	}

	// start transaction
	tx := db.Conn.MustBegin()
	_, err = tx.NamedExec(query, user)

	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to insert user: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}
