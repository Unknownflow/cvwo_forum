package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/CVWO/sample-go-app/internal/models"
	"github.com/go-chi/chi/v5"
)

func ReadComments(w http.ResponseWriter, r *http.Request) {
	db, ok := GetDBConnection(w)
	if !ok {
		return
	}

	var comments []models.Comment
	query := `SELECT * FROM comments`

	err := db.Conn.Select(&comments, query)
	if err != nil {
		RespondError(w, http.StatusInternalServerError,
			fmt.Sprintf("Failed to retrieve comments: %v", err))
		return
	}

	RespondJSON(w, http.StatusOK, comments)
}

func ReadComment(w http.ResponseWriter, r *http.Request) {
	db, ok := GetDBConnection(w)
	if !ok {
		return
	}

	var comment models.Comment
	commentID := chi.URLParam(r, "id")
	query := "SELECT * FROM comments WHERE id = $1"

	err := db.Conn.QueryRowx(query, commentID).StructScan(&comment)
	if err != nil {
		if err == sql.ErrNoRows {
			RespondError(w, http.StatusNotFound, "Comment not found")
			return
		}
		RespondError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to retrieve comment: %v", err))
		return
	}

	RespondJSON(w, http.StatusOK, comment)
}

func CreateComment(w http.ResponseWriter, r *http.Request) {
	var newComment models.Comment
	err := json.NewDecoder(r.Body).Decode(&newComment)

	// request json is of the incorrect format
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	defer r.Body.Close()

	// Validate required fields
	if err := validateComment(&newComment); err != nil {
		RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	newComment.CreatedAt = time.Now()
	query := `INSERT INTO comments (body, author, created_at, post_id) 
			  VALUES (:body, :author, :created_at, :post_id) RETURNING id`
	db, ok := GetDBConnection(w)
	if !ok {
		return
	}

	// start transaction
	tx := db.Conn.MustBegin()
	tx.NamedQuery(query, newComment)

	if err := tx.Commit(); err != nil {
		RespondError(w, http.StatusInternalServerError, "Failed to commit transaction")
		return
	}

	RespondJSON(w, http.StatusCreated, newComment)
}

func UpdateComment(w http.ResponseWriter, r *http.Request) {
	var newComment models.Comment
	err := json.NewDecoder(r.Body).Decode(&newComment)

	// request json is of the incorrect format
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	defer r.Body.Close()

	// Validate required fields
	if err := validateComment(&newComment); err != nil {
		RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	newComment.CreatedAt = time.Now()
	query := `UPDATE comments
			  SET body = :body, author = :author, created_at = :created_at
			  WHERE id = :id 
			  RETURNING id`
	db, ok := GetDBConnection(w)
	if !ok {
		return
	}

	// start transaction
	tx := db.Conn.MustBegin()
	result, err := tx.NamedExec(query, newComment)

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

	RespondJSON(w, http.StatusCreated, newComment)
}

func DeleteComment(w http.ResponseWriter, r *http.Request) {
	db, ok := GetDBConnection(w)
	if !ok {
		return
	}

	commentID := chi.URLParam(r, "id")
	query := "DELETE FROM comments WHERE id = $1"
	result, err := db.Conn.Exec(query, commentID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError,
			fmt.Sprintf("Failed to delete comment: %v", err))
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "Failed to verify deletion")
		return
	}

	if rowsAffected == 0 {
		RespondError(w, http.StatusNotFound, "Comment not found")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]string{
		"message": "Comment deleted successfully",
		"id":      commentID,
	})
}

func validateComment(comment *models.Comment) error {
	if comment.Body == "" {
		return fmt.Errorf("body field is required")
	}
	if comment.Author == "" {
		return fmt.Errorf("author field is required")
	}
	return nil
}
