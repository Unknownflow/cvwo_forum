package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/CVWO/sample-go-app/internal/models"
	"github.com/CVWO/sample-go-app/internal/service"
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

	RespondJSON(w, http.StatusAccepted, "login success")
}

func (h *AuthHandler) HandleSignUp(w http.ResponseWriter, req *http.Request) {
	var newUser models.UserRequest
	// decode req body
	err := json.NewDecoder(req.Body).Decode(&newUser)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	defer req.Body.Close()

	// call handler to create new user
	response, err := h.Service.CreateUser(newUser)

	if err != nil {
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	RespondJSON(w, http.StatusCreated, response.Username+" creation success")
}
