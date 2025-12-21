package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/cvwo_assignment/backend/internal/models"
	"github.com/cvwo_assignment/backend/internal/service"
	"github.com/go-chi/chi/v5"
)

// The handler depends on the Service interface
type CommentHandler struct {
	Service service.CommentService
}

func (h *CommentHandler) ReadComments(w http.ResponseWriter, r *http.Request) {
	comments, err := h.Service.GetAllComments()

	if err != nil {
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	RespondJSON(w, http.StatusOK, comments)
}

func (h *CommentHandler) ReadComment(w http.ResponseWriter, r *http.Request) {
	commentID := chi.URLParam(r, "id")
	commentIDInt, err := strconv.Atoi(commentID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request param")
		return
	}
	comment, err := h.Service.GetCommentByID(commentIDInt)

	if err != nil {
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	RespondJSON(w, http.StatusOK, comment)
}

func (h *CommentHandler) CreateComment(w http.ResponseWriter, r *http.Request) {
	var newComment models.CommentRequest
	err := json.NewDecoder(r.Body).Decode(&newComment)
	defer r.Body.Close()

	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request body format")
		return
	}

	err = h.Service.CreateComment(newComment)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	RespondJSON(w, http.StatusCreated, newComment)
}

func (h *CommentHandler) UpdateComment(w http.ResponseWriter, r *http.Request) {
	var newComment models.CommentRequest
	err := json.NewDecoder(r.Body).Decode(&newComment)
	defer r.Body.Close()

	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request body format")
		return
	}

	commentID := chi.URLParam(r, "id")
	commentIDInt, err := strconv.Atoi(commentID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid comment ID in URL")
		return
	}
	newComment.ID = commentIDInt
	err = h.Service.UpdateComment(newComment)

	if err != nil {
		if errors.Is(err, service.ErrNotFound) {
			RespondError(w, http.StatusNotFound, "Comment not found")
			return
		}
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	RespondJSON(w, http.StatusOK, newComment)
}

func (h *CommentHandler) DeleteComment(w http.ResponseWriter, r *http.Request) {
	commentID := chi.URLParam(r, "id")
	commentIDInt, err := strconv.Atoi(commentID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid comment ID in URL")
		return
	}
	err = h.Service.DeleteComment(commentIDInt)

	if err != nil {
		if errors.Is(err, service.ErrNotFound) {
			RespondError(w, http.StatusNotFound, "Comment not found")
			return
		}
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// 4. Success Response
	RespondJSON(w, http.StatusOK, map[string]string{
		"message": "Comment deleted successfully",
		"id":      commentID,
	})
}
