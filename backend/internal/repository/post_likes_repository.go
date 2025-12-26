package repository

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/cvwo_assignment/backend/internal/models"
	"github.com/jmoiron/sqlx"
)

type PostLikesRepository interface {
	ReadPostsLikedByUser(userID int) ([]models.PostResponse, error)
	ReadByID(likePost models.PostLikes) (models.PostLikesResponse, error)
	Create(likePost models.PostLikes) error
	Delete(likePost models.PostLikes) (rowsAffected int64, err error)
	ReadLikesCount(likePost models.PostLikes) (int64, error)
}

type postLikesRepository struct {
	db *sqlx.DB
}

func NewPostLikesRepository(db *sqlx.DB) PostLikesRepository {
	return &postLikesRepository{db: db}
}

func (r *postLikesRepository) ReadPostsLikedByUser(userID int) ([]models.PostResponse, error) {
	var postLikesResp []models.PostResponse
	query := `SELECT posts.id, posts.header, posts.body, posts.created_at,
			  posts.topic_id, users.username AS "author" FROM posts
			  LEFT JOIN post_likes ON posts.id = post_likes.post_id
			  LEFT JOIN users ON post_likes.user_id = users.id
			  WHERE post_likes.user_id = $1 AND post_likes.like_type = 1`
	err := r.db.Select(&postLikesResp, query, userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}
	return postLikesResp, nil
}

func (r *postLikesRepository) ReadByID(postLikes models.PostLikes) (models.PostLikesResponse, error) {
	var postLikesResp models.PostLikesResponse
	query := `SELECT * FROM post_likes
			  WHERE user_id = $1 AND post_id = $2`
	err := r.db.QueryRowx(query, postLikes.UserID, postLikes.PostID).StructScan(&postLikesResp)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return models.PostLikesResponse{}, nil
		}
		return models.PostLikesResponse{}, fmt.Errorf("failed to execute query: %w", err)
	}
	return postLikesResp, nil
}

func (r *postLikesRepository) Create(postLikes models.PostLikes) error {
	query := `INSERT INTO post_likes (user_id, post_id, like_type) 
			  VALUES (:user_id, :post_id, :like_type) RETURNING id`
	// like_type is 1 or -1 depending on whether it is a like / dislike

	tx := r.db.MustBegin()
	_, err := tx.NamedExec(query, postLikes)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to execute query: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (r *postLikesRepository) Delete(postLikes models.PostLikes) (int64, error) {
	query := "DELETE FROM post_likes WHERE user_id = :user_id AND post_id = :post_id"
	result, err := r.db.NamedExec(query, postLikes)

	if err != nil {
		return 0, fmt.Errorf("failed to execute delete like post query: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return 0, fmt.Errorf("failed to get rows affected: %w", err)
	}

	return rowsAffected, nil
}

func (r *postLikesRepository) ReadLikesCount(postLikes models.PostLikes) (int64, error) {
	var likesCount int64
	query := `SELECT SUM(like_type) FROM post_likes
			  WHERE post_id = $1`

	err := r.db.Get(&likesCount, query, postLikes.PostID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, nil
		}
		return 0, fmt.Errorf("failed to execute query: %w", err)
	}
	return likesCount, nil
}
