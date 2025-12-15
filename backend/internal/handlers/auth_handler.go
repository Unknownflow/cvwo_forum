package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/CVWO/sample-go-app/internal/models"
	"github.com/CVWO/sample-go-app/internal/service"
	"github.com/CVWO/sample-go-app/internal/token"
)

// The handler depends on the Service interface
type AuthHandler struct {
	Service service.AuthService
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
	response := h.Service.VerifyUser(user)

	if !response {
		RespondError(w, http.StatusUnauthorized, "incorrect username or password")
		return
	}

	tokenPair, err := token.GenerateTokenPair(user.Username, user.Role)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "failed to generate tokens")
		return
	}

	err = h.Service.GenerateRefreshExpiry(user.Username, tokenPair.RefreshToken)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "failed to save refresh token")
		return
	}

	RespondJSON(w, http.StatusAccepted, map[string]interface{}{
		"access_token":  tokenPair.AccessToken,
		"refresh_token": tokenPair.RefreshToken,
		"token_type":    "Bearer",
		"expires_in":    900, // 15 mins in seconds
		"user":          user.Username,
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
	_, err = h.Service.CreateUser(user)

	if err != nil {
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	tokenPair, err := token.GenerateTokenPair(user.Username, user.Role)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "failed to generate tokens")
		return
	}

	err = h.Service.GenerateRefreshExpiry(user.Username, tokenPair.RefreshToken)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "failed to save refresh token")
		return
	}

	RespondJSON(w, http.StatusCreated, map[string]interface{}{
		"access_token":  tokenPair.AccessToken,
		"refresh_token": tokenPair.RefreshToken,
		"token_type":    "Bearer",
		"expires_in":    900, // 15 mins in seconds
		"user":          user.Username,
	})
}

func (h *AuthHandler) HandleLogout(w http.ResponseWriter, r *http.Request) {
	var request struct {
		RefreshToken string `json:"refresh_token"`
	}
	err := json.NewDecoder(r.Body).Decode(&request)
	defer r.Body.Close()

	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request body format")
		return
	}

	err = h.Service.EndSession(request.RefreshToken)
	if err != nil {
		RespondError(w, http.StatusUnauthorized, "error ending session")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]string{
		"message": "logged out successfully",
	})
}
