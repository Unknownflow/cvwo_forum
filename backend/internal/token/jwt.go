package token

import (
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Role     string `json:"Role"`
	jwt.RegisteredClaims
}

type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

func GenerateTokenPair(id int, username string, role string) (*TokenPair, error) {
	accessToken, err := generateAccessToken(id, username, role)
	if err != nil {
		return nil, err
	}

	refreshToken, err := generateRefreshToken(id, username)
	if err != nil {
		return nil, err
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func generateAccessToken(id int, username string, role string) (string, error) {
	secret := os.Getenv("JWT_ACCESS_TOKEN_SECRET")
	if secret == "" {
		return "", fmt.Errorf("secret key not found")
	}

	claims := Claims{
		ID:       id,
		Username: username,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "web-forum",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenStr, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", fmt.Errorf("error signing token: %w", err)
	}

	return tokenStr, nil
}

func generateRefreshToken(id int, username string) (string, error) {
	secret := os.Getenv("JWT_REFRESH_TOKEN_SECRET")
	if secret == "" {
		return "", fmt.Errorf("secret key not found")
	}

	claims := Claims{
		ID:       id,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * 7 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "web-forum",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenStr, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", fmt.Errorf("error signing token: %w", err)
	}

	return tokenStr, nil
}

func ValidateAccessToken(tokenString string) (*Claims, error) {
	secret := os.Getenv("JWT_ACCESS_TOKEN_SECRET")
	if secret == "" {
		return nil, fmt.Errorf("secret key not found")
	}

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, jwt.ErrSignatureInvalid
}

func ValidateRefreshToken(tokenString string) (*Claims, error) {
	secret := os.Getenv("JWT_REFRESH_TOKEN_SECRET")
	if secret == "" {
		return nil, fmt.Errorf("secret key not found")
	}

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, jwt.ErrSignatureInvalid
}
