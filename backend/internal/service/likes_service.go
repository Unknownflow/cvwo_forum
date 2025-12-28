package service

import (
	"fmt"

	"github.com/cvwo_assignment/backend/internal/models"
	"github.com/cvwo_assignment/backend/internal/repository"
)

type LikesService interface {
	GetAllPostLikesByUser(userID int) ([]models.PostResponse, error)
	GetAllCommentLikesByUser(userID int) ([]models.CommentResponse, error)
	GetPostLike(userID int, postID int) (models.PostLikesResponse, error)
	GetCommentLike(userID int, commentID int) (models.CommentLikesResponse, error)
	CreatePostLike(userID int, postLikesReq models.PostLikesRequest) error
	CreateCommentLike(userID int, commentLikesReq models.CommentLikesRequest) error
	DeletePostLike(userID int, postID int) error
	DeleteCommentLike(userID int, commentID int) error
	GetPostLikesCount(postID int) (int64, error)
	GetCommentLikesCount(commentID int) (int64, error)
}

type likesService struct {
	likesRepo repository.LikesRepository
}

func NewLikesService(likesRepo repository.LikesRepository) LikesService {
	return &likesService{likesRepo: likesRepo}
}

func (s *likesService) GetAllPostLikesByUser(userID int) ([]models.PostResponse, error) {
	postLikes, err := s.likesRepo.ReadPostsLikedByUser(userID)

	if err != nil {
		return nil, fmt.Errorf("failed to retrieve post likes: %w", err)
	}

	return postLikes, nil
}

func (s *likesService) GetAllCommentLikesByUser(userID int) ([]models.CommentResponse, error) {
	postLikes, err := s.likesRepo.ReadCommentsLikedByUser(userID)

	if err != nil {
		return nil, fmt.Errorf("failed to retrieve post likes: %w", err)
	}

	return postLikes, nil
}

func (s *likesService) GetPostLike(userID int, postID int) (models.PostLikesResponse, error) {
	var postLikes models.PostLikes

	postLikes = models.PostLikes{
		PostID: postID,
		UserID: userID,
	}

	postLike, err := s.likesRepo.ReadByPostID(postLikes)

	if err != nil {
		return models.PostLikesResponse{}, fmt.Errorf("failed to retrieve post likes: %w", err)
	}

	return postLike, nil
}

func (s *likesService) GetCommentLike(userID int, commentID int) (models.CommentLikesResponse, error) {
	var commentLikes models.CommentLikes

	commentLikes = models.CommentLikes{
		CommentID: commentID,
		UserID:    userID,
	}

	commentLike, err := s.likesRepo.ReadByCommentID(commentLikes)

	if err != nil {
		return models.CommentLikesResponse{}, fmt.Errorf("failed to retrieve post likes: %w", err)
	}

	return commentLike, nil
}

func (s *likesService) CreatePostLike(userID int, postLikesReq models.PostLikesRequest) error {
	var postLike models.PostLikes

	postLike = models.PostLikes{
		PostID:   postLikesReq.PostID,
		UserID:   userID,
		LikeType: postLikesReq.LikeType,
	}

	if err := s.likesRepo.CreatePostLike(postLike); err != nil {
		return fmt.Errorf("could not create post likes in database: %w", err)
	}

	return nil
}

func (s *likesService) CreateCommentLike(userID int, commentLikesReq models.CommentLikesRequest) error {
	var commentLike models.CommentLikes

	commentLike = models.CommentLikes{
		CommentID: commentLikesReq.CommentID,
		UserID:    userID,
		LikeType:  commentLikesReq.LikeType,
	}

	if err := s.likesRepo.CreateCommentLike(commentLike); err != nil {
		return fmt.Errorf("could not create comment likes in database: %w", err)
	}

	return nil
}

func (s *likesService) DeletePostLike(userID int, postID int) error {
	var postLike models.PostLikes

	postLike = models.PostLikes{
		PostID: postID,
		UserID: userID,
	}

	rowsAffected, err := s.likesRepo.DeletePostLike(postLike)

	if err != nil {
		return fmt.Errorf("could not delete post likes from database: %w", err)
	}

	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

func (s *likesService) DeleteCommentLike(userID int, commentID int) error {
	var commentLike models.CommentLikes

	commentLike = models.CommentLikes{
		CommentID: commentID,
		UserID:    userID,
	}

	rowsAffected, err := s.likesRepo.DeleteCommentLike(commentLike)

	if err != nil {
		return fmt.Errorf("could not delete comment likes from database: %w", err)
	}

	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

func (s *likesService) GetPostLikesCount(postID int) (int64, error) {
	var postLikes models.PostLikes

	postLikes = models.PostLikes{PostID: postID}
	count, err := s.likesRepo.ReadPostLikesCount(postLikes)

	if err != nil {
		return 0, fmt.Errorf("failed to retrieve post likes count: %w", err)
	}

	return count, nil
}

func (s *likesService) GetCommentLikesCount(commentID int) (int64, error) {
	var commentLikes models.CommentLikes

	commentLikes = models.CommentLikes{CommentID: commentID}
	count, err := s.likesRepo.ReadCommentLikesCount(commentLikes)

	if err != nil {
		return 0, fmt.Errorf("failed to retrieve comment likes count: %w", err)
	}

	return count, nil
}
