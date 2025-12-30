package models

import "time"

type CommentLikes struct {
	ID        int       `db:"id" json:"id"`
	CommentID int       `db:"comment_id" json:"comment_id"`
	UserID    int       `db:"user_id" json:"user_id"`
	LikeType  int       `db:"like_type" json:"like_type"`
	LikedAt   time.Time `db:"liked_at" json:"liked_at"`
}

type CommentLikesRequest struct {
	CommentID int `db:"comment_id" json:"comment_id"`
	LikeType  int `db:"like_type" json:"like_type"`
}

type CommentLikesResponse struct {
	ID        int       `db:"id" json:"id"`
	CommentID int       `db:"comment_id" json:"comment_id"`
	UserID    int       `db:"user_id" json:"user_id"`
	LikeType  int       `db:"like_type" json:"like_type"`
	LikedAt   time.Time `db:"liked_at" json:"liked_at"`
}
