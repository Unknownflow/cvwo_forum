package repository

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/cvwo_assignment/backend/internal/models"
	"github.com/jmoiron/sqlx"
)

type PostRepository interface {
	ReadAll() ([]models.PostResponse, error)
	ReadByID(id int) (models.PostResponse, error)
	ReadCommentsByPostID(id int, order string) ([]models.CommentResponse, error)
	Create(post models.Post) error
	Update(post models.PostRequest) (rowsAffected int64, err error)
	Delete(id int) (rowsAffected int64, err error)
}

type postRepository struct {
	db *sqlx.DB
}

func NewPostRepository(db *sqlx.DB) PostRepository {
	return &postRepository{db: db}
}

func (r *postRepository) ReadAll() ([]models.PostResponse, error) {
	var posts []models.PostResponse
	query := `SELECT posts.id, posts.header, posts.body, posts.created_at, 
			  posts.topic_id, username AS "author" FROM posts
			  INNER JOIN users ON users.id = posts.user_id`
	err := r.db.Select(&posts, query)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}

	return posts, nil
}

func (r *postRepository) ReadByID(id int) (models.PostResponse, error) {
	var post models.PostResponse
	query := `SELECT posts.id, posts.header, posts.body, posts.created_at, 
			  posts.topic_id, username AS "author" FROM posts
			  INNER JOIN users ON users.id = posts.user_id
			  WHERE posts.id = $1`
	err := r.db.QueryRowx(query, id).StructScan(&post)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return models.PostResponse{}, sql.ErrNoRows
		}
		return models.PostResponse{}, fmt.Errorf("failed to execute query: %w", err)
	}
	return post, nil
}

func (r *postRepository) ReadCommentsByPostID(id int, order string) ([]models.CommentResponse, error) {
	var comments []models.CommentResponse
	query := fmt.Sprintf(`SELECT comments.id, comments.body, comments.created_at,
			  comments.post_id, comments.likes_count, username AS "author" FROM comments
			  INNER JOIN users ON users.id = comments.user_id
			  LEFT JOIN likes ON likes.comment_id = comments.id
			  WHERE comments.post_id = $1
			  GROUP BY comments.id, users.id
			  ORDER BY created_at %s`, order)
	err := r.db.Select(&comments, query, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}
	return comments, nil
}

func (r *postRepository) Create(post models.Post) error {
	query := `INSERT INTO posts (header, body, user_id, topic_id) 
			  VALUES (:header, :body, :user_id, :topic_id) RETURNING id`

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
