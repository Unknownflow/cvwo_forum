package repository

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/cvwo_assignment/backend/internal/models"
	"github.com/jmoiron/sqlx"
)

type LikesRepository interface {
	ReadPostsLikedByUser(userID int) ([]models.PostResponse, error)
	ReadCommentsLikedByUser(userID int) ([]models.CommentResponse, error)
	ReadByPostID(postLikes models.PostLikes) (models.PostLikesResponse, error)
	ReadByCommentID(commentLikes models.CommentLikes) (models.CommentLikesResponse, error)
	CreatePostLike(postLikes models.PostLikes) error
	CreateCommentLike(commentLikes models.CommentLikes) error
	DeletePostLike(postLikes models.PostLikes) (int64, error)
	DeleteCommentLike(commentLikes models.CommentLikes) (int64, error)
	ReadPostLikesCount(postLikes models.PostLikes) (int64, error)
	ReadCommentLikesCount(commentLikes models.CommentLikes) (int64, error)
}

type likesRepository struct {
	db *sqlx.DB
}

func NewLikesRepository(db *sqlx.DB) LikesRepository {
	return &likesRepository{db: db}
}

func (r *likesRepository) ReadPostsLikedByUser(userID int) ([]models.PostResponse, error) {
	var resp []models.PostResponse
	query := `SELECT posts.id, posts.header, posts.body, posts.created_at,
			  posts.topic_id, users.username AS "author" FROM posts
			  LEFT JOIN likes ON posts.id = likes.post_id
			  LEFT JOIN users ON posts.user_id = users.id
			  WHERE likes.user_id = $1 AND likes.like_type = 1
			  ORDER BY created_at DESC`
	err := r.db.Select(&resp, query, userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}
	return resp, nil
}

func (r *likesRepository) ReadCommentsLikedByUser(userID int) ([]models.CommentResponse, error) {
	var resp []models.CommentResponse
	query := `SELECT comments.id, comments.body, comments.created_at,
			  comments.post_id, users.username AS "author" FROM comments
			  LEFT JOIN likes ON comments.id = likes.comment_id
			  LEFT JOIN users ON comments.user_id = users.id
			  WHERE likes.user_id = $1 AND likes.like_type = 1
			  ORDER BY created_at DESC`
	err := r.db.Select(&resp, query, userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}
	return resp, nil
}

func (r *likesRepository) ReadByPostID(postLikes models.PostLikes) (models.PostLikesResponse, error) {
	var resp models.PostLikesResponse
	query := `SELECT id, post_id, user_id, like_type, liked_at FROM likes
			  WHERE user_id = $1 AND post_id = $2`
	err := r.db.Get(&resp, query, postLikes.UserID, postLikes.PostID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return models.PostLikesResponse{}, nil
		}
		return models.PostLikesResponse{}, fmt.Errorf("failed to execute query: %w", err)
	}
	return resp, nil
}

func (r *likesRepository) ReadByCommentID(commentLikes models.CommentLikes) (models.CommentLikesResponse, error) {
	var resp models.CommentLikesResponse
	query := `SELECT id, comment_id, user_id, like_type, liked_at FROM likes
			  WHERE user_id = $1 AND comment_id = $2`
	err := r.db.QueryRowx(query, commentLikes.UserID, commentLikes.CommentID).StructScan(&resp)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return models.CommentLikesResponse{}, nil
		}
		return models.CommentLikesResponse{}, fmt.Errorf("failed to execute query: %w", err)
	}
	return resp, nil
}

func (r *likesRepository) CreatePostLike(postLikes models.PostLikes) error {
	query := `INSERT INTO likes (user_id, post_id, like_type) 
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

func (r *likesRepository) CreateCommentLike(commentLikes models.CommentLikes) error {
	query := `INSERT INTO likes (user_id, comment_id, like_type) 
			  VALUES (:user_id, :comment_id, :like_type) RETURNING id`
	// like_type is 1 or -1 depending on whether it is a like / dislike

	tx := r.db.MustBegin()
	_, err := tx.NamedExec(query, commentLikes)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to execute query: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (r *likesRepository) DeletePostLike(postLikes models.PostLikes) (int64, error) {
	query := "DELETE FROM likes WHERE user_id = :user_id AND post_id = :post_id"
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

func (r *likesRepository) DeleteCommentLike(commentLikes models.CommentLikes) (int64, error) {
	query := "DELETE FROM likes WHERE user_id = :user_id AND comment_id = :comment_id"
	result, err := r.db.NamedExec(query, commentLikes)

	if err != nil {
		return 0, fmt.Errorf("failed to execute delete like post query: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return 0, fmt.Errorf("failed to get rows affected: %w", err)
	}

	return rowsAffected, nil
}

func (r *likesRepository) ReadPostLikesCount(postLikes models.PostLikes) (int64, error) {
	var likesCount int64
	query := `SELECT COALESCE(SUM(like_type), 0) FROM likes
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

func (r *likesRepository) ReadCommentLikesCount(commentLikes models.CommentLikes) (int64, error) {
	var likesCount int64
	query := `SELECT COALESCE(SUM(like_type), 0) FROM likes
			  WHERE comment_id = $1`

	err := r.db.Get(&likesCount, query, commentLikes.CommentID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, nil
		}
		return 0, fmt.Errorf("failed to execute query: %w", err)
	}
	return likesCount, nil
}
