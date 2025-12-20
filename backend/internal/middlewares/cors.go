package middlewares

import (
	"fmt"
	"net/http"
	"slices"
)

var allowedOrigins = []string{
	"http://localhost:3000",
	"https://nus-forum.vercel.app",
	"https://nus-forum.onrender.com",
}

func CorsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		if slices.Contains(allowedOrigins, origin) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Max-Age", "3600")
			fmt.Println("add cors header")
		}

		// Handle preflight OPTIONS request
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			fmt.Println("handle preflight request")
			return
		}

		next.ServeHTTP(w, r)
	})
}
