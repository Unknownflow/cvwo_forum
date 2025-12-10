package models

import "time"

type Post struct {
	ID        int       `db:"id"`
	Body      string    `db:"body"`
	Author    string    `db:"author"`
	CreatedAt time.Time `db:"created_at"`
	TopicID   int       `db:"topic_id"`
}
