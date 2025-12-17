import Comment from "./Comment";

type CommentRequest = Omit<Comment, "id" | "created_at">;

export default CommentRequest;
