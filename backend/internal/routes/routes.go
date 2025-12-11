package routes

import (
	"github.com/CVWO/sample-go-app/internal/handlers"
	"github.com/go-chi/chi/v5"
)

func UserRoutes() func(r chi.Router) {
	return func(r chi.Router) {
		r.Post("/users", handlers.HandleSignUp)
	}
}

func AuthRoutes() func(r chi.Router) {
	return func(r chi.Router) {
		r.Post("/login", handlers.HandleLogin)
	}
}

func CommentRoutes() func(r chi.Router) {
	return func(r chi.Router) {
		r.Route("/", func(r chi.Router) {
			r.Get("/", handlers.ReadComments)
			r.Post("/", handlers.CreateComment)
		})
		r.Route("/{id}", func(r chi.Router) {
			r.Get("/", handlers.ReadComment)
			r.Put("/", handlers.UpdateComment)
			r.Delete("/", handlers.DeleteComment)
		})

	}
}
