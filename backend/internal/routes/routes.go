package routes

import (
	"github.com/cvwo_assignment/backend/internal/handlers"
	"github.com/cvwo_assignment/backend/internal/repository"
	"github.com/cvwo_assignment/backend/internal/service"
	"github.com/go-chi/chi/v5"
	"github.com/jmoiron/sqlx"
)

func AuthRoutes(conn *sqlx.DB) func(r chi.Router) {
	authRepo := repository.NewAuthRepository(conn)
	authService := service.NewAuthService(authRepo)
	authHandler := handlers.AuthHandler{
		Service: authService,
	}
	return func(r chi.Router) {
		r.Post("/login", authHandler.HandleLogin)
		r.Post("/signup", authHandler.HandleSignUp)
		r.Post("/logout", authHandler.HandleLogout)
	}
}

func TopicsRoutes(conn *sqlx.DB) func(r chi.Router) {
	topicRepo := repository.NewTopicRepository(conn)
	topicService := service.NewTopicService(topicRepo)
	topicHandler := handlers.TopicHandler{
		Service: topicService,
	}
	return func(r chi.Router) {
		r.Route("/", func(r chi.Router) {
			r.Get("/", topicHandler.ReadTopics)
			r.Post("/", topicHandler.CreateTopic)
		})
		r.Route("/{id}", func(r chi.Router) {
			r.Get("/", topicHandler.ReadTopic)
			r.Get("/posts", topicHandler.ReadTopicPosts)
			r.Put("/", topicHandler.UpdateTopic)
			r.Delete("/", topicHandler.DeleteTopic)
		})
	}
}

func PostsRoutes(conn *sqlx.DB) func(r chi.Router) {
	postRepo := repository.NewPostRepository(conn)
	postService := service.NewPostService(postRepo)
	postHandler := handlers.PostHandler{
		Service: postService,
	}

	return func(r chi.Router) {
		r.Route("/", func(r chi.Router) {
			r.Post("/", postHandler.CreatePost)
			r.Get("/", postHandler.ReadPosts)
		})
		r.Route("/{id}", func(r chi.Router) {
			r.Get("/", postHandler.ReadPost)
			r.Get("/comments", postHandler.ReadPostComments)
			r.Put("/", postHandler.UpdatePost)
			r.Delete("/", postHandler.DeletePost)
		})
	}
}

func CommentRoutes(conn *sqlx.DB) func(r chi.Router) {
	commentRepo := repository.NewCommentRepository(conn)
	commentService := service.NewCommentService(commentRepo)
	commentHandler := handlers.CommentHandler{
		Service: commentService,
	}

	return func(r chi.Router) {
		r.Route("/", func(r chi.Router) {
			r.Get("/", commentHandler.ReadComments)
			r.Post("/", commentHandler.CreateComment)
		})
		r.Route("/{id}", func(r chi.Router) {
			r.Get("/", commentHandler.ReadComment)
			r.Put("/", commentHandler.UpdateComment)
			r.Delete("/", commentHandler.DeleteComment)
		})
	}
}

func PostLikesRoutes(conn *sqlx.DB) func(r chi.Router) {
	likesRepo := repository.NewLikesRepository(conn)
	likesService := service.NewLikesService(likesRepo)
	likesHandler := handlers.LikesHandler{
		Service: likesService,
	}

	return func(r chi.Router) {
		r.Route("/", func(r chi.Router) {
			r.Get("/", likesHandler.ReadPostLikes)
			r.Post("/", likesHandler.CreatePostLike)
		})
		r.Route("/{id}", func(r chi.Router) {
			r.Get("/", likesHandler.ReadPostLike)
			r.Delete("/", likesHandler.DeletePostLike)
		})
	}
}

func CommentLikesRoutes(conn *sqlx.DB) func(r chi.Router) {
	likesRepo := repository.NewLikesRepository(conn)
	likesService := service.NewLikesService(likesRepo)
	likesHandler := handlers.LikesHandler{
		Service: likesService,
	}

	return func(r chi.Router) {
		r.Route("/", func(r chi.Router) {
			r.Get("/", likesHandler.ReadCommentLikes)
			r.Post("/", likesHandler.CreateCommentLike)
		})
		r.Route("/{id}", func(r chi.Router) {
			r.Get("/", likesHandler.ReadCommentLike)
			r.Delete("/", likesHandler.DeleteCommentLike)
		})
	}
}
