package repository

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/cvwo_assignment/backend/internal/models"
	"github.com/jmoiron/sqlx"
)

type PostRepository interface {
	ReadAll() ([]models.Post, error)
	ReadByID(id int) (models.Post, error)
	ReadCommentsByPostID(id int) ([]models.Comment, error)
	Create(post models.PostRequest) error
	Update(post models.PostRequest) (rowsAffected int64, err error)
	Delete(id int) (rowsAffected int64, err error)
}

type postRepository struct {
	db *sqlx.DB
}

func NewPostRepository(db *sqlx.DB) PostRepository {
	return &postRepository{db: db}
}

func (r *postRepository) ReadAll() ([]models.Post, error) {
	var posts []models.Post
	query := "SELECT * FROM posts"
	err := r.db.Select(&posts, query)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}
	return posts, nil
}

func (r *postRepository) ReadByID(id int) (models.Post, error) {
	var post models.Post
	query := "SELECT * FROM posts WHERE id = $1"
	err := r.db.QueryRowx(query, id).StructScan(&post)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return models.Post{}, sql.ErrNoRows
		}
		return models.Post{}, fmt.Errorf("failed to execute query: %w", err)
	}
	return post, nil
}

func (r *postRepository) ReadCommentsByPostID(id int) ([]models.Comment, error) {
	var comments []models.Comment
	query := "SELECT * FROM comments WHERE post_id = $1"
	err := r.db.Select(&comments, query, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}
	return comments, nil
}

func (r *postRepository) Create(post models.PostRequest) error {
	query := `INSERT INTO posts (header, body, author, topic_id) 
			  VALUES (:header, :body, :author, :topic_id) RETURNING id`

	tx := r.db.MustBegin()
	_, err := tx.NamedExec(query, post)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to execute query: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (r *postRepository) Update(post models.PostRequest) (int64, error) {
	query := `UPDATE posts 
			  SET header = :header, body = :body
			  WHERE id = :id`

	tx := r.db.MustBegin()
	result, err := tx.NamedExec(query, post)

	if err != nil {
		tx.Rollback()
		return 0, fmt.Errorf("failed to execute update post query: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		tx.Rollback()
		return 0, fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		tx.Rollback()
		return 0, nil
	}

	if err := tx.Commit(); err != nil {
		return 0, fmt.Errorf("failed to commit update transaction: %w", err)
	}

	return rowsAffected, nil
}

func (r *postRepository) Delete(id int) (int64, error) {
	query := "DELETE FROM posts WHERE id = $1"
	result, err := r.db.Exec(query, id)

	if err != nil {
		return 0, fmt.Errorf("failed to execute delete post query: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return 0, fmt.Errorf("failed to get rows affected: %w", err)
	}

	return rowsAffected, nil
}
