package models

import "time"

type Comment struct {
	ID        int       `db:"id" json:"id"`
	Body      string    `db:"body" json:"body"`
	Author    string    `db:"author" json:"author"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	PostID    int       `db:"post_id" json:"post_id"`
}
