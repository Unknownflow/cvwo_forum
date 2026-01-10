package models

type Topic struct {
	ID     int    `db:"id" json:"id"`
	Title  string `db:"title" json:"title"`
	UserID int    `db:"user_id" json:"userID"`
}

type TopicRequest struct {
	ID     int    `db:"id" json:"id"`
	Title  string `db:"title" json:"title"`
	Author string `json:"author"`
}

type TopicResponse struct {
	ID         int    `db:"id" json:"id"`
	Title      string `db:"title" json:"title"`
	Author     string `json:"author"`
	PostsCount int    `db:"posts_count" json:"postsCount"`
}
