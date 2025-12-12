package handlers

import (
	"encoding/json"
	"net/http"
)

func HandleLogin(w http.ResponseWriter, req *http.Request) {
	var user CreateUserRequest
	err := json.NewDecoder(req.Body).Decode(&user)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	defer req.Body.Close()

	// call handler to verify login info
	response := HandleVerifyUser(w, req, user)

	if !response {
		RespondError(w, http.StatusUnauthorized, "incorrect username or password")
		return
	}

	RespondJSON(w, http.StatusAccepted, "login success")
}

func HandleSignUp(w http.ResponseWriter, req *http.Request) {
	var newUser CreateUserRequest
	// decode req body
	err := json.NewDecoder(req.Body).Decode(&newUser)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	defer req.Body.Close()

	// call handler to create new user
	response, err := HandleCreateUser(w, req, newUser)

	if err != nil {
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	RespondJSON(w, http.StatusCreated, response.Username+" creation success")
}
