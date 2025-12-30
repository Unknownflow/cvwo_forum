package router

import (
	"net/http"

	"github.com/cvwo_assignment/backend/internal/middlewares"
	"github.com/cvwo_assignment/backend/internal/routes"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jmoiron/sqlx"
)

func Setup(conn *sqlx.DB) chi.Router {
	r := chi.NewRouter()

	r.Use(middlewares.CorsMiddleware)
	setUpRoutes(r, conn)
	return r
}

func setUpRoutes(r chi.Router, conn *sqlx.DB) {
	r.Use(middleware.Logger)
	authMiddleware := middlewares.CreateAuthMiddleware(conn)

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	r.Route("/auth", routes.AuthRoutes(conn))
	r.Group(func(r chi.Router) {
		r.Use(authMiddleware)

		r.Route("/topics", routes.TopicsRoutes(conn))
		r.Route("/posts", routes.PostsRoutes(conn))
		r.Route("/comments", routes.CommentRoutes(conn))
		r.Route("/posts/likes", routes.PostLikesRoutes(conn))
		r.Route("/comments/likes", routes.CommentLikesRoutes(conn))
	})
}
