package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/CVWO/sample-go-app/internal/models"
	"github.com/go-chi/chi/v5"
)

func ReadPosts(w http.ResponseWriter, r *http.Request) {
	db, ok := GetDBConnection(w)
	if !ok {
		return
	}

	var posts []models.Post
	query := "SELECT * FROM posts"

	err := db.Conn.Select(&posts, query)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to retrieve posts: %v", err))
		return
	}
	RespondJSON(w, http.StatusOK, posts)
}

func ReadTopicPosts(w http.ResponseWriter, r *http.Request) {
	db, ok := GetDBConnection(w)
	if !ok {
		return
	}

	topicID := chi.URLParam(r, "id")
	var posts []models.Post
	query := "SELECT * FROM posts WHERE topic_id = $1"

	err := db.Conn.Select(&posts, query, topicID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to retrieve posts: %v", err))
		return
	}
	RespondJSON(w, http.StatusOK, posts)
}

func ReadPost(w http.ResponseWriter, r *http.Request) {
	db, ok := GetDBConnection(w)
	if !ok {
		return
	}

	var post models.Post
	postID := chi.URLParam(r, "id")
	query := "SELECT * FROM posts WHERE id = $1"

	err := db.Conn.QueryRowx(query, postID).StructScan(&post)
	if err != nil {
		if err == sql.ErrNoRows {
			RespondError(w, http.StatusNotFound, "Post not found")
			return
		}
		RespondError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to retrieve post: %v", err))
		return
	}

	RespondJSON(w, http.StatusOK, post)
}

func CreatePost(w http.ResponseWriter, r *http.Request) {
	var newPost models.PostRequest
	err := json.NewDecoder(r.Body).Decode(&newPost)

	// request json is of the incorrect format
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	defer r.Body.Close()

	// Validate required fields
	if err := validatePost(&newPost); err != nil {
		RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	fmt.Print(newPost.TopicID)
	fmt.Print("\n")

	query := `INSERT INTO posts (header, body, author, topic_id) 
			  VALUES (:header, :body, :author, :topic_id) RETURNING id`
	db, ok := GetDBConnection(w)
	if !ok {
		return
	}

	// start transaction
	tx := db.Conn.MustBegin()
	tx.NamedQuery(query, newPost)

	if err := tx.Commit(); err != nil {
		RespondError(w, http.StatusInternalServerError, "Failed to commit transaction")
		return
	}

	RespondJSON(w, http.StatusCreated, newPost)
}

func UpdatePost(w http.ResponseWriter, r *http.Request) {
	var newPost models.PostRequest
	err := json.NewDecoder(r.Body).Decode(&newPost)

	// request json is of the incorrect format
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	defer r.Body.Close()

	// Validate required fields
	if err := validatePost(&newPost); err != nil {
		RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	// postID := chi.URLParam(r, "id")

	query := `UPDATE posts
			  SET header = :header, body = :body, author = :author
			  WHERE id = $1
			  RETURNING id`
	db, ok := GetDBConnection(w)
	if !ok {
		return
	}

	// start transaction
	tx := db.Conn.MustBegin()
	result, err := tx.NamedExec(query, newPost)
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

	RespondJSON(w, http.StatusCreated, newPost)
}

func DeletePost(w http.ResponseWriter, r *http.Request) {
	db, ok := GetDBConnection(w)
	if !ok {
		return
	}

	postID := chi.URLParam(r, "id")
	query := "DELETE FROM posts WHERE id = $1"
	result, err := db.Conn.Exec(query, postID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError,
			fmt.Sprintf("Failed to delete post: %v", err))
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
		"message": "Post deleted successfully",
		"id":      postID,
	})
}

func validatePost(post *models.PostRequest) error {
	if post.Header == "" {
		return fmt.Errorf("header field is required")
	}
	if post.Body == "" {
		return fmt.Errorf("body field is required")
	}
	if post.Author == "" {
		return fmt.Errorf("author field is required")
	}
	return nil
}
