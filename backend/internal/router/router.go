package router

import (
	"os"

	"github.com/cvwo_assignment/backend/internal/middlewares"
	"github.com/cvwo_assignment/backend/internal/routes"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jmoiron/sqlx"
)

func Setup(conn *sqlx.DB) chi.Router {
	r := chi.NewRouter()
	frontendURL := os.Getenv("FRONTEND_URL")

	// Basic CORS
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{frontendURL},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	setUpRoutes(r, conn)
	return r
}

func setUpRoutes(r chi.Router, conn *sqlx.DB) {
	r.Use(middleware.Logger)
	authMiddleware := middlewares.CreateAuthMiddleware(conn)

	r.Route("/auth", routes.AuthRoutes(conn))
	r.Group(func(r chi.Router) {
		r.Use(authMiddleware)

		r.Route("/topics", routes.TopicsRoutes(conn))
		r.Route("/posts", routes.PostsRoutes(conn))
		r.Route("/comments", routes.CommentRoutes(conn))
	})

}
