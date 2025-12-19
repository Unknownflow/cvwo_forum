package service

import (
	"fmt"

	"github.com/cvwo_assignment/backend/internal/models"
	"github.com/cvwo_assignment/backend/internal/repository"
)

type CommentService interface {
	GetAllComments() ([]models.Comment, error)
	GetCommentByID(id int) (models.Comment, error)
	CreateComment(comment models.Comment) error
	UpdateComment(comment models.Comment) error
	DeleteComment(id int) error
}

type commentService struct {
	repo repository.CommentRepository
}

func NewCommentService(repo repository.CommentRepository) CommentService {
	return &commentService{repo: repo}
}

func (s *commentService) GetAllComments() ([]models.Comment, error) {
	comments, err := s.repo.ReadAll()

	if err != nil {
		return nil, fmt.Errorf("failed to retrieve comments: %w", err)
	}

	return comments, nil
}

func (s *commentService) GetCommentByID(id int) (models.Comment, error) {
	comment, err := s.repo.ReadByID(id)

	if err != nil {
		return models.Comment{}, fmt.Errorf("failed to retrieve comment: %w", err)
	}

	return comment, nil
}

func (s *commentService) CreateComment(comment models.Comment) error {
	if err := validateComment(&comment); err != nil {
		return err
	}

	if err := s.repo.Create(comment); err != nil {
		return fmt.Errorf("could not create comment in database: %w", err)
	}

	return nil
}

func (s *commentService) UpdateComment(comment models.Comment) error {
	if err := validateComment(&comment); err != nil {
		return err
	}

	rowsAffected, err := s.repo.Update(comment)

	if err != nil {
		return fmt.Errorf("could not update comment in database: %w", err)
	}

	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

func (s *commentService) DeleteComment(id int) error {
	rowsAffected, err := s.repo.Delete(id)

	if err != nil {
		return fmt.Errorf("could not delete comment from database: %w", err)
	}

	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

func validateComment(comment *models.Comment) error {
	if comment.Body == "" {
		return fmt.Errorf("body field is required")
	}
	if comment.Author == "" {
		return fmt.Errorf("author field is required")
	}
	return nil
}
