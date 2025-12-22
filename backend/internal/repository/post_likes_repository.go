package repository

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/cvwo_assignment/backend/internal/models"
	"github.com/jmoiron/sqlx"
)

type PostLikesRepository interface {
	ReadAll() ([]models.PostLikesResponse, error)
	ReadByID(likePost models.PostLikes) (models.PostLikesResponse, error)
	Create(likePost models.PostLikes) error
	Delete(likePost models.PostLikes) (rowsAffected int64, err error)
}

type postLikesRepository struct {
	db *sqlx.DB
}

func NewPostLikesRepository(db *sqlx.DB) PostLikesRepository {
	return &postLikesRepository{db: db}
}

func (r *postLikesRepository) ReadAll() ([]models.PostLikesResponse, error) {
	var likes []models.PostLikesResponse
	query := `SELECT * FROM post_likes`
	err := r.db.Select(&likes, query)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}
	return likes, nil
}

func (r *postLikesRepository) ReadByID(postLikes models.PostLikes) (models.PostLikesResponse, error) {
	var postLikesResp models.PostLikesResponse
	query := `SELECT * FROM post_likes
			  WHERE user_id = $1 AND post_id = $2`
	err := r.db.QueryRowx(query, postLikes).StructScan(&postLikesResp)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return models.PostLikesResponse{}, sql.ErrNoRows
		}
		return models.PostLikesResponse{}, fmt.Errorf("failed to execute query: %w", err)
	}
	return postLikesResp, nil
}

func (r *postLikesRepository) Create(likePost models.PostLikes) error {
	query := `INSERT INTO post_likes (user_id, post_id, like_type) 
			  VALUES (:user_id, :post_id, :like_type) RETURNING id`
	// like_type is 1 or -1 depending on whether it is a like / dislike

	tx := r.db.MustBegin()
	_, err := tx.NamedExec(query, likePost)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to execute query: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (r *postLikesRepository) Delete(likePost models.PostLikes) (int64, error) {
	query := "DELETE FROM post_likes WHERE user_id = $1 AND post_id = $2"
	result, err := r.db.NamedExec(query, likePost)

	if err != nil {
		return 0, fmt.Errorf("failed to execute delete like post query: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return 0, fmt.Errorf("failed to get rows affected: %w", err)
	}

	return rowsAffected, nil
}
