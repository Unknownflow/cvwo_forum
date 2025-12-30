package repository

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/cvwo_assignment/backend/internal/models"
	"github.com/jmoiron/sqlx"
)

type CommentRepository interface {
	ReadAll() ([]models.CommentResponse, error)
	ReadByID(id int) (models.CommentResponse, error)
	Create(comment models.Comment) error
	Update(comment models.Comment) (rowsAffected int64, err error)
	Delete(id int) (rowsAffected int64, err error)
}

type commentRepository struct {
	db *sqlx.DB
}

func NewCommentRepository(db *sqlx.DB) CommentRepository {
	return &commentRepository{db: db}
}

func (r *commentRepository) ReadAll() ([]models.CommentResponse, error) {
	var comments []models.CommentResponse
	query := `SELECT comments.id, comments.body, comments.created_at,
			  comments.post_id, username AS "author" FROM comments
			  INNER JOIN users ON users.id = comments.user_id`
	err := r.db.Select(&comments, query)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}
	return comments, nil
}

func (r *commentRepository) ReadByID(id int) (models.CommentResponse, error) {
	var comment models.CommentResponse
	query := `SELECT comments.id, comments.body, comments.created_at,
			  comments.post_id, username AS "author" FROM comments
			  INNER JOIN users ON users.id = comments.user_id
			  WHERE comments.id = $1`
	err := r.db.QueryRowx(query, id).StructScan(&comment)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return models.CommentResponse{}, sql.ErrNoRows
		}
		return models.CommentResponse{}, fmt.Errorf("failed to execute query: %w", err)
	}
	return comment, nil
}

func (r *commentRepository) Create(comment models.Comment) error {
	query := `INSERT INTO comments (body, user_id, post_id) 
			  VALUES (:body, :user_id, :post_id) RETURNING id`

	tx := r.db.MustBegin()
	_, err := tx.NamedExec(query, comment)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to execute query: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (r *commentRepository) Update(comment models.Comment) (int64, error) {
	query := `UPDATE comments 
			  SET body = :body
			  WHERE id = :id`

	tx := r.db.MustBegin()
	result, err := tx.NamedExec(query, comment)

	if err != nil {
		tx.Rollback()
		return 0, fmt.Errorf("failed to execute update comment query: %w", err)
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

func (r *commentRepository) Delete(id int) (int64, error) {
	query := "DELETE FROM comments WHERE id = $1"
	result, err := r.db.Exec(query, id)

	if err != nil {
		return 0, fmt.Errorf("failed to execute delete comment query: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return 0, fmt.Errorf("failed to get rows affected: %w", err)
	}

	return rowsAffected, nil
}
