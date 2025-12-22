package models

import "time"

type PostLikes struct {
	ID       int       `db:"id" json:"id"`
	PostID   int       `db:"post_id" json:"post_id"`
	UserID   int       `db:"user_id" json:"user_id"`
	LikeType int       `db:"like_type" json:"like_type"`
	LikedAt  time.Time `db:"liked_at" json:"liked_at"`
}

type PostLikesRequest struct {
	PostID   int `db:"post_id" json:"post_id"`
	LikeType int `db:"like_type" json:"like_type"`
}

type PostLikesResponse struct {
	ID       int       `db:"id" json:"id"`
	PostID   int       `db:"post_id" json:"post_id"`
	UserID   int       `db:"user_id" json:"user_id"`
	LikeType int       `db:"like_type" json:"like_type"`
	LikedAt  time.Time `db:"liked_at" json:"liked_at"`
}
