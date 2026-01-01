package repository

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/cvwo_assignment/backend/internal/models"
	"github.com/jmoiron/sqlx"
)

type TopicRepository interface {
	ReadAll() ([]models.TopicResponse, error)
	ReadByID(id int) (models.TopicResponse, error)
	ReadPostsByTopicID(id int, order string) ([]models.PostResponse, error)
	Create(topic models.Topic) error
	Update(topic models.Topic) (rowsAffected int64, err error)
	Delete(id int) (rowsAffected int64, err error)
}

type topicRepository struct {
	db *sqlx.DB
}

func NewTopicRepository(db *sqlx.DB) TopicRepository {
	return &topicRepository{db: db}
}

func (r *topicRepository) ReadAll() ([]models.TopicResponse, error) {
	var topics []models.TopicResponse
	query := `SELECT topics.id, title, username AS "author" FROM topics
			  INNER JOIN users ON users.id = topics.user_id`
	err := r.db.Select(&topics, query)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}
	return topics, nil
}

func (r *topicRepository) ReadByID(id int) (models.TopicResponse, error) {
	var topic models.TopicResponse
	query := `SELECT topics.id, title, username AS "author" FROM topics 
			  INNER JOIN users ON users.id = topics.user_id
	          WHERE topics.id = $1`
	err := r.db.QueryRowx(query, id).StructScan(&topic)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return models.TopicResponse{}, sql.ErrNoRows
		}
		return models.TopicResponse{}, fmt.Errorf("failed to execute query: %w", err)
	}
	return topic, nil
}

func (r *topicRepository) ReadPostsByTopicID(id int, order string) ([]models.PostResponse, error) {
	var posts []models.PostResponse
	query := fmt.Sprintf(`SELECT posts.id, posts.header, posts.body, posts.created_at, 
			  posts.topic_id, posts.likes_count, username AS "author" FROM posts
			  INNER JOIN users ON users.id = posts.user_id
			  LEFT JOIN likes ON likes.post_id = posts.id
			  WHERE posts.topic_id = $1
			  GROUP BY posts.id, users.id
			  ORDER BY created_at %s`, order)
	err := r.db.Select(&posts, query, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}
	return posts, nil
}

func (r *topicRepository) Create(topic models.Topic) error {
	query := `INSERT INTO topics (title, user_id) 
			  VALUES (:title, :user_id)`

	tx := r.db.MustBegin()
	_, err := tx.NamedExec(query, topic)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to execute query: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (r *topicRepository) Update(topic models.Topic) (int64, error) {
	query := `UPDATE topics 
			  SET title = :title 
			  WHERE id = :id`

	tx := r.db.MustBegin()
	result, err := tx.NamedExec(query, topic)

	if err != nil {
		tx.Rollback()
		return 0, fmt.Errorf("failed to execute update topic query: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		tx.Rollback()
		return 0, fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		tx.Rollback()
		return 0, nil
	}

	if err := tx.Commit(); err != nil {
		return 0, fmt.Errorf("failed to commit update transaction: %w", err)
	}

	return rowsAffected, nil
}

func (r *topicRepository) Delete(id int) (int64, error) {
	query := "DELETE FROM topics WHERE id = $1"
	result, err := r.db.Exec(query, id)

	if err != nil {
		return 0, fmt.Errorf("failed to execute delete topic query: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return 0, fmt.Errorf("failed to get rows affected: %w", err)
	}

	return rowsAffected, nil
}
