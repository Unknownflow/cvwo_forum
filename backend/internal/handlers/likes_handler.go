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
type LikesHandler struct {
	Service service.LikesService
}

func (h *LikesHandler) ReadPostLikes(w http.ResponseWriter, r *http.Request) {
	claims, ok := auth.GetUserFromContext(r.Context())
	if !ok {
		return
	}

	order := r.URL.Query().Get("order")
	if order != "asc" && order != "desc" {
		RespondError(w, http.StatusInternalServerError, "invalid order")
		return
	}

	posts, err := h.Service.GetAllPostLikesByUser(claims.ID, order)

	if err != nil {
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	RespondJSON(w, http.StatusOK, posts)
}

func (h *LikesHandler) ReadCommentLikes(w http.ResponseWriter, r *http.Request) {
	claims, ok := auth.GetUserFromContext(r.Context())
	if !ok {
		return
	}

	order := r.URL.Query().Get("order")
	if order != "asc" && order != "desc" {
		RespondError(w, http.StatusInternalServerError, "invalid order")
		return
	}

	posts, err := h.Service.GetAllCommentLikesByUser(claims.ID, order)

	if err != nil {
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	RespondJSON(w, http.StatusOK, posts)
}

func (h *LikesHandler) ReadPostLike(w http.ResponseWriter, r *http.Request) {
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

func (h *LikesHandler) ReadCommentLike(w http.ResponseWriter, r *http.Request) {
	commentID := chi.URLParam(r, "id")
	commentIDInt, err := strconv.Atoi(commentID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request param")
		return
	}

	claims, ok := auth.GetUserFromContext(r.Context())
	if !ok {
		return
	}

	post, err := h.Service.GetCommentLike(claims.ID, commentIDInt)

	if err != nil {
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	RespondJSON(w, http.StatusOK, post)
}

func (h *LikesHandler) CreatePostLike(w http.ResponseWriter, r *http.Request) {
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

func (h *LikesHandler) CreateCommentLike(w http.ResponseWriter, r *http.Request) {
	claims, ok := auth.GetUserFromContext(r.Context())
	if !ok {
		return
	}

	var newComment models.CommentLikesRequest
	err := json.NewDecoder(r.Body).Decode(&newComment)
	defer r.Body.Close()

	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request body format")
		return
	}

	err = h.Service.CreateCommentLike(claims.ID, newComment)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	RespondJSON(w, http.StatusCreated, newComment)
}

func (h *LikesHandler) DeletePostLike(w http.ResponseWriter, r *http.Request) {
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

	likeTypeQuery := r.URL.Query().Get("like_type")
	likeType, err := strconv.Atoi(likeTypeQuery)
	if likeType > 1 || likeType < -1 {
		RespondError(w, http.StatusInternalServerError, "invalid order")
		return
	}

	err = h.Service.DeletePostLike(claims.ID, postIDInt, likeType)

	if err != nil {
		if errors.Is(err, service.ErrNotFound) {
			RespondError(w, http.StatusNotFound, "Post not found")
			return
		}
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	RespondJSON(w, http.StatusOK, map[string]string{
		"message": "Post deleted successfully",
		"id":      postID,
	})
}

func (h *LikesHandler) DeleteCommentLike(w http.ResponseWriter, r *http.Request) {
	commentID := chi.URLParam(r, "id")
	commentIDInt, err := strconv.Atoi(commentID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid post ID in URL")
		return
	}
	claims, ok := auth.GetUserFromContext(r.Context())
	if !ok {
		return
	}

	likeTypeQuery := r.URL.Query().Get("like_type")
	likeType, err := strconv.Atoi(likeTypeQuery)
	if likeType > 1 || likeType < -1 {
		RespondError(w, http.StatusInternalServerError, "invalid order")
		return
	}

	err = h.Service.DeleteCommentLike(claims.ID, commentIDInt, likeType)

	if err != nil {
		if errors.Is(err, service.ErrNotFound) {
			RespondError(w, http.StatusNotFound, "Post not found")
			return
		}
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	RespondJSON(w, http.StatusOK, map[string]string{
		"message": "Post deleted successfully",
		"id":      commentID,
	})
}
