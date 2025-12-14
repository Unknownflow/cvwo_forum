package service

import (
	"errors"
	"fmt"

	"github.com/CVWO/sample-go-app/internal/models"
	"github.com/CVWO/sample-go-app/internal/repository"
)

type PostService interface {
	GetAllPosts() ([]models.Post, error)
	GetPostByID(id int) (models.Post, error)
	GetAllCommentsByPostID(id int) ([]models.Comment, error)
	CreatePost(post models.PostRequest) error
	UpdatePost(post models.PostRequest) error
	DeletePost(id int) error
}

type postService struct {
	repo repository.PostRepository
}

var ErrNotFound = errors.New("record not found")

func NewPostService(repo repository.PostRepository) PostService {
	return &postService{repo: repo}
}

func (s *postService) GetAllPosts() ([]models.Post, error) {
	posts, err := s.repo.ReadAll()

	if err != nil {
		return nil, fmt.Errorf("failed to retrieve posts: %w", err)
	}

	return posts, nil
}

func (s *postService) GetPostByID(id int) (models.Post, error) {
	post, err := s.repo.ReadByID(id)

	if err != nil {
		return models.Post{}, fmt.Errorf("failed to retrieve post: %w", err)
	}

	return post, nil
}

func (s *postService) GetAllCommentsByPostID(id int) ([]models.Comment, error) {
	comments, err := s.repo.ReadCommentsByPostID(id)

	if err != nil {
		return nil, fmt.Errorf("failed to retrieve comments: %w", err)
	}

	return comments, nil
}

func (s *postService) CreatePost(post models.PostRequest) error {
	if err := validatePost(&post); err != nil {
		return err
	}

	if err := s.repo.Create(post); err != nil {
		return fmt.Errorf("could not create post in database: %w", err)
	}

	return nil
}

func (s *postService) UpdatePost(post models.PostRequest) error {
	if err := validatePost(&post); err != nil {
		return err
	}

	rowsAffected, err := s.repo.Update(post)

	if err != nil {
		return fmt.Errorf("could not update post in database: %w", err)
	}

	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

func (s *postService) DeletePost(id int) error {
	rowsAffected, err := s.repo.Delete(id)

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
	if post.Author == "" {
		return fmt.Errorf("author field is required")
	}
	return nil
}
