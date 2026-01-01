package models

import "time"

type Comment struct {
	ID        int       `db:"id" json:"id"`
	Body      string    `db:"body" json:"body"`
	UserID    int       `db:"user_id" json:"user_id"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	PostID    int       `db:"post_id" json:"post_id"`
}

type CommentRequest struct {
	ID     int    `db:"id" json:"id"`
	Body   string `db:"body" json:"body"`
	Author string `json:"author"`
	PostID int    `db:"post_id" json:"post_id"`
}

type CommentResponse struct {
	ID         int       `db:"id" json:"id"`
	Body       string    `db:"body" json:"body"`
	Author     string    `json:"author"`
	CreatedAt  time.Time `db:"created_at" json:"created_at"`
	PostID     int       `db:"post_id" json:"post_id"`
	LikesCount int       `db:"likes_count" json:"likes_count"`
}
