package router

import (
	"github.com/CVWO/sample-go-app/internal/middlewares"
	"github.com/CVWO/sample-go-app/internal/routes"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jmoiron/sqlx"
)

func Setup(conn *sqlx.DB) chi.Router {
	r := chi.NewRouter()
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
