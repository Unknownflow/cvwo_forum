import Comment from "./Comment";

type CommentRequest = Omit<Comment, "id" | "created_at" | "likes_count">;

export default CommentRequest;
