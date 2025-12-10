package utils

import (
	"encoding/json"
	"net/http"
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
