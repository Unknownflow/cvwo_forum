package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/CVWO/sample-go-app/internal/models"
	"github.com/CVWO/sample-go-app/internal/service"
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
	posts, err := h.Service.GetAllPostsByTopicID(topicIDInt)

	if err != nil {
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	RespondJSON(w, http.StatusOK, posts)
}

func (h *TopicHandler) CreateTopic(w http.ResponseWriter, r *http.Request) {
	var newTopic models.Topic

	err := json.NewDecoder(r.Body).Decode(&newTopic)
	defer r.Body.Close()

	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request body format")
		return
	}

	err = h.Service.CreateTopic(newTopic)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	RespondJSON(w, http.StatusCreated, newTopic)
}

func (h *TopicHandler) UpdateTopic(w http.ResponseWriter, r *http.Request) {
	var newTopic models.Topic
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

	// 4. Success Response
	RespondJSON(w, http.StatusOK, map[string]string{
		"message": "Topic deleted successfully",
		"id":      topicID,
	})
}
