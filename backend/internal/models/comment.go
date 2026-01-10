package models

import "time"

type Comment struct {
	ID        int       `db:"id" json:"id"`
	Body      string    `db:"body" json:"body"`
	UserID    int       `db:"user_id" json:"userID"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
	PostID    int       `db:"post_id" json:"postID"`
}

type CommentRequest struct {
	ID     int    `db:"id" json:"id"`
	Body   string `db:"body" json:"body"`
	Author string `json:"author"`
	PostID int    `db:"post_id" json:"postID"`
}

type CommentResponse struct {
	ID         int       `db:"id" json:"id"`
	PostHeader string    `db:"header" json:"header"`
	Body       string    `db:"body" json:"body"`
	Author     string    `json:"author"`
	CreatedAt  time.Time `db:"created_at" json:"createdAt"`
	PostID     int       `db:"post_id" json:"postID"`
	TopicID    int       `db:"topic_id" json:"topicID"`
	LikesCount int       `db:"likes_count" json:"likesCount"`
}
