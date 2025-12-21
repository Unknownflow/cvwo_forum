package models

import "time"

type Post struct {
	ID        int       `db:"id" json:"id"`
	Header    string    `db:"header" json:"header"`
	Body      string    `db:"body" json:"body"`
	UserID    int       `db:"user_id" json:"user_id"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	TopicID   int       `db:"topic_id" json:"topic_id"`
}

type PostRequest struct {
	ID      int    `db:"id" json:"id"`
	Header  string `db:"header" json:"header"`
	Body    string `db:"body" json:"body"`
	Author  string `json:"author"`
	TopicID int    `db:"topic_id" json:"topic_id"`
}

type PostResponse struct {
	ID        int       `db:"id" json:"id"`
	Header    string    `db:"header" json:"header"`
	Body      string    `db:"body" json:"body"`
	Author    string    `json:"author"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	TopicID   int       `db:"topic_id" json:"topic_id"`
}
