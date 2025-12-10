package models

type Topic struct {
	ID    int    `db:"id"`
	Title string `db:"title"`
}
