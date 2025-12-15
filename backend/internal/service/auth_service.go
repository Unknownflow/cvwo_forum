package service

import (
	"errors"
	"strings"
	"time"

	"github.com/CVWO/sample-go-app/internal/models"
	"github.com/CVWO/sample-go-app/internal/repository"
	"github.com/CVWO/sample-go-app/internal/token"
	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	CreateUser(userReq models.UserRequest) (*models.User, error)
	VerifyUser(userReq models.UserRequest) bool
	GenerateRefreshExpiry(username string, refreshToken string) error
	RefreshSession(oldRefreshToken string) (*token.TokenPair, error)
	EndSession(refreshToken string) error
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

func (s *authService) GenerateRefreshExpiry(username string, refreshToken string) error {
	// refresh token expire in 7 days
	expiresAt := time.Now().Add(7 * 24 * time.Hour)
	err := s.repo.SaveRefreshToken(username, refreshToken, expiresAt)
	return err
}

func (s *authService) RefreshSession(oldRefreshToken string) (*token.TokenPair, error) {
	// Check that the refresh token is of valid format
	claims, err := token.ValidateRefreshToken(oldRefreshToken)
	if err != nil {
		return nil, errors.New("invalid refresh token format")
	}

	// Check that the refresh token is not revoked
	storedToken, err := s.repo.GetRefreshToken(claims.Username)
	if err != nil {
		return nil, errors.New("user session not found")
	}

	// Check if the token matches the one in the DB.
	if storedToken.Token != oldRefreshToken {
		return nil, errors.New("refresh token reuse detected or invalid")
	}

	// Generate a new Token Pair
	newTokenPair, err := token.GenerateTokenPair(claims.Username, claims.Role)
	if err != nil {
		return nil, errors.New("failed to generate new tokens")
	}

	// Replace old refrsh token with a new one
	err = s.GenerateRefreshExpiry(claims.Username, newTokenPair.RefreshToken)
	if err != nil {
		return nil, errors.New("failed to persist new refresh token")
	}

	return newTokenPair, nil
}

func (s *authService) EndSession(refreshToken string) error {
	err := s.repo.RevokeRefreshToken(refreshToken)
	return err
}

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func verifyPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
