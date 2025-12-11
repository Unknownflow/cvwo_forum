package comments

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/CVWO/sample-go-app/internal/database"
	"github.com/CVWO/sample-go-app/internal/handlers/utils"
	"github.com/CVWO/sample-go-app/internal/models"
	"github.com/go-chi/chi/v5"
)

type CommentHandler struct {
	DB *database.Database
}

func (c CommentHandler) ListComments(w http.ResponseWriter, r *http.Request) {
	db, db_err := database.GetDB()

	// db cannot be reached
	if db_err != nil {
		utils.RespondError(w, http.StatusInternalServerError, "Server down")
		return
	}

	var comments []models.Comment
	query := `SELECT * FROM comment`

	err := db.Conn.Select(&comments, query)
	if err != nil {
		utils.RespondError(w, http.StatusInternalServerError,
			fmt.Sprintf("Failed to retrieve comments: %v", err))
		return
	}

	utils.RespondJSON(w, http.StatusOK, comments)
}

func (c CommentHandler) GetComments(w http.ResponseWriter, r *http.Request) {
	db, db_err := database.GetDB()

	// db cannot be reached
	if db_err != nil {
		utils.RespondError(w, http.StatusInternalServerError, "Server down")
		return
	}

	var comment models.Comment
	commentID := chi.URLParam(r, "id")
	query := "SELECT * FROM comment WHERE id = $1"

	err := db.Conn.QueryRowx(query, commentID).StructScan(&comment)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.RespondError(w, http.StatusNotFound, "Comment not found")
			return
		}
		utils.RespondError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to retrieve comment: %v", err))
		return
	}

	utils.RespondJSON(w, http.StatusOK, comment)
}

func (c CommentHandler) CreateComment(w http.ResponseWriter, r *http.Request) {
	var newComment models.Comment
	err := json.NewDecoder(r.Body).Decode(&newComment)

	// request json is of the incorrect format
	if err != nil {
		utils.RespondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	defer r.Body.Close()

	// Validate required fields
	if err := c.validateComment(&newComment); err != nil {
		utils.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	newComment.CreatedAt = time.Now()
	query := `INSERT INTO comment (body, author, created_at, post_id) 
			  VALUES (:body, :author, :created_at, :post_id) RETURNING id`
	db, db_err := database.GetDB()

	// db cannot be reached
	if db_err != nil {
		http.Error(w, "Server down", http.StatusInternalServerError)
		return
	}

	// start transaction
	tx := db.Conn.MustBegin()
	tx.NamedQuery(query, newComment)

	if err := tx.Commit(); err != nil {
		utils.RespondError(w, http.StatusInternalServerError, "Failed to commit transaction")
		return
	}

	utils.RespondJSON(w, http.StatusCreated, newComment)
}

func (c CommentHandler) UpdateComment(w http.ResponseWriter, r *http.Request) {
	var newComment models.Comment
	err := json.NewDecoder(r.Body).Decode(&newComment)

	// request json is of the incorrect format
	if err != nil {
		utils.RespondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	defer r.Body.Close()

	// Validate required fields
	if err := c.validateComment(&newComment); err != nil {
		utils.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	newComment.CreatedAt = time.Now()
	query := `UPDATE comment
			  SET body = :body, author = :author, created_at = :created_at
			  WHERE id = :id 
			  RETURNING id`
	db, db_err := database.GetDB()

	// db cannot be reached
	if db_err != nil {
		http.Error(w, "Server down", http.StatusInternalServerError)
		return
	}

	// start transaction
	tx := db.Conn.MustBegin()
	tx.NamedQuery(query, newComment)

	if err := tx.Commit(); err != nil {
		utils.RespondError(w, http.StatusInternalServerError, "Failed to commit transaction")
		return
	}

	utils.RespondJSON(w, http.StatusCreated, newComment)
}

func (c CommentHandler) DeleteComment(w http.ResponseWriter, r *http.Request) {
	db, db_err := database.GetDB()

	// db cannot be reached
	if db_err != nil {
		http.Error(w, "Server down", http.StatusInternalServerError)
		return
	}

	commentID := chi.URLParam(r, "id")
	query := "DELETE FROM comment WHERE id = $1"
	result, err := db.Conn.Exec(query, commentID)
	if err != nil {
		utils.RespondError(w, http.StatusInternalServerError,
			fmt.Sprintf("Failed to delete comment: %v", err))
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		utils.RespondError(w, http.StatusInternalServerError, "Failed to verify deletion")
		return
	}

	if rowsAffected == 0 {
		utils.RespondError(w, http.StatusNotFound, "Comment not found")
		return
	}

	utils.RespondJSON(w, http.StatusOK, map[string]string{
		"message": "Comment deleted successfully",
		"id":      commentID,
	})
}

func (c *CommentHandler) validateComment(comment *models.Comment) error {
	if comment.Body == "" {
		return fmt.Errorf("body field is required")
	}
	if comment.Author == "" {
		return fmt.Errorf("author field is required")
	}
	return nil
}
