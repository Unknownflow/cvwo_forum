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
	db, err := database.GetDB()

	// db cannot be reached
	if err != nil {
		http.Error(w, "Server down", http.StatusInternalServerError)
		return
	}

	var comments []models.Comment
	query := `SELECT * FROM comment`

	db.Conn.Select(&comments, query)
	utils.RespondJSON(w, http.StatusOK, comments)
}

func (c CommentHandler) GetComments(w http.ResponseWriter, r *http.Request) {
	db, err := database.GetDB()

	// db cannot be reached
	if err != nil {
		http.Error(w, "Server down", http.StatusInternalServerError)
		return
	}

	var comment models.Comment
	commentID := chi.URLParam(r, "id")
	query := "SELECT * FROM comment WHERE id = $1"

	err = db.Conn.QueryRowx(query, commentID).StructScan(&comment)
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

	// body and author is not present in the comment
	if newComment.Body == "" || newComment.Author == "" {
		utils.RespondError(w, http.StatusBadRequest, "Body and Author fields are required")
		return
	}

	newComment.CreatedAt = time.Now()
	query := `INSERT INTO comment (body, author, created_at, post_id) 
			  VALUES (:body, :author, :created_at, :post_id) RETURNING id`
	db, err := database.GetDB()

	// db cannot be reached
	if err != nil {
		http.Error(w, "Server down", http.StatusInternalServerError)
		return
	}

	// start transaction
	tx := db.Conn.MustBegin()
	tx.NamedQuery(query, newComment)
	tx.Commit()

	utils.RespondJSON(w, http.StatusCreated, newComment)
}

func (c CommentHandler) UpdateComment(w http.ResponseWriter, r *http.Request) {

}

func (c CommentHandler) DeleteComment(w http.ResponseWriter, r *http.Request) {

}
