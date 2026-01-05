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
type PostHandler struct {
	Service service.PostService
}

func (h *PostHandler) ReadPost(w http.ResponseWriter, r *http.Request) {
	postID := chi.URLParam(r, "id")
	postIDInt, err := strconv.Atoi(postID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request param")
		return
	}
	post, err := h.Service.GetPostByID(postIDInt)

	if err != nil {
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	RespondJSON(w, http.StatusOK, post)
}

func (h *PostHandler) ReadPostComments(w http.ResponseWriter, r *http.Request) {
	postID := chi.URLParam(r, "id")
	postIDInt, err := strconv.Atoi(postID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request param")
		return
	}

	key := r.URL.Query().Get("key")
	if key != "likes_count" && key != "created_at" {
		RespondError(w, http.StatusInternalServerError, "invalid key")
		return
	}

	order := r.URL.Query().Get("order")
	if order != "asc" && order != "desc" {
		RespondError(w, http.StatusInternalServerError, "invalid order")
		return
	}

	comments, err := h.Service.GetAllCommentsByPostID(postIDInt, key, order)

	if err != nil {
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	RespondJSON(w, http.StatusOK, comments)
}

func (h *PostHandler) CreatePost(w http.ResponseWriter, r *http.Request) {
	claims, ok := auth.GetUserFromContext(r.Context())
	if !ok {
		return
	}

	var newPost models.PostRequest
	err := json.NewDecoder(r.Body).Decode(&newPost)
	defer r.Body.Close()

	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request body format")
		return
	}

	err = h.Service.CreatePost(claims.ID, newPost)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	RespondJSON(w, http.StatusCreated, newPost)
}

func (h *PostHandler) UpdatePost(w http.ResponseWriter, r *http.Request) {
	var newPost models.PostRequest
	err := json.NewDecoder(r.Body).Decode(&newPost)
	defer r.Body.Close()

	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request body format")
		return
	}

	postID := chi.URLParam(r, "id")
	postIDInt, err := strconv.Atoi(postID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid post ID in URL")
		return
	}
	newPost.ID = postIDInt
	err = h.Service.UpdatePost(newPost)

	if err != nil {
		if errors.Is(err, service.ErrNotFound) {
			RespondError(w, http.StatusNotFound, "Post not found")
			return
		}
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	RespondJSON(w, http.StatusOK, newPost)
}

func (h *PostHandler) DeletePost(w http.ResponseWriter, r *http.Request) {
	postID := chi.URLParam(r, "id")
	postIDInt, err := strconv.Atoi(postID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid post ID in URL")
		return
	}
	err = h.Service.DeletePost(postIDInt)

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
