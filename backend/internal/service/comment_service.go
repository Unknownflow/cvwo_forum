package service

import (
	"fmt"

	"github.com/cvwo_assignment/backend/internal/models"
	"github.com/cvwo_assignment/backend/internal/repository"
)

type CommentService interface {
	GetCommentByID(id int) (models.CommentResponse, error)
	CreateComment(userID int, comment models.CommentRequest) error
	UpdateComment(comment models.CommentRequest) error
	DeleteComment(id int) error
}

type commentService struct {
	commentRepo repository.CommentRepository
}

func NewCommentService(commentRepo repository.CommentRepository) CommentService {
	return &commentService{commentRepo: commentRepo}
}

func (s *commentService) GetCommentByID(id int) (models.CommentResponse, error) {
	comment, err := s.commentRepo.ReadByID(id)

	if err != nil {
		return models.CommentResponse{}, fmt.Errorf("failed to retrieve comment: %w", err)
	}

	return comment, nil
}

func (s *commentService) CreateComment(userID int, commentReq models.CommentRequest) error {
	var comment models.Comment
	if err := validateComment(&commentReq); err != nil {
		return err
	}

	comment = models.Comment{
		Body:   commentReq.Body,
		PostID: commentReq.PostID,
		UserID: userID,
	}

	if err := s.commentRepo.Create(comment); err != nil {
		return fmt.Errorf("could not create comment in database: %w", err)
	}

	return nil
}

func (s *commentService) UpdateComment(commentReq models.CommentRequest) error {
	var comment models.Comment
	if err := validateComment(&commentReq); err != nil {
		return err
	}

	comment = models.Comment{
		ID:   commentReq.ID,
		Body: commentReq.Body,
	}

	rowsAffected, err := s.commentRepo.Update(comment)

	if err != nil {
		return fmt.Errorf("could not update comment in database: %w", err)
	}

	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

func (s *commentService) DeleteComment(id int) error {
	rowsAffected, err := s.commentRepo.Delete(id)

	if err != nil {
		return fmt.Errorf("could not delete comment from database: %w", err)
	}

	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

func validateComment(commentReq *models.CommentRequest) error {
	if commentReq.Body == "" {
		return fmt.Errorf("body field is required")
	}
	if commentReq.Author == "" {
		return fmt.Errorf("author field is required")
	}
	return nil
}
