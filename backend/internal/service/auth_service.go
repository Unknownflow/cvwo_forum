package service

import (
	"errors"
	"fmt"
	"strings"
	"time"
	"unicode"
	"unicode/utf8"

	"github.com/cvwo_assignment/backend/internal/models"
	"github.com/cvwo_assignment/backend/internal/repository"
	"github.com/cvwo_assignment/backend/internal/token"
	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	CreateUser(userReq models.UserRequest) (models.UserResponse, error)
	VerifyUser(userReq models.UserRequest) (bool, models.UserResponse)
	GenerateRefreshExpiry(username string, refreshToken string) error
	RefreshSession(oldRefreshToken string) (*token.TokenPair, error)
	EndPreviousUserSessions(username string) error
	EndSession(refreshToken string) error
}

type authService struct {
	repo repository.AuthRepository
}

const MIN_LENGTH = 8
const MAX_LENGTH = 64

func NewAuthService(repo repository.AuthRepository) AuthService {
	return &authService{repo: repo}
}

func (s *authService) CreateUser(userReq models.UserRequest) (models.UserResponse, error) {
	// Validate user input
	_, err := s.repo.ValidateUser(userReq)
	if err != nil {
		return models.UserResponse{}, err
	}

	// check that the length of the password is more than min length
	if utf8.RuneCountInString(userReq.Password) < MIN_LENGTH {
		return models.UserResponse{}, fmt.Errorf("password length is less than %d", MIN_LENGTH)
	}

	// check that the length of the password is less than max length
	if utf8.RuneCountInString(userReq.Password) > MAX_LENGTH {
		return models.UserResponse{}, fmt.Errorf("password length is more than %d", MAX_LENGTH)
	}

	// check that the password is alphanumeric
	if !isAlphanumeric(userReq.Password) {
		return models.UserResponse{}, fmt.Errorf("password should have upper and lower case letters and numbers")
	}

	hashedPassword, err := hashPassword(userReq.Password)
	if err != nil {
		return models.UserResponse{}, err
	}
	newUser := models.User{
		Username: strings.TrimSpace(userReq.Username),
		Password: hashedPassword,
	}

	resp, err := s.repo.SaveUser(newUser)

	if err != nil {
		return models.UserResponse{}, err
	}

	return resp, nil
}

func (s *authService) VerifyUser(userReq models.UserRequest) (bool, models.UserResponse) {
	var userResp models.UserResponse
	origPassword := s.repo.GetPassword(userReq)
	success := verifyPassword(userReq.Password, origPassword)
	userID := s.repo.GetUserID(userReq.Username)
	userResp = models.UserResponse{
		ID:       userID,
		Username: userReq.Username,
	}
	return success, userResp
}

func (s *authService) GenerateRefreshExpiry(username string, refreshToken string) error {
	// revoke previous refresh tokens
	userID := s.repo.GetUserID(username)
	err := s.repo.RevokeAllUserTokens(userID)
	if err != nil {
		return err
	}

	err = s.repo.DeleteExpiredTokens()
	if err != nil {
		return err
	}

	// refresh token expire in 7 days
	expiresAt := time.Now().Add(7 * 24 * time.Hour)
	err = s.repo.SaveRefreshToken(userID, refreshToken, expiresAt)
	return err
}

func (s *authService) RefreshSession(oldRefreshToken string) (*token.TokenPair, error) {
	// Check that the refresh token is of valid format
	claims, err := token.ValidateRefreshToken(oldRefreshToken)
	if err != nil {
		return nil, errors.New("invalid refresh token format")
	}

	userID := s.repo.GetUserID(claims.Username)
	// Check that the refresh token is not revoked
	storedToken, err := s.repo.GetRefreshToken(userID)
	if err != nil {
		return nil, errors.New("user session not found")
	}

	// Check if the token matches the one in the DB.
	if storedToken.Token != oldRefreshToken {
		return nil, errors.New("refresh token reuse detected or invalid")
	}

	// Generate a new Token Pair
	newTokenPair, err := token.GenerateTokenPair(claims.ID, claims.Username, claims.Role)
	if err != nil {
		return nil, errors.New("failed to generate new tokens")
	}

	// Remove token
	err = s.EndSession(oldRefreshToken)
	if err != nil {
		return nil, errors.New("failed to end sessio")
	}

	// Replace old refrsh token with a new one
	err = s.GenerateRefreshExpiry(claims.Username, newTokenPair.RefreshToken)
	if err != nil {
		return nil, errors.New("failed to persist new refresh token")
	}

	return newTokenPair, nil
}

func (s *authService) EndPreviousUserSessions(username string) error {
	userID := s.repo.GetUserID(username)
	err := s.repo.RevokeAllUserTokens(userID)
	return err
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

func isAlphanumeric(text string) bool {
	// checks if the text contains upper case, lower case letters and numbers
	hasDigit := false
	hasUpper := false
	hasLower := false

	for _, r := range text {
		if unicode.IsDigit(r) {
			hasDigit = true
		}

		if unicode.IsUpper(r) {
			hasUpper = true
		}

		if unicode.IsLower(r) {
			hasLower = true
		}
	}

	return hasDigit && hasUpper && hasLower
}
