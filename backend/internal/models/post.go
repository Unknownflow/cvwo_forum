package models

import "time"

type Post struct {
	ID        int       `db:"id" json:"id"`
	Header    string    `db:"header" json:"header"`
	Body      string    `db:"body" json:"body"`
	Author    string    `db:"author" json:"author"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	TopicID   int       `db:"topic_id" json:"topic_id"`
}

type PostRequest struct {
	Header  string `db:"header" json:"header"`
	Body    string `db:"body" json:"body"`
	Author  string `db:"author" json:"author"`
	TopicID int    `db:"topic_id" json:"topic_id"`
}
