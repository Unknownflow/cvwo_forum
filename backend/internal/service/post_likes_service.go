package service

import (
	"fmt"

	"github.com/cvwo_assignment/backend/internal/models"
	"github.com/cvwo_assignment/backend/internal/repository"
)

type PostLikesService interface {
	GetAllPostLikes() ([]models.PostLikesResponse, error)
	GetPostLike(userID int, postID int) (models.PostLikesResponse, error)
	CreatePostLike(userID int, postLikesReq models.PostLikesRequest) error
	DeletePostLike(userID int, postID int) error
}

type postLikesService struct {
	postLikesRepo repository.PostLikesRepository
}

func NewPostLikesService(postLikesRepo repository.PostLikesRepository) PostLikesService {
	return &postLikesService{postLikesRepo: postLikesRepo}
}

func (s *postLikesService) GetAllPostLikes() ([]models.PostLikesResponse, error) {
	comments, err := s.postLikesRepo.ReadAll()

	if err != nil {
		return nil, fmt.Errorf("failed to retrieve comments: %w", err)
	}

	return comments, nil
}

func (s *postLikesService) GetPostLike(userID int, postID int) (models.PostLikesResponse, error) {
	var postLikes models.PostLikes

	postLikes = models.PostLikes{
		PostID: postID,
		UserID: userID,
	}

	comment, err := s.postLikesRepo.ReadByID(postLikes)

	if err != nil {
		return models.PostLikesResponse{}, fmt.Errorf("failed to retrieve comment: %w", err)
	}

	return comment, nil
}

func (s *postLikesService) CreatePostLike(userID int, postLikesReq models.PostLikesRequest) error {
	var postLike models.PostLikes

	postLike = models.PostLikes{
		PostID:   postLikesReq.PostID,
		UserID:   userID,
		LikeType: postLikesReq.LikeType,
	}

	if err := s.postLikesRepo.Create(postLike); err != nil {
		return fmt.Errorf("could not create post likes in database: %w", err)
	}

	return nil
}

func (s *postLikesService) DeletePostLike(userID int, postID int) error {
	var postLike models.PostLikes

	postLike = models.PostLikes{
		PostID: postID,
		UserID: userID,
	}

	rowsAffected, err := s.postLikesRepo.Delete(postLike)

	if err != nil {
		return fmt.Errorf("could not delete comment from database: %w", err)
	}

	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}
