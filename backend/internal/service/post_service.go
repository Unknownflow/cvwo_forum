package service

import (
	"errors"
	"fmt"

	"github.com/cvwo_assignment/backend/internal/models"
	"github.com/cvwo_assignment/backend/internal/repository"
)

type PostService interface {
	GetPostByID(id int) (models.PostResponse, error)
	GetAllCommentsByPostID(id int, key string, order string, searchTerm string) ([]models.CommentResponse, error)
	CreatePost(userID int, post models.PostRequest) error
	UpdatePost(post models.PostRequest) error
	DeletePost(id int) error
}

type postService struct {
	postRepo repository.PostRepository
}

var ErrNotFound = errors.New("record not found")

func NewPostService(postRepo repository.PostRepository) PostService {
	return &postService{postRepo: postRepo}
}

func (s *postService) GetPostByID(id int) (models.PostResponse, error) {
	post, err := s.postRepo.ReadByID(id)

	if err != nil {
		return models.PostResponse{}, fmt.Errorf("failed to retrieve post: %w", err)
	}

	return post, nil
}

func (s *postService) GetAllCommentsByPostID(id int, key string, order string, searchTerm string) ([]models.CommentResponse, error) {
	searchTerm = "%" + searchTerm + "%" // find searchTerm which is similar
	comments, err := s.postRepo.ReadCommentsByPostID(id, key, order, searchTerm)

	if err != nil {
		return nil, fmt.Errorf("failed to retrieve comments: %w", err)
	}

	return comments, nil
}

func (s *postService) CreatePost(userID int, postReq models.PostRequest) error {
	var post models.Post
	if err := validatePost(&postReq); err != nil {
		return err
	}

	post = models.Post{
		Header:  postReq.Header,
		Body:    postReq.Body,
		TopicID: postReq.TopicID,
		UserID:  userID,
	}

	if err := s.postRepo.Create(post); err != nil {
		return fmt.Errorf("could not create post in database: %w", err)
	}

	return nil
}

func (s *postService) UpdatePost(post models.PostRequest) error {
	if err := validatePost(&post); err != nil {
		return err
	}

	rowsAffected, err := s.postRepo.Update(post)

	if err != nil {
		return fmt.Errorf("could not update post in database: %w", err)
	}

	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

func (s *postService) DeletePost(id int) error {
	rowsAffected, err := s.postRepo.Delete(id)

	if err != nil {
		return fmt.Errorf("could not delete post from database: %w", err)
	}

	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

func validatePost(post *models.PostRequest) error {
	if post.Header == "" {
		return fmt.Errorf("header field is required")
	}
	if post.Body == "" {
		return fmt.Errorf("body field is required")
	}
	return nil
}
