package models

import "time"

type Comment struct {
	ID        int       `db:"id"`
	Body      string    `db:"body"`
	Author    string    `db:"author"`
	CreatedAt time.Time `db:"created_at"`
	PostID    int       `db:"topic_id"`
}
