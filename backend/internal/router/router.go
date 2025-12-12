package router

import (
	"github.com/CVWO/sample-go-app/internal/routes"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func Setup() chi.Router {
	r := chi.NewRouter()
	setUpRoutes(r)
	return r
}

func setUpRoutes(r chi.Router) {
	r.Use(middleware.Logger)
	r.Route("/", routes.UserRoutes())
	r.Route("/auth", routes.AuthRoutes())
	r.Route("/comments", routes.CommentRoutes())
	r.Route("/topics", routes.TopicsRoutes())
}
