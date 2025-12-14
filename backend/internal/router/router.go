package router

import (
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

	r.Route("/auth", routes.AuthRoutes(conn))
	r.Route("/comments", routes.CommentRoutes(conn))
	r.Route("/topics", routes.TopicsRoutes(conn))
	r.Route("/posts", routes.PostsRoutes(conn))
}
