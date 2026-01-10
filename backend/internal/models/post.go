package models

import "time"

type Post struct {
	ID        int       `db:"id" json:"id"`
	Header    string    `db:"header" json:"header"`
	Body      string    `db:"body" json:"body"`
	UserID    int       `db:"user_id" json:"userID"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
	TopicID   int       `db:"topic_id" json:"topicID"`
}

type PostRequest struct {
	ID      int    `db:"id" json:"id"`
	Header  string `db:"header" json:"header"`
	Body    string `db:"body" json:"body"`
	TopicID int    `db:"topic_id" json:"topicID"`
}

type PostResponse struct {
	ID            int       `db:"id" json:"id"`
	Title         string    `db:"title" json:"title"`
	Header        string    `db:"header" json:"header"`
	Body          string    `db:"body" json:"body"`
	Author        string    `json:"author"`
	CreatedAt     time.Time `db:"created_at" json:"createdAt"`
	TopicID       int       `db:"topic_id" json:"topicID"`
	LikesCount    int       `db:"likes_count" json:"likesCount"`
	CommentsCount int       `db:"comments_count" json:"commentsCount"`
}
