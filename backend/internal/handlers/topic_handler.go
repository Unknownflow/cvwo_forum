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
type TopicHandler struct {
	Service service.TopicService
}

func (h *TopicHandler) ReadTopics(w http.ResponseWriter, r *http.Request) {
	topics, err := h.Service.GetAllTopics()

	if err != nil {
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	RespondJSON(w, http.StatusOK, topics)
}

func (h *TopicHandler) ReadTopic(w http.ResponseWriter, r *http.Request) {
	topicID := chi.URLParam(r, "id")
	topicIDInt, err := strconv.Atoi(topicID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request param")
		return
	}
	topic, err := h.Service.GetTopicByID(topicIDInt)

	if err != nil {
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	RespondJSON(w, http.StatusOK, topic)
}

func (h *TopicHandler) ReadTopicPosts(w http.ResponseWriter, r *http.Request) {
	topicID := chi.URLParam(r, "id")
	topicIDInt, err := strconv.Atoi(topicID)
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

	searchTerm := r.URL.Query().Get("searchTerm")
	posts, err := h.Service.GetAllPostsByTopicID(topicIDInt, key, order, searchTerm)

	if err != nil {
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	RespondJSON(w, http.StatusOK, posts)
}

func (h *TopicHandler) CreateTopic(w http.ResponseWriter, r *http.Request) {
	var newTopicReq models.TopicRequest

	err := json.NewDecoder(r.Body).Decode(&newTopicReq)
	defer r.Body.Close()

	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request body format")
		return
	}

	claims, ok := auth.GetUserFromContext(r.Context())
	if !ok {
		return
	}

	err = h.Service.CreateTopic(claims.ID, newTopicReq)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	RespondJSON(w, http.StatusCreated, newTopicReq)
}

func (h *TopicHandler) UpdateTopic(w http.ResponseWriter, r *http.Request) {
	var newTopic models.TopicRequest
	err := json.NewDecoder(r.Body).Decode(&newTopic)
	defer r.Body.Close()

	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request body format")
		return
	}

	topicID := chi.URLParam(r, "id")
	topicIDInt, err := strconv.Atoi(topicID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid topic ID in URL")
		return
	}
	newTopic.ID = topicIDInt
	err = h.Service.UpdateTopic(newTopic)

	if err != nil {
		if errors.Is(err, service.ErrNotFound) {
			RespondError(w, http.StatusNotFound, "Topic not found")
			return
		}
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	RespondJSON(w, http.StatusOK, newTopic)
}

func (h *TopicHandler) DeleteTopic(w http.ResponseWriter, r *http.Request) {
	topicID := chi.URLParam(r, "id")
	topicIDInt, err := strconv.Atoi(topicID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid topic ID in URL")
		return
	}
	err = h.Service.DeleteTopic(topicIDInt)

	if err != nil {
		if errors.Is(err, service.ErrNotFound) {
			RespondError(w, http.StatusNotFound, "Topic not found")
			return
		}
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// Success Response
	RespondJSON(w, http.StatusOK, map[string]string{
		"message": "Topic deleted successfully",
		"id":      topicID,
	})
}
