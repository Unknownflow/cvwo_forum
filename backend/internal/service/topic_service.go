package service

import (
	"fmt"

	"github.com/CVWO/sample-go-app/internal/models"
	"github.com/CVWO/sample-go-app/internal/repository"
)

type TopicService interface {
	GetAllTopics() ([]models.Topic, error)
	GetTopicByID(id int) (models.Topic, error)
	GetAllPostsByTopicID(id int) ([]models.Post, error)
	CreateTopic(topic models.Topic) error
	UpdateTopic(topic models.Topic) error
	DeleteTopic(id int) error
}

type topicService struct {
	repo repository.TopicRepository
}

func NewTopicService(repo repository.TopicRepository) TopicService {
	return &topicService{repo: repo}
}

func (s *topicService) GetAllTopics() ([]models.Topic, error) {
	topics, err := s.repo.ReadAll()

	if err != nil {
		return nil, fmt.Errorf("failed to retrieve topics: %w", err)
	}

	return topics, nil
}

func (s *topicService) GetTopicByID(id int) (models.Topic, error) {
	topic, err := s.repo.ReadByID(id)

	if err != nil {
		return models.Topic{}, fmt.Errorf("failed to retrieve topic: %w", err)
	}

	return topic, nil
}

func (s *topicService) GetAllPostsByTopicID(id int) ([]models.Post, error) {
	posts, err := s.repo.ReadPostsByTopicID(id)

	if err != nil {
		return nil, fmt.Errorf("failed to retrieve posts: %w", err)
	}

	return posts, nil
}

func (s *topicService) CreateTopic(topic models.Topic) error {
	if err := validateTopic(&topic); err != nil {
		return err
	}

	if err := s.repo.Create(topic); err != nil {
		return fmt.Errorf("could not create topic in database: %w", err)
	}

	return nil
}

func (s *topicService) UpdateTopic(topic models.Topic) error {
	if err := validateTopic(&topic); err != nil {
		return err
	}

	rowsAffected, err := s.repo.Update(topic)

	if err != nil {
		return fmt.Errorf("could not update topic in database: %w", err)
	}

	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

func (s *topicService) DeleteTopic(id int) error {
	rowsAffected, err := s.repo.Delete(id)

	if err != nil {
		return fmt.Errorf("could not delete topic from database: %w", err)
	}

	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

func validateTopic(topic *models.Topic) error {
	if topic.Title == "" {
		return fmt.Errorf("topic field is required")
	}
	return nil
}
