package service

import (
	"strings"

	"github.com/CVWO/sample-go-app/internal/models"
	"github.com/CVWO/sample-go-app/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	CreateUser(userReq models.UserRequest) (*models.User, error)
	VerifyUser(userReq models.UserRequest) bool
}

type authService struct {
	repo repository.AuthRepository
}

func NewAuthService(repo repository.AuthRepository) AuthService {
	return &authService{repo: repo}
}

func (s *authService) CreateUser(userReq models.UserRequest) (*models.User, error) {
	// Validate user input
	_, err := s.repo.ValidateUser(userReq)
	if err != nil {
		return nil, err
	}

	hashedPassword, err := hashPassword(userReq.Password)
	if err != nil {
		return nil, err
	}
	newUser := models.User{
		Username: strings.TrimSpace(userReq.Username),
		Password: hashedPassword,
	}

	_, err = s.repo.SaveUser(newUser)
	if err != nil {
		return nil, err
	}

	return &newUser, nil
}

func (s *authService) VerifyUser(userReq models.UserRequest) bool {
	origPassword := s.repo.GetPassword(userReq)
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
