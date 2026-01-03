package models

import "time"

type CommentLikes struct {
	ID        int       `db:"id" json:"id"`
	CommentID int       `db:"comment_id" json:"commentID"`
	UserID    int       `db:"user_id" json:"userID"`
	LikeType  int       `db:"like_type" json:"likeType"`
	LikedAt   time.Time `db:"liked_at" json:"likedAt"`
}

type CommentLikesRequest struct {
	CommentID int `db:"comment_id" json:"commentID"`
	LikeType  int `db:"like_type" json:"likeType"`
}

type CommentLikesResponse struct {
	ID        int       `db:"id" json:"id"`
	CommentID int       `db:"comment_id" json:"commentID"`
	UserID    int       `db:"user_id" json:"userID"`
	LikeType  int       `db:"like_type" json:"likeType"`
	LikedAt   time.Time `db:"liked_at" json:"likedAt"`
}
