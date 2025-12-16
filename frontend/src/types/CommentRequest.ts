import Comment from "./Comment";

type CommentRequest = Omit<Comment, "id" | "createdAt">;

export default CommentRequest;
