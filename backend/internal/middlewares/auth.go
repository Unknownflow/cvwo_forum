package middlewares

import (
	"context"
	"fmt"
	"net/http"

	"github.com/CVWO/sample-go-app/internal/handlers"
	"github.com/CVWO/sample-go-app/internal/repository"
	"github.com/CVWO/sample-go-app/internal/service"
	"github.com/CVWO/sample-go-app/internal/token"
	"github.com/jmoiron/sqlx"
)

type ContextKey string

const UserContextKey ContextKey = "user"

func CreateAuthMiddleware(conn *sqlx.DB) func(http.Handler) http.Handler {
	authRepo := repository.NewAuthRepository(conn)
	authService := service.NewAuthService(authRepo)

	return func(next http.Handler) http.Handler {
		return authMiddleware(next.ServeHTTP, authService)
	}
}

func authMiddleware(next http.HandlerFunc, authService service.AuthService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		accessTokenCookie, err := r.Cookie("access_token")
		if err != nil {
			// Missing / expired access token
			fmt.Println("attempt to refresh")
			handleRefresh(w, r, next, authService)
			return
		}

		claims, err := token.ValidateAccessToken(accessTokenCookie.Value)
		if err != nil {
			// Invalid / expired access token
			handleRefresh(w, r, next, authService)
			return
		}

		// Token is valid, attach user info to context
		ctx := context.WithValue(r.Context(), UserContextKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

func handleRefresh(w http.ResponseWriter, r *http.Request, next http.HandlerFunc, authService service.AuthService) {
	refreshTokenCookie, err := r.Cookie("refresh_token")
	if err != nil {
		// No refresh token found
		handlers.RespondError(w, http.StatusUnauthorized, "Authorization required (no valid tokens)")
		return
	}

	newTokenPair, err := authService.RefreshSession(refreshTokenCookie.Value)
	if err != nil {
		// Refresh failed (token revoked/expired)
		handlers.RespondError(w, http.StatusUnauthorized, "Session expired or invalid refresh token")
		return
	}

	// Replace cookies with new access and refresh token
	handlers.SetTokenCookies(w, newTokenPair.AccessToken, newTokenPair.RefreshToken)

	// Validate the new Access Token
	newClaims, err := token.ValidateAccessToken(newTokenPair.AccessToken)
	if err != nil {
		handlers.RespondError(w, http.StatusInternalServerError, "Failed to validate newly generated token")
		return
	}

	// Attach new user info to context and proceed to the original handler
	ctx := context.WithValue(r.Context(), UserContextKey, newClaims)
	next.ServeHTTP(w, r.WithContext(ctx))
}
