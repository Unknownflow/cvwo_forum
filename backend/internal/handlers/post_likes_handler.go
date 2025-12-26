package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/cvwo_assignment/backend/internal/auth"
	"github.com/cvwo_assignment/backend/internal/models"
	"github.com/cvwo_assignment/backend/internal/service"
	"github.com/go-chi/chi/v5"
)

// The handler depends on the Service interface
type PostLikesHandler struct {
	Service service.PostLikesService
}

func (h *PostLikesHandler) ReadPostLikes(w http.ResponseWriter, r *http.Request) {
	claims, ok := auth.GetUserFromContext(r.Context())
	if !ok {
		return
	}
	posts, err := h.Service.GetAllPostLikesByUser(claims.ID)

	if err != nil {
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	RespondJSON(w, http.StatusOK, posts)
}

func (h *PostLikesHandler) ReadPostLike(w http.ResponseWriter, r *http.Request) {
	postID := chi.URLParam(r, "id")
	postIDInt, err := strconv.Atoi(postID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request param")
		return
	}

	claims, ok := auth.GetUserFromContext(r.Context())
	if !ok {
		return
	}

	post, err := h.Service.GetPostLike(claims.ID, postIDInt)

	if err != nil {
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	RespondJSON(w, http.StatusOK, post)
}

func (h *PostLikesHandler) CreatePostLike(w http.ResponseWriter, r *http.Request) {
	claims, ok := auth.GetUserFromContext(r.Context())
	if !ok {
		return
	}

	var newPost models.PostLikesRequest
	err := json.NewDecoder(r.Body).Decode(&newPost)
	defer r.Body.Close()

	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request body format")
		return
	}

	err = h.Service.CreatePostLike(claims.ID, newPost)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	RespondJSON(w, http.StatusCreated, newPost)
}

func (h *PostLikesHandler) DeletePostLike(w http.ResponseWriter, r *http.Request) {
	postID := chi.URLParam(r, "id")
	postIDInt, err := strconv.Atoi(postID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid post ID in URL")
		return
	}
	claims, ok := auth.GetUserFromContext(r.Context())
	if !ok {
		return
	}

	err = h.Service.DeletePostLike(claims.ID, postIDInt)

	if err != nil {
		if errors.Is(err, service.ErrNotFound) {
			RespondError(w, http.StatusNotFound, "Post not found")
			return
		}
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// 4. Success Response
	RespondJSON(w, http.StatusOK, map[string]string{
		"message": "Post deleted successfully",
		"id":      postID,
	})
}

func (h *PostLikesHandler) ReadPostLikesCount(w http.ResponseWriter, r *http.Request) {
	postID := chi.URLParam(r, "id")
	postIDInt, err := strconv.Atoi(postID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request param")
		return
	}

	post, err := h.Service.GetPostLikesCount(postIDInt)

	if err != nil {
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	RespondJSON(w, http.StatusOK, post)
}
