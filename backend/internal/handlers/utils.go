package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/cvwo_assignment/backend/internal/database"
)

// respondJSON sends a JSON response with the given status code
func RespondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// respondError sends an error response
func RespondError(w http.ResponseWriter, status int, message string) {
	http.Error(w, message, status)
}

func GetDBConnection(w http.ResponseWriter) (*database.Database, bool) {
	db, err := database.GetDB()
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "Server down")
		return nil, false
	}
	return db, true
}
