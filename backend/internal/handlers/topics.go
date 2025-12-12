package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/CVWO/sample-go-app/internal/models"
	"github.com/go-chi/chi/v5"
)

func ReadTopics(w http.ResponseWriter, r *http.Request) {
	db, ok := GetDBConnection(w)
	if !ok {
		return
	}

	var topics []models.Topic
	query := "SELECT * FROM topics"

	err := db.Conn.Select(&topics, query)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to retrieve topics: %v", err))
		return
	}
	RespondJSON(w, http.StatusOK, topics)
}

func ReadTopic(w http.ResponseWriter, r *http.Request) {
	db, ok := GetDBConnection(w)
	if !ok {
		return
	}

	var topic models.Topic
	topicID := chi.URLParam(r, "id")
	query := "SELECT * FROM topics WHERE id = $1"

	err := db.Conn.QueryRowx(query, topicID).StructScan(&topic)
	if err != nil {
		if err == sql.ErrNoRows {
			RespondError(w, http.StatusNotFound, "Topic not found")
			return
		}
		RespondError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to retrieve topic: %v", err))
		return
	}

	RespondJSON(w, http.StatusOK, topic)
}

func CreateTopic(w http.ResponseWriter, r *http.Request) {
	var newTopic models.Topic
	err := json.NewDecoder(r.Body).Decode(&newTopic)

	// request json is of the incorrect format
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	defer r.Body.Close()

	// Validate required fields
	if err := validateTopic(&newTopic); err != nil {
		RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	query := `INSERT INTO topics (title) 
			  VALUES (:title) RETURNING id`
	db, ok := GetDBConnection(w)
	if !ok {
		return
	}

	// start transaction
	tx := db.Conn.MustBegin()
	tx.NamedQuery(query, newTopic)

	if err := tx.Commit(); err != nil {
		RespondError(w, http.StatusInternalServerError, "Failed to commit transaction")
		return
	}

	RespondJSON(w, http.StatusCreated, newTopic)
}

func UpdateTopic(w http.ResponseWriter, r *http.Request) {
	var newTopic models.Topic
	err := json.NewDecoder(r.Body).Decode(&newTopic)

	// request json is of the incorrect format
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	defer r.Body.Close()

	// Validate required fields
	if err := validateTopic(&newTopic); err != nil {
		RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	topicID := chi.URLParam(r, "id")
	topicIDInt, err := strconv.Atoi(topicID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "incorrect url")
		return
	}

	newTopic.ID = topicIDInt
	query := `UPDATE topics
			  SET title = :title
			  WHERE id = :id 
			  RETURNING id`
	db, ok := GetDBConnection(w)
	if !ok {
		return
	}

	// start transaction
	tx := db.Conn.MustBegin()
	result, err := tx.NamedExec(query, newTopic)
	if err != nil {
		tx.Rollback()
		RespondError(w, http.StatusInternalServerError, "Failed to execute query")
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		tx.Rollback()
		RespondError(w, http.StatusInternalServerError, "Failed to get rows affected")
		return
	}

	if rowsAffected == 0 {
		tx.Rollback()
		RespondError(w, http.StatusNotFound, "Record not found")
		return
	}

	if err := tx.Commit(); err != nil {
		RespondError(w, http.StatusInternalServerError, "Failed to commit transaction")
		return
	}

	RespondJSON(w, http.StatusCreated, newTopic)
}

func DeleteTopic(w http.ResponseWriter, r *http.Request) {
	db, ok := GetDBConnection(w)
	if !ok {
		return
	}

	topicID := chi.URLParam(r, "id")
	query := "DELETE FROM topics WHERE id = $1"
	result, err := db.Conn.Exec(query, topicID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError,
			fmt.Sprintf("Failed to delete topic: %v", err))
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "Failed to verify deletion")
		return
	}

	if rowsAffected == 0 {
		RespondError(w, http.StatusNotFound, "Topiic not found")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]string{
		"message": "Topic deleted successfully",
		"id":      topicID,
	})
}

func validateTopic(topic *models.Topic) error {
	if topic.Title == "" {
		return fmt.Errorf("title field is required")
	}
	return nil
}
