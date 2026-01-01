package repository

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/cvwo_assignment/backend/internal/models"
	"github.com/jmoiron/sqlx"
)

type LikesRepository interface {
	ReadPostsLikedByUser(userID int, order string) ([]models.PostResponse, error)
	ReadCommentsLikedByUser(userID int, order string) ([]models.CommentResponse, error)
	ReadByPostID(postLikes models.PostLikes) (models.PostLikesResponse, error)
	ReadByCommentID(commentLikes models.CommentLikes) (models.CommentLikesResponse, error)
	CreatePostLike(postLikes models.PostLikes) error
	CreateCommentLike(commentLikes models.CommentLikes) error
	DeletePostLike(postLikes models.PostLikes) (int64, error)
	DeleteCommentLike(commentLikes models.CommentLikes) (int64, error)
}

type likesRepository struct {
	db *sqlx.DB
}

func NewLikesRepository(db *sqlx.DB) LikesRepository {
	return &likesRepository{db: db}
}

func (r *likesRepository) ReadPostsLikedByUser(userID int, order string) ([]models.PostResponse, error) {
	var resp []models.PostResponse
	query := fmt.Sprintf(`SELECT posts.id, posts.header, posts.body, posts.created_at,
			  posts.topic_id, users.username AS "author" FROM posts
			  LEFT JOIN likes ON posts.id = likes.post_id
			  LEFT JOIN users ON posts.user_id = users.id
			  WHERE likes.user_id = $1 AND likes.like_type = 1
			  ORDER BY created_at %s`, order)
	err := r.db.Select(&resp, query, userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}
	return resp, nil
}

func (r *likesRepository) ReadCommentsLikedByUser(userID int, order string) ([]models.CommentResponse, error) {
	var resp []models.CommentResponse
	query := fmt.Sprintf(`SELECT comments.id, comments.body, comments.created_at,
			  comments.post_id, users.username AS "author" FROM comments
			  LEFT JOIN likes ON comments.id = likes.comment_id
			  LEFT JOIN users ON comments.user_id = users.id
			  WHERE likes.user_id = $1 AND likes.like_type = 1
			  ORDER BY created_at %s`, order)
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
	insertQuery := `INSERT INTO likes (user_id, post_id, like_type) 
			  VALUES (:user_id, :post_id, :like_type)`
	// like_type is 1 or -1 depending on whether it is a like / dislike

	tx := r.db.MustBegin()
	defer tx.Rollback()

	_, err := r.db.NamedExec(insertQuery, postLikes)
	if err != nil {
		return fmt.Errorf("failed to execute query: %w", err)
	}

	updateQuery := `UPDATE posts
			 SET likes_count = likes_count + :like_type
			 WHERE id = :post_id`

	_, err = tx.NamedExec(updateQuery, postLikes)
	if err != nil {
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
	defer tx.Rollback()

	_, err := tx.NamedExec(query, commentLikes)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to execute query: %w", err)
	}

	updateQuery := `UPDATE comments
			 SET likes_count = likes_count + :like_type
			 WHERE id = :comment_id`

	_, err = tx.NamedExec(updateQuery, commentLikes)
	if err != nil {
		return fmt.Errorf("failed to execute query: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (r *likesRepository) DeletePostLike(postLikes models.PostLikes) (int64, error) {
	deleteQuery := "DELETE FROM likes WHERE user_id = :user_id AND post_id = :post_id"

	tx := r.db.MustBegin()
	defer tx.Rollback()

	result, err := tx.NamedExec(deleteQuery, postLikes)

	if err != nil {
		return 0, fmt.Errorf("failed to execute delete like post query: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return 0, fmt.Errorf("failed to get rows affected: %w", err)
	}

	updateQuery := `UPDATE posts
			 SET likes_count = likes_count - :like_type
			 WHERE id = :post_id`

	_, err = tx.NamedExec(updateQuery, postLikes)
	if err != nil {
		return 0, fmt.Errorf("failed to execute query: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return 0, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return rowsAffected, nil
}

func (r *likesRepository) DeleteCommentLike(commentLikes models.CommentLikes) (int64, error) {
	deleteQuery := "DELETE FROM likes WHERE user_id = :user_id AND comment_id = :comment_id"

	tx := r.db.MustBegin()
	defer tx.Rollback()

	result, err := tx.NamedExec(deleteQuery, commentLikes)

	if err != nil {
		return 0, fmt.Errorf("failed to execute delete like comment query: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return 0, fmt.Errorf("failed to get rows affected: %w", err)
	}

	updateQuery := `UPDATE comments
			 SET likes_count = likes_count - :like_type
			 WHERE id = :comment_id`

	_, err = tx.NamedExec(updateQuery, commentLikes)
	if err != nil {
		return 0, fmt.Errorf("failed to execute query: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return 0, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return rowsAffected, nil
}
