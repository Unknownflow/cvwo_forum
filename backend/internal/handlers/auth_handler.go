package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/cvwo_assignment/backend/internal/models"
	"github.com/cvwo_assignment/backend/internal/service"
	"github.com/cvwo_assignment/backend/internal/token"
)

// The handler depends on the Service interface
type AuthHandler struct {
	Service service.AuthService
}

func SetTokenCookies(w http.ResponseWriter, accessToken, refreshToken string) {
	secure, err := strconv.ParseBool(os.Getenv("IS_PRODUCTION"))
	if err != nil {
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    accessToken,
		HttpOnly: true,
		Secure:   secure, // TRUE In production, FALSE in development
		Path:     "/",
		Expires:  time.Now().Add(15 * time.Minute), // Expires in 15 minutes
		SameSite: http.SameSiteNoneMode,
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		HttpOnly: true,
		Secure:   secure, // TRUE In production, FALSE in development
		Path:     "/",
		Expires:  time.Now().Add(7 * 24 * time.Hour), // Expires in 1 week
		SameSite: http.SameSiteNoneMode,
	})
}

func (h *AuthHandler) HandleLogin(w http.ResponseWriter, r *http.Request) {
	var user models.UserRequest
	err := json.NewDecoder(r.Body).Decode(&user)
	defer r.Body.Close()

	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request body format")
		return
	}

	// call handler to verify login info
	success, response := h.Service.VerifyUser(user)

	if !success {
		RespondError(w, http.StatusUnauthorized, "incorrect username or password")
		return
	}

	err = h.Service.EndPreviousUserSessions(user.Username)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "failed to end previous session")
		return
	}

	tokenPair, err := token.GenerateTokenPair(response.ID, user.Username, user.Role)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "failed to generate tokens")
		return
	}

	err = h.Service.GenerateRefreshExpiry(user.Username, tokenPair.RefreshToken)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "failed to save refresh token")
		return
	}

	SetTokenCookies(w, tokenPair.AccessToken, tokenPair.RefreshToken)
	RespondJSON(w, http.StatusAccepted, map[string]interface{}{
		"message": "login successful",
		"user":    user.Username,
	})
}

func (h *AuthHandler) HandleSignUp(w http.ResponseWriter, req *http.Request) {
	var user models.UserRequest
	// decode req body
	err := json.NewDecoder(req.Body).Decode(&user)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	defer req.Body.Close()

	// call handler to create new user
	resp, err := h.Service.CreateUser(user)

	if err != nil {
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	tokenPair, err := token.GenerateTokenPair(resp.ID, resp.Username, user.Role)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "failed to generate tokens")
		return
	}

	err = h.Service.GenerateRefreshExpiry(user.Username, tokenPair.RefreshToken)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "failed to save refresh token")
		return
	}

	SetTokenCookies(w, tokenPair.AccessToken, tokenPair.RefreshToken)
	RespondJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "signup successful",
		"user":    user.Username,
	})
}

func (h *AuthHandler) HandleLogout(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("refresh_token")
	defer r.Body.Close()

	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid refresh token")
		return
	}

	err = h.Service.EndSession(cookie.Value)
	if err != nil {
		RespondError(w, http.StatusUnauthorized, "error ending session")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
	})

	RespondJSON(w, http.StatusOK, map[string]string{
		"message": "logged out successfully",
	})
}
