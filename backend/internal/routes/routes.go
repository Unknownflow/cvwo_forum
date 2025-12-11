package routes

import (
	"encoding/json"
	"net/http"

	"github.com/CVWO/sample-go-app/internal/handlers/comments"
	"github.com/CVWO/sample-go-app/internal/handlers/users"
	"github.com/CVWO/sample-go-app/internal/handlers/utils"
	"github.com/go-chi/chi/v5"
)

func GetRoutes() func(r chi.Router) {
	return func(r chi.Router) {
		r.Post("/login", func(w http.ResponseWriter, req *http.Request) {
			var user users.CreateUserRequest
			err := json.NewDecoder(req.Body).Decode(&user)
			if err != nil {
				utils.RespondError(w, http.StatusBadRequest, "invalid request body")
				return
			}
			defer req.Body.Close()

			// call handler to verify login info
			response := users.HandleVerify(w, req, user)

			if !response {
				utils.RespondError(w, http.StatusUnauthorized, "unauthorised access")
				return
			}

			utils.RespondJSON(w, http.StatusAccepted, "login success")
		})

		r.Post("/signup", func(w http.ResponseWriter, req *http.Request) {
			var newUser users.CreateUserRequest
			// decode req body
			err := json.NewDecoder(req.Body).Decode(&newUser)
			if err != nil {
				utils.RespondError(w, http.StatusBadRequest, "invalid request body")
				return
			}
			defer req.Body.Close()

			// call handler to create new user
			response, err := users.HandleCreate(w, req, newUser)

			if err != nil {
				utils.RespondError(w, http.StatusInternalServerError, "internal server error")
			}

			utils.RespondJSON(w, http.StatusCreated, response.Username+" creation success")
		})
	}
}

func CommentRoutes() chi.Router {
	r := chi.NewRouter()
	commentHandler := comments.CommentHandler{}
	r.Get("/", commentHandler.ListComments)
	r.Post("/", commentHandler.CreateComment)
	r.Get("/{id}", commentHandler.GetComments)
	r.Put("/{id}", commentHandler.UpdateComment)
	r.Delete("/{id}", commentHandler.DeleteComment)
	return r
}
