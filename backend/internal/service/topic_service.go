package service

import (
	"fmt"

	"github.com/cvwo_assignment/backend/internal/models"
	"github.com/cvwo_assignment/backend/internal/repository"
)

type TopicService interface {
	GetAllTopics(key string, order string) ([]models.TopicResponse, error)
	GetTopicByID(id int) (models.TopicResponse, error)
	GetAllPostsByTopicID(id int, key string, order string, searchTerm string) ([]models.PostResponse, error)
	CreateTopic(userID int, topic models.TopicRequest) error
	UpdateTopic(topic models.TopicRequest) error
	DeleteTopic(id int) error
}

type topicService struct {
	topicRepo repository.TopicRepository
}

func NewTopicService(topicRepo repository.TopicRepository) TopicService {
	return &topicService{topicRepo: topicRepo}
}

func (s *topicService) GetAllTopics(key string, order string) ([]models.TopicResponse, error) {
	topics, err := s.topicRepo.ReadAll(key, order)

	if err != nil {
		return nil, fmt.Errorf("failed to retrieve topics: %w", err)
	}

	return topics, nil
}

func (s *topicService) GetTopicByID(id int) (models.TopicResponse, error) {
	topic, err := s.topicRepo.ReadByID(id)

	if err != nil {
		return models.TopicResponse{}, fmt.Errorf("failed to retrieve topic: %w", err)
	}

	return topic, nil
}

func (s *topicService) GetAllPostsByTopicID(id int, key string, order string, searchTerm string) ([]models.PostResponse, error) {
	searchTerm = "%" + searchTerm + "%" // find searchTerm which is similar
	posts, err := s.topicRepo.ReadPostsByTopicID(id, key, order, searchTerm)

	if err != nil {
		return nil, fmt.Errorf("failed to retrieve posts: %w", err)
	}

	return posts, nil
}

func (s *topicService) CreateTopic(userID int, topicReq models.TopicRequest) error {
	var topic models.Topic
	if err := validateTopic(&topicReq); err != nil {
		return err
	}

	topic = models.Topic{
		Title:  topicReq.Title,
		UserID: userID,
	}

	if err := s.topicRepo.Create(topic); err != nil {
		return fmt.Errorf("could not create topic in database: %w", err)
	}

	return nil
}

func (s *topicService) UpdateTopic(topicReq models.TopicRequest) error {
	var topic models.Topic
	if err := validateTopic(&topicReq); err != nil {
		return err
	}

	topic = models.Topic{
		ID:    topicReq.ID,
		Title: topicReq.Title,
	}

	rowsAffected, err := s.topicRepo.Update(topic)

	if err != nil {
		return fmt.Errorf("could not update topic in database: %w", err)
	}

	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

func (s *topicService) DeleteTopic(id int) error {
	rowsAffected, err := s.topicRepo.Delete(id)

	if err != nil {
		return fmt.Errorf("could not delete topic from database: %w", err)
	}

	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

func validateTopic(topic *models.TopicRequest) error {
	if topic.Title == "" {
		return fmt.Errorf("topic field is required")
	}
	if topic.Author == "" {
		return fmt.Errorf("author field is required")
	}
	return nil
}
