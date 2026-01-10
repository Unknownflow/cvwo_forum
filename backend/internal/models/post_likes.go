package models

import "time"

type PostLikes struct {
	ID       int       `db:"id" json:"id"`
	PostID   int       `db:"post_id" json:"postID"`
	UserID   int       `db:"user_id" json:"userID"`
	LikeType int       `db:"like_type" json:"likeType"`
	LikedAt  time.Time `db:"liked_at" json:"likedAt"`
}

type PostLikesRequest struct {
	PostID   int `db:"post_id" json:"postID"`
	LikeType int `db:"like_type" json:"likeType"`
}

type PostLikesResponse struct {
	ID       int       `db:"id" json:"id"`
	PostID   int       `db:"post_id" json:"postID"`
	UserID   int       `db:"user_id" json:"userID"`
	LikeType int       `db:"like_type" json:"likeType"`
	LikedAt  time.Time `db:"liked_at" json:"likedAt"`
}
